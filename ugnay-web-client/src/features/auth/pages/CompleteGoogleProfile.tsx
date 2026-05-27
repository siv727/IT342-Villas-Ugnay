import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../../features/auth/store';
import { Input, FileUpload } from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import PsgcDropdowns, { type PsgcSelection } from '../../../shared/components/ui/PsgcDropdowns';
import { uploadFile } from '../../../features/file-upload/api';
import axiosClient from '../../../shared/api/axiosClient';

export default function CompleteGoogleProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const googleToken = searchParams.get('token') || '';
  const googleEmail = searchParams.get('email') || '';
  const googleName = searchParams.get('name') || '';

  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [form, setForm] = useState({
    businessName: googleName,
    role: 'Vendor',
    type: 'Retail',
    category: '',
    permitName: '',
    streetAddress: '',
  });
  const [psgcSelection, setPsgcSelection] = useState<PsgcSelection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const permitFileRef = useRef<File | null>(null);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (form.role === 'Manufacturer' && !form.category.trim()) e.category = 'Category is required';
    if (!psgcSelection?.regionCode) e.address = 'Please select at least a region';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!googleToken) {
      toast.error('Google session expired. Please sign in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    const result = await loginWithGoogle(googleToken, form.role);

    if (result.success) {
      // Upload business permit file if one was selected
      if (permitFileRef.current && result.role) {
        try {
          const userId = Number(localStorage.getItem('userId'));
          const uploaded = await uploadFile(permitFileRef.current, 'BUSINESS_PERMIT');
          await axiosClient.put(`/api/user/${userId}`, {
            businessPermit: uploaded.url,
          });
        } catch (err) {
          console.error('Permit upload failed:', err);
        }
      }
      toast.success('Account created!');
      navigate(result.role === 'vendor' ? '/vendor/dashboard' : '/manufacturer/dashboard');
    } else {
      toast.error(result.error || 'Failed to complete registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">Ugnay</h1>
          <p className="text-lg text-white/80 mb-2">Almost There!</p>
          <p className="text-sm text-white/60 leading-relaxed">
            Complete your business profile to start connecting with vendors and manufacturers across the Philippines.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">Ugnay</h1>
            <p className="text-sm text-neutral-400">B2B Supply Chain Platform</p>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Complete Your Profile</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Signed in as <span className="font-medium text-neutral-700">{googleEmail}</span>
          </p>

          {/* Google avatar badge */}
          <div className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{googleName || 'Google Account'}</p>
              <p className="text-xs text-neutral-400">{googleEmail}</p>
            </div>
            <svg className="w-5 h-5 text-green-500 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Business Name"
              placeholder="Your Business Name"
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              error={errors.businessName}
            />

            {/* Role toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-neutral-700">Role</label>
              <div className="flex bg-neutral-100 rounded-lg p-1">
                {['Vendor', 'Manufacturer'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('role', r)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      form.role === r
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor type */}
            {form.role === 'Vendor' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-700">Vendor Type</label>
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  {['Retail', 'Food'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type', t)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        form.type === t
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manufacturer category */}
            {form.role === 'Manufacturer' && (
              <Input
                label="Category"
                placeholder="e.g. Food Products, Electronics"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                error={errors.category}
              />
            )}

            {/* PSGC Address Dropdowns */}
            <PsgcDropdowns onChange={setPsgcSelection} error={errors.address} />

            {/* Street / Additional Address Details */}
            <Input
              label="Street / Phase / Zone (Optional)"
              placeholder="e.g. 123 Rizal St., Phase 2, Zone 5"
              value={form.streetAddress}
              onChange={(e) => set('streetAddress', e.target.value)}
            />

            <FileUpload
              label="Business Permit"
              accept=".pdf,.jpeg,.jpg,.png"
              fileName={form.permitName}
              onChange={(f) => {
                set('permitName', f.name);
                permitFileRef.current = f;
              }}
            />

            <Button type="submit" fullWidth loading={loading}>
              Complete Registration
            </Button>
          </form>

          <p className="text-xs text-center text-neutral-400 mt-6">
            Wrong account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Go back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
