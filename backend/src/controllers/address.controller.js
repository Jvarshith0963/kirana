const pool = require("../config/db");

async function getCustomerId(userId) {
  const result = await pool.query("SELECT id FROM customers WHERE user_id = $1", [userId]);
  if (result.rows.length === 0) {
    const err = new Error("No customer profile found for this user");
    err.statusCode = 400;
    throw err;
  }
  return result.rows[0].id;
}

// GET /api/addresses
const listAddresses = async (req, res) => {
  try {
    const customerId = await getCustomerId(req.user.id);
    const result = await pool.query(
      "SELECT * FROM addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC",
      [customerId]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("List addresses error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

// POST /api/addresses
const createAddress = async (req, res) => {
  const client = await pool.connect();
  try {
    const customerId = await getCustomerId(req.user.id);
    const {
      address_type = "home",
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      landmark,
      is_default = false,
    } = req.body;

    await client.query("BEGIN");

    // If this is set as default, unset any existing default first
    if (is_default) {
      await client.query(
        "UPDATE addresses SET is_default = FALSE WHERE customer_id = $1",
        [customerId]
      );
    }

    const result = await client.query(
      `INSERT INTO addresses
       (customer_id, address_type, address_line1, address_line2, city, state, pincode, landmark, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [customerId, address_type, address_line1, address_line2 || null, city, state, pincode, landmark || null, is_default]
    );

    await client.query("COMMIT");

    return res.status(201).json({ success: true, message: "Address added", data: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Create address error:", error);
    return res.status(500).json({ success: false, message: "Failed to create address" });
  } finally {
    client.release();
  }
};

// PATCH /api/addresses/:id
const updateAddress = async (req, res) => {
  const client = await pool.connect();
  try {
    const customerId = await getCustomerId(req.user.id);
    const { id } = req.params;

    const existing = await client.query(
      "SELECT id FROM addresses WHERE id = $1 AND customer_id = $2",
      [id, customerId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const {
      address_type,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      landmark,
      is_default,
    } = req.body;

    await client.query("BEGIN");

    if (is_default === true) {
      await client.query(
        "UPDATE addresses SET is_default = FALSE WHERE customer_id = $1",
        [customerId]
      );
    }

    const result = await client.query(
      `UPDATE addresses SET
        address_type = COALESCE($1, address_type),
        address_line1 = COALESCE($2, address_line1),
        address_line2 = COALESCE($3, address_line2),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pincode = COALESCE($6, pincode),
        landmark = COALESCE($7, landmark),
        is_default = COALESCE($8, is_default),
        updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [address_type, address_line1, address_line2, city, state, pincode, landmark, is_default, id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ success: true, message: "Address updated", data: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Update address error:", error);
    return res.status(500).json({ success: false, message: "Failed to update address" });
  } finally {
    client.release();
  }
};

// DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const customerId = await getCustomerId(req.user.id);
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND customer_id = $2 RETURNING id",
      [id, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Delete address error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};

// PATCH /api/addresses/:id/default
const setDefaultAddress = async (req, res) => {
  const client = await pool.connect();
  try {
    const customerId = await getCustomerId(req.user.id);
    const { id } = req.params;

    const existing = await client.query(
      "SELECT id FROM addresses WHERE id = $1 AND customer_id = $2",
      [id, customerId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await client.query("BEGIN");
    await client.query("UPDATE addresses SET is_default = FALSE WHERE customer_id = $1", [customerId]);
    const result = await client.query(
      "UPDATE addresses SET is_default = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    await client.query("COMMIT");

    return res.status(200).json({ success: true, message: "Default address updated", data: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Set default address error:", error);
    return res.status(500).json({ success: false, message: "Failed to set default address" });
  } finally {
    client.release();
  }
};

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress };