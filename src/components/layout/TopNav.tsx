import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  Bell, 
  Shield, 
  User, 
  LogOut,
  Train,
  Check,
  Lock,
  History
} from 'lucide-react';
import { TrainData, UserRole, AuthUser } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface TopNavProps {
  trains: TrainData[];
  selectedTrain: TrainData;
  onSelectTrain: (train: TrainData) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onToggleMobileSidebar?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenActivityModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  userRole,
  onToggleRole,
  unreadAlertsCount,
  onOpenAlerts,
  isSimulating,
  onToggleSimulating,
  simSpeed,
  onChangeSimSpeed,
  onToggleMobileSidebar,
  currentUser,
  onLogout,
  onOpenActivityModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const filteredTrains = trains.filter(
    (t) =>
      t.trainNumber.includes(searchQuery) ||
      t.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-[#111113] border-b border-black/10 dark:border-[#f2f2f2]/10 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-40 shrink-0">
      {/* Left: Mobile/Tablet Menu + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-sm text-[#18181A] dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-[#f2f2f2]/10 cursor-pointer shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Train Search Box */}
        <div className="relative flex-1 min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#18181A]/40 dark:text-[#f2f2f2]/40 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search train (e.g. 22436)..."
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-[#F8F7F4] dark:bg-[#1a1a1c] hover:bg-[#F0EEEA] dark:hover:bg-[#1f1f22] focus:bg-white dark:focus:bg-[#141416] border border-black/10 dark:border-[#f2f2f2]/10 focus:border-[#E53E3E] rounded-sm text-xs sm:text-sm font-medium text-[#18181A] dark:text-[#f2f2f2] placeholder:text-[#18181A]/40 dark:placeholder:text-[#f2f2f2]/40 focus:outline-none transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1c] rounded-sm shadow-2xl border border-black/10 dark:border-[#f2f2f2]/10 overflow-hidden z-50 max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-black/10 dark:border-[#f2f2f2]/10 bg-[#F8F7F4] dark:bg-[#111113] flex items-center justify-between font-mono-code text-[10px] uppercase font-bold text-[#18181A]/60 dark:text-[#f2f2f2]/50">
                  <span>SELECT ACTIVE TRAIN</span>
                  <span>{filteredTrains.length} FOUND</span>
                </div>
                {filteredTrains.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#18181A]/60 dark:text-[#f2f2f2]/50">
                    No matching train found. Try "22436", "12951", or "Rajdhani".
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredTrains.map((train) => (
                      <button
                        key={train.id}
                        onClick={() => {
                          onSelectTrain(train);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-sm text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedTrain.id === train.id
                            ? 'bg-[#18181A] text-white dark:bg-white dark:text-[#18181A]'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#18181A] dark:text-[#f2f2f2]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold font-mono-code text-xs shrink-0 ${
                            selectedTrain.id === train.id 
                              ? 'bg-[#E53E3E] text-white' 
                              : 'bg-black/5 dark:bg-white/10 text-[#18181A] dark:text-[#f2f2f2]'
                          }`}>
                            <Train className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold truncate">
                              {train.trainNumber} - {train.trainName}
                            </div>
                            <div className="text-[10px] opacity-70 truncate font-mono-code">
                              {train.sourceName} → {train.destinationName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className={`text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                            train.currentDelayMinutes > 5
                              ? 'bg-[#E53E3E]/20 text-[#E53E3E]'
                              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes}m` : 'ON TIME'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Simulation Controls for Operator */}
        {userRole === 'OPERATOR' && (
          <div className="hidden xl:flex items-center bg-[#F8F7F4] dark:bg-[#1a1a1c] p-1 rounded-sm border border-black/10 dark:border-[#f2f2f2]/10 text-xs">
            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono-code text-[10px] uppercase font-bold transition-all cursor-pointer ${
                isSimulating ? 'bg-[#18181A] text-white dark:bg-white dark:text-[#18181A]' : 'bg-transparent text-[#18181A]/70 dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Toggle Live Telemetry Simulation Engine"
            >
              {isSimulating ? <Play className="w-3 h-3 text-[#E53E3E]" /> : <Pause className="w-3 h-3" />}
              <span>{isSimulating ? 'LIVE FEED' : 'PAUSED'}</span>
            </button>

            <div className="flex items-center ml-1.5 space-x-1 border-l border-black/10 dark:border-[#f2f2f2]/10 pl-1.5">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-mono-code transition-colors cursor-pointer ${
                    simSpeed === speed ? 'bg-[#18181A] text-white dark:bg-white dark:text-[#18181A]' : 'text-[#18181A]/40 dark:text-[#f2f2f2]/40 hover:text-[#18181A] dark:hover:text-[#f2f2f2]'
                  }`}
                  title={`Simulation speed ${speed}x`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live System Operational Status */}
        <div className="hidden md:flex items-center gap-2 text-[#18181A] dark:text-[#f2f2f2] px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E] animate-pulse"></span>
          <span className="font-mono-code text-[0.65rem] uppercase tracking-[0.1em] text-[#E53E3E] font-bold">
            {userRole === 'OPERATOR' ? 'SYS ONLINE' : 'TELEMETRY ACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 border-l border-black/10 dark:border-[#f2f2f2]/10 pl-2 sm:pl-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-sm text-[#18181A] dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-[#f2f2f2]/10 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Unread Alerts Trigger */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-sm text-[#18181A] dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-[#f2f2f2]/10 transition-colors cursor-pointer"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E53E3E] text-white text-[9px] font-mono-code font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User Activity Log Trigger */}
          {onOpenActivityModal && (
            <button
              onClick={onOpenActivityModal}
              title="User Activity & Audit Log"
              className="hidden sm:block p-2 rounded-sm text-[#18181A] dark:text-[#f2f2f2]/70 hover:bg-black/5 dark:hover:bg-[#f2f2f2]/10 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Profile Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-black/10 dark:border-[#f2f2f2]/10 cursor-pointer hover:opacity-80"
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center font-mono-code font-bold text-xs ${
              userRole === 'OPERATOR' ? 'bg-[#18181A] text-white dark:bg-white dark:text-[#18181A]' : 'bg-[#E53E3E] text-white'
            }`}>
              {userRole === 'OPERATOR' ? 'OP' : 'PS'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-[#18181A] dark:text-[#f2f2f2] truncate max-w-[140px]">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Commuter')}
              </div>
              <div className="text-[10px] text-[#18181A]/50 dark:text-[#f2f2f2]/50 font-mono-code truncate max-w-[140px]">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in')}
              </div>
            </div>
          </button>

          {/* User Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-[#1a1a1c] rounded-sm shadow-2xl border border-black/10 dark:border-[#f2f2f2]/10 z-50 p-4 space-y-3 font-sans">
                <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-[#f2f2f2]/10">
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-white shrink-0 ${
                    userRole === 'OPERATOR' ? 'bg-[#18181A] dark:bg-white dark:text-[#18181A]' : 'bg-[#E53E3E]'
                  }`}>
                    {userRole === 'OPERATOR' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <div className="font-bold text-[#18181A] dark:text-[#f2f2f2] text-sm truncate">
                      {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Ved Patel')}
                    </div>
                    <div className="text-[10px] text-[#18181A]/50 dark:text-[#f2f2f2]/50 font-mono-code truncate">
                      {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'ved1801@gmail.com')}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#18181A] dark:text-[#f2f2f2]/70 font-mono-code">
                  <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-[#18181A]/40 dark:text-[#f2f2f2]/40">ROLE:</span>
                    <span className="font-bold text-[#18181A] dark:text-[#f2f2f2]">{userRole}</span>
                  </div>
                  {currentUser?.badgeId && (
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-[#18181A]/40 dark:text-[#f2f2f2]/40">BADGE:</span>
                      <span className="text-[#18181A] dark:text-[#f2f2f2]">{currentUser.badgeId}</span>
                    </div>
                  )}
                  {currentUser?.pnrOrTicket && (
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-[#18181A]/40 dark:text-[#f2f2f2]/40">TICKET:</span>
                      <span className="text-[#18181A] dark:text-[#f2f2f2]">{currentUser.pnrOrTicket}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-black/10 dark:border-[#f2f2f2]/10 flex flex-col gap-2">
                  {onOpenActivityModal && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenActivityModal();
                      }}
                      className="w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#18181A] dark:text-[#f2f2f2] rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Activity Log (Firestore)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onToggleRole();
                    }}
                    className="w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#18181A] dark:text-[#f2f2f2] rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {userRole === 'PASSENGER' && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{userRole === 'OPERATOR' ? 'Switch to Passenger View' : 'Operator Portal (Protected)'}</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 bg-[#E53E3E] hover:opacity-90 text-white rounded-sm text-xs font-bold font-mono-code uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
