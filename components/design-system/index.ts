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

export { SectionHeader } from './layout/SectionHeader';
export type { SectionHeaderProps, SectionAccent } from './layout/SectionHeader';

export { SectionContainer, SectionDivider } from './layout/SectionContainer';
export type { SectionContainerProps, SectionDividerProps } from './layout/SectionContainer';

export { AnimatedSection, AnimatedGrid, AnimatedPageContent } from './layout/AnimatedSection';
export type { AnimatedSectionProps, AnimatedGridProps, AnimatedPageContentProps } from './layout/AnimatedSection';

// Card Components
export { StatCard, StatCardWithBreakdown } from './cards/StatCard';
export type { StatCardProps, StatVariant, StatCardWithBreakdownProps } from './cards/StatCard';

export { ChartCard, SimpleChartCard, ExpandedChartModal } from './cards/ChartCard';
export type { ChartCardProps, SimpleChartCardProps, ExpandedChartModalProps, LegendItem, InsightItem, MetricIndicator } from './cards/ChartCard';

export { CompactCard, StackedBarCard, MetricListCard } from './cards/CompactCard';
export type { CompactCardProps, StackedBarCardProps, StackedBarSegment, MetricListCardProps, MetricItem } from './cards/CompactCard';

export { DonutChartCard } from './cards/DonutChartCard';
export type { DonutChartCardProps, DonutSegment, ValueFormat } from './cards/DonutChartCard';

export { DataTableCard } from './cards/DataTableCard';
export type { DataTableCardProps, DataTableSize, TableColumn, TableRow } from './cards/DataTableCard';

export { SplitBarCard } from './cards/SplitBarCard';
export type { SplitBarCardProps, SplitBarSegment } from './cards/SplitBarCard';

export { CohortSelector } from './cards/CohortSelector';
export type { CohortSelectorProps, CohortOption, CohortMaturity } from './cards/CohortSelector';

export { ActionableClientListCard } from './cards/ActionableClientListCard';
export type { ActionableClientListCardProps, Badge, ClientRowProps } from './cards/ActionableClientListCard';
export type { AccentColor as ClientListAccentColor } from './cards/ActionableClientListCard';

export { AtRiskClientsCard } from './cards/AtRiskClientsCard';
export type { AtRiskClientsCardProps, AtRiskClient } from './cards/AtRiskClientsCard';

export { MilestoneOpportunityCard } from './cards/MilestoneOpportunityCard';
export type { MilestoneOpportunityCardProps, ApproachingClient } from './cards/MilestoneOpportunityCard';

export { DefinitionsBar } from './cards/DefinitionsBar';
export type { DefinitionsBarProps, Definition } from './cards/DefinitionsBar';

export { FirstSessionDropoffCard } from './cards/FirstSessionDropoffCard';
export type { FirstSessionDropoffCardProps } from './cards/FirstSessionDropoffCard';

export { FrequencyRetentionCard } from './cards/FrequencyRetentionCard';
export type { FrequencyRetentionCardProps, FrequencyData } from './cards/FrequencyRetentionCard';

export { ComingSoonCard } from './cards/ComingSoonCard';
export type { ComingSoonCardProps, ComingSoonAccent } from './cards/ComingSoonCard';

export { InsightCard } from './cards/InsightCard';
export type { InsightCardProps, InsightSentiment } from './cards/InsightCard';

export { ExecutiveSummary } from './cards/ExecutiveSummary';
export type { ExecutiveSummaryProps, KeyMetric } from './cards/ExecutiveSummary';

export { MetricCard, ExpandableBarChart } from './cards/MetricCard';
export type { MetricCardProps, MetricStatus, ExpandableBarChartProps, BarChartItem } from './cards/MetricCard';

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
  ReferenceLineConfig,
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
