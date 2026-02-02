// =============================================================================
// CLINICIAN DRAWER - EXPORTS
// =============================================================================

export { ClinicianDrawer } from './ClinicianDrawer';
export type { ClinicianDrawerProps, ClinicianData, ClinicianMetrics } from './ClinicianDrawer';

export { DrawerHeader } from './DrawerHeader';
export type { DrawerHeaderProps } from './DrawerHeader';

export { MetricTabs } from './MetricTabs';
export type { MetricTabsProps } from './MetricTabs';

export { MetricExplanation } from './MetricExplanation';
export type { MetricExplanationProps } from './MetricExplanation';

export { ProblemClientList } from './ProblemClientList';
export type { ProblemClientListProps, ProblemClient, ClinicianBreakdown } from './ProblemClientList';

export {
  METRIC_GROUPS,
  getMetricGroup,
  getMetricDefinition,
  getMetricByKey,
  getPrimaryMetric,
  getMetricIds,
} from './metricConfig';
export type { MetricDefinition, MetricGroupConfig, ColumnConfig } from './metricConfig';
