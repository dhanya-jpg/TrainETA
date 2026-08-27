import React from 'react';
import { 
  Radio, 
  Train, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Sliders, 
  Search,
  Activity,
  Zap
} from 'lucide-react';
import { TrainData } from '../../types';

interface RailwayControlViewProps {
  trains: TrainData[];
  selectedTrain: TrainData;
  onSelectTrain: (train: TrainData) => void;
  onOpenSimulation: (train: TrainData) => void;
}

export const RailwayControlView: React.FC<RailwayControlViewProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  onOpenSimulation,
}) => {
  return (
    <div className="space-y-6">
      {/* Control Room Top Header */}
      <div className="bg-white dark:bg-[#1a1a1c] p-6 rounded-2xl dark:rounded-none border border-slate-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl dark:rounded-none bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-[#f2f2f2] tracking-tight">
                Railway Control Center Operations Grid
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#f2f2f2]/50 font-medium">
                Multi-train monitoring, section occupancy tracking, and priority conflict resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-[#f2f2f2]/70 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl dark:rounded-none border border-slate-200 dark:border-white/10">
            Active Fleet: <strong className="text-slate-900 dark:text-[#f2f2f2]">{trains.length} Units</strong>
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl dark:rounded-none border border-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 High Risk Watchlist</span>
          </span>
        </div>
      </div>

      {/* Main Trains Fleet Table */}
      <div className="bg-white dark:bg-[#1a1a1c] rounded-2xl dark:rounded-none border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 dark:bg-[#141416] flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 dark:text-[#f2f2f2] uppercase tracking-wider">
            Live Train Movements & Delay Risk Index
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#f2f2f2]/40">
            AUTO-POLLING REFRESH 10S
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white dark:bg-[#1a1a1c] border-b border-slate-200 dark:border-white/10 text-slate-400 dark:text-[#f2f2f2]/40 font-bold uppercase text-[10px]">
                <th className="py-3.5 pl-6 pr-4">Train & Rake Info</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4">Speed & Signal</th>
                <th className="py-3.5 px-4">Delay</th>
                <th className="py-3.5 px-4">Risk Tier</th>
                <th className="py-3.5 px-4">Dest. ETA</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {trains.map((train) => {
                const isSelected = selectedTrain.id === train.id;
                const isHighRisk = train.destinationRisk === 'HIGH';
                const isMediumRisk = train.destinationRisk === 'MEDIUM';

                return (
                  <tr 
                    key={train.id}
                    onClick={() => onSelectTrain(train)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/70 hover:bg-blue-50' 
                        : isHighRisk 
                        ? 'hover:bg-red-50/30' 
                        : 'hover:bg-slate-50 dark:bg-[#141416]'
                    }`}
                  >
                    {/* Train Info */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl dark:rounded-none flex items-center justify-center font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#f2f2f2]/80'
                        }`}>
                          <Train className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-[#f2f2f2] text-sm">
                            {train.trainNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-[#f2f2f2]/50 truncate max-w-[180px]">
                            {train.trainName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-[#f2f2f2]">
                      <div>{train.currentLocationName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40 font-medium">
                        Next: {train.nextStationName} ({train.distanceToNextStationKm} km)
                      </div>
                    </td>

                    {/* Speed & Signal */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-[#f2f2f2]">
                        {train.currentSpeedKmH} km/h
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#f2f2f2]/50 uppercase font-semibold">
                        Signal: {train.signalAspect.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Delay */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                        train.currentDelayMinutes > 15
                          ? 'bg-red-100 text-red-800'
                          : train.currentDelayMinutes > 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        +{train.currentDelayMinutes} min
                      </span>
                    </td>

                    {/* Risk Tier */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold ${
                        isHighRisk
                          ? 'bg-red-500 text-white'
                          : isMediumRisk
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {train.destinationRisk}
                      </span>
                    </td>

                    {/* Destination ETA */}
                    <td className="py-4 px-4 font-mono">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-[#f2f2f2]">
                        {train.destinationETA}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40">
                        Conf: {train.destinationConfidence}%
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectTrain(train)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-[#f2f2f2]/80 transition-colors"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => {
                            onSelectTrain(train);
                            onOpenSimulation(train);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Simulate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
