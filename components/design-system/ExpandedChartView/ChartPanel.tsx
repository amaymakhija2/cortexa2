import React from 'react';

// =============================================================================
// CHART PANEL COMPONENT
// =============================================================================
// Left panel of ExpandedChartView displaying the interactive chart.
// Wraps chart children and provides visual styling for selected state.
// =============================================================================

export interface ChartPanelProps {
  /** Currently selected period (e.g., month label) */
  selectedPeriod: string | null;
  /** Chart content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * ChartPanel - Left panel wrapper for interactive charts
 */
export const ChartPanel: React.FC<ChartPanelProps> = ({
  selectedPeriod,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chart Container - fills available space */}
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>

      {/* Interaction Hint */}
      <p className="flex-shrink-0 mt-2 text-xs text-stone-400 text-center">
        Click bars to filter table
      </p>
    </div>
  );
};

export default ChartPanel;
