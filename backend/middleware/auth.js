const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'surakshapay-secret-key-change-in-production';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

// Optional auth - sets req.user if token present, but doesn't block
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Token invalid, but that's okay for optional auth
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
