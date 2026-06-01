// auth.routes.js
const express = require('express');
const r = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
r.post('/register', register);
r.post('/login', login);
r.get('/me', authenticate, getMe);
r.put('/profile', authenticate, updateProfile);
r.post('/change-password', authenticate, changePassword);
module.exports = r;
