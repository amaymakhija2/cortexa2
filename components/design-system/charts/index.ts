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
export type { LineChartProps, LineConfig } from './LineChart';

export { DivergingBarChart } from './DivergingBarChart';
export type {
  DivergingBarChartProps,
  DivergingBarDataPoint,
  DivergingBarConfig,
} from './DivergingBarChart';

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
