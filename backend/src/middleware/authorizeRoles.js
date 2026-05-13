const roleRank = {
  resident: 1,
  staff: 2,
  admin: 3,
  super_admin: 4
};

/**
 * Allow access if the user's rank is >= the minimum rank among allowed roles
 * (higher roles inherit access to staff-level endpoints).
 * Use the most privileged role in `allowedRoles` alone when the route must exclude lower roles
 * (e.g. only ['admin'] so min rank = 3 excludes staff).
 */
function authorizeRoles(allowedRoles = []) {
  if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
      }

      const userRole = req.user.role;
      const userRank = roleRank[userRole] || 0;
      const allowedRanks = allowedRoles.map(r => roleRank[r] || 0).filter(Boolean);
      if (!allowedRanks.length) {
        return res.status(500).json({ error: { code: 'server_error', message: 'Invalid role configuration' } });
      }

      const minRequiredRank = Math.min(...allowedRanks);
      if (userRank >= minRequiredRank) return next();

      return res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    } catch (err) {
      console.error('authorizeRoles error', err);
      return res.status(500).json({ error: { code: 'server_error', message: 'Authorization failed' } });
    }
  };
}

module.exports = authorizeRoles;
