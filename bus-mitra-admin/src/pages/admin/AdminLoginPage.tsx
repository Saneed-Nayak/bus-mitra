import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Bus,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  const from = (location.state as any)?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message?.includes('401') || err?.message?.includes('Invalid')
        ? 'Invalid username or password. Please check your credentials.'
        : 'Connection failed. Please ensure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Bus className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          Bus Mitra Admin Portal
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-400">
          Karnataka State Road Transport Operations & Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl border border-slate-800 rounded-3xl sm:px-10">
          {/* Security Badge Header */}
          <div className="mb-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Authorized Personnel Only</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              MongoDB Atlas
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username or Official Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@busmitra.com"
                  autoComplete="username"
                  required
                  className="block w-full pl-10 pr-3.5 py-3 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating…</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-Fill Credentials Panel for 2 Default Admins */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-3">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Default Admin Accounts</span>
            </div>

            <div className="space-y-2">
              {/* Super Admin Quick Fill */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@BusMitra2026')}
                className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-red-500/50 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      Super Admin (Chief Transport Officer)
                    </span>
                  </div>
                  <span className="text-[10px] text-red-400 font-mono">Use Account →</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 pl-4 flex gap-3 font-mono">
                  <span>User: admin</span>
                  <span>Pass: Admin@BusMitra2026</span>
                </div>
              </button>

              {/* Operations Admin Quick Fill */}
              <button
                type="button"
                onClick={() => handleQuickFill('ops_admin', 'Ops@BusMitra2026')}
                className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      Operations Admin (Divisional Controller)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Use Account →</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 pl-4 flex gap-3 font-mono">
                  <span>User: ops_admin</span>
                  <span>Pass: Ops@BusMitra2026</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Restricted to Authorized KSRTC / NWKRTC Transit Officers</span>
        </p>
      </div>
    </div>
  );
};
