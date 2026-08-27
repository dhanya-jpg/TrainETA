import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Search, 
  Clock, 
  TrendingUp, 
  BrainCircuit, 
  Sliders, 
  Network, 
  ShieldAlert, 
  BarChart3, 
  FileText, 
  UserCheck,
  Train,
  Radio,
  Sparkles,
  ChevronRight,
  LogOut,
  Shield,
  User,
  Lock
} from 'lucide-react';
import { UserRole, AuthUser } from '../../types';

export type NavigationTab = 
  | 'dashboard'
  | 'live-map'
  | 'search'
  | 'eta-prediction'
  | 'delay-analysis'
  | 'ai-explanation'
  | 'what-if'
  | 'delay-propagation'
  | 'railway-control'
  | 'alerts'
  | 'analytics'
  | 'reports'
  | 'passenger-view';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  unreadAlertsCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  onToggleRole,
  unreadAlertsCount,
  currentUser,
  onLogout
}) => {
  const operatorNavItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-map', label: 'Live Tracking', icon: Map },
    { id: 'search', label: 'Train Search', icon: Search },
    { id: 'eta-prediction', label: 'ETA Prediction', icon: Clock },
    { id: 'delay-analysis', label: 'Delay Forecast', icon: TrendingUp },
    { id: 'ai-explanation', label: 'AI Explanation', icon: BrainCircuit, badge: 'XAI' },
    { id: 'what-if', label: 'What-If Simulation', icon: Sliders, badge: 'ML' },
    { id: 'delay-propagation', label: 'Delay Propagation', icon: Network },
    { id: 'railway-control', label: 'Railway Control', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
    { id: 'analytics', label: 'Analytics & Benchmarks', icon: BarChart3 },
    { id: 'reports', label: 'Architecture & Pipeline', icon: FileText },
  ];

  const passengerNavItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'passenger-view', label: 'Passenger Quick ETA', icon: UserCheck },
    { id: 'live-map', label: 'Live Train Map', icon: Map },
    { id: 'search', label: 'Search Train', icon: Search },
    { id: 'alerts', label: 'Travel Alerts', icon: ShieldAlert },
  ];

  const navItems = userRole === 'OPERATOR' ? operatorNavItems : passengerNavItems;

  return (
    <aside className="w-64 bg-[#0A192F] text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
          <Train className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-lg tracking-tight">SMART ETA</span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
              DYNAMIC ML
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Dynamic ETA & Delay Intelligence
          </p>
        </div>
      </div>

      {/* Role Pill Switcher */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 flex items-center text-xs">
          <button
            onClick={() => {
              if (userRole !== 'OPERATOR') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              userRole === 'OPERATOR'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {userRole === 'PASSENGER' && <Lock className="w-3 h-3 text-amber-400" />}
            <span>Operator</span>
          </button>
          <button
            onClick={() => {
              if (userRole !== 'PASSENGER') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              userRole === 'PASSENGER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Passenger
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
          {userRole === 'OPERATOR' ? 'Control Modules' : 'Commuter Tools'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {'badge' in item && item.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    typeof item.badge === 'number'
                      ? 'bg-red-500 text-white'
                      : isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* User Session & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
              userRole === 'OPERATOR' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {userRole === 'OPERATOR' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-black text-white truncate">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Chief Controller' : 'Passenger')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainetaoperator@gmail.com' : 'passenger@smarteta.in')}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
