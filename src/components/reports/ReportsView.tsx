import React from 'react';
import { 
  FileText, 
  Cpu, 
  Database, 
  Server, 
  Code2, 
  Layers, 
  CheckCircle2, 
  Network, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                System Architecture, Pipeline & Engineering Specs
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive technical specification of the SMART ETA dynamic machine learning framework.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1.5 rounded-xl">
            DYNAMIC ML ARCHITECTURE
          </span>
        </div>
      </div>

      {/* Core Innovation Pipeline: 5 Pillars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
          Core Innovation Workflow: Track → Predict → Explain → Simulate → Recommend
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'TRACK', desc: 'Real-time GPS / RTIS stream, speed, signal aspect, and section occupancy.', color: 'border-blue-500 bg-blue-50/50 text-blue-900' },
            { step: '02', title: 'PREDICT', desc: 'Physics-informed XGBoost model dynamic ETA forecast at every upcoming stop.', color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900' },
            { step: '03', title: 'EXPLAIN', desc: 'XAI decomposition (SHAP attribution) detailing delay drivers and slack.', color: 'border-violet-500 bg-violet-50/50 text-violet-900' },
            { step: '04', title: 'SIMULATE', desc: 'What-If operator scenario simulator testing speed, TSR, and green corridors.', color: 'border-amber-500 bg-amber-50/50 text-amber-900' },
            { step: '05', title: 'RECOMMEND', desc: 'Active dispatch resolution recommendations preventing inter-train cascade.', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900' },
          ].map((s) => (
            <div key={s.step} className={`p-4 rounded-xl border-l-4 shadow-xs ${s.color} space-y-1.5`}>
              <div className="flex items-center justify-between font-mono font-black text-xs">
                <span>{s.step}</span>
                <span className="font-extrabold">{s.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Tech Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Feature Engineering Vector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              ML Feature Vector Schema (24 Variables)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div><strong>Kinematic:</strong> [current_speed_kmh, distance_to_next_km, prev_section_acceleration]</div>
              <div><strong>Temporal:</strong> [day_of_week, scheduled_departure_sin, scheduled_departure_cos]</div>
              <div><strong>Traffic & Signaling:</strong> [preceding_headway_km, signal_aspect_code, loop_line_diverge]</div>
              <div><strong>Infrastructure:</strong> [tsr_speed_restriction_active, track_gradient_permille]</div>
              <div><strong>Historical:</strong> [station_avg_halt_delta_30d, sectional_recovery_slack_mins]</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Trained on multi-million row historical logs from Western Railway (WR) and Northern Railway (NR) mainlines with cross-validation.
          </p>
        </div>

        {/* REST API & Backend Architecture */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              FastAPI + PostgreSQL Architecture
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto">
              <div className="text-emerald-400">POST /api/v1/predict-eta</div>
              <div className="text-slate-400 text-[10px] pl-4">→ Body: &#123; train_id, speed, current_delay, section_id &#125;</div>
              <div className="text-blue-400">POST /api/v1/simulate-what-if</div>
              <div className="text-slate-400 text-[10px] pl-4">→ Body: &#123; speed_delta_pct, halt_delta, priority &#125;</div>
              <div className="text-amber-400">GET /api/v1/trains/stream</div>
              <div className="text-slate-400 text-[10px] pl-4">→ SSE Live Real-Time Telemetry Feed</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Engineered for high-throughput sub-25ms inference latency, horizontally scalable for full Indian Railways network operations.
          </p>
        </div>
      </div>
    </div>
  );
};
