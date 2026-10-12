import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  executeFallback,
  validateDayPlanShape,
  getProviderOrder,
} from "../src/services/ai/ai.service.js";

describe("AI Service Fallback Orchestrator", () => {
  const originalEnv = { ...process.env };
  const validDayPlanJSON = JSON.stringify({
    summary: "Balanced productive day plan",
    focusTasks: ["task-1", "task-2"],
    wellnessActivities: ["drink water", "short walk"],
    notes: "Keep up the momentum",
  });

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "dummy_gemini_key";
    process.env.MISTRALAI_API_KEY = "dummy_mistral_key";
    process.env.COHERE_API_KEY = "dummy_cohere_key";
    delete process.env.AI_PROVIDER_ORDER;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("fallback mode: when the first provider throws, the second is used and providerUsed reflects it", async () => {
    // Gemini (1st in default order) fails, Mistral (2nd) succeeds
    global.fetch = vi.fn().mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("googleapis.com")) {
        throw new Error("Gemini quota exceeded or server down");
      }
      if (urlStr.includes("mistral.ai")) {
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: validDayPlanJSON } }],
          }),
        };
      }
      throw new Error(`Unexpected call to ${urlStr}`);
    });

    const result = await executeFallback("Plan my day", 0.7, 1024, validateDayPlanShape);

    expect(result).toBeDefined();
    expect(result.providerUsed).toBe("mistral");
    expect(result.data.summary).toBe("Balanced productive day plan");
  });

  it("invalid JSON or a response that fails validateDayPlanShape is skipped and the next provider is tried", async () => {
    // Gemini returns invalid JSON, Mistral returns invalid shape, Cohere returns valid shape
    global.fetch = vi.fn().mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "Not even a JSON string" }] } }],
          }),
        };
      }
      if (urlStr.includes("mistral.ai")) {
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ invalidField: "missing summary and arrays" }),
                },
              },
            ],
          }),
        };
      }
      if (urlStr.includes("cohere.com")) {
        return {
          ok: true,
          json: async () => ({
            message: { content: [{ text: validDayPlanJSON }] },
          }),
        };
      }
      throw new Error(`Unexpected call to ${urlStr}`);
    });

    const result = await executeFallback("Plan my day", 0.7, 1024, validateDayPlanShape);

    expect(result).toBeDefined();
    expect(result.providerUsed).toBe("cohere");
    expect(result.data.summary).toBe("Balanced productive day plan");
  });

  it("when every provider fails, a controlled error is thrown", async () => {
    // All 3 providers fail
    global.fetch = vi.fn().mockImplementation(async () => {
      throw new Error("Provider connection refused");
    });

    await expect(
      executeFallback("Plan my day", 0.7, 1024, validateDayPlanShape)
    ).rejects.toThrow(/All AI fallback providers failed/i);
  });

  it("the provider order follows AI_PROVIDER_ORDER", async () => {
    process.env.AI_PROVIDER_ORDER = "cohere,mistral,gemini";
    const order = getProviderOrder();
    expect(order).toEqual(["cohere", "mistral", "gemini"]);

    const callOrder = [];
    global.fetch = vi.fn().mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("cohere.com")) {
        callOrder.push("cohere");
        throw new Error("Cohere simulated failure");
      }
      if (urlStr.includes("mistral.ai")) {
        callOrder.push("mistral");
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: validDayPlanJSON } }],
          }),
        };
      }
      if (urlStr.includes("googleapis.com")) {
        callOrder.push("gemini");
      }
      throw new Error("Unexpected call");
    });

    const result = await executeFallback("Plan my day", 0.7, 1024, validateDayPlanShape);

    expect(result.providerUsed).toBe("mistral");
    expect(callOrder).toEqual(["cohere", "mistral"]);
  });
});
