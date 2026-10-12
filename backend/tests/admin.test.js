import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/model/user.model.js";
import DayPlan from "../src/model/dayPlan.model.js";
import MoodCheckIn from "../src/model/moodCheckIns.model.js";
import { generateToken } from "../src/services/auth.service.js";

describe("Admin Endpoints", () => {
  let normalToken;
  let adminToken;
  let adminUser;
  let normalUser;

  beforeEach(async () => {
    normalUser = await User.create({
      username: "normaluser",
      name: "Normal User",
      email: "normal@example.com",
      password: "Password123!",
      role: "user",
    });
    normalToken = generateToken(normalUser._id);

    adminUser = await User.create({
      username: "adminuser",
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });
    adminToken = generateToken(adminUser._id);
  });

  it("logged-out request to /api/admin/stats returns 401", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("normal user returns 403", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", `token=${normalToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  it("admin user returns 200", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeDefined();
    expect(res.body.data.totalPlans).toBeDefined();
  });

  it("admin responses contain none of: email, name, userId, note, derivedContext", async () => {
    // Populate sample mood checkin with sensitive note
    const moodDoc = await MoodCheckIn.create({
      userId: normalUser._id,
      mood: "calm",
      moodScore: 8,
      note: "Top secret private medical note text",
    });

    // Populate day plan with rating and user feedback
    await DayPlan.create({
      userId: normalUser._id,
      moodCheckInId: moodDoc._id,
      date: new Date().toISOString().split("T")[0],
      providerUsed: "gemini",
      promptVersion: "v1",
      userFeedback: {
        rating: "up",
        ratedAt: new Date(),
        feedbackText: "Great personalized schedule",
      },
      summary: "Calm and focused day plan",
      derivedContext: "Private medical derived context data",
    });

    // Test /api/admin/stats
    const statsRes = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", `token=${adminToken}`);

    expect(statsRes.status).toBe(200);
    const statsStr = JSON.stringify(statsRes.body);

    expect(statsStr).not.toContain("normal@example.com");
    expect(statsStr).not.toContain("Normal User");
    expect(statsStr).not.toContain(String(normalUser._id));
    expect(statsStr).not.toContain("Top secret private medical note text");
    expect(statsStr).not.toContain("Private medical derived context data");

    // Also test /api/admin/feedback
    const feedbackRes = await request(app)
      .get("/api/admin/feedback")
      .set("Cookie", `token=${adminToken}`);

    expect(feedbackRes.status).toBe(200);
    const feedbackStr = JSON.stringify(feedbackRes.body);

    expect(feedbackStr).not.toContain("normal@example.com");
    expect(feedbackStr).not.toContain("Normal User");
    expect(feedbackStr).not.toContain(String(normalUser._id));
    expect(feedbackStr).not.toContain("Top secret private medical note text");
    expect(feedbackStr).not.toContain("Private medical derived context data");

    // Explicitly verify forbidden keys do not exist in feedback item objects
    const items = feedbackRes.body.data?.items || [];
    for (const item of items) {
      expect(item.email).toBeUndefined();
      expect(item.name).toBeUndefined();
      expect(item.userId).toBeUndefined();
      expect(item.note).toBeUndefined();
      expect(item.derivedContext).toBeUndefined();
    }
  });
});
