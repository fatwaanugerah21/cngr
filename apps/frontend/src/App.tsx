import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
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
import ComingSoonPage from './pages/ComingSoonPage';
import SiteManagementPage from './pages/SiteManagementPage';
import ProductionPage from './pages/ProductionPage';
import ProductionFormPage from './pages/ProductionFormPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'site-management', element: <SiteManagementPage /> },
      { path: 'user-management', element: <ComingSoonPage /> },
      { path: 'production', element: <ProductionPage /> },
      { path: 'production/add', element: <ProductionFormPage /> },
      { path: 'issue', element: <ComingSoonPage /> },
      { path: 'laporan', element: <ReportPage /> },
      { path: 'laporan/upload', element: <ReportFormPage /> },
      { path: 'laporan/edit/:id', element: <ReportFormPage /> },
      { path: 'dokumen', element: <DocumentPage /> },
      { path: 'dokumen/upload', element: <DocumentFormPage /> },
      { path: 'dokumen/edit/:id', element: <DocumentFormPage /> },
      { path: 'peraturan', element: <RulePage /> },
      { path: 'peraturan/upload', element: <RuleFormPage /> },
      { path: 'peraturan/edit/:id', element: <RuleFormPage /> },
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
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
