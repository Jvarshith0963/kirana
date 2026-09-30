const pool = require("../config/db");

async function getOrCreateWishlist(userId) {
  const existing = await pool.query("SELECT id FROM wishlists WHERE user_id = $1", [userId]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await pool.query(
    "INSERT INTO wishlists (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
    [userId]
  );
  return created.rows[0].id;
}

// ============================================================
// GET /api/wishlist
// ============================================================
const getWishlist = async (req, res) => {
  try {
    const wishlistId = await getOrCreateWishlist(req.user.id);

    const result = await pool.query(
      `
      SELECT
        wi.id AS wishlist_item_id,
        wi.product_id,
        wi.created_at AS added_at,
        p.name,
        p.price,
        p.image_url,
        p.is_available,
        p.stock_quantity,
        s.id AS store_id,
        s.store_name
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      WHERE wi.wishlist_id = $1
      ORDER BY wi.created_at DESC
      `,
      [wishlistId]
    );

    return res.status(200).json({
      success: true,
      data: { wishlist_id: wishlistId, items: result.rows },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// ============================================================
// POST /api/wishlist/items
// body: { product_id }
// ============================================================
const addWishlistItem = async (req, res) => {
  try {
    const { product_id } = req.body;

    const productResult = await pool.query("SELECT id FROM products WHERE id = $1", [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlistId = await getOrCreateWishlist(req.user.id);

    const result = await pool.query(
      `INSERT INTO wishlist_items (wishlist_id, product_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (wishlist_id, product_id) DO NOTHING
       RETURNING *`,
      [wishlistId, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: "Already in wishlist" });
    }

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Add wishlist item error:", error);
    return res.status(500).json({ success: false, message: "Failed to add to wishlist" });
  }
};

// ============================================================
// DELETE /api/wishlist/items/:id
// ============================================================
const removeWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const wishlistId = await getOrCreateWishlist(req.user.id);

    const result = await pool.query(
      "DELETE FROM wishlist_items WHERE id = $1 AND wishlist_id = $2 RETURNING id",
      [id, wishlistId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    return res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove wishlist item error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
};

// ============================================================
// POST /api/wishlist/items/:id/move-to-cart
// ============================================================
const moveToCart = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const wishlistId = await getOrCreateWishlist(req.user.id);

    const itemResult = await client.query(
      `SELECT wi.id, wi.product_id, p.stock_quantity, p.is_available
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       WHERE wi.id = $1 AND wi.wishlist_id = $2`,
      [id, wishlistId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    const item = itemResult.rows[0];

    if (!item.is_available || item.stock_quantity < 1) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    // Resolve the customer's cart (carts.customer_id -> customers.id -> users.id)
    const customerResult = await client.query(
      "SELECT id FROM customers WHERE user_id = $1",
      [req.user.id]
    );
    if (customerResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No customer profile found for this user" });
    }
    const customerId = customerResult.rows[0].id;

    let cartResult = await client.query("SELECT id FROM carts WHERE customer_id = $1", [customerId]);
    let cartId;
    if (cartResult.rows.length > 0) {
      cartId = cartResult.rows[0].id;
    } else {
      const createdCart = await client.query(
        "INSERT INTO carts (customer_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
        [customerId]
      );
      cartId = createdCart.rows[0].id;
    }

    await client.query("BEGIN");

    const existingCartItem = await client.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, item.product_id]
    );

    if (existingCartItem.rows.length > 0) {
      await client.query(
        "UPDATE cart_items SET quantity = quantity + 1, updated_at = NOW() WHERE id = $1",
        [existingCartItem.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
         VALUES ($1, $2, 1, NOW(), NOW())`,
        [cartId, item.product_id]
      );
    }

    await client.query("DELETE FROM wishlist_items WHERE id = $1", [item.id]);

    await client.query("COMMIT");

    return res.status(200).json({ success: true, message: "Moved to cart" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Move to cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to move item to cart" });
  } finally {
    client.release();
  }
};

module.exports = { getWishlist, addWishlistItem, removeWishlistItem, moveToCart };