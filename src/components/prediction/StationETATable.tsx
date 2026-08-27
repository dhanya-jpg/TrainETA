import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowDown, 
  Radio,
  Sparkles
} from 'lucide-react';
import { StationStop, TrainData } from '../../types';

interface StationETATableProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

export const StationETATable: React.FC<StationETATableProps> = ({ train, onSelectStation }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header with Context */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Station-by-Station Dynamic ETA & Delay Forecast
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              PHYSICS + ML RESIDUAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Dynamic station ETA predictions generated from real-time speed, headway, signal aspect, and historical halt slack.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>On Time / Departed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderate Delay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>High Delay Risk</span>
          </div>
        </div>
      </div>

      {/* Responsive Station Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 pl-6 pr-4">Route & Station</th>
              <th className="py-3.5 px-4">Scheduled Arrival</th>
              <th className="py-3.5 px-4">Predicted ETA</th>
              <th className="py-3.5 px-4">Predicted Delay</th>
              <th className="py-3.5 px-4">Confidence & Range</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pr-6 pl-4 text-right">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
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
                      ? 'bg-blue-50/70 hover:bg-blue-50 font-bold' 
                      : isNext 
                      ? 'bg-amber-50/40 hover:bg-amber-50/60' 
                      : isDeparted 
                      ? 'bg-slate-50/40 hover:bg-slate-50 text-slate-500' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Station & Timeline Column */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Vertical Route Dot / Icon */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs ${
                          isDeparted 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                            : isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse' 
                            : isNext 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isDeparted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                      </div>

                      <div>
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{stop.stationName}</span>
                          <span className="text-slate-500 font-mono text-[11px] font-bold">({stop.stationCode})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {stop.distanceKm} km • Avg Halt: {stop.historicalAvgHaltMins} min
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Scheduled Arrival */}
                  <td className="py-4 px-4 font-mono text-xs text-slate-700">
                    <div>
                      <strong className="text-slate-900">{stop.scheduledArrival}</strong>
                      <span className="text-[10px] text-slate-500 block">Dep: {stop.scheduledDeparture}</span>
                    </div>
                  </td>

                  {/* Predicted ETA */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono font-black text-sm text-blue-700">
                        {stop.predictedArrival}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Dep: {stop.predictedDeparture}
                    </span>
                  </td>

                  {/* Predicted Delay */}
                  <td className="py-4 px-4">
                    {stop.predictedDelayMinutes === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        On Time (0 min)
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        stop.predictedDelayMinutes > 15
                          ? 'bg-red-100 text-red-800'
                          : stop.predictedDelayMinutes > 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        +{stop.predictedDelayMinutes} min
                      </span>
                    )}
                  </td>

                  {/* Confidence Score & 90% Window */}
                  <td className="py-4 px-4">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-700">Confidence</span>
                        <span className="font-mono font-extrabold text-blue-700">{stop.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${stop.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Range: {stop.etaRange}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    {isDeparted && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Departed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-600 text-white shadow-xs animate-pulse">
                        Current Station
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white">
                        Next Station
                      </span>
                    )}
                    {stop.status === 'UPCOMING' && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">
                        Upcoming
                      </span>
                    )}
                  </td>

                  {/* Platform */}
                  <td className="py-4 pr-6 pl-4 text-right">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
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
