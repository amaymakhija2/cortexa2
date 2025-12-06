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

// Existing hooks
export { useIsMobile } from './useIsMobile';
export { useResponsiveChartSizes } from './useResponsiveChartSizes';
