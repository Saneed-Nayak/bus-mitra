import { Router } from 'express';
import { BusRouteModel, BusStandModel, TimetableModel, ActivityLogModel } from '../models/index.js';

export const routesRouter = Router();

const syncRoutesFromTimetables = async () => {
  const timetablePairs = await TimetableModel.find({}, { fromStandName: 1, toStandName: 1, status: 1 }).lean();
  const routeKeys = new Map<string, { fromStandName: string; toStandName: string; status: string }>();

  for (const timetable of timetablePairs) {
    const fromStandName = timetable.fromStandName.trim();
    const toStandName = timetable.toStandName.trim();
    const key = `${fromStandName.toLowerCase()}|${toStandName.toLowerCase()}`;
    if (!routeKeys.has(key)) routeKeys.set(key, { fromStandName, toStandName, status: timetable.status });
  }

  for (const { fromStandName, toStandName, status } of routeKeys.values()) {
    const now = new Date().toISOString();
    const fromSlug = fromStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const toSlug = toStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await BusRouteModel.findOneAndUpdate(
      { fromStandName: { $regex: `^${fromStandName}$`, $options: 'i' }, toStandName: { $regex: `^${toStandName}$`, $options: 'i' } },
      {
        $setOnInsert: {
          id: `rt-${fromSlug}-${toSlug}-${Date.now().toString().slice(-4)}`,
          fromStandId: `bs-${fromSlug}`,
          fromStandName,
          toStandId: `bs-${toSlug}`,
          toStandName,
          status: status === 'Draft' ? 'Draft' : 'Published',
          createdAt: now,
        },
        $set: { updatedAt: now },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
};

// GET /api/routes
routesRouter.get('/', async (req, res) => {
  try {
    await syncRoutesFromTimetables();
    const { publishedOnly, search } = req.query;
    const filter: Record<string, any> = {};

    if (publishedOnly === 'true' || publishedOnly === '1') {
      filter.status = 'Published';
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { fromStandName: { $regex: q, $options: 'i' } },
        { toStandName: { $regex: q, $options: 'i' } },
      ];
    }

    const routes = await BusRouteModel.find(filter).sort({ fromStandName: 1, toStandName: 1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// GET /api/routes/:id
routesRouter.get('/:id', async (req, res) => {
  try {
    const route = await BusRouteModel.findOne({ id: req.params.id });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// POST /api/routes
routesRouter.post('/', async (req, res) => {
  try {
    const { fromStandName, toStandName, status, distanceKm, durationMinutes } = req.body;
    if (!fromStandName || !toStandName) {
      return res.status(400).json({ error: 'Origin and destination stands are required' });
    }

    const now = new Date().toISOString();

    // Auto-create origin/destination bus stands if they don't exist
    let fromStand = await BusStandModel.findOne({ name: { $regex: `^${fromStandName.trim()}$`, $options: 'i' } });
    if (!fromStand) {
      const fromSlug = fromStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      fromStand = await BusStandModel.create({
        id: `bs-${fromSlug}`,
        name: fromStandName.trim(),
        district: 'Karnataka',
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });
    }

    let toStand = await BusStandModel.findOne({ name: { $regex: `^${toStandName.trim()}$`, $options: 'i' } });
    if (!toStand) {
      const toSlug = toStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      toStand = await BusStandModel.create({
        id: `bs-${toSlug}`,
        name: toStandName.trim(),
        district: 'Karnataka',
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });
    }

    const fromSlug = fromStandName.toLowerCase().replace(/\s+/g, '-');
    const toSlug = toStandName.toLowerCase().replace(/\s+/g, '-');
    const id = `rt-${fromSlug}-${toSlug}-${Date.now().toString().slice(-4)}`;

    const newRoute = await BusRouteModel.create({
      id,
      fromStandId: fromStand.id,
      fromStandName: fromStand.name,
      toStandId: toStand.id,
      toStandName: toStand.name,
      status: status || 'Published',
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'route_added',
      title: `New Route: ${newRoute.fromStandName} → ${newRoute.toStandName}`,
      description: `Status: ${newRoute.status}`,
      timestamp: now,
    });

    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// PUT /api/routes/:id
routesRouter.put('/:id', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const updated = await BusRouteModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: now },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// DELETE /api/routes/:id
routesRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await BusRouteModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Route not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

// POST /api/routes/:id/publish
routesRouter.post('/:id/publish', async (req, res) => {
  try {
    const updated = await BusRouteModel.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Published', updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish route' });
  }
});

// POST /api/routes/:id/unpublish
routesRouter.post('/:id/unpublish', async (req, res) => {
  try {
    const updated = await BusRouteModel.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Draft', updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish route' });
  }
});
