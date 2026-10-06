// src/utils/hashToken.js
// Refresh tokens and password-reset tokens are never stored in plaintext.
// We store a SHA-256 hash so a leaked DB row can't be replayed directly.
const crypto = require('crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { hashToken, generateRawToken };