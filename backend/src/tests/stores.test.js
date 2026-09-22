const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

afterAll(async () => {
  await pool.end();
});

describe("GET /api/stores/nearby", () => {
  test("returns 400 when no location params given", async () => {
    const res = await request(app).get("/api/stores/nearby");
    expect(res.status).toBe(400);
  });

  test("returns 400 for invalid lat", async () => {
    const res = await request(app).get("/api/stores/nearby?lat=999&lng=78.48");
    expect(res.status).toBe(400);
  });

  test("returns stores for a valid pincode", async () => {
    const res = await request(app).get("/api/stores/nearby?pincode=500001");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("radius search returns stores sorted by distance", async () => {
    const res = await request(app).get(
      "/api/stores/nearby?lat=17.3850&lng=78.4867&radius_km=20"
    );
    expect(res.status).toBe(200);

    const distances = res.body.data.map((s) => parseFloat(s.distance_km));
    const sorted = [...distances].sort((a, b) => a - b);
    expect(distances).toEqual(sorted);
  });
});

describe("GET /api/stores/:id", () => {
  test("returns 400 for non-numeric id", async () => {
    const res = await request(app).get("/api/stores/abc");
    expect(res.status).toBe(400);
  });

  test("returns 404 for non-existent store", async () => {
    const res = await request(app).get("/api/stores/999999");
    expect(res.status).toBe(404);
  });

  test("returns store profile with products array", async () => {
    const res = await request(app).get("/api/stores/1");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("store");
    expect(res.body.data).toHaveProperty("products");
    expect(res.body.data).toHaveProperty("pagination");
  });

  test("nearby route is not shadowed by :id route", async () => {
    const res = await request(app).get("/api/stores/nearby?pincode=500001");
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("message", "Invalid store ID");
  });
});