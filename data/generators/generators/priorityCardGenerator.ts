// =============================================================================
// PRIORITY CARD GENERATOR
// =============================================================================
// Generates contextual priority cards based on actual generated data.
// Cards highlight issues, opportunities, and insights dynamically.
// =============================================================================

import type {
  DemoConfiguration,
  DemoData,
  PriorityCard,
  PriorityCardStatus,
  PriorityCardCategory,
  PriorityCardStat,
  Clinician,
  ClinicianSyntheticMetrics,
  AtRiskClient,
  ClientRosterEntry,
} from '../types';

// =============================================================================
// THRESHOLDS
// =============================================================================

const THRESHOLDS = {
  showRate: { critical: 75, warning: 85, good: 90 },
  rebookRate: { critical: 70, warning: 80, good: 88 },
  churnRate: { critical: 8, warning: 5, good: 3 },
  notesOverdue: { critical: 10, warning: 5, good: 2 },
  consultConversion: { critical: 50, warning: 60, good: 70 },
  atRiskClients: { critical: 10, warning: 5, good: 2 },
  revenueGrowth: { critical: -5, warning: 0, good: 3 },
};

// =============================================================================
// CARD GENERATORS
// =============================================================================

/**
 * Generate cards for at-risk clients
 */
function generateAtRiskCards(data: DemoData): PriorityCard[] {
  const cards: PriorityCard[] = [];
  const atRiskClients = data.clients.atRisk;

  if (atRiskClients.length === 0) return cards;

  // High priority at-risk clients
  const highRisk = atRiskClients.filter(c => c.riskLevel === 'high');

  if (highRisk.length > 0) {
    cards.push({
      id: 'at-risk-high',
      title: `${highRisk.length} Clients Need Immediate Attention`,
      aiGuidance: `These clients haven't been seen in over 28 days and have no upcoming appointment. Reach out personally to re-engage before they churn.`,
      action: 'Review at-risk clients',
      status: 'critical',
      category: 'urgent',
      stats: [
        { value: highRisk.length, label: 'High risk' },
        { value: highRisk[0]?.daysSinceLastSession || 0, label: 'Max days absent' },
      ],
    });
  }

  // Medium risk summary
  const mediumRisk = atRiskClients.filter(c => c.riskLevel === 'medium');
  if (mediumRisk.length >= 3) {
    cards.push({
      id: 'at-risk-medium',
      title: `${mediumRisk.length} Clients Showing Early Warning Signs`,
      aiGuidance: `These clients are 21-28 days since their last session. Consider sending a check-in message or offering flexible scheduling.`,
      action: 'Schedule follow-ups',
      status: 'warning',
      category: 'attention',
      stats: [
        { value: mediumRisk.length, label: 'At risk' },
        { value: `${Math.round(mediumRisk.length / (data.clients.roster.filter(c => c.status !== 'churned').length || 1) * 100)}%`, label: 'Of caseload' },
      ],
    });
  }

  return cards;
}

/**
 * Generate cards for clinician performance issues
 */
