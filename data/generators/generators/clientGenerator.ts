// =============================================================================
// CLIENT GENERATOR
// =============================================================================
// Generates client models with realistic lifecycles, session patterns, and churn.
// These models are the foundation for payment and session data generation.
// =============================================================================

import type {
  DemoConfiguration,
  ClinicianConfig,
  PerformanceMetrics,
} from '../types';

import {
  RandomFn,
  weightedChoice,
  randomInt,
  chance,
  varyValue,
} from '../utils/random';

import {
  generateClientId,
  generateClientName,
} from '../utils/nameGenerator';

import {
  addDays,
  addMonths,
  fromISO,
  getDaysBetween,
  startOfMonth,
} from '../utils/dateUtils';

// =============================================================================
// CLIENT MODEL TYPES
// =============================================================================

export type SessionFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface ClientModel {
  id: string;
  name: string;
  clinicianId: string;
  startDate: Date;
  endDate: Date | null;  // null = still active
  frequency: SessionFrequency;
  frequencyDays: number;
  gender: 'male' | 'female' | 'other';
  isActive: boolean;
  totalSessions: number;  // Will be calculated after session generation
}

// =============================================================================
// FREQUENCY CONFIGURATION
// =============================================================================

const FREQUENCY_CONFIG: Record<SessionFrequency, { days: number; weight: number }> = {
  weekly: { days: 7, weight: 50 },
  biweekly: { days: 14, weight: 35 },
  monthly: { days: 28, weight: 15 },
};

/**
 * Get a random session frequency based on weights
 */
function getRandomFrequency(random: RandomFn): { frequency: SessionFrequency; days: number } {
  const options = Object.entries(FREQUENCY_CONFIG).map(([freq, config]) => ({
    value: freq as SessionFrequency,
    weight: config.weight,
  }));

  const frequency = weightedChoice(options, random);
  return {
    frequency,
    days: FREQUENCY_CONFIG[frequency].days,
  };
}

/**
 * Get a random gender with realistic distribution
 */
function getRandomGender(random: RandomFn): 'male' | 'female' | 'other' {
  // Therapy clients tend to skew female (~65%)
  const options = [
    { value: 'female' as const, weight: 65 },
    { value: 'male' as const, weight: 32 },
    { value: 'other' as const, weight: 3 },
  ];
  return weightedChoice(options, random);
}

// =============================================================================
// CHURN MODELING
// =============================================================================

/**
 * Determines when (if ever) a client will churn based on performance metrics
 * Returns null if client will remain active through the data range
 */
function determineChurnDate(
  startDate: Date,
  endDate: Date,
  metrics: PerformanceMetrics,
  random: RandomFn
): Date | null {
  // Monthly churn rate from performance metrics (e.g., 0.03 = 3%)
  const monthlyChurnRate = metrics.monthlyChurnRate;

  // Calculate churn timing distribution based on session retention
  // Lower session2 retention = more early churn
  const earlyChurnProb = (100 - metrics.sessionRetention.session2) / 100;
  const midChurnProb = (metrics.sessionRetention.session2 - metrics.sessionRetention.session12) / 100;

  // Roll for churn type
  const roll = random();

  if (roll < earlyChurnProb * 0.8) {
    // Early churn: 1-3 months
    const months = 1 + randomInt(0, 2, random);
    const churnDate = addMonths(startDate, months);
    return churnDate <= endDate ? churnDate : null;
  } else if (roll < (earlyChurnProb + midChurnProb) * 0.6) {
    // Medium churn: 4-12 months
    const months = 4 + randomInt(0, 8, random);
    const churnDate = addMonths(startDate, months);
    return churnDate <= endDate ? churnDate : null;
  } else if (roll < 0.35) {
    // Late churn: 12-24 months
    const months = 12 + randomInt(0, 12, random);
    const churnDate = addMonths(startDate, months);
    return churnDate <= endDate ? churnDate : null;
  }

  // ~65% stay active or churn beyond data range
  // Apply random monthly churn for remaining months
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (chance(monthlyChurnRate * 0.3, random)) {
      // Add some randomness within the month
      const dayOffset = randomInt(1, 28, random);
      const churnDate = addDays(startOfMonth(currentDate), dayOffset);
      return churnDate <= endDate ? churnDate : null;
    }
    currentDate = addMonths(currentDate, 1);
  }

  return null; // Client stays active
}

// =============================================================================
// CLIENT GENERATION
// =============================================================================

/**
 * Generates clients for a single clinician over the data range
 */
