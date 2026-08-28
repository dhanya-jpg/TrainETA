import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ArrowRight,
  Calendar
} from 'lucide-react';
import { TrainData, AuthUser, StationStop } from '../../types';
import { formatMinutesToTime, parseTimeToMinutes } from '../../services/etaPredictionService';
import { LiveTrainMap } from '../map/LiveTrainMap';

// Helper to format date strings to actual calendar dates
const formatWithDate = (timeStr: string) => {
  if (!timeStr) return '';
  const now = new Date();
  const [hours, mins] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(mins)) return timeStr;
  
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
  if (targetDate.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
    // If it's more than 12 hours in the past, it's likely tomorrow's train
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ' ' + timeStr;
};

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, rotateX: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 24 } }
  };

  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  return (
    <div className="w-full space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-12 overflow-x-hidden text-ink">
      
      {/* 1. COMPACT HEADER BAR */}
      <motion.section 
        layoutId="passenger-header"
        className="bg-surface p-5 sm:p-7 rounded-3xl border border-border shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/15 text-accent text-xs font-mono-code font-bold uppercase tracking-wider border border-accent/30">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                LIVE COMMUTER PORTAL
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono-code font-bold uppercase ${
                selectedTrain.currentDelayMinutes > 5
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-green-500/30'
              }`}>
                {selectedTrain.currentDelayMinutes > 0
                  ? `+${selectedTrain.currentDelayMinutes} MIN DELAYED`
                  : 'RUNNING ON SCHEDULE'}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-display text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight uppercase text-ink">
                {selectedTrain.trainNumber} • {selectedTrain.trainName}
              </h1>
            </div>

            <p className="text-sm text-ink/70 font-medium max-w-3xl">
              {selectedTrain.sourceName} → {selectedTrain.destinationName} • Near <strong className="text-ink">{selectedTrain.currentLocationName}</strong> at <span className="font-mono-code font-bold text-accent">{selectedTrain.currentSpeedKmH} km/h</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareETA}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:opacity-90 text-on-accent rounded-xl text-sm font-bold transition-all border-none cursor-pointer shadow-xs"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-on-accent" />
                  <span>ETA COPIED!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>SHARE LIVE ETA</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* 2. SIGNATURE STAT METRICS (3-Column Dense Grid) */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show" viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Card 1: Selected Train & Route */}
        <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-accent/40 transition-colors">
          <div className="relative z-10">
            <div className="font-mono-code text-xs uppercase tracking-[0.12em] text-ink/60 mb-2">
              Active Train & Status
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-ink leading-tight tracking-tight">
              {selectedTrain.trainNumber}
            </div>
          </div>
          <div className="relative z-10 font-mono-code text-xs text-ink/70 uppercase tracking-[0.05em] mt-6 pt-4 border-t border-border truncate">
            {selectedTrain.sourceName.split(' ')[0]} → {selectedTrain.destinationName.split(' ')[0]} • Next: {selectedTrain.nextStationName}
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none">
            <Train className="w-48 h-48" />
          </div>
        </motion.div>

        {/* Card 2: Dynamic ETA to Target Stop */}
        <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div>
            <div className="font-mono-code text-xs uppercase tracking-[0.12em] text-ink/60 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" /> Predicted Arrival @ {targetStop.stationCode}
            </div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-accent leading-tight tracking-tight">
              {formatWithDate(targetStop.predictedArrival)}
            </div>
          </div>
          <div className="font-mono-code text-xs text-ink/70 uppercase tracking-[0.05em] mt-6 pt-4 border-t border-border truncate flex items-center gap-2">
            Window: {targetStop.etaRange} • {targetStop.confidenceScore}% Conf
          </div>
        </motion.div>

        {/* Card 3: Boarding Advisory */}
        <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-1 hover:border-accent/40 transition-colors">
          <div>
            <div className="font-mono-code text-xs uppercase tracking-[0.12em] text-accent font-bold mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Station Arrival Advisory
            </div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-ink leading-tight tracking-tight">
              Arrive by {formatWithDate(suggestedStationArrival)}
            </div>
          </div>
          <div className="font-mono-code text-xs text-ink/70 uppercase tracking-[0.05em] mt-6 pt-4 border-t border-border truncate">
            Platform #{targetStop.platform} • 18m Security Slack
          </div>
        </motion.div>
      </motion.section>

      {/* 3. TRAIN CONTROLS & DESTINATION SELECTOR BAR */}
      <motion.section layout className="bg-surface p-5 sm:p-7 rounded-3xl border border-border shadow-xs space-y-5">
        {/* Active Train Quick Selector Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <span className="font-mono-code text-[11px] font-bold text-ink/50 uppercase tracking-widest shrink-0 mr-2">
            QUICK SWITCH:
          </span>
          {trains.map((t) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={t.id}
              onClick={() => {
                onSelectTrain(t);
                setSearchNo(t.trainNumber);
                setDestinationCode(t.destination);
              }}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer border ${
                selectedTrain.id === t.id
                  ? 'bg-accent text-on-accent border-accent shadow-xs'
                  : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
              }`}
            >
              {t.trainNumber} • {t.trainName.split(' ')[0]}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-border">
          <div className="md:col-span-5 lg:col-span-4">
            <label className="font-mono-code text-[11px] font-bold text-ink/50 uppercase tracking-widest block mb-2">
              Search Train No. or Name
            </label>
            <div className="relative">
              <Train className="w-5 h-5 text-ink/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="e.g. 22436, 12951..."
                className="w-full pl-12 pr-4 py-3 bg-surface-dark border border-border rounded-xl text-sm font-bold text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-6">
            <label className="font-mono-code text-[11px] font-bold text-ink/50 uppercase tracking-widest block mb-2">
              Select Your Destination Station
            </label>
            <select
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-border rounded-xl text-sm font-bold text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent truncate"
            >
              {selectedTrain.stops.map((s) => (
                <option key={s.stationCode} value={s.stationCode} className="bg-surface text-ink">
                  {s.stationName} ({s.stationCode}) — Sch {s.scheduledArrival} | AI: {s.predictedArrival}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 lg:col-span-2 flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full h-[46px] bg-accent hover:opacity-90 text-on-accent rounded-xl text-sm font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center border-none shadow-xs"
            >
              Apply Filter
            </motion.button>
          </div>
        </form>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-3 pt-5 border-t border-border overflow-x-auto pb-2 scrollbar-thin">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveSubTab('eta')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
              activeSubTab === 'eta'
                ? 'bg-accent text-on-accent border-accent shadow-xs'
                : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeSubTab === 'eta' ? 'text-on-accent' : 'text-accent'}`} />
            <span>Live ETA Details</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveSubTab('map')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
              activeSubTab === 'map'
                ? 'bg-accent text-on-accent border-accent shadow-xs'
                : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
            }`}
          >
            <MapIcon className={`w-4 h-4 ${activeSubTab === 'map' ? 'text-on-accent' : 'text-accent'}`} />
            <span>Interactive Map</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveSubTab('schedule')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
              activeSubTab === 'schedule'
                ? 'bg-accent text-on-accent border-accent shadow-xs'
                : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
            }`}
          >
            <ListOrdered className={`w-4 h-4 ${activeSubTab === 'schedule' ? 'text-on-accent' : 'text-accent'}`} />
            <span>Station Timetable ({selectedTrain.stops.length})</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveSubTab('advisory')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
              activeSubTab === 'advisory'
                ? 'bg-accent text-on-accent border-accent shadow-xs'
                : 'bg-surface-dark text-ink/70 hover:bg-surface border-border'
            }`}
          >
            <BellRing className={`w-4 h-4 ${activeSubTab === 'advisory' ? 'text-on-accent' : 'text-accent'}`} />
            <span>Commuter Advisories</span>
          </motion.button>
        </div>
      </motion.section>

      {/* 4. TAB CONTENTS wrapped in AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSubTab}
          variants={fadeVariants}
          initial="hidden"
          whileInView="show" viewport={{ once: true, margin: "-50px" }}
          exit="exit"
        >
          {/* SUB-VIEW 1: LIVE ETA & TELEMETRY BREAKDOWN */}
          {activeSubTab === 'eta' && (
            <section className="space-y-6">
              <div className="bg-surface rounded-3xl border border-border shadow-xs p-6 sm:p-8 lg:p-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-accent/15 text-accent border border-accent/30">
                        {selectedTrain.trainNumber}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-ink">
                        {selectedTrain.trainName}
                      </h3>
                    </div>
                    <p className="text-sm text-ink/60 font-medium mt-2">
                      {selectedTrain.sourceName} → {selectedTrain.destinationName} • Currently near <strong className="text-ink">{selectedTrain.currentLocationName}</strong>
                    </p>
                  </div>

                  <div>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-mono-code font-bold ${
                      selectedTrain.currentDelayMinutes > 5
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-green-500/30'
                    }`}>
                      {selectedTrain.currentDelayMinutes > 0
                        ? `RUNNING +${selectedTrain.currentDelayMinutes} MIN DELAYED`
                        : 'RUNNING ON SCHEDULE'}
                    </span>
                  </div>
                </div>

                {/* Live Journey Motion Progress Track */}
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-dark border border-border space-y-6">
                  <div className="flex items-center justify-between text-sm font-bold text-ink">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="font-mono-code uppercase tracking-wider text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">
                        Live Rail Motion
                      </span>
                    </div>
                    <div className="font-mono-code text-xs text-ink/60">
                      {selectedTrain.currentSpeedKmH} km/h • {selectedTrain.distanceToNextStationKm.toFixed(1)} km to {selectedTrain.nextStationName}
                    </div>
                  </div>

                  {/* Graphical Motion Track Line */}
                  <div className="relative pt-4 pb-8">
                    <div className="h-3 bg-surface rounded-full w-full relative overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-accent transition-all duration-700 ease-linear rounded-full"
                        style={{
                          width: `${Math.max(5, Math.min(98, (selectedTrain.currentStationIndex / (selectedTrain.stops.length - 1)) * 100))}%`
                        }}
                      />
                    </div>

                    {/* Train Locomotive Marker along Track */}
                    <div 
                      className="absolute top-0 mt-[1px] transform -translate-x-1/2 transition-all duration-700 ease-linear flex flex-col items-center pointer-events-none"
                      style={{
                        left: `${Math.max(5, Math.min(95, (selectedTrain.currentStationIndex / (selectedTrain.stops.length - 1)) * 100))}%`
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center shadow-lg border-2 border-border animate-bounce">
                        <Train className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono-code font-bold text-ink whitespace-nowrap mt-2 bg-surface-dark px-1.5 py-0.5 rounded border border-border">
                        {selectedTrain.currentSpeedKmH} km/h
                      </span>
                    </div>

                    {/* Origin and Destination Labels */}
                    <div className="flex justify-between text-xs font-bold text-ink/70 mt-4 pt-2 font-mono-code">
                      <span>{selectedTrain.sourceName} ({selectedTrain.source})</span>
                      <span className="text-center text-accent">
                        Next: {selectedTrain.nextStationName}
                      </span>
                      <span>{selectedTrain.destinationName} ({selectedTrain.destination})</span>
                    </div>
                  </div>
                </div>

                {/* In-depth Telemetry Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <motion.div whileHover={{ y: -2 }} className="p-5 rounded-xl bg-surface-dark border border-border text-sm transition-transform">
                    <div className="font-mono-code text-ink/50 font-bold text-[11px] uppercase tracking-wider mb-2">
                      Current Speed
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-ink font-mono-code">
                      {selectedTrain.currentSpeedKmH} km/h
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="p-5 rounded-xl bg-surface-dark border border-border text-sm transition-transform">
                    <div className="font-mono-code text-ink/50 font-bold text-[11px] uppercase tracking-wider mb-2">
                      Approaching Stop
                    </div>
                    <div className="text-base sm:text-lg font-bold text-ink truncate">
                      {selectedTrain.nextStationName}
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="p-5 rounded-xl bg-surface-dark border border-border text-sm transition-transform">
                    <div className="font-mono-code text-ink/50 font-bold text-[11px] uppercase tracking-wider mb-2">
                      Distance to Next
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-ink font-mono-code">
                      {selectedTrain.distanceToNextStationKm.toFixed(1)} km
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="p-5 rounded-xl bg-surface-dark border border-border text-sm transition-transform">
                    <div className="font-mono-code text-ink/50 font-bold text-[11px] uppercase tracking-wider mb-2">
                      Platform Assg
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-accent font-mono-code">
                      PF #{targetStop.platform}
                    </div>
                  </motion.div>
                </div>

                {/* Confidence Window Bar */}
                <div className="p-5 sm:p-6 rounded-xl bg-surface-dark border border-border text-ink flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-accent shrink-0" />
                    <span>
                      <strong className="text-ink">90% Confidence Arrival Window:</strong>{' '}
                      <span className="font-mono-code text-accent font-bold text-base">{targetStop.etaRange}</span>
                    </span>
                  </div>
                  <div className="font-mono-code text-xs text-ink/60 bg-surface px-3 py-1.5 rounded-lg border border-border">
                    Model: Dynamic Gradient Boosted Regressor (XGBoost)
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SUB-VIEW 2: INTERACTIVE LIVE MAP */}
          {activeSubTab === 'map' && (
            <section className="bg-surface p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-ink font-display">
                    Live Route & GPS Telemetry: {selectedTrain.trainNumber} - {selectedTrain.trainName}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink/60 font-medium mt-0.5 sm:mt-1">
                    Live track telemetry, station waypoints, and animated train location.
                  </p>
                </div>
                <span className="font-mono-code text-xs sm:text-sm font-bold bg-surface-dark text-ink border border-border px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl self-start sm:self-auto">
                  {selectedTrain.currentSpeedKmH} KM/H
                </span>
              </div>
              <div className="h-[380px] sm:h-[500px] md:h-[600px] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border">
                <LiveTrainMap train={selectedTrain} />
              </div>
            </section>
          )}

          {/* SUB-VIEW 3: COMPLETE STATION SCHEDULE */}
          {activeSubTab === 'schedule' && (
            <section className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-border bg-surface-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">
                    Station Timetable & Arrival Forecast ({selectedTrain.stops.length} Stops)
                  </h3>
                  <p className="text-sm text-ink/60 font-medium mt-1">
                    Official scheduled timetable compared against live ML dynamic ETA.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead className="bg-surface-dark/50 text-ink/50 font-mono-code uppercase text-[11px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-4 px-6">Station</th>
                      <th className="py-4 px-4">Distance</th>
                      <th className="py-4 px-4">Scheduled</th>
                      <th className="py-4 px-4">AI Expected</th>
                      <th className="py-4 px-4">Platform</th>
                      <th className="py-4 px-4">Delay</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show" viewport={{ once: true, margin: "-50px" }}
                    className="divide-y divide-border font-medium text-ink"
                  >
                    {selectedTrain.stops.map((stop) => {
                      const isDestination = stop.stationCode === destinationCode;
                      return (
                        <motion.tr 
                          variants={itemVariants}
                          key={stop.stationCode}
                          className={`hover:bg-surface-dark transition-colors ${
                            isDestination ? 'bg-accent/10 font-bold' : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-ink flex items-center gap-2">
                              {stop.stationName}
                              {isDestination && (
                                <span className="text-[10px] font-mono-code font-bold bg-accent text-on-accent px-2 py-0.5 rounded-md">
                                  DESTINATION
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono-code text-ink/50 mt-1">
                              {stop.stationCode}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono-code text-ink/60">
                            {stop.distanceKm} km
                          </td>
                          <td className="py-4 px-4 font-mono-code">
                            {formatWithDate(stop.scheduledArrival)}
                          </td>
                          <td className="py-4 px-4 font-mono-code text-ink font-bold">
                            {formatWithDate(stop.predictedArrival)}
                            <span className="block text-[11px] text-ink/50 font-normal mt-0.5">
                              {stop.etaRange}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono-code font-bold text-ink/70">
                            PF {stop.platform}
                          </td>
                          <td className="py-4 px-4 font-mono-code">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              stop.predictedDelayMinutes > 5
                                ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes}m` : 'On Time'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`text-[11px] font-mono-code font-bold uppercase px-3 py-1.5 rounded-full ${
                              stop.status === 'DEPARTED'
                                ? 'bg-surface-dark text-ink/40 border border-border'
                                : stop.status === 'CURRENT'
                                ? 'bg-accent text-on-accent'
                                : stop.status === 'NEXT'
                                ? 'bg-accent/20 text-accent border border-accent/40'
                                : 'bg-surface-dark text-ink/60 border border-border'
                            }`}>
                              {stop.status}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            </section>
          )}

          {/* SUB-VIEW 4: TRAVEL ADVISORIES */}
          {activeSubTab === 'advisory' && (
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              whileInView="show" viewport={{ once: true, margin: "-50px" }}
              className="space-y-6"
            >
              <div className="bg-surface p-6 sm:p-8 lg:p-10 rounded-3xl border border-border shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-ink font-display flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                  Live Route & Operational Advisories for {selectedTrain.trainNumber}
                </h3>

                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="p-5 sm:p-6 rounded-xl bg-surface-dark border border-border space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-ink">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Section Interlocking & Signal Aspect
                      </span>
                      <span className="font-mono-code text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">CLEAR GREEN</span>
                    </div>
                    <p className="text-sm text-ink/70 leading-relaxed ml-7">
                      Signals on the upcoming section between {selectedTrain.currentLocationName} and {selectedTrain.nextStationName} are operating in automatic permissive block mode.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="p-5 sm:p-6 rounded-xl bg-surface-dark border border-border space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-ink">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                        Speed & Recovery Advisory
                      </span>
                      <span className="font-mono-code text-accent font-bold bg-accent/15 px-3 py-1 rounded-md text-xs border border-accent/30">+4 min buffer</span>
                    </div>
                    <p className="text-sm text-ink/70 leading-relaxed ml-7">
                      Engineering recovery slack of 8 minutes is factored into downstream section approaching {selectedTrain.destinationName}.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="p-5 sm:p-6 rounded-xl bg-surface-dark border border-border space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-ink">
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-ink/60 shrink-0" />
                        Passenger Facility & Baggage Advisory
                      </span>
                      <span className="font-mono-code text-ink/60 font-bold bg-surface px-3 py-1 rounded-md text-xs border border-border">Standard</span>
                    </div>
                    <p className="text-sm text-ink/70 leading-relaxed ml-7">
                      Wheelchair assistance, battery carts, and prepaid taxi booths available at Platform 1 & 3 of major junction stops.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};
