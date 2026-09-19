const crypto = require('crypto');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function getOTPExpiry() {
  return new Date(Date.now() + OTP_TTL_MS);
}

module.exports = {
  generateOTP,
  getOTPExpiry,
  OTP_TTL_MS,
};