import { Router } from 'express';
import {
  RouteSuggestionModel,
  BusRouteModel,
  TimetableModel,
  BusStandModel,
  ActivityLogModel,
} from '../models/index.js';
import { parseTimeToMinutes } from '../seed/seedData.js';

export const suggestionsRouter = Router();

// GET /api/suggestions
suggestionsRouter.get('/', async (_req, res) => {
  try {
    const suggestions = await RouteSuggestionModel.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route suggestions' });
  }
});

// POST /api/suggestions
suggestionsRouter.post('/', async (req, res) => {
  try {
    const { fromStandName, toStandName, preferredTime, message } = req.body;
    if (!fromStandName || !toStandName) {
      return res.status(400).json({ error: 'From and To bus stands are required' });
    }

    const now = new Date().toISOString();
    const id = `sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newSuggestion = await RouteSuggestionModel.create({
      id,
      fromStandName: fromStandName.trim(),
      toStandName: toStandName.trim(),
      preferredTime: preferredTime?.trim() || undefined,
      message: message?.trim() || undefined,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    });

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'suggestion_received',
      title: `Route Suggestion: ${newSuggestion.fromStandName} → ${newSuggestion.toStandName}`,
      description: newSuggestion.message ? `"${newSuggestion.message}"` : 'New commuter route request',
      timestamp: now,
    });

    res.status(201).json(newSuggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create route suggestion' });
  }
});

// PUT /api/suggestions/:id
suggestionsRouter.put('/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const now = new Date().toISOString();

    const updated = await RouteSuggestionModel.findOneAndUpdate(
      { id: req.params.id },
      { status, adminNotes, updatedAt: now },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Suggestion not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// POST /api/suggestions/:id/approve
suggestionsRouter.post('/:id/approve', async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const now = new Date().toISOString();

    const suggestion = await RouteSuggestionModel.findOne({ id: req.params.id });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    // 1. Create or get origin & destination bus stands
    const fromSlug = suggestion.fromStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const toSlug = suggestion.toStandName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    let fromStand = await BusStandModel.findOne({ name: { $regex: `^${suggestion.fromStandName.trim()}$`, $options: 'i' } });
    if (!fromStand) {
      fromStand = await BusStandModel.create({
        id: `bs-${fromSlug}`,
        name: suggestion.fromStandName.trim(),
        district: 'Karnataka',
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });
    }

    let toStand = await BusStandModel.findOne({ name: { $regex: `^${suggestion.toStandName.trim()}$`, $options: 'i' } });
    if (!toStand) {
      toStand = await BusStandModel.create({
        id: `bs-${toSlug}`,
        name: suggestion.toStandName.trim(),
        district: 'Karnataka',
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });
    }

    // 2. Create the Route
    const routeId = `rt-${fromSlug}-${toSlug}-${Date.now().toString().slice(-4)}`;
    const createdRoute = await BusRouteModel.create({
      id: routeId,
      fromStandId: fromStand.id,
      fromStandName: fromStand.name,
      toStandId: toStand.id,
      toStandName: toStand.name,
      status: 'Published',
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create initial timetable if preferredTime was provided
    let sampleTimetable;
    if (suggestion.preferredTime) {
      const departureMinutes = parseTimeToMinutes(suggestion.preferredTime);
      sampleTimetable = await TimetableModel.create({
        id: `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        routeId: createdRoute.id,
        fromStandName: suggestion.fromStandName,
        toStandName: suggestion.toStandName,
        busName: 'Karnataka Sarige',
        busType: 'Karnataka Sarige',
        departureTime: suggestion.preferredTime,
        departureMinutes,
        status: 'Published',
        frequency: 'Daily',
        createdAt: now,
        updatedAt: now,
      });
    }

    // 4. Update suggestion
    suggestion.status = 'Approved';
    suggestion.approvedRouteId = createdRoute.id;
    suggestion.adminNotes = adminNotes || 'Approved by Admin. Route published to live client search.';
    suggestion.updatedAt = now;
    await suggestion.save();

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'suggestion_approved',
      title: `Approved Route: ${suggestion.fromStandName} → ${suggestion.toStandName}`,
      description: `Published to Client. Route ID: ${createdRoute.id}`,
      timestamp: now,
    });

    res.json({
      suggestion,
      createdRoute,
      sampleTimetable,
    });
  } catch (error) {
    console.error('Error approving suggestion:', error);
    res.status(500).json({ error: 'Failed to approve suggestion' });
  }
});