export function generateClientsForClinician(
  clinician: ClinicianConfig,
  config: DemoConfiguration,
  random: RandomFn
): ClientModel[] {
  const clients: ClientModel[] = [];
  const metrics = config.performance.metrics;

  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const clinicianStart = fromISO(clinician.startDate);

  // Start generating clients from the later of data start or clinician start
  const effectiveStart = clinicianStart > dataStart ? clinicianStart : dataStart;

  // Target caseload and monthly new clients
  const targetCaseload = clinician.caseload.targetClients;
  const monthlyNewClients = metrics.newClientsPerMonth / config.clinicians.length;

  // Track active clients month by month
  let activeClients: ClientModel[] = [];
  let currentMonth = startOfMonth(effectiveStart);

  while (currentMonth <= dataEnd) {
    // Remove churned clients
    activeClients = activeClients.filter(c => {
      if (c.endDate && c.endDate <= currentMonth) {
        c.isActive = false;
        return false;
      }
      return true;
    });

    // Calculate how many new clients we need
    const currentCount = activeClients.length;
    const shortage = Math.max(0, targetCaseload - currentCount);

    // Add new clients based on shortage and monthly rate
    const newClientsThisMonth = Math.min(
      shortage,
      Math.round(varyValue(monthlyNewClients, 0.5, random))
    );

    for (let i = 0; i < newClientsThisMonth; i++) {
      // Random start day within the month
      const startDay = randomInt(1, 28, random);
      const clientStart = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        startDay
      );

      // Don't add clients that would start after data range
      if (clientStart > dataEnd) continue;

      const { frequency, days } = getRandomFrequency(random);
      const churnDate = determineChurnDate(clientStart, dataEnd, metrics, random);

      const client: ClientModel = {
        id: generateClientId(random),
        name: generateClientName(random),
        clinicianId: clinician.id,
        startDate: clientStart,
        endDate: churnDate,
        frequency,
        frequencyDays: days,
        gender: getRandomGender(random),
        isActive: churnDate === null || churnDate > dataEnd,
        totalSessions: 0, // Calculated later
      };

      clients.push(client);
      activeClients.push(client);
    }

    // Move to next month
    currentMonth = addMonths(currentMonth, 1);
  }

  return clients;
}

/**
 * Generates all clients for all clinicians
 */
export function generateAllClients(
  config: DemoConfiguration,
  random: RandomFn
): Map<string, ClientModel[]> {
  const clientsByClinicianId = new Map<string, ClientModel[]>();

  for (const clinician of config.clinicians) {
    if (!clinician.isActive) continue;

    const clients = generateClientsForClinician(clinician, config, random);
    clientsByClinicianId.set(clinician.id, clients);
  }

  return clientsByClinicianId;
}

/**
 * Gets all clients as a flat array
 */
export function getAllClientsFlat(
  clientsByClinicianId: Map<string, ClientModel[]>
): ClientModel[] {
  const allClients: ClientModel[] = [];
  for (const clients of clientsByClinicianId.values()) {
    allClients.push(...clients);
  }
  return allClients;
}

/**
 * Gets active clients as of a specific date
 */
export function getActiveClientsOnDate(
  clients: ClientModel[],
  date: Date
): ClientModel[] {
  return clients.filter(c => {
    if (c.startDate > date) return false;
    if (c.endDate && c.endDate <= date) return false;
    return true;
  });
}

/**
 * Calculates days since last session for a client
 * (Used for at-risk detection)
 */
export function getDaysSinceLastSession(
  client: ClientModel,
  lastSessionDate: Date,
  currentDate: Date
): number {
  return getDaysBetween(lastSessionDate, currentDate);
}

// =============================================================================
// CLIENT STATISTICS
// =============================================================================

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  churnedClients: number;
  byFrequency: {
    weekly: number;
    biweekly: number;
    monthly: number;
  };
  byGender: {
    male: number;
    female: number;
    other: number;
  };
  avgTenureMonths: number;
}

/**
 * Calculates statistics about the client base
 */
export function calculateClientStats(
  clients: ClientModel[],
  asOfDate: Date
): ClientStats {
  const active = clients.filter(c => {
    if (c.startDate > asOfDate) return false;
    if (c.endDate && c.endDate <= asOfDate) return false;
    return true;
  });

  const churned = clients.filter(c => c.endDate && c.endDate <= asOfDate);

  // Calculate average tenure
  const tenures = clients
    .filter(c => c.startDate <= asOfDate)
    .map(c => {
      const end = c.endDate && c.endDate <= asOfDate ? c.endDate : asOfDate;
      return getDaysBetween(c.startDate, end) / 30; // Convert to months
    });

  const avgTenure = tenures.length > 0
    ? tenures.reduce((sum, t) => sum + t, 0) / tenures.length
    : 0;

  return {
    totalClients: clients.filter(c => c.startDate <= asOfDate).length,
    activeClients: active.length,
    churnedClients: churned.length,
    byFrequency: {
      weekly: active.filter(c => c.frequency === 'weekly').length,
      biweekly: active.filter(c => c.frequency === 'biweekly').length,
      monthly: active.filter(c => c.frequency === 'monthly').length,
    },
    byGender: {
      male: active.filter(c => c.gender === 'male').length,
      female: active.filter(c => c.gender === 'female').length,
      other: active.filter(c => c.gender === 'other').length,
    },
    avgTenureMonths: Math.round(avgTenure * 10) / 10,
  };
}
