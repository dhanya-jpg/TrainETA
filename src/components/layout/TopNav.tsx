import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  CheckCircle2, 
  Play, 
  Pause, 
  FastForward, 
  User, 
  Train, 
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
  Shield,
  Ticket,
  Lock
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
  onLogout
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
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Left: Mobile Menu + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Train Search Box */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search Train No. (e.g. 12901), Name, Route..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>SELECT ACTIVE TRAIN</span>
                  <span>{filteredTrains.length} FOUND</span>
                </div>
                {filteredTrains.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching train found. Try "12901", "12951", or "Rajdhani".
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
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedTrain.id === train.id
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold font-mono">
                            <Train className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              {train.trainNumber} - {train.trainName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {train.sourceName} → {train.destinationName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-bold ${train.currentDelayMinutes > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {train.currentDelayMinutes > 0 ? `+${train.currentDelayMinutes} min` : 'On Time'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
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
        {/* Simulation Play / Pause / Speed for Operator */}
        {userRole === 'OPERATOR' && (
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isSimulating ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
              }`}
              title="Toggle Live Telemetry Simulation Engine"
            >
              {isSimulating ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isSimulating ? 'Live Feed' : 'Paused'}</span>
            </button>

            <div className="flex items-center ml-1 space-x-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                    simSpeed === speed ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px]">
            {userRole === 'OPERATOR' ? 'Control Room Online' : 'Telemetry Live'}
          </span>
        </div>

        {/* Unread Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="System Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile & Logout Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              userRole === 'OPERATOR' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {userRole === 'OPERATOR' ? 'OP' : 'PS'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-extrabold text-slate-900 truncate max-w-[140px]">
                {currentUser?.name || (userRole === 'OPERATOR' ? 'Chief Dispatcher' : 'Commuter')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                {currentUser?.email || (userRole === 'OPERATOR' ? 'trainetaoperator@gmail.com' : 'passenger@smarteta.in')}
              </div>
            </div>
          </button>

          {/* User Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                    userRole === 'OPERATOR' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    {userRole === 'OPERATOR' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-black text-slate-900 text-sm truncate">
                      {currentUser?.name || (userRole === 'OPERATOR' ? 'Chief Controller' : 'Commuter')}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">
                      {currentUser?.email || (userRole === 'OPERATOR' ? 'trainetaoperator@gmail.com' : 'passenger@smarteta.in')}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-bold font-mono text-slate-900">{userRole}</span>
                  </div>
                  {currentUser?.badgeId && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Badge ID:</span>
                      <span className="font-mono text-slate-900">{currentUser.badgeId}</span>
                    </div>
                  )}
                  {currentUser?.pnrOrTicket && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Ticket:</span>
                      <span className="font-mono text-slate-900">{currentUser.pnrOrTicket}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Session Started:</span>
                    <span className="font-mono text-slate-900">{currentUser?.loginTime || 'Active'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onToggleRole();
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {userRole === 'PASSENGER' && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{userRole === 'OPERATOR' ? 'Switch to Passenger View' : 'Operator Control (Protected)'}</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
