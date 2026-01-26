// =============================================================================
// ANALYSIS TABS - SHARED TYPES
// =============================================================================
// Shared type definitions for all analysis tab components.
// =============================================================================

export type TimePeriod =
  | 'last-12-months'
  | 'this-year'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-month'
  | 'last-month'
  | '2024'
  | '2023'
  | 'custom';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
}

export interface TimePeriodConfig {
  id: TimePeriod;
  label: string;
}

// =============================================================================
// FINANCIAL TAB DATA TYPES
// =============================================================================

export interface RevenueDataPoint {
  month: string;
  value: number;
}

export interface RevenueBreakdownDataPoint {
  month: string;
  grossRevenue: number;
  clinicianCosts: number;
  supervisorCosts: number;
  creditCardFees: number;
  netRevenue: number;
}

export interface ClinicianRevenueDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
}

// =============================================================================
// SESSIONS TAB DATA TYPES
// =============================================================================

export interface SessionsDataPoint {
  month: string;
  completed: number;
  booked: number;
  clients: number;
  cancelled: number;
  clinicianCancelled: number;
  lateCancelled: number;
  noShow: number;
  show: number;
  telehealth: number;
  inPerson: number;
}

export interface ClinicianSessionsDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
}

// =============================================================================
// CAPACITY & CLIENT TAB DATA TYPES
// =============================================================================

export interface ClientGrowthDataPoint {
  month: string;
  activeClients: number;
  capacity: number;
  retained: number;
  new: number;
  churned: number;
  withNextAppt: number;
}

export interface GenderData {
  male: number;
  female: number;
  other: number;
  total: number;
}

export interface SessionFrequencyData {
  weekly: number;
  biweekly: number;
  monthly: number;
  total: number;
}

export interface OpenSlotsDataPoint {
  month: string;
  value: number;
}

export interface HoursUtilizationDataPoint {
  month: string;
  percentage: number;
}

// =============================================================================
// COMMON PROPS FOR ALL ANALYSIS TABS
// =============================================================================

import type { TimeSelectorValue } from '../design-system/controls/TimeSelector';

export interface BaseAnalysisTabProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  timePeriods: TimePeriodConfig[];
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  getDateRangeLabel: () => string;
  /** TimeSelector value for the header */
  timeSelection: TimeSelectorValue;
  /** TimeSelector change handler */
  onTimeSelectionChange: (value: TimeSelectorValue) => void;
}

// =============================================================================
// COHORT LTV DATA TYPES
// =============================================================================

export interface CohortLTVDataPoint {
  /** Month since cohort start (0, 1, 2, etc.) */
  month: number;
  /** LTV for current year cohorts */
  currentYear: number | null;
  /** LTV for prior year cohorts */
  priorYear: number | null;
}

export interface CohortLTVData {
  /** Current year label (e.g., "2025") */
  currentYearLabel: string;
  /** Prior year label (e.g., "2024") */
  priorYearLabel: string;
  /** LTV data points by month since start */
  data: CohortLTVDataPoint[];
  /** Current year average LTV (latest available month) */
  currentYearAvgLTV: number;
  /** Prior year average LTV at month 12 */
  priorYearAvgLTV: number;
}

// =============================================================================
// FINANCIAL TAB PROPS
// =============================================================================

export interface FinancialAnalysisTabProps extends BaseAnalysisTabProps {
  revenueData: RevenueDataPoint[];
  revenueBreakdownData: RevenueBreakdownDataPoint[];
  clinicianRevenueData: ClinicianRevenueDataPoint[];
  /** Cohort LTV comparison data (current year vs prior year) */
  cohortLTVData?: CohortLTVData;
  /** Sessions data for calculating avg revenue per session */
  sessionsData?: SessionsDataPoint[];
}

// =============================================================================
// SESSIONS TAB PROPS
// =============================================================================

export interface SessionsAnalysisTabProps extends BaseAnalysisTabProps {
  sessionsData: SessionsDataPoint[];
  clinicianSessionsData: ClinicianSessionsDataPoint[];
}

