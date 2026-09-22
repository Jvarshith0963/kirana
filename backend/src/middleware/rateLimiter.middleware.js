const rateLimit = require("express-rate-limit");

// General limiter — applies to all API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

// Stricter limiter for write operations (uploads, product changes)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many write requests, please slow down" },
});

module.exports = { generalLimiter, writeLimiter };