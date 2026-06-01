const express = require('express');
const r = express.Router();
const { webhookController: ctrl } = require('../controllers/all.controllers');
r.post('/:platform', ctrl.handleDeliveryWebhook);
module.exports = r;
