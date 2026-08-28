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
  const PORT = 3000;

  app.use(express.json());

  // API health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Step 1 & 2: Real-time Live Tracking Algorithm endpoint
  // Queries Map Matching (Polyline snapping), Dead Reckoning, and Delay Metrics
  app.get('/api/train-status/:trainNumber', async (req, res) => {
    const { trainNumber } = req.params;
    const simulateLoss = req.query.simulateGpsLoss === 'true';
    const lostMins = req.query.signalLostMinutes ? Number(req.query.signalLostMinutes) : undefined;

    try {
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
        data: liveData
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
