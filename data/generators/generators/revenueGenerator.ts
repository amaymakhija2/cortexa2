// =============================================================================
// REVENUE GENERATOR
// =============================================================================
// Aggregates payment data into monthly revenue breakdowns.
// Calculates gross revenue, costs, and net revenue.
// =============================================================================

import type {
  DemoConfiguration,
  PaymentRecord,
  MonthlyRevenueData,
  MonthlyRevenueBreakdownData,
  ClinicianRevenueData,
  Clinician,
  PracticeSettings,
  CohortLTVData,
  CohortLTVPoint,
} from '../types';

import type { ClientModel } from './clientGenerator';
import type { SessionRecord } from './paymentGenerator';

import { formatDate, getMonthRange, fromISO, startOfMonth, getMonthsBetween } from '../utils/dateUtils';

// =============================================================================
// REVENUE AGGREGATION
// =============================================================================

/**
 * Generates monthly revenue data (simple total)
 */
export function generateMonthlyRevenueData(
  payments: PaymentRecord[],
  config: DemoConfiguration
): MonthlyRevenueData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const revenueData: MonthlyRevenueData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Sum payments for this month
    const monthPayments = payments.filter(p => {
      const [m, d, y] = p.datePaid.split('/');
      const payDate = new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(d));
      return payDate >= monthStart && payDate <= monthEnd;
    });

    const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    revenueData.push({
      month: monthKey,
      value: total,
    });
  }

  return revenueData;
}

/**
 * Generates monthly revenue breakdown with costs
 */
export function generateMonthlyRevenueBreakdown(
  payments: PaymentRecord[],
  clinicians: Clinician[],
  config: DemoConfiguration
): MonthlyRevenueBreakdownData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);
  const financial = config.financial;

  // Build clinician lookup for take rates
  const clinicianTakeRates = new Map<string, number>();
  for (const c of clinicians) {
    clinicianTakeRates.set(c.id, c.takeRate);
  }

  const breakdownData: MonthlyRevenueBreakdownData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Filter payments for this month
    const monthPayments = payments.filter(p => {
      const [m, d, y] = p.datePaid.split('/');
      const payDate = new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(d));
      return payDate >= monthStart && payDate <= monthEnd;
    });

    const grossRevenue = monthPayments.reduce((sum, p) => sum + Math.max(0, p.amount), 0);

    // Calculate clinician costs based on each clinician's take rate
    let clinicianCosts = 0;
    for (const payment of monthPayments) {
      if (payment.amount > 0) {
        const takeRate = clinicianTakeRates.get(payment.clinicianId) || financial.clinicianTakeRate;
        clinicianCosts += payment.amount * takeRate;
      }
    }

    // Supervisor costs for supervised clinicians
    const supervisorCosts = grossRevenue * financial.supervisorCostRate * 0.3; // ~30% of sessions need supervision

    // Credit card fees
    const creditCardFees = grossRevenue * financial.creditCardFeeRate;

    // Net revenue
    const netRevenue = grossRevenue - clinicianCosts - supervisorCosts - creditCardFees;

    breakdownData.push({
      month: monthKey,
      grossRevenue: Math.round(grossRevenue),
      clinicianCosts: Math.round(clinicianCosts),
      supervisorCosts: Math.round(supervisorCosts),
      creditCardFees: Math.round(creditCardFees),
      netRevenue: Math.round(netRevenue),
    });
  }

  return breakdownData;
}

/**
 * Generates revenue breakdown by clinician per month
 */
export function generateClinicianRevenueData(
  payments: PaymentRecord[],
  clinicians: Clinician[],
  config: DemoConfiguration
): ClinicianRevenueData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const clinicianData: ClinicianRevenueData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Filter payments for this month
    const monthPayments = payments.filter(p => {
      const [m, d, y] = p.datePaid.split('/');
      const payDate = new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(d));
      return payDate >= monthStart && payDate <= monthEnd;
    });

    // Build the record with clinician last names as keys
    const record: ClinicianRevenueData = { month: monthKey };

    for (const clinician of clinicians) {
      const revenue = monthPayments
        .filter(p => p.clinicianId === clinician.id && p.amount > 0)
        .reduce((sum, p) => sum + p.amount, 0);
      record[clinician.lastName] = Math.round(revenue);
    }

    clinicianData.push(record);
  }

  return clinicianData;
}

// =============================================================================
// PRACTICE SETTINGS
// =============================================================================

/**
 * Generates practice settings from configuration and session data
 */
