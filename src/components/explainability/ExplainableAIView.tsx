import React from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Sparkles,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { TrainData } from '../../types';

interface ExplainableAIViewProps {
  train: TrainData;
}

export const ExplainableAIView: React.FC<ExplainableAIViewProps> = ({ train }) => {
  const factors = train.explainability;

  // Calculate sum of positive impact and negative recovery
  const totalPositive = factors.filter((f) => f.impactMinutes > 0).reduce((acc, f) => acc + f.impactMinutes, 0);
  const totalNegative = factors.filter((f) => f.impactMinutes < 0).reduce((acc, f) => acc + f.impactMinutes, 0);
  const netAdditionalDelay = totalPositive + totalNegative;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-8 space-y-6">
      {/* Header with Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Why is Train {train.trainNumber} expected to remain late?
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Explainable AI (XAI) feature attribution decomposed from real-time operational telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
            SIMULATION ANALYSIS • SHAP VALUES
          </span>
        </div>
      </div>

      {/* Feature Attribution Bar Breakdown */}
      <div className="space-y-4">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
          Primary Delay Contributing Factors & Sectional Slack
        </div>

        <div className="space-y-3.5">
          {factors.map((factor) => {
            const isPositive = factor.impactMinutes > 0;
            const maxAbs = Math.max(...factors.map((f) => Math.abs(f.impactMinutes)), 10);
            const barWidthPercent = Math.min(100, Math.round((Math.abs(factor.impactMinutes) / maxAbs) * 100));

            return (
              <div 
                key={factor.id} 
                className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="font-extrabold text-sm text-slate-900">{factor.name}</span>
                  </div>

                  <div className={`font-mono font-black text-sm ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isPositive ? `+${factor.impactMinutes}` : factor.impactMinutes} min
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full transition-all ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Box & Operational Insight */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>AI Operational Summary & Forecast Explanation</span>
          </div>
          <div className="text-xs font-mono font-black bg-indigo-200/60 text-indigo-900 px-2.5 py-1 rounded-lg">
            Expected Net Delay: +{train.destinationPredictedDelay} min
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Historical route patterns and current operating conditions indicate a <strong>medium probability of additional delay</strong> between Anand and Ahmedabad. The major contributing element is the upstream late handover at Surat combined with freight headway occupancy on the trunk route, partially cushioned by a 2-minute sectional engineering recovery slack.
        </p>

        <div className="text-[11px] text-slate-500 italic pt-1 border-t border-indigo-100 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Note: Explanations are derived from the feature importance weights of the XGBoost dynamic residual model.</span>
        </div>
      </div>
    </div>
  );
};
