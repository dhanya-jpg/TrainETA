import React, { useState } from 'react';
import { 
  Search, 
  Train, 
  Clock, 
  ArrowRight, 
  Filter, 
  Sparkles,
  Zap,
  MapPin,
  Compass,
  CheckCircle2, 
  AlertTriangle 
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
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white dark:bg-[#1a1a1c] p-6 rounded-3xl dark:rounded-none border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-[#f2f2f2] tracking-tight">
                All-India Live Train Fleet Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black font-mono">
                {trains.length} Active Express Trains
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#f2f2f2]/50 font-medium mt-0.5">
              Live telemetry tracking across Northern, Western, Central, Southern, Eastern & NF Railway zones.
            </p>
          </div>
        </div>

        {/* Search Input and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#f2f2f2]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by Train No. (22436, 12951, 12901), Name (Vande Bharat, Rajdhani, Kerala Express), or City..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#141416] border border-slate-200 dark:border-white/10 rounded-xl dark:rounded-none text-xs font-semibold text-slate-900 dark:text-[#f2f2f2] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Pills */}
            {(['ALL', 'DELAYED', 'ON_TIME'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-xl dark:rounded-none text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#f2f2f2]/70 hover:bg-slate-200'
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
                className={`px-3 py-2 rounded-xl dark:rounded-none text-xs font-bold transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-slate-900 dark:bg-white text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#f2f2f2]/70 hover:bg-slate-200'
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
              ? 'bg-purple-100 text-purple-900 border-purple-200'
              : train.trainType === 'RAJDHANI'
              ? 'bg-red-100 text-red-900 border-red-200'
              : train.trainType === 'SHATABDI'
              ? 'bg-blue-100 text-blue-900 border-blue-200'
              : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-[#f2f2f2] border-slate-200 dark:border-white/10';

          return (
            <div
              key={train.id}
              onClick={() => {
                onSelectTrain(train);
              }}
              className={`bg-white dark:bg-[#1a1a1c] p-5 rounded-3xl dark:rounded-none border transition-all cursor-pointer space-y-4 hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                  : 'border-slate-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-2xl dark:rounded-none flex items-center justify-center font-bold shrink-0 ${
                    train.trainType === 'VANDE_BHARAT' ? 'bg-purple-950 text-purple-300' : 'bg-slate-900 dark:bg-white text-amber-400'
                  }`}>
                    {train.trainType === 'VANDE_BHARAT' ? <Zap className="w-5 h-5 text-purple-400" /> : <Train className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-[#f2f2f2] text-base">{train.trainNumber}</span>
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                        {train.trainType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-[#f2f2f2]/70 font-medium truncate" title={train.trainName}>
                      {train.trainName}
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono shrink-0 ${
                  train.currentDelayMinutes > 20
                    ? 'bg-red-100 text-red-800'
                    : train.currentDelayMinutes > 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : 'On Time'}
                </span>
              </div>

              {/* Route */}
              <div className="text-xs text-slate-700 dark:text-[#f2f2f2]/80 bg-slate-50 dark:bg-[#141416] p-2.5 rounded-2xl dark:rounded-none border border-slate-100 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40 font-bold block">{train.source}</span>
                  <span className="font-bold text-slate-900 dark:text-[#f2f2f2] truncate block">{train.sourceName}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#f2f2f2]/40 shrink-0 mx-2" />
                <div className="text-right truncate">
                  <span className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40 font-bold block">{train.destination}</span>
                  <span className="font-bold text-slate-900 dark:text-[#f2f2f2] truncate block">{train.destinationName}</span>
                </div>
              </div>

              {/* Speed & Next Station */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40 font-bold uppercase block">Current Speed</span>
                  <strong className="text-slate-800 dark:text-[#f2f2f2] text-xs font-mono block">{train.currentSpeedKmH} km/h (Max {train.maxSpeedKmH})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-[#f2f2f2]/40 font-bold uppercase block">Destination ETA</span>
                  <strong className="text-blue-600 text-xs font-mono block">{train.destinationETA} ({train.destinationConfidence}% conf.)</strong>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrain(train);
                  onOpenDetails();
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-[#f2f2f2]/80 font-bold rounded-xl dark:rounded-none text-xs transition-colors cursor-pointer"
              >
                Inspect Telemetry & Forecast
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1a1a1c] p-12 rounded-3xl dark:rounded-none border border-slate-200 dark:border-white/10 text-center space-y-3">
          <Train className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-[#f2f2f2]">No trains matched your search query</h3>
          <p className="text-xs text-slate-500 dark:text-[#f2f2f2]/50">Try searching for a train number like "22436", "12951", "12901" or a destination city.</p>
        </div>
      )}
    </div>
  );
};
