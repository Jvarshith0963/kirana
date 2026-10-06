const crypto = require("crypto");
require("dotenv").config();

// Simulates what Razorpay's real checkout widget would send back after payment.
// Usage: node src/scripts/simulate-payment.js <razorpay_order_id>
const razorpayOrderId = process.argv[2];

if (!razorpayOrderId) {
  console.log("Usage: node src/scripts/simulate-payment.js <razorpay_order_id>");
  process.exit(1);
}

const fakePaymentId = `pay_mock_${crypto.randomBytes(8).toString("hex")}`;
const secret = process.env.RAZORPAY_KEY_SECRET;

const signature = crypto
  .createHmac("sha256", secret)
  .update(`${razorpayOrderId}|${fakePaymentId}`)
  .digest("hex");

console.log(JSON.stringify({
  razorpay_order_id: razorpayOrderId,
  razorpay_payment_id: fakePaymentId,
  razorpay_signature: signature,
}, null, 2));