import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useStore from '../store/useStore';

export default function MainLayout() {
  const { isAuthenticated, sidebarOpen } = useStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
