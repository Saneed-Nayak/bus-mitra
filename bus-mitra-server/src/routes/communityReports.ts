import { Router } from 'express';
import { CommunityReportModel, ContributorProfileModel, ActivityLogModel } from '../models/index.js';

export const communityReportsRouter = Router();

// GET /api/community-reports
communityReportsRouter.get('/', async (req, res) => {
  try {
    const { status, contributorId } = req.query;
    const filter: Record<string, any> = {};

    if (status && typeof status === 'string' && status !== 'All') {
      filter.status = status;
    }

    if (contributorId && typeof contributorId === 'string') {
      filter.contributorId = contributorId;
    }

    const reports = await CommunityReportModel.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community reports' });
  }
});

// POST /api/community-reports
communityReportsRouter.post('/', async (req, res) => {
  try {
    const { contributorId, questionSetType, answers, location, pointsAwarded } = req.body;
    if (!contributorId || !questionSetType || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'contributorId, questionSetType, and answers array are required' });
    }

    const now = new Date().toISOString();
    const id = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const pts = typeof pointsAwarded === 'number' ? pointsAwarded : 10;

    const newReport = await CommunityReportModel.create({
      id,
      contributorId,
      questionSetType,
      answers,
      location,
      status: 'Pending',
      pointsAwarded: pts,
      bonusPoints: 20,
      bonusCredited: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update contributor profile in MongoDB
    let profile = await ContributorProfileModel.findOne({ id: contributorId });
    if (!profile) {
      profile = await ContributorProfileModel.create({
        id: contributorId,
        totalPoints: pts,
        reportCount: 1,
        approvedCount: 0,
        rejectedCount: 0,
        lastContributedAt: now,
        joinedAt: now,
      });
    } else {
      profile.totalPoints += pts;
      profile.reportCount += 1;
      profile.lastContributedAt = now;
      await profile.save();
    }

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'suggestion_received',
      title: `Community Report Submitted (#${contributorId.slice(-4).toUpperCase()})`,
      description: `Type: ${questionSetType}, Points: +${pts}`,
      timestamp: now,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating community report:', error);
    res.status(500).json({ error: 'Failed to create community report' });
  }
});

// PUT /api/community-reports/:id/status
communityReportsRouter.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const now = new Date().toISOString();
    const report = await CommunityReportModel.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Community report not found' });

    const previousStatus = report.status;
    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.updatedAt = now;

    // Handle contributor points update when Approved
    if (status === 'Approved' && !report.bonusCredited) {
      report.bonusCredited = true;
      const profile = await ContributorProfileModel.findOne({ id: report.contributorId });
      if (profile) {
        profile.totalPoints += report.bonusPoints;
        profile.approvedCount += 1;
        await profile.save();
      }
    } else if (status === 'Rejected' && previousStatus !== 'Rejected') {
      const profile = await ContributorProfileModel.findOne({ id: report.contributorId });
      if (profile) {
        profile.rejectedCount += 1;
        await profile.save();
      }
    }

    await report.save();

    res.json(report);
  } catch (error) {
    console.error('Error updating community report status:', error);
    res.status(500).json({ error: 'Failed to update community report status' });
  }
});
