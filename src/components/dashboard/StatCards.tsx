import React from 'react';
import { Train, Clock, AlertTriangle, Target, CheckCircle, ArrowUpRight } from 'lucide-react';
import { AnalyticsSummary } from '../../types';

interface StatCardsProps {
  analytics: AnalyticsSummary;
  onCardClick?: (type: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ analytics, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Active Trains */}
      <div 
        onClick={() => onCardClick?.('active')}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Trains</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Train className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{analytics.activeTrainsCount}</span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> Live
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Trunk corridor monitored</p>
      </div>

      {/* 2. Delayed Trains */}
      <div 
        onClick={() => onCardClick?.('delayed')}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delayed Trains</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600">{analytics.delayedTrainsCount}</span>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            {Math.round((analytics.delayedTrainsCount / analytics.activeTrainsCount) * 100)}%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">&gt;5 min threshold</p>
      </div>

      {/* 3. Average Delay */}
      <div 
        onClick={() => onCardClick?.('delay')}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Delay</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{analytics.averageDelayMinutes}</span>
          <span className="text-xs font-bold text-slate-500">minutes</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Systemwide fleet average</p>
      </div>

      {/* 4. ETA Prediction Accuracy */}
      <div 
        onClick={() => onCardClick?.('accuracy')}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ETA Accuracy</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600">{analytics.overallAccuracyPercent}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
            MAE ±3.9m
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">90% confidence threshold</p>
      </div>

      {/* 5. System Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-extrabold text-slate-900">All Systems Operational</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">ML Residual Model Active</p>
        </div>
      </div>
    </div>
  );
};
