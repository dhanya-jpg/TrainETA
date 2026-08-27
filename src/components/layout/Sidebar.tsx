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
    <aside className="w-[280px] bg-[#F8F7F4] dark:bg-[#141416] text-black dark:text-[#f2f2f2] flex flex-col h-[100dvh] border-r border-black/10 dark:border-[#f2f2f2]/10 shrink-0 select-none font-sans p-6">
      {/* Brand Header */}
      <div className="mb-12 flex flex-col">
        <div className="font-syne font-extrabold text-2xl tracking-tight text-black dark:text-[#f2f2f2] uppercase">
          SMART ETA
        </div>
        <div className="font-mono-code text-[0.55rem] uppercase tracking-[0.15em] text-[#E53E3E] mt-1 font-bold">
          {userRole === 'OPERATOR' ? 'SECTION CTRL LIVE' : 'SYSTEM LIVE'}
        </div>
      </div>

      {/* Role Pill Switcher */}
      <div className="mb-6">
        <div className="bg-[#F8F7F4] dark:bg-[#111113] p-1 rounded-sm border border-black/10 dark:border-[#f2f2f2]/10 flex items-center text-xs">
          <button
            onClick={() => {
              if (userRole !== 'OPERATOR') {
                onToggleRole();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-[2px] font-mono-code text-[10px] uppercase tracking-wider font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              userRole === 'OPERATOR'
                ? 'bg-white dark:bg-[#1a1a1c] text-black dark:text-[#f2f2f2] border border-black/10 dark:border-[#f2f2f2]/10'
                : 'text-black/50 dark:text-[#f2f2f2]/50 hover:text-black dark:text-[#f2f2f2] hover:bg-black/5 dark:hover:bg-[#f2f2f2]/5 border border-transparent'
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
            className={`flex-1 py-1.5 px-2 rounded-[2px] font-mono-code text-[10px] uppercase tracking-wider font-bold transition-all text-center cursor-pointer ${
              userRole === 'PASSENGER'
                ? 'bg-white dark:bg-[#1a1a1c] text-black dark:text-[#f2f2f2] border border-black/10 dark:border-[#f2f2f2]/10'
                : 'text-black/50 dark:text-[#f2f2f2]/50 hover:text-black dark:text-[#f2f2f2] hover:bg-black/5 dark:hover:bg-[#f2f2f2]/5 border border-transparent'
            }`}
          >
            <span>Passenger</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar -mx-2 px-2">
        <div className="font-mono-code text-[0.6rem] uppercase tracking-[0.2em] text-black/50 dark:text-[#f2f2f2]/50 font-bold mb-4 mt-2">
          {userRole === 'OPERATOR' ? 'CONTROL MODULES' : 'NAVIGATION'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-sm text-[0.85rem] font-medium transition-all group cursor-pointer border ${
                isActive
                  ? 'bg-black/5 dark:bg-[#f2f2f2]/10 text-black dark:text-[#f2f2f2] border-black/10 dark:border-[#f2f2f2]/10'
                  : 'text-black/50 dark:text-[#f2f2f2]/50 hover:text-black dark:text-[#f2f2f2] hover:bg-black/5 dark:hover:bg-[#f2f2f2]/5 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-black dark:text-[#f2f2f2]' : 'text-black/50 dark:text-[#f2f2f2]/50 group-hover:text-black dark:text-[#f2f2f2]'}`} />
                <span className="font-['Inter',sans-serif]">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {'badge' in item && item.badge && (
                  <span className={`font-mono-code text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                    typeof item.badge === 'number'
                      ? 'bg-[#E53E3E] text-white'
                      : isActive ? 'bg-black/5 dark:bg-[#f2f2f2]/10 text-black dark:text-[#f2f2f2]' : 'bg-black/5 dark:bg-[#f2f2f2]/10 text-black dark:text-[#f2f2f2]/60'
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
      <div className="pt-6 border-t border-black/10 dark:border-[#f2f2f2]/10 mt-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-xs text-white shrink-0 ${
              userRole === 'OPERATOR' ? 'bg-white dark:bg-[#1a1a1c] border border-[#f2f2f2]/20' : 'bg-[#E53E3E]'
            }`}>
              {userRole === 'OPERATOR' ? 'OP' : 'VP'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-black dark:text-[#f2f2f2] truncate">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Ved Patel')}
              </div>
              <div className="text-[0.6rem] text-black/50 dark:text-[#f2f2f2]/50 font-mono-code truncate tracking-wider mt-0.5">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'ved1801@gmail.com')}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-black dark:text-[#f2f2f2]/40 hover:text-[#E53E3E] hover:bg-black/5 dark:hover:bg-[#f2f2f2]/5 rounded-sm transition-colors cursor-pointer"
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
