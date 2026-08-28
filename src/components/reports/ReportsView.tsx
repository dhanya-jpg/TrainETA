import React from 'react';
import { 
  FileText, 
  Cpu, 
  Server, 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6 text-ink">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                System Architecture, Pipeline & Engineering Specs
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Comprehensive technical specification of the SMART ETA dynamic machine learning framework.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code font-bold bg-accent text-on-accent px-3 py-1.5 rounded-xl">
            DYNAMIC ML ARCHITECTURE
          </span>
        </div>
      </div>

      {/* Core Innovation Pipeline: 5 Pillars */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
        <span className="text-xs font-bold text-ink uppercase tracking-wider block font-mono-code">
          Core Innovation Workflow: Track → Predict → Explain → Simulate → Recommend
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'TRACK', desc: 'Real-time GPS / RTIS stream, speed, signal aspect, and section occupancy.', color: 'border-accent bg-accent/10 text-ink' },
            { step: '02', title: 'PREDICT', desc: 'Physics-informed XGBoost model dynamic ETA forecast at every upcoming stop.', color: 'border-blue-500 bg-blue-500/10 text-ink' },
            { step: '03', title: 'EXPLAIN', desc: 'XAI decomposition (SHAP attribution) detailing delay drivers and slack.', color: 'border-purple-500 bg-purple-500/10 text-ink' },
            { step: '04', title: 'SIMULATE', desc: 'What-If operator scenario simulator testing speed, TSR, and green corridors.', color: 'border-amber-500 bg-amber-500/10 text-ink' },
            { step: '05', title: 'RECOMMEND', desc: 'Active dispatch resolution recommendations preventing inter-train cascade.', color: 'border-emerald-500 bg-emerald-500/10 text-ink' },
          ].map((s) => (
            <div key={s.step} className={`p-4 rounded-xl border-l-4 shadow-xs border border-border ${s.color} space-y-1.5`}>
              <div className="flex items-center justify-between font-mono-code font-bold text-xs">
                <span>{s.step}</span>
                <span className="font-extrabold">{s.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium text-ink/80">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Tech Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Feature Engineering Vector */}
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Cpu className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono-code">
              ML Feature Vector Schema (24 Variables)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-surface-dark p-3.5 rounded-xl border border-border font-mono-code text-[11px] text-ink/90 space-y-1.5">
              <div><strong className="text-accent">Kinematic:</strong> [current_speed_kmh, distance_to_next_km, prev_section_acceleration]</div>
              <div><strong className="text-accent">Temporal:</strong> [day_of_week, scheduled_departure_sin, scheduled_departure_cos]</div>
              <div><strong className="text-accent">Traffic & Signaling:</strong> [preceding_headway_km, signal_aspect_code, loop_line_diverge]</div>
              <div><strong className="text-accent">Infrastructure:</strong> [tsr_speed_restriction_active, track_gradient_permille]</div>
              <div><strong className="text-accent">Historical:</strong> [station_avg_halt_delta_30d, sectional_recovery_slack_mins]</div>
            </div>
          </div>

          <p className="text-[11px] text-ink/60 font-medium">
            Trained on multi-million row historical logs from Western Railway (WR) and Northern Railway (NR) mainlines with cross-validation.
          </p>
        </div>

        {/* REST API & Backend Architecture */}
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Server className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono-code">
              FastAPI + PostgreSQL Architecture
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-surface-dark text-ink p-3.5 rounded-xl border border-border font-mono-code text-[11px] space-y-1.5 overflow-x-auto">
              <div className="text-emerald-500 font-bold">POST /api/v1/predict-eta</div>
              <div className="text-ink/60 text-[10px] pl-4">→ Body: &#123; train_id, speed, current_delay, section_id &#125;</div>
              <div className="text-accent font-bold">POST /api/v1/simulate-what-if</div>
              <div className="text-ink/60 text-[10px] pl-4">→ Body: &#123; speed_delta_pct, halt_delta, priority &#125;</div>
              <div className="text-amber-500 font-bold">GET /api/v1/trains/stream</div>
              <div className="text-ink/60 text-[10px] pl-4">→ SSE Live Real-Time Telemetry Feed</div>
            </div>
          </div>

          <p className="text-[11px] text-ink/60 font-medium">
            Engineered for high-throughput sub-25ms inference latency, horizontally scalable for full Indian Railways network operations.
          </p>
        </div>
      </div>
    </div>
  );
};
