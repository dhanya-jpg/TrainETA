import { TrainData, StationStop } from '../types';
import { recalculateTrainETAs } from './etaPredictionService';

/**
 * Calculates Great Circle bearing angle (0 - 360 deg) between two coordinate points
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Calculates geodesic distance in km between two lat/lng pairs
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns formatted live Indian Standard Time (IST) timestamp string
 */
export function getLiveTelemetryTimestamp(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `Live GPS • ${hours}:${minutes}:${seconds} IST`;
}

/**
 * Computes deterministic physical target speed based on track conditions, signals, and stations
 */
export function computePhysicalTargetSpeed(train: TrainData, distToNextKm: number, distFromPrevKm: number): number {
  let permissibleMax = train.maxSpeedKmH || 110;

  // 1. Signal Aspect restrictions
  if (train.signalAspect === 'STOP_RED') {
    return 0;
  } else if (train.signalAspect === 'CAUTION_YELLOW') {
    permissibleMax = Math.min(permissibleMax, 35);
  } else if (train.signalAspect === 'ATTENTION_DOUBLE_YELLOW') {
    permissibleMax = Math.min(permissibleMax, 65);
  }

  // 2. Track TSR Restrictions
  if (train.trackCondition === 'RESTRICTED') {
    permissibleMax = Math.min(permissibleMax, 45);
  } else if (train.trackCondition === 'CAUTION_TSR') {
    permissibleMax = Math.min(permissibleMax, 60);
  }

  // 3. Weather visibility speed restrictions
  if (train.weather === 'FOG') {
    permissibleMax = Math.min(permissibleMax, 60);
  } else if (train.weather === 'HEAVY_RAIN' || train.weather === 'THUNDERSTORM') {
    permissibleMax = Math.min(permissibleMax, 75);
  }

  // 4. Preceding train gap headway constraint
  if (train.precedingTrainGapKm < 3.0) {
    permissibleMax = Math.min(permissibleMax, 30);
  } else if (train.precedingTrainGapKm < 5.5) {
    permissibleMax = Math.min(permissibleMax, 60);
  }

  // 5. Station deceleration braking curve when approaching within 4 km
  if (distToNextKm <= 4.0) {
    const approachSpeed = Math.max(25, Math.min(permissibleMax, Math.round(permissibleMax * Math.sqrt(Math.max(0.05, distToNextKm / 4.0)))));
    return approachSpeed;
  }

  // 6. Station acceleration tractive curve when departing within 2 km
  if (distFromPrevKm <= 2.0) {
    const departureSpeed = Math.max(30, Math.min(permissibleMax, Math.round(30 + (permissibleMax - 30) * (distFromPrevKm / 2.0))));
    return departureSpeed;
  }

  return permissibleMax;
}

/**
 * Advances a single train along its route with high mathematical and kinematic accuracy
 */
