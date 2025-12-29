// =============================================================================
// RETENTION GENERATOR
// =============================================================================
// Generates retention funnels, cohort data, and frequency correlation analysis.
// =============================================================================

import type {
  DemoConfiguration,
  RetentionCohort,
  RetentionFunnelData,
  RetentionFunnelPoint,
  RetentionBenchmarks,
  FrequencyRetentionData,
  Clinician,
} from '../types';

import type { ClientModel, SessionFrequency } from './clientGenerator';
import type { SessionRecord } from './paymentGenerator';

import { fromISO, getMonthsBetween, getDaysBetween, formatDate } from '../utils/dateUtils';

// =============================================================================
// INDUSTRY BENCHMARKS
// =============================================================================

const INDUSTRY_BENCHMARKS = {
  session2: 85,
  session5: 70,
  session12: 55,
  session24: 40,
  month1: 90,
  month3: 75,
  month6: 60,
  month12: 45,
};

/**
 * Helper to safely filter clients, ensuring each has required properties
 */
function safeFilterClients(
  clients: ClientModel[],
  predicate: (c: ClientModel) => boolean
): ClientModel[] {
  return clients.filter(c => c && c.startDate && predicate(c));
}

// =============================================================================
// COHORT GENERATION
// =============================================================================

/**
 * Generates retention cohorts for analysis
 */
export function generateRetentionCohorts(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): RetentionCohort[] {
  const dataEnd = fromISO(config.dataRange.endDate);
  const currentYear = dataEnd.getFullYear();

  // Build session counts per client
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  // Define cohort periods
  const cohortDefinitions = [
    {
      id: 'all-time',
      label: 'All Time',
      sublabel: `${config.dataRange.startDate.slice(0, 4)} - Present`,
      filter: (_c: ClientModel) => true,
      maturity: 'mature' as const,
      recommended: true,
    },
    {
      id: 'current-year',
      label: `${currentYear} Cohort`,
      sublabel: `Clients who started in ${currentYear}`,
      filter: (c: ClientModel) => c.startDate.getFullYear() === currentYear,
      maturity: 'maturing' as const,
    },
    {
      id: 'prior-year',
      label: `${currentYear - 1} Cohort`,
      sublabel: `Clients who started in ${currentYear - 1}`,
      filter: (c: ClientModel) => c.startDate.getFullYear() === currentYear - 1,
      maturity: 'mature' as const,
    },
    {
      id: 'last-6-months',
      label: 'Last 6 Months',
      sublabel: 'Recent acquisitions',
      filter: (c: ClientModel) => getMonthsBetween(c.startDate, dataEnd) <= 6,
      maturity: 'immature' as const,
    },
  ];

  return cohortDefinitions.map(def => {
    const cohortClients = clients.filter(c =>
      c && c.startDate && c.startDate <= dataEnd && def.filter(c)
    );

    const churned = cohortClients.filter(c => c.endDate && c.endDate <= dataEnd);
    const active = cohortClients.filter(c => !c.endDate || c.endDate > dataEnd);

    // Calculate average sessions per client
    let totalSessions = 0;
    for (const client of cohortClients) {
      totalSessions += clientSessionCounts.get(client.id) || 0;
    }

    return {
      id: def.id,
      label: def.label,
      sublabel: def.sublabel,
      clientCount: cohortClients.length,
      maturity: def.maturity,
      recommended: def.recommended,
      summary: {
        clientsAcquired: cohortClients.length,
        clientsChurned: churned.length,
        activeClients: active.length,
        avgSessionsPerClient: cohortClients.length > 0
          ? Math.round((totalSessions / cohortClients.length) * 10) / 10
          : 0,
      },
    };
  });
}

// =============================================================================
// RETENTION FUNNELS
// =============================================================================

/**
 * Generates session-based and time-based retention funnels
 */
