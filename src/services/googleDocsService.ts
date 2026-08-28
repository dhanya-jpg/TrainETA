import { getCachedGoogleAccessToken, signInWithGoogle } from './firebase';
import { TrainData, WhatIfResult, WhatIfParameters } from '../types';

export interface GoogleDocFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDocContent {
  title: string;
  documentId: string;
  revisionId?: string;
  body?: any;
}

export interface DocExportResponse {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  title?: string;
  error?: string;
}

/**
 * Gets currently available OAuth access token
 */
export async function getGoogleDocsAccessToken(): Promise<string | null> {
  return getCachedGoogleAccessToken();
}

/**
 * Request Google Sign-in to acquire Google Docs & Drive OAuth token
 */
export async function authenticateGoogleDocs(): Promise<string | null> {
  const result = await signInWithGoogle('OPERATOR');
  if (result.success && result.accessToken) {
    return result.accessToken;
  }
  return getCachedGoogleAccessToken();
}

/**
 * Helper to ensure a valid access token is present
 */
async function requireAccessToken(): Promise<string> {
  let token = await getGoogleDocsAccessToken();
  if (!token) {
    token = await authenticateGoogleDocs();
  }
  if (!token) {
    throw new Error('Google Docs authorization is required. Please sign in with your Google Account.');
  }
  return token;
}

/**
 * Creates a new blank Google Document and populates it with initial text
 */
export async function createGoogleDocument(title: string, initialContent?: string): Promise<DocExportResponse> {
  try {
    const token = await requireAccessToken();

    // 1. Create document via Google Docs API
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title
      })
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to create Google Doc (${createRes.status})`);
    }

    const docData = await createRes.json();
    const documentId = docData.documentId;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // 2. Insert initial content if provided
    if (initialContent && initialContent.trim().length > 0) {
      await insertTextIntoGoogleDoc(documentId, initialContent, token);
    }

    return {
      success: true,
      documentId,
      documentUrl,
      title
    };
  } catch (error: any) {
    console.error('Error creating Google Doc:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Google Document.'
    };
  }
}

/**
 * Inserts formatted text into a Google Document at index 1
 */
export async function insertTextIntoGoogleDoc(
  documentId: string, 
  text: string, 
  tokenOverride?: string
): Promise<boolean> {
  const token = tokenOverride || await requireAccessToken();
  
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1
            },
            text: text
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to write content to Google Doc (${res.status})`);
  }

  return true;
}

/**
 * Appends text content to an existing Google Document
 */
export async function appendTextToGoogleDoc(documentId: string, textToAppend: string): Promise<boolean> {
  const token = await requireAccessToken();
  
  // First fetch the document to find the ending index
  const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!docRes.ok) {
    throw new Error(`Could not fetch document to append text (${docRes.status})`);
  }

  const docData = await docRes.json();
  const content = docData.body?.content || [];
  let endIndex = 1;
  if (content.length > 0) {
    const lastElement = content[content.length - 1];
    endIndex = Math.max(1, (lastElement.endIndex || 2) - 1);
  }

  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: endIndex
            },
            text: `\n\n${textToAppend}`
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to append text to Google Doc.');
  }

  return true;
}

/**
 * Fetches Google Doc details and structure
 */
export async function getGoogleDocDetails(documentId: string): Promise<GoogleDocContent | null> {
  try {
    const token = await requireAccessToken();
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching Google Doc details:', err);
    return null;
  }
}

/**
 * Lists user Google Docs from Google Drive
 */
export async function listUserGoogleDocs(pageSize: number = 20): Promise<GoogleDocFile[]> {
  try {
    const token = await requireAccessToken();
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.document' and trashed=false");
    const fields = encodeURIComponent('files(id,name,createdTime,modifiedTime,webViewLink,iconLink)');
    
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=${pageSize}&fields=${fields}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to list files from Google Drive (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing Google Docs:', err);
    return [];
  }
}

/**
 * Deletes a Google Doc from Google Drive
 * NOTE: Always invoke with an explicit user confirmation dialog in the UI!
 */
export async function deleteUserGoogleDoc(fileId: string): Promise<boolean> {
  const token = await requireAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204 && res.status !== 404) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to delete file from Google Drive.');
  }

  return true;
}

/* =========================================================================
   SPECIALIZED INDIAN RAILWAYS GOOGLE DOCS REPORT BUILDERS
   ========================================================================= */

/**
 * Generates an Official Train Live Status & ML ETA Dossier in Google Docs
 */
