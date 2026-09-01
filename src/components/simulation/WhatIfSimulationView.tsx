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
    <div className="space-y-6 text-ink">
      {/* Top Header Card */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                What-If Scenario Simulation Engine
              </h2>
              <p className="text-xs text-ink/60 font-medium">
                Test operational dispatch decisions, speed variations, and priority overrides for Train {train.trainNumber}.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={applyPresetPriority}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply Green Corridor Preset</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-ink/70 hover:bg-surface-dark border border-border transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders & Selectors (5 Cols) */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
              Control Parameters
            </span>
            <span className="text-[11px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded font-mono-code">
              Operator Overrides
            </span>
          </div>

          {/* 1. Train Speed Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-accent" /> Train Speed Adjustment
              </span>
              <span className="font-mono-code font-bold text-accent bg-accent/15 px-2 py-0.5 rounded">
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
              className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-ink/50 font-mono-code">
              <span>-20% (Congestion)</span>
              <span>0% (Normal)</span>
              <span>+20% (Full Speed)</span>
            </div>
          </div>

          {/* 2. Station Halt Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Station Halt Variation
              </span>
              <span className="font-mono-code font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
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
              className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-ink/50 font-mono-code">
              <span>-5 min (Quick)</span>
              <span>0 min</span>
              <span>+10 min (Heavy Load)</span>
            </div>
          </div>

          {/* 3. Traffic Level */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink block">
              Section Traffic Density
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setParams({ ...params, trafficCondition: lvl })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    params.trafficCondition === lvl
                      ? 'bg-accent text-on-accent shadow-xs'
                      : 'bg-surface-dark text-ink/70 hover:bg-surface border border-border'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Track Restriction (TSR) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink block">
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
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    params.trackRestriction === t.id
                      ? 'bg-accent text-on-accent shadow-xs'
                      : 'bg-surface-dark text-ink/70 hover:bg-surface border border-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Signal Priority Override */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink block">
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
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    params.signalPriority === p.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-surface-dark text-ink/70 hover:bg-surface border border-border'
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
            className="w-full py-3.5 px-4 bg-accent hover:opacity-90 text-on-accent rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Scenario Simulation</span>
          </button>
        </div>

        {/* Right Column: Simulation Outcomes & Delta Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Outcome Metric Highlights Card */}
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
                Simulated vs Baseline Outcome
              </span>
              <span className="text-[11px] font-bold text-ink/60 font-mono-code">
                Destination: {simulationResult.destinationStation}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Original ETA */}
              <div className="bg-surface-dark p-4 rounded-xl border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase text-ink/50 font-mono-code">Original Baseline</span>
                <div className="text-xl font-black text-ink font-mono-code">
                  {simulationResult.originalETA}
                </div>
                <div className="text-xs text-ink/60 font-bold font-mono-code">
                  Delay: +{simulationResult.originalDelayMinutes} min
                </div>
              </div>

              {/* Simulated ETA */}
              <div className="bg-accent/10 p-4 rounded-xl border border-accent/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-accent font-mono-code">Simulated Prediction</span>
                <div className="text-xl font-black text-accent font-mono-code">
                  {simulationResult.simulatedETA}
                </div>
                <div className="text-xs text-ink font-bold font-mono-code">
                  Delay: +{simulationResult.simulatedDelayMinutes} min
                </div>
              </div>

              {/* Net Impact */}
              <div className={`p-4 rounded-xl border space-y-1 ${
                simulationResult.isRecovered
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : simulationResult.netImpactMinutes === 0
                  ? 'bg-surface-dark border-border text-ink'
                  : 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-code">Net Impact Delta</span>
                <div className="text-xl font-black font-mono-code flex items-center gap-1">
                  {simulationResult.isRecovered ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                      <span>{simulationResult.netImpactMinutes} min</span>
                    </>
                  ) : simulationResult.netImpactMinutes === 0 ? (
                    <span>0 min</span>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-red-500" />
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
            <div className="p-4 rounded-xl bg-surface-dark border border-border text-xs font-medium text-ink/80 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{simulationResult.simulationNotes}</span>
            </div>
          </div>

          {/* Station-by-Station Comparison Table */}
          <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-dark flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
                Station-by-Station Delta Progression
              </span>
              <span className="text-[10px] font-bold font-mono-code text-accent">
                LIVE TRAJECTORY
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-dark/50 border-b border-border text-ink/50 font-bold uppercase text-[10px] font-mono-code">
                    <th className="py-2.5 px-4">Station</th>
                    <th className="py-2.5 px-3">Original ETA</th>
                    <th className="py-2.5 px-3">Simulated ETA</th>
                    <th className="py-2.5 px-3 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {simulationResult.stationComparisons.map((c) => (
                    <tr key={c.stationCode} className="hover:bg-surface-dark">
                      <td className="py-2.5 px-4 font-bold text-ink">
                        {c.stationName} <span className="text-ink/50 font-mono-code text-[10px]">({c.stationCode})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono-code text-ink/70">{c.originalETA}</td>
                      <td className="py-2.5 px-3 font-mono-code font-bold text-accent">{c.simulatedETA}</td>
                      <td className="py-2.5 px-3 text-right font-mono-code font-bold">
                        {c.deltaMinutes === 0 ? (
                          <span className="text-ink/50">0m</span>
                        ) : c.deltaMinutes < 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">{c.deltaMinutes}m</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">+{c.deltaMinutes}m</span>
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
