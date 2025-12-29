// =============================================================================
// ADMIN GENERATOR
// =============================================================================
// Generates admin/compliance data: notes status, claims, A/R aging, reminders.
// =============================================================================

import type {
  DemoConfiguration,
  NotesStatusData,
  ClaimsStatusData,
  ARAgingData,
  ReminderDeliveryData,
  ComplianceRisk,
  TopPastDueClient,
  Clinician,
} from '../types';

import type { ClientModel } from './clientGenerator';
import type { SessionRecord } from './paymentGenerator';

import { RandomFn, randomInt, chance, randomChoice } from '../utils/random';
import { generateInitials } from '../utils/nameGenerator';
import {
  formatDate,
  getMonthRange,
  fromISO,
  startOfMonth,
  addDays,
} from '../utils/dateUtils';

// =============================================================================
// NOTES STATUS
// =============================================================================

/**
 * Generates monthly notes status data
 */
export function generateNotesStatusData(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): NotesStatusData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const notesCompletionRate = config.performance.metrics.notesCompletionRate;
  const notesOverdueRate = config.performance.metrics.notesOverdueRate;

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Count attended sessions this month
    const monthSessions = sessions.filter(s =>
      s.attended && s.date >= monthStart && s.date <= monthEnd
    ).length;

    // Calculate note statuses
    const locked = Math.round(monthSessions * notesCompletionRate * 0.95); // Most completed are locked
    const unlocked = Math.round(monthSessions * notesCompletionRate * 0.05); // Some still unlocked
    const noNote = monthSessions - locked - unlocked;

    return {
      month: monthKey,
      noNote: Math.max(0, noNote),
      unlocked: Math.max(0, unlocked),
      locked: Math.max(0, locked),
    };
  });
}

// =============================================================================
// CLAIMS STATUS
// =============================================================================

/**
 * Generates monthly claims status data
 */
export function generateClaimsStatusData(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): ClaimsStatusData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const insurancePercent = config.financial.payerMix.insurance / 100;

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Count attended sessions this month
    const monthSessions = sessions.filter(s =>
      s.attended && s.date >= monthStart && s.date <= monthEnd
    ).length;

    // Only insurance sessions become claims
    const totalClaims = Math.round(monthSessions * insurancePercent);

    // Typical claim outcome distribution
    const paid = Math.round(totalClaims * 0.82);
    const rejected = Math.round(totalClaims * 0.08);
    const denied = Math.round(totalClaims * 0.05);
    const deductible = totalClaims - paid - rejected - denied;

    return {
      month: monthKey,
      paid: Math.max(0, paid),
      rejected: Math.max(0, rejected),
      denied: Math.max(0, denied),
      deductible: Math.max(0, deductible),
    };
  });
}

// =============================================================================
// A/R AGING
// =============================================================================

/**
 * Generates monthly A/R aging data
 */
export function generateARAgingData(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): ARAgingData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const avgRate = config.financial.averageSessionRate;

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Count attended sessions this month
    const monthSessions = sessions.filter(s =>
      s.attended && s.date >= monthStart && s.date <= monthEnd
    ).length;

    // Estimate outstanding A/R (typically 5-15% of monthly revenue)
    const monthlyRevenue = monthSessions * avgRate;
    const outstandingPercent = 0.05 + random() * 0.10;
    const totalOutstanding = Math.round(monthlyRevenue * outstandingPercent);

    // Age distribution
    const current = Math.round(totalOutstanding * 0.45);
    const days1_30 = Math.round(totalOutstanding * 0.30);
    const days31_60 = Math.round(totalOutstanding * 0.15);
    const days61_plus = totalOutstanding - current - days1_30 - days31_60;

    return {
      month: monthKey,
      current: Math.max(0, current),
      days1_30: Math.max(0, days1_30),
      days31_60: Math.max(0, days31_60),
      days61_plus: Math.max(0, days61_plus),
    };
  });
}

// =============================================================================
// REMINDER DELIVERY
// =============================================================================

/**
 * Generates monthly reminder delivery data
 */
export function generateReminderDeliveryData(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): ReminderDeliveryData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  return months.map(month => {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Count total sessions (reminders sent for all booked, not just attended)
    const monthSessions = sessions.filter(s =>
      s.date >= monthStart && s.date <= monthEnd
    ).length;

    // Typically 2-3 reminders per session
    const reminderMultiplier = 2 + random();
    const sent = Math.round(monthSessions * reminderMultiplier);

    // Small failure rate (1-3%)
    const failureRate = 0.01 + random() * 0.02;
    const failed = Math.round(sent * failureRate);

    return {
      month: monthKey,
      sent: Math.max(0, sent),
      failed: Math.max(0, failed),
    };
  });
}

// =============================================================================
// COMPLIANCE RISKS
// =============================================================================

/**
 * Generates list of compliance risks (sessions without notes)
 */
