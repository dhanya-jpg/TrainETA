import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary, Pin } from '@vis.gl/react-google-maps';
import { TrainData } from '../../types';
import { 
  Gauge, 
  Clock, 
  MapPin, 
  LocateFixed, 
  Maximize2, 
  Crosshair,
  Train as TrainIcon
} from 'lucide-react';
import { calculateBearing } from '../../services/trainSimulationEngine';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const PolylinesLayer = ({ train }: { train: TrainData }) => {
  const map = useMap();
  const maps = useMapsLibrary('maps');
  const [polylines, setPolylines] = useState<{
    trackBed: google.maps.Polyline | null;
    passed: google.maps.Polyline | null;
    upcoming: google.maps.Polyline | null;
  }>({ trackBed: null, passed: null, upcoming: null });

  useEffect(() => {
    if (!map || !maps) return;

    const trackBed = new maps.Polyline({
      strokeColor: '#0F172A',
      strokeOpacity: 0.8,
      strokeWeight: 6,
      map
    });

    const passed = new maps.Polyline({
      strokeColor: '#10B981',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map
    });
    // Add dot/dash pattern to passed route
    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3
    };
    passed.setOptions({
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '20px'
      }],
      strokeOpacity: 0
    });

    const upcoming = new maps.Polyline({
      strokeColor: '#2563EB',
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map
    });

    setPolylines({ trackBed, passed, upcoming });

    return () => {
      trackBed.setMap(null);
      passed.setMap(null);
      upcoming.setMap(null);
    };
  }, [map, maps]);

  useEffect(() => {
    if (!polylines.trackBed) return;
    
    const allStopsCoords = train.stops.map(s => ({ lat: s.latitude, lng: s.longitude }));
    polylines.trackBed.setPath(allStopsCoords);

    const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
    
    const passedCoords = [
      ...train.stops.slice(0, currentIdx + 1).map(s => ({ lat: s.latitude, lng: s.longitude })),
      { lat: train.currentLatitude, lng: train.currentLongitude }
    ];
    polylines.passed?.setPath(passedCoords);

    const upcomingCoords = [
      { lat: train.currentLatitude, lng: train.currentLongitude },
      ...train.stops.slice(currentIdx + 1).map(s => ({ lat: s.latitude, lng: s.longitude }))
    ];
    
    if (polylines.upcoming) {
      polylines.upcoming.setOptions({
        strokeColor: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB'
      });
      polylines.upcoming.setPath(upcomingCoords);
    }
  }, [train, polylines]);

  return null;
};

