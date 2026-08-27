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
    <div className="max-w-6xl mx-auto space-y-10 pb-16 font-sans">
      
      {/* 1. HERO SECTION (Editorial Brutalist Aesthetic) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-black/50 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
          <span>PLATFORM STATUS: LIVE TELEMETRY</span>
          {currentUser?.name && (
            <span className="text-black/30">• COMMUTER: {currentUser.name.toUpperCase()}</span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#18181A] leading-[0.92]">
              Intelligence<br />in Transit.
            </h1>
            <p className="text-sm sm:text-base text-black/60 font-medium mt-3 max-w-xl">
              AI-Powered Dynamic Train ETA & Delay Platform with real-time GPS telemetry and explainable ML regression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleShareETA}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-black/5 text-[#18181A] rounded-xl text-xs font-['Space_Mono',monospace] uppercase tracking-wider font-bold transition-all border border-black/10 shadow-2xs cursor-pointer"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#E53E3E]" />
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

      {/* 2. SIGNATURE CARD GRID (3-Column Editorial Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Current Selection */}
        <div className="bg-white border border-black/10 p-6 sm:p-7 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-black/50 font-bold">
              Current Selection
            </div>
            <div className="text-4xl sm:text-5xl font-black font-['Space_Mono',monospace] text-[#18181A] tracking-tight mt-2">
              {selectedTrain.trainNumber}
            </div>
          </div>
          <div className="border-t border-black/5 pt-4 text-xs">
            <div className="font-bold text-[#18181A] text-sm truncate">
              {selectedTrain.trainName}
            </div>
            <div className="text-black/50 font-['Space_Mono',monospace] text-[11px] mt-0.5">
              {selectedTrain.source} → {selectedTrain.destination} ({selectedTrain.sourceName.split(' ')[0]} to {selectedTrain.destinationName.split(' ')[0]})
            </div>
          </div>
        </div>

        {/* Card 2: Predicted Arrival */}
        <div className="bg-white border border-black/10 p-6 sm:p-7 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-black/50 font-bold">
                Predicted Arrival
              </div>
              <span className="font-['Space_Mono',monospace] text-[10px] text-[#E53E3E] font-bold">
                {targetStop.confidenceScore}% CONF
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black font-['Space_Mono',monospace] text-[#18181A] tracking-tight mt-2">
              {targetStop.predictedArrival}
            </div>
          </div>
          <div className="border-t border-black/5 pt-4 text-xs">
            <div className="font-bold text-[#18181A] text-sm truncate">
              {targetStop.stationName} ({targetStop.stationCode})
            </div>
            <div className="text-black/50 font-['Space_Mono',monospace] text-[11px] mt-0.5">
              Sched: {targetStop.scheduledArrival} • {selectedTrain.currentDelayMinutes > 0 ? `+${selectedTrain.currentDelayMinutes}m delay` : 'On Time'}
            </div>
          </div>
        </div>

        {/* Card 3: Advisory (Inverted Dark Ink Card) */}
        <div className="bg-[#18181A] text-white border border-black/20 p-6 sm:p-7 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="font-['Space_Mono',monospace] text-[11px] uppercase tracking-widest text-[#E53E3E] font-bold">
              Advisory
            </div>
            <div className="text-2xl sm:text-3xl font-black font-['Space_Mono',monospace] tracking-tight mt-2 text-white">
              Arrive by {suggestedStationArrival}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 text-xs">
            <p className="text-white/70 text-[11.5px] leading-relaxed">
              Optimized for seamless platform #{targetStop.platform} boarding & security screening at {targetStop.stationCode}.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TRAIN CONTROLS & DESTINATION SELECTOR BAR */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        {/* Active Train Quick Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="font-['Space_Mono',monospace] text-[10px] font-bold text-black/40 uppercase tracking-widest shrink-0 mr-1">
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
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-['Space_Mono',monospace] font-bold transition-all cursor-pointer border ${
                selectedTrain.id === t.id
                  ? 'bg-[#18181A] text-white border-[#18181A] shadow-xs'
                  : 'bg-[#F8F7F4] text-black/70 hover:bg-black/5 border-black/5'
              }`}
            >
              {t.trainNumber} • {t.trainName.split(' ')[0]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-black/5">
          <div className="sm:col-span-4">
            <label className="font-['Space_Mono',monospace] text-[10px] font-bold text-black/50 uppercase tracking-widest block mb-1">
              Search Train No. or Name
            </label>
            <div className="relative">
              <Train className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="e.g. 22436, 12951, Vande Bharat"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F4] border border-black/10 rounded-xl text-xs font-bold text-[#18181A] focus:outline-none focus:border-[#E53E3E]"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="font-['Space_Mono',monospace] text-[10px] font-bold text-black/50 uppercase tracking-widest block mb-1">
              Select Your Destination Station
            </label>
            <select
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-black/10 rounded-xl text-xs font-bold text-[#18181A] focus:outline-none focus:border-[#E53E3E]"
            >
              {selectedTrain.stops.map((s) => (
                <option key={s.stationCode} value={s.stationCode}>
                  {s.stationName} ({s.stationCode}) — Scheduled {s.scheduledArrival} | AI ETA: {s.predictedArrival}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#18181A] hover:bg-black text-white rounded-xl text-xs font-['Space_Mono',monospace] font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-black/5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('eta')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Space_Mono',monospace] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'eta'
                ? 'bg-[#18181A] text-white border-[#18181A] shadow-xs'
                : 'bg-[#F8F7F4] text-black/70 hover:bg-black/5 border-black/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Live ETA Details</span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Space_Mono',monospace] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'map'
                ? 'bg-[#18181A] text-white border-[#18181A] shadow-xs'
                : 'bg-[#F8F7F4] text-black/70 hover:bg-black/5 border-black/5'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Space_Mono',monospace] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'schedule'
                ? 'bg-[#18181A] text-white border-[#18181A] shadow-xs'
                : 'bg-[#F8F7F4] text-black/70 hover:bg-black/5 border-black/5'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Station Timetable ({selectedTrain.stops.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Space_Mono',monospace] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              activeSubTab === 'advisory'
                ? 'bg-[#18181A] text-white border-[#18181A] shadow-xs'
                : 'bg-[#F8F7F4] text-black/70 hover:bg-black/5 border-black/5'
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
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-['Space_Mono',monospace] font-bold uppercase px-2 py-0.5 rounded bg-black/5 text-[#18181A] border border-black/10">
                    {selectedTrain.trainNumber}
                  </span>
                  <h3 className="text-lg font-bold text-[#18181A]">
                    {selectedTrain.trainName}
                  </h3>
                </div>
                <p className="text-xs text-black/50 font-medium mt-1">
                  {selectedTrain.sourceName} → {selectedTrain.destinationName} • Currently near <strong>{selectedTrain.currentLocationName}</strong>
                </p>
              </div>

              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-['Space_Mono',monospace] font-bold ${
                  selectedTrain.currentDelayMinutes > 5
                    ? 'bg-[#E53E3E]/10 text-[#E53E3E] border border-[#E53E3E]/30'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedTrain.currentDelayMinutes > 0
                    ? `RUNNING +${selectedTrain.currentDelayMinutes} MIN DELAYED`
                    : 'RUNNING ON SCHEDULE'}
                </span>
              </div>
            </div>

            {/* In-depth Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 text-xs">
                <div className="font-['Space_Mono',monospace] text-black/40 font-bold text-[10px] uppercase">
                  Current Speed
                </div>
                <div className="text-lg font-black text-[#18181A] font-['Space_Mono',monospace] mt-1">
                  {selectedTrain.currentSpeedKmH} km/h
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 text-xs">
                <div className="font-['Space_Mono',monospace] text-black/40 font-bold text-[10px] uppercase">
                  Approaching Stop
                </div>
                <div className="text-base font-bold text-[#18181A] mt-1 truncate">
                  {selectedTrain.nextStationName}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 text-xs">
                <div className="font-['Space_Mono',monospace] text-black/40 font-bold text-[10px] uppercase">
                  Distance to Next
                </div>
                <div className="text-lg font-black text-[#18181A] font-['Space_Mono',monospace] mt-1">
                  {selectedTrain.distanceToNextStationKm} km
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 text-xs">
                <div className="font-['Space_Mono',monospace] text-black/40 font-bold text-[10px] uppercase">
                  Platform Assignment
                </div>
                <div className="text-lg font-black text-[#E53E3E] font-['Space_Mono',monospace] mt-1">
                  PF #{targetStop.platform}
                </div>
              </div>
            </div>

            {/* Confidence Window Bar */}
            <div className="p-4 rounded-xl bg-[#18181A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E53E3E]" />
                <span>
                  <strong>90% Confidence Arrival Window:</strong>{' '}
                  <span className="font-['Space_Mono',monospace] text-[#E53E3E] font-bold">{targetStop.etaRange}</span>
                </span>
              </div>
              <div className="font-['Space_Mono',monospace] text-[11px] text-white/70">
                Model: Dynamic Gradient Boosted Regressor (XGBoost)
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: INTERACTIVE LIVE MAP */}
      {activeSubTab === 'map' && (
        <section className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#18181A]">
                Live Route & GPS Telemetry: {selectedTrain.trainNumber} - {selectedTrain.trainName}
              </h3>
              <p className="text-xs text-black/50 font-medium">
                Live track telemetry, station waypoints, and animated train location.
              </p>
            </div>
            <span className="font-['Space_Mono',monospace] text-xs font-bold bg-black/5 text-[#18181A] px-3 py-1 rounded-xl border border-black/10">
              {selectedTrain.currentSpeedKmH} KM/H
            </span>
          </div>
          <div className="h-[520px] w-full rounded-xl overflow-hidden border border-black/10">
            <LiveTrainMap train={selectedTrain} />
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: COMPLETE STATION SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <section className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-black/5 bg-[#F8F7F4] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#18181A]">
                Station Timetable & Arrival Forecast ({selectedTrain.stops.length} Stops)
              </h3>
              <p className="text-xs text-black/50 font-medium">
                Official scheduled timetable compared against live ML dynamic ETA.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-black/50 font-['Space_Mono',monospace] uppercase text-[10px] tracking-wider border-b border-black/10">
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
              <tbody className="divide-y divide-black/5 font-medium text-[#18181A]">
                {selectedTrain.stops.map((stop) => {
                  const isDestination = stop.stationCode === destinationCode;
                  return (
                    <tr 
                      key={stop.stationCode}
                      className={`hover:bg-[#F8F7F4] transition-colors ${
                        isDestination ? 'bg-[#E53E3E]/5 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#18181A] flex items-center gap-1.5">
                          {stop.stationName}
                          {isDestination && (
                            <span className="text-[9px] font-['Space_Mono',monospace] font-bold bg-[#E53E3E] text-white px-1.5 py-0.2 rounded">
                              DESTINATION
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-['Space_Mono',monospace] text-black/40">
                          {stop.stationCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-['Space_Mono',monospace] text-black/60">
                        {stop.distanceKm} km
                      </td>
                      <td className="py-3.5 px-3 font-['Space_Mono',monospace]">
                        {stop.scheduledArrival}
                      </td>
                      <td className="py-3.5 px-3 font-['Space_Mono',monospace] text-[#18181A] font-bold">
                        {stop.predictedArrival}
                        <span className="block text-[10px] text-black/40 font-normal">
                          {stop.etaRange}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-['Space_Mono',monospace] font-bold">
                        PF {stop.platform}
                      </td>
                      <td className="py-3.5 px-3 font-['Space_Mono',monospace]">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          stop.predictedDelayMinutes > 5
                            ? 'bg-[#E53E3E]/10 text-[#E53E3E]'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes}m` : 'On Time'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-['Space_Mono',monospace] font-bold uppercase px-2 py-0.5 rounded-full ${
                          stop.status === 'DEPARTED'
                            ? 'bg-black/5 text-black/40'
                            : stop.status === 'CURRENT'
                            ? 'bg-[#18181A] text-white'
                            : stop.status === 'NEXT'
                            ? 'bg-[#E53E3E] text-white'
                            : 'bg-black/5 text-black/60'
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
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#18181A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E53E3E]" />
              Live Route & Operational Advisories for {selectedTrain.trainNumber}
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Section Interlocking & Signal Aspect
                  </span>
                  <span className="font-['Space_Mono',monospace] text-emerald-700 font-bold uppercase">CLEAR GREEN</span>
                </div>
                <p className="text-xs text-black/70">
                  Signals on the upcoming section between {selectedTrain.currentLocationName} and {selectedTrain.nextStationName} are operating in automatic permissive block mode.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A]">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#E53E3E]" />
                    Speed & Recovery Advisory
                  </span>
                  <span className="font-['Space_Mono',monospace] text-[#E53E3E] font-bold">+4 min recovery buffer</span>
                </div>
                <p className="text-xs text-black/70">
                  Engineering recovery slack of 8 minutes is factored into downstream section approaching {selectedTrain.destinationName}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-black/5 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#18181A]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-black/60" />
                    Passenger Facility & Baggage Advisory
                  </span>
                  <span className="font-['Space_Mono',monospace] text-black/50 font-bold">Standard</span>
                </div>
                <p className="text-xs text-black/70">
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