function generateClinicianPerformanceCards(data: DemoData): PriorityCard[] {
  const cards: PriorityCard[] = [];
  const clinicians = data.clinicians;
  const metrics = data.clinicianSyntheticMetrics;

  // Find clinicians with low show rates
  const lowShowRate = clinicians.filter(c => {
    const m = metrics[c.id];
    return m && m.showRate < THRESHOLDS.showRate.warning;
  });

  if (lowShowRate.length > 0) {
    const worst = lowShowRate.reduce((a, b) =>
      (metrics[a.id]?.showRate || 100) < (metrics[b.id]?.showRate || 100) ? a : b
    );
    const worstRate = metrics[worst.id]?.showRate || 0;

    cards.push({
      id: 'clinician-show-rate',
      title: `${worst.name}'s Show Rate Needs Attention`,
      aiGuidance: `A ${worstRate}% show rate is below target. Review their client communication patterns and consider adjusting reminder timing or confirmation processes.`,
      action: 'Review clinician metrics',
      status: worstRate < THRESHOLDS.showRate.critical ? 'critical' : 'warning',
      category: worstRate < THRESHOLDS.showRate.critical ? 'urgent' : 'attention',
      stats: [
        { value: `${worstRate}%`, label: 'Show rate', color: '#ef4444' },
        { value: `${90}%`, label: 'Target', color: '#22c55e' },
      ],
    });
  }

  // Find clinicians with overdue notes
  const overdueNotes = clinicians.filter(c => {
    const m = metrics[c.id];
    return m && m.overdueNotes >= THRESHOLDS.notesOverdue.warning;
  });

  if (overdueNotes.length > 0) {
    const totalOverdue = overdueNotes.reduce((sum, c) => sum + (metrics[c.id]?.overdueNotes || 0), 0);

    cards.push({
      id: 'notes-overdue',
      title: `${totalOverdue} Notes Are Past Deadline`,
      aiGuidance: `Overdue notes create compliance risk and billing delays. Consider blocking new appointments until documentation is current.`,
      action: 'View overdue notes',
      status: totalOverdue >= THRESHOLDS.notesOverdue.critical ? 'critical' : 'warning',
      category: 'attention',
      stats: [
        { value: totalOverdue, label: 'Overdue' },
        { value: overdueNotes.length, label: 'Clinicians affected' },
      ],
    });
  }

  return cards;
}

/**
 * Generate cards for consultation pipeline
 */
function generateConsultationCards(data: DemoData): PriorityCard[] {
  const cards: PriorityCard[] = [];
  const pipeline = data.consultations.pipelineStatus;
  const funnel = data.consultations.funnel;

  // Active leads needing follow-up
  if (pipeline.activePipeline > 0) {
    const noShowStage = pipeline.byStage.find(s => s.stage === 'No Show');

    if (noShowStage && noShowStage.count > 0) {
      cards.push({
        id: 'consult-no-shows',
        title: `${noShowStage.count} Consultation No-Shows to Recover`,
        aiGuidance: `These potential clients missed their consultation. Quick follow-up within 24 hours has the best recovery rate. Consider offering alternative times.`,
        action: 'Start recovery outreach',
        status: 'warning',
        category: 'attention',
        stats: [
          { value: noShowStage.count, label: 'No-shows' },
          { value: `${noShowStage.avgDaysInStage}d`, label: 'Avg wait time' },
        ],
      });
    }

    // Low conversion opportunity
    if (funnel.booked > 0) {
      const conversionRate = Math.round((funnel.firstSession / funnel.booked) * 100);

      if (conversionRate < THRESHOLDS.consultConversion.warning) {
        cards.push({
          id: 'consult-conversion',
          title: `Consultation Conversion at ${conversionRate}%`,
          aiGuidance: `Your conversion rate is below the ${THRESHOLDS.consultConversion.good}% target. Review your intake process for friction points and ensure timely follow-up after consultations.`,
          action: 'Analyze funnel',
          status: conversionRate < THRESHOLDS.consultConversion.critical ? 'critical' : 'warning',
          category: 'attention',
          stats: [
            { value: `${conversionRate}%`, label: 'Converting' },
            { value: funnel.booked - funnel.firstSession, label: 'Lost leads' },
          ],
        });
      }
    }
  }

  return cards;
}

/**
 * Generate cards for positive achievements/opportunities
 */
