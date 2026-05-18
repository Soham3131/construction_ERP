import Tender from '../models/Tender';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

/**
 * Evaluates all contractors against a newly published tender and generates automated notifications.
 * Runs asynchronously to prevent blocking the publishing request.
 */
export const generateTenderPublishAlerts = async (tenderId: string | mongoose.Types.ObjectId) => {
  try {
    const tender = await Tender.findById(tenderId).populate('department', 'name').populate('division', 'name');
    if (!tender) return;

    // Fetch all active contractors
    const contractors = await User.find({ role: 'CONTRACTOR', active: true });

    const notificationsToCreate = [];

    for (const contractor of contractors) {
      const { turnover = 0, preferredDivisions = [], experienceYears = 0, projectTypes = [] } = contractor;

      let isEligible = true;

      // Hard constraints
      if (tender.minTurnover && turnover < tender.minTurnover) isEligible = false;
      if (tender.minExperienceYears && experienceYears < tender.minExperienceYears) isEligible = false;
      
      if (tender.projectCategories && tender.projectCategories.length > 0) {
        const matchesCategory = tender.projectCategories.some(c => projectTypes.includes(c));
        if (!matchesCategory) isEligible = false;
      }

      const isPreferredDivision = tender.division ? preferredDivisions.includes(tender.division._id as any) : false;

      let notifType = null;
      let title = '';
      let message = '';

      if (isEligible) {
        notifType = 'TENDER_ELIGIBLE';
        title = `New Eligible Tender: ${tender.title}`;
        message = `A new tender matching your profile requirements has been published by ${tender.department ? (tender.department as any).name : 'the department'}.`;
      } else if (isPreferredDivision) {
        notifType = 'TENDER_DIVISION';
        title = `New Tender in Preferred Division`;
        message = `A new tender (${tender.title}) has been published in one of your preferred divisions. Check if you can meet the requirements.`;
      }

      if (notifType) {
        notificationsToCreate.push({
          user: contractor._id,
          department: tender.department ? (tender.department as any)._id : undefined,
          type: notifType,
          title,
          message,
          link: `/tenders/${tender._id}`,
          read: false
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
      console.log(`[NotificationService] Generated ${notificationsToCreate.length} alerts for tender ${tenderId}`);
    }
  } catch (error) {
    console.error('[NotificationService] Error generating tender alerts:', error);
  }
};
