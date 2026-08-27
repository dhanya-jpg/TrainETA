import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { StatCards } from './components/dashboard/StatCards';
import { SelectedTrainBanner } from './components/dashboard/SelectedTrainBanner';
import { LiveTrainMap } from './components/map/LiveTrainMap';
import { StationETATable } from './components/prediction/StationETATable';
import { DelayForecastChart } from './components/prediction/DelayForecastChart';
import { ExplainableAIView } from './components/explainability/ExplainableAIView';
import { WhatIfSimulationView } from './components/simulation/WhatIfSimulationView';
import { DelayPropagationView } from './components/propagation/DelayPropagationView';
import { RailwayControlView } from './components/control/RailwayControlView';
import { PassengerView } from './components/passenger/PassengerView';
import { TrainSearchView } from './components/search/TrainSearchView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { LandingModal } from './components/landing/LandingModal';
import { LoginPage } from './components/auth/LoginPage';
import { OperatorAuthModal } from './components/auth/OperatorAuthModal';

import { MOCK_TRAINS, MOCK_ALERTS, MOCK_ANALYTICS } from './data/mockTrains';
import { TrainData, UserRole, RailwayAlert, AnalyticsSummary, AuthUser } from './types';
import { recalculateTrainETAs } from './services/etaPredictionService';

const STORAGE_KEY = 'smart_eta_auth_user_v2';

