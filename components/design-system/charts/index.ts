// =============================================================================
// CHARTS - Design System
// =============================================================================
// Premium chart components with beautiful styling and interactions.
// =============================================================================

export { BarChart } from './BarChart';
export type {
  BarChartProps,
  BarChartDataPoint,
  BarChartSize,
  SegmentConfig,
  BarColorConfig,
  HoverInfo,
} from './BarChart';

export { LineChart } from './LineChart';
export type { LineChartProps, LineConfig, ReferenceLineConfig } from './LineChart';

export { DivergingBarChart } from './DivergingBarChart';
export type {
  DivergingBarChartProps,
  DivergingBarDataPoint,
  DivergingBarConfig,
} from './DivergingBarChart';

export { GroupedBarChart } from './GroupedBarChart';
export type {
  GroupedBarChartProps,
  GroupedBarDataPoint,
  GroupedBarConfig,
} from './GroupedBarChart';

export { RetentionFunnelChart, RetentionFunnelCard } from './RetentionFunnelChart';
export type {
  RetentionFunnelChartProps,
  RetentionFunnelCardProps,
  RetentionFunnelData,
  FunnelStage,
  FunnelInsight,
} from './RetentionFunnelChart';

export { useChartAnimation } from './useChartAnimation';
export type { ChartAnimationOptions, ChartAnimationResult } from './useChartAnimation';

export { OthersTooltip } from './OthersTooltip';
export type { OthersTooltipProps } from './OthersTooltip';
