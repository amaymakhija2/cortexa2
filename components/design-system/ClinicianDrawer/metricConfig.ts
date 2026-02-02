// =============================================================================
// METRIC CONFIGURATION FOR CLINICIAN DRAWER
// =============================================================================
// Centralized configuration for all 8 metric groups.
// Each metric has definitions, calculations, and problem client filters.
// =============================================================================

export interface ColumnConfig {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown) => string;
}

export interface MetricDefinition {
  id: string;
  key: string;                    // Key to access value in metrics object
  label: string;                  // Tab label
  definition: string;             // Plain English explanation
  calculation: string;            // Formula explanation template
  problemListTitle: string;       // e.g., "Clients Not Rebooked"
  columns: ColumnConfig[];        // Table columns for problem list
  higherIsBetter: boolean;        // For color coding
  format: (value: number) => string;
  noProblemClients?: boolean;     // Some metrics don't have problem clients (e.g., goals)
}

export interface MetricGroupConfig {
  id: string;
  label: string;
  metrics: MetricDefinition[];
}

// =============================================================================
// COLUMN CONFIGURATIONS - Reusable column definitions
// =============================================================================

const CLIENT_NAME_COL: ColumnConfig = {
  key: 'name',
  header: 'Client',
  align: 'left',
};

const LAST_SESSION_COL: ColumnConfig = {
  key: 'lastSession',
  header: 'Last Session',
  align: 'left',
};

const DAYS_SINCE_COL: ColumnConfig = {
  key: 'daysSince',
  header: 'Days',
  align: 'right',
};

const STATUS_COL: ColumnConfig = {
  key: 'status',
  header: 'Status',
  align: 'left',
};

const SESSIONS_COL: ColumnConfig = {
  key: 'sessions',
  header: 'Sessions',
  align: 'right',
};

const REVENUE_COL: ColumnConfig = {
  key: 'revenue',
  header: 'Revenue',
  align: 'right',
};

const CANCEL_COUNT_COL: ColumnConfig = {
  key: 'cancelCount',
  header: 'Cancels',
  align: 'right',
};

const NOSHOW_COUNT_COL: ColumnConfig = {
  key: 'noshowCount',
  header: 'No-Shows',
  align: 'right',
};

const RATE_COL: ColumnConfig = {
  key: 'rate',
  header: 'Rate',
  align: 'right',
};

const DUE_DATE_COL: ColumnConfig = {
  key: 'dueDate',
  header: 'Due Date',
  align: 'left',
};

const SESSION_DATE_COL: ColumnConfig = {
  key: 'sessionDate',
  header: 'Session Date',
  align: 'left',
};

// =============================================================================
// METRIC GROUP CONFIGURATIONS
// =============================================================================

