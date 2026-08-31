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
  KeyRound,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { signInUser, signUpUser, signInWithGoogle } from '../../services/firebase';
import { AmbientBackground } from '../layout/AmbientBackground';
import { motion } from 'motion/react';

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
    if (role === 'OPERATOR') {
      setAuthMode('signin');
    }
  };

  // Handle Form Submit
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
        setErrorMessage('Password must be at least 6 characters.');
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
          setSuccessMessage('Account created successfully! Redirecting...');
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
    try {
      const res = await signInWithGoogle(selectedRole);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Google Sign-in was cancelled or encountered an error.');
      }
    } catch (err: any) {
      console.warn('Google auth handling error:', err);
      setErrorMessage('Google Sign-in encountered a sandbox delay. Please use Email Registration or Instant Access.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Quick Demo Passenger Login
  const handleQuickPassengerLogin = () => {
    const quickUser: AuthUser = {
      uid: 'commuter-' + Math.random().toString(36).substring(2, 9),
      email: 'traveler@smarteta.in',
      role: 'PASSENGER',
      name: 'Verified Commuter',
      department: 'Commuter / Live Traveler Portal',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onLoginSuccess(quickUser);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-transparent text-ink flex flex-col justify-between selection:bg-accent selection:text-on-accent relative">
      <AmbientBackground />
      {/* Top Header Bar */}
      <header className="w-full border-b border-border bg-surface/40 px-6 sm:px-10 py-5 flex items-center justify-between z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="font-display font-extrabold text-xl tracking-tight flex items-center gap-1.5 text-ink">
            <span>SMART ETA</span>
          </div>
          <span className="hidden sm:inline-block font-mono-code text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-surface text-ink font-bold border border-border">
            PLATFORM AUTH
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-xs font-mono-code font-bold text-ink">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-ink/50">FIRESTORE:</span>
            <span className="text-accent">CONNECTED</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 my-4">
        <motion.div 
          initial={{ opacity: 0, y: 20, rotateX: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="w-full max-w-lg bg-surface/90 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-9 relative space-y-6 shadow-2xl"
        >
          
          {/* Header & Meta */}
          <div>
            <div className="font-mono-code text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-1">
              AUTHENTICATION & ACCESS
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-ink leading-tight uppercase">
              {selectedRole === 'OPERATOR' 
                ? 'Operator Portal.' 
                : (authMode === 'signin' ? 'Welcome Back.' : 'Create Account.')}
            </h1>
            <p className="text-xs text-ink/60 font-medium mt-2">
              {selectedRole === 'OPERATOR'
                ? 'Authorized railway section controller credentials required.'
                : (authMode === 'signin'
                    ? 'Authenticate to access real-time train ETA, telemetry & delay models.'
                    : 'Register for live trip tracking, saved journeys, and delay alerts.')}
            </p>
          </div>

          {/* Role Switcher Pill */}
          <div className="bg-surface-dark p-1 rounded-2xl border border-border flex items-center text-xs">
            <button
              type="button"
              onClick={() => handleSelectRole('PASSENGER')}
              className={`flex-1 py-2 px-3 rounded-xl font-mono-code text-[11px] uppercase tracking-wider font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'PASSENGER'
                  ? 'bg-accent text-on-accent shadow-xs'
                  : 'text-ink/60 hover:text-ink hover:bg-surface'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('OPERATOR')}
              className={`flex-1 py-2 px-3 rounded-xl font-mono-code text-[11px] uppercase tracking-wider font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'OPERATOR'
                  ? 'bg-accent text-on-accent shadow-xs'
                  : 'text-ink/60 hover:text-ink hover:bg-surface'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Operator</span>
              <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-black/20 text-white ml-1">
                Official
              </span>
            </button>
          </div>

          {/* Sign In vs Sign Up Tab Toggle (Passenger Only) */}
          {selectedRole === 'PASSENGER' && (
            <div className="flex items-center justify-center gap-4 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`font-mono-code text-xs uppercase tracking-widest font-bold pb-1 cursor-pointer transition-colors border-b-2 ${
                  authMode === 'signin'
                    ? 'text-accent border-accent'
                    : 'text-ink/40 border-transparent hover:text-ink'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`font-mono-code text-xs uppercase tracking-widest font-bold pb-1 cursor-pointer transition-colors border-b-2 ${
                  authMode === 'signup'
                    ? 'text-accent border-accent'
                    : 'text-ink/40 border-transparent hover:text-ink'
                }`}
              >
                New Registration
              </button>
            </div>
          )}

          {/* Operator Credentials Notice (Official Railway Access Only) */}
          {selectedRole === 'OPERATOR' && (
            <div className="p-3.5 bg-surface-dark border border-border rounded-xl text-ink text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-accent shrink-0" />
                <span className="font-medium">
                  Official Railway Controller:
                </span>
                <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
                  trainoperator@gmail.com
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('trainoperator@gmail.com');
                  setPassword('eta161739');
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-accent text-accent font-mono-code text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-accent/15 border border-accent/30 text-accent rounded-xl text-xs font-bold flex flex-col gap-2 font-mono-code">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {selectedRole === 'PASSENGER' && authMode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  className="self-start mt-1 px-3 py-1 bg-accent text-on-accent rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Click Here to Register this Email</span>
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2.5 font-mono-code">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign-in Option (PASSENGER ONLY - Removed for Operator) */}
          {selectedRole === 'PASSENGER' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full py-2.5 px-4 bg-surface hover:bg-surface-dark text-ink font-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 border border-border rounded-xl font-mono-code uppercase tracking-wider shadow-sm"
              >
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
                    ? 'Authenticating with Google...'
                    : authMode === 'signin'
                    ? 'Continue with Google'
                    : 'Sign up with Google'}
                </span>
              </button>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono-code font-bold text-ink/40 uppercase tracking-widest">
                  Or with email
                </span>
                <div className="flex-grow border-t border-border"></div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Signup */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div>
                <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border focus:border-accent rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block mb-1">
                {selectedRole === 'OPERATOR' ? 'Operator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in'}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border focus:border-accent rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block">
                  {selectedRole === 'OPERATOR' ? 'Password' : 'Password'}
                </label>
                {authMode === 'signup' && (
                  <span className="font-mono-code text-[9px] text-ink/40">Min 6 chars</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-dark border border-border focus:border-accent rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none transition-colors font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div>
                <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border focus:border-accent rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none transition-colors font-mono-code"
                  />
                </div>
              </div>
            )}

            {/* Optional Fields (Signup) */}
            {authMode === 'signup' && selectedRole === 'PASSENGER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-surface-dark border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono-code text-[10px] font-bold text-ink/50 uppercase tracking-widest block mb-1">
                    PNR / Ticket (Optional)
                  </label>
                  <div className="relative">
                    <Ticket className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pnrOrTicket}
                      onChange={(e) => setPnrOrTicket(e.target.value)}
                      placeholder="e.g. 4829103948"
                      className="w-full pl-9 pr-3 py-2 bg-surface-dark border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full py-3 bg-accent hover:opacity-90 text-on-accent font-mono-code font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-none shadow-sm"
              >
                {isSubmitting ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>
                      {selectedRole === 'OPERATOR' 
                        ? 'ENTER OPERATOR PORTAL' 
                        : (authMode === 'signin' ? 'SIGN IN' : 'COMPLETE REGISTRATION')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-on-accent" />
                  </>
                )}
              </button>

              {/* Instant Commuter Preview Access */}
              {selectedRole === 'PASSENGER' && (
                <button
                  type="button"
                  onClick={handleQuickPassengerLogin}
                  className="w-full py-2 bg-surface hover:bg-surface-dark border border-border text-ink/70 hover:text-ink font-mono-code text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Instant Guest Commuter Access</span>
                </button>
              )}
            </div>
          </form>

        </motion.div>
      </main>

      {/* Footer System Telemetry Status */}
      <footer className="w-full border-t border-border bg-surface/40 backdrop-blur-sm px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink/50 z-10">
        <div className="flex items-center gap-2 font-medium">
          <span>Western Railway Division</span>
          <span>•</span>
          <span className="font-mono-code text-[11px] text-ink/70">PROJECT: smart-eta-9966c</span>
        </div>
        <div className="font-mono-code text-[10px] uppercase tracking-wider font-bold text-accent">
          SECURE FIRESTORE PERSISTENCE ENABLED
        </div>
      </footer>
    </div>
  );
};
