import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker,
  InfoWindow, 
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { TrainData, StationStop } from '../../types';
import { 
  Gauge, 
  Clock, 
  MapPin, 
  LocateFixed, 
  Maximize2, 
  Crosshair,
  Train as TrainIcon,
  Plus,
  Minus,
  Layers,
  Sparkles
} from 'lucide-react';
import { calculateBearing } from '../../services/trainSimulationEngine';

export const GOOGLE_MAPS_API_KEY = 
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
  'AIzaSyDttKZIN4OAdZDUkEJMad_LGYVZ3Vj6ag0';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

// Custom dark map styling for Indian Railways operations
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#14291f' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0284c7' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

// Inner component to handle Google Maps Polylines, Markers, and Camera Controls
const GoogleMapsOverlay: React.FC<{
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
  isFollowTrain: boolean;
  setIsFollowTrain: (follow: boolean) => void;
  userLocation: { lat: number; lng: number; accuracy: number } | null;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}> = ({ train, onSelectStation, isFollowTrain, setIsFollowTrain, userLocation, mapType }) => {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');

  const [selectedStation, setSelectedStation] = useState<StationStop | null>(null);

  // Polylines references
  const trackBedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const passedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const upcomingPolylineRef = useRef<google.maps.Polyline | null>(null);
  const userAccuracyCircleRef = useRef<google.maps.Circle | null>(null);

  // Calculate bearing angle for train rotation
  const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(train.stops.length - 1, currentIdx + 1);
  const targetStop = train.stops[nextIdx];
  const bearingAngle = targetStop
    ? calculateBearing(train.currentLatitude, train.currentLongitude, targetStop.latitude, targetStop.longitude)
    : 0;

  // Manage Google Maps Polylines
  useEffect(() => {
    if (!map || !mapsLibrary) return;

    // 1. Full Track Bed Polyline
    if (!trackBedPolylineRef.current) {
      trackBedPolylineRef.current = new mapsLibrary.Polyline({
        map,
        strokeColor: '#334155',
        strokeWeight: 6,
        strokeOpacity: 0.8
      });
    }

    // 2. Passed Track Segment Polyline (Green)
    if (!passedPolylineRef.current) {
      passedPolylineRef.current = new mapsLibrary.Polyline({
        map,
        strokeColor: '#10B981',
        strokeWeight: 4,
        strokeOpacity: 0.95
      });
    }

    // 3. Upcoming Track Segment Polyline (Blue or Amber)
    if (!upcomingPolylineRef.current) {
      upcomingPolylineRef.current = new mapsLibrary.Polyline({
        map,
        strokeColor: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB',
        strokeWeight: 4,
        strokeOpacity: 0.95
      });
    }

    const allCoords = train.stops.map(s => ({ lat: s.latitude, lng: s.longitude }));
    trackBedPolylineRef.current.setPath(allCoords);

    const passedCoords = [
      ...train.stops.slice(0, currentIdx + 1).map(s => ({ lat: s.latitude, lng: s.longitude })),
      { lat: train.currentLatitude, lng: train.currentLongitude }
    ];
    passedPolylineRef.current.setPath(passedCoords);

    const upcomingCoords = [
      { lat: train.currentLatitude, lng: train.currentLongitude },
      ...train.stops.slice(currentIdx + 1).map(s => ({ lat: s.latitude, lng: s.longitude }))
    ];
    upcomingPolylineRef.current.setPath(upcomingCoords);
    upcomingPolylineRef.current.setOptions({
      strokeColor: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB'
    });

    return () => {
      trackBedPolylineRef.current?.setMap(null);
      passedPolylineRef.current?.setMap(null);
      upcomingPolylineRef.current?.setMap(null);
      trackBedPolylineRef.current = null;
      passedPolylineRef.current = null;
      upcomingPolylineRef.current = null;
    };
  }, [map, mapsLibrary, train, currentIdx]);

  // Update user accuracy circle
  useEffect(() => {
    if (!map || !mapsLibrary || !userLocation) {
      userAccuracyCircleRef.current?.setMap(null);
      return;
    }

    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = new mapsLibrary.Circle({
        map,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: Math.min(500, userLocation.accuracy),
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        strokeColor: '#3B82F6',
        strokeWeight: 1
      });
    } else {
      userAccuracyCircleRef.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      userAccuracyCircleRef.current.setRadius(Math.min(500, userLocation.accuracy));
      userAccuracyCircleRef.current.setMap(map);
    }
  }, [map, mapsLibrary, userLocation]);

  // Camera pan to train when following
  useEffect(() => {
    if (!map || !isFollowTrain) return;
    map.panTo({ lat: train.currentLatitude, lng: train.currentLongitude });
  }, [map, isFollowTrain, train.currentLatitude, train.currentLongitude]);

  return (
    <>
      {/* Station Markers */}
      {train.stops.map((stop, index) => {
        const isOrigin = index === 0;
        const isDestination = index === train.stops.length - 1;
        const isCurrent = stop.status === 'CURRENT';
        const isNext = stop.status === 'NEXT';

        let badgeLabel = `${index + 1}`;
        let bgClass = 'bg-slate-700 text-white border-slate-900';
        let sizeClass = 'w-7 h-7 text-[11px]';

        if (isOrigin) {
          badgeLabel = 'SRC';
          bgClass = 'bg-emerald-600 text-white border-emerald-900 shadow-lg shadow-emerald-600/40';
          sizeClass = 'w-8 h-8 text-[10px] font-bold';
        } else if (isDestination) {
          badgeLabel = 'DEST';
          bgClass = 'bg-blue-600 text-white border-blue-900 shadow-lg shadow-blue-600/40';
          sizeClass = 'w-8 h-8 text-[10px] font-bold';
        } else if (isCurrent) {
          bgClass = 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-400/40';
        } else if (isNext) {
          bgClass = stop.riskLevel === 'HIGH'
            ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/40'
            : 'bg-amber-500 text-white border-amber-300 ring-4 ring-amber-400/40';
        } else if (stop.status === 'DEPARTED') {
          bgClass = 'bg-emerald-600/80 text-white border-emerald-700';
        }

        return (
          <AdvancedMarker
            key={`station-${stop.stationCode}-${index}`}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            onClick={() => {
              setSelectedStation(stop);
              if (onSelectStation) onSelectStation(stop.stationCode);
            }}
          >
            <div className={`rounded-full flex items-center justify-center font-mono-code font-extrabold border-2 cursor-pointer transition-transform hover:scale-125 ${bgClass} ${sizeClass}`}>
              {badgeLabel}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Interactive Station InfoWindow */}
      {selectedStation && (
        <InfoWindow
          position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
          onCloseClick={() => setSelectedStation(null)}
        >
          <div className="p-2 text-slate-900 font-sans min-w-[200px]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedStation.stationCode}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Platform {selectedStation.platform || 1}
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900 mb-1">
              {selectedStation.stationName}
            </div>
            <div className="text-xs text-slate-600 space-y-0.5 font-mono">
              <div>Scheduled: <span className="font-semibold">{selectedStation.scheduledArrival} - {selectedStation.scheduledDeparture}</span></div>
              {selectedStation.actualArrival && (
                <div className="text-emerald-700 font-semibold">
                  Actual: {selectedStation.actualArrival}
                </div>
              )}
              {selectedStation.predictedDelayMinutes !== undefined && selectedStation.predictedDelayMinutes > 0 && (
                <div className="text-rose-600 font-bold">
                  Expected Delay: +{selectedStation.predictedDelayMinutes} mins
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Live Train Marker with Radar Waves and Bearing Nose Arrow */}
      <AdvancedMarker
        position={{ lat: train.currentLatitude, lng: train.currentLongitude }}
        zIndex={1000}
      >
        <div className="relative flex items-center justify-center pointer-events-auto select-none">
          {/* Animated radar rings */}
          <div className="absolute w-12 h-12 rounded-full bg-blue-500/25 animate-ping" />
          <div className="absolute w-9 h-9 rounded-full bg-blue-400/20 animate-pulse" />

          {/* Rotating Train Engine */}
          <div 
            className="relative w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-500 text-white flex items-center justify-center shadow-2xl transition-transform duration-500"
            style={{ transform: `rotate(${Math.round(bearingAngle)}deg)` }}
          >
            {/* Direction Arrow Indicator */}
            <div className="absolute -top-1.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-amber-500" />
            <TrainIcon className="w-4 h-4 text-amber-400" />
          </div>

          {/* Floating Speed & Train Number Pill */}
          <div className="absolute -top-7 whitespace-nowrap bg-blue-600 text-white font-mono-code font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>{train.trainNumber} • {train.currentSpeedKmH} km/h</span>
          </div>
        </div>
      </AdvancedMarker>

      {/* Live User Location Marker */}
      {userLocation && (
        <AdvancedMarker
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          zIndex={950}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
            <div className="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
              <LocateFixed className="w-3 h-3 text-white" />
            </div>
          </div>
        </AdvancedMarker>
      )}
    </>
  );
};

export const LiveTrainMap: React.FC<LiveTrainMapProps> = ({ train, onSelectStation }) => {
  const [isFollowTrain, setIsFollowTrain] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => document.documentElement.classList.contains('dark'));

  // Watch dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // HTML5 User Geolocation tracking
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="relative isolate w-full h-full min-h-[360px] sm:min-h-[460px] bg-surface rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xs flex flex-col text-ink">
      {/* Top telemetry bar & Quick Status */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div className="bg-surface/95 backdrop-blur-md text-ink px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg border border-border pointer-events-auto flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold max-w-[calc(100%-48px)] sm:max-w-none overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 font-mono-code shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500 inline" />
              <span>GOOGLE MAPS • LIVE TRACKING</span>
            </span>
          </div>
          <div className="h-3 w-px bg-border shrink-0" />
          <div className="flex items-center gap-1 text-ink font-mono-code shrink-0">
            <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
            <span className="font-bold">{train.currentSpeedKmH} <span className="text-[10px] text-ink/60">km/h</span></span>
          </div>
          <div className="h-3 w-px bg-border shrink-0" />
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
        <div className="flex flex-col gap-1.5 pointer-events-auto shrink-0 z-10">
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
            onClick={() => {
              setIsFollowTrain(true);
            }} 
            title="Focus on Train"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors"
          >
            <TrainIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button 
            type="button" 
            onClick={() => {
              if (navigator.geolocation) {
                setIsLocating(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setUserLocation({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      accuracy: pos.coords.accuracy
                    });
                    setIsLocating(false);
                    setIsFollowTrain(false);
                  },
                  () => setIsLocating(false),
                  { enableHighAccuracy: true }
                );
              }
            }} 
            title="My Location"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors"
          >
            <LocateFixed className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setMapType(prev => prev === 'roadmap' ? 'hybrid' : prev === 'hybrid' ? 'terrain' : 'roadmap');
            }}
            title={`Map Layer: ${mapType.toUpperCase()}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors font-mono text-[9px] font-bold uppercase"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Google Maps View */}
      <div className="w-full flex-1 z-0 min-h-[300px] sm:min-h-[400px] bg-slate-900">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            id="live-train-google-map"
            defaultCenter={{ lat: train.currentLatitude, lng: train.currentLongitude }}
            defaultZoom={8}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapTypeId={mapType}
            styles={isDarkTheme && mapType === 'roadmap' ? DARK_MAP_STYLES : []}
            className="w-full h-full"
          >
            <GoogleMapsOverlay
              train={train}
              onSelectStation={onSelectStation}
              isFollowTrain={isFollowTrain}
              setIsFollowTrain={setIsFollowTrain}
              userLocation={userLocation}
              mapType={mapType}
            />
          </GoogleMap>
        </APIProvider>
      </div>

      {/* Bottom Telemetry Info Footer */}
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
