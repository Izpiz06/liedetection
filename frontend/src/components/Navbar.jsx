import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sun, Moon, Menu, LogOut, User } from 'lucide-react';
import useStore from '../store/useStore';

export default function Navbar() {
  const { user, isAuthenticated, darkMode, toggleDarkMode, logout, toggleSidebar } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-neo-dark-card border-b-4 border-neo-text dark:border-white/20 px-4 md:px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button onClick={toggleSidebar} className="md:hidden p-2">
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-neo-yellow border-3 border-neo-text dark:border-white/30 rounded-lg flex items-center justify-center shadow-neo-sm dark:shadow-neo-dark-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
              <Shield size={22} className="text-neo-text" />
            </div>
            <span className="font-black text-xl hidden sm:block">ReviewShield<span className="text-neo-blue"> AI</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 border-3 border-neo-text dark:border-white/30 hover:bg-neo-yellow/20 transition-all rounded-lg"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 border-3 border-neo-text dark:border-white/30 hover:bg-neo-purple/20 transition-all rounded-lg font-bold text-sm"
              >
                <User size={16} />
                <span className="hidden sm:inline">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 border-3 border-neo-text dark:border-white/30 hover:bg-neo-red/20 transition-all rounded-lg"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="neo-btn-blue text-sm !px-4 !py-2">Login</Link>
              <Link to="/register" className="neo-btn-yellow text-sm !px-4 !py-2 hidden sm:inline-block">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
