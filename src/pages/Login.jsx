import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Mail, Lock, MoveVertical, Loader2, Eye, EyeOff } from 'lucide-react';

function FloorIndicator() {
  const floors = [12, 11, 10, 9, 8];
  const [active, setActive] = useState(2);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % floors.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-1 bottom-1 w-px bg-slate-700/60" />
      <div className="flex flex-col gap-3 relative">
        {floors.map((floor, i) => (
          <div key={floor} className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === active ? 'bg-amber-500 shadow-[0_0_8px_2px_rgba(217,119,6,0.6)]' : 'bg-slate-700'
              }`}
            />
            <span
              className={`font-['IBM_Plex_Mono'] text-xs tabular-nums transition-all duration-500 ${
                i === active ? 'text-amber-500 font-semibold' : 'text-slate-600'
              }`}
            >
              {floor.toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (res.data.user.role === 'worker') {
        navigate('/worker-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-['Inter']">
      {/* Brand Panel */}
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
            Every call answered.
            <br />
            Every floor accounted for.
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xs">
            Real-time ticketing and dispatch for elevator service teams.
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <FloorIndicator />
          <div className="hidden lg:block text-right font-['IBM_Plex_Mono'] text-[11px] tracking-widest text-slate-500">
            SYSTEM STATUS
            <br />
            <span className="text-emerald-400">● OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-sm">
          <span className="text-[11px] font-['IBM_Plex_Mono'] tracking-[0.2em] text-amber-600 uppercase">
            Access Panel
          </span>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900 mt-2">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">
            Sign in to manage your tickets and dispatches.
          </p>

          {error && (
            <div className="mb-5 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            New to LiftFlow?{' '}
            <Link to="/register" className="text-amber-600 font-semibold hover:text-amber-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}