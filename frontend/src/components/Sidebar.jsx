import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, PenSquare, BarChart3, User,
  ShieldAlert, X, PlusCircle
} from 'lucide-react';
import useStore from '../store/useStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/products/add', icon: PlusCircle, label: 'Add Product' },
  { to: '/review/submit', icon: PenSquare, label: 'Write Review' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/moderation', icon: ShieldAlert, label: 'Moderation' },
];

export default function Sidebar() {
  const { user, sidebarOpen, toggleSidebar } = useStore();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-neo-dark-card border-r-4 border-neo-text dark:border-white/20 pt-20 md:pt-4 px-3 pb-4 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${sidebarOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden md:border-0 md:px-0'}`}>
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 md:hidden p-1"
        >
          <X size={20} />
        </button>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="border-t-3 border-neo-text dark:border-white/20 my-4" />
              <p className="px-4 text-xs font-black opacity-40 uppercase tracking-wider mb-2">Admin</p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
