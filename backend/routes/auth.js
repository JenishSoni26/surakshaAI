const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      db.run(
        'INSERT INTO users (id, name, email, password_hash, phone, auth_provider) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, password_hash, phone || '', 'local']
      );
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
      // Prevent Google-only users from logging in with password
      if (user.auth_provider === 'google' && !user.password_hash) {
        return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button.' });
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

  // GET /api/auth/me
  router.get('/me', authMiddleware, (req, res) => {
    try {
      const user = db.get('SELECT id, name, email, phone, avatar_url, two_factor_enabled, created_at FROM users WHERE id = ?', [req.user.id]);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json({ user });
    } catch (err) {
      console.error('Get me error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // POST /api/auth/google
  router.post('/google', async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ error: 'Google credential is required.' });
      }
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google OAuth is not configured on the server.' });
      }

      // Verify the Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        return res.status(400).json({ error: 'Could not retrieve email from Google account.' });
      }

      // Check if user already exists
      let user = db.get('SELECT * FROM users WHERE email = ?', [email]);

      if (user) {
        // Update google_id and avatar if needed
        if (!user.google_id) {
          db.run(
            'UPDATE users SET google_id = ?, avatar_url = ?, auth_provider = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [googleId, picture || '', 'google', user.id]
          );
          user = db.get('SELECT * FROM users WHERE id = ?', [user.id]);
        }
      } else {
        // Create new user from Google
        const id = uuidv4();
        db.run(
          'INSERT INTO users (id, name, email, password_hash, google_id, avatar_url, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, name, email, '', googleId, picture || '', 'google']
        );
        user = db.get('SELECT * FROM users WHERE id = ?', [id]);
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        message: 'Google sign-in successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '', avatar_url: user.avatar_url || '' }
      });
    } catch (err) {
      console.error('Google auth error:', err);
      res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }
  });

  return router;
};
