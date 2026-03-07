import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Input, PasswordInput } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login({ email, password });

    if (result.success) {
      navigate(result.role === 'vendor' ? '/vendor/dashboard' : '/manufacturer/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">Ugnay</h1>
          <p className="text-lg text-white/80 mb-2">
            B2B Supply Chain Platform
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Connecting Filipino vendors and manufacturers. Discover products, request samples,
            and track your supply chain end-to-end.
          </p>
          <div className="mt-12 flex gap-8 text-white/40 text-sm">
            <div><span className="block text-2xl font-bold text-white/80">500+</span> Manufacturers</div>
            <div><span className="block text-2xl font-bold text-white/80">2,000+</span> Products</div>
            <div><span className="block text-2xl font-bold text-white/80">10k+</span> Transactions</div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">Ugnay</h1>
            <p className="text-sm text-neutral-400">B2B Supply Chain Platform</p>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h2>
          <p className="text-sm text-neutral-400 mb-6">Sign in to your account</p>

          {/* Error banner */}
          {error && (
            <div className="mb-4 bg-[#FEE2E2] border-l-4 border-error rounded-r-lg px-4 py-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right mt-1">
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-xs text-neutral-400">or continue with</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          {/* Google */}
          <Button variant="secondary" fullWidth>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-sm text-center text-neutral-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
