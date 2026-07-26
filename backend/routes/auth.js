const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

module.exports = function(db) {
  // POST /api/auth/register
  router.post('/register', (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      const id = uuidv4();
      const password_hash = bcrypt.hashSync(password, 10);
      db.run('INSERT INTO users (id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)', [id, name, email, password_hash, phone || '']);
      const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ message: 'Account created successfully!', token, user: { id, name, email, phone: phone || '' } });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // POST /api/auth/login
  router.post('/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Login successful!', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
