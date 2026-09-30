const crypto = require("crypto");

// MOCK Razorpay client — no real account needed yet.
// Swap this file's contents for the real SDK once you sign up:
//   const Razorpay = require("razorpay");
//   module.exports = new Razorpay({ key_id: ..., key_secret: ... });

const mockRazorpay = {
  orders: {
    create: async ({ amount, currency, receipt }) => {
      const fakeOrderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        id: fakeOrderId,
        amount,
        currency,
        receipt,
        status: "created",
      };
    },
  },
};

module.exports = mockRazorpay;