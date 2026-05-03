const express = require('express');
const router = express.Router();
const authController = require('../controler/authcontroler');
const { authenticate, rolePermissions } = require('../controler/rbac');

// Auth routes
router.post('/login', authController.login_post);
router.post('/register', authController.register_post);
router.post('/password-reset/request', authController.password_reset_request);
router.post('/password-reset/confirm', authController.password_reset_confirm);
router.get('/userdetail', authController.display_user);
router.put('/userdetail', authController.update_user);

// Get current user's role permissions
router.get('/permissions', authenticate, (req, res) => {
  const role = req.user.role;
  const perms = rolePermissions[role];
  if (!perms) {
    return res.status(403).json({ message: 'No permissions found for role' });
  }
  res.json({ role, permissions: perms });
});

module.exports = router;