export async function exportTrainDossierToGoogleDocs(
  train: TrainData, 
  customNotes?: string
): Promise<DocExportResponse> {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  const title = `IR SMART-ETA Dossier - ${train.trainNumber} ${train.trainName}`;

  let content = `INDIAN RAILWAYS - SMART ETA OPERATIONAL REPORT\n`;
  content += `========================================================================\n`;
  content += `TRAIN: ${train.trainNumber} - ${train.trainName} (${train.trainType})\n`;
  content += `GENERATED: ${timestamp} IST\n`;
  content += `CORRIDOR: ${train.sourceName} (${train.source}) ➔ ${train.destinationName} (${train.destination})\n`;
  content += `TOTAL ROUTE DISTANCE: ${train.totalDistanceKm} km\n`;
  content += `========================================================================\n\n`;

  content += `1. REAL-TIME TELEMETRY & STATUS\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `• Current Location: ${train.currentLocationName}\n`;
  content += `• Current Speed: ${train.currentSpeedKmH} km/h (Max Sectional Speed: ${train.maxSpeedKmH} km/h)\n`;
  content += `• Next Scheduled Halt: ${train.nextStationName} (${train.nextStationCode}) - ${train.distanceToNextStationKm} km remaining\n`;
  content += `• Active Signal Aspect: ${train.signalAspect.replace('_', ' ')}\n`;
  content += `• Track Condition: ${train.trackCondition.replace('_', ' ')}\n`;
  content += `• Environmental Weather: ${train.weather}\n`;
  content += `• Preceding Train Headway: ${train.precedingTrainGapKm} km\n\n`;

  content += `2. MACHINE LEARNING ETA PREDICTIONS & RELIABILITY\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `• Current Recorded Delay: ${train.currentDelayMinutes} min\n`;
  content += `• Destination (${train.destination}): ETA ${train.destinationETA} (Confidence: ${train.destinationConfidence}%)\n`;
  content += `• 90% Confidence Window: ${train.destinationETARange}\n`;
  content += `• Predicted Destination Delay: ${train.destinationPredictedDelay} min\n`;
  content += `• Overall Risk Classification: ${train.destinationRisk}\n\n`;

  content += `3. STATION-BY-STATION TIMETABLE & ESTIMATES\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `Station\tCode\tSched Arr\tPred Arr\tDelay\tPlatform\tStatus\n`;
  content += `------------------------------------------------------------------------\n`;

  train.stops.forEach((s) => {
    const delaySign = s.predictedDelayMinutes > 0 ? `+${s.predictedDelayMinutes}m` : 'On Time';
    content += `${s.stationName}\t${s.stationCode}\t${s.scheduledArrival}\t${s.predictedArrival}\t${delaySign}\tPF ${s.platform}\t[${s.status}]\n`;
  });

  content += `\n4. XAI EXPLAINABILITY & DELAY DRIVERS (SHAP DECOMPOSITION)\n`;
  content += `------------------------------------------------------------------------\n`;
  if (train.explainability && train.explainability.length > 0) {
    train.explainability.forEach((f, idx) => {
      const impactSign = f.impactMinutes > 0 ? `+${f.impactMinutes} min (Delay)` : `${f.impactMinutes} min (Slack Recovery)`;
      content += `${idx + 1}. [${f.category}] ${f.name}: ${impactSign}\n`;
      content += `   Details: ${f.description} | Severity: ${f.severity.toUpperCase()}\n`;
    });
  } else {
    content += `• Clear section running under nominal green corridor conditions.\n`;
  }

  if (customNotes && customNotes.trim().length > 0) {
    content += `\n5. SECTION CONTROLLER / OPERATOR NOTES\n`;
    content += `------------------------------------------------------------------------\n`;
    content += `${customNotes.trim()}\n`;
  }

  content += `\n========================================================================\n`;
  content += `SMART-ETA Framework: Automated Dispatch Bulletin via Google Workspace\n`;
  content += `Indian Railways Control Office Telemetry Integration\n`;

  return await createGoogleDocument(title, content);
}

/**
 * Generates an Active Section Punctuality & Controller Dispatch Bulletin in Google Docs
 */
export async function exportSectionOperationsToGoogleDocs(
  trains: TrainData[], 
  sectionName: string = 'Western Railway Mainline (BCT Division)',
  officerRemarks?: string
): Promise<DocExportResponse> {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  const title = `IR Section Controller Bulletin - ${sectionName} - ${new Date().toISOString().slice(0, 10)}`;

  const delayedCount = trains.filter(t => t.currentDelayMinutes > 5).length;
  const highRiskCount = trains.filter(t => t.destinationRisk === 'HIGH').length;
  const avgDelay = Math.round(trains.reduce((acc, t) => acc + t.currentDelayMinutes, 0) / Math.max(1, trains.length));

  let content = `INDIAN RAILWAYS - SECTION DISPATCH & PUNCTUALITY BULLETIN\n`;
  content += `========================================================================\n`;
  content += `SECTION: ${sectionName}\n`;
  content += `DATE & TIME: ${timestamp} IST\n`;
  content += `TOTAL ACTIVE TRAINS MONITORED: ${trains.length}\n`;
  content += `DELAYED TRAINS (>5 mins): ${delayedCount} | HIGH-RISK BOTTLENECK TRAINS: ${highRiskCount}\n`;
  content += `AVERAGE SECTIONAL DELAY: ${avgDelay} min\n`;
  content += `========================================================================\n\n`;

  content += `1. ACTIVE TRAIN FLEET ROSTER & ML ETA SUMMARY\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `Train No.\tName\tSpeed\tCurrent Delay\tPred Delay\tDest ETA\tRisk\n`;
  content += `------------------------------------------------------------------------\n`;

  trains.forEach((t) => {
    content += `${t.trainNumber}\t${t.trainName}\t${t.currentSpeedKmH} km/h\t${t.currentDelayMinutes} min\t${t.destinationPredictedDelay} min\t${t.destinationETA}\t[${t.destinationRisk}]\n`;
  });

  content += `\n2. BOTTLENECK & CAUTION RESTRICTION HIGHLIGHTS\n`;
  content += `------------------------------------------------------------------------\n`;
  const cautionTrains = trains.filter(t => t.trackCondition === 'CAUTION_TSR' || t.signalAspect !== 'CLEAR_GREEN');
  if (cautionTrains.length > 0) {
    cautionTrains.forEach(t => {
      content += `• Train ${t.trainNumber} (${t.trainName}): Signal=${t.signalAspect}, Track=${t.trackCondition}, Headway=${t.precedingTrainGapKm}km\n`;
    });
  } else {
    content += `• All active corridors operating under normal line clear aspects.\n`;
  }

  if (officerRemarks && officerRemarks.trim().length > 0) {
    content += `\n3. CHIEF SECTION CONTROLLER ADVISORY\n`;
    content += `------------------------------------------------------------------------\n`;
    content += `${officerRemarks.trim()}\n`;
  }

  content += `\n========================================================================\n`;
  content += `Document generated automatically via SMART-ETA System Google Docs Service\n`;

  return await createGoogleDocument(title, content);
}

