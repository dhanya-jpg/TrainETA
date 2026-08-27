import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TrainData } from '../../types';
import { 
  Gauge, 
  Clock, 
  MapPin, 
  LocateFixed, 
  Navigation, 
  Maximize2, 
  Crosshair,
  Radio,
  Sparkles,
  Train as TrainIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { calculateBearing } from '../../services/trainSimulationEngine';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

// Calculate Haversine distance in KM
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

export const LiveTrainMap: React.FC<LiveTrainMapProps> = ({ train, onSelectStation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const trackBedPolylineRef = useRef<L.Polyline | null>(null);
  const passedPolylineRef = useRef<L.Polyline | null>(null);
  const upcomingPolylineRef = useRef<L.Polyline | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Follow camera mode state
  const [isFollowTrain, setIsFollowTrain] = useState<boolean>(true);
  const prevTrainIdRef = useRef<string>(train.id);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Geolocation setup
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported by browser.');
      return;
    }

    setIsLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setIsLocating(false);
        setGeoError(null);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('GPS permission denied. Showing train route only.');
        } else {
          setGeoError('Locating GPS signal...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Compute nearest station and distance to train
  const userDistanceToTrainKm = userLocation
    ? getHaversineDistanceKm(userLocation.lat, userLocation.lng, train.currentLatitude, train.currentLongitude)
    : null;

  const nearestStation = userLocation && train.stops.length > 0
    ? train.stops.reduce((prev, curr) => {
        const prevDist = getHaversineDistanceKm(userLocation.lat, userLocation.lng, prev.latitude, prev.longitude);
        const currDist = getHaversineDistanceKm(userLocation.lat, userLocation.lng, curr.latitude, curr.longitude);
        return currDist < prevDist ? curr : prev;
      })
    : null;

  // Calculate live bearing angle along next waypoint
  const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(train.stops.length - 1, currentIdx + 1);
  const targetStop = train.stops[nextIdx];
  const bearingAngle = targetStop
    ? calculateBearing(train.currentLatitude, train.currentLongitude, targetStop.latitude, targetStop.longitude)
    : 0;

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [train.currentLatitude, train.currentLongitude],
        zoom: 7,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous elements
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (trackBedPolylineRef.current) trackBedPolylineRef.current.remove();
    if (passedPolylineRef.current) passedPolylineRef.current.remove();
    if (upcomingPolylineRef.current) upcomingPolylineRef.current.remove();
    if (trainMarkerRef.current) trainMarkerRef.current.remove();

    // 1. Draw Route Tracks
    const allStopsCoords: [number, number][] = train.stops.map((s) => [s.latitude, s.longitude]);

    trackBedPolylineRef.current = L.polyline(allStopsCoords, {
      color: '#0F172A',
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const passedCoords: [number, number][] = [
      ...train.stops.slice(0, currentIdx + 1).map((s) => [s.latitude, s.longitude] as [number, number]),
      [train.currentLatitude, train.currentLongitude]
    ];

    passedPolylineRef.current = L.polyline(passedCoords, {
      color: '#10B981',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      dashArray: '6, 6'
    }).addTo(map);

    const upcomingCoords: [number, number][] = [
      [train.currentLatitude, train.currentLongitude],
      ...train.stops.slice(currentIdx + 1).map((s) => [s.latitude, s.longitude] as [number, number])
    ];

    upcomingPolylineRef.current = L.polyline(upcomingCoords, {
      color: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round'
    }).addTo(map);

    // 2. Station Markers
    train.stops.forEach((stop, index) => {
      const isOrigin = index === 0;
      const isDestination = index === train.stops.length - 1;
      const isCurrent = stop.status === 'CURRENT';
      const isNext = stop.status === 'NEXT';

      let markerBg = 'bg-slate-700 text-white border-slate-800';
      let badgeLabel = `${index + 1}`;
      let sizeClass = 'w-7 h-7 text-[11px]';

      if (isOrigin) {
        markerBg = 'bg-emerald-600 text-white border-emerald-800 shadow-emerald-500/30';
        badgeLabel = 'SRC';
        sizeClass = 'w-8 h-8 text-[10px] font-black';
      } else if (isDestination) {
        markerBg = 'bg-blue-600 text-white border-blue-900 shadow-blue-500/30';
        badgeLabel = 'DEST';
        sizeClass = 'w-8 h-8 text-[10px] font-black';
      } else if (isCurrent) {
        markerBg = 'bg-blue-600 text-white border-blue-800 ring-4 ring-blue-300 animate-pulse';
      } else if (isNext) {
        markerBg = stop.riskLevel === 'HIGH' 
          ? 'bg-red-600 text-white border-red-800 ring-2 ring-red-300' 
          : 'bg-amber-500 text-white border-amber-700 ring-2 ring-amber-200';
      } else if (stop.status === 'DEPARTED') {
        markerBg = 'bg-emerald-600/90 text-white border-emerald-700';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group select-none">
          <div class="${sizeClass} rounded-full ${markerBg} flex items-center justify-center font-bold shadow-md border-2 transition-transform duration-200 group-hover:scale-110">
            ${badgeLabel}
          </div>
          <div class="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-slate-700/80 z-50">
            <span class="text-blue-400 font-mono">${stop.stationCode}</span> • ${stop.stationName}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-station-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 220px; color: #0F172A;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${
                isOrigin ? '#059669' : isDestination ? '#2563EB' : isCurrent ? '#2563EB' : '#64748B'
              };">
                ${isOrigin ? 'Source Station' : isDestination ? 'Final Destination' : `Stop #${index + 1} (${stop.status})`}
              </span>
              <span style="font-size: 10px; font-weight: 800; background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">
                PF ${stop.platform}
              </span>
            </div>

            <div style="font-size: 14px; font-weight: 800; color: #0F172A; line-height: 1.2;">
              ${stop.stationName} <span style="color: #64748B; font-weight: 700;">(${stop.stationCode})</span>
            </div>

            <div style="margin-top: 8px; font-size: 11.5px; color: #334155; border-top: 1px solid #E2E8F0; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div><strong>Scheduled:</strong> ${stop.scheduledArrival}</div>
              <div><strong>AI ETA:</strong> <span style="color: ${stop.predictedDelayMinutes > 5 ? '#DC2626' : '#16A34A'}; font-weight: 800;">${stop.predictedArrival}</span></div>
              <div><strong>Delay:</strong> ${stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes} min` : 'On Time'}</div>
              <div><strong>Distance:</strong> ${stop.distanceKm} km</div>
            </div>

            <div style="margin-top: 6px; font-size: 10.5px; color: #64748B; background: #F8FAFC; padding: 4px 6px; border-radius: 6px;">
              Confidence: <strong>${stop.confidenceScore}%</strong> (${stop.etaRange})
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stop.stationCode);
      });

      markersRef.current.push(marker);
    });

    // 3. Create Moving Train Marker with Directional Orientation & Pulse Rings
    const trainDivIcon = L.divIcon({
      html: createTrainIconHtml(train, bearingAngle),
      className: 'live-train-telemetry-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const trainMarker = L.marker([train.currentLatitude, train.currentLongitude], {
      icon: trainDivIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    trainMarkerRef.current = trainMarker;

    // Auto-fit route bounds on initial train load or train switch
    if (prevTrainIdRef.current !== train.id) {
      prevTrainIdRef.current = train.id;
      const groupItems: L.Layer[] = [...markersRef.current, trainMarker];
      const group = L.featureGroup(groupItems);
      map.fitBounds(group.getBounds().pad(0.12));
    }

    const resizeHandler = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [train.id, onSelectStation]);

  // Update Dynamic Coordinates & Movement Animation without full rebuild
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. Update Marker Lat/Lng smoothly
    if (trainMarkerRef.current) {
      trainMarkerRef.current.setLatLng([train.currentLatitude, train.currentLongitude]);
      const newIcon = L.divIcon({
        html: createTrainIconHtml(train, bearingAngle),
        className: 'live-train-telemetry-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      trainMarkerRef.current.setIcon(newIcon);
    }

    // 2. Update Polylines dynamically
    if (passedPolylineRef.current && upcomingPolylineRef.current) {
      const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
      
      const passedCoords: [number, number][] = [
        ...train.stops.slice(0, currentIdx + 1).map((s) => [s.latitude, s.longitude] as [number, number]),
        [train.currentLatitude, train.currentLongitude]
      ];
      passedPolylineRef.current.setLatLngs(passedCoords);

      const upcomingCoords: [number, number][] = [
        [train.currentLatitude, train.currentLongitude],
        ...train.stops.slice(currentIdx + 1).map((s) => [s.latitude, s.longitude] as [number, number])
      ];
      upcomingPolylineRef.current.setLatLngs(upcomingCoords);
    }

    // 3. Smooth Camera Follow
    if (isFollowTrain) {
      map.panTo([train.currentLatitude, train.currentLongitude], {
        animate: true,
        duration: 0.8
      });
    }
  }, [train.currentLatitude, train.currentLongitude, train.currentSpeedKmH, train.currentDelayMinutes, isFollowTrain, bearingAngle]);

  // User location marker update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    if (userLocation) {
      const userIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
              <path d="M12 2v3m0 14v3m10-10h-3M5 12H2"></path>
            </svg>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: 'user-gps-location-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 950,
      }).addTo(map);

      const userCircle = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.max(50, Math.min(1000, userLocation.accuracy || 100)),
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);

      userMarkerRef.current = userMarker;
      userCircleRef.current = userCircle;
    }
  }, [userLocation]);

  // Action helpers
  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    setIsFollowTrain(false);
    const groupItems: L.Layer[] = [...markersRef.current];
    if (trainMarkerRef.current) groupItems.push(trainMarkerRef.current);
    if (userMarkerRef.current) groupItems.push(userMarkerRef.current);
    const group = L.featureGroup(groupItems);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.12));
  };

  const handleFocusTrain = () => {
    if (!mapInstanceRef.current) return;
    setIsFollowTrain(true);
    mapInstanceRef.current.flyTo([train.currentLatitude, train.currentLongitude], 9, {
      duration: 1.0
    });
  };

  const handleLocateUser = () => {
    if (!mapInstanceRef.current) return;
    setIsFollowTrain(false);
    if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.0 });
    } else if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setUserLocation(loc);
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 12, { duration: 1.0 });
          }
        },
        (err) => {
          setIsLocating(false);
          setGeoError('GPS location unavailable.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="relative isolate w-full h-full min-h-[460px] bg-slate-100 dark:bg-white/5 rounded-3xl dark:rounded-none overflow-hidden border border-slate-200 dark:border-white/10 shadow-md flex flex-col">
      
      {/* TOP FLOATING HUD (Telemetry & Delay Summary) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Telemetry Live Badge */}
        <div className="bg-slate-900/95 dark:bg-black/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl dark:rounded-none shadow-xl border border-slate-700/60 pointer-events-auto flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-wide">LIVE GPS • MOVING</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1 text-slate-200">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold font-mono">{train.currentSpeedKmH} km/h</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Delay: <strong className={`${train.currentDelayMinutes > 5 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
              {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : '0m (On Time)'}
            </strong></span>
          </div>
        </div>

        {/* Follow Mode & Status indicator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsFollowTrain(!isFollowTrain)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:rounded-none shadow-md border text-xs font-bold transition-all cursor-pointer ${
              isFollowTrain
                ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30'
                : 'bg-white/95 dark:bg-[#1a1a1c]/95 text-slate-700 dark:text-[#f2f2f2] border-slate-200 dark:border-white/10 hover:bg-slate-50'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${isFollowTrain ? 'animate-spin' : ''}`} />
            <span>{isFollowTrain ? 'Camera Following Train' : 'Follow Train'}</span>
          </button>
        </div>
      </div>

      {/* QUICK FLOATING MAP ACTION CONTROLS */}
      <div className="absolute right-3 top-16 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleFocusTrain}
          title="Recenter Camera on Moving Train"
          className={`w-9 h-9 rounded-xl dark:rounded-none shadow-md border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
            isFollowTrain
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white dark:bg-[#1a1a1c]/95 text-slate-700 dark:text-[#f2f2f2]/80 hover:text-blue-600 border-slate-200 dark:border-white/10'
          }`}
        >
          <TrainIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleLocateUser}
          title={userLocation ? 'Focus on My GPS Location' : 'Detect My Location'}
          className={`w-9 h-9 rounded-xl dark:rounded-none shadow-md border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
            userLocation 
              ? 'bg-blue-600 text-white border-blue-700' 
              : 'bg-white dark:bg-[#1a1a1c]/95 hover:bg-slate-50 dark:bg-[#141416] text-slate-700 dark:text-[#f2f2f2]/80 hover:text-blue-600 border-slate-200 dark:border-white/10'
          }`}
        >
          <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleFitRoute}
          title="Fit Full Route Overview"
          className="w-9 h-9 rounded-xl dark:rounded-none bg-white dark:bg-[#1a1a1c]/95 hover:bg-slate-50 dark:bg-[#141416] text-slate-700 dark:text-[#f2f2f2]/80 hover:text-blue-600 shadow-md border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* ACTUAL LEAFLET MAP CONTAINER */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 z-0 min-h-[420px]" 
      />

      {/* BOTTOM LIVE TELEMETRY ODOMETER BAR */}
      <div className="bg-slate-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-slate-400">Position:</span>
          <span className="font-bold text-slate-100 truncate max-w-sm">{train.currentLocationName}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Next Station:</span>
            <strong className="text-amber-400 font-bold">{train.nextStationName}</strong>
            <span className="font-mono text-emerald-400 font-extrabold">({train.distanceToNextStationKm} km)</span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <span>Lat: {train.currentLatitude.toFixed(4)}</span>
            <span>Lng: {train.currentLongitude.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function createTrainIconHtml(train: TrainData, bearingAngle: number): string {
  return `
    <div class="relative flex items-center justify-center cursor-pointer select-none">
      <!-- Outer radar pulse rings -->
      <div class="absolute w-14 h-14 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
      <div class="absolute w-10 h-10 rounded-full bg-blue-400/20 animate-pulse pointer-events-none"></div>
      
      <!-- Directional Heading Pointer Indicator -->
      <div 
        class="relative w-11 h-11 rounded-full bg-[#0A192F] border-2 border-amber-400 text-white flex items-center justify-center shadow-2xl transition-transform duration-500 ease-out"
        style="transform: rotate(${Math.round(bearingAngle)}deg);"
      >
        <!-- Directional arrow pointer at nose -->
        <div class="absolute -top-1.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-amber-400"></div>
        
        <!-- Locomotive SVG Icon -->
        <svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="4" y="3" width="16" height="16" rx="2"></rect>
          <path d="M4 11h16"></path>
          <path d="M12 3v8"></path>
          <path d="m8 19-2 3"></path>
          <path d="m16 19 2 3"></path>
          <circle cx="8" cy="15" r="1" fill="currentColor"></circle>
          <circle cx="16" cy="15" r="1" fill="currentColor"></circle>
        </svg>
      </div>

      <!-- Live Speedometer Pill Overlay -->
      <div class="absolute -top-7 whitespace-nowrap bg-blue-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1 pointer-events-none">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
        <span>${train.trainNumber} • ${train.currentSpeedKmH} km/h</span>
      </div>
    </div>
  `;
}
