// =============================================================================
// ANALYSIS GENERATOR
// =============================================================================
// Generates practice analysis data: session timing heatmaps, churn breakdowns,
// LTV cohort comparisons, first session dropoff, and rebook rate trends.
// =============================================================================

import type {
  DemoConfiguration,
  Clinician,
  SessionTimingData,
  GenderBreakdown,
  FrequencyBreakdown,
  CohortLTVData,
  FirstSessionDropoffData,
  RebookRateData,
  CurrentHealthData,
} from '../types';

import type { ClientModel, Gender, SessionFrequency } from './clientGenerator';
import type { SessionRecord } from './paymentGenerator';

import { RandomFn, randomInt, varyValue } from '../utils/random';
import { fromISO, getMonthRange, formatDate, startOfMonth, getMonthsBetween } from '../utils/dateUtils';

// =============================================================================
// SESSION TIMING HEATMAP
// =============================================================================

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] as const;

/**
 * Base patterns for session distribution by day and hour
 * Values are relative weights (higher = more sessions typically scheduled)
 */
const SESSION_PATTERNS: Record<typeof DAYS[number], Record<number, number>> = {
  Mon: { 8: 30, 9: 45, 10: 60, 11: 70, 12: 80, 13: 65, 14: 75, 15: 85, 16: 95, 17: 105, 18: 90, 19: 55 },
  Tue: { 8: 40, 9: 70, 10: 80, 11: 90, 12: 95, 13: 75, 14: 85, 15: 100, 16: 110, 17: 120, 18: 105, 19: 70 },
  Wed: { 8: 45, 9: 75, 10: 90, 11: 100, 12: 110, 13: 85, 14: 95, 15: 105, 16: 115, 17: 130, 18: 120, 19: 80 },
  Thu: { 8: 50, 9: 80, 10: 95, 11: 110, 12: 120, 13: 90, 14: 105, 15: 115, 16: 130, 17: 145, 18: 135, 19: 95 },
  Fri: { 8: 55, 9: 85, 10: 100, 11: 95, 12: 105, 13: 80, 14: 70, 15: 60, 16: 50, 17: 40, 18: 25, 19: 15 },
  Sat: { 8: 10, 9: 30, 10: 45, 11: 40, 12: 35, 13: 20, 14: 10, 15: 5, 16: 0, 17: 0, 18: 0, 19: 0 },
  Sun: { 8: 0, 9: 5, 10: 15, 11: 20, 12: 15, 13: 10, 14: 5, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0 },
};

/**
 * Generates session timing heatmap data
 */
export function generateSessionTimingData(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): SessionTimingData[] {
  // Get attended sessions
  const attendedSessions = sessions.filter(s => s.attended);
  const totalSessions = attendedSessions.length;

  // Calculate scale factor based on session count
  // Patterns are designed for ~1000 sessions over the period
  const scaleFactor = totalSessions / 1000;

  const timingData: SessionTimingData[] = [];

  for (const day of DAYS) {
    for (const hour of HOURS) {
      const baseWeight = SESSION_PATTERNS[day][hour];
      // Scale and add some randomness
      const variance = 0.8 + random() * 0.4; // 80-120% variance
      const sessionCount = Math.round(baseWeight * scaleFactor * variance);

      timingData.push({
        day,
        hour,
        sessions: Math.max(0, sessionCount),
      });
    }
  }

  return timingData;
}

// =============================================================================
// CHURN BY DEMOGRAPHICS
// =============================================================================

/**
 * Generates churn breakdown by gender
 */
export function generateChurnByGender(
  clients: ClientModel[],
  config: DemoConfiguration
): GenderBreakdown {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Count churned clients by gender
  const churnedClients = clients.filter(c => c.endDate && c.endDate <= dataEnd);

  let male = 0;
  let female = 0;
  let other = 0;

  for (const client of churnedClients) {
    switch (client.gender) {
      case 'male':
        male++;
        break;
      case 'female':
        female++;
        break;
      case 'other':
        other++;
        break;
    }
  }

  return {
    male,
    female,
    other,
    total: male + female + other,
  };
}

/**
 * Generates churn breakdown by session frequency
 */
export function generateChurnByFrequency(
  clients: ClientModel[],
  config: DemoConfiguration
): FrequencyBreakdown {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Count churned clients by frequency
  const churnedClients = clients.filter(c => c.endDate && c.endDate <= dataEnd);

  let weekly = 0;
  let biweekly = 0;
  let monthly = 0;

  for (const client of churnedClients) {
    switch (client.frequency) {
      case 'weekly':
        weekly++;
        break;
      case 'biweekly':
        biweekly++;
        break;
      case 'monthly':
        monthly++;
        break;
    }
  }

  return {
    weekly,
    biweekly,
    monthly,
    total: weekly + biweekly + monthly,
  };
}

