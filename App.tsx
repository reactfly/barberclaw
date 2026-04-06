import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './src/pages/LandingPage';
import { Marketplace } from './src/pages/Marketplace';
import { BarbershopProfile } from './src/pages/BarbershopProfile';
import { AdminDashboard } from './src/pages/AdminDashboard';
import { AdminStaff } from './src/pages/AdminStaff';
import { AdminCalendar } from './src/pages/AdminCalendar';
import { AdminCustomers } from './src/pages/AdminCustomers';
import { AdminSettings } from './src/pages/AdminSettings';
import { Onboarding } from './src/pages/Onboarding';
import { Login } from './src/pages/Login';
import { Register } from './src/pages/Register';
import { CustomerDashboard } from './src/pages/CustomerDashboard';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import { PlatformAdminDashboard } from './src/pages/admin-platform/PlatformAdminDashboard';
import { PlatformAdminModuleScreen } from './src/pages/admin-platform/PlatformAdminModuleScreen';
import { PlatformAwareAdminPage } from './src/pages/admin-platform/PlatformAwareAdminPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* B2C Routes */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/b/:slug" element={<BarbershopProfile />} />
        <Route
          path="/painel"
          element={
            <ProtectedRoute mode="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* B2B Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute mode="onboarding">
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAwareAdminPage platform={<PlatformAdminDashboard />} shop={<AdminDashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAwareAdminPage platform={<PlatformAdminModuleScreen forcedModule="bookings" />} shop={<AdminCalendar />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAwareAdminPage platform={<PlatformAdminModuleScreen forcedModule="customers" />} shop={<AdminCustomers />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAwareAdminPage platform={<PlatformAdminModuleScreen forcedModule="professionals" />} shop={<AdminStaff />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAwareAdminPage platform={<PlatformAdminModuleScreen forcedModule="settings" />} shop={<AdminSettings />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/:module"
          element={
            <ProtectedRoute mode="admin">
              <PlatformAdminModuleScreen />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute mode="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
