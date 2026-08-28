import React from 'react';
import { 
  ArrowRight, 
  Sliders, 
  BrainCircuit, 
  Clock, 
  Map,
  X
} from 'lucide-react';

interface LandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDemo: () => void;
}

export const LandingModal: React.FC<LandingModalProps> = ({
  isOpen,
  onClose,
  onExploreDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface max-w-2xl w-full rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] text-ink">
        {/* Header */}
        <div className="bg-surface-dark text-ink p-6 sm:p-8 relative border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-ink/50 hover:text-ink p-1 rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
              DYNAMIC RAILWAY ETA PROTOTYPE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-ink">
            SMART ETA – Dynamic Train ETA & Delay Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-ink/70 font-medium mt-2 leading-relaxed">
            AI-powered Expected Time of Arrival & Delay Forecasting for Coaching Trains. Moving beyond basic GPS tracking to dynamic physics + machine learning forecasting.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar text-xs">
          <div className="text-xs font-mono-code font-bold text-ink/50 uppercase tracking-wider">
            Key System Pillars
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-surface-dark rounded-2xl border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span>Station-by-Station Dynamic ETA</span>
              </div>
              <p className="text-ink/60 font-medium leading-normal">
                Predicts ETA dynamically at every upcoming station with 90% confidence intervals and risk scoring.
              </p>
            </div>

            <div className="p-3.5 bg-surface-dark rounded-2xl border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <BrainCircuit className="w-4 h-4 text-accent" />
                <span>Explainable AI (XAI)</span>
              </div>
              <p className="text-ink/60 font-medium leading-normal">
                Explains exact reasons behind predicted delays (traffic, TSR, halt slack, weather).
              </p>
            </div>

            <div className="p-3.5 bg-surface-dark rounded-2xl border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>What-If Scenario Simulation</span>
              </div>
              <p className="text-ink/60 font-medium leading-normal">
                Simulates speed changes, signal priority, and green corridor dispatch outcomes.
              </p>
            </div>

            <div className="p-3.5 bg-surface-dark rounded-2xl border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <Map className="w-4 h-4 text-emerald-500" />
                <span>Delay Propagation Flow</span>
              </div>
              <p className="text-ink/60 font-medium leading-normal">
                Detects inter-train headway compression and cascading section bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-surface-dark border-t border-border flex items-center justify-between gap-4">
          <div className="text-[11px] text-ink/60 font-medium hidden sm:block">
            Featured Consist: <strong className="text-ink font-mono-code">Train 12901 (Gujarat Mail)</strong>
          </div>

          <button
            onClick={() => {
              onClose();
              onExploreDemo();
            }}
            className="w-full sm:w-auto py-3 px-6 bg-accent hover:opacity-90 text-on-accent rounded-xl font-mono-code font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Launch Live Control Dashboard</span>
            <ArrowRight className="w-4 h-4 text-on-accent" />
          </button>
        </div>
      </div>
    </div>
  );
};
