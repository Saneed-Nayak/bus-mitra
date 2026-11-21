import { Router } from 'express';
import { ContributorProfileModel, CommunityReportModel } from '../models/index.js';

export const contributorsRouter = Router();

// GET /api/contributors/:id
contributorsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let profile = await ContributorProfileModel.findOne({ id });

    if (!profile) {
      const now = new Date().toISOString();
      profile = await ContributorProfileModel.create({
        id,
        totalPoints: 0,
        reportCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        joinedAt: now,
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributor profile' });
  }
});

// POST /api/contributors/:id/check-bonus
contributorsRouter.post('/:id/check-bonus', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ContributorProfileModel.findOne({ id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Check for any approved reports that haven't been credited yet
    const uncreditedReports = await CommunityReportModel.find({
      contributorId: id,
      status: 'Approved',
      bonusCredited: false,
    });

    let bonusEarned = 0;
    for (const report of uncreditedReports) {
      bonusEarned += report.bonusPoints;
      report.bonusCredited = true;
      report.updatedAt = new Date().toISOString();
      await report.save();
    }

    if (bonusEarned > 0) {
      profile.totalPoints += bonusEarned;
      profile.approvedCount += uncreditedReports.length;
      await profile.save();
    }

    res.json({
      bonusEarned,
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check bonus points' });
  }
});