export function generateComplianceRisks(
  sessions: SessionRecord[],
  clients: ClientModel[],
  clinicians: Clinician[],
  config: DemoConfiguration,
  random: RandomFn
): ComplianceRisk[] {
  const dataEnd = fromISO(config.dataRange.endDate);
  const notesOverdueRate = config.performance.metrics.notesOverdueRate;

  // Build lookups
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const clinicianMap = new Map(clinicians.map(c => [c.id, c]));

  // Get recent sessions (last 14 days)
  const recentSessions = sessions.filter(s => {
    if (!s.attended) return false;
    const daysSince = Math.floor((dataEnd.getTime() - s.date.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 14 && daysSince >= 0;
  });

  // Select some as overdue based on rate
  const overdueCount = Math.round(recentSessions.length * notesOverdueRate);
  const overdueSessionsindices = new Set<number>();

  while (overdueSessionsindices.size < overdueCount && overdueSessionsindices.size < recentSessions.length) {
    overdueSessionsindices.add(randomInt(0, recentSessions.length - 1, random));
  }

  const risks: ComplianceRisk[] = [];

  for (const idx of overdueSessionsindices) {
    const session = recentSessions[idx];
    const client = clientMap.get(session.clientId);
    const clinician = clinicianMap.get(session.clinicianId);

    if (client && clinician) {
      risks.push({
        date: formatDate(session.date, 'YYYY-MM-DD'),
        clientInitials: generateInitials(client.name),
        clinician: clinician.name,
      });
    }
  }

  // Sort by date (most recent first)
  return risks.sort((a, b) => b.date.localeCompare(a.date));
}

// =============================================================================
// TOP PAST DUE CLIENTS
// =============================================================================

/**
 * Generates list of clients with highest past due balances
 */
export function generateTopPastDueClients(
  clients: ClientModel[],
  config: DemoConfiguration,
  random: RandomFn
): TopPastDueClient[] {
  const dataEnd = fromISO(config.dataRange.endDate);
  const avgRate = config.financial.averageSessionRate;

  // Select some active clients to have past due balances
  const activeClients = clients.filter(c =>
    c.isActive && (!c.endDate || c.endDate > dataEnd)
  );

  // About 5-10% of clients have past due balances
  const pastDueCount = Math.round(activeClients.length * (0.05 + random() * 0.05));
  const pastDueClients: TopPastDueClient[] = [];

  const buckets = ['1-30 days', '31-60 days', '61-90 days', '90+ days'];

  for (let i = 0; i < pastDueCount && i < activeClients.length; i++) {
    const client = activeClients[randomInt(0, activeClients.length - 1, random)];

    // Generate balance (1-5 sessions worth)
    const sessionCount = 1 + randomInt(0, 4, random);
    const balance = sessionCount * avgRate;

    // Assign to aging bucket (weighted toward newer)
    const bucketWeights = [50, 30, 15, 5];
    let roll = random() * 100;
    let bucket = buckets[0];
    for (let b = 0; b < buckets.length; b++) {
      roll -= bucketWeights[b];
      if (roll <= 0) {
        bucket = buckets[b];
        break;
      }
    }

    pastDueClients.push({
      name: client.name,
      balance: Math.round(balance),
      worstBucket: bucket,
    });
  }

  // Sort by balance (highest first) and dedupe by name
  const seen = new Set<string>();
  return pastDueClients
    .sort((a, b) => b.balance - a.balance)
    .filter(c => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    })
    .slice(0, 10);
}

// =============================================================================
// OUTSTANDING CLAIMS
// =============================================================================

/**
 * Generates summary of outstanding claims by category
 */
export function generateOutstandingClaims(
  sessions: SessionRecord[],
  config: DemoConfiguration,
  random: RandomFn
): { category: string; amount: number }[] {
  const dataEnd = fromISO(config.dataRange.endDate);
  const avgRate = config.financial.averageSessionRate;
  const insurancePercent = config.financial.payerMix.insurance / 100;

  // Get recent sessions (last 60 days for outstanding claims)
  const recentSessions = sessions.filter(s => {
    if (!s.attended) return false;
    const daysSince = Math.floor((dataEnd.getTime() - s.date.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 60 && daysSince >= 0;
  });

  const insuranceSessions = Math.round(recentSessions.length * insurancePercent);
  const totalClaimsValue = insuranceSessions * avgRate;

  // Distribution of outstanding claims
  const categories = [
    { category: 'Pending', percent: 0.35 },
    { category: 'In Review', percent: 0.25 },
    { category: 'Awaiting Info', percent: 0.20 },
    { category: 'Appealed', percent: 0.12 },
    { category: 'Denied - Pending Action', percent: 0.08 },
  ];

  // Only about 10-20% of claims are outstanding at any time
  const outstandingPercent = 0.10 + random() * 0.10;
  const totalOutstanding = totalClaimsValue * outstandingPercent;

  return categories.map(cat => ({
    category: cat.category,
    amount: Math.round(totalOutstanding * cat.percent),
  }));
}
