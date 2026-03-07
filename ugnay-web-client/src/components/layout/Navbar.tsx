import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, User, LogOut } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = 'U';

  return (
    <header className="h-16 bg-primary-dark sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-white font-bold text-lg lg:hidden">Ugnay</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-white/80 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-primary-dark" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center hover:ring-2 hover:ring-white/30 transition-all"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1 z-55">
              <button
                onClick={() => { navigate(`/${user?.role}/profile`); setDropdownOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <hr className="my-1 border-neutral-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
