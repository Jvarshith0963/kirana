// src/utils/mailer.js

require("dotenv").config();

const nodemailer = require("nodemailer");

// ============================================================
// SMTP configuration
// ============================================================

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ============================================================
// Validate mail configuration
// ============================================================

function validateMailConfig() {
  const required = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing SMTP environment variables: ${missing.join(", ")}`
    );
  }
}

// ============================================================
// Verify SMTP connection
// ============================================================

async function verifyMailer() {
  validateMailConfig();

  try {
    await transporter.verify();

    console.info(
      "SMTP connection verified successfully."
    );

    return true;
  } catch (error) {
    console.error(
      "SMTP connection verification failed:",
      error.message
    );

    throw error;
  }
}

// ============================================================
// Common sender
// ============================================================

function getFromAddress() {
  return (
    process.env.MAIL_FROM ||
    process.env.SMTP_USER
  );
}

// ============================================================
// Send email helper
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
  text,
}) {
  if (!to) {
    throw new Error(
      "Recipient email address is required"
    );
  }

  validateMailConfig();

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  };

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.info(
      `Email sent successfully to ${to}. Message ID: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error(
      `Email sending failed for ${to}:`,
      error.message
    );

    throw error;
  }
}

// ============================================================
// Password reset email
// ============================================================

async function sendPasswordResetEmail(
  toEmail,
  resetLink
) {
  return sendEmail({
    to: toEmail,

    subject:
      "Reset your Kirana Marketplace password",

    text:
      `You requested a password reset.\n\n` +
      `Reset your password here:\n${resetLink}\n\n` +
      `This link expires in 30 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Kirana Marketplace</h2>

        <p>
          You requested a password reset.
        </p>

        <p>
          <a href="${resetLink}">
            Click here to reset your password
          </a>
        </p>

        <p>
          This link expires in 30 minutes.
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

// ============================================================
// Order placed email
// ============================================================

async function sendOrderPlacedEmail(
  toEmail,
  order
) {
  const total =
    order?.total_amount ??
    order?.totalAmount ??
    0;

  return sendEmail({
    to: toEmail,

    subject:
      `Order Confirmed — #${order.id}`,

    text:
      `Thanks for your order!\n\n` +
      `Order #${order.id}\n` +
      `Total: ₹${total}\n\n` +
      `We'll notify you as your order progresses.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Order Confirmed</h2>

        <p>
          Thanks for your order!
        </p>

        <p>
          <strong>Order #${order.id}</strong>
        </p>

        <p>
          Total: ₹${total}
        </p>

        <p>
          We'll notify you as your order progresses.
        </p>

        <p>
          Thank you for shopping with
          <strong>Kirana Marketplace</strong>.
        </p>
      </div>
    `,
  });
}

// ============================================================
// Order delivered email
// ============================================================

async function sendOrderDeliveredEmail(
  toEmail,
  order
) {
  return sendEmail({
    to: toEmail,

    subject:
      `Order Delivered — #${order.id}`,

    text:
      `Your order #${order.id} has been delivered successfully.\n\n` +
      `Thank you for shopping with Kirana Marketplace.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Order Delivered ✅</h2>

        <p>
          Your order
          <strong>#${order.id}</strong>
          has been delivered successfully.
        </p>

        <p>
          Thank you for shopping with
          <strong>Kirana Marketplace</strong>.
        </p>
      </div>
    `,
  });
}

module.exports = {
  transporter,
  verifyMailer,
  sendPasswordResetEmail,
  sendOrderPlacedEmail,
  sendOrderDeliveredEmail,
};