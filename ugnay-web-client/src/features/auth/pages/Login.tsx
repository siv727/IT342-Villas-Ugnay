import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import useAuthStore from '../../../features/auth/store';
import { Input, PasswordInput } from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        throw new Error('No credential received from Google');
      }

      const result = await loginWithGoogle(idToken);

      if (result.needsRole) {
        // New user — redirect to profile completion page
        // Decode basic info from the JWT for display purposes
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
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
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

          {/* Google Sign-In */}
          <div className="flex justify-center">
            {googleLoading ? (
              <div className="w-full py-3 flex items-center justify-center border border-neutral-200 rounded-xl">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled.')}
                width="340"
                text="signin_with"
                shape="rectangular"
                size="large"
                locale="en"
              />
            )}
          </div>

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
