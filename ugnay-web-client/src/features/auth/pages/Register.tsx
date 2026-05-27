import { useState, useRef, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import useAuthStore from '../../../features/auth/store';
import { Input, PasswordInput, FileUpload } from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import PsgcDropdowns, { type PsgcSelection } from '../../../shared/components/ui/PsgcDropdowns';
import { uploadFile } from '../../../features/file-upload/api';
import axiosClient from '../../../shared/api/axiosClient';

function getPasswordStrength(pw: string) {
  if (!pw) return { level: 0, label: '', color: '' };
  if (pw.length < 8) return { level: 1, label: 'Weak', color: 'bg-error' };
  const mixed = /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  if (mixed) return { level: 3, label: 'Strong', color: 'bg-success' };
  return { level: 2, label: 'Moderate', color: 'bg-highlight' };
}

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [form, setForm] = useState({
    businessName: '',
    role: 'Vendor',
    email: '',
    password: '',
    permitName: '',
    type: 'Retail',
    category: '',
    streetAddress: '',
  });
  const [psgcSelection, setPsgcSelection] = useState<PsgcSelection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const permitFileRef = useRef<File | null>(null);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.role === 'Manufacturer' && !form.category.trim()) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBlur = (field: string) => {
    const e = { ...errors };
    if (field === 'businessName' && !form.businessName.trim()) e.businessName = 'Business name is required';
    if (field === 'email') {
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
      else delete e.email;
    }
    if (field === 'password' && form.password && form.password.length < 8) e.password = 'Minimum 8 characters';
    setErrors(e);
  };

  const buildFullAddress = () => {
    const parts = [];
    if (form.streetAddress.trim()) parts.push(form.streetAddress.trim());
    if (psgcSelection?.fullAddress) parts.push(psgcSelection.fullAddress);
    return parts.join(', ');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const result = await register({
      email: form.email,
      password: form.password,
      businessName: form.businessName,
      businessAddress: buildFullAddress(),
      role: form.role,
      ...(form.role === 'Vendor' ? { type: form.type } : { category: form.category }),
      regionCode: psgcSelection?.regionCode,
      provinceCode: psgcSelection?.provinceCode,
      cityCode: psgcSelection?.cityCode,
      barangayCode: psgcSelection?.barangayCode,
      streetAddress: form.streetAddress.trim(),
    });

    if (result.success) {
      // Upload business permit file if one was selected
      if (permitFileRef.current && result.role) {
        try {
          const userId = Number(localStorage.getItem('userId'));
          const uploaded = await uploadFile(permitFileRef.current, 'BUSINESS_PERMIT');
          // Update user profile with the permit URL
          await axiosClient.put(`/api/user/${userId}`, {
            businessPermit: uploaded.url,
          });
        } catch (err) {
          console.error('Permit upload failed:', err);
          // Don't block registration — permit can be uploaded later
        }
      }
      toast.success('Account created!', { duration: 4000 });
      navigate(result.role === 'vendor' ? '/vendor/dashboard' : '/manufacturer/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setGoogleLoading(true);
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error('No credential received from Google');

      const result = await loginWithGoogle(idToken);

      if (result.needsRole) {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        const params = new URLSearchParams({
          token: idToken,
          email: payload.email || '',
          name: payload.name || '',
        });
        navigate(`/complete-profile?${params.toString()}`);
      } else if (result.success) {
        toast.success('Signed in with Google!');
        navigate(result.role === 'vendor' ? '/vendor/dashboard' : '/manufacturer/dashboard');
      } else {
        toast.error(result.error || 'Google sign-up failed');
      }
    } catch {
      toast.error('Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">Ugnay</h1>
          <p className="text-lg text-white/80 mb-2">Join the Platform</p>
          <p className="text-sm text-white/60 leading-relaxed">
            Create your business account and start connecting with vendors and manufacturers across the Philippines.
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

          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Create Account</h2>
          <p className="text-sm text-neutral-400 mb-6">Set up your business profile</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Business Name"
              placeholder="Your Business Name"
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              onBlur={() => handleBlur('businessName')}
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

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
            />

            <div>
              <PasswordInput
                label="Password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={errors.password}
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.level / 3) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    strength.level === 1 ? 'text-error' : strength.level === 2 ? 'text-warning' : 'text-success'
                  }`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* PSGC Address Dropdowns */}
            <PsgcDropdowns onChange={setPsgcSelection} />

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
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-xs text-neutral-400">or</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          {/* Google Sign-Up */}
          <div className="flex justify-center">
            {googleLoading ? (
              <div className="w-full py-3 flex items-center justify-center border border-neutral-200 rounded-xl">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-up was cancelled.')}
                width="340"
                text="signup_with"
                shape="rectangular"
                size="large"
                locale="en"
              />
            )}
          </div>

          <p className="text-sm text-center text-neutral-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
