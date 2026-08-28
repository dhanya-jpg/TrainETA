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
    <div className="space-y-6 text-ink">
      {/* Control Room Top Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                Railway Control Center Operations Grid
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Multi-train monitoring, section occupancy tracking, and priority conflict resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-ink/80 bg-surface-dark px-3 py-1.5 rounded-xl border border-border">
            Active Fleet: <strong className="text-ink font-mono-code">{trains.length} Units</strong>
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 High Risk Watchlist</span>
          </span>
        </div>
      </div>

      {/* Main Trains Fleet Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-dark flex items-center justify-between">
          <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
            Live Train Movements & Delay Risk Index
          </span>
          <span className="text-[10px] font-bold font-mono-code text-accent">
            AUTO-POLLING REFRESH 10S
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-dark/50 border-b border-border text-ink/50 font-bold uppercase text-[10px] font-mono-code">
                <th className="py-3.5 pl-6 pr-4">Train & Rake Info</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4">Speed & Signal</th>
                <th className="py-3.5 px-4">Delay</th>
                <th className="py-3.5 px-4">Risk Tier</th>
                <th className="py-3.5 px-4">Dest. ETA</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
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
                        ? 'bg-accent/10 hover:bg-accent/15' 
                        : 'hover:bg-surface-dark'
                    }`}
                  >
                    {/* Train Info */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          isSelected ? 'bg-accent text-on-accent shadow-xs' : 'bg-surface-dark text-ink/80 border border-border'
                        }`}>
                          <Train className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-ink text-sm">
                            {train.trainNumber}
                          </div>
                          <div className="text-[11px] text-ink/60 truncate max-w-[180px]">
                            {train.trainName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 font-bold text-ink">
                      <div>{train.currentLocationName}</div>
                      <div className="text-[10px] text-ink/50 font-medium font-mono-code">
                        Next: {train.nextStationName} ({train.distanceToNextStationKm.toFixed(1)} km)
                      </div>
                    </td>

                    {/* Speed & Signal */}
                    <td className="py-4 px-4">
                      <div className="font-mono-code font-bold text-ink">
                        {train.currentSpeedKmH} km/h
                      </div>
                      <div className="text-[10px] text-ink/60 uppercase font-semibold">
                        Signal: {train.signalAspect.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Delay */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-code ${
                        train.currentDelayMinutes > 15
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                          : train.currentDelayMinutes > 5
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        +{train.currentDelayMinutes} min
                      </span>
                    </td>

                    {/* Risk Tier */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono-code ${
                        isHighRisk
                          ? 'bg-red-500 text-white'
                          : isMediumRisk
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {train.destinationRisk}
                      </span>
                    </td>

                    {/* Destination ETA */}
                    <td className="py-4 px-4 font-mono-code">
                      <div className="font-bold text-sm text-ink">
                        {train.destinationETA}
                      </div>
                      <div className="text-[10px] text-ink/50">
                        Conf: {train.destinationConfidence}%
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectTrain(train)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-dark hover:bg-surface border border-border text-ink transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => {
                            onSelectTrain(train);
                            onOpenSimulation(train);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent text-on-accent hover:opacity-90 shadow-xs transition-opacity flex items-center gap-1 cursor-pointer"
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
