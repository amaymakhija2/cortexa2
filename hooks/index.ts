// API data fetching hooks
export { useMetrics, type DashboardMetrics, type UseMetricsResult } from './useMetrics';
export {
  useClinicianMetricsForPeriod,
  useClinicianMetricsForMonth,
  type ClinicianMetricsCalculated,
  type UseClinicianMetricsResult,
} from './useClinicianMetrics';
export { useDataDateRange, type DataDateRange, type UseDataDateRangeResult } from './useDataDateRange';
export { useMonthlyData, type MonthlyDataPoint, type UseMonthlyDataResult } from './useMonthlyData';
export {
  useCompareMetrics,
  useCompareMetricsAggregate,
  useCompareMetricsPointInTime,
  getDimensionOptions,
  type CompareDimension,
  type CompareViewMode,
  type AggregateMetrics,
  type PointInTimeMetrics,
  type CompareData,
  type CompareDataAggregate,
  type CompareDataPointInTime,
} from './useCompareMetrics';

// Existing hooks
export { useIsMobile } from './useIsMobile';
export { useResponsiveChartSizes } from './useResponsiveChartSizes';
