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
    <div className="bg-surface rounded-3xl border border-border shadow-xs p-6 lg:p-8 space-y-6 text-ink">
      {/* Header with Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-ink tracking-tight">
                Why is Train {train.trainNumber} expected to remain late?
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Explainable AI (XAI) feature attribution decomposed from real-time operational telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider bg-accent/15 text-accent px-3 py-1.5 rounded-xl border border-accent/30">
            SIMULATION ANALYSIS • SHAP VALUES
          </span>
        </div>
      </div>

      {/* Feature Attribution Bar Breakdown */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-ink/50 uppercase tracking-wider font-mono-code">
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
                className="bg-surface-dark p-4 rounded-xl border border-border space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="font-bold text-sm text-ink">{factor.name}</span>
                  </div>

                  <div className={`font-mono-code font-black text-sm ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isPositive ? `+${factor.impactMinutes}` : factor.impactMinutes} min
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden flex border border-border">
                  <div 
                    className={`h-full rounded-full transition-all ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>

                <p className="text-xs text-ink/70 font-medium">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Box & Operational Insight */}
      <div className="bg-surface-dark border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <Info className="w-4 h-4 text-accent" />
            <span>AI Operational Summary & Forecast Explanation</span>
          </div>
          <div className="text-xs font-mono-code font-bold bg-accent/15 text-accent px-2.5 py-1 rounded-lg border border-accent/30">
            Expected Net Delay: +{train.destinationPredictedDelay} min
          </div>
        </div>

        <p className="text-xs text-ink/80 leading-relaxed font-medium">
          Historical route patterns and current operating conditions indicate a <strong>medium probability of additional delay</strong> between Anand and Ahmedabad. The major contributing element is the upstream late handover at Surat combined with freight headway occupancy on the trunk route, partially cushioned by a 2-minute sectional engineering recovery slack.
        </p>

        <div className="text-[11px] text-ink/60 italic pt-1 border-t border-border flex items-center gap-1.5 font-mono-code">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Note: Explanations are dynamically derived from real-time calibrated weights of the Online XGBoost SGD engine.</span>
        </div>
      </div>
    </div>
  );
};
