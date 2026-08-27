import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Clock,
  Gauge,
  TrafficCone
} from 'lucide-react';
import { TrainData, WhatIfParameters, WhatIfResult } from '../../types';
import { runWhatIfSimulation } from '../../services/etaPredictionService';

interface WhatIfSimulationViewProps {
  train: TrainData;
}

export const WhatIfSimulationView: React.FC<WhatIfSimulationViewProps> = ({ train }) => {
  // State for What-If sliders & parameters
  const [params, setParams] = useState<WhatIfParameters>({
    speedAdjustmentPercent: 0,
    stationHaltAdjustmentMinutes: 0,
    trafficCondition: train.trafficLevel,
    trackRestriction: train.trackCondition,
    signalPriority: 'NORMAL',
  });

  // Simulation output state
  const [simulationResult, setSimulationResult] = useState<WhatIfResult>(() =>
    runWhatIfSimulation(train, {
      speedAdjustmentPercent: 0,
      stationHaltAdjustmentMinutes: 0,
      trafficCondition: train.trafficLevel,
      trackRestriction: train.trackCondition,
      signalPriority: 'NORMAL',
    })
  );

  const [hasRun, setHasRun] = useState<boolean>(true);

  const handleRunSimulation = () => {
    const result = runWhatIfSimulation(train, params);
    setSimulationResult(result);
    setHasRun(true);
  };

  const handleReset = () => {
    const defaultParams: WhatIfParameters = {
      speedAdjustmentPercent: 0,
      stationHaltAdjustmentMinutes: 0,
      trafficCondition: train.trafficLevel,
      trackRestriction: 'NORMAL',
      signalPriority: 'NORMAL',
    };
    setParams(defaultParams);
    setSimulationResult(runWhatIfSimulation(train, defaultParams));
  };

  const applyPresetPriority = () => {
    const priorityParams: WhatIfParameters = {
      speedAdjustmentPercent: 10,
      stationHaltAdjustmentMinutes: -2,
      trafficCondition: 'LOW',
      trackRestriction: 'NORMAL',
      signalPriority: 'PRIORITY',
    };
    setParams(priorityParams);
    setSimulationResult(runWhatIfSimulation(train, priorityParams));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                What-If Scenario Simulation Engine
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Test operational dispatch decisions, speed variations, and priority overrides for Train {train.trainNumber}.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={applyPresetPriority}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply Green Corridor Preset</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders & Selectors (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Control Parameters
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Operator Overrides
            </span>
          </div>

          {/* 1. Train Speed Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-600" /> Train Speed Adjustment
              </span>
              <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {params.speedAdjustmentPercent > 0 ? `+${params.speedAdjustmentPercent}%` : `${params.speedAdjustmentPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="5"
              value={params.speedAdjustmentPercent}
              onChange={(e) => setParams({ ...params, speedAdjustmentPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>-20% (Congestion)</span>
              <span>0% (Normal)</span>
              <span>+20% (Full Speed)</span>
            </div>
          </div>

          {/* 2. Station Halt Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Station Halt Variation
              </span>
              <span className="font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {params.stationHaltAdjustmentMinutes > 0 ? `+${params.stationHaltAdjustmentMinutes} min` : `${params.stationHaltAdjustmentMinutes} min`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="10"
              step="1"
              value={params.stationHaltAdjustmentMinutes}
              onChange={(e) => setParams({ ...params, stationHaltAdjustmentMinutes: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>-5 min (Quick)</span>
              <span>0 min</span>
              <span>+10 min (Heavy Load)</span>
            </div>
          </div>

          {/* 3. Traffic Level */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">
              Section Traffic Density
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setParams({ ...params, trafficCondition: lvl })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    params.trafficCondition === lvl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Track Restriction (TSR) */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">
              Track Caution Order (TSR)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'NORMAL', label: 'Normal Track (Clear)' },
                { id: 'RESTRICTED', label: 'Restricted (Caution Order)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setParams({ ...params, trackRestriction: t.id as any })}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                    params.trackRestriction === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Signal Priority Override */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">
              Interlocking Signal Priority
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'NORMAL', label: 'Standard Route Interlock' },
                { id: 'PRIORITY', label: '⚡ Priority Green Corridor' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setParams({ ...params, signalPriority: p.id as any })}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                    params.signalPriority === p.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Run Simulation */}
          <button
            onClick={handleRunSimulation}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Scenario Simulation</span>
          </button>
        </div>

        {/* Right Column: Simulation Outcomes & Delta Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Outcome Metric Highlights Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Simulated vs Baseline Outcome
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Destination: {simulationResult.destinationStation}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Original ETA */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Original Baseline</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {simulationResult.originalETA}
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  Delay: +{simulationResult.originalDelayMinutes} min
                </div>
              </div>

              {/* Simulated ETA */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-700">Simulated Prediction</span>
                <div className="text-xl font-black text-blue-700 font-mono">
                  {simulationResult.simulatedETA}
                </div>
                <div className="text-xs text-blue-900 font-bold">
                  Delay: +{simulationResult.simulatedDelayMinutes} min
                </div>
              </div>

              {/* Net Impact */}
              <div className={`p-4 rounded-xl border space-y-1 ${
                simulationResult.isRecovered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : simulationResult.netImpactMinutes === 0
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">Net Impact Delta</span>
                <div className="text-xl font-black font-mono flex items-center gap-1">
                  {simulationResult.isRecovered ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-emerald-600" />
                      <span>{simulationResult.netImpactMinutes} min</span>
                    </>
                  ) : simulationResult.netImpactMinutes === 0 ? (
                    <span>0 min</span>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <span>+{simulationResult.netImpactMinutes} min</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] font-bold">
                  {simulationResult.isRecovered ? 'Time Recovered' : 'Additional Delay'}
                </div>
              </div>
            </div>

            {/* Simulation Insight Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{simulationResult.simulationNotes}</span>
            </div>
          </div>

          {/* Station-by-Station Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Station-by-Station Delta Progression
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                LIVE TRAJECTORY
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Station</th>
                    <th className="py-2.5 px-3">Original ETA</th>
                    <th className="py-2.5 px-3">Simulated ETA</th>
                    <th className="py-2.5 px-3 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {simulationResult.stationComparisons.map((c) => (
                    <tr key={c.stationCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {c.stationName} <span className="text-slate-400 font-mono text-[10px]">({c.stationCode})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{c.originalETA}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{c.simulatedETA}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {c.deltaMinutes === 0 ? (
                          <span className="text-slate-400">0m</span>
                        ) : c.deltaMinutes < 0 ? (
                          <span className="text-emerald-600">{c.deltaMinutes}m</span>
                        ) : (
                          <span className="text-red-600">+{c.deltaMinutes}m</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
