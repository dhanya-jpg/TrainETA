import React, { useState } from 'react';
import { 
  Train, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Phone,
  Ticket,
  Flame,
  KeyRound
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { signInUser, signUpUser, signInWithGoogle } from '../../services/firebase';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  defaultRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess,
  defaultRole = 'PASSENGER' 
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  
  // Shared & Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [pnrOrTicket, setPnrOrTicket] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Switch role helper
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    // If switching to operator while on signup mode, automatically switch to signin mode
    if (role === 'OPERATOR' && authMode === 'signup') {
      setAuthMode('signin');
    }
  };

  // Quick autofill helper for Operator
  const autofillOperator = () => {
    setEmail('trainoperator@gmail.com');
    setPassword('eta161739');
    setSelectedRole('OPERATOR');
    setAuthMode('signin');
    setErrorMessage(null);
  };

  // Quick autofill helper for Commuter
  const autofillPassenger = () => {
    setEmail('commuter@smarteta.in');
    setPassword('pass1234');
    setName('Aarav Sharma');
    setSelectedRole('PASSENGER');
    setErrorMessage(null);
  };

  // Handle Form Submit (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (authMode === 'signup') {
      if (selectedRole === 'OPERATOR') {
        setErrorMessage('Operator portal is sign-in only. Registration is blocked.');
        return;
      }
      if (!cleanName) {
        setErrorMessage('Please provide your full name for user registration.');
        return;
      }
      if (cleanPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters for Firebase security.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const res = await signInUser(cleanEmail, cleanPassword, selectedRole);
        setIsSubmitting(false);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        // Sign Up (Passenger only)
        const res = await signUpUser(
          cleanEmail,
          cleanPassword,
          cleanName,
          'PASSENGER',
          {
            phone: phone.trim(),
            pnrOrTicket: pnrOrTicket.trim()
          }
        );
        setIsSubmitting(false);
        if (res.success && res.user) {
          setSuccessMessage('Account registered successfully! Redirecting...');
          setTimeout(() => {
            if (res.user) onLoginSuccess(res.user);
          }, 600);
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage('A network error occurred. Please try again.');
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    const res = await signInWithGoogle(selectedRole);
    setIsGoogleSubmitting(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Google Sign-in failed or was cancelled.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">SMART ETA</span>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                FIREBASE CLOUD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Indian Railways Dynamic Train ETA & Delay Intelligence
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            FIREBASE CONNECTED (smart-eta-9966c)
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
          
          {/* Sign In vs Sign Up Tab Toggle */}
          <div className="flex items-center justify-center p-1 bg-slate-950/90 rounded-2xl border border-slate-800/90 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                // If operator is active, auto switch to passenger for sign up
                if (selectedRole === 'OPERATOR') {
                  setSelectedRole('PASSENGER');
                }
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-5">
            <button
              type="button"
              onClick={() => handleSelectRole('PASSENGER')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedRole === 'PASSENGER'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('OPERATOR')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedRole === 'OPERATOR'
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Operator Portal</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Sign-in Only</span>
            </button>
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {selectedRole === 'OPERATOR' ? (
                <Shield className="w-5 h-5 text-blue-400" />
              ) : (
                <User className="w-5 h-5 text-emerald-400" />
              )}
              <span>
                {selectedRole === 'OPERATOR' 
                  ? 'Railway Operator Control Room Sign In' 
                  : (authMode === 'signin' ? 'Sign In to Commuter Portal' : 'Register for Commuter Portal')}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {selectedRole === 'OPERATOR'
                ? 'Authorized Railway Section Controller credentials required (trainoperator@gmail.com).'
                : (authMode === 'signin'
                    ? 'Authenticate to access real-time telemetry, live train ETA predictions, and saved alerts.'
                    : 'Create your passenger account to store train alerts, favorites, and live trip tracking.')}
            </p>
          </div>

          {/* Notice when on Operator Portal */}
          {selectedRole === 'OPERATOR' && (
            <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-200 text-xs flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="leading-snug">
                <span><strong>Operator Portal is Sign-In Only:</strong> Registration is restricted to authorized personnel. Sign up is disabled for operators.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign-in Option for Passenger Portal */}
          {selectedRole === 'PASSENGER' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 border border-slate-200"
              >
                {/* Official Google SVG Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isGoogleSubmitting
                    ? 'Connecting with Google...'
                    : authMode === 'signin'
                    ? 'Sign in with Google'
                    : 'Sign up with Google'}
                </span>
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Or continue with email
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name (Sign Up only - Passenger) */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {selectedRole === 'OPERATOR' ? 'Operator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedRole === 'OPERATOR' ? 'Operator Password' : 'Password'}
                </label>
                {authMode === 'signup' && (
                  <span className="text-[10px] text-slate-500 font-mono">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>
            )}

            {/* Additional Fields for Passenger Sign Up */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone / Contact (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    PNR / Ticket (Optional)
                  </label>
                  <div className="relative">
                    <Ticket className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pnrOrTicket}
                      onChange={(e) => setPnrOrTicket(e.target.value)}
                      placeholder="e.g. 4829103948"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className={`w-full py-3 text-white font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  selectedRole === 'OPERATOR'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>Processing Authentication...</span>
                ) : (
                  <>
                    <span>
                      {selectedRole === 'OPERATOR' 
                        ? 'Authenticate Operator' 
                        : (authMode === 'signin' ? 'Sign In & Access' : 'Create Commuter Account')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-semibold text-[11px]">Quick Credentials:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={autofillPassenger}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Passenger Demo
              </button>
              <button
                type="button"
                onClick={autofillOperator}
                className="px-2.5 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Operator (Official)
              </button>
            </div>
          </div>

          {/* Toggle between Sign In & Sign Up Prompt (Passenger Only) */}
          {selectedRole === 'PASSENGER' && (
            <div className="mt-3 text-center text-xs text-slate-400">
              {authMode === 'signin' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </p>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer System Telemetry Status */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 z-10">
        <div className="flex items-center gap-3">
          <span>Western Railway Mumbai Division</span>
          <span>•</span>
          <span>Firebase Project: <strong className="text-slate-300 font-mono">smart-eta-9966c</strong></span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>SECURE FIRESTORE PERSISTENCE ENABLED</span>
        </div>
      </footer>
    </div>
  );
};
