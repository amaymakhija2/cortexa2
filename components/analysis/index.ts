// =============================================================================
// ANALYSIS TABS - BARREL EXPORT
// =============================================================================
// Central export for all analysis tab components.
// =============================================================================

export { FinancialAnalysisTab } from './FinancialAnalysisTab';
export { SessionsAnalysisTab } from './SessionsAnalysisTab';
export { CapacityClientTab } from './CapacityClientTab';

// Export all types
export type {
  TimePeriod,
  TabConfig,
  TimePeriodConfig,
  RevenueDataPoint,
  RevenueBreakdownDataPoint,
  ClinicianRevenueDataPoint,
  SessionsDataPoint,
  ClinicianSessionsDataPoint,
  ClientGrowthDataPoint,
  GenderData,
  SessionFrequencyData,
  OpenSlotsDataPoint,
  HoursUtilizationDataPoint,
  BaseAnalysisTabProps,
  FinancialAnalysisTabProps,
  SessionsAnalysisTabProps,
  CapacityClientTabProps,
} from './types';
