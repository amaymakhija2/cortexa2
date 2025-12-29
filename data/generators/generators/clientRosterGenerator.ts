// =============================================================================
// CLIENT ROSTER GENERATOR
// =============================================================================
// Generates client roster entries, at-risk clients, milestone clients, etc.
// =============================================================================

import type {
  DemoConfiguration,
  ClientRosterEntry,
  ClientStatus,
  AtRiskClient,
  MilestoneClient,
  Clinician,
} from '../types';

import type { ClientModel } from './clientGenerator';
import type { SessionRecord } from './paymentGenerator';

import { RandomFn, randomInt } from '../utils/random';
import { generateInitials } from '../utils/nameGenerator';
import { formatDate, addDays, getDaysBetween, fromISO } from '../utils/dateUtils';

// =============================================================================
// SESSION MILESTONES
// =============================================================================

const SESSION_MILESTONES = [5, 10, 12, 20, 24, 50, 100];

/**
 * Get the next milestone for a client
 */
function getNextMilestone(currentSessions: number): number | null {
  for (const milestone of SESSION_MILESTONES) {
    if (currentSessions < milestone) {
      return milestone;
    }
  }
  return null;
}

// =============================================================================
// CLIENT STATUS DETERMINATION
// =============================================================================

/**
 * Determine client status based on their data
 */
function determineClientStatus(
  client: ClientModel,
  sessionCount: number,
  daysSinceLastSession: number,
  hasNextAppointment: boolean,
  dataEnd: Date
): ClientStatus {
  // Churned if they have an end date in the past
  if (client.endDate && client.endDate <= dataEnd) {
    return 'churned';
  }

  // New if started within last 30 days
  const daysSinceStart = getDaysBetween(client.startDate, dataEnd);
  if (daysSinceStart <= 30 && sessionCount <= 3) {
    return 'new';
  }

  // Check for milestone proximity
  const nextMilestone = getNextMilestone(sessionCount);
  if (nextMilestone && nextMilestone - sessionCount <= 2) {
    return 'milestone';
  }

  // At-risk if no appointment and haven't been seen in a while
  if (!hasNextAppointment && daysSinceLastSession > 14) {
    return 'at-risk';
  }

  // Otherwise healthy
  return 'healthy';
}

// =============================================================================
// ROSTER GENERATION
// =============================================================================

/**
 * Generates client roster entries from client models and session data
 */
export function generateClientRoster(
  clients: ClientModel[],
  sessions: SessionRecord[],
  clinicians: Clinician[],
  config: DemoConfiguration,
  random: RandomFn
): ClientRosterEntry[] {
  const dataEnd = fromISO(config.dataRange.endDate);
  const clinicianMap = new Map(clinicians.map(c => [c.id, c]));

  // Build session data per client
  const clientSessionData = new Map<string, {
    count: number;
    lastSessionDate: Date | null;
  }>();

  for (const session of sessions) {
    if (!session.attended) continue;

    const data = clientSessionData.get(session.clientId) || {
      count: 0,
      lastSessionDate: null,
    };

    data.count++;
    if (!data.lastSessionDate || session.date > data.lastSessionDate) {
      data.lastSessionDate = session.date;
    }

    clientSessionData.set(session.clientId, data);
  }

  const roster: ClientRosterEntry[] = [];

  for (const client of clients) {
    const clinician = clinicianMap.get(client.clinicianId);
    if (!clinician) continue;

    const sessionData = clientSessionData.get(client.id) || {
      count: 0,
      lastSessionDate: client.startDate,
    };

    const daysSinceLastSession = sessionData.lastSessionDate
      ? getDaysBetween(sessionData.lastSessionDate, dataEnd)
      : getDaysBetween(client.startDate, dataEnd);

    // Simulate next appointment (if active and not churned)
    const hasNextAppointment = client.isActive && !client.endDate && Math.random() < 0.85;
    const nextAppointment = hasNextAppointment
      ? formatDate(addDays(dataEnd, randomInt(1, 14, random)), 'YYYY-MM-DD')
      : null;

    const status = determineClientStatus(
      client,
      sessionData.count,
      daysSinceLastSession,
      hasNextAppointment,
      dataEnd
    );

    // Skip clients who haven't started yet
    if (client.startDate > dataEnd) continue;

    const entry: ClientRosterEntry = {
      id: client.id,
      name: client.name,
      initials: generateInitials(client.name),
      clinicianId: client.clinicianId,
      clinicianName: clinician.name,
      clinicianShort: clinician.shortName,
      totalSessions: sessionData.count,
      lastSeenDays: daysSinceLastSession,
      nextAppointment,
      status,
    };

    // Add milestone info if applicable
    if (status === 'milestone') {
      entry.milestone = getNextMilestone(sessionData.count) || undefined;
    }

    // Add churned date if applicable
    if (status === 'churned' && client.endDate) {
      entry.churnedDate = formatDate(client.endDate, 'YYYY-MM-DD');
    }

    roster.push(entry);
  }

  return roster;
}

