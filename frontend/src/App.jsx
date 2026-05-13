import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useUiStore } from './store/uiStore';
import { AppShell } from './layouts/AppShell';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './pages/LandingPage';
import { EnhancedLandingPage } from './pages/EnhancedLandingPage';
import { LoginPage } from './pages/LoginPage';
import { EnhancedLoginPage } from './pages/EnhancedLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EnhancedRegisterPage } from './pages/EnhancedRegisterPage';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { EnhancedResidentDashboard } from './pages/EnhancedResidentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

function RoleHomeRedirect() {
  const profile = useAuthStore(state => state.profile);
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role === 'resident') return <Navigate to="/resident" replace />;
  if (profile.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/admin" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const bootstrap = useAuthStore(state => state.bootstrap);
  const status = useAuthStore(state => state.status);
  const initTheme = useUiStore(state => state.initTheme);

  useEffect(() => {
    bootstrap();
    initTheme();
  }, [bootstrap, initTheme]);

  if (status === 'loading') {
    return <LoadingScreen message="Initializing CivicConnect" />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '16px', background: 'var(--surface)', color: 'var(--text)' }
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<EnhancedLandingPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<EnhancedLoginPage />} />
            <Route path="/register" element={<EnhancedRegisterPage />} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RoleHomeRedirect />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["resident"]}>
                  <AppShell>
                    <EnhancedResidentDashboard />
                  </AppShell>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["staff", "department_admin", "super_admin"]}>
                  <AppShell>
                    <StaffDashboard />
                  </AppShell>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["department_admin", "super_admin"]}>
                  <AppShell>
                    <AdminDashboard />
                  </AppShell>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CreateTicketPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <TicketDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
