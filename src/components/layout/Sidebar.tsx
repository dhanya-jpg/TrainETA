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
  | 'ai-copilot'
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
    { id: 'ai-copilot', label: 'AI Copilot', icon: BrainCircuit, badge: 'Live AI' },
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

  const passengerNavItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'passenger-view', label: 'Passenger Portal', icon: UserCheck },
    { id: 'ai-copilot', label: 'AI Train Assistant', icon: BrainCircuit, badge: 'AI' },
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'search', label: 'Train Search', icon: Search },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  ];

  const navItems = userRole === 'OPERATOR' ? operatorNavItems : passengerNavItems;

  return (
    <aside className="w-[280px] bg-surface-dark text-ink flex flex-col h-[100dvh] border-r border-border shrink-0 select-none font-sans p-6 z-50 transition-colors duration-300">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col">
        <div className="font-display font-black text-2xl tracking-tight text-ink uppercase">
          SMART ETA
        </div>
        <div className="font-mono-code text-[0.65rem] uppercase tracking-widest text-accent mt-1 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          {userRole === 'OPERATOR' ? 'SECTION CTRL LIVE' : 'PASSENGER PORTAL'}
        </div>
      </div>

      {/* Role Pill Switcher */}
      <div className="mb-6">
        <div className="bg-surface p-1 rounded-xl border border-border flex items-center text-xs shadow-xs">
          <button
            onClick={() => {
              if (userRole !== 'OPERATOR') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-2 px-2.5 rounded-lg font-mono-code text-[11px] uppercase tracking-wider font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              userRole === 'OPERATOR'
                ? 'bg-accent text-on-accent shadow-xs'
                : 'text-ink/60 hover:text-ink hover:bg-surface-dark'
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
            className={`flex-1 py-2 px-2.5 rounded-lg font-mono-code text-[11px] uppercase tracking-wider font-bold transition-all text-center cursor-pointer ${
              userRole === 'PASSENGER'
                ? 'bg-accent text-on-accent shadow-xs'
                : 'text-ink/60 hover:text-ink hover:bg-surface-dark'
            }`}
          >
            <span>Passenger</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar -mx-2 px-2">
        <div className="font-mono-code text-[0.65rem] uppercase tracking-widest text-ink/40 font-bold mb-3 mt-1">
          {userRole === 'OPERATOR' ? 'CONTROL MODULES' : 'NAVIGATION'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer border ${
                isActive
                  ? 'bg-accent/15 text-accent border-accent/30 font-bold shadow-xs'
                  : 'text-ink/70 hover:text-ink hover:bg-surface border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-accent' : 'text-ink/50 group-hover:text-ink'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {'badge' in item && item.badge && (
                  <span className={`font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-accent text-on-accent' 
                      : 'bg-surface text-ink/70 border border-border'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* User Session & Logout Footer */}
      <div className="pt-5 border-t border-border mt-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-accent text-on-accent shrink-0 shadow-xs">
              {userRole === 'OPERATOR' ? 'OP' : (currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'VP')}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-ink truncate">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Railway Commuter')}
              </div>
              <div className="text-[0.65rem] text-ink/50 font-mono-code truncate tracking-wider mt-0.5">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'controller.nr@irctc.gov.in' : 'commuter@smarteta.in')}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 text-ink/60 hover:text-accent hover:bg-surface rounded-xl transition-colors cursor-pointer"
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
