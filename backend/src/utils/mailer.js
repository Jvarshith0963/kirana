// src/utils/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Kirana Marketplace" <no-reply@kirana.local>',
    to: toEmail,
    subject: 'Reset your Kirana Marketplace password',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
}

async function sendOrderPlacedEmail(toEmail, order) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Kirana Marketplace" <no-reply@kirana.local>',
    to: toEmail,
    subject: `Order Confirmed — #${order.id}`,
    html: `
      <p>Thanks for your order!</p>
      <p>Order #${order.id} — Total: ₹${order.total_amount || order.totalAmount}</p>
      <p>We'll notify you as it progresses.</p>
    `,
  });
}

async function sendOrderDeliveredEmail(toEmail, order) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Kirana Marketplace" <no-reply@kirana.local>',
    to: toEmail,
    subject: `Order Delivered — #${order.id}`,
    html: `
      <p>Your order #${order.id} has been delivered. Enjoy!</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendOrderPlacedEmail, sendOrderDeliveredEmail };