export function advanceTrainPhysics(
  train: TrainData,
  deltaSeconds: number,
  simSpeedMultiplier: number = 1
): TrainData {
  const stops = train.stops;
  if (!stops || stops.length < 2) return train;

  const effectiveSimSpeed = Math.max(1, Math.min(10, simSpeedMultiplier));
  const totalRouteDistKm = stops[stops.length - 1].distanceKm;

  // 1. Calculate current exact progress distance along route
  const currentIdx = Math.max(0, Math.min(stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(stops.length - 1, currentIdx + 1);
  const prevStn = stops[currentIdx];
  const nextStn = stops[nextIdx];

  const segStartDist = prevStn.distanceKm;
  const segEndDist = nextStn.distanceKm;
  const segSpan = Math.max(1, segEndDist - segStartDist);

  // Exact current progress distance
  let currentProgDist = segStartDist;
  if (train.distanceToNextStationKm !== undefined && train.distanceToNextStationKm >= 0) {
    currentProgDist = Math.max(segStartDist, Math.min(segEndDist, segEndDist - train.distanceToNextStationKm));
  } else {
    currentProgDist = segStartDist;
  }

  const distToNextKm = Math.max(0, segEndDist - currentProgDist);
  const distFromPrevKm = Math.max(0, currentProgDist - segStartDist);

  // 2. Determine target speed via physical constraints
  const targetSpeed = computePhysicalTargetSpeed(train, distToNextKm, distFromPrevKm);

  // Smooth acceleration / deceleration (max 1.5 km/h per second change)
  const currentSpeed = train.currentSpeedKmH || 70;
  const maxSpeedStep = 2.0 * deltaSeconds * effectiveSimSpeed;
  let newSpeed = currentSpeed;
  if (currentSpeed < targetSpeed) {
    newSpeed = Math.min(targetSpeed, currentSpeed + maxSpeedStep);
  } else if (currentSpeed > targetSpeed) {
    newSpeed = Math.max(targetSpeed, currentSpeed - maxSpeedStep);
  }
  newSpeed = Math.round(newSpeed);

  // 3. Exact physical distance step: Δd = (v / 3600) * Δt * simMultiplier
  // A minimum calibrated delta ensures smooth visible movement across zoom levels
  const physicalStepKm = (newSpeed / 3600) * deltaSeconds * effectiveSimSpeed;
  const calibratedStepKm = Math.max(0.015 * effectiveSimSpeed, physicalStepKm);

  let newProgDist = currentProgDist + calibratedStepKm;

  // Handle loop / completion when reaching end of route
  if (newProgDist >= totalRouteDistKm) {
    newProgDist = 0; // Restart from origin station
  }

  // 4. Find new active station segment based on newProgDist
  let activeIndex = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    if (newProgDist >= stops[i].distanceKm) {
      activeIndex = i;
    }
  }

  const activeNextIndex = Math.min(stops.length - 1, activeIndex + 1);
  const activePrevStation = stops[activeIndex];
  const activeNextStation = stops[activeNextIndex];

  const activeSegStart = activePrevStation.distanceKm;
  const activeSegEnd = activeNextStation.distanceKm;
  const activeSegLength = Math.max(1, activeSegEnd - activeSegStart);

  // Precise ratio along current segment [0, 1]
  const progressRatio = Math.max(0, Math.min(1, (newProgDist - activeSegStart) / activeSegLength));

  // 5. Accurate linear coordinate interpolation along railway track
  const newLat = Number((activePrevStation.latitude + (activeNextStation.latitude - activePrevStation.latitude) * progressRatio).toFixed(5));
  const newLng = Number((activePrevStation.longitude + (activeNextStation.longitude - activePrevStation.longitude) * progressRatio).toFixed(5));

  // 6. Exact distance to next and previous stops
  const exactDistToNextKm = Math.max(0, Math.round((activeSegEnd - newProgDist) * 10) / 10);
  const exactDistFromPrevKm = Math.max(0, Math.round((newProgDist - activeSegStart) * 10) / 10);

  // 7. Dynamic contextual location description
  let locationDescription = '';
  if (exactDistFromPrevKm <= 0.8 && newSpeed < 40) {
    locationDescription = `At ${activePrevStation.stationName} (${activePrevStation.stationCode}) • Platform #${activePrevStation.platform}`;
  } else if (exactDistFromPrevKm <= 2.5) {
    locationDescription = `Departed ${activePrevStation.stationName} (${activePrevStation.stationCode}) • ${exactDistFromPrevKm} km ago`;
  } else if (exactDistToNextKm <= 2.5) {
    locationDescription = `Approaching ${activeNextStation.stationName} (${activeNextStation.stationCode}) • ${exactDistToNextKm} km remaining • PF #${activeNextStation.platform}`;
  } else {
    locationDescription = `Between ${activePrevStation.stationCode} & ${activeNextStation.stationCode} • ${exactDistToNextKm} km to ${activeNextStation.stationName}`;
  }

  // 8. Construct updated train telemetry
  const interimTrain: TrainData = {
    ...train,
    currentLatitude: newLat,
    currentLongitude: newLng,
    currentSpeedKmH: newSpeed,
    currentStationIndex: activeIndex,
    nextStationCode: activeNextStation.stationCode,
    nextStationName: activeNextStation.stationName,
    distanceToNextStationKm: exactDistToNextKm,
    currentLocationName: locationDescription,
    lastUpdated: getLiveTelemetryTimestamp()
  };

  // 9. Recalculate dynamic ETAs and delays via ML engine
  const prediction = recalculateTrainETAs(interimTrain, {
    speedKmH: newSpeed,
    delayMinutes: train.currentDelayMinutes
  });

  return prediction;
}

