import React, { useState, useEffect, useCallback } from 'react';
import { Minimize2 } from 'lucide-react';
import { ChartPanel } from './ChartPanel';
import { DataPanel } from './DataPanel';
import type { ClientBreakdownRow } from './DataPanel';
import type { DataTableColumn } from './DataTable';

// =============================================================================
// EXPANDED CHART VIEW COMPONENT
// =============================================================================
// Full-screen split view for detailed chart analysis.
// Left (~60%): Interactive chart with clickable bars/segments
// Right (~40%): Client-level data table with search and sort
// =============================================================================

export type ChartType = 'revenue' | 'sessions' | 'cancellations' | 'noshow' | 'attendance';

export interface SelectedPeriod {
  /** Period identifier (e.g., 'Jan', 'Feb') */
  value: string;
  /** Display label */
  label: string;
  /** Optional segment (for stacked/donut charts) */
  segment?: string;
}

export interface ExpandedChartViewProps {
  /** Whether the view is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** View title */
  title: string;
  /** View subtitle */
  subtitle?: string;
  /** Period options for dropdown */
  periodOptions: Array<{ value: string; label: string }>;
  /** Initially selected period */
  initialPeriod?: string;
  /** Callback when period selection changes (from dropdown or chart click) */
  onPeriodChange?: (period: SelectedPeriod) => void;
  /** Column configuration for data table */
  tableColumns: DataTableColumn[];
  /** Client data getter - called when period changes */
  getClientData: (period: string, segment?: string) => {
    rows: ClientBreakdownRow[];
    summary?: Record<string, string | number>;
    summaryLabel?: string;
  };
  /** Render prop for the chart - receives click handler */
  renderChart: (props: {
    onBarClick: (period: string, segment?: string) => void;
    selectedPeriod: string | null;
  }) => React.ReactNode;
  /** Optional legend to display */
  legend?: React.ReactNode;
}

/**
 * ExpandedChartView - Full-screen split view for chart analysis
 */
export const ExpandedChartView: React.FC<ExpandedChartViewProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  periodOptions,
  initialPeriod,
  onPeriodChange,
  tableColumns,
  getClientData,
  renderChart,
  legend,
}) => {
  // Selected period state
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    initialPeriod || periodOptions[periodOptions.length - 1]?.value || ''
  );
  const [selectedSegment, setSelectedSegment] = useState<string | undefined>();

  // Get client data for current selection
  const clientData = getClientData(selectedPeriod, selectedSegment);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle bar/segment click from chart
  const handleBarClick = useCallback((period: string, segment?: string) => {
    setSelectedPeriod(period);
    setSelectedSegment(segment);
    onPeriodChange?.({ value: period, label: period, segment });
  }, [onPeriodChange]);

  // Handle dropdown change
  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
    setSelectedSegment(undefined);
    onPeriodChange?.({ value: period, label: period });
  }, [onPeriodChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - full screen with sidebar offset via CSS variable */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{
          marginLeft: 'var(--sidebar-width, 72px)',
          backgroundColor: isAnimating ? 'rgba(28, 25, 23, 0.7)' : 'rgba(28, 25, 23, 0)',
          backdropFilter: isAnimating ? 'blur(12px)' : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? 'blur(12px)' : 'blur(0px)',
          transition: 'background-color 300ms ease, backdrop-filter 300ms ease',
        }}
        onClick={onClose}
      />

      {/* Modal Container - positioned with sidebar offset */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-5"
        style={{
          marginLeft: 'var(--sidebar-width, 72px)',
        }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[1400px] h-[90vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #fafaf9 50%, #f5f5f4 100%)',
            boxShadow: `
              0 50px 100px -20px rgba(0, 0, 0, 0.3),
              0 30px 60px -30px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
            transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Compact */}
          <div className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-stone-100">
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Legend */}
              {legend}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  bg-stone-100 hover:bg-stone-200
                  text-stone-600 hover:text-stone-800
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                "
                title="Close (Esc)"
              >
                <Minimize2 size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Content - Split View */}
          <div className="flex-1 min-h-0 flex flex-row p-4 gap-4">
            {/* Left Panel - Chart (60%) */}
            <div
              className="flex-[6] rounded-xl p-4 overflow-hidden flex flex-col min-w-0"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <ChartPanel selectedPeriod={selectedPeriod}>
                {renderChart({
                  onBarClick: handleBarClick,
                  selectedPeriod,
                })}
              </ChartPanel>
            </div>

            {/* Right Panel - Data Table (40%) */}
            <div
              className="flex-[4] rounded-xl overflow-hidden min-w-[320px]"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
              }}
            >
              <DataPanel
                title="Client Breakdown"
                periodOptions={periodOptions}
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                columns={tableColumns}
                rows={clientData.rows}
                summary={clientData.summary}
                summaryLabel={clientData.summaryLabel}
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 100% 0%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(ellipse at 0% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ExpandedChartView;
