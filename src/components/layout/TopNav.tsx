import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Play, 
  Pause, 
  User, 
  Train, 
  Menu, 
  LogOut, 
  Shield, 
  Lock, 
  History
} from 'lucide-react';
import { TrainData, UserRole, AuthUser } from '../../types';

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

  const filteredTrains = trains.filter(
    (t) =>
      t.trainNumber.includes(searchQuery) ||
      t.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 bg-[#F8F7F4] border-b border-black/10 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Left: Mobile Menu + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-black/70 hover:bg-black/5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Train Search Box */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search train no. (e.g. 22436), name, station..."
              className="w-full pl-10 pr-4 py-2 bg-white hover:bg-white focus:bg-white border border-black/10 focus:border-[#E53E3E] rounded-xl text-xs font-semibold text-[#18181A] placeholder:text-black/40 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-black/10 overflow-hidden z-50 max-h-80 overflow-y-auto">
                <div className="p-2.5 border-b border-black/5 bg-[#F8F7F4] flex items-center justify-between font-['Space_Mono',monospace] text-[10px] uppercase font-bold text-black/50">
                  <span>SELECT ACTIVE TRAIN</span>
                  <span>{filteredTrains.length} FOUND</span>
                </div>
                {filteredTrains.length === 0 ? (
                  <div className="p-4 text-center text-xs text-black/50">
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
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedTrain.id === train.id
                            ? 'bg-[#18181A] text-white'
                            : 'hover:bg-black/5 text-[#18181A]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-['Space_Mono',monospace] text-xs ${
                            selectedTrain.id === train.id ? 'bg-[#E53E3E] text-white' : 'bg-black/5 text-[#18181A]'
                          }`}>
                            <Train className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">
                              {train.trainNumber} - {train.trainName}
                            </div>
                            <div className={`text-[11px] ${selectedTrain.id === train.id ? 'text-white/70' : 'text-black/50'}`}>
                              {train.sourceName} → {train.destinationName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-bold ${
                            selectedTrain.id === train.id 
                              ? 'text-[#E53E3E]' 
                              : train.currentDelayMinutes > 5 ? 'text-[#E53E3E]' : 'text-emerald-700'
                          }`}>
                            {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes} min` : 'On Time'}
                          </div>
                          <div className={`text-[10px] font-['Space_Mono',monospace] ${
                            selectedTrain.id === train.id ? 'text-white/60' : 'text-black/40'
                          }`}>
                            ETA: {train.destinationETA}
                          </div>
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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Simulation Controls for Operator */}
        {userRole === 'OPERATOR' && (
          <div className="hidden lg:flex items-center bg-white p-1 rounded-xl border border-black/10 text-xs shadow-2xs">
            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-['Space_Mono',monospace] text-[10px] uppercase font-bold transition-all cursor-pointer ${
                isSimulating ? 'bg-[#18181A] text-white shadow-2xs' : 'bg-black/5 text-black/70'
              }`}
              title="Toggle Live Telemetry Simulation Engine"
            >
              {isSimulating ? <Play className="w-3 h-3 text-[#E53E3E]" /> : <Pause className="w-3 h-3" />}
              <span>{isSimulating ? 'LIVE FEED' : 'PAUSED'}</span>
            </button>

            <div className="flex items-center ml-1 space-x-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-['Space_Mono',monospace] transition-colors cursor-pointer ${
                    simSpeed === speed ? 'bg-[#18181A] text-white' : 'text-black/40 hover:text-black'
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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 rounded-xl text-[#18181A] text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
          <span className="font-['Space_Mono',monospace] text-[10px] uppercase tracking-wider font-bold">
            {userRole === 'OPERATOR' ? 'SYS ONLINE' : 'LIVE TELEMETRY'}
          </span>
        </div>

        {/* Unread Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl text-black/70 hover:bg-black/5 transition-colors cursor-pointer"
          title="System Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E53E3E] text-white text-[9px] font-['Space_Mono',monospace] font-bold flex items-center justify-center">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Activity Log Trigger */}
        {onOpenActivityModal && (
          <button
            onClick={onOpenActivityModal}
            className="p-2 rounded-xl text-black/70 hover:bg-black/5 transition-colors cursor-pointer"
            title="User Activity & Audit Log"
          >
            <History className="w-4 h-4" />
          </button>
        )}

        {/* User Profile Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-black/10 cursor-pointer hover:opacity-80"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-['Space_Mono',monospace] font-bold text-xs ${
              userRole === 'OPERATOR' ? 'bg-[#18181A] text-white' : 'bg-[#E53E3E] text-white'
            }`}>
              {userRole === 'OPERATOR' ? 'OP' : 'PS'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-[#18181A] truncate max-w-[140px]">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Commuter')}
              </div>
              <div className="text-[10px] text-black/50 font-['Space_Mono',monospace] truncate max-w-[140px]">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in')}
              </div>
            </div>
          </button>

          {/* User Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/10 z-50 p-4 space-y-3 font-sans">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
                    userRole === 'OPERATOR' ? 'bg-[#18181A]' : 'bg-[#E53E3E]'
                  }`}>
                    {userRole === 'OPERATOR' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-[#18181A] text-sm truncate">
                      {currentUser?.name || (userRole === 'OPERATOR' ? 'Section Controller' : 'Commuter')}
                    </div>
                    <div className="text-xs text-black/50 font-['Space_Mono',monospace] truncate">
                      {currentUser?.email || (userRole === 'OPERATOR' ? 'trainoperator@gmail.com' : 'passenger@smarteta.in')}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-black/70 font-['Space_Mono',monospace]">
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-black/40">ROLE:</span>
                    <span className="font-bold text-[#18181A]">{userRole}</span>
                  </div>
                  {currentUser?.badgeId && (
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-black/40">BADGE:</span>
                      <span className="text-[#18181A]">{currentUser.badgeId}</span>
                    </div>
                  )}
                  {currentUser?.pnrOrTicket && (
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-black/40">TICKET:</span>
                      <span className="text-[#18181A]">{currentUser.pnrOrTicket}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-black/5 flex flex-col gap-2">
                  {onOpenActivityModal && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenActivityModal();
                      }}
                      className="w-full py-2 bg-black/5 hover:bg-black/10 text-[#18181A] rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
                    className="w-full py-2 bg-black/5 hover:bg-black/10 text-[#18181A] rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
                      className="w-full py-2 bg-[#E53E3E]/10 hover:bg-[#E53E3E]/20 text-[#E53E3E] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
