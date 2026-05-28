import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SiteProvider from '../../lib/site-provider';
import UserDirectoryProvider from '../../lib/user-directory-provider';

export default function AppLayout() {
  return (
    <SiteProvider>
      <UserDirectoryProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="ml-64 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </UserDirectoryProvider>
    </SiteProvider>
  );
}
