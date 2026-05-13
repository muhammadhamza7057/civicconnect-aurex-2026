const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { mongoose } = require('../lib/mongo');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me_with_secure_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = process.env.REFRESH_EXPIRES_DAYS || 30;

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Simple in-DB refresh token model via user.metadata.refreshTokens (rotation)

exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: { code: 'bad_request', message: 'Missing fields' } });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: { code: 'user_exists', message: 'Email already registered' } });

    const user = new User({ email, password, full_name, role: 'resident' });
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = generateRefreshToken();

    // store refresh token fingerprint in user.metadata
    user.metadata = user.metadata || {};
    user.metadata.refreshTokens = user.metadata.refreshTokens || [];
    user.metadata.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie('cc_rt', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    });

    return res.json({ data: { accessToken } });
  } catch (err) {
    console.error('auth.register error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Registration failed' } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: { code: 'bad_request', message: 'Missing email or password' } });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });

    const accessToken = signAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.metadata = user.metadata || {};
    user.metadata.refreshTokens = user.metadata.refreshTokens || [];
    user.metadata.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie('cc_rt', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    });

    return res.json({ data: { accessToken } });
  } catch (err) {
    console.error('auth.login error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Login failed' } });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.cc_rt;
    if (!token) return res.status(401).json({ error: { code: 'unauthorized', message: 'Missing refresh token' } });

    // Find user with this refresh token
    const user = await User.findOne({ 'metadata.refreshTokens.token': token });
    if (!user) return res.status(401).json({ error: { code: 'invalid_token', message: 'Refresh token invalid' } });

    // Rotate token: remove old, add new
    user.metadata.refreshTokens = (user.metadata.refreshTokens || []).filter(rt => rt.token !== token);
    const newToken = generateRefreshToken();
    user.metadata.refreshTokens.push({ token: newToken, createdAt: new Date() });
    await user.save();

    const accessToken = signAccessToken(user);

    res.cookie('cc_rt', newToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    });

    return res.json({ data: { accessToken } });
  } catch (err) {
    console.error('auth.refresh error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Refresh failed' } });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.cc_rt;
    if (token) {
      await User.updateOne({ 'metadata.refreshTokens.token': token }, { $pull: { 'metadata.refreshTokens': { token } } });
    }
    res.clearCookie('cc_rt');
    return res.json({ data: { ok: true } });
  } catch (err) {
    console.error('auth.logout error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Logout failed' } });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
    const user = req.user;
    const safe = {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      metadata: user.metadata
    };
    return res.json({ data: safe });
  } catch (err) {
    console.error('auth.me error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Failed to load profile' } });
  }
};
