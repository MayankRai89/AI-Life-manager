import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/model/user.model.js";

describe("Auth Endpoints", () => {
  it("register with a valid payload returns 201 and sets an httpOnly cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "validuser",
        name: "Valid User",
        email: "valid@example.com",
        password: "ValidPassword123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe("valid@example.com");

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie.toLowerCase()).toContain("httponly");
  });

  it("password shorter than 8 characters is rejected with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "shortuser",
        name: "Short User",
        email: "short@example.com",
        password: "1234567", // 7 chars (< 8)
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("login with wrong password returns 401, and the response never includes the password hash", async () => {
    // First register a valid user
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "loginuser",
        name: "Login User",
        email: "login@example.com",
        password: "CorrectPassword123!",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "WrongPassword123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");

    const responseText = JSON.stringify(res.body);
    expect(responseText).not.toMatch(/\$2[aby]\$\d+\$/); // bcrypt hash pattern
    expect(res.body.password).toBeUndefined();
    expect(res.body.data?.user?.password).toBeUndefined();
  });

  it("sending { role: 'admin' } to register or PUT /api/auth/profile does not change the user's role", async () => {
    // 1. Attempt role elevation via register
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        username: "roleuser",
        name: "Role User",
        email: "role@example.com",
        password: "ValidPassword123!",
        role: "admin",
      });

    expect(regRes.status).toBe(201);
    const userInDb = await User.findOne({ email: "role@example.com" });
    expect(userInDb).toBeTruthy();
    expect(userInDb.role).toBe("user");

    // Extract cookie for authenticated requests
    const cookies = regRes.headers["set-cookie"];
    const tokenCookie = cookies.find((c) => c.startsWith("token="));

    // 2. Attempt role elevation via PUT /api/auth/profile
    const updateRes = await request(app)
      .put("/api/auth/profile")
      .set("Cookie", tokenCookie)
      .send({
        role: "admin",
      });

    expect(updateRes.status).toBe(200);
    const updatedUserInDb = await User.findOne({ email: "role@example.com" });
    expect(updatedUserInDb.role).toBe("user");
  });

  it("GET /api/auth/me without a cookie returns 401", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });
});
