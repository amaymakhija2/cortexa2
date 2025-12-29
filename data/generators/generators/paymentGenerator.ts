// =============================================================================
// PAYMENT GENERATOR
// =============================================================================
// Generates payment records from client models.
// Each client generates sessions based on their frequency and tenure.
// =============================================================================

import type {
  DemoConfiguration,
  PaymentRecord,
  Clinician,
  PerformanceMetrics,
} from '../types';

import type { ClientModel } from './clientGenerator';

import {
  RandomFn,
  weightedChoice,
  randomInt,
  chance,
  varyValue,
} from '../utils/random';

import {
  addDays,
  formatDate,
  isWeekend,
  fromISO,
} from '../utils/dateUtils';

// =============================================================================
// CPT CODE CONFIGURATION
// =============================================================================

interface CptCodeConfig {
  code: string;
  weight: number;
  minAmount: number;
  maxAmount: number;
}

const CPT_CODES: CptCodeConfig[] = [
  { code: '90834', weight: 60, minAmount: 180, maxAmount: 220 },   // 45-min individual
  { code: '90837', weight: 20, minAmount: 220, maxAmount: 280 },   // 60-min individual
  { code: '90847', weight: 10, minAmount: 200, maxAmount: 260 },   // Family therapy
  { code: '90791', weight: 5, minAmount: 250, maxAmount: 350 },    // Diagnostic eval
  { code: '90834-95', weight: 3, minAmount: 180, maxAmount: 220 }, // Telehealth 45-min
  { code: '90837-95', weight: 2, minAmount: 220, maxAmount: 280 }, // Telehealth 60-min
];

/**
 * Get a random CPT code based on weights
 */
function getRandomCptCode(random: RandomFn): CptCodeConfig {
  const options = CPT_CODES.map(cpt => ({
    value: cpt,
    weight: cpt.weight,
  }));
  return weightedChoice(options, random);
}

/**
 * Get amount for a CPT code with some variance
 */
function getAmountForCpt(cpt: CptCodeConfig, avgRate: number, random: RandomFn): number {
  // Scale the range based on average session rate
  const rateMultiplier = avgRate / 200; // 200 is baseline
  const min = Math.round(cpt.minAmount * rateMultiplier);
  const max = Math.round(cpt.maxAmount * rateMultiplier);

  const amount = min + random() * (max - min);
  return Math.round(amount / 5) * 5; // Round to nearest $5
}

// =============================================================================
// SESSION GENERATION
// =============================================================================

export interface SessionRecord {
  clientId: string;
  clinicianId: string;
  date: Date;
  attended: boolean;
  cancelled: boolean;
  lateCancelled: boolean;
  noShow: boolean;
  cptCode: string;
  amount: number;
}

/**
 * Generates session records for a single client
 */
function generateClientSessions(
  client: ClientModel,
  clinician: Clinician,
  config: DemoConfiguration,
  random: RandomFn
): SessionRecord[] {
  const sessions: SessionRecord[] = [];
  const metrics = config.performance.metrics;
  const dataEnd = fromISO(config.dataRange.endDate);

  // Start from client's first session
  let sessionDate = new Date(client.startDate);
  const clientEnd = client.endDate || dataEnd;

  // Generate sessions at client's frequency
  while (sessionDate <= clientEnd && sessionDate <= dataEnd) {
    // Skip weekends - reschedule to Monday
    while (isWeekend(sessionDate)) {
      sessionDate = addDays(sessionDate, 1);
    }

    // Determine session outcome based on metrics
    const showRoll = random();
    const attended = showRoll < metrics.showRate;
    const noShow = !attended && showRoll < metrics.showRate + metrics.noShowRate;
    const cancelled = !attended && !noShow;
    const lateCancelled = cancelled && chance(0.15, random); // 15% of cancels are late

    // Get CPT code and amount (only for attended sessions)
    const cpt = getRandomCptCode(random);
    const amount = attended
      ? getAmountForCpt(cpt, config.financial.averageSessionRate, random)
      : 0;

    // Small chance of refund for attended sessions
    const isRefund = attended && chance(0.005, random);

    sessions.push({
      clientId: client.id,
      clinicianId: clinician.id,
      date: new Date(sessionDate),
      attended,
      cancelled,
      lateCancelled,
      noShow,
      cptCode: cpt.code,
      amount: isRefund ? -amount : amount,
    });

    // Move to next scheduled session with some variance
    const variance = randomInt(-2, 2, random);
    sessionDate = addDays(sessionDate, client.frequencyDays + variance);
  }

  return sessions;
}

/**
 * Converts session records to payment records
 * Only attended sessions become payments
 */
