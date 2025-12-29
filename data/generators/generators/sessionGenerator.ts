// =============================================================================
// SESSION GENERATOR
// =============================================================================
// Aggregates session data into monthly breakdowns for charts and analysis.
// =============================================================================

import type {
  DemoConfiguration,
  MonthlySessionsData,
  ClinicianSessionsData,
  Clinician,
} from '../types';

import type { SessionRecord, MonthlySessionAggregate } from './paymentGenerator';
import type { ClientModel } from './clientGenerator';

import { RandomFn, chance } from '../utils/random';
import { formatDate, getMonthRange, fromISO, startOfMonth } from '../utils/dateUtils';

// =============================================================================
// SESSION AGGREGATION
// =============================================================================

/**
 * Generates monthly session data from session records
 */
export function generateMonthlySessionsData(
  sessions: SessionRecord[],
  clients: ClientModel[],
  config: DemoConfiguration
): MonthlySessionsData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const monthlyData: MonthlySessionsData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Filter sessions for this month
    const monthSessions = sessions.filter(s =>
      s.date >= monthStart && s.date <= monthEnd
    );

    // Count active clients this month
    const activeClients = clients.filter(c => {
      if (c.startDate > monthEnd) return false;
      if (c.endDate && c.endDate < monthStart) return false;
      return true;
    });

    // Calculate metrics
    const completed = monthSessions.filter(s => s.attended).length;
    const cancelled = monthSessions.filter(s => s.cancelled && !s.lateCancelled).length;
    const lateCancelled = monthSessions.filter(s => s.lateCancelled).length;
    const clinicianCancelled = Math.round(cancelled * 0.15); // ~15% of cancels are by clinician
    const noShow = monthSessions.filter(s => s.noShow).length;
    const show = completed;
    const booked = monthSessions.length;

    // Estimate telehealth vs in-person (based on CPT code modifiers)
    const telehealth = monthSessions.filter(s =>
      s.attended && s.cptCode.includes('-95')
    ).length;
    const inPerson = completed - telehealth;

    monthlyData.push({
      month: monthKey,
      completed,
      booked,
      clients: activeClients.length,
      cancelled,
      clinicianCancelled,
      lateCancelled,
      noShow,
      show,
      telehealth,
      inPerson,
    });
  }

  return monthlyData;
}

/**
 * Generates sessions breakdown by clinician per month
 */
export function generateClinicianSessionsData(
  sessions: SessionRecord[],
  clinicians: Clinician[],
  config: DemoConfiguration
): ClinicianSessionsData[] {
  const dataStart = fromISO(config.dataRange.startDate);
  const dataEnd = fromISO(config.dataRange.endDate);
  const months = getMonthRange(dataStart, dataEnd);

  const clinicianData: ClinicianSessionsData[] = [];

  for (const month of months) {
    const monthKey = formatDate(month, 'Mon YYYY');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Filter attended sessions for this month
    const monthSessions = sessions.filter(s =>
      s.attended && s.date >= monthStart && s.date <= monthEnd
    );

    // Build the record with clinician last names as keys
    const record: ClinicianSessionsData = { month: monthKey };

    for (const clinician of clinicians) {
      const count = monthSessions.filter(s => s.clinicianId === clinician.id).length;
      record[clinician.lastName] = count;
    }

    clinicianData.push(record);
  }

  return clinicianData;
}

// =============================================================================
// SESSION TIMING HEATMAP
// =============================================================================

import type { SessionTimingData } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BUSINESS_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; // 8am-7pm

/**
 * Generates session timing heatmap data
 * Shows when sessions typically occur (day x hour)
 */
export function generateSessionTimingData(
  sessions: SessionRecord[],
  random: RandomFn
): SessionTimingData[] {
  const timingData: SessionTimingData[] = [];

  // Create base grid
  for (const day of DAYS) {
    for (const hour of BUSINESS_HOURS) {
      timingData.push({ day, hour, sessions: 0 });
    }
  }

  // Assign sessions to time slots based on realistic patterns
  // Most sessions are weekdays, peak hours 10am-2pm and 4pm-7pm
  const attendedSessions = sessions.filter(s => s.attended);

  for (const session of attendedSessions) {
    const dayIndex = session.date.getDay();
    const day = DAYS[dayIndex];

    // Skip weekends (they get very few sessions)
    if (dayIndex === 0 || dayIndex === 6) {
      if (!chance(0.05, random)) continue; // 5% chance of Saturday sessions
    }

    // Assign hour based on realistic distribution
    // Peak: 10-11am, 1-2pm, 5-6pm
    const hourWeights = [
      { hour: 8, weight: 5 },
      { hour: 9, weight: 15 },
      { hour: 10, weight: 25 },
      { hour: 11, weight: 20 },
      { hour: 12, weight: 10 },
      { hour: 13, weight: 15 },
      { hour: 14, weight: 18 },
      { hour: 15, weight: 15 },
      { hour: 16, weight: 20 },
      { hour: 17, weight: 25 },
      { hour: 18, weight: 18 },
      { hour: 19, weight: 8 },
    ];

    const totalWeight = hourWeights.reduce((sum, h) => sum + h.weight, 0);
    let roll = random() * totalWeight;
    let selectedHour = 10;

    for (const { hour, weight } of hourWeights) {
      roll -= weight;
      if (roll <= 0) {
        selectedHour = hour;
        break;
      }
    }

    // Find and increment the matching slot
    const slot = timingData.find(t => t.day === day && t.hour === selectedHour);
    if (slot) {
      slot.sessions++;
    }
  }

  return timingData;
}