// =============================================================================
// CAPACITY & CLIENT TAB PROPS
// =============================================================================

export interface CapacityClientTabProps extends BaseAnalysisTabProps {
  clientGrowthData: ClientGrowthDataPoint[];
  genderData: GenderData;
  sessionFrequencyData: SessionFrequencyData;
  openSlotsData: OpenSlotsDataPoint[];
  hoursUtilizationData: HoursUtilizationDataPoint[];
}

// =============================================================================
// RETENTION TAB DATA TYPES
// =============================================================================

export interface ChurnByClinicianDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
  total: number;
}

export interface ChurnTimingDataPoint {
  month: string;
  earlyChurn: number;
  mediumChurn: number;
  lateChurn: number;
}

/**
 * Hero metrics for retention analysis
 */
export interface RetentionMetrics {
  /** Average client tenure in months (across discharged clients) */
  avgTenureMonths: number;
  /** Average sessions per client before discharge */
  avgSessionsPerClient: number;
  /** Percentage of new clients who reach session 5 */
  session5RetentionRate: number;
  /** Percentage of new clients who stay 3+ months */
  threeMonthRetentionRate: number;
  /** Total number of discharged clients (for context) */
  totalDischargedClients: number;
}

/**
 * Funnel stage data for retention visualization
 */
export interface FunnelStageData {
  label: string;
  count: number;
  percentage: number;
}

/**
 * Retention funnel data for both sessions and time views
 */
export interface RetentionFunnelData {
  sessionsFunnel: FunnelStageData[];
  timeFunnel: FunnelStageData[];
}

/**
 * Summary data for a selected cohort
 */
export interface CohortSummaryData {
  /** Total clients acquired in this cohort */
  clientsAcquired: number;
  /** Clients who have churned from this cohort */
  clientsChurned: number;
  /** Currently active clients from this cohort */
  activeClients: number;
  /** Average sessions per client (ALL clients, not just churned) */
  avgSessionsPerClient: number;
}

/**
 * Cohort option for retention analysis
 */
export interface RetentionCohort {
  id: string;
  label: string;
  sublabel?: string;
  clientCount: number;
  maturity: 'mature' | 'partial' | 'immature';
  availableDate?: string;
  recommended?: boolean;
  /** Summary data for this cohort */
  summary?: CohortSummaryData;
}

/**
 * At-risk client for current health section
 */
export interface AtRiskClientData {
  id: string;
  name: string;
  daysSinceLastSession: number;
  totalSessions: number;
  clinician: string;
  riskLevel: 'high' | 'medium' | 'low';
}

/**
 * Client approaching a milestone
 */
export interface ApproachingMilestoneClient {
  id: string;
  name: string;
  currentSessions: number;
  targetMilestone: number;
  sessionsToGo: number;
  nextAppointment?: string;
  clinician: string;
}

/**
 * Current health metrics for retention
 */
export interface CurrentHealthData {
  /** Clients without upcoming appointments */
  atRiskClients: AtRiskClientData[];
  /** Clients approaching session 5 milestone */
  approachingSession5: ApproachingMilestoneClient[];
  /** Current rebook rate data */
  rebookRateData: { month: string; rate: number }[];
  /** Average rebook rate */
  avgRebookRate: number;
  /** Total active clients */
  totalActiveClients: number;
}

/**
 * Session 1 → 2 dropoff data
 */
export interface FirstSessionDropoffData {
  /** Clients who had session 1 */
  session1Count: number;
  /** Clients who returned for session 2 */
  session2Count: number;
  /** Industry benchmark percentage */
  benchmarkPercentage: number;
}

/**
 * Frequency and retention correlation data
 */
export interface FrequencyRetentionDataPoint {
  /** Frequency type */
  frequency: 'weekly' | 'biweekly' | 'monthly';
  /** Display label */
  label: string;
  /** Average sessions before churn */
  avgSessions: number;
  /** Number of clients in this category */
  clientCount: number;
  /** Average tenure in months */
  avgTenureMonths: number;
}

