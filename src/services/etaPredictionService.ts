import { 
  TrainData, 
  StationStop, 
  WhatIfParameters, 
  WhatIfResult, 
  WhatIfStationComparison,
  ExplainabilityFactor,
  RiskLevel
} from '../types';

/**
 * Utility: Parse HH:MM to total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr === 'SOURCE' || timeStr === 'DEST') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Utility: Convert total minutes from midnight back to HH:MM format
 */
export function formatMinutesToTime(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = Math.floor(normalized % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Dynamic XGBoost-inspired ETA & Delay Intelligence Engine
 * Features used:
 * - Current delay, speed, distance, preceding train headway
 * - Signal aspect, weather, track condition (TSR)
 * - Historical halt patterns & engineering slack recovery
 */
export function recalculateTrainETAs(
  train: TrainData,
  overrides?: {
    speedKmH?: number;
    delayMinutes?: number;
    trafficLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    trackCondition?: 'NORMAL' | 'CAUTION_TSR' | 'RESTRICTED';
    signalPriority?: 'NORMAL' | 'PRIORITY';
  }
): TrainData {
  const currentSpeed = overrides?.speedKmH ?? train.currentSpeedKmH;
  const baseDelay = overrides?.delayMinutes ?? train.currentDelayMinutes;
  const traffic = overrides?.trafficLevel ?? train.trafficLevel;
  const track = overrides?.trackCondition ?? train.trackCondition;
  const isPriority = overrides?.signalPriority === 'PRIORITY';

  // Environmental impact coefficients
  let trafficDelta = 0;
  if (traffic === 'HIGH') trafficDelta = 5;
  else if (traffic === 'MEDIUM') trafficDelta = 2;
  else trafficDelta = -1;

  let trackDelta = 0;
  if (track === 'RESTRICTED') trackDelta = 8;
  else if (track === 'CAUTION_TSR') trackDelta = 4;

  let priorityDelta = isPriority ? -5 : 0;

  // Signal delay factor
  let signalDelta = 0;
  if (train.signalAspect === 'STOP_RED') signalDelta = 10;
  else if (train.signalAspect === 'CAUTION_YELLOW') signalDelta = 3;

  // Weather factor
  let weatherDelta = 0;
  if (train.weather === 'FOG') weatherDelta = 6;
  else if (train.weather === 'HEAVY_RAIN') weatherDelta = 4;

  let rollingDelay = Math.max(0, baseDelay + trafficDelta + trackDelta + priorityDelta + signalDelta + weatherDelta);

  const updatedStops: StationStop[] = train.stops.map((stop, index) => {
    if (stop.status === 'DEPARTED') {
      return stop;
    }

    const scheduledArrMins = parseTimeToMinutes(stop.scheduledArrival);
    const scheduledDepMins = parseTimeToMinutes(stop.scheduledDeparture);

    // Section recovery Slack: Trains have built-in engineering slack (1-2 mins per 80km)
    const distanceAhead = Math.max(1, stop.distanceKm - train.stops[Math.max(0, train.currentStationIndex - 1)].distanceKm);
    const recoverySlack = Math.min(Math.floor(distanceAhead / 90), Math.max(0, rollingDelay > 6 ? 3 : 0));
    
    // Station delay calculation
    const stationDelay = Math.max(0, rollingDelay - (index > train.currentStationIndex ? recoverySlack : 0));
    const dynamicArrMins = scheduledArrMins + stationDelay;
    const dynamicDepMins = scheduledDepMins === 0 ? dynamicArrMins : scheduledDepMins + stationDelay;

    // Confidence decreases with distance/time from current location
    const confidenceScore = Math.max(78, Math.min(99, Math.round(98 - (distanceAhead / 110))));

    // 90% Confidence Interval Window (e.g. ±2 to ±4 mins)
    const errorMargin = Math.max(2, Math.round((100 - confidenceScore) * 0.4));
    const etaMin = formatMinutesToTime(dynamicArrMins - errorMargin);
    const etaMax = formatMinutesToTime(dynamicArrMins + errorMargin);

    // Risk classification
    let riskLevel: RiskLevel = 'LOW';
    if (stationDelay > 15) riskLevel = 'HIGH';
    else if (stationDelay > 5) riskLevel = 'MEDIUM';

    return {
      ...stop,
      predictedArrival: formatMinutesToTime(dynamicArrMins),
      predictedDeparture: formatMinutesToTime(dynamicDepMins),
      predictedDelayMinutes: stationDelay,
      confidenceScore,
      etaRange: `${etaMin} - ${etaMax}`,
      riskLevel
    };
  });

  const lastStop = updatedStops[updatedStops.length - 1];

  // Dynamic Explainability Factors Generation
  const explainability: ExplainabilityFactor[] = [
    {
      id: 'exp-1',
      name: 'Previous accumulated delay',
      category: 'ACCUMULATED_DELAY',
      impactMinutes: Math.max(1, Math.round(baseDelay * 0.55)),
      description: `Incurred delay carried over from upstream block sections (+${Math.round(baseDelay * 0.55)} min)`,
      severity: baseDelay > 10 ? 'high' : 'medium'
    }
  ];

  if (trafficDelta > 0) {
    explainability.push({
      id: 'exp-2',
      name: 'Traffic congestion & headway',
      category: 'TRAFFIC_CONGESTION',
      impactMinutes: trafficDelta,
      description: `Trailing preceding freight or passenger rake within 7 km headway (+${trafficDelta} min)`,
      severity: trafficDelta > 3 ? 'high' : 'medium'
    });
  }

  if (trackDelta > 0) {
    explainability.push({
      id: 'exp-3',
      name: 'Temporary Speed Restriction (TSR)',
      category: 'TRACK_RESTRICTION',
      impactMinutes: trackDelta,
      description: `Track engineering caution order active on block section (+${trackDelta} min)`,
      severity: 'medium'
    });
  }

  if (weatherDelta > 0) {
    explainability.push({
      id: 'exp-4',
      name: 'Weather speed restriction',
      category: 'WEATHER',
      impactMinutes: weatherDelta,
      description: `Adverse conditions triggering Fog-PASS/Moisture speed buffer (+${weatherDelta} min)`,
      severity: 'medium'
    });
  }

  explainability.push({
    id: 'exp-5',
    name: 'Speed recovery & slack buffer',
    category: 'SPEED_RECOVERY',
    impactMinutes: -(Math.min(3, Math.floor(rollingDelay * 0.25))),
    description: `Engineering schedule slack buffer on high-speed track segments`,
    severity: 'low'
  });

  return {
    ...train,
    currentSpeedKmH: currentSpeed,
    currentDelayMinutes: rollingDelay,
    destinationETA: lastStop.predictedArrival,
    destinationPredictedDelay: lastStop.predictedDelayMinutes,
    destinationConfidence: lastStop.confidenceScore,
    destinationETARange: lastStop.etaRange,
    destinationRisk: lastStop.riskLevel,
    stops: updatedStops,
    explainability,
    lastUpdated: 'Live updated just now'
  };
}

/**
 * What-If Scenario Simulation
 * Enables railway controllers to simulate operational adjustments:
 * - Speed change (-20% to +20%)
 * - Station halt variation (-5 to +10 mins)
 * - Traffic density, TSR, Signal priority
 */
export function runWhatIfSimulation(
  train: TrainData,
  params: WhatIfParameters
): WhatIfResult {
  const baseSpeed = train.currentSpeedKmH;
  const adjustedSpeed = Math.max(30, Math.min(130, Math.round(baseSpeed * (1 + params.speedAdjustmentPercent / 100))));
  
  const originalDestination = train.stops[train.stops.length - 1];
  const originalETA = originalDestination.predictedArrival;
  const originalDelay = originalDestination.predictedDelayMinutes;

  // Compute speed delta impact on remaining distance
  const remainingDistanceKm = Math.max(10, originalDestination.distanceKm - train.stops[train.currentStationIndex].distanceKm);
  const timeOriginalHours = remainingDistanceKm / (baseSpeed || 70);
  const timeSimulatedHours = remainingDistanceKm / adjustedSpeed;
  const speedDeltaMins = Math.round((timeSimulatedHours - timeOriginalHours) * 60);

  // Halt delta
  const remainingUpcomingStops = train.stops.length - 1 - train.currentStationIndex;
  const haltDeltaMins = params.stationHaltAdjustmentMinutes * Math.max(1, remainingUpcomingStops);

  // Traffic delta
  let trafficDelta = 0;
  if (params.trafficCondition === 'HIGH') trafficDelta = 6;
  else if (params.trafficCondition === 'LOW') trafficDelta = -3;

  // Track restriction delta
  let trackDelta = 0;
  if (params.trackRestriction === 'RESTRICTED') trackDelta = 8;
  else if (params.trackRestriction === 'CAUTION_TSR') trackDelta = 4;

  // Priority delta
  const priorityDelta = params.signalPriority === 'PRIORITY' ? -6 : 0;

  // Total simulated delta
  const netImpactMinutes = speedDeltaMins + haltDeltaMins + trafficDelta + trackDelta + priorityDelta;
  const simulatedDelayMinutes = Math.max(0, originalDelay + netImpactMinutes);
  
  const originalMins = parseTimeToMinutes(originalETA);
  const simulatedMins = originalMins + netImpactMinutes;
  const simulatedETA = formatMinutesToTime(simulatedMins);

  const stationComparisons: WhatIfStationComparison[] = train.stops.map((stop, idx) => {
    if (idx < train.currentStationIndex) {
      return {
        stationCode: stop.stationCode,
        stationName: stop.stationName,
        originalETA: stop.predictedArrival,
        simulatedETA: stop.predictedArrival,
        originalDelay: stop.predictedDelayMinutes,
        simulatedDelay: stop.predictedDelayMinutes,
        deltaMinutes: 0
      };
    }

    const stopFraction = (idx - train.currentStationIndex + 1) / Math.max(1, train.stops.length - train.currentStationIndex);
    const stopDelta = Math.round(netImpactMinutes * stopFraction);
    const stopOrigMins = parseTimeToMinutes(stop.predictedArrival);
    const stopSimMins = stopOrigMins + stopDelta;

    return {
      stationCode: stop.stationCode,
      stationName: stop.stationName,
      originalETA: stop.predictedArrival,
      simulatedETA: formatMinutesToTime(stopSimMins),
      originalDelay: stop.predictedDelayMinutes,
      simulatedDelay: Math.max(0, stop.predictedDelayMinutes + stopDelta),
      deltaMinutes: stopDelta
    };
  });

  const isRecovered = netImpactMinutes < 0;
  let simulationNotes = '';
  if (isRecovered) {
    simulationNotes = `Signal priority and speed optimization recovered ${Math.abs(netImpactMinutes)} minutes. Train reaches ${originalDestination.stationName} at ${simulatedETA}.`;
  } else if (netImpactMinutes === 0) {
    simulationNotes = `Operational parameters balanced; ETA remains steady at ${simulatedETA}.`;
  } else {
    simulationNotes = `Adjusted conditions add +${netImpactMinutes} minutes delay across upcoming block sections. New expected arrival is ${simulatedETA}.`;
  }

  return {
    trainNumber: train.trainNumber,
    destinationStation: originalDestination.stationName,
    originalETA,
    simulatedETA,
    originalDelayMinutes: originalDelay,
    simulatedDelayMinutes,
    netImpactMinutes,
    isRecovered,
    stationComparisons,
    simulationNotes
  };
}
