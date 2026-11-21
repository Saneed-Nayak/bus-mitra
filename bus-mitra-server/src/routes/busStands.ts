import { Router } from 'express';
import { BusStandModel, ActivityLogModel } from '../models/index.js';

export const busStandsRouter = Router();

// GET /api/bus-stands
busStandsRouter.get('/', async (req, res) => {
  try {
    const { activeOnly, search, popular } = req.query;
    const filter: Record<string, any> = {};

    if (activeOnly === 'true' || activeOnly === '1') {
      filter.status = 'Active';
    }

    if (popular === 'true' || popular === '1') {
      filter.status = 'Active';
      filter.isPopular = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { kannadaName: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
      ];
    }

    const stands = await BusStandModel.find(filter).sort({ name: 1 });
    res.json(stands);
  } catch (error) {
    console.error('Error fetching bus stands:', error);
    res.status(500).json({ error: 'Failed to fetch bus stands' });
  }
});

// GET /api/bus-stands/popular
busStandsRouter.get('/popular', async (_req, res) => {
  try {
    const stands = await BusStandModel.find({ status: 'Active', isPopular: true }).sort({ name: 1 });
    res.json(stands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular stands' });
  }
});

// GET /api/bus-stands/:id
busStandsRouter.get('/:id', async (req, res) => {
  try {
    const stand = await BusStandModel.findOne({ id: req.params.id });
    if (!stand) {
      return res.status(404).json({ error: 'Bus stand not found' });
    }
    res.json(stand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bus stand' });
  }
});

// POST /api/bus-stands
busStandsRouter.post('/', async (req, res) => {
  try {
    const { name, kannadaName, district, status, isPopular, code, latitude, longitude } = req.body;
    if (!name || !district) {
      return res.status(400).json({ error: 'Name and district are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const now = new Date().toISOString();
    const id = `bs-${slug}-${Date.now().toString().slice(-4)}`;

    const newStand = await BusStandModel.create({
      id,
      name,
      kannadaName,
      district,
      status: status || 'Active',
      isPopular: !!isPopular,
      code,
      latitude,
      longitude,
      createdAt: now,
      updatedAt: now,
    });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'stand_added',
      title: `Added Bus Stand: ${newStand.name}`,
      description: `District: ${newStand.district}`,
      timestamp: now,
    });

    res.status(201).json(newStand);
  } catch (error) {
    console.error('Error creating bus stand:', error);
    res.status(500).json({ error: 'Failed to create bus stand' });
  }
});

// PUT /api/bus-stands/:id
busStandsRouter.put('/:id', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const updated = await BusStandModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: now },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Bus stand not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bus stand' });
  }
});

// DELETE /api/bus-stands/:id
busStandsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await BusStandModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Bus stand not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bus stand' });
  }
});