export const METRIC_GROUPS: MetricGroupConfig[] = [
  // =========================================================================
  // 1. REVENUE GROUP
  // =========================================================================
  {
    id: 'revenue',
    label: 'Revenue',
    metrics: [
      {
        id: 'gross-revenue',
        key: 'revenue',
        label: 'Gross Revenue',
        definition: 'Total payments collected from completed sessions during the selected time period.',
        calculation: 'Sum of all session payments = ${value}',
        problemListTitle: 'Low Revenue Clients',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, REVENUE_COL, RATE_COL],
        higherIsBetter: true,
        format: (v) => `$${(v / 1000).toFixed(1)}K`,
      },
      {
        id: 'completed-sessions',
        key: 'completedSessions',
        label: 'Completed Sessions',
        definition: 'Number of sessions that actually happened during the selected time period.',
        calculation: 'Booked sessions - Cancellations - No-shows = ${value}',
        problemListTitle: 'Low Session Clients',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, LAST_SESSION_COL, DAYS_SINCE_COL],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
      },
      {
        id: 'avg-revenue-session',
        key: 'revenuePerSession',
        label: 'Avg Revenue/Session',
        definition: 'Average amount collected per completed session.',
        calculation: 'Total Revenue ÷ Completed Sessions = ${value}',
        problemListTitle: 'Below-Rate Clients',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, REVENUE_COL, RATE_COL],
        higherIsBetter: true,
        format: (v) => `$${v.toFixed(0)}`,
      },
    ],
  },

  // =========================================================================
  // 2. CASELOAD GROUP
  // =========================================================================
  {
    id: 'caseload',
    label: 'Caseload',
    metrics: [
      {
        id: 'capacity-percent',
        key: 'caseloadPercent',
        label: 'Capacity %',
        definition: 'How full is the clinician\'s caseload compared to their goal.',
        calculation: 'Active Clients (${numerator}) ÷ Client Goal (${denominator}) × 100 = ${value}',
        problemListTitle: 'At-Risk Clients',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, DAYS_SINCE_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'active-clients',
        key: 'activeClients',
        label: 'Active Clients',
        definition: 'Clients who have had a session in the last 30 days or have a future appointment scheduled.',
        calculation: 'Clients meeting activity criteria = ${value}',
        problemListTitle: 'Inactive Clients',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, DAYS_SINCE_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
      },
      {
        id: 'client-goal',
        key: 'caseloadCapacity',
        label: 'Client Goal',
        definition: 'Target number of active clients set by the practice owner for this clinician.',
        calculation: 'Practice-defined goal = ${value}',
        problemListTitle: '',
        columns: [],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
        noProblemClients: true,
      },
    ],
  },

  // =========================================================================
  // 3. GROWTH GROUP
  // =========================================================================
  {
    id: 'growth',
    label: 'Growth',
    metrics: [
      {
        id: 'new-clients',
        key: 'newClients',
        label: 'New Clients',
        definition: 'Clients who had their first-ever session with this clinician during the selected time period.',
        calculation: 'First sessions this period = ${value}',
        problemListTitle: 'New Clients Not Rebooked',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, DAYS_SINCE_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
      },
      {
        id: 'consults-booked',
        key: 'consultsBooked',
        label: 'Consults Booked',
        definition: 'Consultation appointments scheduled with this clinician during the time period.',
        calculation: 'Consultations booked = ${value}',
        problemListTitle: 'Lost Consults',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, { key: 'outcome', header: 'Outcome', align: 'left' }],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
      },
      {
        id: 'conversion-rate',
        key: 'conversionRate',
        label: 'Conversion Rate',
        definition: 'Percentage of consultations that converted to ongoing clients.',
        calculation: 'Converted (${numerator}) ÷ Completed Consults (${denominator}) × 100 = ${value}',
        problemListTitle: 'Lost Consults',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, { key: 'reason', header: 'Reason', align: 'left' }],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'new-client-percent',
        key: 'newClientPercent',
        label: 'New Client %',
        definition: 'New clients as a percentage of total active caseload.',
        calculation: 'New Clients (${numerator}) ÷ Active Clients (${denominator}) × 100 = ${value}',
        problemListTitle: 'Newest Clients',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, SESSIONS_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
    ],
  },

  // =========================================================================
  // 4. SESSIONS GROUP
  // =========================================================================
  {
    id: 'sessions',
    label: 'Sessions',
    metrics: [
      {
        id: 'session-goal-percent',
        key: 'sessionGoalPercent',
        label: 'Session Goal %',
        definition: 'Progress toward the clinician\'s session target.',
        calculation: 'Completed Sessions (${numerator}) ÷ Session Goal (${denominator}) × 100 = ${value}',
        problemListTitle: 'Low-Frequency Clients',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, LAST_SESSION_COL, { key: 'frequency', header: 'Frequency', align: 'left' }],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'completed-sessions-2',
        key: 'completedSessions',
        label: 'Completed Sessions',
        definition: 'Sessions that actually happened during the selected time period.',
        calculation: 'Booked - Cancels - No-shows = ${value}',
        problemListTitle: 'High Cancel/No-Show Clients',
        columns: [CLIENT_NAME_COL, CANCEL_COUNT_COL, NOSHOW_COUNT_COL, { key: 'cancelRate', header: 'Rate', align: 'right' }],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
      },
      {
        id: 'session-goal',
        key: 'weeklySessionGoal',
        label: 'Session Goal',
        definition: 'Target number of sessions set by the practice owner for this clinician.',
        calculation: 'Practice-defined goal = ${value}',
        problemListTitle: '',
        columns: [],
        higherIsBetter: true,
        format: (v) => v.toLocaleString(),
        noProblemClients: true,
      },
    ],
  },

  // =========================================================================
  // 5. ATTENDANCE GROUP
  // =========================================================================
  {
    id: 'attendance',
    label: 'Attendance',
    metrics: [
      {
        id: 'client-cancel-rate',
        key: 'clientCancelRate',
        label: 'Client Cancel Rate',
        definition: 'Percentage of booked sessions cancelled by the client.',
        calculation: 'Client Cancellations (${numerator}) ÷ Booked Sessions (${denominator}) × 100 = ${value}',
        problemListTitle: 'High Cancellers',
        columns: [CLIENT_NAME_COL, CANCEL_COUNT_COL, { key: 'booked', header: 'Booked', align: 'right' }, RATE_COL],
        higherIsBetter: false,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'clinician-cancel-rate',
        key: 'clinicianCancelRate',
        label: 'Clinician Cancel Rate',
        definition: 'Percentage of booked sessions cancelled by the clinician.',
        calculation: 'Clinician Cancellations (${numerator}) ÷ Booked Sessions (${denominator}) × 100 = ${value}',
        problemListTitle: 'Most Affected Clients',
        columns: [CLIENT_NAME_COL, CANCEL_COUNT_COL, LAST_SESSION_COL, STATUS_COL],
        higherIsBetter: false,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'no-show-rate',
        key: 'noShowRate',
        label: 'No-Show Rate',
        definition: 'Percentage of booked sessions where the client did not attend without canceling.',
        calculation: 'No-Shows (${numerator}) ÷ Booked Sessions (${denominator}) × 100 = ${value}',
        problemListTitle: 'Repeat No-Shows',
        columns: [CLIENT_NAME_COL, NOSHOW_COUNT_COL, { key: 'booked', header: 'Booked', align: 'right' }, RATE_COL],
        higherIsBetter: false,
        format: (v) => `${v.toFixed(0)}%`,
      },
    ],
  },

  // =========================================================================
  // 6. ENGAGEMENT GROUP
  // =========================================================================
  {
    id: 'engagement',
    label: 'Engagement',
    metrics: [
      {
        id: 'rebook-rate',
        key: 'rebookRate',
        label: 'Rebook Rate',
        definition: 'Percentage of active clients who have their next appointment scheduled.',
        calculation: 'Clients Rebooked (${numerator}) ÷ Active Clients (${denominator}) × 100 = ${value}',
        problemListTitle: 'Clients Not Rebooked',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, DAYS_SINCE_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'session-2-return',
        key: 'session1to2Retention',
        label: 'Session 2 Return',
        definition: 'Percentage of new clients who came back for their second session.',
        calculation: 'Clients with 2+ sessions (${numerator}) ÷ Clients with 1+ session (${denominator}) × 100 = ${value}',
        problemListTitle: 'Dropped After Session 1',
        columns: [CLIENT_NAME_COL, { key: 'firstSession', header: 'First Session', align: 'left' }, DAYS_SINCE_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'session-5-return',
        key: 'session5Retention',
        label: 'Session 5 Return',
        definition: 'Percentage of clients who reached their 5th session.',
        calculation: 'Clients with 5+ sessions (${numerator}) ÷ Clients with 1+ session (${denominator}) × 100 = ${value}',
        problemListTitle: 'At Sessions 2-4',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, LAST_SESSION_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'session-12-return',
        key: 'session12Retention',
        label: 'Session 12 Return',
        definition: 'Percentage of clients who reached their 12th session.',
        calculation: 'Clients with 12+ sessions (${numerator}) ÷ Clients with 1+ session (${denominator}) × 100 = ${value}',
        problemListTitle: 'At Sessions 5-11',
        columns: [CLIENT_NAME_COL, SESSIONS_COL, LAST_SESSION_COL, STATUS_COL],
        higherIsBetter: true,
        format: (v) => `${v.toFixed(0)}%`,
      },
    ],
  },

  // =========================================================================
  // 7. RETENTION GROUP
  // =========================================================================
  {
    id: 'retention',
    label: 'Retention',
    metrics: [
      {
        id: 'churn-rate',
        key: 'churnRate',
        label: 'Churn Rate',
        definition: 'Percentage of clients who stopped seeing this clinician during the period.',
        calculation: 'Churned Clients (${numerator}) ÷ Starting Clients (${denominator}) × 100 = ${value}',
        problemListTitle: 'Churned Clients',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, SESSIONS_COL, { key: 'churnType', header: 'Type', align: 'left' }],
        higherIsBetter: false,
        format: (v) => `${v.toFixed(0)}%`,
      },
      {
        id: 'clients-start',
        key: 'activeClientsStart',
        label: 'Clients (Start)',
        definition: 'Number of active clients at the beginning of the selected time period.',
        calculation: 'Point-in-time count = ${value}',
        problemListTitle: '',
        columns: [],
        higherIsBetter: true,
        format: (v) => v.toString(),
        noProblemClients: true,
      },
      {
        id: 'clients-end',
        key: 'activeClientsEnd',
        label: 'Clients (End)',
        definition: 'Number of active clients at the end of the selected time period.',
        calculation: 'Starting - Churned + New = ${value}',
        problemListTitle: '',
        columns: [],
        higherIsBetter: true,
        format: (v) => v.toString(),
        noProblemClients: true,
      },
      {
        id: 'clients-churned',
        key: 'clientsChurned',
        label: 'Churned',
        definition: 'Number of clients who stopped seeing this clinician (no session in 30+ days and none scheduled).',
        calculation: 'Clients meeting churn criteria = ${value}',
        problemListTitle: 'Churned Clients',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, SESSIONS_COL, { key: 'churnType', header: 'Type', align: 'left' }],
        higherIsBetter: false,
        format: (v) => v.toString(),
      },
      {
        id: 'at-risk',
        key: 'atRiskClients',
        label: 'At-Risk',
        definition: 'Clients without upcoming appointments who may churn soon (no future appointment + 14+ days since last session).',
        calculation: 'Clients at risk of churning = ${value}',
        problemListTitle: 'At-Risk Clients',
        columns: [CLIENT_NAME_COL, LAST_SESSION_COL, DAYS_SINCE_COL, { key: 'urgency', header: 'Urgency', align: 'left' }],
        higherIsBetter: false,
        format: (v) => v.toString(),
      },
    ],
  },

  // =========================================================================
  // 8. DOCUMENTATION GROUP
  // =========================================================================
  {
    id: 'documentation',
    label: 'Notes',
    metrics: [
      {
        id: 'outstanding-notes',
        key: 'outstandingNotes',
        label: 'Outstanding Notes',
        definition: 'Total notes that have not yet been completed.',
        calculation: 'Overdue + Due Soon = ${value}',
        problemListTitle: 'Sessions Needing Notes',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, DUE_DATE_COL, STATUS_COL],
        higherIsBetter: false,
        format: (v) => v.toString(),
      },
      {
        id: 'overdue-notes',
        key: 'overdueNotes',
        label: 'Overdue',
        definition: 'Notes that are past the practice\'s deadline.',
        calculation: 'Notes past due = ${value}',
        problemListTitle: 'Overdue Sessions',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, DUE_DATE_COL, { key: 'daysOverdue', header: 'Days Late', align: 'right' }],
        higherIsBetter: false,
        format: (v) => v.toString(),
      },
      {
        id: 'due-within-48h',
        key: 'dueWithin48hNotes',
        label: 'Due Within 48h',
        definition: 'Notes due within the next 48 hours (not yet overdue).',
        calculation: 'Notes due soon = ${value}',
        problemListTitle: 'Upcoming Due',
        columns: [CLIENT_NAME_COL, SESSION_DATE_COL, DUE_DATE_COL, { key: 'hoursLeft', header: 'Hours Left', align: 'right' }],
        higherIsBetter: false,
        format: (v) => v.toString(),
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getMetricGroup = (groupId: string): MetricGroupConfig | undefined => {
  return METRIC_GROUPS.find(g => g.id === groupId);
};

export const getMetricDefinition = (groupId: string, metricId: string): MetricDefinition | undefined => {
  const group = getMetricGroup(groupId);
  return group?.metrics.find(m => m.id === metricId);
};

export const getMetricByKey = (groupId: string, key: string): MetricDefinition | undefined => {
  const group = getMetricGroup(groupId);
  return group?.metrics.find(m => m.key === key);
};

export const getPrimaryMetric = (groupId: string): MetricDefinition | undefined => {
  const group = getMetricGroup(groupId);
  return group?.metrics[0];
};

// Get all metric IDs for a group (for tabs)
export const getMetricIds = (groupId: string): string[] => {
  const group = getMetricGroup(groupId);
  return group?.metrics.map(m => m.id) || [];
};
