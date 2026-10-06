const pool = require("../config/db");

// GET /api/categories
// List all active categories
const getCategories = async (req, res) => {
  try {
    const query = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.is_active,
        c.created_at,
        COUNT(p.id)::INTEGER AS product_count

      FROM categories c

      LEFT JOIN products p
        ON p.category_id = c.id
        AND p.is_available = TRUE

      WHERE c.is_active = TRUE

      GROUP BY
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.is_active,
        c.created_at

      ORDER BY c.name ASC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

module.exports = {
  getCategories,
};