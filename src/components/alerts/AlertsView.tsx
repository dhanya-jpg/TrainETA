import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Train, 
  Trash2, 
} from 'lucide-react';
import { RailwayAlert } from '../../types';

interface AlertsViewProps {
  alerts: RailwayAlert[];
  onDismissAlert: (id: string) => void;
  onSelectTrainByNumber: (trainNumber: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onDismissAlert,
  onSelectTrainByNumber
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6 text-ink">
      {/* Top Banner */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                Live Track & Section Alerts
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Real-time operational notifications, speed cautions, weather hazards, and headway compressions.
              </p>
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-colors cursor-pointer border ${
                severityFilter === sev
                  ? 'bg-accent text-on-accent border-accent shadow-xs'
                  : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-surface p-8 rounded-3xl border border-border text-center text-xs text-ink/60 font-medium">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No active alerts matching your filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`bg-surface p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  isCritical
                    ? 'border-accent/40 bg-accent/5'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-surface-dark text-ink/80 border border-border'
                  }`}>
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-accent text-on-accent'
                          : isWarning
                          ? 'bg-amber-500 text-on-accent'
                          : 'bg-surface-dark text-ink border border-border'
                      }`}>
                        {alert.severity}
                      </span>
                      <h4 className="font-bold text-sm text-ink">
                        {alert.title}
                      </h4>
                      <span className="text-[11px] text-ink/50 font-mono-code">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-ink/70 font-medium">
                      {alert.message}
                    </p>

                    <div className="text-[11px] text-ink/60 font-medium flex items-center gap-3 pt-1">
                      <span>Section: <strong className="text-ink font-mono-code">{alert.section}</strong></span>
                      {alert.trainNumber && (
                        <span>Impacted Train: <strong className="text-accent font-mono-code">{alert.trainNumber}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {alert.trainNumber && (
                    <button
                      onClick={() => onSelectTrainByNumber(alert.trainNumber!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 transition-colors cursor-pointer"
                    >
                      <Train className="w-3.5 h-3.5" />
                      <span>Inspect Train</span>
                    </button>
                  )}
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-2 rounded-xl text-ink/50 hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
