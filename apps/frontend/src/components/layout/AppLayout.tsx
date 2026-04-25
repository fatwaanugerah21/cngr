import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
