// import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Mail, MoveVertical, Loader2, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
            Locked out?
            <br />
            Let's get you back in.
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xs">
            We'll email you a verification code to reset your password.
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
            Forgot password
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">
            Enter your email and we'll send you a verification code.
          </p>

          {error && (
            <div className="mb-5 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending code
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  Send verification code
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Remembered it?{' '}
            <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}