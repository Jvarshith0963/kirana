const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

let customerToken;
let customerId;
let addressId;
let productIdStoreA;
let productIdStoreB;

beforeAll(async () => {
  // Register a fresh test customer for isolation
  const email = `checkout_test_${Date.now()}@kirana.local`;
  await request(app).post("/api/auth/register").send({
    name: "Checkout Test Customer",
    email,
    password: "TestPass123",
    role: "customer",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "TestPass123",
  });
  customerToken = loginRes.body.accessToken;
  customerId = loginRes.body.user.id;

  // Create a test address
  const addrRes = await request(app)
    .post("/api/addresses")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      address_line1: "Test Checkout St",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      is_default: true,
    });
  addressId = addrRes.body.data.id;

  // Find two products from two different stores
  const productsRes = await request(app).get("/api/products?limit=100");
  const products = productsRes.body.data;
  const storeIds = [...new Set(products.map((p) => p.store_id))];

  if (storeIds.length < 2) {
    throw new Error("Test requires products from at least 2 different stores in the DB");
  }

  productIdStoreA = products.find((p) => p.store_id === storeIds[0]).id;
  productIdStoreB = products.find((p) => p.store_id === storeIds[1]).id;
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/orders/checkout", () => {
  test("rejects checkout with empty cart", async () => {
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ address_id: addressId });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  test("rejects checkout with missing address_id", async () => {
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("splits a multi-vendor cart into separate orders", async () => {
    // Add items from two different stores
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ product_id: productIdStoreA, quantity: 1 });

    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ product_id: productIdStoreB, quantity: 1 });

    const checkoutRes = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ address_id: addressId, delivery_type: "standard" });

    expect(checkoutRes.status).toBe(201);
    expect(Array.isArray(checkoutRes.body.data)).toBe(true);
    expect(checkoutRes.body.data.length).toBe(2); // one order per vendor

    const storeIdsInOrders = checkoutRes.body.data.map((o) => o.store_id);
    expect(new Set(storeIdsInOrders).size).toBe(2); // confirms they're actually different stores

    for (const order of checkoutRes.body.data) {
      expect(order.status).toBe("pending");
      expect(order).toHaveProperty("total_amount");
      expect(parseFloat(order.total_amount)).toBeGreaterThan(0);
    }
  });

  test("cart is empty after successful checkout", async () => {
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(cartRes.body.data.stores.length).toBe(0);
  });

  test("rejects invalid delivery_type", async () => {
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ product_id: productIdStoreA, quantity: 1 });

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ address_id: addressId, delivery_type: "rocket" });

    expect(res.status).toBe(400);
  });
});