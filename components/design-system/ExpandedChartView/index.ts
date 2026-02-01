// =============================================================================
// EXPANDED CHART VIEW
// =============================================================================
// Full-screen split view component that replaces the modal-only expanded charts.
// Left panel: Interactive chart with clickable bars/segments
// Right panel: Data table with client-level breakdown, search, and sorting
// =============================================================================

export { ExpandedChartView } from './ExpandedChartView';
export type { ExpandedChartViewProps, ChartType, SelectedPeriod } from './ExpandedChartView';

export { ChartPanel } from './ChartPanel';
export type { ChartPanelProps } from './ChartPanel';

export { DataPanel } from './DataPanel';
export type { DataPanelProps, ClientBreakdownRow } from './DataPanel';

export { DataTable } from './DataTable';
export type { DataTableProps, SortConfig, DataTableColumn, DataTableRow } from './DataTable';
