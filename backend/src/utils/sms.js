async function sendOTP(phone, otp) {
  // Mock SMS provider for development.
  // Replace this later with Twilio, MSG91, AWS SNS, etc.

  console.log(`=================================`);
  console.log(`MOCK SMS`);
  console.log(`Phone: ${phone}`);
  console.log(`OTP: ${otp}`);
  console.log(`=================================`);

  return {
    success: true,
    provider: 'mock',
  };
}

module.exports = {
  sendOTP,
};