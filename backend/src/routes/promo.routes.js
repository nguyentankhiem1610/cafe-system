const express = require('express');
const r = express.Router();
const { promoController: ctrl } = require('../controllers/all.controllers');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
r.get('/', ctrl.getPromos);
r.post('/', authenticate, requireRole('Quản lý'), ctrl.createPromo);
r.put('/:id', authenticate, requireRole('Quản lý'), ctrl.updatePromo);
r.post('/validate', ctrl.validatePromo);
module.exports = r;
