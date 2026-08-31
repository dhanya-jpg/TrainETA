import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
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
import { GoogleDocsManager } from './components/docs/GoogleDocsManager';
import { AITrainCopilot } from './components/ai/AITrainCopilot';
import { LandingModal } from './components/landing/LandingModal';
import { LoginPage } from './components/auth/LoginPage';
import { OperatorAuthModal } from './components/auth/OperatorAuthModal';
import { UserActivityModal } from './components/activity/UserActivityModal';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { AmbientBackground } from './components/layout/AmbientBackground';

import { MOCK_TRAINS, MOCK_ALERTS, MOCK_ANALYTICS } from './data/mockTrains';
import { TrainData, UserRole, RailwayAlert, AnalyticsSummary, AuthUser } from './types';
import { recalculateTrainETAs } from './services/etaPredictionService';
import { advanceTrainPhysics } from './services/trainSimulationEngine';
import { onlineMLTrainingService } from './services/onlineMLTrainingService';
import { logUserActivity, logRecentSearch, logoutFirebase } from './services/firebase';

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
  const [selectedTrain, setSelectedTrain] = useState<TrainData>(() => {
    return MOCK_TRAINS[Math.floor(Math.random() * MOCK_TRAINS.length)];
  });
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
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isLandingModalOpen, setIsLandingModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
  const handleLogout = async () => {
    const userId = currentUser?.uid;
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove stored user', e);
    }
    if (userId) {
      try {
        await logoutFirebase(userId);
      } catch (err) {
        console.warn('Firebase logout note:', err);
      }
    }
  };

  // Toggle user role with strict security check
  const handleToggleRole = () => {
    if (userRole === 'OPERATOR') {
      // Operator switching to preview passenger view
      setUserRole('PASSENGER');
      setActiveTab('passenger-view');
      if (currentUser?.uid) {
        logUserActivity(currentUser.uid, {
          activityType: 'SWITCH_ROLE',
          title: 'Switched View to Passenger Portal',
          details: 'Switched interface context to Commuter / Passenger Live ETA View.'
        });
      }
    } else {
      // In Passenger mode: check if authenticated operator is previewing
      if (currentUser && currentUser.role === 'OPERATOR') {
        setUserRole('OPERATOR');
        setActiveTab('dashboard');
        logUserActivity(currentUser.uid, {
          activityType: 'SWITCH_ROLE',
          title: 'Switched View to Operator Dashboard',
          details: 'Switched interface context to Chief Train Controller Dashboard.'
        });
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
    if (currentUser?.uid) {
      logRecentSearch(currentUser.uid, {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        source: train.sourceName,
        destination: train.destinationName
      });
    }
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
      if (currentUser?.uid) {
        logRecentSearch(currentUser.uid, {
          trainNumber: found.trainNumber,
          trainName: found.trainName,
          source: found.sourceName,
          destination: found.destinationName
        });
      }
    }
  };

  // Dismiss alert
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Live telemetry & continuous train physics movement loop
  useEffect(() => {
    if (!isSimulating || !currentUser) return;

    // Fast 1000ms tick for fluid train movement along railway track
    const intervalMs = 1000;
    let lastTickTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.max(0.5, Math.min(3, (now - lastTickTime) / 1000));
      lastTickTime = now;

      setTrains((prevTrains) =>
        prevTrains.map((t) => advanceTrainPhysics(t, deltaSec, simSpeed))
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, currentUser]);

  // Feed live telemetry updates into Online ML Service in a safe React effect lifecycle
  useEffect(() => {
    if (isSimulating && trains.length > 0) {
      onlineMLTrainingService.ingestTelemetryAndTrain(trains);
    }
  }, [trains, isSimulating]);

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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-bg font-sans text-ink antialiased">
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

      {/* User Activity & Audit Trail Modal */}
      <UserActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        {isDesktopSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="hidden lg:flex shrink-0 overflow-hidden"
          >
            <div className="w-[280px] shrink-0 h-full">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile & Tablet Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] lg:hidden flex"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative z-10 h-[100dvh] shadow-2xl"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0">
        {/* Top Navbar */}
        <TopNav
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onSearchTrain={handleSelectTrainByNumber}
          onOpenAICopilot={() => setActiveTab('ai-copilot')}
          onOpenMLAnalytics={() => {
            if (userRole === 'OPERATOR') {
              setActiveTab('analytics');
            } else {
              setActiveTab('ai-copilot');
            }
          }}
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
          onToggleMobileSidebar={() => {
            if (window.innerWidth >= 1024) {
              setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
            } else {
              setIsMobileSidebarOpen(true);
            }
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenActivityModal={() => setIsActivityModalOpen(true)}
        />

        {/* Scrollable View Container */}
        <SmoothScroll className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 custom-scrollbar min-w-0 scroll-smooth relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
            >
              {/* TAB: Dashboard (Operator) */}
              {activeTab === 'dashboard' && userRole === 'OPERATOR' && (
                <div className="space-y-8">
                  <div className="pt-2 pb-2">
                    <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink tracking-tight">SMART ETA Live Tracking</h1>
                    <p className="text-ink/60 mt-2 sm:mt-3 font-mono-code text-sm sm:text-base uppercase tracking-wider">Operator Control Dashboard</p>
                  </div>

                  {/* Selected Train Banner */}
                  <SelectedTrainBanner
                    train={selectedTrain}
                    onOpenXAI={() => setActiveTab('ai-explanation')}
                    onOpenSimulation={() => setActiveTab('what-if')}
                    onOpenMap={() => setActiveTab('live-map')}
                  />

                  {/* Interactive Live Map */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.2 }}
                    className="bg-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-display text-ink tracking-tight">
                          Live Telemetry Route Tracking: {selectedTrain.trainNumber}
                        </h3>
                        <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
                          GPS coordinates with animated train position and interactive station waypoints.
                        </p>
                      </div>
                    </div>
                    <div className="h-[380px] sm:h-[480px] w-full rounded-2xl overflow-hidden border border-border">
                      <LiveTrainMap train={selectedTrain} />
                    </div>
                  </motion.div>

                  {/* Delay Forecast Line & Donut Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.3 }}
                  >
                    <DelayForecastChart train={selectedTrain} />
                  </motion.div>

                  {/* Station-by-Station Dynamic ETA Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.4 }}
                  >
                    <StationETATable train={selectedTrain} />
                  </motion.div>
                </div>
              )}

              {/* TAB: AI Copilot */}
              {activeTab === 'ai-copilot' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <AITrainCopilot
                    selectedTrain={selectedTrain}
                    onSelectTrainByNumber={handleSelectTrainByNumber}
                    isOpen={true}
                  />
                </div>
              )}

              {/* TAB: Live Map */}
              {activeTab === 'live-map' && (
                <div className="space-y-6">
                  {userRole === 'OPERATOR' && (
                    <SelectedTrainBanner
                      train={selectedTrain}
                      onOpenXAI={() => setActiveTab('ai-explanation')}
                      onOpenSimulation={() => setActiveTab('what-if')}
                      onOpenMap={() => {}}
                    />
                  )}
                  <div className="h-[460px] sm:h-[calc(100vh-220px)] w-full rounded-2xl sm:rounded-3xl border border-border shadow-xs overflow-hidden">
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
                <div className="space-y-8">
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
                <div className="space-y-8">
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
                <div className="space-y-8">
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

              {/* TAB: Google Docs Workspace Hub */}
              {activeTab === 'google-docs' && (
                <GoogleDocsManager
                  trains={trains}
                  selectedTrain={selectedTrain}
                  currentUser={currentUser}
                  onSelectTrain={handleSelectTrain}
                />
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
            </motion.div>
          </AnimatePresence>
        </SmoothScroll>
      </div>
    </div>
  );
}

export default App;
