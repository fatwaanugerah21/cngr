import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiteDashboardPage from './pages/SiteDashboardPage';
import ReportPage from './pages/ReportPage';
import ReportFormPage from './pages/ReportFormPage';
import DocumentPage from './pages/DocumentPage';
import DocumentFormPage from './pages/DocumentFormPage';
import RulePage from './pages/RulePage';
import RuleFormPage from './pages/RuleFormPage';
import AccountAreaLayout from './components/layout/AccountAreaLayout';
import UserAccountPage from './pages/account/UserAccountPage';
import UserAccountEditPage from './pages/account/UserAccountEditPage';
import AccountSecurityPage from './pages/account/AccountSecurityPage';
import LogoutPage from './pages/LogoutPage';
import SiteManagementPage from './pages/SiteManagementPage';
import ProductionPage from './pages/ProductionPage';
import ProductionFormPage from './pages/ProductionFormPage';
import LandOpeningPage from './pages/LandOpeningPage';
import LandOpeningFormPage from './pages/LandOpeningFormPage';
import ReclamationPage from './pages/ReclamationPage';
import ReclamationFormPage from './pages/ReclamationFormPage';
import UserManagementPage from './pages/UserManagementPage';
import UserManagementFormPage from './pages/UserManagementFormPage';
import AuthProvider from './lib/auth-provider';
import { useAuth } from './lib/auth-context';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Memuat sesi...</p>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'site-dashboard', element: <SiteDashboardPage /> },
      { path: 'site-management', element: <SiteManagementPage /> },
      { path: 'user-management', element: <UserManagementPage /> },
      { path: 'user-management/add', element: <UserManagementFormPage /> },
      { path: 'user-management/edit/:id', element: <UserManagementFormPage /> },
      { path: 'production', element: <ProductionPage /> },
      { path: 'production/add', element: <ProductionFormPage /> },
      { path: 'land-opening', element: <LandOpeningPage /> },
      { path: 'land-opening/add', element: <LandOpeningFormPage /> },
      { path: 'land-opening/edit/:id', element: <LandOpeningFormPage /> },
      { path: 'reclamation', element: <ReclamationPage /> },
      { path: 'reclamation/add', element: <ReclamationFormPage /> },
      { path: 'report', element: <ReportPage /> },
      { path: 'report/upload', element: <ReportFormPage /> },
      { path: 'report/edit/:id', element: <ReportFormPage /> },
      { path: 'document', element: <DocumentPage /> },
      { path: 'document/upload', element: <DocumentFormPage /> },
      { path: 'document/edit/:id', element: <DocumentFormPage /> },
      { path: 'rules', element: <RulePage /> },
      { path: 'rules/upload', element: <RuleFormPage /> },
      { path: 'rules/edit/:id', element: <RuleFormPage /> },
      {
        path: 'account',
        element: <AccountAreaLayout />,
        children: [
          { index: true, element: <Navigate to="user" replace /> },
          { path: 'user', element: <UserAccountPage /> },
          { path: 'user/edit', element: <UserAccountEditPage /> },
          { path: 'security', element: <AccountSecurityPage /> },
        ],
      },
      { path: 'logout', element: <LogoutPage /> },
    ],
  },
  { path: '*', element: <AuthFallbackRedirect /> },
]);

function AuthFallbackRedirect() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  const to = isAuthenticated ? '/dashboard' : '/login';
  return <Navigate to={to} replace />;
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
