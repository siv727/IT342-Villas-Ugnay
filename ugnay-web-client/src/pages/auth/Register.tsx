import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import { Input, PasswordInput, TextArea, FileUpload } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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

  const [form, setForm] = useState({
    businessName: '',
    role: 'Vendor',
    email: '',
    password: '',
    address: '',
    permitName: '',
    type: 'Retail',
    category: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const result = await register({
      email: form.email,
      password: form.password,
      businessName: form.businessName,
      businessAddress: form.address,
      role: form.role,
      ...(form.role === 'Vendor' ? { type: form.type } : { category: form.category }),
    });

    if (result.success) {
      toast.success('Account created! Please log in.', { duration: 4000 });
      navigate('/login');
    } else {
      toast.error(result.error || 'Registration failed');
      setLoading(false);
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

            <TextArea
              label="Business Address"
              placeholder="Enter your business address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              rows={3}
            />

            <FileUpload
              label="Business Permit"
              accept=".pdf,.jpeg,.jpg,.png"
              fileName={form.permitName}
              onChange={(f) => set('permitName', f.name)}
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

          <Button variant="secondary" fullWidth>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>

          <p className="text-sm text-center text-neutral-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
