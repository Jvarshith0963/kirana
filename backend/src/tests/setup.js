const pool = require("../config/db");

let testStoreId;
let testCategoryId;

async function ensureTestData() {
  const storeResult = await pool.query("SELECT id FROM stores LIMIT 1");
  if (storeResult.rows.length === 0) {
    throw new Error("No store found — register a vendor before running tests");
  }
  testStoreId = storeResult.rows[0].id;

  // Category: check first, insert if missing
  const existingCat = await pool.query(
    "SELECT id FROM categories WHERE name = '__Test Category__'"
  );

  if (existingCat.rows.length > 0) {
    testCategoryId = existingCat.rows[0].id;
  } else {
    const catResult = await pool.query(
      `INSERT INTO categories (name, description, is_active)
       VALUES ('__Test Category__', 'created by test suite', TRUE)
       RETURNING id`
    );
    testCategoryId = catResult.rows[0].id;
  }

  // Product: check first, insert if missing
  const existingProduct = await pool.query(
    "SELECT id FROM products WHERE sku = 'TEST-SEARCH-001'"
  );

  if (existingProduct.rows.length === 0) {
    await pool.query(
      `INSERT INTO products (store_id, category_id, name, description, sku, price, stock_quantity, unit, is_available, created_at, updated_at)
       VALUES ($1, $2, 'Test Basmati Rice', 'seeded for tests', 'TEST-SEARCH-001', 199, 20, 'kg', TRUE, NOW(), NOW())`,
      [testStoreId, testCategoryId]
    );
  }
}

async function cleanupTestData() {
  await pool.query("DELETE FROM products WHERE sku = 'TEST-SEARCH-001'");
  await pool.query("DELETE FROM categories WHERE name = '__Test Category__'");
}

module.exports = { ensureTestData, cleanupTestData, getTestStoreId: () => testStoreId };