function generateOpportunityCards(data: DemoData): PriorityCard[] {
  const cards: PriorityCard[] = [];

  // Clients approaching milestones
  const milestoneClients = data.clients.approachingMilestone;
  if (milestoneClients.length > 0) {
    const milestone12 = milestoneClients.filter(c => c.targetMilestone === 12);

    if (milestone12.length > 0) {
      cards.push({
        id: 'milestone-12',
        title: `${milestone12.length} Clients Approaching Session 12`,
        aiGuidance: `Session 12 is a key retention milestone. Consider acknowledging their progress and discussing treatment goals to reinforce commitment.`,
        action: 'View milestone clients',
        status: 'good',
        category: 'opportunity',
        stats: [
          { value: milestone12.length, label: 'Clients' },
          { value: milestone12[0]?.sessionsToGo || 0, label: 'Sessions to go' },
        ],
      });
    }
  }

  // High-performing clinicians
  const clinicians = data.clinicians;
  const metrics = data.clinicianSyntheticMetrics;

  const topPerformers = clinicians.filter(c => {
    const m = metrics[c.id];
    return m && m.showRate >= THRESHOLDS.showRate.good && m.rebookRate >= THRESHOLDS.rebookRate.good;
  });

  if (topPerformers.length > 0) {
    const best = topPerformers[0];
    const bestMetrics = metrics[best.id];

    cards.push({
      id: 'top-performer',
      title: `${best.name} is Excelling`,
      aiGuidance: `With a ${bestMetrics?.showRate}% show rate and ${bestMetrics?.rebookRate}% rebook rate, consider having them mentor others or share best practices.`,
      action: 'View clinician details',
      status: 'good',
      category: 'insight',
      stats: [
        { value: `${bestMetrics?.showRate}%`, label: 'Show rate' },
        { value: `${bestMetrics?.rebookRate}%`, label: 'Rebook rate' },
      ],
    });
  }

  return cards;
}

/**
 * Generate revenue-related cards
 */
function generateRevenueCards(data: DemoData): PriorityCard[] {
  const cards: PriorityCard[] = [];
  const revenueData = data.monthlyData.revenue;

  if (revenueData.length < 2) return cards;

  // Compare recent months
  const currentMonth = revenueData[revenueData.length - 1];
  const priorMonth = revenueData[revenueData.length - 2];

  if (currentMonth && priorMonth && priorMonth.value > 0) {
    const growthRate = ((currentMonth.value - priorMonth.value) / priorMonth.value) * 100;

    if (growthRate < THRESHOLDS.revenueGrowth.warning) {
      cards.push({
        id: 'revenue-decline',
        title: `Revenue Down ${Math.abs(Math.round(growthRate))}% This Month`,
        aiGuidance: `Month-over-month revenue has declined. Check for increased cancellations, reduced caseloads, or seasonal patterns.`,
        action: 'View revenue analysis',
        status: growthRate < THRESHOLDS.revenueGrowth.critical ? 'critical' : 'warning',
        category: 'urgent',
        stats: [
          { value: `$${Math.round(currentMonth.value / 1000)}K`, label: 'Current' },
          { value: `$${Math.round(priorMonth.value / 1000)}K`, label: 'Prior' },
        ],
      });
    } else if (growthRate >= THRESHOLDS.revenueGrowth.good) {
      cards.push({
        id: 'revenue-growth',
        title: `Revenue Up ${Math.round(growthRate)}% This Month`,
        aiGuidance: `Great momentum! Consider what's driving this growth and how to sustain it.`,
        action: 'View revenue breakdown',
        status: 'good',
        category: 'insight',
        stats: [
          { value: `+${Math.round(growthRate)}%`, label: 'Growth' },
          { value: `$${Math.round(currentMonth.value / 1000)}K`, label: 'Revenue' },
        ],
      });
    }
  }

  return cards;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate all priority cards based on the complete demo data
 */
export function generatePriorityCards(data: DemoData): PriorityCard[] {
  const allCards: PriorityCard[] = [
    ...generateAtRiskCards(data),
    ...generateClinicianPerformanceCards(data),
    ...generateConsultationCards(data),
    ...generateRevenueCards(data),
    ...generateOpportunityCards(data),
  ];

  // Sort by priority: critical > warning > info > good
  const statusOrder: Record<PriorityCardStatus, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    good: 3,
  };

  const categoryOrder: Record<PriorityCardCategory, number> = {
    urgent: 0,
    attention: 1,
    opportunity: 2,
    insight: 3,
  };

  return allCards.sort((a, b) => {
    // First by status
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then by category
    return categoryOrder[a.category] - categoryOrder[b.category];
  });
}
