const express = require('express');
const r = express.Router();
const { reportController: ctrl } = require('../controllers/all.controllers');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
r.get('/revenue', authenticate, requireRole('Quản lý'), ctrl.getRevenueReport);
r.get('/daily', authenticate, requireRole('Quản lý'), ctrl.getDailyRevenue);
module.exports = r;
