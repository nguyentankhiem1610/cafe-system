const express = require("express");
const r = express.Router();
const ctrl = require("../controllers/customer.controller");
const { authenticate } = require("../middlewares/auth.middleware");

r.get("/points", authenticate, ctrl.getPoints);
r.get("/leaderboard", authenticate, ctrl.getLeaderboard);
r.post("/redeem", authenticate, ctrl.redeemPoints);

module.exports = r;
