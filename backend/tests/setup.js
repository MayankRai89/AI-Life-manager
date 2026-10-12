import { beforeAll, afterEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set required test environment variables (not committed secrets)
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "super_secure_test_jwt_secret_at_least_32_characters_long_12345";
process.env.JWT_EXPIRES_IN = "24h";
process.env.COOKIE_SECURE = "false";
process.env.GEMINI_API_KEY = "mock_gemini_test_key_for_offline_tests";
process.env.MISTRALAI_API_KEY = "mock_mistral_test_key_for_offline_tests";
process.env.COHERE_API_KEY = "mock_cohere_test_key_for_offline_tests";

let mongoServer;

beforeAll(async () => {
  // Ensure tests never make real external network requests
  if (!global.fetch || !vi.isMockFunction(global.fetch)) {
    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ summary: "Mocked", focusTasks: [], wellnessActivities: [] }) }] } }],
          choices: [{ message: { content: JSON.stringify({ summary: "Mocked", focusTasks: [], wellnessActivities: [] }) } }],
          message: { content: [{ text: JSON.stringify({ summary: "Mocked", focusTasks: [], wellnessActivities: [] }) }] },
        }),
      };
    });
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});


afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
