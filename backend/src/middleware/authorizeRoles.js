const roleRank = {
  resident: 1,
  staff: 2,
  department_admin: 3,
  super_admin: 4
};

function authorizeRoles(allowedRoles = []) {
  if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: 'unauthorized', message: 'Not authenticated' } });
      }

      const userRole = req.user.role;
      const userRank = roleRank[userRole] || 0;

      const allowedRanks = allowedRoles.map(r => roleRank[r] || 0);
      const maxAllowedRank = allowedRanks.length ? Math.max(...allowedRanks) : 0;

      // Enforce hierarchy: a user with higher rank can access lower-rank endpoints
      if (userRank >= maxAllowedRank) return next();

      return res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    } catch (err) {
      console.error('authorizeRoles error', err);
      return res.status(500).json({ error: { code: 'server_error', message: 'Authorization failed' } });
    }
  };
}

module.exports = authorizeRoles;