/**
 * Get clients by status
 */
export function getClientsByStatus(
  roster: ClientRosterEntry[],
  status: ClientStatus
): ClientRosterEntry[] {
  return roster.filter(c => c.status === status);
}

// =============================================================================
// AT-RISK CLIENTS
// =============================================================================

/**
 * Generates at-risk client list with risk levels
 */
export function generateAtRiskClients(
  roster: ClientRosterEntry[],
  clinicians: Clinician[]
): AtRiskClient[] {
  const clinicianMap = new Map(clinicians.map(c => [c.id, c]));

  const atRiskEntries = roster.filter(c => c.status === 'at-risk');

  return atRiskEntries.map(client => {
    const clinician = clinicianMap.get(client.clinicianId);

    // Determine risk level based on days since last session
    let riskLevel: 'high' | 'medium' | 'low';
    if (client.lastSeenDays > 28) {
      riskLevel = 'high';
    } else if (client.lastSeenDays > 21) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      id: client.id,
      name: client.name,
      daysSinceLastSession: client.lastSeenDays,
      totalSessions: client.totalSessions,
      clinician: clinician?.name || 'Unknown',
      riskLevel,
    };
  }).sort((a, b) => b.daysSinceLastSession - a.daysSinceLastSession);
}

// =============================================================================
// MILESTONE CLIENTS
// =============================================================================

/**
 * Generates clients approaching milestones
 */
export function generateMilestoneClients(
  roster: ClientRosterEntry[],
  clinicians: Clinician[]
): MilestoneClient[] {
  const clinicianMap = new Map(clinicians.map(c => [c.id, c]));

  // Get clients who are close to milestones
  const milestoneEntries: MilestoneClient[] = [];

  for (const client of roster) {
    if (client.status === 'churned') continue;

    const nextMilestone = getNextMilestone(client.totalSessions);
    if (!nextMilestone) continue;

    const sessionsToGo = nextMilestone - client.totalSessions;

    // Include if within 3 sessions of milestone
    if (sessionsToGo <= 3 && sessionsToGo > 0) {
      const clinician = clinicianMap.get(client.clinicianId);

      milestoneEntries.push({
        id: client.id,
        name: client.name,
        currentSessions: client.totalSessions,
        targetMilestone: nextMilestone,
        sessionsToGo,
        nextAppointment: client.nextAppointment || undefined,
        clinician: clinician?.name || 'Unknown',
      });
    }
  }

  return milestoneEntries.sort((a, b) => a.sessionsToGo - b.sessionsToGo);
}

// =============================================================================
// RECENTLY CHURNED
// =============================================================================

/**
 * Gets recently churned clients (last 30 days)
 */
export function getRecentlyChurnedClients(
  roster: ClientRosterEntry[],
  config: DemoConfiguration
): ClientRosterEntry[] {
  const dataEnd = fromISO(config.dataRange.endDate);

  return roster
    .filter(c => {
      if (c.status !== 'churned' || !c.churnedDate) return false;
      const churnDate = new Date(c.churnedDate);
      const daysSinceChurn = getDaysBetween(churnDate, dataEnd);
      return daysSinceChurn <= 30;
    })
    .sort((a, b) => {
      const dateA = a.churnedDate ? new Date(a.churnedDate).getTime() : 0;
      const dateB = b.churnedDate ? new Date(b.churnedDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
}
