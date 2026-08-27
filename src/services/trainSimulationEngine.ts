import { TrainData, StationStop } from '../types';
import { INDIAN_STATIONS, StationGeo, ALL_INDIAN_TRAIN_TEMPLATES } from '../data/allIndianTrains';
import { recalculateTrainETAs, formatMinutesToTime, parseTimeToMinutes } from './etaPredictionService';

/**
 * Calculates Great Circle bearing angle (0 - 360 deg) between two coordinate points
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
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
 * Returns formatted live Indian Standard Time (IST) or current local time string
 */
export function getLiveTelemetryTimestamp(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `Live GPS • ${hours}:${minutes}:${seconds} IST`;
}

/**
 * Advances a single train along its route in real-time
 */
export function advanceTrainPhysics(
  train: TrainData,
  deltaSeconds: number,
  simSpeedMultiplier: number = 1
): TrainData {
  if (!train.stops || train.stops.length < 2) return train;

  const effectiveSimSpeed = Math.max(1, Math.min(10, simSpeedMultiplier));
  
  // Real-world speed micro-variations (simulating traction fluctuations, throttle adjustments, grade profile)
  const speedNoise = (Math.random() - 0.5) * 3;
  let targetSpeed = Math.max(40, Math.min(train.maxSpeedKmH, train.currentSpeedKmH + speedNoise));

  // If approaching next station within 3 km, simulate gradual deceleration
  if (train.distanceToNextStationKm <= 3 && train.distanceToNextStationKm > 0.5) {
    targetSpeed = Math.max(30, Math.min(60, targetSpeed * 0.8));
  }

  // Distance covered during this time slice in kilometers
  // To make movement visibly evident on the live map even at 1x speed, we apply a smooth dynamic step
  const visualRate = 0.08 * effectiveSimSpeed; // visual progress step
  const physicalDistanceDeltaKm = (targetSpeed / 3600) * deltaSeconds * effectiveSimSpeed + visualRate;

  const stops = train.stops;
  const totalDistanceKm = train.totalDistanceKm || stops[stops.length - 1].distanceKm;

  // Calculate current distance along route
  let currentDist = 0;
  const currIdx = Math.max(0, Math.min(stops.length - 1, train.currentStationIndex));
  const nextIdx = Math.min(stops.length - 1, currIdx + 1);

  const currStation = stops[currIdx];
  const nextStation = stops[nextIdx];

  const segStartDist = currStation.distanceKm;
  const segEndDist = nextStation.distanceKm;
  const segLength = Math.max(5, segEndDist - segStartDist);

  // Compute current estimated progress distance
  const currentRatio = 
    calculateDistanceKm(currStation.latitude, currStation.longitude, train.currentLatitude, train.currentLongitude) / segLength;
  
  let newProgressDist = segStartDist + Math.min(segLength, Math.max(0, currentRatio * segLength)) + physicalDistanceDeltaKm;

  // Check if reached destination: loop back to origin or reverse smoothly
  if (newProgressDist >= totalDistanceKm) {
    newProgressDist = 0;
  }

  // Determine active segment based on newProgressDist
  let newCurrIndex = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    if (newProgressDist >= stops[i].distanceKm) {
      newCurrIndex = i;
    }
  }

  const newNextIndex = Math.min(stops.length - 1, newCurrIndex + 1);
  const activeStartStn = stops[newCurrIndex];
  const activeEndStn = stops[newNextIndex];

  const activeSegStart = activeStartStn.distanceKm;
  const activeSegEnd = activeEndStn.distanceKm;
  const activeSpan = Math.max(1, activeSegEnd - activeSegStart);
  const activeRatio = Math.max(0, Math.min(1, (newProgressDist - activeSegStart) / activeSpan));

  // High precision coordinate interpolation along the railway corridor
  const newLat = Number((activeStartStn.latitude + (activeEndStn.latitude - activeStartStn.latitude) * activeRatio).toFixed(5));
  const newLng = Number((activeStartStn.longitude + (activeEndStn.longitude - activeStartStn.longitude) * activeRatio).toFixed(5));

  const remainingToNextKm = Math.max(0.5, Math.round((activeSegEnd - newProgressDist) * 10) / 10);

  // Update stop statuses (DEPARTED, CURRENT, NEXT, UPCOMING)
  const updatedStops: StationStop[] = stops.map((stop, idx) => {
    let status: 'DEPARTED' | 'CURRENT' | 'NEXT' | 'UPCOMING' = 'UPCOMING';
    if (idx < newCurrIndex) {
      status = 'DEPARTED';
    } else if (idx === newCurrIndex) {
      status = activeRatio > 0.85 ? 'CURRENT' : 'DEPARTED';
    } else if (idx === newNextIndex) {
      status = 'NEXT';
    } else {
      status = 'UPCOMING';
    }
    return {
      ...stop,
      status
    };
  });

  // Calculate live location description
  let locationDesc = '';
  if (activeRatio < 0.1) {
    locationDesc = `Departed ${activeStartStn.stationName} (${activeStartStn.stationCode})`;
  } else if (activeRatio > 0.9) {
    locationDesc = `Arriving at ${activeEndStn.stationName} (${activeEndStn.stationCode}) • PF #${activeEndStn.platform}`;
  } else {
    locationDesc = `Between ${activeStartStn.stationCode} & ${activeEndStn.stationCode} • ${remainingToNextKm} km to ${activeEndStn.stationName}`;
  }

  // Dynamic Delay jitter / resolution
  const delayAdjustment = Math.random() < 0.05 ? (Math.random() > 0.6 ? 1 : -1) : 0;
  const newDelay = Math.max(0, train.currentDelayMinutes + delayAdjustment);

  // Recalculate full dynamic train state
  const updatedTrain: TrainData = {
    ...train,
    currentLatitude: newLat,
    currentLongitude: newLng,
    currentSpeedKmH: Math.round(targetSpeed),
    currentDelayMinutes: newDelay,
    currentStationIndex: newCurrIndex,
    nextStationCode: activeEndStn.stationCode,
    nextStationName: activeEndStn.stationName,
    distanceToNextStationKm: remainingToNextKm,
    currentLocationName: locationDesc,
    lastUpdated: getLiveTelemetryTimestamp(),
    stops: updatedStops
  };

  return recalculateTrainETAs(updatedTrain, {
    speedKmH: Math.round(targetSpeed),
    delayMinutes: newDelay
  });
}
