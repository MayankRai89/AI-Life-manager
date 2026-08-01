const { LlamaCloud } = require("@llamaindex/llama-cloud");
const fs = require("fs");

/**
 * Parse document (PDF / DOCX) using LlamaCloud agentic parsing tier
 * @param {string} filePath - Absolute path to temporary uploaded file
 * @returns {Promise<string>} Parsed markdown string
 */
async function parseDocumentWithLlamaCloud(filePath) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  if (!apiKey) {
    console.warn(
      "[LlamaParse Service] LLAMA_CLOUD_API_KEY is not set in environment. Falling back to basic text extraction.",
    );
    // Basic text fallback read if API key is not present
    const rawContent = fs.readFileSync(filePath, "utf-8");
    return rawContent.replace(/[^\x20-\x7E\n]/g, ""); // basic clean string
  }

  try {
    const client = new LlamaCloud({ apiKey });

    // Step 1: Upload document to LlamaCloud
    const file = await client.files.create({
      file: fs.createReadStream(filePath),
      purpose: "parse",
    });

    // Step 2: Parse document with agentic tier
    const result = await client.parsing.parse({
      file_id: file.id,
      tier: "agentic",
      version: "latest",
      expand: ["markdown"],
    });

    if (result && result.markdown && Array.isArray(result.markdown.pages)) {
      const fullMarkdown = result.markdown.pages
        .map((p) => p.markdown || "")
        .join("\n\n--- Page Break ---\n\n");
      return fullMarkdown;
    }

    return (
      result?.markdown?.text ||
      result?.text ||
      "No markdown text returned from LlamaCloud."
    );
  } catch (error) {
    console.error("[LlamaParse Service] Error during LlamaCloud parsing:", error.message);
    throw new Error(`LlamaCloud Parsing failed: ${error.message}`);
  }
}

/**
 * Extract structured health metrics from parsed medical report markdown
 * @param {string} markdownText - Markdown text from LlamaCloud
 * @returns {Object} { metrics: Array, summary: string }
 */
function extractMetricsFromMarkdown(markdownText) {
  const metrics = [];
  const text = markdownText || "";

  // Common medical report indicators and regex patterns
  const Patterns = [
    {
      name: "Hemoglobin",
      regex: /(?:Hemoglobin|Hb|HGB)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(g\/dL|g\/L)?/i,
      unit: "g/dL",
      normalMin: 12.0,
      normalMax: 17.5,
    },
    {
      name: "Fasting Blood Glucose",
      regex: /(?:Fasting Blood Sugar|Fasting Glucose|FBS|Glucose, Fasting)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(mg\/dL|mmol\/L)?/i,
      unit: "mg/dL",
      normalMin: 70,
      normalMax: 99,
    },
    {
      name: "Total Cholesterol",
      regex: /(?:Total Cholesterol|Cholesterol, Total|Cholesterol)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(mg\/dL)?/i,
      unit: "mg/dL",
      normalMin: 125,
      normalMax: 200,
    },
    {
      name: "HDL Cholesterol",
      regex: /(?:HDL|HDL Cholesterol)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(mg\/dL)?/i,
      unit: "mg/dL",
      normalMin: 40,
      normalMax: 100,
    },
    {
      name: "LDL Cholesterol",
      regex: /(?:LDL|LDL Cholesterol)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(mg\/dL)?/i,
      unit: "mg/dL",
      normalMin: 0,
      normalMax: 100,
    },
    {
      name: "Triglycerides",
      regex: /(?:Triglycerides|TRIG)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(mg\/dL)?/i,
      unit: "mg/dL",
      normalMin: 0,
      normalMax: 150,
    },
    {
      name: "Platelet Count",
      regex: /(?:Platelet Count|Platelets|PLT)\s*[:|-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*(x10\^3\/\u00B5L|thousand\/uL)?/i,
      unit: "x10^3/uL",
      normalMin: 150,
      normalMax: 450,
    },
    {
      name: "WBC Count",
      regex: /(?:WBC Count|WBC|White Blood Cell)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(x10\^3\/\u00B5L|K\/uL)?/i,
      unit: "x10^3/uL",
      normalMin: 4.5,
      normalMax: 11.0,
    },
    {
      name: "TSH (Thyroid)",
      regex: /(?:TSH|Thyroid Stimulating Hormone)\s*[:|-]?\s*(\d+(?:\.\d+)?)\s*(\u00B5IU\/mL|mIU\/L)?/i,
      unit: "uIU/mL",
      normalMin: 0.4,
      normalMax: 4.0,
    },
    {
      name: "Systolic Blood Pressure",
      regex: /(?:Systolic|BP Systolic|Blood Pressure)\s*[:|-]?\s*(\d{2,3})\s*(?:\/|\s*mmHg)/i,
      unit: "mmHg",
      normalMin: 90,
      normalMax: 120,
    },
  ];

  for (const pattern of Patterns) {
    const match = text.match(pattern.regex);
    if (match && match[1]) {
      const valNum = parseFloat(match[1].replace(",", ""));
      let status = "Normal";

      if (valNum < pattern.normalMin) status = "Low";
      else if (valNum > pattern.normalMax) status = "High";

      metrics.push({
        name: pattern.name,
        value: String(valNum),
        unit: match[2] || pattern.unit,
        referenceRange: `${pattern.normalMin} - ${pattern.normalMax}`,
        status,
      });
    }
  }

  // Fallback: search for generic markdown table rows if any key-value pairs exist
  const tableRowRegex = /\|\s*([^|]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*([^|]*)\s*\|/g;
  let tableMatch;
  while ((tableMatch = tableRowRegex.exec(text)) !== null) {
    const rawName = tableMatch[1].trim();
    const rawValue = tableMatch[2].trim();
    const rawUnit = tableMatch[3].trim();

    if (
      rawName &&
      !metrics.some((m) => m.name.toLowerCase() === rawName.toLowerCase()) &&
      !["test", "name", "parameter"].includes(rawName.toLowerCase())
    ) {
      metrics.push({
        name: rawName,
        value: rawValue,
        unit: rawUnit || "units",
        referenceRange: "N/A",
        status: "Normal",
      });
    }
  }

  const summary =
    metrics.length > 0
      ? `Extracted ${metrics.length} health indicators from the report: ${metrics.map((m) => `${m.name}: ${m.value} ${m.unit} (${m.status})`).join(", ")}.`
      : "Medical report parsed successfully. No standard laboratory metrics detected in text.";

  return { metrics, summary };
}

module.exports = {
  parseDocumentWithLlamaCloud,
  extractMetricsFromMarkdown,
};
