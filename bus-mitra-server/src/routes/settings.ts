import { Router } from 'express';
import {
  BusStandModel,
  BusRouteModel,
  TimetableModel,
  DepotContactModel,
  RouteSuggestionModel,
  ActivityLogModel,
} from '../models/index.js';
import { seedDatabase } from '../seed/seedData.js';

export const settingsRouter = Router();

// POST /api/settings/reset
settingsRouter.post('/reset', async (_req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset to default seed data successfully' });
  } catch (error) {
    console.error('Database reset failed:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// GET /api/settings/export
settingsRouter.get('/export', async (_req, res) => {
  try {
    const [busStands, routes, timetables, depots, suggestions] = await Promise.all([
      BusStandModel.find(),
      BusRouteModel.find(),
      TimetableModel.find(),
      DepotContactModel.find(),
      RouteSuggestionModel.find(),
    ]);

    const exportData = {
      busStands,
      routes,
      timetables,
      depots,
      suggestions,
      exportedAt: new Date().toISOString(),
      version: '2.0.0 (MongoDB Global Edition)',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bus_mitra_mongodb_export.json"');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/settings/import
settingsRouter.post('/import', async (req, res) => {
  try {
    const { busStands, routes, timetables, depots, suggestions } = req.body;

    if (Array.isArray(busStands) && busStands.length > 0) {
      await BusStandModel.deleteMany({});
      await BusStandModel.insertMany(busStands);
    }
    if (Array.isArray(routes) && routes.length > 0) {
      await BusRouteModel.deleteMany({});
      await BusRouteModel.insertMany(routes);
    }
    if (Array.isArray(timetables) && timetables.length > 0) {
      await TimetableModel.deleteMany({});
      await TimetableModel.insertMany(timetables);
    }
    if (Array.isArray(depots) && depots.length > 0) {
      await DepotContactModel.deleteMany({});
      await DepotContactModel.insertMany(depots);
    }
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      await RouteSuggestionModel.deleteMany({});
      await RouteSuggestionModel.insertMany(suggestions);
    }

    const now = new Date().toISOString();
    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'stand_added',
      title: 'Database Restored from Backup',
      description: 'All collections synced from imported JSON file to MongoDB',
      timestamp: now,
    });

    res.json({ success: true, message: 'Data imported successfully to MongoDB' });
  } catch (error) {
    console.error('Import failed:', error);
    res.status(500).json({ error: 'Failed to import data to MongoDB' });
  }
});
