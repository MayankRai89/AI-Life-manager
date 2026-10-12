import { describe, it, expect, afterEach } from "vitest";
import mongoose from "mongoose";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

describe("Global Error Handler Middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  const createMockRes = () => {
    const res = {
      statusCode: null,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return res;
  };

  it("in production mode the JSON error response has no 'stack' field", () => {
    process.env.NODE_ENV = "production";

    const err = new Error("Something failed internally");
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.jsonData).toBeDefined();
    expect(res.jsonData.stack).toBeUndefined();
    expect(Object.keys(res.jsonData)).not.toContain("stack");
  });

  it("a Mongoose ValidationError produces HTTP 400", () => {
    const validationErr = new mongoose.Error.ValidationError();
    validationErr.errors = {
      title: new mongoose.Error.ValidatorError({
        message: "Title is required",
        path: "title",
      }),
    };

    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(validationErr, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.statusCode).toBe(400);
    expect(res.jsonData.status).toBe("fail");
    expect(res.jsonData.message).toContain("Title is required");
  });
});
