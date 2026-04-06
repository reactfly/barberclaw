import { Suspense, lazy } from 'react';
import { Loader2, Scissors } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';

const LandingPage = lazy(async () => ({ default: (await import('./src/pages/LandingPage')).LandingPage }));
const Marketplace = lazy(async () => ({ default: (await import('./src/pages/Marketplace')).Marketplace }));
const BarbershopProfile = lazy(async () => ({ default: (await import('./src/pages/BarbershopProfile')).BarbershopProfile }));
const AdminDashboard = lazy(async () => ({ default: (await import('./src/pages/AdminDashboard')).AdminDashboard }));
const AdminStaff = lazy(async () => ({ default: (await import('./src/pages/AdminStaff')).AdminStaff }));
const AdminCalendar = lazy(async () => ({ default: (await import('./src/pages/AdminCalendar')).AdminCalendar }));
const AdminCustomers = lazy(async () => ({ default: (await import('./src/pages/AdminCustomers')).AdminCustomers }));
const AdminSettings = lazy(async () => ({ default: (await import('./src/pages/AdminSettings')).AdminSettings }));
const Onboarding = lazy(async () => ({ default: (await import('./src/pages/Onboarding')).Onboarding }));
const Login = lazy(async () => ({ default: (await import('./src/pages/Login')).Login }));
const Register = lazy(async () => ({ default: (await import('./src/pages/Register')).Register }));
const CustomerDashboard = lazy(async () => ({ default: (await import('./src/pages/CustomerDashboard')).CustomerDashboard }));
const PlatformAdminDashboard = lazy(async () => ({
  default: (await import('./src/pages/admin-platform/PlatformAdminDashboard')).PlatformAdminDashboard,
}));
const PlatformAdminModuleScreen = lazy(async () => ({
  default: (await import('./src/pages/admin-platform/PlatformAdminModuleScreen')).PlatformAdminModuleScreen,
}));
const PlatformAwareAdminPage = lazy(async () => ({
  default: (await import('./src/pages/admin-platform/PlatformAwareAdminPage')).PlatformAwareAdminPage,
}));

const RouteLoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050505] px-6 text-center text-slate-100">
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400/10">
      <Scissors className="h-8 w-8 text-lime-300" />
    </div>
    <Loader2 className="h-7 w-7 animate-spin text-lime-300" />
    <div>
      <p className="text-lg font-semibold text-white">Carregando BarberFlow</p>
      <p className="mt-2 text-sm text-slate-400">Preparando a proxima tela com carregamento sob demanda.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<RouteLoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute mode="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
