const fs = require("fs");
const MedicalReport = require("../models/MedicalReport.model");
const User = require("../models/user.model");
const {
  parseDocumentWithLlamaCloud,
  extractMetricsFromMarkdown,
} = require("../services/llamaParse.service");

/**
 * Handle document upload and parsing via LlamaCloud
 */
async function uploadAndParseReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file uploaded. Please upload a PDF or DOCX file.",
      });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    // 1. Parse document via LlamaCloud agentic tier
    const markdown = await parseDocumentWithLlamaCloud(filePath);

    // 2. Extract structured health metrics & summary
    const { metrics, summary } = extractMetricsFromMarkdown(markdown);

    // 3. Save MedicalReport entry to database
    const newReport = await MedicalReport.create({
      userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      parsedMarkdown: markdown,
      metrics,
      summary,
    });

    // 4. Update User's healthProfile latestMetrics
    const user = await User.findById(userId);
    if (user) {
      if (!user.healthProfile) {
        user.healthProfile = { latestMetrics: new Map() };
      }
      if (!user.healthProfile.latestMetrics) {
        user.healthProfile.latestMetrics = new Map();
      }

      for (const metric of metrics) {
        user.healthProfile.latestMetrics.set(metric.name, {
          value: metric.value,
          unit: metric.unit,
          status: metric.status,
          updatedAt: new Date(),
        });
      }

      await user.save();
    }

    // 5. Cleanup temporary file from server disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json({
      success: true,
      message: "Medical report parsed successfully via LlamaCloud",
      data: {
        report: newReport,
        healthProfile: user ? user.healthProfile : null,
      },
    });
  } catch (err) {
    // Ensure temp file is cleaned up even if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        // ignore cleanup error
      }
    }
    next(err);
  }
}

/**
 * Get all medical reports for the logged in user
 */
async function getUserReports(req, res, next) {
  try {
    const userId = req.user.id;
    const reports = await MedicalReport.find({ userId })
      .sort({ createdAt: -1 })
      .select("-parsedMarkdown");

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user's aggregated health profile
 */
async function getHealthProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("healthProfile name email");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user.healthProfile || { latestMetrics: {} },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadAndParseReport,
  getUserReports,
  getHealthProfile,
};