// =============================================================================
// COHORT LTV COMPARISON
// =============================================================================

/**
 * Generates cohort LTV comparison data (current year vs prior year)
 */
export function generateCohortLTVData(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): CohortLTVData {
  const dataEnd = fromISO(config.dataRange.endDate);
  const currentYear = dataEnd.getFullYear();
  const priorYear = currentYear - 1;
  const avgRate = config.financial.averageSessionRate;

  // Build session counts per client
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  // Get clients by cohort year
  const currentYearClients = clients.filter(c => c.startDate.getFullYear() === currentYear);
  const priorYearClients = clients.filter(c => c.startDate.getFullYear() === priorYear);

  // Calculate LTV at each month point
  const data: { month: number; currentYear: number | null; priorYear: number | null }[] = [];

  for (let month = 0; month <= 12; month++) {
    // Prior year always has full data
    const priorYearLTV = calculateCohortLTVAtMonth(
      priorYearClients,
      clientSessionCounts,
      month,
      avgRate,
      random
    );

    // Current year only has data for months that have passed
    const monthsElapsed = getMonthsBetween(
      new Date(currentYear, 0, 1),
      dataEnd
    );

    const currentYearLTV = month <= monthsElapsed
      ? calculateCohortLTVAtMonth(
          currentYearClients,
          clientSessionCounts,
          month,
          avgRate,
          random
        )
      : null;

    data.push({
      month,
      currentYear: currentYearLTV,
      priorYear: priorYearLTV,
    });
  }

  // Calculate average LTV for available months
  const currentYearAvgLTV = data
    .filter(d => d.currentYear !== null)
    .reduce((sum, d) => sum + (d.currentYear || 0), 0) /
    Math.max(1, data.filter(d => d.currentYear !== null).length);

  const priorYearAvgLTV = data
    .filter(d => d.priorYear !== null)
    .reduce((sum, d) => sum + (d.priorYear || 0), 0) / 13; // 0-12 months

  return {
    currentYearLabel: String(currentYear),
    priorYearLabel: String(priorYear),
    currentYearAvgLTV: Math.round(currentYearAvgLTV),
    priorYearAvgLTV: Math.round(priorYearAvgLTV),
    data,
  };
}

/**
 * Helper to calculate average LTV at a specific month point
 */
function calculateCohortLTVAtMonth(
  clients: ClientModel[],
  sessionCounts: Map<string, number>,
  targetMonth: number,
  avgRate: number,
  random: RandomFn
): number {
  if (clients.length === 0) return 0;

  // Simulate LTV curve (exponential decay in session accumulation)
  // Month 0: ~0.5 sessions, Month 1: ~2 sessions, Month 12: ~9 sessions
  const baseSessionsAtMonth = Math.min(
    9,
    0.5 + (targetMonth * 0.7) * (1 - Math.exp(-targetMonth * 0.15))
  );

  // Add some variance
  const variance = 0.9 + random() * 0.2;
  const sessionsAtMonth = baseSessionsAtMonth * variance;

  return Math.round(sessionsAtMonth * avgRate);
}

// =============================================================================
// FIRST SESSION DROP-OFF
// =============================================================================

/**
 * Generates first session drop-off data (Session 1 → Session 2)
 */
export function generateFirstSessionDropoff(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): FirstSessionDropoffData {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Build session counts per client
  const clientSessionCounts = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const count = clientSessionCounts.get(session.clientId) || 0;
      clientSessionCounts.set(session.clientId, count + 1);
    }
  }

  // Count clients with at least 1 session vs 2+ sessions
  const eligibleClients = clients.filter(c =>
    c.startDate <= dataEnd && getMonthsBetween(c.startDate, dataEnd) >= 1
  );

  let session1Count = 0;
  let session2Count = 0;

  for (const client of eligibleClients) {
    const sessions = clientSessionCounts.get(client.id) || 0;
    if (sessions >= 1) session1Count++;
    if (sessions >= 2) session2Count++;
  }

  // Industry benchmark for session 2 retention
  const benchmarkPercentage = 82;

  return {
    session1Count,
    session2Count,
    benchmarkPercentage,
  };
}

// =============================================================================
// REBOOK RATE TREND
// =============================================================================

/**
 * Generates monthly rebook rate trend data
 */
