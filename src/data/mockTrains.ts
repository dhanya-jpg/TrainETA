import { TrainData, RailwayAlert, AnalyticsSummary, DelayPropagationState } from '../types';
import { ALL_RUNNING_INDIAN_TRAINS } from './allIndianTrains';

export const INITIAL_TRAINS: TrainData[] = ALL_RUNNING_INDIAN_TRAINS;

export const INITIAL_ALERTS: RailwayAlert[] = [
  {
    id: 'alert-1',
    trainNumber: '12626',
    trainName: 'Kerala Express',
    type: 'HIGH_DELAY_RISK',
    title: 'High Delay Accumulation Alert',
    message: 'Train 12626 is currently delayed by +52 mins due to temporary speed restriction (TSR) and caution orders in Itarsi-Bhopal section.',
    timestamp: '2 mins ago',
    severity: 'high',
    isRead: false,
    stationCode: 'ET'
  },
  {
    id: 'alert-2',
    trainNumber: '12802',
    trainName: 'Purushottam Express',
    type: 'HIGH_DELAY_RISK',
    title: 'Track Maintenance & Congestion Advisory',
    message: 'Train 12802 delayed by +65 mins approaching Gaya & DDU corridor. AI re-forecasted arrival at Prayagraj with 91% confidence.',
    timestamp: '4 mins ago',
    severity: 'high',
    isRead: false,
    stationCode: 'GAYA'
  },
  {
    id: 'alert-3',
    trainNumber: '12902',
    trainName: 'Gujarat Mail Up',
    type: 'MODERATE_DELAY',
    title: 'Signal Clearance Hold',
    message: 'Train 12902 held at Vadodara junction outer home signal. Interlocking team prioritizing Vande Bharat 20901 rake crossover.',
    timestamp: '6 mins ago',
    severity: 'medium',
    isRead: false,
    stationCode: 'BRC'
  },
  {
    id: 'alert-4',
    trainNumber: '22436',
    trainName: 'Vande Bharat Express (NDLS → BSB)',
    type: 'OPERATIONAL_INFO',
    title: 'High-Speed Corridor Green Signal Wave',
    message: 'Vande Bharat 22436 cruising on time at 128 km/h on Kanpur-Prayagraj dedicated track circuit.',
    timestamp: '8 mins ago',
    severity: 'info',
    isRead: true,
    stationCode: 'CNB'
  },
  {
    id: 'alert-5',
    trainNumber: '12951',
    trainName: 'Mumbai Tejas Rajdhani Express',
    type: 'OPERATIONAL_INFO',
    title: 'Automatic Block Signaling Normal',
    message: 'Train 12951 maintaining 115 km/h over Ratlam-Kota double line section. On schedule arrival at New Delhi predicted.',
    timestamp: '12 mins ago',
    severity: 'info',
    isRead: true,
    stationCode: 'KOTA'
  },
  {
    id: 'alert-6',
    trainNumber: '12431',
    trainName: 'Thiruvananthapuram Rajdhani Express',
    type: 'MODERATE_DELAY',
    title: 'Monsoon Caution Order on Konkan Railway',
    message: 'Heavy rain speed limits active across Ratnagiri-Madgaon tunnels. Delay buffer of +38 mins computed by ML model.',
    timestamp: '18 mins ago',
    severity: 'medium',
    isRead: false,
    stationCode: 'RN'
  },
  {
    id: 'alert-7',
    trainNumber: '12296',
    trainName: 'Sanghamitra Express',
    type: 'HIGH_DELAY_RISK',
    title: 'Dense Traffic Cascading Delay',
    message: 'Train 12296 experiencing section headway compression (+72 mins) between Nagpur and Vijayawada.',
    timestamp: '25 mins ago',
    severity: 'high',
    isRead: false,
    stationCode: 'NGP'
  }
];

