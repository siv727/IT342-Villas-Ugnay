import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Lock, Save, Camera } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input, PasswordInput, TextArea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  // Change password modal
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      toast.success('Profile updated');
      setSaving(false);
    }, 1000);
  };

  const handlePasswordChange = () => {
    setPwError('');
    if (!pw.current || !pw.newPw || !pw.confirm) {
      setPwError('All fields are required');
      return;
    }
    if (pw.newPw.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPwOpen(false);
    setPw({ current: '', newPw: '', confirm: '' });
  };

  const initials = (form.businessName || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Profile & Settings</h1>

      <Card className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left — avatar 30% */}
        <div className="lg:w-[30%] flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <button className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 text-center">
            {form.businessName || `User #${user?.userId}`}
          </h2>
          <span className="text-xs px-3 py-1 rounded-full bg-primary-light text-primary font-medium capitalize">
            {user?.role || 'vendor'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPwOpen(true)}
            className="mt-2"
          >
            <Lock className="h-4 w-4" /> Change Password
          </Button>
        </div>

        {/* Right — form 70% */}
        <form onSubmit={handleSave} className="flex-1 space-y-5">
          <Input
            label="Business Name"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+63 900 000 0000"
          />
          <TextArea
            label="Business Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
          />
          <div className="pt-2">
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          {pwError && (
            <p className="text-sm text-danger">{pwError}</p>
          )}
          <PasswordInput
            label="Current Password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
          />
          <PasswordInput
            label="New Password"
            value={pw.newPw}
            onChange={(e) => setPw({ ...pw, newPw: e.target.value })}
          />
          <PasswordInput
            label="Confirm New Password"
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
