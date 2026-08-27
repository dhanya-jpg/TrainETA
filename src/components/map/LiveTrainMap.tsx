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
  Compass,
  AlertTriangle,
  CheckCircle2,
  Train as TrainIcon
} from 'lucide-react';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

// Calculate Haversine distance in KM
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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
  const polylinesRef = useRef<L.Polyline[]>([]);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapMode, setMapMode] = useState<'standard' | 'sat'>('standard');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

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
        console.warn('Geolocation warning:', err.message);
        // Fallback default user location near train's origin/route if browser denies
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

  const userDistanceToNearestStationKm = nearestStation && userLocation
    ? getHaversineDistanceKm(userLocation.lat, userLocation.lng, nearestStation.latitude, nearestStation.longitude)
    : null;

  // Initialize or update Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not ready
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [train.currentLatitude, train.currentLongitude],
        zoom: 7,
        zoomControl: false, // We render custom ergonomic controls
        scrollWheelZoom: true,
      });

      // Standard OpenStreetMap tiles (Reliable, fast, zero watermark / no key needed)
      const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      tileLayerRef.current = tile;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous elements
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];
    if (trainMarkerRef.current) trainMarkerRef.current.remove();
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    // 1. Draw Route Polyline
    // All station coordinates along the scheduled route
    const allStopsCoords: [number, number][] = train.stops.map((s) => [s.latitude, s.longitude]);

    // Split route into passed segment vs remaining segment based on train current position
    const currentIdx = Math.max(0, Math.min(train.stops.length - 1, train.currentStationIndex));
    const passedCoords: [number, number][] = train.stops.slice(0, currentIdx + 1).map((s) => [s.latitude, s.longitude]);
    
    // Add current live train coordinates as junction point between passed and upcoming
    passedCoords.push([train.currentLatitude, train.currentLongitude]);

    const upcomingCoords: [number, number][] = [
      [train.currentLatitude, train.currentLongitude],
      ...train.stops.slice(currentIdx + 1).map((s) => [s.latitude, s.longitude] as [number, number])
    ];

    // Base Railway Track Ballast (Dual-track realistic line)
    const trackBed = L.polyline(allStopsCoords, {
      color: '#0F172A',
      weight: 7,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Completed Route (Emerald/Slate green track)
    const passedTrack = L.polyline(passedCoords, {
      color: '#10B981',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      dashArray: '6, 6'
    }).addTo(map);

    // Upcoming Route (Cobalt Blue or Amber if delayed)
    const upcomingTrack = L.polyline(upcomingCoords, {
      color: train.currentDelayMinutes > 15 ? '#F59E0B' : '#2563EB',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round'
    }).addTo(map);

    polylinesRef.current.push(trackBed, passedTrack, upcomingTrack);

    // 2. Station Markers (Clean, non-overlapping design with hover/click tooltips)
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
          <!-- Clean floating label on hover only to prevent clutter -->
          <div class="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 bg-slate-900 dark:bg-white/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-slate-700/80 z-50">
            <span class="text-blue-400">${stop.stationCode}</span> • ${stop.stationName}
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
          <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 220px; color: #0F172A;">
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
              Confidence Score: <strong>${stop.confidenceScore}%</strong> (${stop.etaRange})
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stop.stationCode);
      });

      markersRef.current.push(marker);
    });

    // 3. Live Animated Train Marker
    const trainIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
        <div class="relative w-10 h-10 rounded-full bg-[#0A192F] border-2 border-amber-400 text-white flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110">
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
        <!-- Tooltip -->
        <div class="absolute -top-9 whitespace-nowrap bg-blue-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg border border-blue-400">
          ${train.trainNumber} • ${train.currentSpeedKmH} km/h
        </div>
      </div>
    `;

    const trainDivIcon = L.divIcon({
      html: trainIconHtml,
      className: 'live-train-telemetry-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const trainMarker = L.marker([train.currentLatitude, train.currentLongitude], {
      icon: trainDivIcon,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 230px; color: #0F172A;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-size: 10px; font-weight: 900; color: #2563EB; text-transform: uppercase;">
              Live Train Position
            </span>
            <span style="font-size: 10px; font-weight: 800; background: #EFF6FF; color: #1D4ED8; padding: 2px 6px; border-radius: 4px;">
              ${train.trainType}
            </span>
          </div>

          <div style="font-size: 14px; font-weight: 800; color: #0F172A;">
            ${train.trainNumber} - ${train.trainName}
          </div>

          <div style="margin-top: 6px; font-size: 12px; color: #334155; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <div><strong>Live Speed:</strong> ${train.currentSpeedKmH} km/h (Max: ${train.maxSpeedKmH} km/h)</div>
            <div><strong>Current Delay:</strong> <span style="color: ${train.currentDelayMinutes > 5 ? '#DC2626' : '#16A34A'}; font-weight: 800;">+${train.currentDelayMinutes} min</span></div>
            <div><strong>Approaching:</strong> ${train.nextStationName} (${train.distanceToNextStationKm} km away)</div>
            <div><strong>Section:</strong> ${train.currentLocationName}</div>
          </div>
        </div>
      `);

    trainMarkerRef.current = trainMarker;

    // 4. User Live Location Marker (If GPS detected)
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
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 200px; color: #0F172A;">
            <div style="font-size: 10px; font-weight: 800; color: #2563EB; text-transform: uppercase;">
              Your Live Location
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 2px 0;">
              GPS Coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
            </div>
            <div style="margin-top: 4px; font-size: 11px; color: #475569; border-top: 1px solid #E2E8F0; padding-top: 4px;">
              ${userDistanceToTrainKm !== null ? `<div>Distance to Train: <strong>${userDistanceToTrainKm} km</strong></div>` : ''}
              ${nearestStation ? `<div>Nearest Route Station: <strong>${nearestStation.stationName} (${userDistanceToNearestStationKm} km)</strong></div>` : ''}
            </div>
          </div>
        `);

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

    // Auto-fit route bounds with smooth padding
    const groupItems: L.Layer[] = [...markersRef.current, trainMarker];
    if (userMarkerRef.current) groupItems.push(userMarkerRef.current);
    const group = L.featureGroup(groupItems);
    map.fitBounds(group.getBounds().pad(0.12));

    // Handle container resize
    const resizeHandler = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [train, userLocation, onSelectStation]);

  // Action helpers
  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const groupItems: L.Layer[] = [...markersRef.current];
    if (trainMarkerRef.current) groupItems.push(trainMarkerRef.current);
    if (userMarkerRef.current) groupItems.push(userMarkerRef.current);
    const group = L.featureGroup(groupItems);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.12));
  };

  const handleFocusTrain = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([train.currentLatitude, train.currentLongitude], 10, {
      duration: 1.2
    });
    if (trainMarkerRef.current) {
      trainMarkerRef.current.openPopup();
    }
  };

  const handleLocateUser = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 12, {
        duration: 1.2
      });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
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
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 12, { duration: 1.2 });
          }
        },
        (err) => {
          setIsLocating(false);
          setGeoError('GPS location permission denied or unavailable.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="relative isolate w-full h-full min-h-[460px] bg-slate-100 dark:bg-white/5 rounded-3xl dark:rounded-none overflow-hidden border border-slate-200 dark:border-white/10/80 shadow-md flex flex-col">
      
      {/* TOP FLOATING HUD (Telemetry & Delay Summary) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Telemetry pill */}
        <div className="bg-slate-900 dark:bg-white/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl dark:rounded-none shadow-xl border border-slate-700/60 pointer-events-auto flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-wide">LIVE GPS</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1 text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{train.currentSpeedKmH} km/h</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Delay: <strong className={`${train.currentDelayMinutes > 5 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
              {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : '0m (On Time)'}
            </strong></span>
          </div>
        </div>

        {/* Legend / Status badges */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white dark:bg-[#1a1a1c]/95 backdrop-blur-md px-3 py-1.5 rounded-xl dark:rounded-none shadow-md border border-slate-200 dark:border-white/10 pointer-events-auto text-[11px] font-bold text-slate-700 dark:text-[#f2f2f2]/80">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Passed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Train</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Upcoming</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-1 text-blue-700 pl-1 border-l border-slate-200 dark:border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>You</span>
            </div>
          )}
        </div>
      </div>

      {/* QUICK FLOATING MAP ACTION BUTTONS */}
      <div className="absolute right-3 top-16 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleFocusTrain}
          title="Focus on Train"
          className="w-9 h-9 rounded-xl dark:rounded-none bg-white dark:bg-[#1a1a1c]/95 hover:bg-slate-50 dark:bg-[#141416] text-slate-700 dark:text-[#f2f2f2]/80 hover:text-blue-600 shadow-md border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <TrainIcon className="w-4 h-4 text-blue-600" />
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
          title="Fit Full Route"
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

      {/* BOTTOM INFO BAR */}
      <div className="bg-slate-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-slate-400 dark:text-[#f2f2f2]/40">Current Section:</span>
          <span className="font-bold text-slate-100 truncate max-w-xs">{train.currentLocationName}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300 text-xs">
          <div>
            Next: <strong className="text-amber-400 font-bold">{train.nextStationName}</strong> ({train.distanceToNextStationKm} km)
          </div>
          {userDistanceToTrainKm !== null && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono text-[11px]">
              <LocateFixed className="w-3 h-3 text-blue-400" />
              <span>{userDistanceToTrainKm} km from you</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