export const INITIAL_PROPAGATION_DATA: DelayPropagationState = {
  primaryTrainNumber: '12901',
  sectionName: 'Vadodara (BRC) – Anand (ANND) – Ahmedabad (ADI) Corridor',
  downstreamWarning: 'Potential downstream impact detected: Trailing Train 12902 and Shinkansen-grade Vande Bharat 20901 experiencing section headway compression.',
  nodes: [
    {
      id: 'node-1',
      trainNumber: '12901',
      trainName: 'Gujarat Mail (Lead Train)',
      currentDelay: 12,
      propagatedDelay: 12,
      occupiedSection: 'Block 44-A (Nadiad - Anand)',
      status: 'PRIMARY',
      headwayMinutes: 0
    },
    {
      id: 'node-2',
      trainNumber: '12902',
      trainName: 'Gujarat Mail Up',
      currentDelay: 18,
      propagatedDelay: 7,
      occupiedSection: 'Block 42-B (Vadodara Outers)',
      status: 'IMPACTED_DIRECT',
      headwayMinutes: 4.8
    },
    {
      id: 'node-3',
      trainNumber: '20901',
      trainName: 'Vande Bharat Express',
      currentDelay: 6,
      propagatedDelay: 4,
      occupiedSection: 'Block 40-C (Surat - Vadodara)',
      status: 'IMPACTED_INDIRECT',
      headwayMinutes: 9.8
    }
  ],
  links: [
    {
      fromTrain: '12901',
      toTrain: '12902',
      section: 'Section BRC-ANND Track 1',
      delayTransferredMinutes: 7,
      risk: 'HIGH'
    },
    {
      fromTrain: '12902',
      toTrain: '20901',
      section: 'Section ANND-ND Track 2 Turnout',
      delayTransferredMinutes: 4,
      risk: 'MEDIUM'
    }
  ]
};

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  activeTrainsCount: ALL_RUNNING_INDIAN_TRAINS.length,
  delayedTrainsCount: ALL_RUNNING_INDIAN_TRAINS.filter(t => t.currentDelayMinutes > 15).length,
  averageDelayMinutes: Math.round(
    ALL_RUNNING_INDIAN_TRAINS.reduce((acc, t) => acc + t.currentDelayMinutes, 0) / ALL_RUNNING_INDIAN_TRAINS.length
  ),
  overallAccuracyPercent: 94,
  riskBreakdown: {
    lowPercent: 45,
    mediumPercent: 38,
    highPercent: 17
  },
  modelBenchmarks: [
    {
      modelName: 'XGBoost Dynamic Gradient Regressor',
      maeMinutes: 3.4,
      rmseMinutes: 4.8,
      accuracyPercent: 94.6,
      trainingTimeSec: 142,
      inferenceLatencyMs: 14,
      isProductionModel: true
    },
    {
      modelName: 'Random Forest Ensemble',
      maeMinutes: 4.9,
      rmseMinutes: 6.4,
      accuracyPercent: 89.2,
      trainingTimeSec: 210,
      inferenceLatencyMs: 32,
      isProductionModel: false
    },
    {
      modelName: 'Baseline Linear Regression',
      maeMinutes: 7.8,
      rmseMinutes: 10.4,
      accuracyPercent: 79.1,
      trainingTimeSec: 18,
      inferenceLatencyMs: 4,
      isProductionModel: false
    }
  ],
  topBottleneckStations: [
    {
      stationName: 'Kanpur Central',
      stationCode: 'CNB',
      avgDelayContributionMins: 9.2,
      frequencyPercent: 44
    },
    {
      stationName: 'Pt Deen Dayal Upadhyaya Jn',
      stationCode: 'DDU',
      avgDelayContributionMins: 8.7,
      frequencyPercent: 39
    },
    {
      stationName: 'Vadodara Junction',
      stationCode: 'BRC',
      avgDelayContributionMins: 7.4,
      frequencyPercent: 35
    },
    {
      stationName: 'Itarsi Junction',
      stationCode: 'ET',
      avgDelayContributionMins: 6.8,
      frequencyPercent: 31
    },
    {
      stationName: 'Surat Junction',
      stationCode: 'ST',
      avgDelayContributionMins: 5.6,
      frequencyPercent: 28
    }
  ]
};

// Compatibility aliases
export const MOCK_TRAINS = INITIAL_TRAINS;
export const MOCK_ALERTS = INITIAL_ALERTS;
export const MOCK_ANALYTICS = INITIAL_ANALYTICS;
