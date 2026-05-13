import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleRank = { resident: 1, staff: 2, department_admin: 3, super_admin: 4 };

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;

  const userRank = roleRank[profile.role] || 0;
  const allowedRanks = allowedRoles.map(r => roleRank[r] || 0);
  const maxAllowed = allowedRanks.length ? Math.max(...allowedRanks) : 0;

  if (userRank >= maxAllowed) return children;
  return <Navigate to="/unauthorized" replace />;
}
