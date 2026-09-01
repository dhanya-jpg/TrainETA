import React, { useState } from 'react';
import { Shield, Lock, Mail, X, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthUser } from '../../types';
import { authenticateWithFirebase } from '../../services/firebase';

interface OperatorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (operatorUser: AuthUser) => void;
}

export const OperatorAuthModal: React.FC<OperatorAuthModalProps> = ({
  isOpen,
  onClose,
  onVerifySuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authenticateWithFirebase(email, password, 'OPERATOR');
      setIsSubmitting(false);

      if (result.success && result.user) {
        onVerifySuccess(result.user);
      } else {
        setError(result.error || 'Access Denied: Invalid Operator credentials.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError('Operator verification error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-7 text-ink z-10 animate-scale-in">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent border border-accent/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-ink uppercase">Operator Access Restricted</h3>
              <p className="text-xs text-ink/60 font-mono-code">Railway Section Controller Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink/40 hover:text-ink hover:bg-surface-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            The Operator Console controls live interlocking signals, what-if simulations, and dispatch telemetry. Official Railway Controller credentials required.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-mono-code font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1 font-mono-code">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainoperator@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:border-accent transition-colors font-mono-code"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1 font-mono-code">
              Operator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-dark border border-border rounded-xl text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:border-accent font-mono-code transition-colors"
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

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-surface-dark hover:bg-surface text-ink border border-border font-bold font-mono-code text-[10px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 bg-accent hover:opacity-90 text-on-accent font-bold font-mono-code text-[10px] uppercase tracking-widest rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Checking...</span>
              ) : (
                <>
                  <span>Authorize</span>
                  <ArrowRight className="w-3.5 h-3.5 text-on-accent" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
