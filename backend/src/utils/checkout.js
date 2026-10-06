const { createNotification } = require("./notifications");
const { sendOrderPlacedEmail } = require("./mailer");
const pool = require("../config/db");

const {
  calculateDeliveryCharge,
  calculateDiscount,
} = require("./pricing");

const { getStockStatus } = require("./stockStatus");

async function checkoutCart(
  userId,
  addressId,
  deliveryType,
  couponCode
) {
  const client = await pool.connect();

  try {
    // ------------------------------------------------------------
    // 1. Start transaction
    // ------------------------------------------------------------
    await client.query("BEGIN");

    // ------------------------------------------------------------
    // 2. Get customer
    // ------------------------------------------------------------
    const customerResult = await client.query(
      `SELECT id
       FROM customers
       WHERE user_id = $1`,
      [userId]
    );

    if (customerResult.rows.length === 0) {
      const err = new Error("No customer profile found for this user");
      err.statusCode = 400;
      throw err;
    }

    const customerId = customerResult.rows[0].id;

    // ------------------------------------------------------------
    // 3. Get customer's cart
    // ------------------------------------------------------------
    const cartResult = await client.query(
      `SELECT id
       FROM carts
       WHERE customer_id = $1`,
      [customerId]
    );

    if (cartResult.rows.length === 0) {
      const err = new Error("Cart is empty");
      err.statusCode = 400;
      throw err;
    }

    const cartId = cartResult.rows[0].id;

    // ------------------------------------------------------------
    // 4. Get cart items
    // ------------------------------------------------------------
    const itemsResult = await client.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.is_available,
        p.stock_quantity,
        s.id AS store_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      WHERE ci.cart_id = $1
      `,
      [cartId]
    );

    if (itemsResult.rows.length === 0) {
      const err = new Error("Cart is empty");
      err.statusCode = 400;
      throw err;
    }

    // ------------------------------------------------------------
    // 5. Validate delivery type
    // ------------------------------------------------------------
    const allowedDeliveryTypes = ["standard", "express"];

    if (!allowedDeliveryTypes.includes(deliveryType)) {
      const err = new Error("Invalid delivery type");
      err.statusCode = 400;
      throw err;
    }

    // ------------------------------------------------------------
    // 6. Validate address
    // ------------------------------------------------------------
    const addressResult = await client.query(
      `
      SELECT id
      FROM addresses
      WHERE id = $1
        AND customer_id = $2
      `,
      [addressId, customerId]
    );

    if (addressResult.rows.length === 0) {
      const err = new Error("Invalid delivery address");
      err.statusCode = 400;
      throw err;
    }

    // ------------------------------------------------------------
    // 7. Validate availability and stock
    // ------------------------------------------------------------
    for (const item of itemsResult.rows) {
      if (!item.is_available) {
        const err = new Error(
          `${item.name} is no longer available`
        );

        err.statusCode = 400;
        throw err;
      }

      if (item.stock_quantity < item.quantity) {
        const err = new Error(
          `Only ${item.stock_quantity} of ${item.name} in stock`
        );

        err.statusCode = 400;
        throw err;
      }
    }

    // ------------------------------------------------------------
    // 8. Group cart items by store
    // ------------------------------------------------------------
    const itemsByStore = {};

    for (const item of itemsResult.rows) {
      if (!itemsByStore[item.store_id]) {
        itemsByStore[item.store_id] = [];
      }

      itemsByStore[item.store_id].push(item);
    }

    // ------------------------------------------------------------
    // Store low-stock / out-of-stock alerts
    // ------------------------------------------------------------
    const stockAlerts = [];

    // ------------------------------------------------------------
    // 9. Create one order per store
    // ------------------------------------------------------------
    const orders = [];

    for (const storeId of Object.keys(itemsByStore)) {
      const storeItems = itemsByStore[storeId];

      // ----------------------------------------------------------
      // Calculate subtotal
      // ----------------------------------------------------------
      const subtotal = storeItems.reduce(
        (sum, item) =>
          sum + parseFloat(item.price) * item.quantity,
        0
      );

      // ----------------------------------------------------------
      // Calculate delivery charge
      // ----------------------------------------------------------
      const deliveryFee = calculateDeliveryCharge(
        deliveryType,
        subtotal
      );

      // ----------------------------------------------------------
      // Calculate discount
      // ----------------------------------------------------------
      let discount = 0;

      if (couponCode) {
        const result = await calculateDiscount(
          couponCode,
          subtotal
        );

        discount = result.discount;
      }

      // ----------------------------------------------------------
      // Calculate final amount
      // ----------------------------------------------------------
      const totalAmount = Math.max(
        subtotal + deliveryFee - discount,
        0
      );

      // ----------------------------------------------------------
      // Create order
      // ----------------------------------------------------------
      const orderResult = await client.query(
        `
        INSERT INTO orders
        (
          customer_id,
          store_id,
          address_id,
          status,
          total_amount,
          payment_status,
          created_at,
          updated_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          'pending',
          $4,
          'pending',
          NOW(),
          NOW()
        )
        RETURNING *
        `,
        [
          customerId,
          storeId,
          addressId,
          totalAmount,
        ]
      );

      const order = orderResult.rows[0];

      // ----------------------------------------------------------
      // Create order items
      // ----------------------------------------------------------
      for (const item of storeItems) {
        const itemSubtotal =
          parseFloat(item.price) * item.quantity;

        await client.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            order.id,
            item.product_id,
            item.quantity,
            item.price,
            itemSubtotal,
          ]
        );

        // --------------------------------------------------------
        // Reduce product stock
        // --------------------------------------------------------
        await client.query(
          `
          UPDATE products
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
          `,
          [
            item.quantity,
            item.product_id,
          ]
        );

        // --------------------------------------------------------
        // Check updated stock status
        // --------------------------------------------------------
        const updatedProduct = await client.query(
          `
          SELECT
            stock_quantity,
            name,
            store_id
          FROM products
          WHERE id = $1
          `,
          [item.product_id]
        );

        if (updatedProduct.rows.length > 0) {
          const product = updatedProduct.rows[0];

          const status = getStockStatus(
            product.stock_quantity
          );

          // ------------------------------------------------------
          // Store alert for after transaction commits
          // ------------------------------------------------------
          if (
            status === "low_stock" ||
            status === "out_of_stock"
          ) {
            const vendorRow = await client.query(
              `
              SELECT v.user_id
              FROM stores s
              JOIN vendors v ON s.vendor_id = v.id
              WHERE s.id = $1
              `,
              [product.store_id]
            );

            if (vendorRow.rows.length > 0) {
              stockAlerts.push({
                userId: vendorRow.rows[0].user_id,
                productName: product.name,
                status,
              });
            }
          }
        }
      }

      // ----------------------------------------------------------
      // Get vendor user ID
      // ----------------------------------------------------------
      const vendorResult = await client.query(
        `
        SELECT v.user_id
        FROM stores s
        JOIN vendors v ON s.vendor_id = v.id
        WHERE s.id = $1
        `,
        [storeId]
      );

      const vendorUserId =
        vendorResult.rows.length > 0
          ? vendorResult.rows[0].user_id
          : null;

      // ----------------------------------------------------------
      // Store order + vendor information
      // ----------------------------------------------------------
      orders.push({
        ...order,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        delivery_type: deliveryType,
        items: storeItems,
        vendor_user_id: vendorUserId,
      });
    }

    // ------------------------------------------------------------
    // 10. Empty cart
    // ------------------------------------------------------------
    await client.query(
      `DELETE FROM cart_items
       WHERE cart_id = $1`,
      [cartId]
    );

    // ------------------------------------------------------------
    // 11. Commit transaction
    // ------------------------------------------------------------
    await client.query("COMMIT");

    // ------------------------------------------------------------
    // 12. Get customer email
    // ------------------------------------------------------------
    const customerEmailResult = await pool.query(
      `SELECT email
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const customerEmail =
      customerEmailResult.rows.length > 0
        ? customerEmailResult.rows[0].email
        : null;

    // ------------------------------------------------------------
    // 13. Send notifications + email
    // ------------------------------------------------------------
    for (const order of orders) {

      // ----------------------------------------------------------
      // Customer notification
      // ----------------------------------------------------------
      try {
        await createNotification({
          userId,
          type: "order_placed",
          title: "Order placed",
          message: `Your order #${order.id} has been placed successfully.`,
          relatedOrderId: order.id,
        });
      } catch (notificationError) {
        console.error(
          `Customer notification failed for order #${order.id}:`,
          notificationError.message
        );
      }

      // ----------------------------------------------------------
      // Vendor notification
      // ----------------------------------------------------------
      if (order.vendor_user_id) {
        try {
          await createNotification({
            userId: order.vendor_user_id,
            type: "order_received",
            title: "New order received",
            message: `You have a new order #${order.id}.`,
            relatedOrderId: order.id,
          });
        } catch (notificationError) {
          console.error(
            `Vendor notification failed for order #${order.id}:`,
            notificationError.message
          );
        }
      }

      // ----------------------------------------------------------
      // Customer email
      // ----------------------------------------------------------
      if (customerEmail) {
        try {
          await sendOrderPlacedEmail(
            customerEmail,
            order
          );
        } catch (emailError) {
          console.error(
            `Order placed email failed for order #${order.id}:`,
            emailError.message
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 14. Low-stock / out-of-stock vendor alerts
    // ------------------------------------------------------------
    for (const alert of stockAlerts) {
      try {
        await createNotification({
          userId: alert.userId,

          type:
            alert.status === "out_of_stock"
              ? "out_of_stock_alert"
              : "low_stock_alert",

          title:
            alert.status === "out_of_stock"
              ? "Product out of stock"
              : "Low stock alert",

          message:
            `${alert.productName} is ` +
            `${
              alert.status === "out_of_stock"
                ? "out of stock"
                : "running low"
            }.`,
        });
      } catch (notificationError) {
        console.error(
          `Stock alert notification failed for ${alert.productName}:`,
          notificationError.message
        );
      }
    }

    // ------------------------------------------------------------
    // 15. Remove internal vendor_user_id before response
    // ------------------------------------------------------------
    return orders.map(
      ({ vendor_user_id, ...order }) => order
    );

  } catch (error) {
    // Rollback everything if transaction fails
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError.message
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  checkoutCart,
};