const OPERATOR_ONLY_TABS: NavigationTab[] = [
  'dashboard',
  'eta-prediction',
  'delay-analysis',
  'ai-explanation',
  'what-if',
  'delay-propagation',
  'railway-control',
  'analytics',
  'reports'
];

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return null;
  });

  // Application Data State
  const [trains, setTrains] = useState<TrainData[]>(MOCK_TRAINS);
  const [selectedTrain, setSelectedTrain] = useState<TrainData>(MOCK_TRAINS[0]);
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    return currentUser?.role === 'PASSENGER' ? 'passenger-view' : 'dashboard';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return currentUser?.role || 'OPERATOR';
  });
  const [alerts, setAlerts] = useState<RailwayAlert[]>(MOCK_ALERTS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(MOCK_ANALYTICS);
  
  // Modals & simulation state
  const [isOperatorAuthModalOpen, setIsOperatorAuthModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isLandingModalOpen, setIsLandingModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Handle Login Success
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store user', e);
    }
    if (user.role === 'PASSENGER') {
      setActiveTab('passenger-view');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove stored user', e);
    }
  };

  // Toggle user role with strict security check
  const handleToggleRole = () => {
    if (userRole === 'OPERATOR') {
      // Operator switching to preview passenger view
      setUserRole('PASSENGER');
      setActiveTab('passenger-view');
    } else {
      // In Passenger mode: check if authenticated operator is previewing
      if (currentUser && currentUser.role === 'OPERATOR') {
        setUserRole('OPERATOR');
        setActiveTab('dashboard');
      } else {
        // Authenticated as Passenger: MUST authenticate as Operator first
        setIsOperatorAuthModalOpen(true);
      }
    }
  };

  // Handle Tab Selection with Role Guarding
  const handleSelectTab = (tab: NavigationTab) => {
    if (userRole === 'PASSENGER' && OPERATOR_ONLY_TABS.includes(tab)) {
      if (currentUser?.role !== 'OPERATOR') {
        setIsOperatorAuthModalOpen(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  // Handle successful elevation to Operator
  const handleOperatorElevationSuccess = (operatorUser: AuthUser) => {
    setCurrentUser(operatorUser);
    setUserRole('OPERATOR');
    setActiveTab('dashboard');
    setIsOperatorAuthModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operatorUser));
    } catch (e) {
      console.error('Failed to store operator elevation', e);
    }
  };

  // Select train handler
  const handleSelectTrain = (train: TrainData) => {
    setSelectedTrain(train);
  };

  const handleSelectTrainByNumber = (trainNumber: string) => {
    const found = trains.find((t) => t.trainNumber === trainNumber);
    if (found) {
      setSelectedTrain(found);
      if (userRole === 'OPERATOR') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('passenger-view');
      }
    }
  };

  // Dismiss alert
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Live telemetry pulse simulator
  useEffect(() => {
    if (!isSimulating || !currentUser) return;

    const intervalMs = Math.max(3000, 10000 / simSpeed);

    const timer = setInterval(() => {
      setTrains((prevTrains) =>
        prevTrains.map((t) => {
          // Realistic GPS drift / speed fluctuations
          const speedVariance = (Math.random() - 0.5) * 4;
          const newSpeed = Math.max(35, Math.min(130, Math.round(t.currentSpeedKmH + speedVariance)));
          
          // Recompute with updated speed
          const updated = recalculateTrainETAs(t, {
            speedKmH: newSpeed,
            delayMinutes: t.currentDelayMinutes,
          });

          return updated;
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, currentUser]);

  // Sync selectedTrain whenever trains array updates
  useEffect(() => {
    const updatedSelected = trains.find((t) => t.id === selectedTrain.id);
    if (updatedSelected) {
      setSelectedTrain(updatedSelected);
    }
  }, [trains, selectedTrain.id]);

  // If not authenticated, display dedicated Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        defaultRole="OPERATOR"
      />
    );
  }

  const unreadAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Landing / System Overview Modal */}
      <LandingModal
        isOpen={isLandingModalOpen}
        onClose={() => setIsLandingModalOpen(false)}
        onExploreDemo={() => setActiveTab('dashboard')}
      />

      {/* Operator Authentication Required Modal */}
      <OperatorAuthModal
        isOpen={isOperatorAuthModalOpen}
        onClose={() => setIsOperatorAuthModalOpen(false)}
        onVerifySuccess={handleOperatorElevationSuccess}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          unreadAlertsCount={unreadAlertsCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                handleSelectTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              userRole={userRole}
              onToggleRole={handleToggleRole}
              unreadAlertsCount={unreadAlertsCount}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          trains={trains}
          selectedTrain={selectedTrain}
          onSelectTrain={handleSelectTrain}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          unreadAlertsCount={unreadAlertsCount}
          onOpenAlerts={() => setActiveTab('alerts')}
          isSimulating={isSimulating}
          onToggleSimulating={() => setIsSimulating(!isSimulating)}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {/* TAB: Dashboard (Operator) */}
          {activeTab === 'dashboard' && userRole === 'OPERATOR' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <StatCards
                analytics={analytics}
                onCardClick={(type) => {
                  if (type === 'accuracy') setActiveTab('analytics');
                  else if (type === 'delayed') setActiveTab('railway-control');
                }}
              />

              {/* Selected Train Banner */}
              <SelectedTrainBanner
                train={selectedTrain}
                onOpenXAI={() => setActiveTab('ai-explanation')}
                onOpenSimulation={() => setActiveTab('what-if')}
                onOpenMap={() => setActiveTab('live-map')}
              />

              {/* Interactive Live Map */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Live Telemetry Route Tracking: {selectedTrain.trainNumber}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      GPS coordinates with animated train position and interactive station waypoints.
                    </p>
                  </div>
                </div>
                <div className="h-[420px] w-full">
                  <LiveTrainMap train={selectedTrain} />
                </div>
              </div>

              {/* Delay Forecast Line & Donut Chart */}
              <DelayForecastChart train={selectedTrain} />

              {/* Station-by-Station Dynamic ETA Table */}
              <StationETATable train={selectedTrain} />
            </div>
          )}

          {/* TAB: Live Map */}
          {activeTab === 'live-map' && (
            <div className="space-y-4">
              {userRole === 'OPERATOR' && (
                <SelectedTrainBanner
                  train={selectedTrain}
                  onOpenXAI={() => setActiveTab('ai-explanation')}
                  onOpenSimulation={() => setActiveTab('what-if')}
                  onOpenMap={() => {}}
                />
              )}
              <div className="h-[calc(100vh-220px)] w-full bg-white p-3 rounded-3xl border border-slate-200 shadow-xs">
                <LiveTrainMap train={selectedTrain} />
              </div>
            </div>
          )}

          {/* TAB: Train Search */}
          {activeTab === 'search' && (
            <TrainSearchView
              trains={trains}
              selectedTrain={selectedTrain}
              onSelectTrain={handleSelectTrain}
              onOpenDetails={() => {
                if (userRole === 'OPERATOR') {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('passenger-view');
                }
              }}
            />
          )}

          {/* TAB: ETA Prediction (Operator) */}
          {activeTab === 'eta-prediction' && userRole === 'OPERATOR' && (
            <div className="space-y-6">
              <SelectedTrainBanner
                train={selectedTrain}
                onOpenXAI={() => setActiveTab('ai-explanation')}
                onOpenSimulation={() => setActiveTab('what-if')}
                onOpenMap={() => setActiveTab('live-map')}
              />
              <StationETATable train={selectedTrain} />
              <DelayForecastChart train={selectedTrain} />
            </div>
          )}

          {/* TAB: Delay Analysis (Operator) */}
          {activeTab === 'delay-analysis' && userRole === 'OPERATOR' && (
            <div className="space-y-6">
              <SelectedTrainBanner
                train={selectedTrain}
                onOpenXAI={() => setActiveTab('ai-explanation')}
                onOpenSimulation={() => setActiveTab('what-if')}
                onOpenMap={() => setActiveTab('live-map')}
              />
              <DelayForecastChart train={selectedTrain} />
              <ExplainableAIView train={selectedTrain} />
            </div>
          )}

          {/* TAB: AI Explanation (Operator) */}
          {activeTab === 'ai-explanation' && userRole === 'OPERATOR' && (
            <div className="space-y-6">
              <SelectedTrainBanner
                train={selectedTrain}
                onOpenXAI={() => {}}
                onOpenSimulation={() => setActiveTab('what-if')}
                onOpenMap={() => setActiveTab('live-map')}
              />
              <ExplainableAIView train={selectedTrain} />
            </div>
          )}

          {/* TAB: What-If Simulation (Operator) */}
          {activeTab === 'what-if' && userRole === 'OPERATOR' && (
            <WhatIfSimulationView train={selectedTrain} />
          )}

          {/* TAB: Delay Propagation (Operator) */}
          {activeTab === 'delay-propagation' && userRole === 'OPERATOR' && (
            <DelayPropagationView onSelectTrain={handleSelectTrainByNumber} />
          )}

          {/* TAB: Railway Control (Operator) */}
          {activeTab === 'railway-control' && userRole === 'OPERATOR' && (
            <RailwayControlView
              trains={trains}
              selectedTrain={selectedTrain}
              onSelectTrain={handleSelectTrain}
              onOpenSimulation={(t) => {
                setSelectedTrain(t);
                setActiveTab('what-if');
              }}
            />
          )}

          {/* TAB: Alerts */}
          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onDismissAlert={handleDismissAlert}
              onSelectTrainByNumber={handleSelectTrainByNumber}
            />
          )}

          {/* TAB: Analytics & Benchmarks (Operator) */}
          {activeTab === 'analytics' && userRole === 'OPERATOR' && (
            <AnalyticsView analytics={analytics} />
          )}

          {/* TAB: Reports & Architecture (Operator) */}
          {activeTab === 'reports' && userRole === 'OPERATOR' && (
            <ReportsView />
          )}

          {/* TAB: Passenger View */}
          {activeTab === 'passenger-view' && (
            <PassengerView
              trains={trains}
              selectedTrain={selectedTrain}
              onSelectTrain={handleSelectTrain}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
