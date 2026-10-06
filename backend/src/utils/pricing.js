const pool = require("../config/db");

const DELIVERY_FEE = 30; // flat fee per vendor order, adjust as needed
const FREE_DELIVERY_THRESHOLD = 500;

const DELIVERY_OPTIONS = {
  standard: { label: "Standard (2-3 days)", baseCharge: 30, freeAboveThreshold: 500 },
  express: { label: "Express (next day)", baseCharge: 60, freeAboveThreshold: null },
  same_day: { label: "Same day", baseCharge: 100, freeAboveThreshold: null },
  pickup: { label: "Store pickup", baseCharge: 0, freeAboveThreshold: null },
};

function calculateDeliveryCharge(deliveryType, subtotal) {
  const option = DELIVERY_OPTIONS[deliveryType];
  if (!option) {
    const err = new Error("Invalid delivery_type");
    err.statusCode = 400;
    throw err;
  }

  if (option.freeAboveThreshold && subtotal >= option.freeAboveThreshold) {
    return 0;
  }

  return option.baseCharge;
}

module.exports.DELIVERY_OPTIONS = DELIVERY_OPTIONS;
module.exports.calculateDeliveryCharge = calculateDeliveryCharge;

// Recompute a subtotal from real product prices in the DB — never from client input.
async function calculateSubtotal(items) {
  // items: [{ product_id, quantity }]
  let subtotal = 0;
  const lineItems = [];

  for (const item of items) {
    const result = await pool.query(
      "SELECT id, name, price, is_available, stock_quantity FROM products WHERE id = $1",
      [item.product_id]
    );

    if (result.rows.length === 0) {
      const err = new Error(`Product ${item.product_id} not found`);
      err.statusCode = 404;
      throw err;
    }

    const product = result.rows[0];

    if (!product.is_available) {
      const err = new Error(`${product.name} is no longer available`);
      err.statusCode = 400;
      throw err;
    }

    if (product.stock_quantity < item.quantity) {
      const err = new Error(`Only ${product.stock_quantity} of ${product.name} in stock`);
      err.statusCode = 400;
      throw err;
    }

    const price = parseFloat(product.price);
    const lineTotal = price * item.quantity;

    subtotal += lineTotal;
    lineItems.push({
      product_id: product.id,
      name: product.name,
      unit_price: price,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  return { subtotal, lineItems };
}

function calculateDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

// Validate a coupon against a subtotal and return the discount amount.
// Never trust a discount value passed from the client.
async function calculateDiscount(couponCode, subtotal) {
  if (!couponCode) return { discount: 0, coupon: null };

  const result = await pool.query(
    "SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE",
    [couponCode.toUpperCase()]
  );

  if (result.rows.length === 0) {
    const err = new Error("Invalid or inactive coupon code");
    err.statusCode = 400;
    throw err;
  }

  const coupon = result.rows[0];

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    const err = new Error("This coupon has expired");
    err.statusCode = 400;
    throw err;
  }

  if (subtotal < parseFloat(coupon.min_order_amount)) {
    const err = new Error(
      `This coupon requires a minimum order of ₹${coupon.min_order_amount}`
    );
    err.statusCode = 400;
    throw err;
  }

  let discount;
  if (coupon.discount_type === "percent") {
    discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
    }
  } else {
    discount = parseFloat(coupon.discount_value);
  }

  // Never let a discount exceed the subtotal
  discount = Math.min(discount, subtotal);

  return { discount, coupon };
}

// The single source of truth for a final order total.
async function calculateOrderTotals(items, couponCode) {
  const { subtotal, lineItems } = await calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const { discount, coupon } = await calculateDiscount(couponCode, subtotal);

  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return {
    lineItems,
    subtotal: round2(subtotal),
    delivery_fee: round2(deliveryFee),
    discount: round2(discount),
    coupon_code: coupon ? coupon.code : null,
    total: round2(total),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { calculateOrderTotals, calculateSubtotal, calculateDiscount, calculateDeliveryFee };