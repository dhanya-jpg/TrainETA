import React from 'react';
import { 
  Network, 
  AlertTriangle, 
  ArrowDown, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
} from 'lucide-react';
import { DelayPropagationState } from '../../types';
import { INITIAL_PROPAGATION_DATA } from '../../data/mockTrains';

interface DelayPropagationViewProps {
  data?: DelayPropagationState;
  onSelectTrain?: (trainNumber: string) => void;
}

export const DelayPropagationView: React.FC<DelayPropagationViewProps> = ({ 
  data = INITIAL_PROPAGATION_DATA,
  onSelectTrain 
}) => {
  return (
    <div className="bg-surface rounded-3xl border border-border shadow-xs p-6 lg:p-8 space-y-6 text-ink">
      {/* Header with Cascade Warning */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                Inter-Train Delay Propagation & Headway Cascade
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Downstream impact analysis: How primary block delays spill over into trailing express consists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-code font-bold uppercase px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-accent" />
            <span>DOWNSTREAM CASCADE DETECTED</span>
          </span>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="bg-accent/10 border border-accent/30 rounded-3xl p-4 flex items-start gap-3 text-xs text-ink">
        <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm text-ink">Bottleneck Warning: {data.sectionName}</strong>
          <span className="font-medium text-ink/80">{data.downstreamWarning}</span>
        </div>
      </div>

      {/* Node / Flow Diagram */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-mono-code font-bold text-ink/50 uppercase tracking-wider">
          Cascade Propagation Flow Diagram
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Node 1: Lead Train (12901) */}
          <div 
            onClick={() => onSelectTrain?.('12901')}
            className="flex-1 bg-surface-dark hover:bg-surface border-2 border-accent rounded-3xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-accent text-on-accent">
                LEAD TRAIN
              </span>
              <span className="font-mono-code font-bold text-base text-accent">+12 min</span>
            </div>

            <div>
              <div className="text-base font-bold text-ink">Train 12901</div>
              <div className="text-xs text-ink/60 font-medium">Gujarat Mail (Down)</div>
            </div>

            <div className="text-[11px] text-ink/70 pt-2 border-t border-border space-y-1">
              <div><strong>Block Section:</strong> Nadiad – Anand Track 1</div>
              <div><strong>Status:</strong> Section Headway Lead</div>
            </div>
          </div>

          {/* Transfer Connector 1 */}
          <div className="flex lg:flex-col items-center justify-center gap-1 text-ink/50">
            <div className="text-[10px] font-mono-code font-bold uppercase bg-surface-dark text-ink/70 px-2 py-1 rounded-md border border-border text-center">
              Transfers +7m
            </div>
            <ArrowRight className="w-5 h-5 text-accent hidden lg:block" />
            <ArrowDown className="w-5 h-5 text-accent lg:hidden" />
          </div>

          {/* Node 2: Impacted Train 1 (12902) */}
          <div 
            onClick={() => onSelectTrain?.('12902')}
            className="flex-1 bg-surface-dark hover:bg-surface border-2 border-amber-500/60 rounded-3xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-on-accent">
                IMPACTED DIRECT
              </span>
              <span className="font-mono-code font-bold text-base text-amber-500">+18 min</span>
            </div>

            <div>
              <div className="text-base font-bold text-ink">Train 12902</div>
              <div className="text-xs text-ink/60 font-medium">Gujarat Mail (Up)</div>
            </div>

            <div className="text-[11px] text-ink/70 pt-2 border-t border-border space-y-1">
              <div><strong>Block Section:</strong> Vadodara Outers</div>
              <div><strong>Headway:</strong> 4.8 min (Compressed)</div>
            </div>
          </div>

          {/* Transfer Connector 2 */}
          <div className="flex lg:flex-col items-center justify-center gap-1 text-ink/50">
            <div className="text-[10px] font-mono-code font-bold uppercase bg-surface-dark text-ink/70 px-2 py-1 rounded-md border border-border text-center">
              Transfers +4m
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500 hidden lg:block" />
            <ArrowDown className="w-5 h-5 text-blue-500 lg:hidden" />
          </div>

          {/* Node 3: Impacted Train 2 (19034) */}
          <div 
            onClick={() => onSelectTrain?.('19034')}
            className="flex-1 bg-surface-dark hover:bg-surface border border-border rounded-3xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-surface border border-border text-ink">
                IMPACTED SECONDARY
              </span>
              <span className="font-mono-code font-bold text-base text-blue-500">+5 min</span>
            </div>

            <div>
              <div className="text-base font-bold text-ink">Train 19034</div>
              <div className="text-xs text-ink/60 font-medium">Gujarat Queen</div>
            </div>

            <div className="text-[11px] text-ink/70 pt-2 border-t border-border space-y-1">
              <div><strong>Block Section:</strong> Anand Station Loop</div>
              <div><strong>Headway:</strong> 9.2 min</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Dispatch Recommendations */}
      <div className="bg-surface-dark text-ink rounded-3xl p-6 border border-border space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider font-mono-code">
          <Zap className="w-4 h-4" />
          <span>AI Operational Dispatch Recommendation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-surface p-3.5 rounded-xl border border-border space-y-1.5">
            <span className="font-bold text-amber-500 flex items-center gap-1.5">
              1. Dynamic Loop Line Precedence
            </span>
            <p className="text-ink/70 leading-relaxed">
              Route Train 19034 through Anand Platform 3 loop line to allow Lead Train 12901 clear through line clearance without further signal braking.
            </p>
          </div>

          <div className="bg-surface p-3.5 rounded-xl border border-border space-y-1.5">
            <span className="font-bold text-emerald-500 flex items-center gap-1.5">
              2. Vadodara Interlocking Priority
            </span>
            <p className="text-ink/70 leading-relaxed">
              Grant Advance Starter clearance to Train 12902 at 11:38 to prevent +7 min headway transfer to the approaching trunk express.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
