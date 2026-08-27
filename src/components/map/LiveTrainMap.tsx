import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TrainData } from '../../types';
import { Navigation, Gauge, Clock, ShieldCheck, MapPin, Zap } from 'lucide-react';

interface LiveTrainMapProps {
  train: TrainData;
  onSelectStation?: (stationCode: string) => void;
}

export const LiveTrainMap: React.FC<LiveTrainMapProps> = ({ train, onSelectStation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [train.currentLatitude, train.currentLongitude],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Professional clean carto tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();
    if (trainMarkerRef.current) trainMarkerRef.current.remove();

    // Create route coordinates
    const routeCoords: [number, number][] = train.stops.map((s) => [s.latitude, s.longitude]);

    // Draw railway track line (double-line railroad effect)
    const railwayOuter = L.polyline(routeCoords, {
      color: '#0A192F',
      weight: 6,
      opacity: 0.8,
    }).addTo(map);

    const railwayInner = L.polyline(routeCoords, {
      color: '#3B82F6',
      weight: 3,
      opacity: 0.95,
      dashArray: '8, 8',
    }).addTo(map);

    polylineRef.current = railwayOuter;

    // Station Markers
    train.stops.forEach((stop, index) => {
      let bgClass = 'bg-emerald-600 border-emerald-700 text-white';
      let ringClass = '';
      let statusLabel = 'Departed / On Time';

      if (stop.status === 'CURRENT') {
        bgClass = 'bg-blue-600 border-blue-700 text-white';
        ringClass = 'ring-4 ring-blue-200 animate-pulse';
        statusLabel = 'Current Station';
      } else if (stop.status === 'NEXT') {
        bgClass = stop.riskLevel === 'HIGH' ? 'bg-red-600 border-red-700 text-white' : 'bg-amber-500 border-amber-600 text-white';
        statusLabel = 'Next Station';
      } else if (stop.status === 'UPCOMING') {
        bgClass = stop.riskLevel === 'HIGH' ? 'bg-red-500 border-red-600 text-white' : 'bg-slate-700 border-slate-800 text-white';
        statusLabel = 'Upcoming';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full ${bgClass} ${ringClass} flex items-center justify-center font-bold text-xs shadow-md border-2">
            ${index + 1}
          </div>
          <div class="absolute -bottom-7 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
            ${stop.stationName} (${stop.stationCode})
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-station-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 200px;">
            <div style="font-size: 11px; font-weight: 800; color: #003399; text-transform: uppercase;">
              ${statusLabel}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin: 2px 0;">
              ${stop.stationName} (${stop.stationCode})
            </div>
            <div style="margin-top: 6px; font-size: 12px; color: #475569; border-top: 1px solid #E2E8F0; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>Scheduled:</strong> ${stop.scheduledArrival}</div>
              <div><strong>Predicted ETA:</strong> <span style="color: ${stop.predictedDelayMinutes > 5 ? '#DC2626' : '#16A34A'}; font-weight: bold;">${stop.predictedArrival}</span></div>
              <div><strong>Delay:</strong> ${stop.predictedDelayMinutes > 0 ? `+${stop.predictedDelayMinutes} min` : 'On Time'}</div>
              <div><strong>Confidence:</strong> ${stop.confidenceScore}%</div>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stop.stationCode);
      });

      markersRef.current.push(marker);
    });

    // Moving Live Train Marker with Pulsing Beacon
    const trainIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="relative w-10 h-10 rounded-full bg-[#0A192F] border-2 border-white text-white flex items-center justify-center shadow-xl">
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
      </div>
    `;

    const trainDivIcon = L.divIcon({
      html: trainIconHtml,
      className: 'live-train-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const trainMarker = L.marker([train.currentLatitude, train.currentLongitude], {
      icon: trainDivIcon,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <div style="font-size: 11px; font-weight: 800; color: #2563EB; text-transform: uppercase;">
            Live Train Position
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0F172A;">
            ${train.trainNumber} - ${train.trainName}
          </div>
          <div style="margin-top: 6px; font-size: 12px; color: #334155; line-height: 1.5;">
            <div><strong>Speed:</strong> ${train.currentSpeedKmH} km/h</div>
            <div><strong>Location:</strong> ${train.currentLocationName}</div>
            <div><strong>Current Delay:</strong> <span style="color: #DC2626; font-weight: bold;">+${train.currentDelayMinutes} min</span></div>
            <div><strong>Next Stop:</strong> ${train.nextStationName} (${train.distanceToNextStationKm} km)</div>
          </div>
        </div>
      `);

    trainMarkerRef.current = trainMarker;

    // Fit bounds smoothly with padding
    const group = L.featureGroup([...markersRef.current, trainMarker]);
    map.fitBounds(group.getBounds().pad(0.15));

    // Handle window resize cleanly
    const resizeHandler = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [train, onSelectStation]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
      {/* Top Map Overlay HUD */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Telemetry Card */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700/60 pointer-events-auto flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">LIVE TELEMETRY</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Gauge className="w-4 h-4 text-blue-400" />
            <span>{train.currentSpeedKmH} km/h</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Delay: <strong className="text-amber-400 font-bold">+{train.currentDelayMinutes} min</strong></span>
          </div>
        </div>

        {/* Right Station Legend */}
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 pointer-events-auto flex items-center gap-3 text-[11px] font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Passed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Upcoming Delay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>High Risk</span>
          </div>
        </div>
      </div>

      {/* Actual Map DOM element */}
      <div ref={mapContainerRef} className="w-full flex-1 z-[1] min-h-[420px]" />

      {/* Bottom Route Summary Bar */}
      <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs z-[500] border-t border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400">Current Section:</span>
          <span className="font-bold text-slate-100">{train.currentLocationName}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <div>Next Stop: <strong className="text-amber-400 font-bold">{train.nextStationName}</strong> ({train.distanceToNextStationKm} km away)</div>
          <div className="hidden md:block text-slate-400">Signal: <strong className="text-slate-200">{train.signalAspect.replace('_', ' ')}</strong></div>
        </div>
      </div>
    </div>
  );
};