export function generatePracticeSettings(
  sessions: SessionRecord[],
  clients: ClientModel[],
  config: DemoConfiguration
): PracticeSettings {
  const metrics = config.performance.metrics;

  // Calculate actual rates from session data
  const totalSessions = sessions.length;
  const attended = sessions.filter(s => s.attended).length;
  const cancelled = sessions.filter(s => s.cancelled && !s.lateCancelled).length;
  const lateCancelled = sessions.filter(s => s.lateCancelled).length;
  const noShow = sessions.filter(s => s.noShow).length;

  // Capacity based on clinician caseloads
  const totalCapacity = config.clinicians.reduce(
    (sum, c) => sum + c.caseload.targetClients,
    0
  );

  // Current openings
  const activeClients = clients.filter(c => c.isActive).length;
  const currentOpenings = Math.max(0, totalCapacity - activeClients);

  return {
    capacity: totalCapacity,
    currentOpenings,
    attendance: {
      showRate: totalSessions > 0 ? Math.round((attended / totalSessions) * 100) / 100 : metrics.showRate,
      clientCancelled: totalSessions > 0 ? Math.round((cancelled / totalSessions) * 100) / 100 : metrics.cancelRate * 0.7,
      lateCancelled: totalSessions > 0 ? Math.round((lateCancelled / totalSessions) * 100) / 100 : metrics.cancelRate * 0.1,
      clinicianCancelled: totalSessions > 0 ? Math.round((cancelled * 0.2 / totalSessions) * 100) / 100 : metrics.cancelRate * 0.2,
      rebookRate: metrics.rebookRate,
    },
    outstandingNotesPercent: 1 - metrics.notesCompletionRate,
    churnWindowDays: 30,
  };
}

// =============================================================================
// LTV (LIFETIME VALUE) CALCULATIONS
// =============================================================================

/**
 * Generates cohort LTV data comparing current year to prior year
 */
export function generateCohortLTVData(
  clients: ClientModel[],
  sessions: SessionRecord[],
  config: DemoConfiguration
): CohortLTVData {
  const dataEnd = fromISO(config.dataRange.endDate);
  const currentYear = dataEnd.getFullYear();
  const priorYear = currentYear - 1;

  // Build client-to-revenue map
  const clientRevenue = new Map<string, number>();
  for (const session of sessions) {
    if (session.attended) {
      const current = clientRevenue.get(session.clientId) || 0;
      clientRevenue.set(session.clientId, current + session.amount);
    }
  }

  // Get clients by cohort year
  const currentYearClients = clients.filter(c =>
    c.startDate.getFullYear() === currentYear
  );
  const priorYearClients = clients.filter(c =>
    c.startDate.getFullYear() === priorYear
  );

  // Calculate LTV by month since acquisition
  const maxMonths = 24;
  const data: CohortLTVPoint[] = [];

  for (let month = 1; month <= maxMonths; month++) {
    // For each cohort, calculate cumulative revenue at month N
    const currentYearLTV = calculateCohortLTVAtMonth(
      currentYearClients,
      sessions,
      month,
      dataEnd
    );

    const priorYearLTV = calculateCohortLTVAtMonth(
      priorYearClients,
      sessions,
      month,
      dataEnd
    );

    data.push({
      month,
      currentYear: currentYearLTV,
      priorYear: priorYearLTV,
    });
  }

  // Calculate average LTV (at 12 months)
  const point12 = data.find(d => d.month === 12);

  return {
    currentYearLabel: currentYear.toString(),
    priorYearLabel: priorYear.toString(),
    currentYearAvgLTV: point12?.currentYear || 0,
    priorYearAvgLTV: point12?.priorYear || 0,
    data,
  };
}

/**
 * Calculate average LTV for a cohort at N months since acquisition
 */
function calculateCohortLTVAtMonth(
  cohortClients: ClientModel[],
  sessions: SessionRecord[],
  targetMonth: number,
  dataEnd: Date
): number | null {
  if (cohortClients.length === 0) return null;

  let totalRevenue = 0;
  let eligibleClients = 0;

  for (const client of cohortClients) {
    // Check if this client has been around long enough
    const monthsActive = getMonthsBetween(client.startDate, dataEnd);
    if (monthsActive < targetMonth) continue;

    eligibleClients++;

    // Sum revenue for first N months
    const cutoffDate = new Date(client.startDate);
    cutoffDate.setMonth(cutoffDate.getMonth() + targetMonth);

    const clientSessions = sessions.filter(s =>
      s.clientId === client.id &&
      s.attended &&
      s.date >= client.startDate &&
      s.date <= cutoffDate
    );

    const revenue = clientSessions.reduce((sum, s) => sum + s.amount, 0);
    totalRevenue += revenue;
  }

  if (eligibleClients === 0) return null;
  return Math.round(totalRevenue / eligibleClients);
}
