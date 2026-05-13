import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ children }) {
  const status = useAuthStore(state => state.status);
  const profile = useAuthStore(state => state.profile);

  if (status === 'loading') return <LoadingScreen message="Loading secure workspace" />;
  if (!profile) return <Navigate to="/login" replace />;
  return children;
}
