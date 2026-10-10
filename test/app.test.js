
import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";

describe("Backend health", () => {
  test("GET /health/live returns 200", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /api/health reports database status", async () => {
    const response = await request(app).get("/api/health");

    expect([200, 503]).toContain(response.status);
    expect(["connected", "disconnected"]).toContain(
      response.body.database
    );
  });
});
