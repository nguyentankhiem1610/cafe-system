const express = require("express");
const r = express.Router();
const { paymentController: ctrl } = require("../controllers/all.controllers");
const { authenticate } = require("../middlewares/auth.middleware");
// create payment (requires auth for staff/customers). If you need guest payments, consider allowing unauthenticated calls.
r.post("/", authenticate, ctrl.createPayment);

// VNPAY callback (redirect URL) - VNPAY will call this without auth
r.get("/vnpay/callback", ctrl.handleVnpayCallback);
module.exports = r;
