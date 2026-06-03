const express = require("express");
const r = express.Router();
const { paymentController: ctrl } = require("../controllers/all.controllers");
const { optionalAuth } = require("../middlewares/auth.middleware");
// create payment for staff, logged-in customers, or guest online checkout.
r.post("/", optionalAuth, ctrl.createPayment);

// VNPAY callback (redirect URL) - VNPAY will call this without auth
r.get("/vnpay/callback", ctrl.handleVnpayCallback);
module.exports = r;
