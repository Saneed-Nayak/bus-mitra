import { Router } from 'express';
import { TimetableModel, BusRouteModel, BusStandModel, ActivityLogModel } from '../models/index.js';
import { parseTimeToMinutes } from '../seed/seedData.js';

export const timetablesRouter = Router();

const ensureBusStand = async (name: string, now: string) => {
  const trimmedName = name.trim();
  const existing = await BusStandModel.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } });
  if (existing) return existing;

  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return BusStandModel.create({
    id: `bs-${slug}-${Date.now().toString().slice(-4)}`,
    name: trimmedName,
    district: 'Karnataka',
    status: 'Active',
    createdAt: now,
    updatedAt: now,
  });
};

const syncTimetableRoute = async (
  timetableId: string,
  routeId: string,
  fromStandName: string,
  toStandName: string,
  viaStops: string[],
  status: 'Published' | 'Draft',
  now: string
) => {
  const fromStand = await ensureBusStand(fromStandName, now);
  const toStand = await ensureBusStand(toStandName, now);
  await Promise.all(viaStops.map((stop) => ensureBusStand(stop, now)));
  const routeFilter = {
    fromStandName: { $regex: `^${fromStandName.trim()}$`, $options: 'i' },
    toStandName: { $regex: `^${toStandName.trim()}$`, $options: 'i' },
  };
  const matchingRoute = await BusRouteModel.findOne(routeFilter);
  if (matchingRoute) {
    if (matchingRoute.id !== routeId && !(await TimetableModel.exists({ routeId, id: { $ne: timetableId } }))) {
      await BusRouteModel.deleteOne({ id: routeId });
    }
    return matchingRoute.id;
  }

  const otherTimetableUsesRoute = await TimetableModel.exists({ routeId, id: { $ne: timetableId } });
  if (!otherTimetableUsesRoute && routeId !== 'rt-general') {
    await BusRouteModel.findOneAndUpdate(
      { id: routeId },
      {
        fromStandId: fromStand.id,
        fromStandName: fromStand.name,
        toStandId: toStand.id,
        toStandName: toStand.name,
        status: status === 'Draft' ? 'Draft' : 'Published',
        updatedAt: now,
      },
      { new: true }
    );
    return routeId;
  }

  const fromSlug = fromStand.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const toSlug = toStand.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const route = await BusRouteModel.findOneAndUpdate(
    routeFilter,
    {
      $setOnInsert: {
        id: `rt-${fromSlug}-${toSlug}-${Date.now().toString().slice(-4)}`,
        fromStandId: fromStand.id,
        fromStandName: fromStand.name,
        toStandId: toStand.id,
        toStandName: toStand.name,
        status: status === 'Draft' ? 'Draft' : 'Published',
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return route.id;
};

// GET /api/timetables
timetablesRouter.get('/', async (req, res) => {
  try {
    const { publishedOnly, routeId, search } = req.query;
    const filter: Record<string, any> = {};

    if (publishedOnly === 'true' || publishedOnly === '1') {
      filter.status = 'Published';
    }

    if (routeId && typeof routeId === 'string') {
      filter.routeId = routeId;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { fromStandName: { $regex: q, $options: 'i' } },
        { toStandName: { $regex: q, $options: 'i' } },
        { busName: { $regex: q, $options: 'i' } },
        { busType: { $regex: q, $options: 'i' } },
        { departureTime: { $regex: q, $options: 'i' } },
        { via: { $regex: q, $options: 'i' } },
        { viaStops: { $regex: q, $options: 'i' } },
      ];
    }

    const timetables = await TimetableModel.find(filter).sort({ departureMinutes: 1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// GET /api/timetables/search
timetablesRouter.get('/search', async (req, res) => {
  try {
    const { from, to, timeFilter, busType } = req.query;
    const filter: Record<string, any> = { status: 'Published' };

    if (from && typeof from === 'string' && from.trim()) {
      filter.fromStandName = { $regex: `^${from.trim()}$`, $options: 'i' };
    }

    if (to && typeof to === 'string' && to.trim()) {
      const destinationName = to.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const destinationRegex = `^${destinationName}$`;
      const legacyViaRegex = `(?:^|\\s*(?:,|→)\\s*)${destinationName}(?:\\s*(?:,|→)|$)`;
      filter.$or = [
        { toStandName: { $regex: destinationRegex, $options: 'i' } },
        { viaStops: { $elemMatch: { $regex: destinationRegex, $options: 'i' } } },
        { via: { $regex: legacyViaRegex, $options: 'i' } },
      ];
    }

    if (busType && typeof busType === 'string' && busType !== 'all') {
      filter.busType = busType;
    }

    if (timeFilter && typeof timeFilter === 'string' && timeFilter !== 'all') {
      switch (timeFilter) {
        case 'before_10am':
          filter.departureMinutes = { $lt: 600 };
          break;
        case 'after_10am':
          filter.departureMinutes = { $gte: 600 };
          break;
        case 'afternoon':
          filter.departureMinutes = { $gte: 720, $lt: 1020 };
          break;
        case 'evening':
          filter.departureMinutes = { $gte: 1020, $lt: 1260 };
          break;
        case 'night':
          filter.$or = [{ departureMinutes: { $gte: 1260 } }, { departureMinutes: { $lt: 300 } }];
          break;
      }
    }

    const results = await TimetableModel.find(filter).sort({ departureMinutes: 1 });

    res.json({
      from: (from as string) || '',
      to: (to as string) || '',
      total: results.length,
      timetables: results,
      date: 'Today',
    });
  } catch (error) {
    console.error('Error in timetable search:', error);
    res.status(500).json({ error: 'Failed to search timetables' });
  }
});

// GET /api/timetables/:id
timetablesRouter.get('/:id', async (req, res) => {
  try {
    const timetable = await TimetableModel.findOne({ id: req.params.id });
    if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// POST /api/timetables
timetablesRouter.post('/', async (req, res) => {
  try {
    const {
      routeId,
      fromStandName,
      toStandName,
      busName,
      busType,
      departureTime,
      arrivalTime,
      status,
      via,
      viaStops,
      frequency,
    } = req.body;

    if (!fromStandName || !toStandName || !departureTime || !busType) {
      return res.status(400).json({ error: 'fromStandName, toStandName, departureTime, and busType are required' });
    }

    const now = new Date().toISOString();
    const departureMinutes = parseTimeToMinutes(departureTime);

    // Find or create associated route if routeId is not provided
    let finalRouteId = routeId;
    if (!finalRouteId) {
      const existingRoute = await BusRouteModel.findOne({
        fromStandName: { $regex: `^${fromStandName.trim()}$`, $options: 'i' },
        toStandName: { $regex: `^${toStandName.trim()}$`, $options: 'i' },
      });

      if (existingRoute) {
        finalRouteId = existingRoute.id;
      } else {
        const fromSlug = fromStandName.toLowerCase().replace(/\s+/g, '-');
        const toSlug = toStandName.toLowerCase().replace(/\s+/g, '-');
        const newRoute = await BusRouteModel.create({
          id: `rt-${fromSlug}-${toSlug}-${Date.now().toString().slice(-4)}`,
          fromStandId: `bs-${fromSlug}`,
          fromStandName: fromStandName.trim(),
          toStandId: `bs-${toSlug}`,
          toStandName: toStandName.trim(),
          status: 'Published',
          createdAt: now,
          updatedAt: now,
        });
        finalRouteId = newRoute.id;
      }
    }

    const id = `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newTimetable = await TimetableModel.create({
      id,
      routeId: finalRouteId || 'rt-general',
      fromStandName: fromStandName.trim(),
      toStandName: toStandName.trim(),
      busName: busName || busType,
      busType,
      departureTime,
      departureMinutes,
      arrivalTime,
      status: status || 'Published',
      via,
      viaStops: Array.isArray(viaStops) && viaStops.length ? viaStops : undefined,
      frequency: frequency || 'Daily',
      createdAt: now,
      updatedAt: now,
    });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'timetable_published',
      title: `Timetable Added: ${newTimetable.fromStandName} → ${newTimetable.toStandName}`,
      description: `${newTimetable.departureTime} (${newTimetable.busType})`,
      timestamp: now,
    });

    res.status(201).json(newTimetable);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ error: 'Failed to create timetable' });
  }
});

// POST /api/timetables/batch
timetablesRouter.post('/batch', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Array of timetable items required' });
    }

    const now = new Date().toISOString();
    const createdList = [];
    const routeIds = new Map<string, string>();

    for (const item of items) {
      const fromStandName = String(item.fromStandName || '').trim();
      const toStandName = String(item.toStandName || '').trim();
      if (!fromStandName || !toStandName || !item.departureTime || !item.busType) {
        return res.status(400).json({ error: 'Each timetable requires fromStandName, toStandName, departureTime, and busType' });
      }

      const routeKey = `${fromStandName.toLowerCase()}|${toStandName.toLowerCase()}`;
      let routeId = item.routeId || routeIds.get(routeKey);
      if (!routeId) {
        let fromStand = await BusStandModel.findOne({ name: { $regex: `^${fromStandName}$`, $options: 'i' } });
        if (!fromStand) {
          const fromSlug = fromStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          fromStand = await BusStandModel.create({ id: `bs-${fromSlug}`, name: fromStandName, district: 'Karnataka', status: 'Active', createdAt: now, updatedAt: now });
        }

        let toStand = await BusStandModel.findOne({ name: { $regex: `^${toStandName}$`, $options: 'i' } });
        if (!toStand) {
          const toSlug = toStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          toStand = await BusStandModel.create({ id: `bs-${toSlug}`, name: toStandName, district: 'Karnataka', status: 'Active', createdAt: now, updatedAt: now });
        }

        const route = await BusRouteModel.findOneAndUpdate(
          { fromStandName: { $regex: `^${fromStandName}$`, $options: 'i' }, toStandName: { $regex: `^${toStandName}$`, $options: 'i' } },
          {
            $setOnInsert: {
              id: `rt-${fromStandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${toStandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
              fromStandId: fromStand.id,
              fromStandName: fromStand.name,
              toStandId: toStand.id,
              toStandName: toStand.name,
              status: item.status || 'Published',
              createdAt: now,
            },
            $set: { updatedAt: now },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        routeId = route.id;
        routeIds.set(routeKey, routeId);
      }

      const departureMinutes = parseTimeToMinutes(item.departureTime);
      const id = `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const created = await TimetableModel.create({
        id,
        routeId,
        fromStandName,
        toStandName,
        busName: item.busName || item.busType,
        busType: item.busType,
        departureTime: item.departureTime,
        departureMinutes,
        arrivalTime: item.arrivalTime,
        status: item.status || 'Published',
        via: item.via,
        viaStops: Array.isArray(item.viaStops) && item.viaStops.length ? item.viaStops : undefined,
        frequency: item.frequency || 'Daily',
        createdAt: now,
        updatedAt: now,
      });

      createdList.push(created);
    }

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'timetable_published',
      title: `Imported ${createdList.length} Timetables`,
      description: `AI / Batch Timetable Import published to database`,
      timestamp: now,
    });

    res.status(201).json(createdList);
  } catch (error) {
    console.error('Batch import failed:', error);
    res.status(500).json({ error: 'Failed to batch import timetables' });
  }
});

// PUT /api/timetables/:id
timetablesRouter.put('/:id', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const existing = await TimetableModel.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ error: 'Timetable not found' });

    const updateData: Record<string, any> = { ...req.body, updatedAt: now };

    if (req.body.departureTime) {
      updateData.departureMinutes = parseTimeToMinutes(req.body.departureTime);
    }

    const fromStandName = String(req.body.fromStandName || existing.fromStandName).trim();
    const toStandName = String(req.body.toStandName || existing.toStandName).trim();
    const viaStops = Array.isArray(req.body.viaStops)
      ? req.body.viaStops.map((stop: unknown) => String(stop).trim()).filter(Boolean)
      : existing.viaStops || [];
    const status = (req.body.status || existing.status) as 'Published' | 'Draft';
    updateData.fromStandName = fromStandName;
    updateData.toStandName = toStandName;
    updateData.viaStops = viaStops.length ? viaStops : undefined;
    updateData.routeId = await syncTimetableRoute(
      existing.id,
      existing.routeId,
      fromStandName,
      toStandName,
      viaStops,
      status,
      now
    );

    const updated = await TimetableModel.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Timetable not found' });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'timetable_update',
      title: `Timetable Updated: ${updated.fromStandName} → ${updated.toStandName}`,
      description: `Departure: ${updated.departureTime} (${updated.status})`,
      timestamp: now,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timetable' });
  }
});

// DELETE /api/timetables/:id
timetablesRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await TimetableModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Timetable not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// POST /api/timetables/:id/publish
timetablesRouter.post('/:id/publish', async (req, res) => {
  try {
    const updated = await TimetableModel.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Published', updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Timetable not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish timetable' });
  }
});

// POST /api/timetables/:id/unpublish
timetablesRouter.post('/:id/unpublish', async (req, res) => {
  try {
    const updated = await TimetableModel.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Draft', updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Timetable not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish timetable' });
  }
});
