const pool = require("../config/db");

// ============================================================
// GET /api/stores/nearby
// Find stores near a location, via pincode OR lat/long + radius
// ============================================================
const getNearbyStores = async (req, res) => {
  try {
    const { pincode, lat, lng, radius_km = 5 } = req.query;

    if (!pincode && !(lat && lng)) {
      return res.status(400).json({
        success: false,
        message: "Provide either 'pincode' or both 'lat' and 'lng'",
      });
    }

    let query;
    let values;

    // ========================================================
    // Search by pincode
    // ========================================================
    if (pincode) {
      query = `
        SELECT
          id,
          vendor_id,
          store_name,
          description,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_active,
          created_at
        FROM stores
        WHERE pincode = $1
          AND is_active = TRUE
        ORDER BY store_name ASC
      `;

      values = [pincode];
    }

    // ========================================================
    // Search by latitude, longitude and radius
    // ========================================================
    else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      const radiusKm = Math.min(
        Math.max(parseFloat(radius_km) || 5, 0.1),
        50
      );

      // Validate coordinates
      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        return res.status(400).json({
          success: false,
          message: "lat and lng must be valid numbers",
        });
      }

      // Validate latitude range
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }

      // Validate longitude range
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }

      // ======================================================
      // Haversine distance calculation
      //
      // 6371 = Earth's radius in kilometers
      //
      // Distance is calculated inside the subquery.
      // The outer query filters and sorts using distance_km.
      // ======================================================
      query = `
        SELECT *
        FROM (
          SELECT
            id,
            vendor_id,
            store_name,
            description,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            is_active,
            created_at,
            (
              6371 * acos(
                LEAST(
                  1,
                  GREATEST(
                    -1,
                    cos(radians($1)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) *
                    sin(radians(latitude))
                  )
                )
              )
            ) AS distance_km
          FROM stores
          WHERE is_active = TRUE
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
        ) AS stores_with_distance
        WHERE distance_km <= $3
        ORDER BY distance_km ASC
      `;

      values = [latitude, longitude, radiusKm];
    }

    // ========================================================
    // Execute query
    // ========================================================
    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get nearby stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby stores",
    });
  }
};

// ============================================================
// GET /api/stores/:id
// Public store profile — store info + available products
//
// Pagination:
// GET /api/stores/:id?page=1&limit=10
// ============================================================
const getStoreProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // Validate store ID
    // ========================================================
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    // ========================================================
    // Get store information
    // ========================================================
    const storeResult = await pool.query(
      `
      SELECT
        id,
        vendor_id,
        store_name,
        description,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_active,
        created_at
      FROM stores
      WHERE id = $1
        AND is_active = TRUE
      `,
      [id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const store = storeResult.rows[0];

    // ========================================================
    // Pagination parameters
    // ========================================================
    const {
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    // ========================================================
    // Get products with pagination
    // ========================================================
    const productsResult = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.stock_quantity,
        p.unit,
        p.image_url,
        p.created_at,
        c.name AS category_name,
        b.name AS brand_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN brands b
        ON p.brand_id = b.id
      WHERE p.store_id = $1
        AND p.is_available = TRUE
      ORDER BY p.created_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [id, limitNumber, offset]
    );

    // ========================================================
    // Get total number of products
    // ========================================================
    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE store_id = $1
        AND is_available = TRUE
      `,
      [id]
    );

    const total = parseInt(
      countResult.rows[0].total,
      10
    );

    const totalPages = Math.ceil(
      total / limitNumber
    );

    // ========================================================
    // Final response
    // ========================================================
    return res.status(200).json({
      success: true,
      data: {
        store,
        products: productsResult.rows,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          total_pages: totalPages,
          has_next_page: pageNumber < totalPages,
          has_previous_page: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get store profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store profile",
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================
module.exports = {
  getNearbyStores,
  getStoreProfile,
};