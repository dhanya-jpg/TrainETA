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
import { TrendingUp, PieChart as PieIcon, AlertTriangle, ShieldCheck } from 'lucide-react';

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
    { name: 'High Risk (>15 min)', value: 25, color: '#EF4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Line Chart for Delay Progression */}
      <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Sectional Delay Progression Across Stations
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Accumulated delay vs downstream engineering recovery slope.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold">Current:</span>
            <span className="font-black text-amber-600">+{train.currentDelayMinutes} min</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-bold">Dest. Forecast:</span>
            <span className="font-black text-blue-600">+{train.destinationPredictedDelay} min</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
                unit="m"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1">
                        <div className="font-extrabold text-amber-400">{data.fullName} ({data.stationCode})</div>
                        <div>Scheduled: {data.scheduledArrival}</div>
                        <div>Predicted ETA: <strong className="text-blue-400">{data.predictedETA}</strong></div>
                        <div>Delay: <span className="text-amber-400 font-bold">+{data.delay} min</span></div>
                        <div className="text-[10px] text-slate-400">Status: {data.status}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="delay" 
                stroke="#2563EB" 
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#1D4ED8', stroke: '#DBEAFE', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right 1 Col: Delay Risk Donut */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Route Delay Risk Assessment
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
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
            <span className="text-xs font-bold text-slate-400 uppercase">Primary Risk</span>
            <span className="text-lg font-black text-amber-600">{train.destinationRisk}</span>
          </div>
        </div>

        {/* Risk Legend */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {riskData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-slate-700">{item.name}</span>
              </div>
              <span className="font-mono font-black text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
