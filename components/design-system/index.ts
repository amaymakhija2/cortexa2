// =============================================================================
// CORTEXA DESIGN SYSTEM
// =============================================================================
// Central export for all design system components.
// Import from this file for clean imports:
//
// import { PageHeader, Grid, StatCard, ChartCard } from './design-system';
// =============================================================================

// Layout Components
export { PageHeader } from './layout/PageHeader';
export type { PageHeaderProps, AccentColor, TimePeriod, Tab } from './layout/PageHeader';

export { Grid, Section, PageContent } from './layout/Grid';
export type { GridProps, GridColumns, SectionProps, PageContentProps } from './layout/Grid';

// Card Components
export { StatCard, StatCardWithBreakdown } from './cards/StatCard';
export type { StatCardProps, StatVariant, StatCardWithBreakdownProps } from './cards/StatCard';

export { ChartCard, SimpleChartCard, ExpandedChartModal } from './cards/ChartCard';
export type { ChartCardProps, SimpleChartCardProps, ExpandedChartModalProps, LegendItem, InsightItem } from './cards/ChartCard';

export { CompactCard, StackedBarCard, MetricListCard } from './cards/CompactCard';
export type { CompactCardProps, StackedBarCardProps, StackedBarSegment, MetricListCardProps, MetricItem } from './cards/CompactCard';

export { DonutChartCard } from './cards/DonutChartCard';
export type { DonutChartCardProps, DonutSegment, ValueFormat } from './cards/DonutChartCard';

export { DataTableCard } from './cards/DataTableCard';
export type { DataTableCardProps, DataTableSize, TableColumn, TableRow } from './cards/DataTableCard';

export { SplitBarCard } from './cards/SplitBarCard';
export type { SplitBarCardProps, SplitBarSegment } from './cards/SplitBarCard';

// Control Components
export { ToggleButton, GoalIndicator, ActionButton } from './controls';
export type { ToggleButtonProps, GoalIndicatorProps, GoalIndicatorColor, ActionButtonProps, ActionButtonVariant } from './controls';

// Chart Components
export { BarChart, LineChart, DivergingBarChart, RetentionFunnelChart, RetentionFunnelCard } from './charts';
export type {
  BarChartProps,
  BarChartDataPoint,
  BarChartSize,
  SegmentConfig,
  BarColorConfig,
  HoverInfo,
  LineChartProps,
  LineConfig,
  DivergingBarChartProps,
  DivergingBarDataPoint,
  DivergingBarConfig,
  RetentionFunnelChartProps,
  RetentionFunnelCardProps,
  RetentionFunnelData,
  FunnelStage,
  FunnelInsight,
} from './charts';

// Reference Page (for viewing in app)
export { Reference } from './Reference';