function sessionToPayment(
  session: SessionRecord,
  clinicianName: string
): PaymentRecord | null {
  if (!session.attended) return null;

  // Payment date is usually 1-3 days after appointment
  const datePaid = addDays(session.date, 1);

  return {
    clinicianId: session.clinicianId,
    clinician: clinicianName,
    datePaid: formatDate(datePaid, 'M/D/YY'),
    appointmentDate: formatDate(session.date, 'M/D/YY'),
    cptCode: session.cptCode,
    clientId: session.clientId,
    amount: session.amount,
  };
}

// =============================================================================
// MAIN GENERATION FUNCTIONS
// =============================================================================

/**
 * Generates all session records for all clients
 */
export function generateAllSessions(
  clientsByClinicianId: Map<string, ClientModel[]>,
  clinicians: Clinician[],
  config: DemoConfiguration,
  random: RandomFn
): SessionRecord[] {
  const allSessions: SessionRecord[] = [];

  for (const clinician of clinicians) {
    const clients = clientsByClinicianId.get(clinician.id) || [];

    for (const client of clients) {
      const sessions = generateClientSessions(client, clinician, config, random);
      allSessions.push(...sessions);

      // Update client's total sessions count
      client.totalSessions = sessions.filter(s => s.attended).length;
    }
  }

  // Sort by date
  allSessions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return allSessions;
}

/**
 * Generates payment records from session records
 */
export function generatePaymentRecords(
  sessions: SessionRecord[],
  clinicians: Clinician[]
): PaymentRecord[] {
  const clinicianMap = new Map(clinicians.map(c => [c.id, c.name]));
  const payments: PaymentRecord[] = [];

  for (const session of sessions) {
    const clinicianName = clinicianMap.get(session.clinicianId) || 'Unknown';
    const payment = sessionToPayment(session, clinicianName);
    if (payment) {
      payments.push(payment);
    }
  }

  return payments;
}

/**
 * Adds product sales to payment records (small percentage)
 */
export function addProductSales(
  payments: PaymentRecord[],
  clientsByClinicianId: Map<string, ClientModel[]>,
  clinicians: Clinician[],
  config: DemoConfiguration,
  random: RandomFn
): PaymentRecord[] {
  const productCount = Math.floor(payments.length * 0.002); // 0.2% are products
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const dateRange = dataEnd.getTime() - dataStart.getTime();

  for (let i = 0; i < productCount; i++) {
    const clinician = clinicians[randomInt(0, clinicians.length - 1, random)];
    const clients = clientsByClinicianId.get(clinician.id) || [];
    if (clients.length === 0) continue;

    const client = clients[randomInt(0, clients.length - 1, random)];
    const saleDate = new Date(dataStart.getTime() + random() * dateRange);

    payments.push({
      clinicianId: clinician.id,
      clinician: clinician.name,
      datePaid: formatDate(saleDate, 'M/D/YY'),
      appointmentDate: '',
      cptCode: 'Product',
      clientId: client.id,
      amount: Math.round((50 + random() * 150) / 5) * 5,
    });
  }

  // Re-sort after adding products
  payments.sort((a, b) => {
    const parseDate = (d: string) => {
      if (!d) return new Date(0);
      const [m, day, y] = d.split('/');
      return new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(day));
    };
    return parseDate(a.datePaid).getTime() - parseDate(b.datePaid).getTime();
  });

  return payments;
}

// =============================================================================
// SESSION AGGREGATION HELPERS
// =============================================================================

export interface MonthlySessionAggregate {
  month: string;
  total: number;
  attended: number;
  cancelled: number;
  lateCancelled: number;
  noShow: number;
  byClinicianId: Map<string, number>;
}

/**
 * Aggregates sessions by month
 */
export function aggregateSessionsByMonth(
  sessions: SessionRecord[]
): MonthlySessionAggregate[] {
  const byMonth = new Map<string, MonthlySessionAggregate>();

  for (const session of sessions) {
    const monthKey = formatDate(session.date, 'Mon YYYY');

    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        month: monthKey,
        total: 0,
        attended: 0,
        cancelled: 0,
        lateCancelled: 0,
        noShow: 0,
        byClinicianId: new Map(),
      });
    }

    const agg = byMonth.get(monthKey)!;
    agg.total++;

    if (session.attended) agg.attended++;
    if (session.cancelled) agg.cancelled++;
    if (session.lateCancelled) agg.lateCancelled++;
    if (session.noShow) agg.noShow++;

    // Track by clinician
    const clinicianCount = agg.byClinicianId.get(session.clinicianId) || 0;
    agg.byClinicianId.set(session.clinicianId, clinicianCount + (session.attended ? 1 : 0));
  }

  // Sort by date and return as array
  return Array.from(byMonth.values()).sort((a, b) => {
    const parseMonth = (m: string) => {
      const [mon, year] = m.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return new Date(parseInt(year), months.indexOf(mon), 1);
    };
    return parseMonth(a.month).getTime() - parseMonth(b.month).getTime();
  });
}
