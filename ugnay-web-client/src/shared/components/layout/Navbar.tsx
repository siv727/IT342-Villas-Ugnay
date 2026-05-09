import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, MapPin, Building2 } from 'lucide-react';
import useAuthStore from '../../../features/auth/store';
import { getUserProfile, type UserProfile } from '../../../features/profile/api';
import { ConfirmModal } from '../ui/Modal';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  // Fetch user profile when dropdown opens
  useEffect(() => {
    if (!user?.userId) return;
    const fetchProfile = async () => {
      try {
        const p = await getUserProfile(user.userId);
        setProfile(p);
      } catch { /* ignore */ }
    };
    fetchProfile();
  }, [user?.userId]);

  const handleLogout = async () => {
    setSignOutOpen(false);
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = profile?.businessName?.charAt(0) || (user?.role === 'manufacturer' ? 'M' : 'V');
  const roleName = user?.role === 'manufacturer' ? 'Manufacturer' : 'Vendor';
  const businessName = profile?.businessName || (user?.role === 'manufacturer' ? 'My Manufacturer' : 'My Business');

  return (
    <>
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
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center hover:ring-2 hover:ring-white/30 transition-all"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-3 z-55">
                {/* Profile details inline */}
                <div className="px-4 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{businessName}</p>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-light text-accent font-medium capitalize">
                        <Building2 className="h-3 w-3" />
                        {roleName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <MapPin className="h-3 w-3" />
                    <span>{profile?.businessAddress || `User #${user?.userId}`}</span>
                  </div>
                </div>

                {/* Profile link */}
                <button
                  onClick={() => { navigate(`/${user?.role}/profile`); setDropdownOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Building2 className="h-4 w-4" /> View Profile
                </button>

                <hr className="my-1 border-neutral-100" />

                {/* Sign out with confirmation */}
                <button
                  onClick={() => setSignOutOpen(true)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-neutral-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign out confirmation */}
      <ConfirmModal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        description="Are you sure you want to sign out? You will need to log in again to access your account."
        confirmLabel="Sign Out"
        variant="danger"
      />
    </>
  );
}
