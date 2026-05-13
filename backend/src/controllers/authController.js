const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Department = require('../models/Department');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me_with_secure_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

function departmentIdForToken(user) {
  if (!user || !user.department) return null;
  if (typeof user.department === 'object' && user.department._id) return user.department._id.toString();
  return user.department.toString();
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, department_id: departmentIdForToken(user) },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function publicUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  const department_id = u.department ? u.department._id || u.department : u.department;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    department_id: department_id || null,
    department: u.department && typeof u.department === 'object' ? { id: u.department._id, name: u.department.name, slug: u.department.slug } : null,
    staff_id: u.staff_id || null,
    profile_photo: u.profile_photo || null,
    two_factor_verified: Boolean(u.two_factor_verified),
    ip_restriction_simulated: Boolean(u.ip_restriction_simulated),
    metadata: u.metadata || {}
  };
}

function authPayload(userDoc, accessToken) {
  const u = publicUser(userDoc);
  return {
    accessToken,
    token: accessToken,
    role: u.role,
    department_id: u.department_id,
    user: u
  };
}

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      full_name,
      role = 'resident',
      department_id,
      staff_id
    } = req.body;

    const displayName = (name || full_name || '').trim();
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Missing name, email, or password' } });
    }

    const allowedRoles = ['resident', 'staff', 'admin', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Invalid role' } });
    }

    if (['staff', 'admin'].includes(role)) {
      if (!department_id) {
        return res.status(400).json({ error: { code: 'bad_request', message: 'department_id is required for this role' } });
      }
      const dept = await Department.findById(department_id);
      if (!dept) {
        return res.status(400).json({ error: { code: 'bad_request', message: 'Invalid department' } });
      }
    }

    if (role === 'staff' && !staff_id) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'staff_id is required for staff accounts' } });
    }

    if (role === 'super_admin' && department_id) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Super admin must not be tied to a single department' } });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: { code: 'user_exists', message: 'Email already registered' } });

    if (staff_id) {
      const sid = await User.findOne({ staff_id });
      if (sid) return res.status(400).json({ error: { code: 'staff_id_taken', message: 'Staff ID already in use' } });
    }

    const userFields = {
      email: email.toLowerCase(),
      password,
      name: displayName,
      role,
      department: department_id || null
    };
    if (role === 'staff') userFields.staff_id = staff_id;

    const user = new User(userFields);

    await user.save();

    const populated = await User.findById(user._id).populate('department', 'name slug sla_config');

    const accessToken = signAccessToken(populated);
    const refreshToken = generateRefreshToken();

    populated.metadata = populated.metadata || {};
    populated.metadata.refreshTokens = populated.metadata.refreshTokens || [];
    populated.metadata.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await populated.save();

    res.cookie('cc_rt', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ data: authPayload(populated, accessToken) });
  } catch (err) {
    console.error('auth.register error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Registration failed' } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, staff_id, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Password is required' } });
    }
    if (!email && !staff_id) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Provide email or staff_id' } });
    }

    const query = email ? { email: String(email).toLowerCase() } : { staff_id: String(staff_id).trim() };
    const user = await User.findOne(query).populate('department', 'name slug sla_config');
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

    return res.json({ data: authPayload(user, accessToken) });
  } catch (err) {
    console.error('auth.login error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Login failed' } });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.cc_rt;
    if (!token) return res.status(401).json({ error: { code: 'unauthorized', message: 'Missing refresh token' } });

    const user = await User.findOne({ 'metadata.refreshTokens.token': token }).populate('department', 'name slug sla_config');
    if (!user) return res.status(401).json({ error: { code: 'invalid_token', message: 'Refresh token invalid' } });

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

    return res.json({ data: authPayload(user, accessToken) });
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
    const user = await User.findById(req.user._id).select('-password').populate('department', 'name slug sla_config');
    if (!user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Not found' } });
    return res.json({ data: publicUser(user) });
  } catch (err) {
    console.error('auth.me error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Failed to load profile' } });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
    const { profile_photo, name } = req.body;
    const updates = {};
    if (profile_photo) updates.profile_photo = profile_photo;
    if (name) updates.name = String(name).trim();
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Nothing to update' } });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true })
      .populate('department', 'name slug sla_config')
      .select('-password');
    return res.json({ data: publicUser(user) });
  } catch (err) {
    console.error('auth.updateProfile error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Update failed' } });
  }
};

exports.verifyTwoFactorSim = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'forbidden', message: '2FA simulation is for administrators' } });
    }
    const { code } = req.body;
    if (!code || String(code).length < 4) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Enter a simulated OTP (4+ digits)' } });
    }
    await User.updateOne({ _id: req.user._id }, { $set: { two_factor_verified: true } });
    return res.json({ data: { ok: true, two_factor_verified: true } });
  } catch (err) {
    console.error('auth.verifyTwoFactorSim error', err);
    return res.status(500).json({ error: { code: 'server_error', message: '2FA verification failed' } });
  }
};

exports.setIpRestrictionSim = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'forbidden', message: 'Super admin only' } });
    }
    const { enabled } = req.body;
    await User.updateOne({ _id: req.user._id }, { $set: { ip_restriction_simulated: Boolean(enabled) } });
    return res.json({ data: { ok: true, ip_restriction_simulated: Boolean(enabled) } });
  } catch (err) {
    console.error('auth.setIpRestrictionSim error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Update failed' } });
  }
};