export const LiveTrainMap: React.FC<LiveTrainMapProps> = ({ train, onSelectStation }) => {
  const map = useMap();
  const [isFollowTrain, setIsFollowTrain] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const prevTrainIdRef = useRef<string>(train.id);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    setIsLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setIsLocating(false);
      },
      (err) => { setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(train.stops.length - 1, currentIdx + 1);
  const targetStop = train.stops[nextIdx];
  const bearingAngle = targetStop ? calculateBearing(train.currentLatitude, train.currentLongitude, targetStop.latitude, targetStop.longitude) : 0;

  useEffect(() => {
    if (!map) return;
    if (isFollowTrain) {
      map.panTo({ lat: train.currentLatitude, lng: train.currentLongitude });
    }
  }, [train.currentLatitude, train.currentLongitude, isFollowTrain, map]);

  useEffect(() => {
    if (!map) return;
    if (prevTrainIdRef.current !== train.id) {
      prevTrainIdRef.current = train.id;
      handleFitRoute();
    }
  }, [train.id, map]);

  const handleFitRoute = () => {
    if (!map) return;
    setIsFollowTrain(false);
    const bounds = new google.maps.LatLngBounds();
    train.stops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
    bounds.extend({ lat: train.currentLatitude, lng: train.currentLongitude });
    if (userLocation) bounds.extend(userLocation);
    map.fitBounds(bounds, 50);
  };

  const handleFocusTrain = () => {
    if (!map) return;
    setIsFollowTrain(true);
    map.panTo({ lat: train.currentLatitude, lng: train.currentLongitude });
    map.setZoom(12);
  };

  const handleLocateUser = () => {
    if (!map) return;
    setIsFollowTrain(false);
    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    } else if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
          setUserLocation(loc);
          setIsLocating(false);
          map.panTo(loc);
          map.setZoom(14);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="relative isolate w-full h-full min-h-[360px] sm:min-h-[460px] bg-surface rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xs flex flex-col text-ink">
      {/* Top telemetry bar & Quick Status */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div className="bg-surface/95 backdrop-blur-md text-ink px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg border border-border pointer-events-auto flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold max-w-[calc(100%-48px)] sm:max-w-none overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 font-mono-code shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">
              <span className="inline sm:hidden">LIVE</span>
              <span className="hidden sm:inline">LIVE GPS • MOVING</span>
            </span>
          </div>
          <div className="h-3 w-px bg-border shrink-0"></div>
          <div className="flex items-center gap-1 text-ink font-mono-code shrink-0">
            <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
            <span className="font-bold">{train.currentSpeedKmH} <span className="text-[10px] text-ink/60">km/h</span></span>
          </div>
          <div className="h-3 w-px bg-border shrink-0"></div>
          <div className="flex items-center gap-1 text-ink shrink-0 font-mono-code">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
            <span>
              <span className="hidden sm:inline text-ink/60 font-normal">Delay: </span>
              <strong className={train.currentDelayMinutes > 5 ? 'text-accent font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : '0m'}
              </strong>
            </span>
          </div>
        </div>

        {/* Floating Controls Toolbar */}
        <div className="flex flex-col gap-1.5 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsFollowTrain(!isFollowTrain)}
            title={isFollowTrain ? "Auto-following train (click to unlock)" : "Follow train camera"}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center cursor-pointer shadow-md transition-all ${
              isFollowTrain
                ? 'bg-accent text-on-accent border-accent'
                : 'bg-surface/95 text-ink hover:text-accent border-border hover:bg-surface-dark'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFollowTrain ? 'animate-spin' : ''}`} />
          </button>
          <button 
            type="button" 
            onClick={handleFocusTrain} 
            title="Focus on Train"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors"
          >
            <TrainIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button 
            type="button" 
            onClick={handleLocateUser} 
            title="My Location"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors"
          >
            <LocateFixed className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
          <button 
            type="button" 
            onClick={handleFitRoute} 
            title="Fit Entire Route"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className="w-full flex-1 z-0 min-h-[300px] sm:min-h-[400px]">
        <Map
          defaultZoom={6}
          defaultCenter={{ lat: train.currentLatitude, lng: train.currentLongitude }}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={true}
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        >
          <PolylinesLayer train={train} />
          
          {train.stops.map((stop, index) => {
            const isOrigin = index === 0;
            const isDestination = index === train.stops.length - 1;
            const isCurrent = stop.status === 'CURRENT';
            const isNext = stop.status === 'NEXT';

            let markerBg = 'bg-slate-700 text-on-accent border-slate-800';
            let badgeLabel = `${index + 1}`;
            let sizeClass = 'w-7 h-7 text-[11px]';

            if (isOrigin) {
              markerBg = 'bg-emerald-600 text-on-accent border-emerald-800 shadow-emerald-500/30';
              badgeLabel = 'SRC';
              sizeClass = 'w-8 h-8 text-[10px] font-black';
            } else if (isDestination) {
              markerBg = 'bg-blue-600 text-on-accent border-blue-900 shadow-blue-500/30';
              badgeLabel = 'DEST';
              sizeClass = 'w-8 h-8 text-[10px] font-black';
            } else if (isCurrent) {
              markerBg = 'bg-blue-600 text-on-accent border-blue-800 ring-4 ring-blue-300 animate-pulse';
            } else if (isNext) {
              markerBg = stop.riskLevel === 'HIGH' 
                ? 'bg-red-600 text-on-accent border-red-800 ring-2 ring-red-300' 
                : 'bg-amber-500 text-on-accent border-amber-700 ring-2 ring-amber-200';
            } else if (stop.status === 'DEPARTED') {
              markerBg = 'bg-emerald-600/90 text-on-accent border-emerald-700';
            }

            return (
              <AdvancedMarker
                key={stop.stationCode}
                position={{ lat: stop.latitude, lng: stop.longitude }}
                onClick={() => onSelectStation && onSelectStation(stop.stationCode)}
              >
                <div className="relative flex items-center justify-center cursor-pointer group select-none">
                  <div className={`${sizeClass} rounded-full ${markerBg} flex items-center justify-center font-bold  border-2 transition-transform duration-200 group-hover:scale-110`}>
                    {badgeLabel}
                  </div>
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 bg-slate-900 text-on-accent text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-slate-700/80 z-50">
                    <span className="text-blue-400 font-mono">{stop.stationCode}</span> • {stop.stationName}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          <AdvancedMarker 
            position={{ lat: train.currentLatitude, lng: train.currentLongitude }}
            zIndex={1000}
          >
            <div className="relative flex items-center justify-center cursor-pointer select-none">
              <div className="absolute w-14 h-14 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
              <div className="absolute w-10 h-10 rounded-full bg-blue-400/20 animate-pulse pointer-events-none"></div>
              <div 
                className="relative w-11 h-11 rounded-full bg-[#0A192F] border-2 border-amber-400 text-on-accent flex items-center justify-center shadow-2xl transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${Math.round(bearingAngle)}deg)` }}
              >
                <div className="absolute -top-1.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-amber-400"></div>
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="4" y="3" width="16" height="16" rx="2"></rect>
                  <path d="M4 11h16"></path>
                  <path d="M12 3v8"></path>
                  <path d="m8 19-2 3"></path>
                  <path d="m16 19 2 3"></path>
                  <circle cx="8" cy="15" r="1" fill="currentColor"></circle>
                  <circle cx="16" cy="15" r="1" fill="currentColor"></circle>
                </svg>
              </div>
              <div className="absolute -top-7 whitespace-nowrap bg-blue-600 text-on-accent font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>{train.trainNumber} • {train.currentSpeedKmH} km/h</span>
              </div>
            </div>
          </AdvancedMarker>

          {userLocation && (
            <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lng }} zIndex={950}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
                <div className="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white text-on-accent flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-on-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                    <path d="M12 2v3m0 14v3m10-10h-3M5 12H2"></path>
                  </svg>
                </div>
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </div>

      <div className="bg-surface/95 backdrop-blur-md text-ink px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs z-10 border-t border-border">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
          <span className="text-ink/50 text-[11px] sm:text-xs shrink-0">Position:</span>
          <span className="font-bold text-ink truncate text-[11px] sm:text-xs">{train.currentLocationName}</span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-ink/80 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-ink/50 shrink-0">Next:</span>
            <strong className="text-accent font-bold truncate">{train.nextStationName}</strong>
            <span className="font-mono-code text-emerald-600 dark:text-emerald-400 font-bold shrink-0">({train.distanceToNextStationKm} km)</span>
          </div>
          <div className="hidden md:inline-flex items-center gap-1 text-ink/50 font-mono-code text-[11px]">
            <span>Lat: {train.currentLatitude.toFixed(3)}</span>
            <span>Lng: {train.currentLongitude.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

