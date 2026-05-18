import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Tender from '../models/Tender';
import TenderInteraction from '../models/TenderInteraction';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getRecommendedTenders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user || user.role !== 'CONTRACTOR') {
    res.status(403);
    throw new Error('Only contractors can get tender recommendations');
  }

  const { turnover = 0, preferredDivisions = [], experienceYears = 0, projectTypes = [] } = user;

  const tenders = await Tender.find({
    status: { $in: ['PUBLISHED', 'BIDDING_OPEN'] },
  }).populate('department', 'name code').populate('division', 'name code');

  const highValueThreshold = 10000000; // e.g., 1 Crore

  const enrichedTenders = tenders.map((t) => {
    const reasons: string[] = [];
    let isEligible = true;
    let isPartial = false;

    // Hard constraints check
    if (t.minTurnover && turnover < t.minTurnover) {
      isEligible = false;
      reasons.push(`Minimum turnover of ₹${t.minTurnover.toLocaleString()} required, yours is ₹${turnover.toLocaleString()}`);
    }
    
    if (t.minExperienceYears && experienceYears < t.minExperienceYears) {
      isEligible = false;
      reasons.push(`Minimum ${t.minExperienceYears} years of experience required`);
    }

    if (t.projectCategories && t.projectCategories.length > 0) {
      const matchesCategory = t.projectCategories.some(c => projectTypes.includes(c));
      if (!matchesCategory) {
        isEligible = false;
        reasons.push(`Project category mismatch. Required: ${t.projectCategories.join(', ')}`);
      }
    }

    const isPreferredDivision = t.division ? preferredDivisions.includes(t.division._id as any) : false;
    const isAffordable = turnover >= t.estimatedCost * 0.1;

    if (isEligible) {
      // If eligible, but doesn't match preferences or is hard to afford, make it partial
      if (!isPreferredDivision && preferredDivisions.length > 0) {
        isPartial = true;
        reasons.push(`Not in preferred divisions`);
      }
      if (!isAffordable) {
        isPartial = true;
        reasons.push(`Estimated cost is more than 10x your turnover`);
      }
    }

    let eligibilityStatus = 'ELIGIBLE';
    if (!isEligible) eligibilityStatus = 'NOT_ELIGIBLE';
    else if (isPartial) eligibilityStatus = 'PARTIALLY_ELIGIBLE';

    const tags: string[] = [];
    if (eligibilityStatus === 'ELIGIBLE' || eligibilityStatus === 'PARTIALLY_ELIGIBLE') {
      if (isPreferredDivision && isAffordable && eligibilityStatus === 'ELIGIBLE') tags.push('Highly Recommended');
      else if (eligibilityStatus === 'ELIGIBLE') tags.push('Best Match');
      
      if (t.estimatedCost >= highValueThreshold) tags.push('High Value');
      if (!t.bids || t.bids.length === 0) tags.push('Low Competition');
    }

    return {
      ...t.toObject(),
      eligibilityStatus,
      rejectionReasons: reasons,
      matchTags: tags,
    };
  });

  const bestFit = enrichedTenders.filter(t => t.matchTags.includes('Highly Recommended') || t.matchTags.includes('Best Match'));
  const highValue = enrichedTenders.filter(t => t.matchTags.includes('High Value'));
  const lowCompetition = enrichedTenders.filter(t => t.matchTags.includes('Low Competition'));

  res.json({
    success: true,
    data: {
      bestFit,
      highValue,
      lowCompetition,
      allAvailable: enrichedTenders,
    }
  });
});

export const interactTender = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tenderId } = req.params;
  const { status, isBookmarked } = req.body;

  let interaction = await TenderInteraction.findOne({ user: req.user!._id, tender: tenderId });

  if (interaction) {
    if (status) interaction.status = status;
    if (typeof isBookmarked === 'boolean') interaction.isBookmarked = isBookmarked;
    await interaction.save();
  } else {
    interaction = await TenderInteraction.create({
      user: req.user!._id,
      tender: tenderId,
      status: status || 'VIEWED',
      isBookmarked: isBookmarked || false,
    });
  }

  res.json({ success: true, data: interaction });
});

export const getTenderDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Common stats for intelligence dashboard
  const totalActive = await Tender.countDocuments({ status: { $in: ['PUBLISHED', 'BIDDING_OPEN'] } });
  const externalTenders = await Tender.countDocuments({ source: 'EXTERNAL_PORTAL' });
  const internalTenders = await Tender.countDocuments({ source: 'INTERNAL' });
  
  // Trending (most viewed)
  const trendingInteractions = await TenderInteraction.aggregate([
    { $group: { _id: '$tender', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 5 }
  ]);
  
  const trendingTenders = await Tender.find({ _id: { $in: trendingInteractions.map(i => i._id) } })
                                      .populate('department', 'name')
                                      .select('title estimatedCost status');

  const myInteractions = await TenderInteraction.find({ user: req.user!._id })
                                                .populate('tender', 'title status estimatedCost')
                                                .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: {
      totalActive,
      sourceBreakdown: { external: externalTenders, internal: internalTenders },
      trendingTenders,
      myInteractions
    }
  });
});
