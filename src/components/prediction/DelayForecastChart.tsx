import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrainData } from '../../types';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface DelayForecastChartProps {
  train: TrainData;
}

export const DelayForecastChart: React.FC<DelayForecastChartProps> = ({ train }) => {
  // Prepare line chart data from station stops
  const chartData = train.stops.map((stop) => ({
    name: stop.stationName.split(' ')[0], // Short name
    fullName: stop.stationName,
    stationCode: stop.stationCode,
    delay: stop.predictedDelayMinutes,
    scheduledArrival: stop.scheduledArrival,
    predictedETA: stop.predictedArrival,
    status: stop.status
  }));

  // Delay risk distribution donut data
  const riskData = [
    { name: 'Low Risk (<5 min)', value: 20, color: '#10B981' },
    { name: 'Medium Risk (5-15 min)', value: 55, color: '#F59E0B' },
    { name: 'High Risk (>15 min)', value: 25, color: 'var(--color-accent, #E53E3E)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-ink">
      {/* Left 2 Cols: Line Chart for Delay Progression */}
      <div className="lg:col-span-2 bg-surface p-5 lg:p-6 rounded-3xl border border-border space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-base font-bold font-display text-ink tracking-tight">
                Sectional Delay Progression Across Stations
              </h3>
            </div>
            <p className="text-xs text-ink/60 font-medium mt-0.5">
              Accumulated delay vs downstream engineering recovery slope.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-dark px-3 py-1.5 rounded-xl border border-border text-xs font-mono-code">
            <span className="text-ink/60 font-bold">Current:</span>
            <span className="font-bold text-amber-500">+{train.currentDelayMinutes} min</span>
            <span className="text-border">|</span>
            <span className="text-ink/60 font-bold">Dest. Forecast:</span>
            <span className="font-bold text-accent">+{train.destinationPredictedDelay} min</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                className="text-ink/60"
                axisLine={{ stroke: 'currentColor', className: 'opacity-20' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                className="text-ink/60"
                axisLine={{ stroke: 'currentColor', className: 'opacity-20' }}
                tickLine={false}
                unit="m"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border border-border text-ink p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1">
                        <div className="font-bold text-accent">{data.fullName} ({data.stationCode})</div>
                        <div>Scheduled: {data.scheduledArrival}</div>
                        <div>Predicted ETA: <strong className="text-accent">{data.predictedETA}</strong></div>
                        <div>Delay: <span className="text-amber-500 font-bold">+{data.delay} min</span></div>
                        <div className="text-[10px] text-ink/50 font-mono-code">Status: {data.status}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="delay" 
                stroke="var(--color-accent, #E53E3E)" 
                strokeWidth={3.5}
                dot={{ r: 5, fill: 'var(--color-accent, #E53E3E)', stroke: 'var(--color-surface, #FFFFFF)', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: 'var(--color-accent, #E53E3E)', stroke: 'var(--color-surface, #FFFFFF)', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right 1 Col: Delay Risk Donut */}
      <div className="bg-surface p-5 lg:p-6 rounded-3xl border border-border flex flex-col justify-between space-y-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold font-display text-ink tracking-tight">
              Route Delay Risk Assessment
            </h3>
          </div>
          <p className="text-xs text-ink/60 font-medium mt-0.5">
            XGBoost probability distribution across remaining corridors.
          </p>
        </div>

        {/* Donut Chart */}
        <div className="h-44 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-mono-code font-bold text-ink/50 uppercase">Primary Risk</span>
            <span className="text-lg font-bold font-mono-code text-accent">{train.destinationRisk}</span>
          </div>
        </div>

        {/* Risk Legend */}
        <div className="space-y-2 pt-2 border-t border-border text-xs">
          {riskData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-ink/80">{item.name}</span>
              </div>
              <span className="font-mono-code font-bold text-ink">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
