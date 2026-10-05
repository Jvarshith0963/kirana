require("dotenv").config();

const {
  verifyMailer,
  sendOrderPlacedEmail,
  sendOrderDeliveredEmail,
} = require("../utils/mailer");

async function main() {
  try {
    await verifyMailer();

    const testRecipient =
      process.env.TEST_EMAIL_TO;

    if (!testRecipient) {
      throw new Error(
        "TEST_EMAIL_TO is missing from .env"
      );
    }

    const testOrder = {
      id: 999999,
      total_amount: "499.00",
    };

    await sendOrderPlacedEmail(
      testRecipient,
      testOrder
    );

    await sendOrderDeliveredEmail(
      testRecipient,
      testOrder
    );

    console.info(
      "Email test completed successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Email test failed:",
      error
    );

    process.exit(1);
  }
}

main();