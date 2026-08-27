import React from 'react';
import { 
  Train, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30 font-mono">
              DYNAMIC RAILWAY ETA PROTOTYPE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            SMART ETA – Dynamic Train ETA & Delay Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 leading-relaxed">
            AI-powered Expected Time of Arrival & Delay Forecasting for Coaching Trains. Moving beyond basic GPS tracking to dynamic physics + machine learning forecasting.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar text-xs">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Key System Pillars
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Station-by-Station Dynamic ETA</span>
              </div>
              <p className="text-slate-500 font-medium leading-normal">
                Predicts ETA dynamically at every upcoming station with 90% confidence intervals and risk scoring.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>Explainable AI (XAI)</span>
              </div>
              <p className="text-slate-500 font-medium leading-normal">
                Explains exact reasons behind predicted delays (traffic, TSR, halt slack, weather).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>What-If Scenario Simulation</span>
              </div>
              <p className="text-slate-500 font-medium leading-normal">
                Simulates speed changes, signal priority, and green corridor dispatch outcomes.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <Map className="w-4 h-4 text-emerald-600" />
                <span>Delay Propagation Flow</span>
              </div>
              <p className="text-slate-500 font-medium leading-normal">
                Detects inter-train headway compression and cascading section bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Featured Consist: <strong>Train 12901 (Gujarat Mail)</strong>
          </div>

          <button
            onClick={() => {
              onClose();
              onExploreDemo();
            }}
            className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Launch Live Control Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
