import { Router } from 'express';
import {
  BusStandModel,
  BusRouteModel,
  TimetableModel,
  DepotContactModel,
  RouteSuggestionModel,
  ActivityLogModel,
} from '../models/index.js';

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get('/stats', async (_req, res) => {
  try {
    const [
      totalBusStands,
      activeBusStands,
      totalRoutes,
      publishedRoutes,
      totalTimetables,
      publishedTimetables,
      draftTimetables,
      pendingSuggestions,
      totalSuggestions,
      depotContacts,
    ] = await Promise.all([
      BusStandModel.countDocuments(),
      BusStandModel.countDocuments({ status: 'Active' }),
      BusRouteModel.countDocuments(),
      BusRouteModel.countDocuments({ status: 'Published' }),
      TimetableModel.countDocuments(),
      TimetableModel.countDocuments({ status: 'Published' }),
      TimetableModel.countDocuments({ status: 'Draft' }),
      RouteSuggestionModel.countDocuments({ status: 'Pending' }),
      RouteSuggestionModel.countDocuments(),
      DepotContactModel.countDocuments(),
    ]);

    res.json({
      totalBusStands,
      activeBusStands,
      totalRoutes,
      publishedRoutes,
      totalTimetables,
      publishedTimetables,
      draftTimetables,
      pendingSuggestions,
      totalSuggestions,
      depotContacts,
    });
  } catch (error) {
    console.error('Error computing dashboard stats:', error);
    res.status(500).json({ error: 'Failed to compute dashboard stats' });
  }
});

// GET /api/dashboard/activity
dashboardRouter.get('/activity', async (_req, res) => {
  try {
    const activity = await ActivityLogModel.find().sort({ timestamp: -1 }).limit(30);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});
