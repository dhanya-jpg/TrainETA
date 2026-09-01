import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getLiveTrainStatus,
  snapGpsToRailwayTrack,
  calculateDeadReckoningPosition,
  simulateDelayImpact,
  getConnectingTrainStatus
} from './server/trackingEngine';
import { handleGeminiAssistantPrompt } from './server/geminiService';
import { ALL_RUNNING_INDIAN_TRAINS } from './src/data/allIndianTrains';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.use(express.json());

  // API health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Proxy route for Real-Time PNR Status API
  app.get('/api/pnr/:pnr', async (req, res) => {
    try {
      const pnr = req.params.pnr;
      if (!/^\d{10}$/.test(pnr)) {
        return res.status(400).json({ error: 'Invalid PNR format. Must be 10 digits.' });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({ error: 'RAPIDAPI_KEY environment variable is missing.' });
      }

      const response = await fetch(`https://real-time-pnr-status-api-for-indian-railways.p.rapidapi.com/name/${pnr}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'real-time-pnr-status-api-for-indian-railways.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('PNR API Error:', error);
      res.status(500).json({ error: 'Failed to fetch PNR data', details: error?.message || error });
    }
  });

  // Proxy route for Real-Time Train Schedule API (IRCTC1)
  app.get('/api/schedule/:trainNo', async (req, res) => {
    try {
      const trainNo = req.params.trainNo;
      if (!/^\d{5}$/.test(trainNo)) {
        return res.status(400).json({ error: 'Invalid Train Number format. Must be 5 digits.' });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({ error: 'RAPIDAPI_KEY environment variable is missing.' });
      }

      const response = await fetch(`https://irctc1.p.rapidapi.com/api/v1/getTrainScheduleV2?trainNo=${trainNo}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'irctc1.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Schedule API Error:', error);
      res.status(500).json({ error: 'Failed to fetch Schedule data', details: error?.message || error });
    }
  });

  // Proxy route for Train Search API (IRCTC1)
  app.get('/api/search-train', async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({ error: 'RAPIDAPI_KEY environment variable is missing.' });
      }

      const response = await fetch(`https://irctc1.p.rapidapi.com/api/v1/searchTrain?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'irctc1.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Search Train API Error:', error);
      res.status(500).json({ error: 'Failed to search train data', details: error?.message || error });
    }
  });

  // --- RAILRADAR API PROXY ROUTES ---
  
  const RAILRADAR_KEY = process.env.RAILRADAR_API_KEY || 'rg_805a88a5bed74d1e8884908e7b5907e9';

  // Live Train Status (RailRadar)
  app.get('/api/railradar/trains/:trainNo/live', async (req, res) => {
    try {
      const { trainNo } = req.params;
      const response = await fetch(`https://api.railradar.in/v1/trains/${trainNo}/live`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Train Route (RailRadar)
  app.get('/api/railradar/trains/:trainNo/route', async (req, res) => {
    try {
      const { trainNo } = req.params;
      const response = await fetch(`https://api.railradar.in/v1/trains/${trainNo}/route`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Station Live Board (RailRadar)
  app.get('/api/railradar/stations/:code/live', async (req, res) => {
    try {
      const { code } = req.params;
      const hours = req.query.hours || '4';
      const response = await fetch(`https://api.railradar.in/v1/stations/${code}/live?hours=${hours}`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Station Search (RailRadar)
  app.get('/api/railradar/lookup/search/stations', async (req, res) => {
    try {
      const q = req.query.q || '';
      const limit = req.query.limit || '10';
      const response = await fetch(`https://api.railradar.in/v1/lookup/search/stations?q=${encodeURIComponent(q as string)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // NTES Trains Lookup (RailRadar)
  app.get('/api/railradar/lookup/trains/ntes', async (req, res) => {
    try {
      const response = await fetch(`https://api.railradar.in/v1/lookup/trains/ntes`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // NTES Stations Lookup (RailRadar)
  app.get('/api/railradar/lookup/stations/ntes', async (req, res) => {
    try {
      const response = await fetch(`https://api.railradar.in/v1/lookup/stations/ntes`, {
        headers: {
          'Authorization': `Bearer ${RAILRADAR_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- END RAILRADAR API PROXY ROUTES ---

  // Step 1 & 2: Real-time Live Tracking Algorithm endpoint
  // Queries RailRadar API first (CRIS ingestion), falls back to Map Matching and Dead Reckoning Simulation
  app.get('/api/train-status/:trainNumber', async (req, res) => {
    const { trainNumber } = req.params;
    
    try {
      // 1. Try fetching real-time JSON from RailRadar / CRIS aggregator
      const RAILRADAR_KEY = process.env.RAILRADAR_API_KEY || 'rg_805a88a5bed74d1e8884908e7b5907e9';
      let realTimeTrainData = null;
      
      try {
        const rrResponse = await fetch(`https://api.railradar.in/v1/trains/${trainNumber}/live`, {
          headers: {
            'Authorization': `Bearer ${RAILRADAR_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (rrResponse.ok) {
          const rrJson = await rrResponse.json();
          if (rrJson.success && rrJson.data && rrJson.data.train) {
            const rr = rrJson.data;
            const t = rr.train;
            const c = rr.currentLocation || {};
            const rRoute = rr.route || [];
            
            // Map to our TrainData interface
            realTimeTrainData = {
              id: `train-${t.number}`,
              trainNumber: t.number,
              trainName: t.name,
              trainType: (t.category || t.type || 'MAIL_EXPRESS').toUpperCase().replace(/ /g, '_'),
              source: t.source?.code,
              sourceName: t.source?.name,
              destination: t.destination?.code,
              destinationName: t.destination?.name,
              totalDistanceKm: t.distance || 0,
              
              currentLocationName: rr.exceptions?.[0]?.message || `Near ${rr.previousHalt?.stationCode || t.source?.code} - ${c.status || 'running'}`,
              currentLatitude: rRoute.find((s: any) => s.sequence === c.sequence)?.lat || 22.0,
              currentLongitude: rRoute.find((s: any) => s.sequence === c.sequence)?.lng || 78.0,
              currentSpeedKmH: c.speedKmh || t.avgSpeed || 60,
              maxSpeedKmH: t.maxSpeed || 110,
              currentDelayMinutes: rr.delayMinutes || 0,
              currentStationIndex: Math.max(0, (c.sequence || 1) - 1),
              nextStationCode: rr.nextHalt?.stationCode || '',
              nextStationName: rr.nextHalt?.stationName || '',
              distanceToNextStationKm: (rr.nextHalt?.distance || 0) - (rr.previousHalt?.distance || 0),
              lastUpdated: rr.lastUpdatedAt || new Date().toISOString(),
              
              signalAspect: 'CLEAR_GREEN',
              weather: 'CLEAR',
              trackCondition: 'NORMAL',
              trafficLevel: 'MEDIUM',
              precedingTrainGapKm: 15,
              
              destinationETA: '-',
              destinationPredictedDelay: rr.delayMinutes || 0,
              destinationConfidence: 98,
              destinationETARange: '-',
              destinationRisk: (rr.delayMinutes > 30) ? 'HIGH' : 'LOW',
              
              stops: rRoute.map((stop: any) => {
                const formatTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                return {
                  stationCode: stop.stationCode,
                  stationName: stop.stationName,
                  distanceKm: stop.distance || 0,
                  latitude: stop.lat || 0,
                  longitude: stop.lng || 0,
                  scheduledArrival: formatTime(stop.scheduledArrival),
                  scheduledDeparture: formatTime(stop.scheduledDeparture),
                  predictedArrival: formatTime(stop.actualArrival || stop.scheduledArrival),
                  predictedDeparture: formatTime(stop.actualDeparture || stop.scheduledDeparture),
                  predictedDelayMinutes: stop.delayArrival || stop.delayDeparture || 0,
                  confidenceScore: 99,
                  etaRange: '-',
                  riskLevel: (stop.delayArrival > 30) ? 'HIGH' : 'LOW',
                  status: stop.status?.toUpperCase() || 'UPCOMING',
                  platform: stop.platform || 1,
                  historicalAvgHaltMins: 2
                };
              })
            };
          }
        }
      } catch (e) {
        console.error('RailRadar API fetch failed, falling back to simulation', e);
      }
      
      if (realTimeTrainData) {
        return res.json({ success: true, data: realTimeTrainData, source: 'railradar_live' });
      }

      // 2. Fallback to Local Simulation
      const simulateLoss = req.query.simulateGpsLoss === 'true';
      const lostMins = req.query.signalLostMinutes ? Number(req.query.signalLostMinutes) : undefined;
      
      const liveData = getLiveTrainStatus(trainNumber, {
        simulateGpsLoss: simulateLoss,
        signalLostMinutes: lostMins
      });

      if (!liveData) {
        return res.status(404).json({
          success: false,
          error: `Train ${trainNumber} not found in active schedule database.`
        });
      }

      res.json({
        success: true,
        data: liveData,
        source: 'heuristic_simulation'
      });
    } catch (error: any) {
      console.error('Error fetching live train status:', error);
      res.status(500).json({ success: false, error: 'Failed to execute tracking algorithm' });
    }
  });

  // Polyline Map Matching Test endpoint (Step 2 - Snapping raw noisy GPS to railway track)
  app.post('/api/tracking/snap-gps', (req, res) => {
    const { lat, lng, trainNumber } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude required' });
    }

    const train = ALL_RUNNING_INDIAN_TRAINS.find(
      (t) => t.trainNumber === trainNumber || t.id.includes(trainNumber || '22436')
    ) || ALL_RUNNING_INDIAN_TRAINS[0];

    const match = snapGpsToRailwayTrack(Number(lat), Number(lng), train.stops);
    res.json({ success: true, mapMatch: match });
  });

  // Dead Reckoning Simulation endpoint (Step 2 - When signal is lost in tunnels/remote areas)
  app.post('/api/tracking/dead-reckoning', (req, res) => {
    const { lastLat, lastLng, speedKmH, elapsedMinutes, trainNumber } = req.body;
    const train = ALL_RUNNING_INDIAN_TRAINS.find(
      (t) => t.trainNumber === trainNumber || t.id.includes(trainNumber || '22436')
    ) || ALL_RUNNING_INDIAN_TRAINS[0];

    const drResult = calculateDeadReckoningPosition(
      { lat: Number(lastLat) || train.currentLatitude, lng: Number(lastLng) || train.currentLongitude },
      Number(speedKmH) || train.currentSpeedKmH,
      Number(elapsedMinutes) || 8,
      train.stops
    );

    res.json({ success: true, deadReckoning: drResult });
  });

  // Step 3 & 4: Google AI Studio Gemini Function Calling endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history, contextTrainNumber } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    try {
      const response = await handleGeminiAssistantPrompt(
        message,
        history || [],
        contextTrainNumber
      );
      res.json({ success: true, ...response });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process AI prompt'
      });
    }
  });

  // All running trains catalog endpoint
  app.get('/api/trains', (req, res) => {
    const list = ALL_RUNNING_INDIAN_TRAINS.map((t) => ({
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      source: t.sourceName,
      destination: t.destinationName,
      currentSpeed: t.currentSpeedKmH,
      delayMinutes: t.currentDelayMinutes,
      status: t.currentDelayMinutes > 45 ? 'HEAVY_DELAY' : t.currentDelayMinutes > 10 ? 'SLIGHT_DELAY' : 'ON_TIME'
    }));
    res.json({ success: true, trains: list });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
