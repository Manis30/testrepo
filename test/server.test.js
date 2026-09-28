import request from 'supertest';
import app from '../app';
describe("Health API", () => {
  test("GET /api/health should return 200", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
