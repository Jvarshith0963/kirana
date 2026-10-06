require("dotenv").config();
const pool = require("../config/db");

const categories = [
  { name: "Grocery & Staples", description: "Rice, atta, dals, oils, spices" },
  { name: "Fruits & Vegetables", description: "Fresh produce" },
  { name: "Dairy & Bakery", description: "Milk, paneer, bread, eggs" },
  { name: "Snacks & Beverages", description: "Chips, biscuits, soft drinks, juices" },
  { name: "Personal Care", description: "Soap, shampoo, toothpaste, hygiene" },
  { name: "Household Essentials", description: "Detergents, cleaning supplies" },
];

const productsByCategory = {
  "Grocery & Staples": [
    { name: "Basmati Rice", sku: "GRC-001", price: 180, stock: 50, unit: "kg" },
    { name: "Toor Dal", sku: "GRC-002", price: 140, stock: 40, unit: "kg" },
    { name: "Wheat Atta", sku: "GRC-003", price: 55, stock: 60, unit: "kg" },
    { name: "Sunflower Oil", sku: "GRC-004", price: 165, stock: 30, unit: "litre" },
    { name: "Turmeric Powder", sku: "GRC-005", price: 45, stock: 70, unit: "packet" },
  ],
  "Fruits & Vegetables": [
    { name: "Onion", sku: "VEG-001", price: 35, stock: 100, unit: "kg" },
    { name: "Tomato", sku: "VEG-002", price: 40, stock: 80, unit: "kg" },
    { name: "Potato", sku: "VEG-003", price: 28, stock: 100, unit: "kg" },
    { name: "Banana", sku: "FRT-001", price: 50, stock: 60, unit: "dozen" },
    { name: "Apple", sku: "FRT-002", price: 180, stock: 40, unit: "kg" },
  ],
  "Dairy & Bakery": [
    { name: "Toned Milk", sku: "DRY-001", price: 28, stock: 90, unit: "litre" },
    { name: "Paneer", sku: "DRY-002", price: 90, stock: 25, unit: "piece" },
    { name: "Bread", sku: "BKY-001", price: 40, stock: 35, unit: "piece" },
    { name: "Eggs (6 pack)", sku: "DRY-003", price: 42, stock: 50, unit: "piece" },
    { name: "Curd", sku: "DRY-004", price: 30, stock: 45, unit: "piece" },
  ],
  "Snacks & Beverages": [
    { name: "Potato Chips", sku: "SNK-001", price: 20, stock: 100, unit: "packet" },
    { name: "Digestive Biscuits", sku: "SNK-002", price: 35, stock: 80, unit: "packet" },
    { name: "Cola 750ml", sku: "BEV-001", price: 40, stock: 60, unit: "piece" },
    { name: "Mango Juice", sku: "BEV-002", price: 25, stock: 70, unit: "piece" },
    { name: "Namkeen Mix", sku: "SNK-003", price: 30, stock: 55, unit: "packet" },
  ],
  "Personal Care": [
    { name: "Bath Soap", sku: "PCR-001", price: 32, stock: 90, unit: "piece" },
    { name: "Shampoo Sachet", sku: "PCR-002", price: 2, stock: 200, unit: "piece" },
    { name: "Toothpaste", sku: "PCR-003", price: 55, stock: 60, unit: "piece" },
    { name: "Hand Sanitizer", sku: "PCR-004", price: 60, stock: 40, unit: "piece" },
    { name: "Toothbrush", sku: "PCR-005", price: 25, stock: 70, unit: "piece" },
  ],
  "Household Essentials": [
    { name: "Detergent Powder", sku: "HHD-001", price: 110, stock: 45, unit: "kg" },
    { name: "Dishwash Bar", sku: "HHD-002", price: 15, stock: 100, unit: "piece" },
    { name: "Phenyl", sku: "HHD-003", price: 65, stock: 35, unit: "litre" },
    { name: "Garbage Bags", sku: "HHD-004", price: 50, stock: 60, unit: "packet" },
    { name: "Room Freshener", sku: "HHD-005", price: 95, stock: 30, unit: "piece" },
  ],
};

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Need at least one store to attach products to
    const storeResult = await client.query("SELECT id FROM stores LIMIT 1");
    if (storeResult.rows.length === 0) {
      throw new Error("No store found. Register a vendor first, so a store row exists.");
    }
    const storeId = storeResult.rows[0].id;

    let totalProducts = 0;

    for (const cat of categories) {
      // Insert category if it doesn't already exist
      const existing = await client.query(
        "SELECT id FROM categories WHERE name = $1",
        [cat.name]
      );

      let categoryId;
      if (existing.rows.length > 0) {
        categoryId = existing.rows[0].id;
        console.log(`Category exists: ${cat.name}`);
      } else {
        const inserted = await client.query(
          `INSERT INTO categories (name, description, is_active)
           VALUES ($1, $2, TRUE)
           RETURNING id`,
          [cat.name, cat.description]
        );
        categoryId = inserted.rows[0].id;
        console.log(`Created category: ${cat.name}`);
      }

      const items = productsByCategory[cat.name] || [];

      for (const item of items) {
        const dupCheck = await client.query(
          "SELECT id FROM products WHERE sku = $1",
          [item.sku]
        );

        if (dupCheck.rows.length > 0) {
          console.log(`  Skipping duplicate SKU: ${item.sku}`);
          continue;
        }

        await client.query(
          `INSERT INTO products
           (store_id, category_id, name, description, sku, price, stock_quantity, unit, is_available, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())`,
          [
            storeId,
            categoryId,
            item.name,
            `${item.name} - good quality`,
            item.sku,
            item.price,
            item.stock,
            item.unit,
          ]
        );

        totalProducts++;
        console.log(`  Inserted: ${item.name}`);
      }
    }

    await client.query("COMMIT");
    console.log(`\nDone. ${categories.length} categories, ${totalProducts} products inserted.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();