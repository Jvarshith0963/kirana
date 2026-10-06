const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// ============================================================
// POST /api/products/:id/image
// Upload product image to Cloudinary and save URL in database
// ============================================================
const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required (form field name must be "image")',
      });
    }

    // Find product and its owner
    const productResult = await pool.query(
      `
      SELECT p.id, p.name, p.image_url, v.user_id AS owner_user_id
      FROM products p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];

    // Only the owning vendor or an admin may change the image
    const isAdmin = req.user.role === "admin";
    const isOwner = String(product.owner_user_id) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not own this product",
      });
    }

    console.log(`Uploading image for product ${id} (${req.file.size} bytes)...`);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "kirana/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(502).json({
        success: false,
        message: "Image host did not return a URL",
      });
    }

    const result = await pool.query(
      `
      UPDATE products
      SET image_url = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, image_url, updated_at
      `,
      [uploadResult.secure_url, id]
    );

    console.log("Upload success:", uploadResult.secure_url);

    return res.status(200).json({
      success: true,
      message: "Product image uploaded successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload product image",
    });
  }
};

// ============================================================
// GET /api/products
// List, search, filter, sort, and paginate products
// ============================================================
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category_id,
      brand_id,
      min_price,
      max_price,
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const values = [];

    const conditions = ["p.is_available = TRUE"];

    // --------------------------------------------------------
    // Search by product name or SKU
    // --------------------------------------------------------
    // Search by product name, SKU, brand, or category
if (search) {
  values.push(`%${search}%`);
  conditions.push(
    `(p.name ILIKE $${values.length}
      OR p.sku ILIKE $${values.length}
      OR b.name ILIKE $${values.length}
      OR c.name ILIKE $${values.length})`
  );
}

    // --------------------------------------------------------
    // Filter by category
    // --------------------------------------------------------
    if (category_id) {
      values.push(category_id);

      conditions.push(`p.category_id = $${values.length}`);
    }

    // --------------------------------------------------------
    // Filter by brand
    // --------------------------------------------------------
    if (brand_id) {
      values.push(brand_id);

      conditions.push(`p.brand_id = $${values.length}`);
    }

    // --------------------------------------------------------
    // Minimum price
    // --------------------------------------------------------
    if (min_price) {
      values.push(min_price);

      conditions.push(`p.price >= $${values.length}`);
    }

    // --------------------------------------------------------
    // Maximum price
    // --------------------------------------------------------
    if (max_price) {
      values.push(max_price);

      conditions.push(`p.price <= $${values.length}`);
    }

    // --------------------------------------------------------
    // Allowed sorting fields
    // --------------------------------------------------------
    const allowedSortFields = {
      name: "p.name",
      price: "p.price",
      created_at: "p.created_at",
      updated_at: "p.updated_at",
    };

    const sortColumn =
      allowedSortFields[sort_by] || allowedSortFields.created_at;

    const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------
    const offset = (pageNumber - 1) * limitNumber;

    values.push(limitNumber);
    const limitIndex = values.length;

    values.push(offset);
    const offsetIndex = values.length;

    // --------------------------------------------------------
    // Main products query
    // --------------------------------------------------------
    const query = `
      SELECT
        p.id,
        p.store_id,
        p.category_id,
        p.brand_id,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.stock_quantity,
        p.unit,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at,

        c.name AS category_name,
        b.name AS brand_name

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN brands b
        ON p.brand_id = b.id

      WHERE ${conditions.join(" AND ")}

      ORDER BY ${sortColumn} ${sortOrder}

      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const result = await pool.query(query, values);

    // --------------------------------------------------------
    // Count total matching products
    // --------------------------------------------------------
    const countValues = values.slice(0, values.length - 2);

    const countQuery = `
  SELECT COUNT(*) AS total
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE ${conditions.join(" AND ")}
`;

    const countResult = await pool.query(countQuery, countValues);

    const total = parseInt(countResult.rows[0].total, 10);

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------
    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        total_pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ============================================================
// GET /api/products/:id
// Get a single product by ID
// ============================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate product ID
    // --------------------------------------------------------
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // --------------------------------------------------------
    // Get product
    // --------------------------------------------------------
    const query = `
      SELECT
        p.id,
        p.store_id,
        p.category_id,
        p.brand_id,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.stock_quantity,
        p.unit,
        p.image_url,
        p.is_available,
        p.created_at,
        p.updated_at,

        c.name AS category_name,
        b.name AS brand_name,

        i.quantity AS inventory_quantity,
        i.reserved_quantity,
        i.low_stock_threshold

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN brands b
        ON p.brand_id = b.id

      LEFT JOIN inventory i
        ON p.id = i.product_id

      WHERE p.id = $1
        AND p.is_available = TRUE
    `;

    const result = await pool.query(query, [id]);

    // --------------------------------------------------------
    // Product not found
    // --------------------------------------------------------
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------
    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================
module.exports = {
  getProducts,
  getProductById,
  uploadProductImage,
};