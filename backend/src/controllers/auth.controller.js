// src/controllers/auth.controller.js
const crypto = require('crypto');
const { sendOTP } = require('../utils/sms');
const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashToken, generateRawToken } = require('../utils/hashtoken');
const { sendPasswordResetEmail } = require('../utils/mailer');

const VALID_ROLES = ['customer', 'vendor', 'admin'];
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);



async function createRoleProfile(client, userId, role) {
  if (role === 'customer') {
    await client.query(
      `INSERT INTO customers (user_id) VALUES ($1)`,
      [userId]
    );
  } else if (role === 'vendor') {
    await client.query(
      `INSERT INTO vendors (user_id) VALUES ($1)`,
      [userId]
    );
  }
  // Admins are typically created manually/seeded, not via public register.
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// body: { name, email, password, role, phone }
// ---------------------------------------------------------------------------
async function register(req, res) {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }
  if (!VALID_ROLES.includes(role) || role === 'admin') {
    return res.status(400).json({ message: 'role must be "customer" or "vendor"' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
       RETURNING id, name, email, role, phone, created_at`,
      [name, email.toLowerCase(), passwordHash, role, phone || null]
    );
    const user = insertResult.rows[0];

    await createRoleProfile(client, user.id, role);

    await client.query('COMMIT');

    return res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('register error:', err);
    return res.status(500).json({ message: 'Something went wrong during registration' });
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// body: { email, password }
// ---------------------------------------------------------------------------
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    // Same generic error whether the email doesn't exist or the password is
    // wrong — don't leak which one it was.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.is_active === false) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, hashToken(refreshToken), new Date(Date.now() + REFRESH_TTL_MS)]
    );

    return res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Something went wrong during login' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// body: { refreshToken }
// Revokes the specific refresh token so it can no longer be used to mint
// new access tokens. The client should also discard both tokens locally.
// ---------------------------------------------------------------------------
async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  try {
    // Verifying isn't strictly required to revoke, but confirms it's
    // well-formed before we touch the DB.
    try {
      verifyRefreshToken(refreshToken);
    } catch (_) {
      // Even if it's expired/invalid, attempt to revoke the matching hash
      // below so an old token can't be reused. Fall through.
    }

    await pool.query(
      `UPDATE refresh_tokens SET revoked = TRUE
       WHERE token_hash = $1`,
      [hashToken(refreshToken)]
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ message: 'Something went wrong during logout' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// body: { email }
// Always returns a generic success message, whether or not the email
// exists, to avoid leaking which emails are registered.
// ---------------------------------------------------------------------------
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  const genericResponse = {
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  try {
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRawToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error('forgotPassword error:', err);
    // Still return the generic message so failures don't leak info either.
    return res.status(200).json(genericResponse);
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// body: { token, newPassword }
// ---------------------------------------------------------------------------
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'token and newPassword are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const client = await pool.connect();
  try {
    const tokenHash = hashToken(token);

    const result = await client.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );
    const resetRecord = result.rows[0];

    if (!resetRecord) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await client.query('BEGIN');

    await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [newPasswordHash, resetRecord.user_id]
    );

    await client.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
      [resetRecord.id]
    );

    // Security best practice: revoke every existing session so a stolen
    // refresh token from before the reset can't keep being used.
    await client.query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`,
      [resetRecord.user_id]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: 'Password has been reset successfully. Please log in again.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Something went wrong while resetting your password' });
  } finally {
    client.release();
  }
}
// ---------------------------------------------------------------------------
// POST /api/auth/otp/request
// body: { phone }
// ---------------------------------------------------------------------------
async function requestOTP(req, res) {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      message: 'phone is required',
    });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, name, email, phone, role, is_active
       FROM users
       WHERE phone = $1`,
      [phone]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this phone number',
      });
    }

    if (user.is_active === false) {
      return res.status(403).json({
        message: 'This account has been deactivated',
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate previous unused OTPs
    await pool.query(
      `UPDATE otp_tokens
       SET used = TRUE
       WHERE user_id = $1
       AND used = FALSE`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO otp_tokens
       (user_id, phone, otp_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, phone, otpHash, expiresAt]
    );

    // Mock SMS
    await sendOTP(phone, otp);

    return res.status(200).json({
      message: 'OTP sent successfully',
    });
  } catch (err) {
    console.error('requestOTP error:', err);

    return res.status(500).json({
      message: 'Something went wrong while sending OTP',
    });
  }
}
// ---------------------------------------------------------------------------
// POST /api/auth/otp/verify
// body: { phone, otp }
// ---------------------------------------------------------------------------
async function verifyOTP(req, res) {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      message: 'phone and otp are required',
    });
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM otp_tokens
       WHERE phone = $1
       AND used = FALSE
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    const otpRecord = result.rows[0];

    if (!otpRecord) {
      return res.status(400).json({
        message: 'OTP is invalid or has expired',
      });
    }

    // Check maximum attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message: 'Too many incorrect OTP attempts',
      });
    }

    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    if (otpHash !== otpRecord.otp_hash) {
      await pool.query(
        `UPDATE otp_tokens
         SET attempts = attempts + 1
         WHERE id = $1`,
        [otpRecord.id]
      );

      return res.status(401).json({
        message: 'Invalid OTP',
      });
    }

    // Mark OTP as used
    await pool.query(
      `UPDATE otp_tokens
       SET used = TRUE
       WHERE id = $1`,
      [otpRecord.id]
    );

    // Get user
    const userResult = await pool.query(
      `SELECT *
       FROM users
       WHERE id = $1`,
      [otpRecord.user_id]
    );

    const user = userResult.rows[0];

    if (!user || user.is_active === false) {
      return res.status(403).json({
        message: 'User account is inactive or unavailable',
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await pool.query(
      `INSERT INTO refresh_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [
        user.id,
        hashToken(refreshToken),
        new Date(Date.now() + REFRESH_TTL_MS),
      ]
    );

    return res.status(200).json({
      message: 'OTP login successful',
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('verifyOTP error:', err);

    return res.status(500).json({
      message: 'Something went wrong while verifying OTP',
    });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/google
// body: { idToken }
// ---------------------------------------------------------------------------
async function googleLogin(req, res) {
  const { idToken } = req.body || {};

  if (!idToken) {
    return res.status(400).json({
      message: 'idToken is required',
    });
  }

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: 'Google account email is not verified',
      });
    }

    // Check if user already exists
    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    let user = result.rows[0];

    // Create new customer if user doesn't exist
    if (!user) {
      const insertResult = await pool.query(
        `INSERT INTO users
         (name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, 'customer', TRUE, NOW(), NOW())
         RETURNING *`,
        [
          name || 'Google User',
          email.toLowerCase(),
          `google:${googleId}`,
        ]
      );

      user = insertResult.rows[0];

      // Create customer profile
      await pool.query(
        `INSERT INTO customers (user_id)
         VALUES ($1)`,
        [user.id]
      );
    }

    if (user.is_active === false) {
      return res.status(403).json({
        message: 'This account has been deactivated',
      });
    }

    // Generate application JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    await pool.query(
      `INSERT INTO refresh_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [
        user.id,
        hashToken(refreshToken),
        new Date(Date.now() + REFRESH_TTL_MS),
      ]
    );

    return res.status(200).json({
      message: 'Google login successful',
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      picture: picture || null,
    });

  } catch (err) {
    console.error('googleLogin error:', err);

    return res.status(401).json({
      message: 'Invalid Google ID token',
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTP,
  googleLogin,
};