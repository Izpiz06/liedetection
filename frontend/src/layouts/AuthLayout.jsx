import { Outlet, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import useStore from '../store/useStore';
import Navbar from '../components/Navbar';

export default function AuthLayout() {
  const { isAuthenticated } = useStore();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
