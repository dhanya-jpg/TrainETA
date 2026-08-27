import React, { useState } from 'react';
import { 
  Train, 
  Search, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Info, 
  AlertCircle,
  Map as MapIcon,
  ListOrdered,
  BellRing,
  Share2,
  CheckCircle2,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { TrainData, AuthUser, StationStop } from '../../types';
import { formatMinutesToTime, parseTimeToMinutes } from '../../services/etaPredictionService';
import { LiveTrainMap } from '../map/LiveTrainMap';

interface PassengerViewProps {
  trains: TrainData[];
  selectedTrain: TrainData;
  onSelectTrain: (train: TrainData) => void;
  currentUser?: AuthUser | null;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'eta' | 'map' | 'schedule' | 'advisory'>('eta');
  const [searchNo, setSearchNo] = useState(selectedTrain.trainNumber);
  const [destinationCode, setDestinationCode] = useState(selectedTrain.destination);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Find target stop in the selected train
  const targetStop: StationStop = 
    selectedTrain.stops.find((s) => s.stationCode === destinationCode) || 
    selectedTrain.stops[selectedTrain.stops.length - 1];

  // Calculate suggested arrival time at station (18 mins prior to predicted ETA)
  const predictedMins = parseTimeToMinutes(targetStop.predictedArrival);
  const suggestedStationArrival = formatMinutesToTime(predictedMins - 18);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = trains.find(
      (t) => t.trainNumber === searchNo.trim() || t.trainName.toLowerCase().includes(searchNo.toLowerCase())
    );
    if (found) {
      onSelectTrain(found);
      setDestinationCode(found.destination);
    }
  };

  const handleShareETA = () => {
    const summary = `🚆 Live ETA Update for Train ${selectedTrain.trainNumber} (${selectedTrain.trainName}):\n• Reaching ${targetStop.stationName} (${targetStop.stationCode}) at ~${targetStop.predictedArrival} (Window: ${targetStop.etaRange})\n• Current Delay: ${selectedTrain.currentDelayMinutes} min\n• Recommended Station Arrival: ~${suggestedStationArrival} (PF ${targetStop.platform})\n• Tracked live via SMART ETA.`;
    navigator.clipboard?.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="w-full space-y-4 max-w-[1280px] mx-auto pb-10 overflow-x-hidden">
      
      {/* 1. COMPACT HEADER BAR */}
      <section className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-5 rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#E53E3E]/10 text-[#E53E3E] text-[10px] font-mono-code font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E] animate-ping" />
                LIVE COMMUTER PORTAL
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono-code font-bold uppercase ${
                selectedTrain.currentDelayMinutes > 5
                  ? 'bg-[#E53E3E]/10 text-[#E53E3E] border border-[#E53E3E]/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedTrain.currentDelayMinutes > 0
                  ? `+${selectedTrain.currentDelayMinutes} MIN DELAYED`
                  : 'RUNNING ON SCHEDULE'}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="font-syne text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight uppercase text-[#18181A] dark:text-[#f2f2f2]">
                {selectedTrain.trainNumber} • {selectedTrain.trainName}
              </h1>
            </div>

            <p className="text-xs text-[#18181A]/70 dark:text-[#f2f2f2]/60 font-medium">
              {selectedTrain.sourceName} → {selectedTrain.destinationName} • Near <strong className="text-[#18181A] dark:text-[#f2f2f2]">{selectedTrain.currentLocationName}</strong> at <span className="font-mono-code font-bold text-[#E53E3E]">{selectedTrain.currentSpeedKmH} km/h</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShareETA}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E53E3E] hover:bg-red-700 text-white rounded-sm text-xs font-mono-code uppercase font-bold transition-all border-none cursor-pointer shadow-xs"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ETA COPIED!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>SHARE LIVE ETA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE STAT METRICS (3-Column Dense Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Selected Train & Route */}
        <div className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-5 rounded-xl dark:rounded-none border border-black/10 dark:border-[#f2f2f2]/10 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="font-mono-code text-[0.65rem] uppercase tracking-[0.12em] text-[#18181A]/60 dark:text-[#f2f2f2]/50 mb-1">
              Active Train & Status
            </div>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-[#18181A] dark:text-[#f2f2f2] leading-tight tracking-tight">
              {selectedTrain.trainNumber}
            </div>
          </div>
          <div className="font-mono-code text-[0.65rem] text-[#18181A]/70 dark:text-[#f2f2f2]/60 uppercase tracking-[0.05em] mt-3 pt-2.5 border-t border-black/10 dark:border-[#f2f2f2]/10 truncate">
            {selectedTrain.sourceName.split(' ')[0]} → {selectedTrain.destinationName.split(' ')[0]} • Next: {selectedTrain.nextStationName}
          </div>
        </div>

        {/* Card 2: Dynamic ETA to Target Stop */}
        <div className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-5 rounded-xl dark:rounded-none border border-black/10 dark:border-[#f2f2f2]/10 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="font-mono-code text-[0.65rem] uppercase tracking-[0.12em] text-[#18181A]/60 dark:text-[#f2f2f2]/50 mb-1">
              Predicted Arrival @ {targetStop.stationCode}
            </div>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-[#E53E3E] leading-tight tracking-tight">
              {targetStop.predictedArrival}
            </div>
          </div>
          <div className="font-mono-code text-[0.65rem] text-[#18181A]/70 dark:text-[#f2f2f2]/60 uppercase tracking-[0.05em] mt-3 pt-2.5 border-t border-black/10 dark:border-[#f2f2f2]/10 truncate">
            Window: {targetStop.etaRange} • {targetStop.confidenceScore}% Conf
          </div>
        </div>

        {/* Card 3: Boarding Advisory */}
        <div className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-5 rounded-xl dark:rounded-none border border-black/10 dark:border-[#f2f2f2]/10 flex flex-col justify-between shadow-2xs sm:col-span-2 lg:col-span-1">
          <div>
            <div className="font-mono-code text-[0.65rem] uppercase tracking-[0.12em] text-[#E53E3E] font-bold mb-1">
              Station Arrival Advisory
            </div>
            <div className="text-xl sm:text-2xl font-syne font-extrabold text-[#18181A] dark:text-[#f2f2f2] leading-tight tracking-tight">
              Arrive by {suggestedStationArrival}
            </div>
          </div>
          <div className="font-mono-code text-[0.65rem] text-[#18181A]/70 dark:text-[#f2f2f2]/60 uppercase tracking-[0.05em] mt-3 pt-2.5 border-t border-black/10 dark:border-[#f2f2f2]/10 truncate">
            Platform #{targetStop.platform} • 18m Security Slack
          </div>
        </div>
      </section>

      {/* 3. TRAIN CONTROLS & DESTINATION SELECTOR BAR */}
      <section className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-5 rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs space-y-3.5">
        {/* Active Train Quick Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="font-mono-code text-[10px] font-bold text-[#18181A]/50 dark:text-[#f2f2f2]/50 uppercase tracking-widest shrink-0 mr-1">
            QUICK SWITCH:
          </span>
          {trains.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTrain(t);
                setSearchNo(t.trainNumber);
                setDestinationCode(t.destination);
              }}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-sm text-xs font-mono-code font-bold transition-all cursor-pointer border ${
                selectedTrain.id === t.id
                  ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A] border-[#18181A] dark:border-white shadow-xs'
                  : 'bg-[#F8F7F4] dark:bg-white/5 text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
              }`}
            >
              {t.trainNumber} • {t.trainName.split(' ')[0]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-black/10 dark:border-white/10">
          <div className="sm:col-span-5 lg:col-span-4">
            <label className="font-mono-code text-[10px] font-bold text-[#18181A]/50 dark:text-[#f2f2f2]/50 uppercase tracking-widest block mb-1">
              Search Train No. or Name
            </label>
            <div className="relative">
              <Train className="w-4 h-4 text-[#18181A]/40 dark:text-[#f2f2f2]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="e.g. 22436, 12951..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F7F4] dark:bg-[#141416] border border-black/10 dark:border-white/10 rounded-sm text-xs font-bold text-[#18181A] dark:text-[#f2f2f2] focus:outline-none focus:border-[#E53E3E]"
              />
            </div>
          </div>

          <div className="sm:col-span-5 lg:col-span-6">
            <label className="font-mono-code text-[10px] font-bold text-[#18181A]/50 dark:text-[#f2f2f2]/50 uppercase tracking-widest block mb-1">
              Select Your Destination Station
            </label>
            <select
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F8F7F4] dark:bg-[#141416] border border-black/10 dark:border-white/10 rounded-sm text-xs font-bold text-[#18181A] dark:text-[#f2f2f2] focus:outline-none focus:border-[#E53E3E] truncate"
            >
              {selectedTrain.stops.map((s) => (
                <option key={s.stationCode} value={s.stationCode} className="bg-white dark:bg-[#1a1a1c] text-[#18181A] dark:text-[#f2f2f2]">
                  {s.stationName} ({s.stationCode}) — Sch {s.scheduledArrival} | AI: {s.predictedArrival}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full h-[36px] bg-[#18181A] dark:bg-[#E53E3E] hover:bg-black dark:hover:bg-red-700 text-white rounded-sm text-xs font-mono-code font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center border-none"
            >
              Apply
            </button>
          </div>
        </form>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-black/10 dark:border-white/10 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveSubTab('eta')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono-code uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'eta'
                ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A] border-[#18181A] dark:border-white shadow-xs'
                : 'bg-[#F8F7F4] dark:bg-white/5 text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Live ETA Details</span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono-code uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'map'
                ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A] border-[#18181A] dark:border-white shadow-xs'
                : 'bg-[#F8F7F4] dark:bg-white/5 text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono-code uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'schedule'
                ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A] border-[#18181A] dark:border-white shadow-xs'
                : 'bg-[#F8F7F4] dark:bg-white/5 text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Station Timetable ({selectedTrain.stops.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisory')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono-code uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'advisory'
                ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A] border-[#18181A] dark:border-white shadow-xs'
                : 'bg-[#F8F7F4] dark:bg-white/5 text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Commuter Advisories</span>
          </button>
        </div>
      </section>

      {/* 4. TAB CONTENTS */}

      {/* SUB-VIEW 1: LIVE ETA & TELEMETRY BREAKDOWN */}
      {activeSubTab === 'eta' && (
        <section className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-[#1a1a1c] rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-black/10 dark:border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#18181A] dark:text-[#f2f2f2] border border-black/10 dark:border-white/10">
                    {selectedTrain.trainNumber}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#18181A] dark:text-[#f2f2f2]">
                    {selectedTrain.trainName}
                  </h3>
                </div>
                <p className="text-xs text-[#18181A]/60 dark:text-[#f2f2f2]/50 font-medium mt-1">
                  {selectedTrain.sourceName} → {selectedTrain.destinationName} • Currently near <strong className="text-[#18181A] dark:text-[#f2f2f2]">{selectedTrain.currentLocationName}</strong>
                </p>
              </div>

              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono-code font-bold ${
                  selectedTrain.currentDelayMinutes > 5
                    ? 'bg-[#E53E3E]/10 text-[#E53E3E] border border-[#E53E3E]/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedTrain.currentDelayMinutes > 0
                    ? `RUNNING +${selectedTrain.currentDelayMinutes} MIN DELAYED`
                    : 'RUNNING ON SCHEDULE'}
                </span>
              </div>
            </div>

            {/* In-depth Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 text-xs">
                <div className="font-mono-code text-[#18181A]/50 dark:text-[#f2f2f2]/40 font-bold text-[10px] uppercase">
                  Current Speed
                </div>
                <div className="text-base sm:text-lg font-black text-[#18181A] dark:text-[#f2f2f2] font-mono-code mt-1">
                  {selectedTrain.currentSpeedKmH} km/h
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 text-xs">
                <div className="font-mono-code text-[#18181A]/50 dark:text-[#f2f2f2]/40 font-bold text-[10px] uppercase">
                  Approaching Stop
                </div>
                <div className="text-sm sm:text-base font-bold text-[#18181A] dark:text-[#f2f2f2] mt-1 truncate">
                  {selectedTrain.nextStationName}
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 text-xs">
                <div className="font-mono-code text-[#18181A]/50 dark:text-[#f2f2f2]/40 font-bold text-[10px] uppercase">
                  Distance to Next
                </div>
                <div className="text-base sm:text-lg font-black text-[#18181A] dark:text-[#f2f2f2] font-mono-code mt-1">
                  {selectedTrain.distanceToNextStationKm} km
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 text-xs">
                <div className="font-mono-code text-[#18181A]/50 dark:text-[#f2f2f2]/40 font-bold text-[10px] uppercase">
                  Platform Assignment
                </div>
                <div className="text-base sm:text-lg font-black text-[#E53E3E] font-mono-code mt-1">
                  PF #{targetStop.platform}
                </div>
              </div>
            </div>

            {/* Confidence Window Bar */}
            <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#18181A] dark:bg-white/5 border border-transparent dark:border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E53E3E] shrink-0" />
                <span className="text-[#f2f2f2]">
                  <strong>90% Confidence Arrival Window:</strong>{' '}
                  <span className="font-mono-code text-[#E53E3E] font-bold">{targetStop.etaRange}</span>
                </span>
              </div>
              <div className="font-mono-code text-[10px] sm:text-[11px] text-[#f2f2f2]/60">
                Model: Dynamic Gradient Boosted Regressor (XGBoost)
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: INTERACTIVE LIVE MAP */}
      {activeSubTab === 'map' && (
        <section className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-6 rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#18181A] dark:text-[#f2f2f2]">
                Live Route & GPS Telemetry: {selectedTrain.trainNumber} - {selectedTrain.trainName}
              </h3>
              <p className="text-xs text-[#18181A]/60 dark:text-[#f2f2f2]/50 font-medium">
                Live track telemetry, station waypoints, and animated train location.
              </p>
            </div>
            <span className="font-mono-code text-xs font-bold bg-black/5 dark:bg-white/10 text-[#18181A] dark:text-[#f2f2f2] px-3 py-1 rounded-sm border border-black/10 dark:border-white/10 self-start sm:self-auto">
              {selectedTrain.currentSpeedKmH} KM/H
            </span>
          </div>
          <div className="h-[360px] sm:h-[450px] md:h-[520px] w-full rounded-lg dark:rounded-none overflow-hidden border border-black/10 dark:border-white/10">
            <LiveTrainMap train={selectedTrain} />
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: COMPLETE STATION SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <section className="bg-white dark:bg-[#1a1a1c] rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 bg-[#F8F7F4] dark:bg-[#141416] flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#18181A] dark:text-[#f2f2f2]">
                Station Timetable & Arrival Forecast ({selectedTrain.stops.length} Stops)
              </h3>
              <p className="text-xs text-[#18181A]/60 dark:text-[#f2f2f2]/50 font-medium">
                Official scheduled timetable compared against live ML dynamic ETA.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-white dark:bg-[#1a1a1c] text-[#18181A]/50 dark:text-[#f2f2f2]/50 font-mono-code uppercase text-[10px] tracking-wider border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3">Scheduled</th>
                  <th className="py-3 px-3">AI Expected</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Delay</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium text-[#18181A] dark:text-[#f2f2f2]">
                {selectedTrain.stops.map((stop) => {
                  const isDestination = stop.stationCode === destinationCode;
                  return (
                    <tr 
                      key={stop.stationCode}
                      className={`hover:bg-[#F8F7F4] dark:hover:bg-white/5 transition-colors ${
                        isDestination ? 'bg-[#E53E3E]/5 dark:bg-[#E53E3E]/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#18181A] dark:text-[#f2f2f2] flex items-center gap-1.5">
                          {stop.stationName}
                          {isDestination && (
                            <span className="text-[9px] font-mono-code font-bold bg-[#E53E3E] text-white px-1.5 py-0.2 rounded">
                              DESTINATION
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono-code text-[#18181A]/40 dark:text-[#f2f2f2]/40">
                          {stop.stationCode}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono-code text-[#18181A]/60 dark:text-[#f2f2f2]/60">
                        {stop.distanceKm} km
                      </td>
                      <td className="py-3 px-3 font-mono-code">
                        {stop.scheduledArrival}
                      </td>
                      <td className="py-3 px-3 font-mono-code text-[#18181A] dark:text-[#f2f2f2] font-bold">
                        {stop.predictedArrival}
                        <span className="block text-[10px] text-[#18181A]/40 dark:text-[#f2f2f2]/40 font-normal">
                          {stop.etaRange}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono-code font-bold">
                        PF {stop.platform}
                      </td>
                      <td className="py-3 px-3 font-mono-code">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          stop.predictedDelayMinutes > 5
                            ? 'bg-[#E53E3E]/10 text-[#E53E3E]'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes}m` : 'On Time'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full ${
                          stop.status === 'DEPARTED'
                            ? 'bg-black/5 dark:bg-white/5 text-[#18181A]/40 dark:text-[#f2f2f2]/40'
                            : stop.status === 'CURRENT'
                            ? 'bg-[#18181A] dark:bg-white text-white dark:text-[#18181A]'
                            : stop.status === 'NEXT'
                            ? 'bg-[#E53E3E] text-white'
                            : 'bg-black/5 dark:bg-white/5 text-[#18181A]/60 dark:text-[#f2f2f2]/60'
                        }`}>
                          {stop.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUB-VIEW 4: TRAVEL ADVISORIES */}
      {activeSubTab === 'advisory' && (
        <section className="space-y-4">
          <div className="bg-white dark:bg-[#1a1a1c] p-4 sm:p-6 lg:p-7 rounded-xl dark:rounded-none border border-black/10 dark:border-white/10 shadow-2xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#18181A] dark:text-[#f2f2f2] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E53E3E] shrink-0" />
              Live Route & Operational Advisories for {selectedTrain.trainNumber}
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A] dark:text-[#f2f2f2]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Section Interlocking & Signal Aspect
                  </span>
                  <span className="font-mono-code text-emerald-700 dark:text-emerald-400 font-bold uppercase">CLEAR GREEN</span>
                </div>
                <p className="text-xs text-[#18181A]/70 dark:text-[#f2f2f2]/70">
                  Signals on the upcoming section between {selectedTrain.currentLocationName} and {selectedTrain.nextStationName} are operating in automatic permissive block mode.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A] dark:text-[#f2f2f2]">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#E53E3E] shrink-0" />
                    Speed & Recovery Advisory
                  </span>
                  <span className="font-mono-code text-[#E53E3E] font-bold">+4 min recovery buffer</span>
                </div>
                <p className="text-xs text-[#18181A]/70 dark:text-[#f2f2f2]/70">
                  Engineering recovery slack of 8 minutes is factored into downstream section approaching {selectedTrain.destinationName}.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-lg dark:rounded-none bg-[#F8F7F4] dark:bg-[#141416] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A] dark:text-[#f2f2f2]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#18181A]/60 dark:text-[#f2f2f2]/60 shrink-0" />
                    Passenger Facility & Baggage Advisory
                  </span>
                  <span className="font-mono-code text-[#18181A]/50 dark:text-[#f2f2f2]/50 font-bold">Standard</span>
                </div>
                <p className="text-xs text-[#18181A]/70 dark:text-[#f2f2f2]/70">
                  Wheelchair assistance, battery carts, and prepaid taxi booths available at Platform 1 & 3 of major junction stops.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
