import React, { useState } from 'react';
import { 
  Search, 
  Train, 
  ArrowRight, 
  Zap,
} from 'lucide-react';
import { TrainData } from '../../types';

interface TrainSearchViewProps {
  trains: TrainData[];
  selectedTrain: TrainData;
  onSelectTrain: (train: TrainData) => void;
  onOpenDetails: () => void;
}

export const TrainSearchView: React.FC<TrainSearchViewProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  onOpenDetails
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELAYED' | 'ON_TIME'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VANDE_BHARAT' | 'RAJDHANI' | 'SHATABDI' | 'SUPERFAST'>('ALL');

  const filtered = trains.filter((t) => {
    const matchesQuery = 
      t.trainNumber.includes(filterQuery) ||
      t.trainName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.sourceName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.destinationName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.source.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(filterQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (statusFilter === 'DELAYED' && t.currentDelayMinutes <= 10) return false;
    if (statusFilter === 'ON_TIME' && t.currentDelayMinutes > 10) return false;

    if (typeFilter !== 'ALL' && t.trainType !== typeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 text-ink">
      {/* Header & Filter Bar */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-ink tracking-tight">
                All-India Live Train Fleet Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold font-mono-code border border-accent/30">
                {trains.length} Active Express Trains
              </span>
            </div>
            <p className="text-xs text-ink/60 font-medium mt-0.5">
              Live telemetry tracking across Northern, Western, Central, Southern, Eastern & NF Railway zones.
            </p>
          </div>
        </div>

        {/* Search Input and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by Train No. (22436, 12951, 12901), Name (Vande Bharat, Rajdhani, Kerala Express), or City..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border rounded-xl text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Pills */}
            {(['ALL', 'DELAYED', 'ON_TIME'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-xl text-xs font-mono-code font-bold transition-colors cursor-pointer border ${
                  statusFilter === filter
                    ? 'bg-accent text-on-accent border-accent shadow-xs'
                    : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
                }`}
              >
                {filter === 'ALL' ? 'All Status' : filter === 'DELAYED' ? 'Delayed (>10m)' : 'On Time'}
              </button>
            ))}

            {/* Type Pills */}
            {(['ALL', 'VANDE_BHARAT', 'RAJDHANI', 'SHATABDI', 'SUPERFAST'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-mono-code font-bold transition-colors cursor-pointer border ${
                  typeFilter === t
                    ? 'bg-accent text-on-accent border-accent shadow-xs'
                    : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t === 'VANDE_BHARAT' ? '⚡ Vande Bharat' : t === 'RAJDHANI' ? '👑 Rajdhani' : t === 'SHATABDI' ? '🚄 Shatabdi' : 'Superfast'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Train Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((train) => {
          const isSelected = selectedTrain.id === train.id;

          const typeBadgeColor = 
            train.trainType === 'VANDE_BHARAT'
              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
              : train.trainType === 'RAJDHANI'
              ? 'bg-accent/15 text-accent border-accent/30'
              : train.trainType === 'SHATABDI'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
              : 'bg-surface-dark text-ink/90 border-border';

          return (
            <div
              key={train.id}
              onClick={() => {
                onSelectTrain(train);
              }}
              className={`bg-surface p-5 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-xs ${
                isSelected
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-border hover:border-accent/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    train.trainType === 'VANDE_BHARAT' 
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30' 
                      : 'bg-surface-dark text-accent border border-border'
                  }`}>
                    {train.trainType === 'VANDE_BHARAT' ? <Zap className="w-5 h-5 text-purple-500" /> : <Train className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink text-base font-mono-code">{train.trainNumber}</span>
                      <span className={`text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                        {train.trainType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-ink/70 font-medium truncate" title={train.trainName}>
                      {train.trainName}
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold shrink-0 border ${
                  train.currentDelayMinutes > 20
                    ? 'bg-accent/15 text-accent border-accent/30'
                    : train.currentDelayMinutes > 5
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : 'On Time'}
                </span>
              </div>

              {/* Route */}
              <div className="text-xs text-ink/80 bg-surface-dark p-2.5 rounded-2xl border border-border flex items-center justify-between">
                <div className="truncate">
                  <span className="text-[10px] text-ink/50 font-mono-code font-bold block">{train.source}</span>
                  <span className="font-bold text-ink truncate block">{train.sourceName}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink/50 shrink-0 mx-2" />
                <div className="text-right truncate">
                  <span className="text-[10px] text-ink/50 font-mono-code font-bold block">{train.destination}</span>
                  <span className="font-bold text-ink truncate block">{train.destinationName}</span>
                </div>
              </div>

              {/* Speed & Next Station */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border font-mono-code">
                <div>
                  <span className="text-[10px] text-ink/50 font-bold uppercase block">Current Speed</span>
                  <strong className="text-ink text-xs block">{train.currentSpeedKmH} km/h (Max {train.maxSpeedKmH})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-ink/50 font-bold uppercase block">Destination ETA</span>
                  <strong className="text-accent text-xs block">{train.destinationETA} ({train.destinationConfidence}% conf.)</strong>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrain(train);
                  onOpenDetails();
                }}
                className="w-full py-2.5 bg-surface-dark hover:bg-accent hover:text-on-accent text-ink/80 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-border font-mono-code"
              >
                Inspect Telemetry & Forecast
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-surface p-12 rounded-3xl border border-border text-center space-y-3">
          <Train className="w-12 h-12 text-ink/30 mx-auto" />
          <h3 className="text-base font-bold text-ink">No trains matched your search query</h3>
          <p className="text-xs text-ink/60 font-medium">Try searching for a train number like "22436", "12951", "12901" or a destination city.</p>
        </div>
      )}
    </div>
  );
};
