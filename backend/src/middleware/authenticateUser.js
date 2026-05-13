const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me_with_secure_secret';

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Missing Authorization header' } });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: { code: 'invalid_token', message: 'Invalid or expired token' } });
    }

    const user = await User.findById(payload.sub).select('-password').lean();
    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'User not found or inactive' } });
    }

    if (user.role === 'department_admin') user.role = 'admin';

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Authentication failed' } });
  }
}

module.exports = authenticateUser;
