import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, Users, User, Package,
  ClipboardList, Truck, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const vendorNav = [
  { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vendor/discover', icon: Search, label: 'Discover' },
  { to: '/vendor/requests', icon: FileText, label: 'My Requests' },
  { to: '/vendor/connections', icon: Users, label: 'My Connections' },
  { to: '/vendor/profile', icon: User, label: 'Profile' },
];

const manufacturerNav = [
  { to: '/manufacturer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manufacturer/products', icon: Package, label: 'My Products' },
  { to: '/manufacturer/requests', icon: ClipboardList, label: 'Requests' },
  { to: '/manufacturer/shipments', icon: Truck, label: 'Shipments' },
  { to: '/manufacturer/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = user?.role === 'manufacturer' ? manufacturerNav : vendorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary z-40 flex flex-col transition-all duration-250 ease-in-out
        ${collapsed ? 'w-16' : 'w-[260px]'}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        {!collapsed && (
          <h1 className="text-white font-bold text-xl tracking-tight">Ugnay</h1>
        )}
        {collapsed && (
          <h1 className="text-white font-bold text-xl mx-auto">U</h1>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group relative
              ${isActive
                ? 'bg-primary-dark text-white border-l-[3px] border-accent'
                : 'text-white/80 hover:bg-primary-dark/50 hover:text-white border-l-[3px] border-transparent'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-primary-dark/50 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary-dark rounded-full items-center justify-center text-white shadow-md hover:bg-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
