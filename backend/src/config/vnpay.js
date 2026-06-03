const { VNPay, ignoreLogger } = require("vnpay");

const createVnpayClient = () => {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN || process.env.VNPAY_TMN_CODE || "F129LIMJ",
    secureSecret:
      process.env.VNPAY_SECRET ||
      process.env.VNPAY_SECURE_SECRET ||
      "EEIUI7UHEB8WKWFCCMJ6AO0S2YU5U9R5",
    vnpayHost:
      process.env.VNPAY_HOST ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    testMode: process.env.VNPAY_TEST ? process.env.VNPAY_TEST === "true" : true,
    hashAlgorithm: "SHA512",
    loggerFn: ignoreLogger,
  });
};

module.exports = { createVnpayClient };
