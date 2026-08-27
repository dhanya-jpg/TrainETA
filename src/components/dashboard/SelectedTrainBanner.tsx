import React from 'react';
import { 
  Train, 
  MapPin, 
  Gauge, 
  Clock, 
  ArrowRight, 
  Sliders, 
  BrainCircuit, 
  Radio, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { TrainData } from '../../types';

interface SelectedTrainBannerProps {
  train: TrainData;
  onOpenXAI: () => void;
  onOpenSimulation: () => void;
  onOpenMap: () => void;
}

export const SelectedTrainBanner: React.FC<SelectedTrainBannerProps> = ({
  train,
  onOpenXAI,
  onOpenSimulation,
  onOpenMap
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-white flex items-center justify-center shadow-md shrink-0">
            <Train className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {train.trainType}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {train.trainNumber} – {train.sourceName} → {train.destinationName}
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LIVE TELEMETRY</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {train.trainName} • Total Route: {train.totalDistanceKm} km • Last updated: <span className="font-bold text-slate-700">{train.lastUpdated}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>View on Map</span>
          </button>
          <button
            onClick={onOpenXAI}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>Explain Delay</span>
          </button>
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5">
        {/* Current Location */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Current Location
          </span>
          <div className="font-extrabold text-sm text-slate-900 truncate" title={train.currentLocationName}>
            {train.currentLocationName}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Lat: {train.currentLatitude.toFixed(2)}, Lon: {train.currentLongitude.toFixed(2)}
          </div>
        </div>

        {/* Current Speed */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-blue-500" /> Current Speed
          </span>
          <div className="font-black text-base text-blue-600">
            {train.currentSpeedKmH} <span className="text-xs font-bold text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Max Permitted: {train.maxSpeedKmH} km/h
          </div>
        </div>

        {/* Current Delay */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Current Delay
          </span>
          <div className={`font-black text-base ${train.currentDelayMinutes > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes} min` : 'On Time'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Accumulated delay
          </div>
        </div>

        {/* Next Station */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> Next Station
          </span>
          <div className="font-extrabold text-sm text-indigo-900 truncate">
            {train.nextStationName}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Code: <span className="font-bold text-slate-700">{train.nextStationCode}</span>
          </div>
        </div>

        {/* Distance to Next Station */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-slate-400" /> Next Stop Dist.
          </span>
          <div className="font-black text-base text-slate-900">
            {train.distanceToNextStationKm} <span className="text-xs font-bold text-slate-500">km</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Headway: {train.precedingTrainGapKm} km
          </div>
        </div>

        {/* Predicted Destination ETA */}
        <div className="space-y-1 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
          <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> Destination ETA
          </span>
          <div className="font-black text-lg text-blue-700">
            {train.destinationETA}
          </div>
          <div className="text-[10px] text-blue-900 font-medium">
            Confidence: <strong className="text-blue-700 font-bold">{train.destinationConfidence}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
