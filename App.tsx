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
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';

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
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <ProtectedRoute mode="admin">
              <AdminCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute mode="admin">
              <AdminCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute mode="admin">
              <AdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute mode="admin">
              <AdminSettings />
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
