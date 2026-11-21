import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import { busStandsRouter } from './routes/busStands.js';
import { routesRouter } from './routes/routes.js';
import { timetablesRouter } from './routes/timetables.js';
import { depotsRouter } from './routes/depots.js';
import { suggestionsRouter } from './routes/suggestions.js';
import { viaStopsRouter } from './routes/viaStops.js';
import { communityReportsRouter } from './routes/communityReports.js';
import { contributorsRouter } from './routes/contributors.js';
import { dashboardRouter } from './routes/dashboard.js';
import { aiImportRouter } from './routes/aiImport.js';
import { settingsRouter } from './routes/settings.js';
import { authRouter } from './routes/auth.js';
import { busTypesRouter } from './routes/busTypes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Favicon handler to avoid browser 404s
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Root and API status endpoints
app.get(['/', '/api'], (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Bus Mitra API Server is online and connected to MongoDB Atlas',
    database: 'bus-mitra',
    endpoints: [
      '/api/bus-stands',
      '/api/routes',
      '/api/timetables',
      '/api/depots',
      '/api/suggestions',
      '/api/community-reports',
      '/api/contributors',
      '/api/dashboard/stats',
      '/api/health',
    ],
  });
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: 'MongoDB Atlas (bus-mitra)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/bus-stands', busStandsRouter);
app.use('/api/bus-types', busTypesRouter);
app.use('/api/routes', routesRouter);
app.use('/api/timetables', timetablesRouter);
app.use('/api/depots', depotsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/via-stops', viaStopsRouter);
app.use('/api/community-reports', communityReportsRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai-import', aiImportRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);

// Start Server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Bus Mitra Backend Server running on port ${PORT}`);
    console.log(`📊 Connected to MongoDB Community Edition`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
