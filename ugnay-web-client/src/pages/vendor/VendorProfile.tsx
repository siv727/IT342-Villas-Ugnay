import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Building2, FileText, Shield, LogOut, Lock, Camera } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { getUserProfile, type UserProfile } from '../../api/profileApi';
import sampleRequestApi from '../../api/sampleRequestApi';
import connectionApi from '../../api/connectionApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/Modal';
import { PasswordInput } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) return;
      try {
        const p = await getUserProfile(user.userId);
        setProfile(p);
      } catch { /* ignore */ }

      try {
        const res = await sampleRequestApi.getSampleRequests();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          setTotalRequests(body.data.items.length);
          setPendingRequests(body.data.items.filter((r: { status: string }) => r.status === 'PENDING').length);
        }
      } catch { /* ignore */ }

      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          setSavedCount(body.data.items.length);
        }
      } catch { /* ignore */ }
    };
    fetchData();
  }, [user?.userId]);

  const handleLogout = async () => {
    setSignOutOpen(false);
    await logout();
    navigate('/login');
  };

  const handlePasswordChange = () => {
    setPwError('');
    if (!pw.current || !pw.newPw || !pw.confirm) { setPwError('All fields are required'); return; }
    if (pw.newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (pw.newPw !== pw.confirm) { setPwError('Passwords do not match'); return; }
    toast.success('Password changed successfully');
    setPwOpen(false);
    setPw({ current: '', newPw: '', confirm: '' });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Profile</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile picture */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full bg-accent flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {profile?.businessName?.charAt(0) || 'V'}
            </div>
            <button
              type="button"
              className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Profile details */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">{profile?.businessName || 'Loading…'}</h2>
            <Badge status="connected" className="mb-3">
              <Building2 className="h-3 w-3" /> Vendor
            </Badge>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <dt className="text-xs text-neutral-400">Email</dt>
                  <dd className="text-neutral-900 font-medium">{profile?.email || '—'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <dt className="text-xs text-neutral-400">User ID</dt>
                  <dd className="text-neutral-900 font-medium font-mono">#{user?.userId}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <dt className="text-xs text-neutral-400">Business Address</dt>
                  <dd className="text-neutral-900 font-medium">{profile?.businessAddress || '—'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                <div>
                  <dt className="text-xs text-neutral-400">Role</dt>
                  <dd className="text-neutral-900 font-medium capitalize">{user?.role || 'vendor'}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totalRequests}</p>
          <p className="text-xs text-neutral-400 mt-1">Total Requests</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-highlight">{pendingRequests}</p>
          <p className="text-xs text-neutral-400 mt-1">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-accent">{savedCount}</p>
          <p className="text-xs text-neutral-400 mt-1">Saved Manufacturers</p>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Account Settings
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setPwOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border border-neutral-100"
          >
            <Lock className="h-4 w-4 text-neutral-400" />
            <span className="flex-1 text-left">Change Password</span>
            <span className="text-xs text-neutral-400">›</span>
          </button>
        </div>
      </Card>

      {/* Sign Out */}
      <Button
        variant="danger"
        fullWidth
        onClick={() => setSignOutOpen(true)}
        className="justify-center"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>

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

      {/* Change Password Modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          {pwError && <p className="text-sm text-danger">{pwError}</p>}
          <PasswordInput label="Current Password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <PasswordInput label="New Password" value={pw.newPw} onChange={(e) => setPw({ ...pw, newPw: e.target.value })} />
          <PasswordInput label="Confirm New Password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
