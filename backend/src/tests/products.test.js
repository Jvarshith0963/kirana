const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");
const { ensureTestData, cleanupTestData } = require("./setup");

beforeAll(async () => {
  await ensureTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await pool.end();
});

describe("GET /api/products", () => {
  test("returns a paginated list with default params", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("page");
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("total_pages");
  });

  test("respects limit param", async () => {
    const res = await request(app).get("/api/products?limit=2");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  test("rejects invalid sort_by", async () => {
    const res = await request(app).get("/api/products?sort_by=hacked");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.field === "sort_by")).toBe(true);
  });

  test("rejects limit above 100", async () => {
    const res = await request(app).get("/api/products?limit=500");

    expect(res.status).toBe(400);
  });

  test("search matches by product name", async () => {
    const res = await request(app).get("/api/products?search=Basmati");

    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p.name.includes("Basmati"))).toBe(true);
  });

  test("search matches by category name", async () => {
    const res = await request(app).get("/api/products?search=__Test Category__");

    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p.sku === "TEST-SEARCH-001")).toBe(true);
  });

  test("search with no matches returns empty array, not an error", async () => {
    const res = await request(app).get("/api/products?search=zzz_no_such_product_zzz");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe("GET /api/products/:id", () => {
  test("returns 400 for non-numeric id", async () => {
    const res = await request(app).get("/api/products/abc");
    expect(res.status).toBe(400);
  });

  test("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/products/999999");
    expect(res.status).toBe(404);
  });

  test("returns a product for a valid id", async () => {
    const listRes = await request(app).get("/api/products?limit=1");
    const existingId = listRes.body.data[0]?.id;

    if (!existingId) return; // skip if DB has zero products

    const res = await request(app).get(`/api/products/${existingId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", existingId);
  });
});