/**
 * Generates a What-If Scenario Impact & Delay Simulation Report in Google Docs
 */
export async function exportWhatIfSimulationToGoogleDocs(
  result: WhatIfResult,
  train: TrainData,
  params: WhatIfParameters
): Promise<DocExportResponse> {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  const title = `IR What-If Simulation Report - Train ${train.trainNumber} - ${result.destinationStation}`;

  let content = `INDIAN RAILWAYS - WHAT-IF DISPATCH SIMULATION REPORT\n`;
  content += `========================================================================\n`;
  content += `TRAIN: ${train.trainNumber} - ${train.trainName}\n`;
  content += `DESTINATION: ${train.destinationName} (${result.destinationStation})\n`;
  content += `SIMULATION RUN TIME: ${timestamp} IST\n`;
  content += `========================================================================\n\n`;

  content += `1. SIMULATION PARAMETERS TESTED\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `• Section Speed Delta: ${params.speedAdjustmentPercent >= 0 ? '+' : ''}${params.speedAdjustmentPercent}%\n`;
  content += `• Station Halt Dwell Adjustment: ${params.stationHaltAdjustmentMinutes >= 0 ? '+' : ''}${params.stationHaltAdjustmentMinutes} min\n`;
  content += `• Traffic Congestion State: ${params.trafficCondition}\n`;
  content += `• Track Caution Order: ${params.trackRestriction}\n`;
  content += `• Signal Priority Setting: ${params.signalPriority}\n\n`;

  content += `2. SIMULATED IMPACT OUTCOMES\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `• Original Scheduled Delay: ${result.originalDelayMinutes} min (ETA: ${result.originalETA})\n`;
  content += `• Simulated Project Delay: ${result.simulatedDelayMinutes} min (Simulated ETA: ${result.simulatedETA})\n`;
  content += `• Net Variance: ${result.netImpactMinutes > 0 ? `+${result.netImpactMinutes} min (added delay)` : `${result.netImpactMinutes} min (delay recovered)`}\n`;
  content += `• Overall Recovery Status: ${result.isRecovered ? 'RECOVERED / IMPROVED' : 'ACCUMULATED / DELAYED'}\n\n`;

  content += `3. STATION-BY-STATION VARIANCE MATRIX\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `Station\tOriginal ETA\tSimulated ETA\tOriginal Delay\tSim Delay\tDelta\n`;
  content += `------------------------------------------------------------------------\n`;

  result.stationComparisons.forEach((sc) => {
    const deltaSign = sc.deltaMinutes > 0 ? `+${sc.deltaMinutes}m` : `${sc.deltaMinutes}m`;
    content += `${sc.stationName}\t${sc.originalETA}\t${sc.simulatedETA}\t${sc.originalDelay} min\t${sc.simulatedDelay} min\t${deltaSign}\n`;
  });

  content += `\n4. SIMULATION NOTES & OPERATOR DISPATCH RECOMMENDATION\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `${result.simulationNotes}\n`;

  content += `\n========================================================================\n`;
  content += `Exported from SMART-ETA Machine Learning Dispatch Simulator to Google Docs\n`;

  return await createGoogleDocument(title, content);
}
