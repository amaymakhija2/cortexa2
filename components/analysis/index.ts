// =============================================================================
// ANALYSIS TABS - BARREL EXPORT
// =============================================================================
// Central export for all analysis tab components.
// =============================================================================

export { FinancialAnalysisTab } from './FinancialAnalysisTab';
export { SessionsAnalysisTab } from './SessionsAnalysisTab';
export { CapacityClientTab } from './CapacityClientTab';
export { RetentionTab } from './RetentionTab';
export { InsuranceTab } from './InsuranceTab';
export { AdminTab } from './AdminTab';
export { ConsultationsAnalysisTab } from './ConsultationsAnalysisTab';

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
  ChurnByClinicianDataPoint,
  ChurnTimingDataPoint,
  BaseAnalysisTabProps,
  FinancialAnalysisTabProps,
  SessionsAnalysisTabProps,
  CapacityClientTabProps,
  RetentionTabProps,
  ConsultationsDataPoint,
  ConsultationsByClinicianDataPoint,
  ConsultationSourceData,
  ConsultationPipelineData,
  ConsultationsAnalysisTabProps,
} from './types';
