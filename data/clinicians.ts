// =============================================================================
// MASTER CLINICIAN LIST - SINGLE SOURCE OF TRUTH
// =============================================================================
// ALL clinician data across the app should import from this file.
// Do NOT define clinician names elsewhere.
// =============================================================================

export interface Clinician {
  id: string;
  name: string;           // Full name: "Sarah Chen"
  shortName: string;      // First + Initial: "Sarah C"
  lastName: string;       // Just last name: "Chen"
  initials: string;       // "SC"
  color: string;          // Brand color for charts/avatars
  title: string;          // License type: "Licensed Clinical Psychologist"
  role: string;           // Position: "Clinical Director"
  supervisorId: string | null;  // ID of supervisor, null if none
  takeRate: number;       // Percentage clinician keeps (e.g., 45 = 45%)
  sessionGoal: number;    // Monthly session goal
  clientGoal: number;     // Target active client count
  startDate: string;      // When they joined the practice
  isActive: boolean;      // Currently practicing
}

// The 5 clinicians used throughout the app
export const CLINICIANS: Clinician[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    shortName: 'Sarah C',
    lastName: 'Chen',
    initials: 'SC',
    color: '#a855f7',
    title: 'Licensed Clinical Psychologist',
    role: 'Clinical Director',
    supervisorId: null,
    takeRate: 45,
    sessionGoal: 40,
    clientGoal: 30,
    startDate: '2021-03-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    shortName: 'Maria R',
    lastName: 'Rodriguez',
    initials: 'MR',
    color: '#06b6d4',
    title: 'Licensed Clinical Social Worker',
    role: 'Senior Therapist',
    supervisorId: '1',
    takeRate: 55,
    sessionGoal: 35,
    clientGoal: 28,
    startDate: '2022-01-10',
    isActive: true,
  },
  {
    id: '3',
    name: 'Priya Patel',
    shortName: 'Priya P',
    lastName: 'Patel',
    initials: 'PP',
    color: '#f59e0b',
    title: 'Licensed Professional Counselor',
    role: 'Therapist',
    supervisorId: '1',
    takeRate: 50,
    sessionGoal: 32,
    clientGoal: 25,
    startDate: '2023-02-20',
    isActive: true,
  },
  {
    id: '4',
    name: 'James Kim',
    shortName: 'James K',
    lastName: 'Kim',
    initials: 'JK',
    color: '#ec4899',
    title: 'Licensed Marriage & Family Therapist',
    role: 'Associate Therapist',
    supervisorId: '2',
    takeRate: 45,
    sessionGoal: 28,
    clientGoal: 22,
    startDate: '2024-01-08',
    isActive: true,
  },
  {
    id: '5',
    name: 'Michael Johnson',
    shortName: 'Michael J',
    lastName: 'Johnson',
    initials: 'MJ',
    color: '#10b981',
    title: 'Associate Professional Counselor',
    role: 'Associate Therapist',
    supervisorId: '3',
    takeRate: 40,
    sessionGoal: 25,
    clientGoal: 20,
    startDate: '2024-05-01',
    isActive: true,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getClinicianById = (id: string): Clinician | undefined =>
  CLINICIANS.find(c => c.id === id);

export const getClinicianByName = (name: string): Clinician | undefined =>
  CLINICIANS.find(c => c.name === name || c.shortName === name || c.lastName === name);

export const getClinicianNames = (): string[] =>
  CLINICIANS.map(c => c.name);

export const getClinicianShortNames = (): string[] =>
  CLINICIANS.map(c => c.shortName);

export const getClinicianLastNames = (): string[] =>
  CLINICIANS.map(c => c.lastName);

export const getSupervisor = (clinician: Clinician): Clinician | undefined =>
  clinician.supervisorId ? getClinicianById(clinician.supervisorId) : undefined;

export const getDirectReports = (clinicianId: string): Clinician[] =>
  CLINICIANS.filter(c => c.supervisorId === clinicianId);

// For use in dropdowns, selects, etc.
export const CLINICIAN_OPTIONS = CLINICIANS.map(c => ({
  value: c.id,
  label: c.name,
  shortLabel: c.shortName,
}));

// Color map for charts (by last name for brevity)
export const CLINICIAN_COLORS: Record<string, string> = Object.fromEntries(
  CLINICIANS.map(c => [c.lastName, c.color])
);

// =============================================================================
// PER-CLINICIAN SYNTHETIC METRICS
// =============================================================================
// These provide variance in attendance, engagement, and retention metrics
// that cannot be calculated from payment data alone.
// Used by ClinicianOverview to show differentiated performance.
// =============================================================================

export interface ClinicianSyntheticMetrics {
  // Attendance
  showRate: number;           // % of booked sessions completed (0-100)
  clientCancelRate: number;   // % cancelled by client (0-100)
  clinicianCancelRate: number; // % cancelled by clinician (0-100)
  noShowRate: number;         // % no-shows (0-100)
  lateCancelRate: number;     // % late cancels (0-100)

  // Engagement
  rebookRate: number;         // % of clients who rebook (0-100)
  avgSessionsPerClient: number; // Average sessions per active client per month

  // Retention
  churnRate: number;          // Monthly churn rate % (0-100)
  atRiskClients: number;      // Clients at risk of churning
  session1to2Retention: number; // % who come back for session 2
  session5Retention: number;   // % who reach session 5
  session12Retention: number;  // % who reach session 12

  // Notes
  outstandingNotes: number;   // Number of notes overdue

  // Growth
  newClientsThisMonth: number; // New clients added this month
}

// Per-clinician metrics - each has a distinct performance story
export const CLINICIAN_SYNTHETIC_METRICS: Record<string, ClinicianSyntheticMetrics> = {
  '1': { // Sarah Chen - Excellent performer, clinical director
    showRate: 91,
    clientCancelRate: 5,
    clinicianCancelRate: 2,
    noShowRate: 2,
    lateCancelRate: 0,
    rebookRate: 92,
    avgSessionsPerClient: 3.8,
    churnRate: 4,
    atRiskClients: 2,
    session1to2Retention: 96,
    session5Retention: 88,
    session12Retention: 74,
    outstandingNotes: 2,
    newClientsThisMonth: 3,
  },
  '2': { // Maria Rodriguez - Strong performer, consistent
    showRate: 85,
    clientCancelRate: 8,
    clinicianCancelRate: 3,
    noShowRate: 3,
    lateCancelRate: 1,
    rebookRate: 87,
    avgSessionsPerClient: 3.2,
    churnRate: 7,
    atRiskClients: 4,
    session1to2Retention: 92,
    session5Retention: 82,
    session12Retention: 68,
    outstandingNotes: 4,
    newClientsThisMonth: 2,
  },
  '3': { // Priya Patel - Needs attention, high cancellations
    showRate: 72,
    clientCancelRate: 18,
    clinicianCancelRate: 4,
    noShowRate: 4,
    lateCancelRate: 2,
    rebookRate: 71,
    avgSessionsPerClient: 2.4,
    churnRate: 14,
    atRiskClients: 7,
    session1to2Retention: 78,
    session5Retention: 62,
    session12Retention: 45,
    outstandingNotes: 12,
    newClientsThisMonth: 1,
  },
  '4': { // James Kim - Growing, great potential
    showRate: 88,
    clientCancelRate: 6,
    clinicianCancelRate: 2,
    noShowRate: 3,
    lateCancelRate: 1,
    rebookRate: 84,
    avgSessionsPerClient: 2.9,
    churnRate: 6,
    atRiskClients: 2,
    session1to2Retention: 90,
    session5Retention: 78,
    session12Retention: 62,
    outstandingNotes: 3,
    newClientsThisMonth: 4,
  },
  '5': { // Michael Johnson - Critical, needs intervention
    showRate: 64,
    clientCancelRate: 22,
    clinicianCancelRate: 6,
    noShowRate: 6,
    lateCancelRate: 2,
    rebookRate: 58,
    avgSessionsPerClient: 1.8,
    churnRate: 24,
    atRiskClients: 5,
    session1to2Retention: 68,
    session5Retention: 48,
    session12Retention: 32,
    outstandingNotes: 18,
    newClientsThisMonth: 1,
  },
};

// Helper to get synthetic metrics by clinician name
export const getSyntheticMetricsByName = (name: string): ClinicianSyntheticMetrics | undefined => {
  const clinician = getClinicianByName(name);
  if (!clinician) return undefined;
  return CLINICIAN_SYNTHETIC_METRICS[clinician.id];
};