export function generateRetentionFunnels(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): RetentionFunnelData {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Build session counts per client
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  // Only include clients who have been around long enough
  const eligibleClients = clients.filter(c =>
    c && c.startDate && c.startDate <= dataEnd && getMonthsBetween(c.startDate, dataEnd) >= 1
  );

  const totalClients = eligibleClients.length;
  if (totalClients === 0) {
    return {
      sessionsFunnel: [],
      timeFunnel: [],
    };
  }

  // Session-based funnel
  const sessionMilestones = [
    { label: 'Session 1', threshold: 1, industryAvg: 100 },
    { label: 'Session 2', threshold: 2, industryAvg: INDUSTRY_BENCHMARKS.session2 },
    { label: 'Session 5', threshold: 5, industryAvg: INDUSTRY_BENCHMARKS.session5 },
    { label: 'Session 12', threshold: 12, industryAvg: INDUSTRY_BENCHMARKS.session12 },
    { label: 'Session 24', threshold: 24, industryAvg: INDUSTRY_BENCHMARKS.session24 },
  ];

  const sessionsFunnel: RetentionFunnelPoint[] = sessionMilestones.map(milestone => {
    const reached = eligibleClients.filter(c => {
      const sessions = clientSessionCounts.get(c.id) || 0;
      return sessions >= milestone.threshold;
    }).length;

    return {
      label: milestone.label,
      count: reached,
      percentage: Math.round((reached / totalClients) * 100),
      industryAvg: milestone.industryAvg,
    };
  });

  // Time-based funnel (clients who stayed X months)
  const timeMilestones = [
    { label: 'Month 1', months: 1, industryAvg: INDUSTRY_BENCHMARKS.month1 },
    { label: 'Month 3', months: 3, industryAvg: INDUSTRY_BENCHMARKS.month3 },
    { label: 'Month 6', months: 6, industryAvg: INDUSTRY_BENCHMARKS.month6 },
    { label: 'Month 12', months: 12, industryAvg: INDUSTRY_BENCHMARKS.month12 },
  ];

  const timeFunnel: RetentionFunnelPoint[] = timeMilestones.map(milestone => {
    // Only count clients who have been around long enough to be evaluated
    const evaluableClients = eligibleClients.filter(c =>
      getMonthsBetween(c.startDate, dataEnd) >= milestone.months
    );

    if (evaluableClients.length === 0) {
      return {
        label: milestone.label,
        count: 0,
        percentage: 0,
        industryAvg: milestone.industryAvg,
      };
    }

    const retained = evaluableClients.filter(c => {
      if (!c.endDate) return true; // Still active
      const tenure = getMonthsBetween(c.startDate, c.endDate);
      return tenure >= milestone.months;
    }).length;

    return {
      label: milestone.label,
      count: retained,
      percentage: Math.round((retained / evaluableClients.length) * 100),
      industryAvg: milestone.industryAvg,
    };
  });

  return { sessionsFunnel, timeFunnel };
}

// =============================================================================
// RETENTION BENCHMARKS
// =============================================================================

/**
 * Calculates practice-wide retention benchmarks
 */
