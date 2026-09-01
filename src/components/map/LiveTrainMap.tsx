import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  Sparkles,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { calculateBearing } from '../../services/trainSimulationEngine';

export const GOOGLE_MAPS_API_KEY = 
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
  'AIzaSyDttKZIN4OAdZDUkEJMad_LGYVZ3Vj6ag0';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

// -------------------------------------------------------------
// LEAFLET MAP VIEW (CartoDB Voyager / Dark / Satellite)
// High-performance, zero-friction, always-available live map
// -------------------------------------------------------------
const LeafletMapView: React.FC<{
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
  isFollowTrain: boolean;
  setIsFollowTrain: (val: boolean) => void;
  userLocation: { lat: number; lng: number; accuracy: number } | null;
  mapType: 'streets' | 'dark' | 'satellite';
}> = ({ train, onSelectStation, isFollowTrain, setIsFollowTrain, userLocation, mapType }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const trackBedLayerRef = useRef<L.Polyline | null>(null);
  const passedLayerRef = useRef<L.Polyline | null>(null);
  const upcomingLayerRef = useRef<L.Polyline | null>(null);
  const stationMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);

  // Bearing calculation
  const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(train.stops.length - 1, currentIdx + 1);
  const targetStop = train.stops[nextIdx];
  const bearingAngle = targetStop
    ? calculateBearing(train.currentLatitude, train.currentLongitude, targetStop.latitude, targetStop.longitude)
    : 0;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const map = L.map(mapContainerRef.current, {
      center: [train.currentLatitude, train.currentLongitude],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 4,
    });

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Track layers
    const trackBed = L.polyline([], {
      color: '#1E293B',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    const passed = L.polyline([], {
      color: '#10B981',
      weight: 4,
      dashArray: '4, 8',
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    const upcoming = L.polyline([], {
      color: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    const stationMarkersGroup = L.layerGroup().addTo(map);

    trackBedLayerRef.current = trackBed;
    passedLayerRef.current = passed;
    upcomingLayerRef.current = upcoming;
    stationMarkersGroupRef.current = stationMarkersGroup;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile url when mapType changes
  useEffect(() => {
    if (!tileLayerRef.current) return;
    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapType === 'dark') {
      newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapType === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    tileLayerRef.current.setUrl(newUrl);
  }, [mapType]);

  // Update track polylines
  useEffect(() => {
    if (!trackBedLayerRef.current || !passedLayerRef.current || !upcomingLayerRef.current) return;

    const allStopsCoords: [number, number][] = train.stops.map(s => [s.latitude, s.longitude]);
    trackBedLayerRef.current.setLatLngs(allStopsCoords);

    const curIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));

    const passedCoords: [number, number][] = [
      ...train.stops.slice(0, curIdx + 1).map(s => [s.latitude, s.longitude] as [number, number]),
      [train.currentLatitude, train.currentLongitude]
    ];
    passedLayerRef.current.setLatLngs(passedCoords);

    const upcomingCoords: [number, number][] = [
      [train.currentLatitude, train.currentLongitude],
      ...train.stops.slice(curIdx + 1).map(s => [s.latitude, s.longitude] as [number, number])
    ];
    upcomingLayerRef.current.setLatLngs(upcomingCoords);
    upcomingLayerRef.current.setStyle({
      color: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB',
    });
  }, [train]);

  // Update station markers
  useEffect(() => {
    const group = stationMarkersGroupRef.current;
    if (!group) return;

    group.clearLayers();

    train.stops.forEach((stop, index) => {
      const isOrigin = index === 0;
      const isDestination = index === train.stops.length - 1;
      const isCurrent = stop.status === 'CURRENT';
      const isNext = stop.status === 'NEXT';

      let markerBg = 'background-color: #334155; color: #FFFFFF; border-color: #1E293B;';
      let badgeLabel = `${index + 1}`;
      let size = 28;

      if (isOrigin) {
        markerBg = 'background-color: #059669; color: #FFFFFF; border-color: #064E3B; box-shadow: 0 4px 12px rgba(5,150,105,0.4);';
        badgeLabel = 'SRC';
        size = 32;
      } else if (isDestination) {
        markerBg = 'background-color: #2563EB; color: #FFFFFF; border-color: #1E3A8A; box-shadow: 0 4px 12px rgba(37,99,235,0.4);';
        badgeLabel = 'DEST';
        size = 32;
      } else if (isCurrent) {
        markerBg = 'background-color: #2563EB; color: #FFFFFF; border-color: #60A5FA; box-shadow: 0 0 0 4px rgba(96,165,250,0.4);';
      } else if (isNext) {
        markerBg = stop.riskLevel === 'HIGH'
          ? 'background-color: #DC2626; color: #FFFFFF; border-color: #F87171; box-shadow: 0 0 0 3px rgba(239,68,68,0.4);'
          : 'background-color: #D97706; color: #FFFFFF; border-color: #FCD34D; box-shadow: 0 0 0 3px rgba(245,158,11,0.4);';
      } else if (stop.status === 'DEPARTED') {
        markerBg = 'background-color: #059669; color: #FFFFFF; border-color: #047857;';
      }

      const iconHtml = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: ${size > 30 ? '10px' : '11px'};
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          border: 2px solid;
          cursor: pointer;
          transition: transform 0.2s ease;
          ${markerBg}
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${badgeLabel}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'station-marker-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon });

      const tooltipContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px; color: #0f172a;">
          <div style="font-weight: 800; color: #2563EB; font-family: monospace;">${stop.stationCode}</div>
          <div style="font-weight: 700; font-size: 13px;">${stop.stationName}</div>
          <div style="color: #475569; font-size: 11px; margin-top: 2px;">
            Arr: <b>${stop.scheduledArrival}</b> • Dep: <b>${stop.scheduledDeparture}</b>
          </div>
          ${stop.actualArrival ? `<div style="color: #059669; font-size: 11px; font-weight: 700; margin-top: 2px;">Live Status: ${stop.status} (+${stop.delayMinutes}m)</div>` : ''}
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Platform ${stop.platform || 1}</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: 'custom-station-tooltip',
        direction: 'top',
        offset: [0, -size / 2 - 2],
        opacity: 0.98,
      });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stop.stationCode);
      });

      group.addLayer(marker);
    });
  }, [train.stops, onSelectStation]);

  // Update Train Live GPS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const trainHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; pointer-events: auto; user-select: none;">
        <div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(59, 130, 246, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(96, 165, 250, 0.2); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        
        <div style="
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #0A192F;
          border: 2px solid #F59E0B;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
          transform: rotate(${Math.round(bearingAngle)}deg);
          transition: transform 0.5s ease-out;
        ">
          <div style="position: absolute; top: -5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 7px solid #F59E0B;"></div>
          <svg style="width: 18px; height: 18px; color: #F59E0B;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="4" y="3" width="16" height="16" rx="2"></rect>
            <path d="M4 11h16"></path>
            <path d="M12 3v8"></path>
            <path d="m8 19-2 3"></path>
            <path d="m16 19 2 3"></path>
            <circle cx="8" cy="15" r="1" fill="currentColor"></circle>
            <circle cx="16" cy="15" r="1" fill="currentColor"></circle>
          </svg>
        </div>

        <div style="
          position: absolute;
          top: -26px;
          white-space: nowrap;
          background: #2563EB;
          color: #FFFFFF;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #60A5FA;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #6EE7B7; display: inline-block;"></span>
          <span>${train.trainNumber} • ${train.currentSpeedKmH} km/h</span>
        </div>
      </div>
    `;

    const trainIcon = L.divIcon({
      html: trainHtml,
      className: 'live-train-marker-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (!trainMarkerRef.current) {
      trainMarkerRef.current = L.marker([train.currentLatitude, train.currentLongitude], {
        icon: trainIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      trainMarkerRef.current.setLatLng([train.currentLatitude, train.currentLongitude]);
      trainMarkerRef.current.setIcon(trainIcon);
    }

    if (isFollowTrain) {
      map.panTo([train.currentLatitude, train.currentLongitude], { animate: true, duration: 0.8 });
    }
  }, [train.currentLatitude, train.currentLongitude, train.currentSpeedKmH, train.trainNumber, bearingAngle, isFollowTrain]);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const userHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(37, 99, 235, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: #2563EB; border: 2.5px solid #FFFFFF; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <svg style="width: 12px; height: 12px; color: #FFFFFF;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
            <path d="M12 2v3m0 14v3m10-10h-3M5 12H2"></path>
          </svg>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'user-location-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 950,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }

    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.min(500, userLocation.accuracy),
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    } else {
      userAccuracyCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userAccuracyCircleRef.current.setRadius(Math.min(500, userLocation.accuracy));
    }
  }, [userLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[300px] sm:min-h-[400px] bg-slate-900"
    />
  );
};

// -------------------------------------------------------------
// MAIN LIVE TRAIN MAP COMPONENT
// Dual engine: High performance Leaflet OSM default with Google Maps toggle
// -------------------------------------------------------------
export const LiveTrainMap: React.FC<LiveTrainMapProps> = ({ train, onSelectStation }) => {
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'google'>('leaflet');
  const [mapType, setMapType] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [isFollowTrain, setIsFollowTrain] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Catch Google Maps auth failure globally to automatically fallback without breaking
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps API authentication failed, auto-falling back to Leaflet OSM engine.');
      setMapEngine('leaflet');
    };
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
              <span>LIVE GPS • {train.trainNumber}</span>
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
              setMapType(prev => prev === 'streets' ? 'satellite' : prev === 'satellite' ? 'dark' : 'streets');
            }}
            title={`Map Style: ${mapType.toUpperCase()}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface/95 hover:bg-surface-dark text-ink hover:text-accent border border-border flex items-center justify-center cursor-pointer shadow-md transition-colors font-mono text-[9px] font-bold uppercase"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Map Rendering Container */}
      <div className="w-full flex-1 z-0 min-h-[300px] sm:min-h-[400px] bg-slate-900">
        <LeafletMapView
          train={train}
          onSelectStation={onSelectStation}
          isFollowTrain={isFollowTrain}
          setIsFollowTrain={setIsFollowTrain}
          userLocation={userLocation}
          mapType={mapType}
        />
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
