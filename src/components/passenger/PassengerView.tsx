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

  // Live PNR States
  const [pnrData, setPnrData] = useState<any>(null);
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState<string | null>(null);

  // Live Schedule States
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Live Search Train States
  const [searchTrainData, setSearchTrainData] = useState<any>(null);
  const [searchTrainLoading, setSearchTrainLoading] = useState(false);
  const [searchTrainError, setSearchTrainError] = useState<string | null>(null);

  // Find target stop in the selected train
  const targetStop: StationStop = 
    selectedTrain.stops.find((s) => s.stationCode === destinationCode) || 
    selectedTrain.stops[selectedTrain.stops.length - 1];

  // Calculate suggested arrival time at station (18 mins prior to predicted ETA)
  const predictedMins = parseTimeToMinutes(targetStop.predictedArrival);
  const suggestedStationArrival = formatMinutesToTime(predictedMins - 18);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchNo.trim();

    // Reset Search Train Data
    setSearchTrainData(null);
    setSearchTrainError(null);

    // Handle 10-digit live PNR API request
    if (/^\d{10}$/.test(query)) {
      setPnrLoading(true);
      setPnrError(null);
      setPnrData(null);
      setScheduleData(null);
      setScheduleError(null);
      try {
        const response = await fetch(`/api/pnr/${query}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch PNR status from IRCTC');
        }
        
        setPnrData(data);
      } catch (err: any) {
        setPnrError(err.message || 'Unable to fetch PNR data');
      } finally {
        setPnrLoading(false);
      }
      return;
    }

    // Handle 5-digit live Train Schedule API request
    if (/^\d{5}$/.test(query)) {
      setScheduleLoading(true);
      setScheduleError(null);
      setScheduleData(null);
      setPnrData(null);
      setPnrError(null);
      
      try {
        // Fetch Official IRCTC Live Telemetry (via RailRadar proxy in server)
        const tsResponse = await fetch(`/api/train-status/${query}`);
        const tsData = await tsResponse.json();
        
        if (tsResponse.ok && tsData.success) {
          onSelectTrain(tsData.data);
          setDestinationCode(tsData.data.destination);
        } else {
          // Fallback to local simulated array if API fails
          const found = trains.find((t) => t.trainNumber === query);
          if (found) {
            onSelectTrain(found);
            setDestinationCode(found.destination);
          }
        }

        // Parallel fetch for Schedule Table view
        const response = await fetch(`/api/schedule/${query}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch train schedule from IRCTC');
        }
        
        setScheduleData(data);
      } catch (err: any) {
        setScheduleError(err.message || 'Unable to fetch Train Schedule data');
      } finally {
        setScheduleLoading(false);
      }
      return; // Stop execution, we already loaded the train (live or sim)
    } else if (query.length >= 2 && !/^\d{10}$/.test(query)) {
      // General Train Search query
      setSearchTrainLoading(true);
      setPnrData(null);
      setPnrError(null);
      try {
        const response = await fetch(`/api/search-train?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to search trains from IRCTC');
        }
        
        setSearchTrainData(data);
      } catch (err: any) {
        setSearchTrainError(err.message || 'Unable to search trains');
      } finally {
        setSearchTrainLoading(false);
      }
    }

    // Default simulation search
    const found = trains.find(
      (t) => t.trainNumber === query || t.trainName.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      onSelectTrain(found);
      setDestinationCode(found.destination);
      setPnrData(null);
      setPnrError(null);
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
      
      <div className="pt-2 pb-2">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink tracking-tight">SMART ETA Live Tracking</h1>
        <p className="text-ink/60 mt-2 sm:mt-3 font-mono-code text-sm sm:text-base uppercase tracking-wider">Passenger Commuter Portal</p>
        
        {/* Central Search Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="relative">
              <Search className="w-5 h-5 text-ink/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="Search Train No. (e.g. 22436, 12951...)"
                className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-xl text-base font-bold text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="md:col-span-4 lg:col-span-6">
            <select
              value={destinationCode}
              onChange={(e) => setDestinationCode(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-base font-bold text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent truncate"
            >
              {selectedTrain.stops.map((s) => (
                <option key={s.stationCode} value={s.stationCode} className="bg-surface text-ink">
                  Target Destination: {s.stationName} ({s.stationCode})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 lg:col-span-2 flex items-stretch">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full min-h-[50px] bg-accent hover:opacity-90 text-on-accent rounded-xl text-sm font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center border-none shadow-xs"
            >
              Track Live
            </motion.button>
          </div>
        </form>
      </div>

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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-mono-code font-bold uppercase tracking-wider border border-orange-500/30">
                <AlertCircle className="w-3 h-3" />
                PREDICTIVE SIMULATION MODE
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

      {/* LIVE PNR DATA SECTION (Rendered only if valid PNR fetched) */}
      <AnimatePresence>
        {(pnrLoading || pnrError || pnrData) && (
          <motion.section
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="bg-surface p-6 sm:p-8 rounded-3xl border border-accent/40 shadow-xs relative overflow-hidden"
          >
            {pnrLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="font-mono-code text-xs uppercase tracking-widest text-ink/60">Fetching Live IRCTC PNR Status...</span>
              </div>
            )}
            
            {pnrError && (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-red-500">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="font-mono-code text-sm uppercase tracking-wider">{pnrError}</span>
              </div>
            )}

            {pnrData && !pnrLoading && !pnrError && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 text-accent text-[10px] font-mono-code font-bold uppercase tracking-widest mb-2">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED IRCTC TICKET
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight">
                      PNR: {pnrData?.data?.pnr_number || pnrData?.pnr_number || searchNo}
                    </h2>
                    <p className="text-sm font-medium text-ink/70">
                      {pnrData?.data?.train_number || pnrData?.train_number} • {pnrData?.data?.train_name || pnrData?.train_name}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-mono-code uppercase text-ink/60 tracking-wider">Journey Date</p>
                    <p className="text-lg font-bold">{pnrData?.data?.journey_date || pnrData?.journey_date || 'N/A'}</p>
                    <p className="text-sm font-medium text-ink/70">Class: {pnrData?.data?.class || pnrData?.class || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono-code font-bold uppercase tracking-widest text-ink/50 mb-4">Passenger Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(pnrData?.data?.passengers || pnrData?.passengers || []).map((pax: any, idx: number) => (
                      <div key={idx} className="bg-surface-dark p-4 rounded-xl border border-border flex flex-col justify-between">
                        <span className="text-[10px] font-mono-code uppercase tracking-wider text-ink/60 mb-1">Passenger {idx + 1}</span>
                        <div className="font-bold text-lg">{pax.current_status || pax.currentStatus || 'CONFIRMED'}</div>
                        <div className="text-xs font-medium text-ink/70 mt-1">Booking: {pax.booking_status || pax.bookingStatus || 'N/A'}</div>
                      </div>
                    ))}
                    {!(pnrData?.data?.passengers || pnrData?.passengers)?.length && (
                      <div className="text-sm text-ink/60 italic">Passenger details unavailable for this PNR.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* LIVE TRAIN SCHEDULE SECTION (Rendered only if valid Schedule fetched) */}
      <AnimatePresence>
        {(scheduleLoading || scheduleError || scheduleData) && (
          <motion.section
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="bg-surface p-6 sm:p-8 rounded-3xl border border-accent/40 shadow-xs relative overflow-hidden mt-6"
          >
            {scheduleLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="font-mono-code text-xs uppercase tracking-widest text-ink/60">Fetching Live Train Schedule...</span>
              </div>
            )}
            
            {scheduleError && (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-red-500">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="font-mono-code text-sm uppercase tracking-wider">{scheduleError}</span>
              </div>
            )}

            {scheduleData && !scheduleLoading && !scheduleError && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono-code font-bold uppercase tracking-widest mb-2 border border-blue-500/20">
                      <Clock className="w-3 h-3" /> OFFICIAL LIVE SCHEDULE
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight">
                      {scheduleData?.data?.trainName || scheduleData?.trainName || 'Train'} ({scheduleData?.data?.trainNumber || scheduleData?.trainNumber || searchNo})
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-mono-code uppercase tracking-wider text-ink/50">
                        <th className="py-3 px-4">Station</th>
                        <th className="py-3 px-4">Arrive</th>
                        <th className="py-3 px-4">Depart</th>
                        <th className="py-3 px-4">Dist (km)</th>
                        <th className="py-3 px-4">Day</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(scheduleData?.data?.route || scheduleData?.route || scheduleData?.data?.stationList || scheduleData?.stationList || []).map((stop: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/20 last:border-0 hover:bg-surface-dark/50 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            {stop.stationName || stop.station_name} <span className="text-xs text-ink/50 font-mono-code">({stop.stationCode || stop.station_code})</span>
                          </td>
                          <td className="py-3 px-4 font-mono-code">{stop.arrivalTime || stop.arrival_time || '--'}</td>
                          <td className="py-3 px-4 font-mono-code">{stop.departureTime || stop.departure_time || '--'}</td>
                          <td className="py-3 px-4">{stop.distance || stop.distanceFromSource || stop.distance_from_source || 0}</td>
                          <td className="py-3 px-4">{stop.day || stop.day_of_journey || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!(scheduleData?.data?.route || scheduleData?.route || scheduleData?.data?.stationList || scheduleData?.stationList)?.length && (
                    <div className="text-sm text-ink/60 italic py-4 px-4">Schedule route details unavailable.</div>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* LIVE TRAIN SEARCH RESULTS SECTION (Rendered only if valid Search fetched) */}
      <AnimatePresence>
        {(searchTrainLoading || searchTrainError || searchTrainData) && (
          <motion.section
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="bg-surface p-6 sm:p-8 rounded-3xl border border-accent/40 shadow-xs relative overflow-hidden mt-6"
          >
            {searchTrainLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="font-mono-code text-xs uppercase tracking-widest text-ink/60">Searching IRCTC Trains...</span>
              </div>
            )}
            
            {searchTrainError && (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-red-500">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="font-mono-code text-sm uppercase tracking-wider">{searchTrainError}</span>
              </div>
            )}

            {searchTrainData && !searchTrainLoading && !searchTrainError && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono-code font-bold uppercase tracking-widest mb-2 border border-purple-500/20">
                      <Train className="w-3 h-3" /> OFFICIAL IRCTC TRAIN DIRECTORY
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight">
                      Search Results for "{searchNo}"
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-mono-code uppercase tracking-wider text-ink/50">
                        <th className="py-3 px-4">Train Number</th>
                        <th className="py-3 px-4">Train Name</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(searchTrainData?.data || searchTrainData?.trains || []).map((train: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/20 last:border-0 hover:bg-surface-dark/50 transition-colors">
                          <td className="py-3 px-4 font-mono-code font-medium">{train.trainNumber || train.train_number || '--'}</td>
                          <td className="py-3 px-4 font-bold">{train.trainName || train.train_name || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!(searchTrainData?.data || searchTrainData?.trains)?.length && (
                    <div className="text-sm text-ink/60 italic py-4 px-4">No trains found matching this query.</div>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

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
