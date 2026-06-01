const express = require('express');
const r = express.Router();
const { kdsController: ctrl } = require('../controllers/all.controllers');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
r.get('/orders', authenticate, ctrl.getKDSOrders);
r.patch('/orders/:id/accept', authenticate, ctrl.acceptOrder);
r.patch('/orders/:id/complete', authenticate, ctrl.completeOrder);
module.exports = r;
