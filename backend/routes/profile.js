const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

module.exports = function(db) {
  router.get('/', authMiddleware, (req, res) => {
    try {
      const user = db.get('SELECT id, name, email, phone, avatar_url, two_factor_enabled, login_alerts, email_notifications, sms_notifications, created_at FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ user });
    } catch (err) { console.error('Profile get error:', err); res.status(500).json({ error: 'Failed to load profile.' }); }
  });

  router.put('/', authMiddleware, (req, res) => {
    try {
      const { name, phone, two_factor_enabled, login_alerts, email_notifications, sms_notifications } = req.body;
      const updates = [], params = [];
      if (name !== undefined) { updates.push('name = ?'); params.push(name); }
      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
      if (two_factor_enabled !== undefined) { updates.push('two_factor_enabled = ?'); params.push(two_factor_enabled ? 1 : 0); }
      if (login_alerts !== undefined) { updates.push('login_alerts = ?'); params.push(login_alerts ? 1 : 0); }
      if (email_notifications !== undefined) { updates.push('email_notifications = ?'); params.push(email_notifications ? 1 : 0); }
      if (sms_notifications !== undefined) { updates.push('sms_notifications = ?'); params.push(sms_notifications ? 1 : 0); }
      if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });
      updates.push("updated_at = datetime('now')");
      params.push(req.user.id);
      db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
      const user = db.get('SELECT id, name, email, phone, avatar_url, two_factor_enabled, login_alerts, email_notifications, sms_notifications, created_at FROM users WHERE id = ?', [req.user.id]);
      res.json({ message: 'Profile updated successfully!', user });
    } catch (err) { console.error('Profile update error:', err); res.status(500).json({ error: 'Failed to update profile.' }); }
  });

  router.put('/password', authMiddleware, (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new passwords are required.' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      const user = db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      if (!bcrypt.compareSync(currentPassword, user.password_hash)) return res.status(401).json({ error: 'Current password is incorrect.' });
      db.run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [bcrypt.hashSync(newPassword, 10), req.user.id]);
      res.json({ message: 'Password changed successfully!' });
    } catch (err) { console.error('Password change error:', err); res.status(500).json({ error: 'Failed to change password.' }); }
  });

  return router;
};
