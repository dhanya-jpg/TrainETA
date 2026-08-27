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
  Radio,
  ChevronRight,
  LogOut,
  Shield,
  User,
  Lock,
  ArrowUpRight
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
    { id: 'passenger-view', label: 'Passenger Portal', icon: UserCheck },
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'search', label: 'Train Search', icon: Search },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  ];

  const navItems = userRole === 'OPERATOR' ? operatorNavItems : passengerNavItems;

  return (
    <aside className="w-72 bg-[#F8F7F4] text-[#18181A] flex flex-col h-screen border-r border-black/10 shrink-0 select-none font-sans">
      {/* Brand Header */}
      <div className="p-6 pb-4 border-b border-black/5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-['Space_Mono',monospace] font-bold text-xl tracking-tight flex items-center gap-1.5 text-[#18181A]">
            <span className="text-[#E53E3E] font-black tracking-normal">//</span>
            <span>SMART ETA</span>
          </div>
          <span className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 text-[#18181A] font-bold border border-black/10">
            {userRole === 'OPERATOR' ? 'SECTION CTRL' : 'LIVE TELEMETRY'}
          </span>
        </div>
        <p className="font-['Space_Mono',monospace] text-[10px] uppercase tracking-wider text-black/50 font-semibold">
          AI-Powered Dynamic Train ETA
        </p>
      </div>

      {/* Role Pill Switcher */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-white p-1 rounded-xl border border-black/10 shadow-2xs flex items-center text-xs">
          <button
            onClick={() => {
              if (userRole !== 'OPERATOR') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-['Space_Mono',monospace] text-[11px] uppercase tracking-wider font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              userRole === 'OPERATOR'
                ? 'bg-[#18181A] text-white shadow-xs'
                : 'text-black/50 hover:text-black hover:bg-black/5'
            }`}
          >
            {userRole === 'PASSENGER' && <Lock className="w-3 h-3 text-amber-500" />}
            <span>Operator</span>
          </button>
          <button
            onClick={() => {
              if (userRole !== 'PASSENGER') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-['Space_Mono',monospace] text-[11px] uppercase tracking-wider font-bold transition-all text-center cursor-pointer ${
              userRole === 'PASSENGER'
                ? 'bg-[#18181A] text-white shadow-xs'
                : 'text-black/50 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>Passenger</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 custom-scrollbar">
        <div className="px-3 py-1 font-['Space_Mono',monospace] text-[10px] uppercase tracking-widest text-black/40 font-bold">
          {userRole === 'OPERATOR' ? 'CONTROL MODULES' : 'PORTAL NAVIGATION'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all group cursor-pointer border ${
                isActive
                  ? 'bg-white text-[#E53E3E] font-bold border-black/10 shadow-xs'
                  : 'text-black/70 hover:text-[#18181A] hover:bg-black/5 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#E53E3E]' : 'text-black/40 group-hover:text-black/70'}`} />
                <span className="font-['Inter',sans-serif] tracking-wider text-[11.5px]">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {'badge' in item && item.badge && (
                  <span className={`font-['Space_Mono',monospace] text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    typeof item.badge === 'number'
                      ? 'bg-[#E53E3E] text-white'
                      : isActive ? 'bg-[#E53E3E]/10 text-[#E53E3E]' : 'bg-black/5 text-black/60'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E53E3E]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* User Session & Logout Footer */}
      <div className="p-4 border-t border-black/10 bg-white/60 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/10 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
              userRole === 'OPERATOR' ? 'bg-[#18181A]' : 'bg-[#E53E3E]'
            }`}>
              {userRole === 'OPERATOR' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-[#18181A] truncate">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Passenger')}
              </div>
              <div className="text-[10px] text-black/50 font-['Space_Mono',monospace] truncate">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in')}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-black/40 hover:text-[#E53E3E] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
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
