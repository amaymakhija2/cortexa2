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

export interface BaseAnalysisTabProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  timePeriods: TimePeriodConfig[];
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  getDateRangeLabel: () => string;
}

// =============================================================================
// FINANCIAL TAB PROPS
// =============================================================================

export interface FinancialAnalysisTabProps extends BaseAnalysisTabProps {
  revenueData: RevenueDataPoint[];
  revenueBreakdownData: RevenueBreakdownDataPoint[];
  clinicianRevenueData: ClinicianRevenueDataPoint[];
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
