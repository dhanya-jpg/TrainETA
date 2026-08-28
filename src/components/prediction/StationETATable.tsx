import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
} from 'lucide-react';
import { TrainData } from '../../types';

interface StationETATableProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

export const StationETATable: React.FC<StationETATableProps> = ({ train, onSelectStation }) => {
  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden text-ink shadow-xs">
      {/* Table Header with Context */}
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-display text-ink tracking-tight">
              Station-by-Station Dynamic ETA & Delay Forecast
            </h3>
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
              PHYSICS + ML RESIDUAL
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-0.5 font-medium">
            Dynamic station ETA predictions generated from real-time speed, headway, signal aspect, and historical halt slack.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-code font-bold text-ink/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>On Time / Departed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderate Delay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
            <span>High Delay Risk</span>
          </div>
        </div>
      </div>

      {/* Responsive Station Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-dark border-b border-border text-ink/60 font-mono-code font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 pl-6 pr-4">Route & Station</th>
              <th className="py-3.5 px-4">Scheduled Arrival</th>
              <th className="py-3.5 px-4">Predicted ETA</th>
              <th className="py-3.5 px-4">Predicted Delay</th>
              <th className="py-3.5 px-4">Confidence & Range</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pr-6 pl-4 text-right">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-medium">
            {train.stops.map((stop, idx) => {
              const isCurrent = stop.status === 'CURRENT';
              const isNext = stop.status === 'NEXT';
              const isDeparted = stop.status === 'DEPARTED';

              return (
                <tr 
                  key={stop.stationCode}
                  onClick={() => onSelectStation?.(stop.stationCode)}
                  className={`transition-colors cursor-pointer ${
                    isCurrent 
                      ? 'bg-accent/10 hover:bg-accent/15 font-bold' 
                      : isNext 
                      ? 'bg-amber-500/10 hover:bg-amber-500/15' 
                      : isDeparted 
                      ? 'bg-surface-dark/40 hover:bg-surface-dark text-ink/60' 
                      : 'hover:bg-surface-dark'
                  }`}
                >
                  {/* Station & Timeline Column */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Vertical Route Dot / Icon */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono-code font-bold text-[11px] shadow-xs ${
                          isDeparted 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : isCurrent 
                            ? 'bg-accent text-on-accent ring-4 ring-accent/20 animate-pulse' 
                            : isNext 
                            ? 'bg-amber-500 text-on-accent' 
                            : 'bg-surface-dark text-ink/80 border border-border'
                        }`}>
                          {isDeparted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                          <span>{stop.stationName}</span>
                          <span className="text-ink/60 font-mono-code text-[11px] font-bold">({stop.stationCode})</span>
                        </div>
                        <div className="text-[11px] text-ink/60 font-medium">
                          {stop.distanceKm} km • Avg Halt: {stop.historicalAvgHaltMins} min
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Scheduled Arrival */}
                  <td className="py-4 px-4 font-mono-code text-xs text-ink/80">
                    <div>
                      <strong className="text-ink">{stop.scheduledArrival}</strong>
                      <span className="text-[10px] text-ink/60 block">Dep: {stop.scheduledDeparture}</span>
                    </div>
                  </td>

                  {/* Predicted ETA */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span className="font-mono-code font-bold text-sm text-accent">
                        {stop.predictedArrival}
                      </span>
                    </div>
                    <span className="text-[10px] text-ink/60 block font-mono-code">
                      Dep: {stop.predictedDeparture}
                    </span>
                  </td>

                  {/* Predicted Delay */}
                  <td className="py-4 px-4 font-mono-code">
                    {stop.predictedDelayMinutes === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        On Time (0 min)
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        stop.predictedDelayMinutes > 15
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : stop.predictedDelayMinutes > 5
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        +{stop.predictedDelayMinutes} min
                      </span>
                    )}
                  </td>

                  {/* Confidence Score & 90% Window */}
                  <td className="py-4 px-4 font-mono-code">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-ink/80">Confidence</span>
                        <span className="font-bold text-accent">{stop.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-dark rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${stop.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ink/60 block">
                        Range: {stop.etaRange}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 font-mono-code">
                    {isDeparted && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-dark text-ink/80 border border-border">
                        Departed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-accent text-on-accent shadow-xs animate-pulse">
                        Current Station
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-on-accent">
                        Next Station
                      </span>
                    )}
                    {stop.status === 'UPCOMING' && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-dark text-ink/70 border border-border">
                        Upcoming
                      </span>
                    )}
                  </td>

                  {/* Platform */}
                  <td className="py-4 pr-6 pl-4 text-right">
                    <span className="font-mono-code font-bold text-xs text-ink bg-surface-dark px-2 py-1 rounded-lg border border-border">
                      PF {stop.platform}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
