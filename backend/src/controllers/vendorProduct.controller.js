const pool = require("../config/db");
const { getVendorStoreIds } = require("./vendorDashboard.controller");
const { getStockStatus, LOW_STOCK_THRESHOLD } = require("../utils/stockStatus");
const { createNotification } = require("../utils/notifications");

// Confirms a product belongs to one of this vendor's stores
async function assertProductOwnership(productId, storeIds) {
  const result = await pool.query(
    "SELECT id, store_id FROM products WHERE id = $1",
    [productId]
  );
  if (result.rows.length === 0) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  if (!storeIds.includes(result.rows[0].store_id)) {
    const err = new Error("You do not own this product");
    err.statusCode = 403;
    throw err;
  }
  return result.rows[0];
}

// GET /api/vendor/products
const listVendorProducts = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const result = await pool.query(
      `SELECT * FROM products WHERE store_id = ANY($1)
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [storeIds, limitNumber, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) AS total FROM products WHERE store_id = ANY($1)",
      [storeIds]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page: pageNumber, limit: limitNumber, total: parseInt(countResult.rows[0].total, 10) },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("List vendor products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// POST /api/vendor/products
const createVendorProduct = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const {
      category_id, brand_id, name, description, sku,
      price, stock_quantity, unit, discount_percent = 0,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
       (store_id, category_id, brand_id, name, description, sku, price, stock_quantity, unit, discount_percent, is_available, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, NOW(), NOW())
       RETURNING *`,
      [storeIds[0], category_id || null, brand_id || null, name, description || null, sku, price, stock_quantity, unit, discount_percent]
    );

    return res.status(201).json({ success: true, message: "Product created", data: result.rows[0] });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A product with this SKU already exists" });
    }
    console.error("Create vendor product error:", error);
    return res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

// PATCH /api/vendor/products/:id
const updateVendorProduct = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { id } = req.params;
    await assertProductOwnership(id, storeIds);

    const { name, description, price, unit, category_id, brand_id, discount_percent } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        unit = COALESCE($4, unit),
        category_id = COALESCE($5, category_id),
        brand_id = COALESCE($6, brand_id),
        discount_percent = COALESCE($7, discount_percent),
        updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, description, price, unit, category_id, brand_id, discount_percent, id]
    );

    return res.status(200).json({ success: true, message: "Product updated", data: result.rows[0] });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Update vendor product error:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// DELETE /api/vendor/products/:id
const deleteVendorProduct = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { id } = req.params;
    await assertProductOwnership(id, storeIds);

    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Delete vendor product error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// PATCH /api/vendor/products/:id/stock
const updateStock = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { id } = req.params;
    const { stock_quantity } = req.body;
    await assertProductOwnership(id, storeIds);

    const result = await pool.query(
      "UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [stock_quantity, id]
    );

    const product = result.rows[0];
    const status = getStockStatus(product.stock_quantity);

    if (status === "low_stock" || status === "out_of_stock") {
      await createNotification({
        userId: req.user.id,
        type: status === "out_of_stock" ? "out_of_stock_alert" : "low_stock_alert",
        title: status === "out_of_stock" ? "Product out of stock" : "Low stock alert",
        message: `${product.name} is ${status === "out_of_stock" ? "out of stock" : `running low (${product.stock_quantity} left)`}.`,
      });
    }

    return res.status(200).json({ success: true, message: "Stock updated", data: { ...product, stock_status: status } });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Update stock error:", error);
    return res.status(500).json({ success: false, message: "Failed to update stock" });
  }
};

// PATCH /api/vendor/products/:id/toggle
const toggleAvailability = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { id } = req.params;
    await assertProductOwnership(id, storeIds);

    const result = await pool.query(
      "UPDATE products SET is_available = NOT is_available, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({ success: true, message: "Availability toggled", data: result.rows[0] });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Toggle availability error:", error);
    return res.status(500).json({ success: false, message: "Failed to toggle availability" });
  }
};

module.exports = {
  listVendorProducts, createVendorProduct, updateVendorProduct,
  deleteVendorProduct, updateStock, toggleAvailability,
};