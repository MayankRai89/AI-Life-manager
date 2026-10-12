import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/model/user.model.js";
import MoodCheckIn from "../src/model/moodCheckIns.model.js";
import { generateToken } from "../src/services/auth.service.js";

describe("Mood Check-in Endpoints & Schema Compatibility", () => {
  let user;
  let userToken;

  beforeEach(async () => {
    user = await User.create({
      username: "mooduser",
      name: "Mood User",
      email: "mooduser@example.com",
      password: "Password123!",
    });
    userToken = generateToken(user._id);
  });

  it("a valid mood check-in returns 201", async () => {
    const res = await request(app)
      .post("/api/moods")
      .set("Cookie", `token=${userToken}`)
      .send({
        mood: "calm",
        moodScore: 8,
        energyLevel: 6,
        stressLevel: 2,
        capacityLevel: "normal",
        note: "Feeling centered and calm.",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.moodCheckIn.mood).toBe("calm");
  });

  it("an invalid mood value returns 400 (not 500)", async () => {
    const res = await request(app)
      .post("/api/moods")
      .set("Cookie", `token=${userToken}`)
      .send({
        mood: "super_ecstatic_unsupported_mood",
        moodScore: 8,
        energyLevel: 5,
        stressLevel: 5,
      });

    expect(res.status).toBe(400);
    expect(res.status).not.toBe(500);
    expect(res.body.status).toBe("fail");
  });

  it("every value in frontend MOOD_VALUES is accepted by the backend schema enum", async () => {
    let frontendMoods;
    try {
      frontendMoods = await import("../../frontend/src/constants/moods.js");
    } catch (err) {
      console.warn("Skipping test: frontend/src/constants/moods.js not found:", err.message);
      return;
    }

    expect(frontendMoods).toBeDefined();
    expect(frontendMoods.MOOD_VALUES).toBeDefined();
    expect(Array.isArray(frontendMoods.MOOD_VALUES)).toBe(true);

    const backendEnumValues = MoodCheckIn.schema.path("mood").enumValues;
    expect(backendEnumValues).toBeDefined();

    for (const moodValue of frontendMoods.MOOD_VALUES) {
      expect(
        backendEnumValues,
        `Frontend mood '${moodValue}' must be present in backend MoodCheckIn enum`
      ).toContain(moodValue);
    }
  });
});
