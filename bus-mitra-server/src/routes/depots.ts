import { Router } from 'express';
import { DepotContactModel, ActivityLogModel } from '../models/index.js';

export const depotsRouter = Router();

// GET /api/depots
depotsRouter.get('/', async (req, res) => {
  try {
    const { activeOnly, search } = req.query;
    const filter: Record<string, any> = {};

    if (activeOnly === 'true' || activeOnly === '1') {
      filter.status = 'Active';
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { depotName: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } },
      ];
    }

    const depots = await DepotContactModel.find(filter).sort({ depotName: 1 });
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch depots' });
  }
});

// GET /api/depots/:id
depotsRouter.get('/:id', async (req, res) => {
  try {
    const depot = await DepotContactModel.findOne({ id: req.params.id });
    if (!depot) return res.status(404).json({ error: 'Depot not found' });
    res.json(depot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch depot' });
  }
});

// POST /api/depots
depotsRouter.post('/', async (req, res) => {
  try {
    const { depotName, district, phoneNumber, altPhone, address, status } = req.body;
    if (!depotName || !district || !phoneNumber) {
      return res.status(400).json({ error: 'Depot name, district, and phone number are required' });
    }

    const now = new Date().toISOString();
    const id = `dp-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substr(2, 3)}`;

    const newDepot = await DepotContactModel.create({
      id,
      depotName: depotName.trim(),
      district: district.trim(),
      phoneNumber: phoneNumber.trim(),
      altPhone: altPhone ? altPhone.trim() : undefined,
      address: address ? address.trim() : undefined,
      status: status || 'Active',
      createdAt: now,
      updatedAt: now,
    });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'depot_updated',
      title: `Depot Added: ${newDepot.depotName}`,
      description: `Phone: ${newDepot.phoneNumber}`,
      timestamp: now,
    });

    res.status(201).json(newDepot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create depot' });
  }
});

// POST /api/depots/batch
depotsRouter.post('/batch', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Array of depot contacts required' });
    }

    const now = new Date().toISOString();
    const createdList = [];
    for (const item of items) {
      const depotName = String(item.depotName || '').trim();
      const district = String(item.district || '').trim();
      const phoneNumber = String(item.phoneNumber || '').trim();
      if (!depotName || !district || !phoneNumber) {
        return res.status(400).json({ error: 'Each depot requires depotName, district, and phoneNumber' });
      }

      const created = await DepotContactModel.create({
        id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        depotName,
        district,
        phoneNumber,
        altPhone: item.altPhone ? String(item.altPhone).trim() : undefined,
        address: item.address ? String(item.address).trim() : undefined,
        status: item.status === 'Inactive' ? 'Inactive' : 'Active',
        createdAt: now,
        updatedAt: now,
      });
      createdList.push(created);
    }

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'depot_updated',
      title: `Imported ${createdList.length} Depot Helplines`,
      description: 'Bulk depot contact import added to database',
      timestamp: now,
    });

    res.status(201).json(createdList);
  } catch (error) {
    console.error('Depot batch import failed:', error);
    res.status(500).json({ error: 'Failed to batch import depot contacts' });
  }
});

// PUT /api/depots/:id
depotsRouter.put('/:id', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const updated = await DepotContactModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: now },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Depot not found' });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'depot_updated',
      title: `Depot Updated: ${updated.depotName}`,
      description: `Status: ${updated.status}`,
      timestamp: now,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update depot' });
  }
});

// DELETE /api/depots/:id
depotsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await DepotContactModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Depot not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete depot' });
  }
});