export function generateRetentionBenchmarks(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): RetentionBenchmarks {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Build session counts
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  const eligibleClients = safeFilterClients(clients, c => c.startDate <= dataEnd);
  const churnedClients = eligibleClients.filter(c => c.endDate && c.endDate <= dataEnd);

  // Calculate average churn rate
  const avgChurnRate = eligibleClients.length > 0
    ? Math.round((churnedClients.length / eligibleClients.length) * 100)
    : 0;

  // Calculate average tenure
  const tenures = eligibleClients.map(c => {
    const end = c.endDate && c.endDate <= dataEnd ? c.endDate : dataEnd;
    return getMonthsBetween(c.startDate, end);
  });
  const avgClientTenure = tenures.length > 0
    ? Math.round((tenures.reduce((a, b) => a + b, 0) / tenures.length) * 10) / 10
    : 0;

  // Calculate session 5 retention
  const clientsWithEnoughTime = eligibleClients.filter(c =>
    getMonthsBetween(c.startDate, dataEnd) >= 2
  );
  const reachedSession5 = clientsWithEnoughTime.filter(c =>
    (clientSessionCounts.get(c.id) || 0) >= 5
  ).length;
  const avgSession5Retention = clientsWithEnoughTime.length > 0
    ? Math.round((reachedSession5 / clientsWithEnoughTime.length) * 100)
    : 0;

  // Frequency multiplier (how much longer weekly clients stay vs monthly)
  const weeklyTenures = eligibleClients
    .filter(c => c.frequency === 'weekly')
    .map(c => getMonthsBetween(c.startDate, c.endDate || dataEnd));
  const monthlyTenures = eligibleClients
    .filter(c => c.frequency === 'monthly')
    .map(c => getMonthsBetween(c.startDate, c.endDate || dataEnd));

  const avgWeekly = weeklyTenures.length > 0
    ? weeklyTenures.reduce((a, b) => a + b, 0) / weeklyTenures.length
    : 0;
  const avgMonthly = monthlyTenures.length > 0
    ? monthlyTenures.reduce((a, b) => a + b, 0) / monthlyTenures.length
    : 0;

  const multiplierLow = avgMonthly > 0 ? (avgWeekly / avgMonthly * 0.9).toFixed(1) : '1.5';
  const multiplierHigh = avgMonthly > 0 ? (avgWeekly / avgMonthly * 1.1).toFixed(1) : '2.5';

  return {
    avgChurnRate,
    avgClientTenure,
    avgSession5Retention,
    frequencyMultiplierRange: `${multiplierLow}x-${multiplierHigh}x`,
  };
}

// =============================================================================
// FREQUENCY CORRELATION
// =============================================================================

/**
 * Generates frequency vs retention correlation data
 */
export function generateFrequencyCorrelation(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): FrequencyRetentionData[] {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Build session counts
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  const frequencies: SessionFrequency[] = ['weekly', 'biweekly', 'monthly'];
  const labels: Record<SessionFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  };

  return frequencies.map(freq => {
    const freqClients = safeFilterClients(clients, c =>
      c.frequency === freq && c.startDate <= dataEnd
    );

    if (freqClients.length === 0) {
      return {
        frequency: freq,
        label: labels[freq],
        avgSessions: 0,
        clientCount: 0,
        avgTenureMonths: 0,
      };
    }

    // Average sessions
    let totalSessions = 0;
    for (const client of freqClients) {
      totalSessions += clientSessionCounts.get(client.id) || 0;
    }
    const avgSessions = Math.round((totalSessions / freqClients.length) * 10) / 10;

    // Average tenure
    const tenures = freqClients.map(c => {
      const end = c.endDate && c.endDate <= dataEnd ? c.endDate : dataEnd;
      return getMonthsBetween(c.startDate, end);
    });
    const avgTenureMonths = Math.round(
      (tenures.reduce((a, b) => a + b, 0) / tenures.length) * 10
    ) / 10;

    return {
      frequency: freq,
      label: labels[freq],
      avgSessions,
      clientCount: freqClients.length,
      avgTenureMonths,
    };
  });
}

// =============================================================================
// CHURN BY CLINICIAN
// =============================================================================

/**
 * Calculates churn rate by clinician
 */
export function generateChurnByClinician(
  clients: ClientModel[],
  clinicians: Clinician[],
  config: DemoConfiguration
): Record<string, { churnRate: number; churned: number; total: number }> {
  const dataEnd = fromISO(config.dataRange.endDate);
  const result: Record<string, { churnRate: number; churned: number; total: number }> = {};

  for (const clinician of clinicians) {
    const clinicianClients = safeFilterClients(clients, c =>
      c.clinicianId === clinician.id && c.startDate <= dataEnd
    );

    const churned = clinicianClients.filter(c =>
      c.endDate && c.endDate <= dataEnd
    ).length;

    const total = clinicianClients.length;
    const churnRate = total > 0 ? Math.round((churned / total) * 100) : 0;

    result[clinician.id] = { churnRate, churned, total };
  }

  return result;
}