/**
 * Benchmark data for retention metrics
 */
export interface RetentionBenchmarks {
  /** Industry average churn rate (percentage) */
  avgChurnRate: number;
  /** Industry average client tenure (sessions) */
  avgClientTenure: number;
  /** Industry average session 5 retention */
  avgSession5Retention: number;
  /** Frequency retention multiplier range */
  frequencyMultiplierRange: string;
}

/**
 * Churn distribution by gender (for comparison with client distribution)
 */
export interface ChurnByGenderData {
  male: number;
  female: number;
  other: number;
  total: number;
}

/**
 * Churn distribution by frequency (for comparison with client distribution)
 */
export interface ChurnByFrequencyData {
  weekly: number;
  biweekly: number;
  monthly: number;
  total: number;
}

// =============================================================================
// RETENTION TAB PROPS
// =============================================================================

export interface RetentionTabProps {
  /** Available cohort options */
  cohorts: RetentionCohort[];
  /** Tab navigation */
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** TimeSelector value for the header */
  timeSelection: TimeSelectorValue;
  /** TimeSelector change handler */
  onTimeSelectionChange: (value: TimeSelectorValue) => void;
  /** Churn data by clinician */
  churnByClinicianData: ChurnByClinicianDataPoint[];
  /** Churn timing breakdown */
  churnTimingData: ChurnTimingDataPoint[];
  /** Retention funnel data */
  retentionFunnelData: RetentionFunnelData;
  /** Current health data */
  currentHealthData: CurrentHealthData;
  /** First session dropoff data */
  firstSessionDropoffData: FirstSessionDropoffData;
  /** Benchmark data for comparisons */
  benchmarks: RetentionBenchmarks;
  /** Client gender distribution */
  clientGenderData: GenderData;
  /** Churn by gender distribution */
  churnByGenderData: ChurnByGenderData;
  /** Client frequency distribution */
  clientFrequencyData: SessionFrequencyData;
  /** Churn by frequency distribution */
  churnByFrequencyData: ChurnByFrequencyData;
}

// =============================================================================
// CONSULTATIONS TAB DATA TYPES
// =============================================================================

/**
 * Monthly consultation data point
 */
export interface ConsultationsDataPoint {
  month: string;
  /** Total consultations received */
  consultations: number;
  /** Consultations that converted to active clients */
  converted: number;
  /** Total days from consultation to first session (for calculating average) */
  totalDaysToFirstSession: number;
  /** Number of conversions with first session data (for averaging) */
  conversionsWithFirstSession: number;
}

/**
 * Consultation by clinician breakdown
 */
export interface ConsultationsByClinicianDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
}

/**
 * Consultation source/channel data
 */
export interface ConsultationSourceData {
  source: string;
  consultations: number;
  converted: number;
  conversionRate: number;
}

/**
 * Current pipeline data
 */
export interface ConsultationPipelineData {
  /** Active consultations in pipeline */
  activePipeline: number;
  /** Consultations by stage */
  byStage: {
    stage: string;
    count: number;
    avgDaysInStage: number;
  }[];
}

/**
 * Consultation funnel data - where people drop off
 */
export interface ConsultationFunnelData {
  /** Total consultations booked */
  booked: number;
  /** Attended the consultation */
  attended: number;
  /** Booked intake after consultation */
  bookedIntake: number;
  /** Completed paperwork */
  completedPaperwork: number;
  /** Had first session (converted) */
  firstSession: number;
}

// =============================================================================
// CONSULTATIONS TAB PROPS
// =============================================================================

export interface ConsultationsAnalysisTabProps extends BaseAnalysisTabProps {
  /** Monthly consultations data */
  consultationsData: ConsultationsDataPoint[];
  /** Consultations by clinician */
  consultationsByClinicianData: ConsultationsByClinicianDataPoint[];
  /** Source breakdown */
  sourceData: ConsultationSourceData[];
  /** Current pipeline status */
  pipelineData: ConsultationPipelineData;
  /** Funnel data showing drop-off at each stage */
  funnelData: ConsultationFunnelData;
}
