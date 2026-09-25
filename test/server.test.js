const request = require("supertest");
const app = require("../app");

describe("Health API", () => {
  test("GET /api/health should return 200", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("User API", () => {
  test("GET /api/users should return users", async () => {
    const response = await request(app)
      .get("/api/users");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/users should reject invalid name", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "A",
      });

    expect(response.statusCode).toBe(400);
  });

  test("POST /api/users should create valid user", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Mani",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });
});