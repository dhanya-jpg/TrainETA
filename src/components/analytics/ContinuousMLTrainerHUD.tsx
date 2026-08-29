import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Activity, 
  TrendingDown, 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Radio,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { onlineMLTrainingService, MLTrainingState } from '../../services/onlineMLTrainingService';

export const ContinuousMLTrainerHUD: React.FC = () => {
  const [mlState, setMlState] = useState<MLTrainingState>(onlineMLTrainingService.getState());
  const [isIntenseRetraining, setIsIntenseRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState<{ finalMAE: number; finalR2: number; lossReductionPercent: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onlineMLTrainingService.subscribe((updated) => {
      setMlState({ ...updated });
    });
    return unsubscribe;
  }, []);

  const handleToggleTraining = () => {
    onlineMLTrainingService.setTrainingActive(!mlState.isTrainingActive);
  };

  const handleTriggerIntenseRetrain = async () => {
    if (isIntenseRetraining) return;
    setIsIntenseRetraining(true);
    setRetrainResult(null);
    try {
      const result = await onlineMLTrainingService.triggerIntenseRetrain(1800);
      setRetrainResult(result);
    } finally {
      setIsIntenseRetraining(false);
    }
  };

  const handleResetWeights = () => {
    onlineMLTrainingService.resetWeights();
    setRetrainResult(null);
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Top Banner with Real-time ML Status */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0 shadow-inner">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-display font-bold text-ink tracking-tight">
                  Continuous Online Machine Learning Pipeline
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-bold uppercase tracking-wider ${
                  mlState.isTrainingActive 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${mlState.isTrainingActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                  {mlState.isTrainingActive ? 'LIVE ONLINE TRAINING' : 'TRAINING PAUSED'}
                </span>
              </div>
              <p className="text-xs text-ink/60 font-medium mt-0.5">
                Stochastically calibrating XGBoost residual trees & dynamic feature weights on live telemetry streams.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleToggleTraining}
              className={`px-4 py-2 rounded-xl text-xs font-mono-code font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                mlState.isTrainingActive 
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {mlState.isTrainingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{mlState.isTrainingActive ? 'Pause Continuous Learning' : 'Resume Continuous Learning'}</span>
            </button>

            <button
              onClick={handleTriggerIntenseRetrain}
              disabled={isIntenseRetraining}
              className="px-4 py-2 rounded-xl text-xs font-mono-code font-bold bg-accent hover:bg-accent/90 text-on-accent flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Runs high-density backprop optimization across 1,800 historical + live train vectors"
            >
              <Zap className={`w-3.5 h-3.5 ${isIntenseRetraining ? 'animate-spin' : ''}`} />
              <span>{isIntenseRetraining ? 'Retraining Fleet...' : 'High-Density Retrain (1.8k Samples)'}</span>
            </button>

            <button
              onClick={handleResetWeights}
              className="p-2 rounded-xl text-ink/60 hover:text-ink hover:bg-surface-dark border border-border transition-colors cursor-pointer"
              title="Reset model weights to baseline checkpoint"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Retrain Alert Notification if triggered */}
        {retrainResult && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                High-Density Retraining successfully boosted Fleet Accuracy to <strong>R²: {retrainResult.finalR2}</strong> with Mean Error reduced to <strong>±{retrainResult.finalMAE} min</strong> ({retrainResult.lossReductionPercent}% loss reduction).
              </span>
            </div>
            <button 
              onClick={() => setRetrainResult(null)} 
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Fleet MAE */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-ink/60 text-xs font-mono-code font-bold uppercase">
            <span>Fleet MAE</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink">
            ±{mlState.fleetMAE.toFixed(2)} <span className="text-xs text-ink/50 font-normal">min</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-code font-bold">
            -63% error vs baseline (11.2m)
          </div>
        </div>

        {/* Metric 2: R2 Accuracy */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-ink/60 text-xs font-mono-code font-bold uppercase">
            <span>Model R² Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink">
            {(mlState.r2Score * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-accent font-mono-code font-bold">
            High Confidence Calibration
          </div>
        </div>

        {/* Metric 3: Total Epochs */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-ink/60 text-xs font-mono-code font-bold uppercase">
            <span>Epochs Processed</span>
            <Layers className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink font-mono-code">
            #{mlState.totalEpochs}
          </div>
          <div className="text-[10px] text-ink/60 font-mono-code font-medium">
            Active Online Stream
          </div>
        </div>

        {/* Metric 4: Ingested Vectors */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-ink/60 text-xs font-mono-code font-bold uppercase">
            <span>Telemetry Vectors</span>
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink font-mono-code">
            {mlState.totalSamplesProcessed.toLocaleString()}
          </div>
          <div className="text-[10px] text-ink/60 font-mono-code font-medium">
            GPS, Signals, Weather, TSR
          </div>
        </div>

        {/* Metric 5: Huber Loss */}
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-ink/60 text-xs font-mono-code font-bold uppercase">
            <span>Convergence Loss</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink font-mono-code">
            {mlState.currentLoss.toFixed(4)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-code font-bold">
            Huber δ = 2.0 Robust
          </div>
        </div>
      </div>

      {/* Main Grid: Loss Curve & Adaptive Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Real-Time Loss & Accuracy Convergence Chart */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
                Online Learning Curve (Loss vs Accuracy R²)
              </span>
            </div>
            <span className="text-[10px] font-mono-code font-bold text-ink/50 bg-surface-dark px-2 py-0.5 rounded border border-border">
              REAL-TIME CHECKPOINTS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mlState.lossHistory} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis 
                  dataKey="epoch" 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-ink/60"
                  axisLine={{ stroke: 'currentColor', className: 'opacity-20' }}
                  tickLine={false}
                  tickFormatter={(val) => `E#${val}`}
                />
                <YAxis 
                  yAxisId="loss"
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-ink/60"
                  axisLine={{ stroke: 'currentColor', className: 'opacity-20' }}
                  tickLine={false}
                  domain={[0, 0.5]}
                />
                <YAxis 
                  yAxisId="r2"
                  orientation="right"
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-ink/60"
                  axisLine={{ stroke: 'currentColor', className: 'opacity-20' }}
                  tickLine={false}
                  domain={[0.85, 1.0]}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface border border-border text-ink p-3 rounded-xl text-xs space-y-1 shadow-lg font-mono-code">
                          <div className="font-bold text-accent">Epoch #{d.epoch} ({d.timestamp})</div>
                          <div className="text-ink/80">Huber Loss: <strong>{d.loss}</strong></div>
                          <div className="text-ink/80">Fleet MAE: <strong>±{d.mae} min</strong></div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">R² Score: {(d.r2 * 100).toFixed(1)}%</div>
                          <div className="text-[10px] text-ink/50">Vectors: {d.samples.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}
                />
                <Line 
                  yAxisId="loss"
                  type="monotone" 
                  dataKey="loss" 
                  name="Huber Loss (Error)" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#ef4444' }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  yAxisId="r2"
                  type="monotone" 
                  dataKey="r2" 
                  name="R² Accuracy Score" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#10b981' }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink/60 font-medium pt-1">
            <span>Objective: Minimize residual Huber Loss on signal & station bottleneck points.</span>
            <span className="font-mono-code text-accent font-bold">Gradient Step: η={mlState.learningRate}</span>
          </div>
        </div>

        {/* Right 5 cols: Dynamic Calibrated Weights Meter */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono-code">
                Dynamic Feature Weights (Online SGD)
              </span>
            </div>
            <span className="text-[10px] font-mono-code font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ADAPTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Weight 1: Signal Red */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono-code">
                <span className="text-ink/70">Signal Red Interlock Penalty</span>
                <span className="font-bold text-red-500">+{mlState.weights.signalRedPenalty.toFixed(2)} min</span>
              </div>
              <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mlState.weights.signalRedPenalty / 18) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Weight 2: Signal Yellow */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono-code">
                <span className="text-ink/70">Caution Yellow Aspect Penalty</span>
                <span className="font-bold text-amber-500">+{mlState.weights.signalYellowPenalty.toFixed(2)} min</span>
              </div>
              <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mlState.weights.signalYellowPenalty / 8) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Weight 3: Track TSR */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono-code">
                <span className="text-ink/70">Track TSR / Engineering Restriction</span>
                <span className="font-bold text-orange-500">+{mlState.weights.trackTsrPenalty.toFixed(2)} min</span>
              </div>
              <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mlState.weights.trackTsrPenalty / 7) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Weight 4: Weather Fog */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono-code">
                <span className="text-ink/70">Weather Visibility (Fog-PASS Drag)</span>
                <span className="font-bold text-blue-500">+{mlState.weights.weatherFogPenalty.toFixed(2)} min</span>
              </div>
              <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mlState.weights.weatherFogPenalty / 10) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Weight 5: Section Slack Recovery */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono-code">
                <span className="text-ink/70">Section Slack Catch-up (min/100km)</span>
                <span className="font-bold text-emerald-500">-{mlState.weights.slackRecoveryRatePer100Km.toFixed(2)} min</span>
              </div>
              <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mlState.weights.slackRecoveryRatePer100Km / 4) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hyperparameter Controls */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-ink/60" />
              <span className="font-mono-code font-bold text-ink/70">Learning Rate:</span>
              <input 
                type="range" 
                min="0.001" 
                max="0.03" 
                step="0.001" 
                value={mlState.learningRate} 
                onChange={(e) => onlineMLTrainingService.setLearningRate(parseFloat(e.target.value))}
                className="w-20 accent-accent cursor-pointer" 
              />
              <span className="font-mono-code font-bold text-accent">{mlState.learningRate}</span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono-code text-[11px]">
              <span className="text-ink/60">Loss:</span>
              <select 
                value={mlState.lossFunction} 
                onChange={(e) => onlineMLTrainingService.setLossFunction(e.target.value as any)}
                className="bg-surface-dark border border-border rounded px-1.5 py-0.5 text-ink font-bold focus:outline-none"
              >
                <option value="HUBER">Huber</option>
                <option value="MSE">MSE</option>
                <option value="MAE">MAE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry & Training Audit Terminal */}
      <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs space-y-3 font-mono-code">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Terminal className="w-4 h-4 text-accent" />
            <span>Continuous Telemetry Ingestion & Gradient Log Stream</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Stream Active (1s cycle)</span>
          </div>
        </div>

        <div className="h-32 overflow-y-auto space-y-1.5 text-[11px] pr-2 custom-scrollbar">
          {mlState.recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-ink/80 hover:text-ink transition-colors">
              <span className="text-ink/40 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${
                log.type === 'WEIGHT_CONVERGENCE' ? 'text-emerald-600 dark:text-emerald-400' :
                log.type === 'EPOCH_COMPLETE' ? 'text-accent' :
                log.type === 'GRADIENT_UPDATE' ? 'text-blue-500' : 'text-ink/70'
              }`}>
                [{log.type}]
              </span>
              <span className="flex-1">{log.message}</span>
              {log.deltaMAE && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  MAE: {log.deltaMAE > 0 ? `+${log.deltaMAE}` : log.deltaMAE}m
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
