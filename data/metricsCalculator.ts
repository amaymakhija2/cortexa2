// Metrics calculation utilities
import { PAYMENT_DATA, PRACTICE_SETTINGS, PaymentRecord, CLINICIANS } from './paymentData';

// Parse date string (M/D/YY format) to Date object
function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day);
}

// Get start and end dates for a given month/year
function getMonthRange(month: number, year: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

// Filter records by date range (using datePaid for cash basis accounting)
function filterByDateRange(records: PaymentRecord[], start: Date, end: Date): PaymentRecord[] {
  return records.filter(r => {
    const date = parseDate(r.datePaid);
    return date >= start && date <= end;
  });
}

// Get records for a specific month
export function getRecordsForMonth(month: number, year: number): PaymentRecord[] {
  const { start, end } = getMonthRange(month, year);
  return filterByDateRange(PAYMENT_DATA, start, end);
}

// Calculate total revenue for a period
export function calculateRevenue(records: PaymentRecord[]): number {
  return records.reduce((sum, r) => sum + r.amount, 0);
}

// Calculate completed sessions count
export function calculateSessions(records: PaymentRecord[]): number {
  return records.length;
}

// Get unique active clients in a period (using unique client IDs)
export function getActiveClients(records: PaymentRecord[]): string[] {
  return [...new Set(records.map(r => r.clientId))];
}

// Find first appearance of each client in the entire dataset (by datePaid)
function getClientFirstAppearance(): Map<string, Date> {
  const firstAppearance = new Map<string, Date>();

  for (const record of PAYMENT_DATA) {
    const date = parseDate(record.datePaid);
    const client = record.clientId;

    const existing = firstAppearance.get(client);
    if (!existing || date < existing) {
      firstAppearance.set(client, date);
    }
  }

  return firstAppearance;
}

// Get new clients in a month (first appeared in that month)
export function getNewClients(month: number, year: number): string[] {
  const { start, end } = getMonthRange(month, year);
  const firstAppearances = getClientFirstAppearance();

  const newClients: string[] = [];
  firstAppearances.forEach((firstDate, client) => {
    if (firstDate >= start && firstDate <= end) {
      newClients.push(client);
    }
  });

  return newClients;
}

// Get each client's last session date
function getClientLastSessionDate(): Map<string, Date> {
  const lastSession = new Map<string, Date>();

  for (const record of PAYMENT_DATA) {
    const date = parseDate(record.datePaid);
    const client = record.clientId;
    const existing = lastSession.get(client);
    if (!existing || date > existing) {
      lastSession.set(client, date);
    }
  }

  return lastSession;
}

// Churned = last session was > 30 days ago from asOfDate
// Returns array of { clientId, lastSessionDate }
export interface ChurnedClient {
  clientId: string;
  lastSessionDate: Date;
  daysSinceLastSession: number;
}

export function getChurnedClients(asOfDate: Date = new Date()): ChurnedClient[] {
  const churnWindow = PRACTICE_SETTINGS.churnWindowDays;
  const lastSessions = getClientLastSessionDate();
  const churned: ChurnedClient[] = [];

  lastSessions.forEach((lastSessionDate, clientId) => {
    const daysSince = Math.floor((asOfDate.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > churnWindow) {
      churned.push({ clientId, lastSessionDate, daysSinceLastSession: daysSince });
    }
  });

  return churned;
}

// Get clients who churned IN a specific month
// (their last session + 30 days falls within that month)
export function getChurnedClientsForMonth(month: number, year: number): string[] {
  const { start, end } = getMonthRange(month, year);
  const churnWindow = PRACTICE_SETTINGS.churnWindowDays;
  const lastSessions = getClientLastSessionDate();
  const churned: string[] = [];

  lastSessions.forEach((lastSessionDate, clientId) => {
    // Churn date = last session + 30 days
    const churnDate = new Date(lastSessionDate);
    churnDate.setDate(churnDate.getDate() + churnWindow);

    // Client churned in this month if churnDate falls within the month
    if (churnDate >= start && churnDate <= end) {
      churned.push(clientId);
    }
  });

  return churned;
}

// Calculate revenue by clinician for a period
export function getRevenueByClinicianForPeriod(records: PaymentRecord[]): Map<string, number> {
  const revenueMap = new Map<string, number>();

  for (const record of records) {
    const current = revenueMap.get(record.clinician) || 0;
    revenueMap.set(record.clinician, current + record.amount);
  }

  return revenueMap;
}

// Calculate sessions by clinician for a period
export function getSessionsByClinicianForPeriod(records: PaymentRecord[]): Map<string, number> {
  const sessionsMap = new Map<string, number>();

  for (const record of records) {
    const current = sessionsMap.get(record.clinician) || 0;
    sessionsMap.set(record.clinician, current + 1);
  }

  return sessionsMap;
}

// Get all months with data (by datePaid)
export function getAvailableMonths(): { month: number; year: number }[] {
  const monthsSet = new Set<string>();

  for (const record of PAYMENT_DATA) {
    const date = parseDate(record.datePaid);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthsSet.add(key);
  }

  return Array.from(monthsSet)
    .map(key => {
      const [year, month] = key.split('-').map(Number);
      return { month, year };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
}

// Get date range of data (by datePaid)
export function getDataDateRange(): { earliest: Date; latest: Date } {
  let earliest = new Date();
  let latest = new Date(0);

  for (const record of PAYMENT_DATA) {
    const date = parseDate(record.datePaid);
    if (date < earliest) earliest = date;
    if (date > latest) latest = date;
  }

  return { earliest, latest };
}

// Format currency
export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

// Calculate all dashboard metrics for a given month
export interface DashboardMetrics {
  revenue: {
    value: number;
    formatted: string;
  };
  sessions: {
    completed: number;
  };
  clients: {
    active: number;
    new: number;
    churned: number;
    openings: number;
  };
  attendance: {
    showRate: number;
    clientCancelRate: number;
    lateCancelRate: number;
    clinicianCancelRate: number;
    rebookRate: number;
  };
  notes: {
    outstandingPercent: number;
  };
}

export function calculateDashboardMetrics(month: number, year: number): DashboardMetrics {
  const records = getRecordsForMonth(month, year);
  const revenue = calculateRevenue(records);
  const sessions = calculateSessions(records);
  const activeClients = getActiveClients(records);
  const newClients = getNewClients(month, year);
  const churnedClients = getChurnedClientsForMonth(month, year);

  return {
    revenue: {
      value: revenue,
      formatted: formatCurrency(revenue),
    },
    sessions: {
      completed: sessions,
    },
    clients: {
      active: activeClients.length,
      new: newClients.length,
      churned: churnedClients.length,
      openings: PRACTICE_SETTINGS.currentOpenings,
    },
    attendance: {
      showRate: PRACTICE_SETTINGS.attendance.showRate,
      clientCancelRate: PRACTICE_SETTINGS.attendance.clientCancelled,
      lateCancelRate: PRACTICE_SETTINGS.attendance.lateCancelled,
      clinicianCancelRate: PRACTICE_SETTINGS.attendance.clinicianCancelled,
      rebookRate: PRACTICE_SETTINGS.attendance.rebookRate,
    },
    notes: {
      outstandingPercent: PRACTICE_SETTINGS.outstandingNotesPercent,
    },
  };
}

// Get monthly data for charts (last N months)
export interface MonthlyDataPoint {
  month: string;
  year: number;
  monthNum: number;
  revenue: number;
  sessions: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
}

export function getMonthlyData(numMonths: number = 12): MonthlyDataPoint[] {
  const months = getAvailableMonths();
  const recentMonths = months.slice(-numMonths);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return recentMonths.map(({ month, year }) => {
    const records = getRecordsForMonth(month, year);
    return {
      month: monthNames[month],
      year,
      monthNum: month,
      revenue: calculateRevenue(records),
      sessions: calculateSessions(records),
      activeClients: getActiveClients(records).length,
      newClients: getNewClients(month, year).length,
      churnedClients: getChurnedClientsForMonth(month, year).length,
    };
  });
}

// =============================================================================
// CLINICIAN-LEVEL CALCULATIONS
// =============================================================================

export interface ClinicianMetricsCalculated {
  clinicianId: string;
  clinicianName: string;
  revenue: number;
  completedSessions: number;
  revenuePerSession: number;
  activeClients: number;
  newClients: number;
  clientsChurned: number;
  avgSessionsPerClient: number;
  churnRate: number;
}

// Get records for a specific clinician in a date range
function getClinicianRecords(clinicianId: string, records: PaymentRecord[]): PaymentRecord[] {
  return records.filter(r => r.clinicianId === clinicianId);
}

// Get unique clients for a clinician
function getClinicianActiveClients(clinicianId: string, records: PaymentRecord[]): string[] {
  const clinicianRecords = getClinicianRecords(clinicianId, records);
  return [...new Set(clinicianRecords.map(r => r.clientId))];
}

// Get new clients for a clinician in a specific month
function getClinicianNewClients(clinicianId: string, month: number, year: number): string[] {
  const { start, end } = getMonthRange(month, year);
  const allClinicianRecords = PAYMENT_DATA.filter(r => r.clinicianId === clinicianId);

  // Find first appearance of each client with this clinician
  const firstAppearance = new Map<string, Date>();
  for (const record of allClinicianRecords) {
    const date = parseDate(record.datePaid);
    const client = record.clientId;
    const existing = firstAppearance.get(client);
    if (!existing || date < existing) {
      firstAppearance.set(client, date);
    }
  }

  // Return clients whose first appearance is in this month
  const newClients: string[] = [];
  firstAppearance.forEach((firstDate, client) => {
    if (firstDate >= start && firstDate <= end) {
      newClients.push(client);
    }
  });

  return newClients;
}

// Get each client's last session date WITH A SPECIFIC CLINICIAN
function getClinicianClientLastSessionDate(clinicianId: string): Map<string, Date> {
  const lastSession = new Map<string, Date>();
  const clinicianRecords = PAYMENT_DATA.filter(r => r.clinicianId === clinicianId);

  for (const record of clinicianRecords) {
    const date = parseDate(record.datePaid);
    const client = record.clientId;
    const existing = lastSession.get(client);
    if (!existing || date > existing) {
      lastSession.set(client, date);
    }
  }

  return lastSession;
}

// Get clients who churned from a specific clinician within a date range
// Churned = last session with this clinician + 30 days falls within the range
function getClinicianChurnedClients(clinicianId: string, startDate: Date, endDate: Date): string[] {
  const churnWindow = PRACTICE_SETTINGS.churnWindowDays;
  const lastSessions = getClinicianClientLastSessionDate(clinicianId);
  const churned: string[] = [];

  lastSessions.forEach((lastSessionDate, clientId) => {
    // Churn date = last session + 30 days
    const churnDate = new Date(lastSessionDate);
    churnDate.setDate(churnDate.getDate() + churnWindow);

    // Client churned from this clinician if churnDate falls within the period
    if (churnDate >= startDate && churnDate <= endDate) {
      churned.push(clientId);
    }
  });

  return churned;
}

// Calculate metrics for all clinicians for a given time period
export function calculateClinicianMetrics(
  startDate: Date,
  endDate: Date
): ClinicianMetricsCalculated[] {
  const periodRecords = filterByDateRange(PAYMENT_DATA, startDate, endDate);

  // Get unique clinicians from the data
  const clinicianIds = [...new Set(periodRecords.map(r => r.clinicianId))];

  return clinicianIds.map(clinicianId => {
    const clinicianRecords = getClinicianRecords(clinicianId, periodRecords);
    const revenue = calculateRevenue(clinicianRecords);
    const sessions = calculateSessions(clinicianRecords);
    const activeClients = getClinicianActiveClients(clinicianId, periodRecords);
    const churnedClients = getClinicianChurnedClients(clinicianId, startDate, endDate);

    // Find clinician name from CLINICIANS array
    const clinician = CLINICIANS.find(c => c.id === clinicianId);
    const clinicianName = clinician?.name || `Clinician ${clinicianId}`;

    return {
      clinicianId,
      clinicianName,
      revenue,
      completedSessions: sessions,
      revenuePerSession: sessions > 0 ? revenue / sessions : 0,
      activeClients: activeClients.length,
      newClients: 0, // Will be calculated separately for specific month
      clientsChurned: churnedClients.length,
      avgSessionsPerClient: activeClients.length > 0 ? sessions / activeClients.length : 0,
      churnRate: activeClients.length > 0 ? (churnedClients.length / activeClients.length) * 100 : 0,
    };
  });
}

// Get clinician metrics for a specific month
export function getClinicianMetricsForMonth(month: number, year: number): ClinicianMetricsCalculated[] {
  const { start, end } = getMonthRange(month, year);
  const metrics = calculateClinicianMetrics(start, end);

  // Add new clients for each clinician
  return metrics.map(m => ({
    ...m,
    newClients: getClinicianNewClients(m.clinicianId, month, year).length,
  }));
}

// Get clinician metrics for a date range (for time period filters)
export function getClinicianMetricsForPeriod(
  periodId: string
): ClinicianMetricsCalculated[] {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (periodId) {
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'this-quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case 'last-quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
      startDate = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
      endDate = new Date(lastQuarterYear, adjustedQuarter * 3 + 3, 0);
      break;
    case 'this-year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last-12-months':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      break;
  }

  const metrics = calculateClinicianMetrics(startDate, endDate);

  // Calculate new clients for the period
  return metrics.map(m => {
    // Count new clients across all months in the period
    let newClientsCount = 0;
    const allClinicianRecords = PAYMENT_DATA.filter(r => r.clinicianId === m.clinicianId);

    // Find first appearance of each client
    const firstAppearance = new Map<string, Date>();
    for (const record of allClinicianRecords) {
      const date = parseDate(record.datePaid);
      const client = record.clientId;
      const existing = firstAppearance.get(client);
      if (!existing || date < existing) {
        firstAppearance.set(client, date);
      }
    }

    // Count clients whose first appearance is in the period
    firstAppearance.forEach((firstDate) => {
      if (firstDate >= startDate && firstDate <= endDate) {
        newClientsCount++;
      }
    });

    return {
      ...m,
      newClients: newClientsCount,
    };
  });
}
