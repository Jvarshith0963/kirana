const pool = require("../config/db");

// Get or create the user's cart row
// Get or create the user's cart row.
// carts.customer_id references customers.id, not users.id directly,
// so we resolve the customer row for this user first.
async function getOrCreateCart(userId) {
  const customerResult = await pool.query(
    "SELECT id FROM customers WHERE user_id = $1",
    [userId]
  );

  if (customerResult.rows.length === 0) {
    const err = new Error("No customer profile found for this user");
    err.statusCode = 400;
    throw err;
  }

  const customerId = customerResult.rows[0].id;

  const existing = await pool.query("SELECT id FROM carts WHERE customer_id = $1", [customerId]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await pool.query(
    "INSERT INTO carts (customer_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
    [customerId]
  );
  return created.rows[0].id;
}

// ============================================================
// GET /api/cart
// Returns cart contents grouped by vendor/store
// ============================================================
const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    const result = await pool.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price,
        p.image_url,
        p.stock_quantity,
        p.is_available,
        s.id AS store_id,
        s.store_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      WHERE ci.cart_id = $1
      ORDER BY s.id, ci.id
      `,
      [cartId]
    );

    // Group flat rows into { store_id: { store_name, items: [...] } }
    const groupedByStore = {};

    for (const row of result.rows) {
      if (!groupedByStore[row.store_id]) {
        groupedByStore[row.store_id] = {
          store_id: row.store_id,
          store_name: row.store_name,
          items: [],
          subtotal: 0,
        };
      }

      const lineTotal = parseFloat(row.price) * row.quantity;

      groupedByStore[row.store_id].items.push({
        cart_item_id: row.cart_item_id,
        product_id: row.product_id,
        name: row.product_name,
        price: parseFloat(row.price),
        quantity: row.quantity,
        image_url: row.image_url,
        is_available: row.is_available,
        stock_quantity: row.stock_quantity,
        line_total: lineTotal,
      });

      groupedByStore[row.store_id].subtotal += lineTotal;
    }

    const stores = Object.values(groupedByStore);
    const cartTotal = stores.reduce((sum, s) => sum + s.subtotal, 0);

    return res.status(200).json({
      success: true,
      data: {
        cart_id: cartId,
        stores,
        cart_subtotal: cartTotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

// ============================================================
// POST /api/cart/items
// body: { product_id, quantity }
// ============================================================
const addCartItem = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id || !/^\d+$/.test(String(product_id))) {
      return res.status(400).json({ success: false, message: "Valid product_id is required" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "quantity must be a positive integer" });
    }

    const productResult = await pool.query(
      "SELECT id, stock_quantity, is_available FROM products WHERE id = $1",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = productResult.rows[0];

    if (!product.is_available) {
      return res.status(400).json({ success: false, message: "Product is not available" });
    }
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_quantity} in stock`,
      });
    }

    const cartId = await getOrCreateCart(req.user.id);

    const existingItem = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, product_id]
    );

    let result;
    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock_quantity} in stock (you already have ${existingItem.rows[0].quantity} in cart)`,
        });
      }

      result = await pool.query(
        `UPDATE cart_items SET quantity = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [cartId, product_id, quantity]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Add cart item error:", error);
    return res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
};

// ============================================================
// PATCH /api/cart/items/:id
// body: { quantity }
// ============================================================
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "quantity must be a positive integer" });
    }

    const cartId = await getOrCreateCart(req.user.id);

    // Confirm this cart item belongs to this user's cart before touching it
    const itemResult = await pool.query(
      `SELECT ci.id, ci.product_id, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.cart_id = $2`,
      [id, cartId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    const item = itemResult.rows[0];

    if (item.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock_quantity} in stock`,
      });
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [quantity, id]
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ success: false, message: "Failed to update cart item" });
  }
};

// ============================================================
// DELETE /api/cart/items/:id
// ============================================================
const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartId = await getOrCreateCart(req.user.id);

    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id",
      [id, cartId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    return res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove cart item" });
  }
};

module.exports = { getCart, addCartItem, updateCartItem, removeCartItem };