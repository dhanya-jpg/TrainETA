import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, Bell, Menu, History, BrainCircuit, Sparkles, Play, Pause, FastForward, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import { TrainData, UserRole, AuthUser } from '../../types';

interface TopNavProps {
  onToggleMobileSidebar?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onSearchTrain?: (query: string) => void;
  onOpenAICopilot?: () => void;
  trains?: TrainData[];
  selectedTrain?: TrainData | null;
  onSelectTrain?: (train: TrainData) => void;
  userRole?: UserRole;
  onToggleRole?: () => void;
  unreadAlertsCount?: number;
  onOpenAlerts?: () => void;
  isSimulating?: boolean;
  onToggleSimulating?: () => void;
  simSpeed?: number;
  onChangeSimSpeed?: (speed: number) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenActivityModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  onToggleMobileSidebar, 
  isDarkMode = true, 
  onToggleTheme,
  onSearchTrain,
  onOpenAICopilot,
  unreadAlertsCount = 0,
  onOpenAlerts,
  isSimulating,
  onToggleSimulating,
  simSpeed = 1,
  onChangeSimSpeed,
  currentUser,
  onLogout,
  onOpenActivityModal,
  userRole,
  onToggleRole
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim() && onSearchTrain) {
      onSearchTrain(searchVal.trim());
    }
  };

  return (
    <header className="h-20 bg-surface-dark px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-40 shrink-0 border-b border-border transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-ink hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search train by number (e.g. 22436, 12951, 12802)..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface rounded-xl text-sm sm:text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent font-medium transition-all shadow-sm border border-border"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Simulation Controls if available */}
        {onToggleSimulating && (
          <div className="hidden xl:flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs font-mono-code">
            <button
              onClick={onToggleSimulating}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                isSimulating ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600'
              }`}
              title={isSimulating ? 'Pause physics simulation' : 'Resume simulation'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'LIVE TICK' : 'PAUSED'}
            </button>
            {onChangeSimSpeed && (
              <button
                onClick={() => onChangeSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                className="px-2 py-1 hover:bg-surface-dark rounded font-bold text-ink/80 flex items-center gap-1"
                title="Cycle simulation speed"
              >
                <FastForward className="w-3 h-3 text-accent" />
                {simSpeed}x
              </button>
            )}
          </div>
        )}

        {onOpenAICopilot && (
          <button
            onClick={onOpenAICopilot}
            className="flex items-center gap-2 px-3.5 py-2 bg-accent/15 hover:bg-accent hover:text-on-accent text-accent rounded-xl text-xs font-bold transition-all cursor-pointer border border-accent/30"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 text-accent text-xs font-bold font-mono-code tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]"></span>
          GPS Synced
        </div>

        <div className="h-6 w-px bg-ink/10 hidden md:block"></div>

        <button 
          onClick={onToggleTheme}
          className="p-2 text-ink hover:text-accent transition-colors cursor-pointer rounded-lg hover:bg-surface"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {onOpenAlerts && (
          <button 
            onClick={onOpenAlerts}
            className="relative p-2 text-ink hover:text-accent transition-colors cursor-pointer rounded-lg hover:bg-surface"
            title="View system alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-on-accent text-[9px] font-bold flex items-center justify-center rounded-full">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        )}

        {onOpenActivityModal && (
          <button 
            onClick={onOpenActivityModal}
            className="p-2 text-ink hover:text-accent transition-colors cursor-pointer rounded-lg hover:bg-surface hidden sm:block"
            title="User audit log & activity"
          >
            <History className="w-5 h-5" />
          </button>
        )}

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div 
              className="w-9 h-9 bg-accent text-on-accent rounded-xl flex items-center justify-center font-bold uppercase tracking-wider text-xs shadow-xs"
              title={currentUser?.name || 'User Profile'}
            >
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'IR'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ink/40 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 animate-scale-in text-ink space-y-3">
              <div className="border-b border-border pb-2.5 px-1">
                <div className="text-xs font-bold font-display truncate text-ink">
                  {currentUser?.name || 'Railway User'}
                </div>
                <div className="text-[11px] text-ink/60 font-mono-code truncate">
                  {currentUser?.email || 'user@smarteta.in'}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="font-mono-code text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
                    {userRole || 'PASSENGER'}
                  </span>
                  {currentUser?.badgeId && (
                    <span className="font-mono-code text-[9px] px-1.5 py-0.5 rounded bg-surface-dark text-ink/60 border border-border">
                      {currentUser.badgeId}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                {onOpenActivityModal && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenActivityModal();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-surface-dark flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-ink/60" />
                    <span>Audit & Activity Log</span>
                  </button>
                )}

                {onToggleRole && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onToggleRole();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-surface-dark flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-ink/60" />
                    <span>
                      Switch to {userRole === 'OPERATOR' ? 'Passenger View' : 'Operator Portal'}
                    </span>
                  </button>
                )}
              </div>

              {onLogout && (
                <div className="border-t border-border pt-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer font-mono-code"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>SIGN OUT</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
