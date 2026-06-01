import { Outlet } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import SiteProvider from '../../lib/site-provider';
import UserDirectoryProvider from '../../lib/user-directory-provider';
import RequireAdminSelectedSite from './RequireAdminSelectedSite';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <SiteProvider>
      <UserDirectoryProvider>
        <RequireAdminSelectedSite />
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main
            className="ml-64 flex min-h-screen flex-1 flex-col overflow-auto"
            style={{ backgroundColor: COLORS.backgroundGray }}
          >
            <Outlet />
          </main>
        </div>
      </UserDirectoryProvider>
    </SiteProvider>
  );
}
