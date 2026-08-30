import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { Mail, Lock, MoveVertical, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { email, otp, password });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-['Inter']">
      <div className="relative lg:w-[42%] bg-[#0B1220] text-white px-8 py-10 lg:py-16 flex flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
            <MoveVertical size={16} className="text-amber-500" />
          </div>
          <span className="font-['Space_Grotesk'] text-lg tracking-tight font-semibold">LiftFlow</span>
        </div>
        <div className="relative z-10 hidden lg:block">
          <p className="font-['Space_Grotesk'] text-3xl xl:text-4xl leading-tight font-medium max-w-sm">
            Enter your code,
            <br />
            set a new password.
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xs">
            Check your inbox for the 6-digit verification code.
          </p>
        </div>
        <div className="relative z-10 text-right font-['IBM_Plex_Mono'] text-[11px] tracking-widest text-slate-500 hidden lg:block">
          SYSTEM STATUS
          <br />
          <span className="text-emerald-400">● OPERATIONAL</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-sm">
          <span className="text-[11px] font-['IBM_Plex_Mono'] tracking-[0.2em] text-amber-600 uppercase">
            Account Recovery
          </span>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900 mt-2">
            Reset password
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">
            {emailFromState
              ? `We sent a code to ${emailFromState}.`
              : 'Enter the code sent to your email.'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
              {success} Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!emailFromState && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Verification code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 tracking-[0.3em] text-center font-['IBM_Plex_Mono'] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Resetting
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}