import React from 'react';
import { 
  Network, 
  AlertTriangle, 
  ArrowDown, 
  ArrowRight, 
  Train, 
  ShieldAlert, 
  Zap, 
  CheckCircle2,
  GitFork,
  Radio
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-8 space-y-6">
      {/* Header with Cascade Warning */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Inter-Train Delay Propagation & Headway Cascade
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Downstream impact analysis: How primary block delays spill over into trailing express consists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>DOWNSTREAM CASCADE DETECTED</span>
          </span>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-900">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold block text-sm">Bottleneck Warning: {data.sectionName}</strong>
          <span className="font-medium text-red-800">{data.downstreamWarning}</span>
        </div>
      </div>

      {/* Node / Flow Diagram */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
          Cascade Propagation Flow Diagram
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Node 1: Lead Train (12901) */}
          <div 
            onClick={() => onSelectTrain?.('12901')}
            className="flex-1 bg-blue-50/60 hover:bg-blue-50 border-2 border-blue-500 rounded-2xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                LEAD TRAIN
              </span>
              <span className="font-mono font-black text-base text-red-600">+12 min</span>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">Train 12901</div>
              <div className="text-xs text-slate-500 font-medium">Gujarat Mail (Down)</div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-blue-100 space-y-1">
              <div><strong>Block Section:</strong> Nadiad – Anand Track 1</div>
              <div><strong>Status:</strong> Section Headway Lead</div>
            </div>
          </div>

          {/* Transfer Connector 1 */}
          <div className="flex lg:flex-col items-center justify-center gap-1 text-slate-400">
            <div className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 text-center">
              Transfers +7m
            </div>
            <ArrowRight className="w-5 h-5 text-amber-500 hidden lg:block" />
            <ArrowDown className="w-5 h-5 text-amber-500 lg:hidden" />
          </div>

          {/* Node 2: Impacted Train 1 (12902) */}
          <div 
            onClick={() => onSelectTrain?.('12902')}
            className="flex-1 bg-amber-50/60 hover:bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white">
                IMPACTED DIRECT
              </span>
              <span className="font-mono font-black text-base text-amber-600">+18 min</span>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">Train 12902</div>
              <div className="text-xs text-slate-500 font-medium">Gujarat Mail (Up)</div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-amber-100 space-y-1">
              <div><strong>Block Section:</strong> Vadodara Outers</div>
              <div><strong>Headway:</strong> 4.8 min (Compressed)</div>
            </div>
          </div>

          {/* Transfer Connector 2 */}
          <div className="flex lg:flex-col items-center justify-center gap-1 text-slate-400">
            <div className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 text-center">
              Transfers +4m
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-500 hidden lg:block" />
            <ArrowDown className="w-5 h-5 text-indigo-500 lg:hidden" />
          </div>

          {/* Node 3: Impacted Train 2 (19034) */}
          <div 
            onClick={() => onSelectTrain?.('19034')}
            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl p-5 shadow-xs cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-700 text-white">
                IMPACTED SECONDARY
              </span>
              <span className="font-mono font-black text-base text-indigo-600">+5 min</span>
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900">Train 19034</div>
              <div className="text-xs text-slate-500 font-medium">Gujarat Queen</div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 space-y-1">
              <div><strong>Block Section:</strong> Anand Station Loop</div>
              <div><strong>Headway:</strong> 9.2 min</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Dispatch Recommendations */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>AI Operational Dispatch Recommendation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
              1. Dynamic Loop Line Precedence
            </span>
            <p className="text-slate-300 leading-relaxed">
              Route Train 19034 through Anand Platform 3 loop line to allow Lead Train 12901 clear through line clearance without further signal braking.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              2. Vadodara Interlocking Priority
            </span>
            <p className="text-slate-300 leading-relaxed">
              Grant Advance Starter clearance to Train 12902 at 11:38 to prevent +7 min headway transfer to the approaching trunk express.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
