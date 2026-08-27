export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type StationStatus = 'DEPARTED' | 'CURRENT' | 'NEXT' | 'UPCOMING';
export type SignalAspect = 'CLEAR_GREEN' | 'CAUTION_YELLOW' | 'ATTENTION_DOUBLE_YELLOW' | 'STOP_RED';
export type WeatherCondition = 'CLEAR' | 'FOG' | 'HEAVY_RAIN' | 'THUNDERSTORM';
export type TrackCondition = 'NORMAL' | 'CAUTION_TSR' | 'RESTRICTED';
export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type UserRole = 'OPERATOR' | 'PASSENGER';

export interface AuthUser {
  uid?: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  badgeId?: string;
  pnrOrTicket?: string;
  loginTime: string;
}

export interface StationStop {
  stationCode: string;
  stationName: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  predictedArrival: string;
  predictedDeparture: string;
  predictedDelayMinutes: number;
  confidenceScore: number;
  etaRange: string;
  riskLevel: RiskLevel;
  status: StationStatus;
  platform: number;
  historicalAvgHaltMins: number;
}

export interface ExplainabilityFactor {
  id: string;
  name: string;
  category: 'ACCUMULATED_DELAY' | 'TRAFFIC_CONGESTION' | 'STATION_HALT' | 'SPEED_RECOVERY' | 'WEATHER' | 'TRACK_RESTRICTION' | 'SIGNAL';
  impactMinutes: number; // positive increases delay, negative recovers
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TrainData {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: 'SUPERFAST' | 'RAJDHANI' | 'SHATABDI' | 'VANDE_BHARAT' | 'MAIL_EXPRESS';
  source: string;
  sourceName: string;
  destination: string;
  destinationName: string;
  totalDistanceKm: number;
  
  // Current live state
  currentLocationName: string;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeedKmH: number;
  maxSpeedKmH: number;
  currentDelayMinutes: number;
  currentStationIndex: number;
  nextStationCode: string;
  nextStationName: string;
  distanceToNextStationKm: number;
  lastUpdated: string;
  
  // Environmental & operational conditions
  signalAspect: SignalAspect;
  weather: WeatherCondition;
  trackCondition: TrackCondition;
  trafficLevel: TrafficLevel;
  precedingTrainGapKm: number;
  
  // Station sequence with ETAs
  stops: StationStop[];
  
  // High-level predictions for destination
  destinationETA: string;
  destinationPredictedDelay: number;
  destinationConfidence: number;
  destinationETARange: string;
  destinationRisk: RiskLevel;
  
  // Explainability breakdown
  explainability: ExplainabilityFactor[];
}

export interface WhatIfParameters {
  speedAdjustmentPercent: number; // -20 to +20
  stationHaltAdjustmentMinutes: number; // -5 to +10
  trafficCondition: TrafficLevel;
  trackRestriction: TrackCondition;
  signalPriority: 'NORMAL' | 'PRIORITY';
}

export interface WhatIfStationComparison {
  stationCode: string;
  stationName: string;
  originalETA: string;
  simulatedETA: string;
  originalDelay: number;
  simulatedDelay: number;
  deltaMinutes: number;
}

export interface WhatIfResult {
  trainNumber: string;
  destinationStation: string;
  originalETA: string;
  simulatedETA: string;
  originalDelayMinutes: number;
  simulatedDelayMinutes: number;
  netImpactMinutes: number; // positive = added delay, negative = recovered
  isRecovered: boolean;
  stationComparisons: WhatIfStationComparison[];
  simulationNotes: string;
}

export interface PropagationNode {
  id: string;
  trainNumber: string;
  trainName: string;
  currentDelay: number;
  propagatedDelay: number;
  occupiedSection: string;
  status: 'PRIMARY' | 'IMPACTED_DIRECT' | 'IMPACTED_INDIRECT';
  headwayMinutes: number;
}

export interface PropagationLink {
  fromTrain: string;
  toTrain: string;
  section: string;
  delayTransferredMinutes: number;
  risk: RiskLevel;
}

export interface DelayPropagationState {
  primaryTrainNumber: string;
  sectionName: string;
  downstreamWarning: string;
  nodes: PropagationNode[];
  links: PropagationLink[];
}

export interface SystemAlert {
  id: string;
  trainNumber?: string;
  trainName?: string;
  type?: 'HIGH_DELAY_RISK' | 'MODERATE_DELAY' | 'OPERATIONAL_INFO';
  title: string;
  message: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'high' | 'medium' | 'info';
  isRead?: boolean;
  isAcknowledged?: boolean;
  stationCode?: string;
  section?: string;
}

export type RailwayAlert = SystemAlert;

export interface ModelBenchmark {
  modelName: string;
  maeMinutes: number;
  rmseMinutes: number;
  accuracyPercent: number;
  trainingTimeSec: number;
  inferenceLatencyMs: number;
  isProductionModel: boolean;
}

export interface AnalyticsSummary {
  activeTrainsCount: number;
  delayedTrainsCount: number;
  averageDelayMinutes: number;
  overallAccuracyPercent: number;
  riskBreakdown: {
    lowPercent: number;
    mediumPercent: number;
    highPercent: number;
  };
  modelBenchmarks: ModelBenchmark[];
  topBottleneckStations: {
    stationName: string;
    stationCode: string;
    avgDelayContributionMins: number;
    frequencyPercent: number;
  }[];
}
