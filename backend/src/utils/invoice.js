const PDFDocument = require("pdfkit");
const pool = require("../config/db");

async function generateInvoicePDF(orderId, res) {
  const orderResult = await pool.query(
    `
    SELECT o.id, o.total_amount, o.delivery_charge, o.status, o.created_at,
           s.store_name, u.name AS customer_name, u.email AS customer_email,
           a.address_line1, a.address_line2, a.city, a.state, a.pincode
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN addresses a ON o.address_id = a.id
    WHERE o.id = $1
    `,
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT oi.quantity, oi.unit_price, oi.subtotal, p.name
     FROM order_items oi JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order #${order.id}`);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`);
  doc.text(`Store: ${order.store_name}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();

  doc.text(`Billed to: ${order.customer_name} (${order.customer_email})`);
  doc.text(`${order.address_line1}, ${order.address_line2 || ""}`);
  doc.text(`${order.city}, ${order.state} - ${order.pincode}`);
  doc.moveDown();

  doc.fontSize(14).text("Items", { underline: true });
  doc.moveDown(0.5);

  itemsResult.rows.forEach((item) => {
    doc.fontSize(11).text(
      `${item.name}  x${item.quantity}  @ ₹${item.unit_price}  =  ₹${item.subtotal}`
    );
  });

  doc.moveDown();
  doc.fontSize(12).text(`Delivery charge: ₹${order.delivery_charge}`);
  doc.fontSize(14).text(`Total: ₹${order.total_amount}`, { underline: true });

  doc.end();
}

module.exports = { generateInvoicePDF };