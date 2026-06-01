const express = require('express');
const r = express.Router();
const { tableController: ctrl } = require('../controllers/all.controllers');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
r.get('/', ctrl.getTables);
r.post('/', authenticate, requireRole('Quản lý'), ctrl.createTable);
r.put('/:id', authenticate, requireRole('Quản lý', 'Thu ngân'), ctrl.updateTable);
r.delete('/:id', authenticate, requireRole('Quản lý'), ctrl.deleteTable);
module.exports = r;
