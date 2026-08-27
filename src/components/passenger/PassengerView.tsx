import React, { useState } from 'react';
import { 
  Train, 
  Search, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Info, 
  ArrowRight,
  AlertCircle,
  Map as MapIcon,
  ListOrdered,
  BellRing,
  Share2,
  CheckCircle2,
  Navigation,
  Gauge,
  Calendar,
  Layers
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
    const summary = `🚆 Live ETA Update for Train ${selectedTrain.trainNumber} (${selectedTrain.trainName}):\n• Reaching ${targetStop.stationName} at ~${targetStop.predictedArrival} (Window: ${targetStop.etaRange})\n• Delay: ${selectedTrain.currentDelayMinutes} min\n• Recommended Station Arrival: ~${suggestedStationArrival} (PF ${targetStop.platform})\n• Tracked live on SMART ETA.`;
    navigator.clipboard?.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Passenger Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PASSENGER COMMUTER PORTAL
              </span>
              {currentUser?.pnrOrTicket && (
                <span className="text-xs text-blue-200 font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700">
                  {currentUser.pnrOrTicket}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {currentUser?.name || 'Commuter'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 font-medium mt-1">
              Dynamic AI-driven arrival forecasts, confidence windows, and live track tracking.
            </p>
          </div>

          {/* Quick Share ETA */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareETA}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all border border-blue-400/30 shadow-md cursor-pointer"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>ETA Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Live ETA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Train Selector Chips */}
        <div className="mt-5 pt-4 border-t border-blue-800/60 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider shrink-0 mr-1">
            Active Trains:
          </span>
          {trains.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTrain(t);
                setSearchNo(t.trainNumber);
                setDestinationCode(t.destination);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTrain.id === t.id
                  ? 'bg-white text-blue-950 shadow-md scale-105'
                  : 'bg-blue-950/60 text-blue-200 hover:bg-blue-800/80 border border-blue-800/80'
              }`}
            >
              {t.trainNumber} • {t.trainName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Train Lookup / Destination Selector Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select or Search Train
            </label>
            <div className="relative">
              <Train className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="Train Number or Name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Destination Station
            </label>
            <select
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedTrain.stops.map((s) => (
                <option key={s.stationCode} value={s.stationCode}>
                  {s.stationName} ({s.stationCode}) — Scheduled {s.scheduledArrival}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
            >
              Refresh
            </button>
          </div>
        </form>

        {/* View Mode Navigation Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('eta')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'eta'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live ETA & Advisory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Journey Map</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Station Timetable ({selectedTrain.stops.length} Stops)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'advisory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Travel Advisories</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: LIVE ETA & COMMUTER ADVISORY */}
      {activeSubTab === 'eta' && (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedTrain.trainNumber}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedTrain.trainName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {selectedTrain.sourceName} → {selectedTrain.destinationName} • Currently near <strong>{selectedTrain.currentLocationName}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                  selectedTrain.currentDelayMinutes > 5
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {selectedTrain.currentDelayMinutes > 0
                    ? `Running ${selectedTrain.currentDelayMinutes} minutes late`
                    : 'Running exactly on schedule'}
                </span>
              </div>
            </div>

            {/* Expected Arrival Hero Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Main ETA Box */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#0A192F] to-[#1E293B] text-white p-6 sm:p-7 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Expected Arrival at {targetStop.stationName} ({targetStop.stationCode})
                  </span>
                  <span className="font-mono text-emerald-400 font-black flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI PREDICTED
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                    {targetStop.predictedArrival}
                  </div>
                  <div className="text-xs text-slate-300">
                    (Scheduled: <strong className="text-white font-mono">{targetStop.scheduledArrival}</strong>)
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-slate-700/80">
                  <div>
                    <span className="text-slate-400">90% Confidence Window:</span>{' '}
                    <strong className="text-amber-400 font-mono font-bold">{targetStop.etaRange}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">ML Confidence:</span>{' '}
                    <strong className="text-emerald-400 font-mono font-bold">{targetStop.confidenceScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Expected Platform:</span>{' '}
                    <strong className="text-blue-400 font-mono font-bold">PF #{targetStop.platform}</strong>
                  </div>
                </div>
              </div>

              {/* Recommended Station Arrival Box */}
              <div className="bg-blue-50/90 border border-blue-200 p-6 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Commuter Advisory
                  </span>
                  <div className="text-sm font-extrabold text-blue-950">
                    Recommended Station Arrival
                  </div>
                </div>

                <div className="text-3xl font-black font-mono text-blue-700">
                  ~{suggestedStationArrival}
                </div>

                <p className="text-[11px] text-blue-800 leading-snug font-medium">
                  We recommend arriving at <strong>{targetStop.stationName}</strong> station by <strong>~{suggestedStationArrival}</strong> (approx 18 mins before predicted arrival) for smooth boarding and security screening.
                </p>
              </div>
            </div>

            {/* Live Journey Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Current Speed</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {selectedTrain.currentSpeedKmH} km/h
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Next Upcoming Stop</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {selectedTrain.nextStationName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Distance to Next Stop</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {selectedTrain.distanceToNextStationKm} km
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Route Status</div>
                <div className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  Track Clear
                </div>
              </div>
            </div>

            {/* Disclaimer Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Commuter Notice:</strong> This dynamic arrival forecast is updated continuously using Indian Railways GPS telemetry, signal aspect data, and XGBoost ML regression models. Platform numbers are subject to last-minute operational station controller adjustments.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: INTERACTIVE LIVE MAP */}
      {activeSubTab === 'map' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Live GPS Position: {selectedTrain.trainNumber} - {selectedTrain.trainName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live track telemetry, station waypoints, and animated train location.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              Speed: {selectedTrain.currentSpeedKmH} km/h
            </span>
          </div>
          <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200">
            <LiveTrainMap train={selectedTrain} />
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: STATION SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Complete Route Timetable & Platform Forecast
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comparing scheduled timetable vs. live ML dynamic predictions for all {selectedTrain.stops.length} stations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {selectedTrain.stops.map((stop) => {
                  const isDestination = stop.stationCode === destinationCode;
                  return (
                    <tr 
                      key={stop.stationCode}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDestination ? 'bg-blue-50/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          {stop.stationName}
                          {isDestination && (
                            <span className="text-[9px] font-mono font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">
                              YOUR DESTINATION
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {stop.stationCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {stop.distanceKm} km
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        {stop.scheduledArrival}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-blue-700 font-bold">
                        {stop.predictedArrival}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {stop.etaRange}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        PF {stop.platform}
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          stop.predictedDelayMinutes > 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes}m` : 'On Time'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          stop.status === 'DEPARTED'
                            ? 'bg-slate-100 text-slate-500'
                            : stop.status === 'CURRENT'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : stop.status === 'NEXT'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
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
        </div>
      )}

      {/* SUB-VIEW 4: TRAVEL ADVISORIES */}
      {activeSubTab === 'advisory' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Live Route & Operational Advisories for {selectedTrain.trainNumber}
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Section Interlocking & Signal Aspect
                  </span>
                  <span className="font-mono text-emerald-600 font-black uppercase">CLEAR GREEN</span>
                </div>
                <p className="text-xs text-blue-800">
                  Signals on the upcoming section between {selectedTrain.currentLocationName} and {selectedTrain.nextStationName} are operating in automatic permissive block mode.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Speed & Recovery Advisory
                  </span>
                  <span className="font-mono text-amber-800 font-bold">+4 min recovery buffer</span>
                </div>
                <p className="text-xs text-amber-800">
                  Engineering recovery slack of 8 minutes is factored into downstream section approaching {selectedTrain.destinationName}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-600" />
                    Passenger Facility & Baggage Advisory
                  </span>
                  <span className="font-mono text-slate-500 font-bold">Standard</span>
                </div>
                <p className="text-xs text-slate-600">
                  Wheelchair assistance, battery carts, and prepaid taxi booths available at Platform 1 & 3 of major junction stops.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
