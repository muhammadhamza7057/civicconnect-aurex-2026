import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const roleRank = { resident: 1, staff: 2, admin: 3, department_admin: 3, super_admin: 4 };

export function RoleBasedRoute({ children, allowedRoles = [] }) {
  const profile = useAuthStore(state => state.profile);
  const status = useAuthStore(state => state.status);

  if (status === 'loading') return null;
  if (!profile) return <Navigate to="/login" replace />;

  const userRank = roleRank[profile.role] || 0;
  const allowedRanks = allowedRoles.map(r => roleRank[r] || 0).filter(Boolean);
  if (!allowedRanks.length) return <Navigate to="/unauthorized" replace />;

  const minRequired = Math.min(...allowedRanks);
  if (userRank >= minRequired) return children;
  return <Navigate to="/unauthorized" replace />;
}
