import { Router } from 'express';
import { BusTypeModel } from '../models/index.js';

export const busTypesRouter = Router();

const defaultBusTypes = [
  'Karnataka Sarige',
  'NWKRTC Express',
  'Gramina Sarige',
  'Rajahamsa Executive',
  'Suvarna Sarige',
  'Kalyana Ratha',
  'Non-AC Sleeper',
  'Other',
];

busTypesRouter.get('/', async (_req, res) => {
  try {
    if (!(await BusTypeModel.exists({}))) {
      const now = new Date().toISOString();
      await BusTypeModel.insertMany(defaultBusTypes.map((name, index) => ({ id: `bt-${index + 1}`, name, createdAt: now })));
    }
    res.json(await BusTypeModel.find().sort({ createdAt: 1 }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bus types' });
  }
});

busTypesRouter.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Bus type name is required' });
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await BusTypeModel.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ error: 'Bus type already exists' });
    const created = await BusTypeModel.create({ id: `bt-${Date.now()}`, name, createdAt: new Date().toISOString() });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bus type' });
  }
});
