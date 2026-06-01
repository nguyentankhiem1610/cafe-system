const express = require('express');
const r = express.Router();
const { paymentController: ctrl } = require('../controllers/all.controllers');
const { authenticate } = require('../middlewares/auth.middleware');
r.post('/', authenticate, ctrl.createPayment);
module.exports = r;
