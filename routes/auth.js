const express = require('express');
const router = express.Router();
const authController = require('../controler/authcontroler');

// Auth routes
router.post('/login', authController.login_post);
router.post('/register', authController.register_post);
router.post('/password-reset/request', authController.password_reset_request);
router.post('/password-reset/confirm', authController.password_reset_confirm);
router.get('/userdetail', authController.display_user);
router.put('/userdetail', authController.update_user);

module.exports = router;