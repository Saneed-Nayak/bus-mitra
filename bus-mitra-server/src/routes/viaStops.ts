import { Router } from 'express';
import {
  ViaStopSuggestionModel,
  TimetableModel,
  BusStandModel,
  ActivityLogModel,
} from '../models/index.js';

export const viaStopsRouter = Router();

// GET /api/via-stops
viaStopsRouter.get('/', async (_req, res) => {
  try {
    const suggestions = await ViaStopSuggestionModel.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch via stop suggestions' });
  }
});

// GET /api/via-stops/route/:routeId
viaStopsRouter.get('/route/:routeId', async (req, res) => {
  try {
    const suggestions = await ViaStopSuggestionModel.find({
      routeId: req.params.routeId,
      status: 'verified',
    }).sort({ position: 1, createdAt: 1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch via stops for route' });
  }
});

// GET /api/via-stops/timetable/:timetableId
viaStopsRouter.get('/timetable/:timetableId', async (req, res) => {
  try {
    const suggestions = await ViaStopSuggestionModel.find({
      timetableId: req.params.timetableId,
      status: 'verified',
    }).sort({ position: 1, createdAt: 1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch via stops for timetable' });
  }
});

// GET /api/via-stops/pending (for admin)
viaStopsRouter.get('/admin/pending', async (_req, res) => {
  try {
    const suggestions = await ViaStopSuggestionModel.find({
      status: 'pending',
    }).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending suggestions' });
  }
});

// POST /api/via-stops (create new suggestion)
viaStopsRouter.post('/', async (req, res) => {
  try {
    const { timetableId, routeId, fromStandName, toStandName, stopName, position, submittedBy, reason, notes } = req.body;

    if (!timetableId || !routeId || !fromStandName || !toStandName || !stopName) {
      return res.status(400).json({ error: 'Missing required fields: timetableId, routeId, fromStandName, toStandName, stopName' });
    }

    const now = new Date().toISOString();
    const id = `via-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newSuggestion = await ViaStopSuggestionModel.create({
      id,
      timetableId: timetableId.trim(),
      routeId: routeId.trim(),
      fromStandName: fromStandName.trim(),
      toStandName: toStandName.trim(),
      stopName: stopName.trim(),
      position: position ?? 0,
      submittedBy: submittedBy?.trim() || undefined,
      reason: reason || 'know_route',
      notes: notes?.trim() || undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'suggestion_received',
      title: `Via Stop Suggestion: ${stopName} on ${fromStandName} → ${toStandName}`,
      description: `User suggested adding "${stopName}" to this bus route.`,
      timestamp: now,
    });

    res.status(201).json(newSuggestion);
  } catch (error) {
    console.error('Error creating via stop suggestion:', error);
    res.status(500).json({ error: 'Failed to create via stop suggestion' });
  }
});

// PUT /api/via-stops/:id (admin: approve, reject, or edit)
viaStopsRouter.put('/:id', async (req, res) => {
  try {
    const { status, adminNotes, position } = req.body;
    const now = new Date().toISOString();

    const updated = await ViaStopSuggestionModel.findOneAndUpdate(
      { id: req.params.id },
      {
        status,
        adminNotes,
        ...(position !== undefined && { position }),
        updatedAt: now,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Suggestion not found' });

    // Log approval/rejection
    if (status === 'verified') {
      await ActivityLogModel.create({
        id: `act-${Date.now()}`,
        type: 'suggestion_approved',
        title: `Via Stop Approved: ${updated.stopName}`,
        description: `"${updated.stopName}" added to route ${updated.fromStandName} → ${updated.toStandName}`,
        timestamp: now,
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating via stop suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// DELETE /api/via-stops/:id (admin: remove suggestion)
viaStopsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await ViaStopSuggestionModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Suggestion not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});