export function generateRebookRateTrend(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): RebookRateData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const baseRebookRate = config.performance.metrics.rebookRate;

  return months.map((month, idx) => {
    const monthKey = formatDate(month, 'Mon');

    // Add slight trend based on performance story
    const trend = config.performance.trend;
    let trendModifier = 0;
    if (trend === 'improving') {
      trendModifier = idx * 0.05; // Slight improvement each month
    } else if (trend === 'declining') {
      trendModifier = -idx * 0.05;
    }

    // Add some month-to-month variance
    const variance = -0.3 + random() * 0.6;

    const rate = Math.min(100, Math.max(70, baseRebookRate + trendModifier + variance));

    return {
      month: monthKey,
      rate: Math.round(rate * 10) / 10,
    };
  });
}

// =============================================================================
// CURRENT HEALTH DATA
// =============================================================================

/**
 * Generates current health summary data
 */
export function generateCurrentHealthData(
  rebookRateTrend: RebookRateData[],
  activeClientCount: number
): CurrentHealthData {
  // Calculate average rebook rate
  const avgRebookRate = rebookRateTrend.length > 0
    ? Math.round(
        (rebookRateTrend.reduce((sum, r) => sum + r.rate, 0) / rebookRateTrend.length) * 10
      ) / 10
    : 0;

  return {
    rebookRateData: rebookRateTrend,
    avgRebookRate,
    totalActiveClients: activeClientCount,
  };
}

// =============================================================================
// CHURN TIMING BREAKDOWN
// =============================================================================

export interface ChurnTimingData {
  month: string;
  earlyChurn: number;   // 0-3 months
  mediumChurn: number;  // 4-8 months
  lateChurn: number;    // 9+ months
}

/**
 * Generates monthly churn timing breakdown (early/medium/late)
 */
export function generateChurnTimingData(
  clients: ClientModel[],
  config: DemoConfiguration
): ChurnTimingData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get clients who churned this month
    const churnedThisMonth = clients.filter(c =>
      c.endDate && c.endDate >= monthStart && c.endDate <= monthEnd
    );

    let earlyChurn = 0;
    let mediumChurn = 0;
    let lateChurn = 0;

    for (const client of churnedThisMonth) {
      const tenure = getMonthsBetween(client.startDate, client.endDate!);

      if (tenure <= 3) {
        earlyChurn++;
      } else if (tenure <= 8) {
        mediumChurn++;
      } else {
        lateChurn++;
      }
    }

    return {
      month: monthKey,
      earlyChurn,
      mediumChurn,
      lateChurn,
    };
  });
}

// =============================================================================
// CHURN BY CLINICIAN (MONTHLY)
// =============================================================================

export interface ChurnByClinicianData {
  month: string;
  total: number;
  [clinicianName: string]: number | string;
}

/**
 * Generates monthly churn breakdown by clinician
 */
export function generateChurnByClinicianMonthly(
  clients: ClientModel[],
  clinicians: Clinician[],
  config: DemoConfiguration
): ChurnByClinicianData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  // Build clinician lookup
  const clinicianMap = new Map(clinicians.map(c => [c.id, c.shortName]));

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get clients who churned this month
    const churnedThisMonth = clients.filter(c =>
      c.endDate && c.endDate >= monthStart && c.endDate <= monthEnd
    );

    // Count by clinician
    const countByClinician: Record<string, number> = {};
    let total = 0;

    for (const clinician of clinicians) {
      countByClinician[clinician.shortName] = 0;
    }

    for (const client of churnedThisMonth) {
      const clinicianName = clinicianMap.get(client.clinicianId);
      if (clinicianName) {
        countByClinician[clinicianName]++;
        total++;
      }
    }

    return {
      month: monthKey,
      total,
      ...countByClinician,
    };
  });
}

// =============================================================================
// CLIENT DISTRIBUTION STATS
// =============================================================================

export interface ClientDistributionStats {
  byGender: { male: number; female: number; other: number };
  byFrequency: { weekly: number; biweekly: number; monthly: number };
}

/**
 * Calculates current client distribution by gender and frequency
 */
export function calculateClientDistribution(
  clients: ClientModel[],
  config: DemoConfiguration
): ClientDistributionStats {
  const dataEnd = fromISO(config.dataRange.endDate);

  // Active clients only
  const activeClients = clients.filter(c =>
    c.startDate <= dataEnd && (!c.endDate || c.endDate > dataEnd)
  );

  const byGender = { male: 0, female: 0, other: 0 };
  const byFrequency = { weekly: 0, biweekly: 0, monthly: 0 };

  for (const client of activeClients) {
    byGender[client.gender]++;
    byFrequency[client.frequency]++;
  }

  return { byGender, byFrequency };
}
