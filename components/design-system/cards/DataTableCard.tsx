import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Info } from 'lucide-react';

// =============================================================================
// DATA TABLE CARD COMPONENT
// =============================================================================
// Premium data table with luxury-level typography for excellent readability.
// Features large, scannable values with clear visual hierarchy.
// =============================================================================

export interface TableColumn {
  /** Unique key matching data keys */
  key: string;
  /** Column header text */
  header: string;
  /** Text alignment */
  align?: 'left' | 'right' | 'center';
  /** Style as totals column (bolder text) */
  isTotals?: boolean;
  /** Tooltip text explaining the metric */
  tooltip?: string;
}

// =============================================================================
// HEADER TOOLTIP COMPONENT
// =============================================================================

interface HeaderTooltipProps {
  text: string;
}

const HeaderTooltip: React.FC<HeaderTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      requestAnimationFrame(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = triggerRect.bottom + 8;
        let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

        // Keep tooltip within viewport horizontally
        if (left + tooltipRect.width > viewportWidth - 16) {
          left = viewportWidth - tooltipRect.width - 16;
        }
        if (left < 16) {
          left = 16;
        }

        // If tooltip would go below viewport, show above instead
        if (top + tooltipRect.height > viewportHeight - 16) {
          top = triggerRect.top - tooltipRect.height - 8;
        }

        setPosition({ top, left });
      });
    } else {
      setPosition(null);
    }
  }, [isVisible]);

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        ref={triggerRef}
        type="button"
        className="text-stone-500 hover:text-stone-700 transition-colors cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => e.preventDefault()}
        aria-label="More information"
      >
        <Info size={14} />
      </button>
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-[100000] w-72 transition-opacity duration-150 ${position ? 'opacity-100' : 'opacity-0'}`}
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
          }}
        >
          <div className="bg-stone-900 text-white rounded-xl px-4 py-3 shadow-2xl text-sm font-normal normal-case tracking-normal leading-relaxed text-left">
            {text}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
};

export interface TableRow {
  /** Unique identifier */
  id: string;
  /** Row label (first column) */
  label: string;
  /** Color indicator dot */
  indicator?: {
    /** Hex color code (e.g., '#3b82f6') */
    color: string;
  };
  /** Row values keyed by column key */
  values: Record<string, string | number>;
  /** Value color class (e.g., 'text-blue-600') - applies to all values in row */
  valueColor?: string;
  /** Highlight this row (for summary rows like Net Revenue) */
  isHighlighted?: boolean;
  /** Highlight color (tailwind color name: 'emerald', 'blue', etc.) */
  highlightColor?: string;
}

/** Size variant for different contexts */
export type DataTableSize = 'default' | 'lg';

export interface DataTableCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Table columns */
  columns: TableColumn[];
  /** Table rows */
  rows: TableRow[];
  /**
   * Size variant - 'default' for cards, 'lg' for expanded/fullscreen views
   * Controls font sizes, padding, and spacing
   */
  size?: DataTableSize;
  /** Show expand button */
  expandable?: boolean;
  /** Expand callback */
  onExpand?: () => void;
  /** Force mobile card view */
  forceMobileView?: boolean;
  /** Minimum height for the card */
  minHeight?: string;
  /** Additional className */
  className?: string;
}

// Size-based styling configurations - Compact for wide tables
const SIZE_CONFIG = {
  default: {
    // Container
    containerPadding: 'p-5 sm:p-6 xl:p-8 2xl:p-10',
    headerMargin: 'mb-6 xl:mb-8 2xl:mb-10',
    // Header text
    titleClass: 'text-2xl sm:text-3xl 2xl:text-4xl',
    subtitleClass: 'text-base sm:text-lg 2xl:text-xl',
    // Table header - Compact
    thClass: 'py-3 sm:py-4 2xl:py-5 px-3 sm:px-4 2xl:px-5 text-xs sm:text-sm 2xl:text-base',
    thFirstClass: 'py-3 sm:py-4 2xl:py-5 px-3 sm:px-4 2xl:px-5 text-xs sm:text-sm 2xl:text-base',
    // Table cells - Readable but compact
    tdPadding: 'py-4 sm:py-5 2xl:py-6 px-3 sm:px-4 2xl:px-5',
    cellTextClass: 'text-sm sm:text-base xl:text-lg 2xl:text-xl',
    labelTextClass: 'text-sm sm:text-base xl:text-lg 2xl:text-xl',
    // Indicator
    indicatorSize: 'w-2.5 h-2.5 sm:w-3 sm:h-3 2xl:w-4 2xl:h-4',
    indicatorGap: 'gap-2.5 sm:gap-3 2xl:gap-4',
  },
  lg: {
    // Container - no padding when inside ExpandedChartModal
    containerPadding: 'p-0',
    headerMargin: 'mb-10',
    // Header text - larger for expanded view
    titleClass: 'text-3xl sm:text-4xl xl:text-5xl',
    subtitleClass: 'text-lg sm:text-xl xl:text-2xl',
    // Table header - EXTRA LARGE for expanded
    thClass: 'py-6 px-6 text-base sm:text-lg',
    thFirstClass: 'py-6 px-6 text-base sm:text-lg',
    // Table cells - HERO SIZED for expanded view
    tdPadding: 'py-6 sm:py-7 px-5 sm:px-6',
    cellTextClass: 'text-lg sm:text-xl xl:text-2xl',
    labelTextClass: 'text-lg sm:text-xl xl:text-2xl',
    // Indicator - LARGER
    indicatorSize: 'w-4 h-4 sm:w-5 sm:h-5',
    indicatorGap: 'gap-4 sm:gap-5',
  },
} as const;

/**
 * DataTableCard - Premium data table with excellent readability
 */
export const DataTableCard: React.FC<DataTableCardProps> = ({
  title,
  subtitle,
  columns,
  rows,
  size = 'default',
  expandable = false,
  onExpand,
  forceMobileView = false,
  minHeight,
  className = '',
}) => {
  const sizeConfig = SIZE_CONFIG[size];

  const getAlignClass = (align?: 'left' | 'right' | 'center') => {
    switch (align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  };

  const getHighlightBg = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50/70';
      case 'blue': return 'bg-blue-50/70';
      case 'amber': return 'bg-amber-50/70';
      case 'rose': return 'bg-rose-50/70';
      default: return 'bg-stone-50/70';
    }
  };

  const getHighlightTextColor = (color?: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-800';
      case 'blue': return 'text-blue-800';
      case 'amber': return 'text-amber-800';
      case 'rose': return 'text-rose-800';
      default: return 'text-stone-800';
    }
  };

  // For lg size inside ExpandedChartModal, use minimal container styling
  const containerStyle = size === 'lg'
    ? { minHeight: minHeight || undefined }
    : {
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        minHeight: minHeight || undefined,
      };

  return (
    <div
      className={`${size === 'lg' ? '' : 'rounded-2xl xl:rounded-3xl'} ${sizeConfig.containerPadding} overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* Header */}
      {title && (
        <div className={`flex items-start justify-between ${sizeConfig.headerMargin}`}>
          <div>
            <h3
              className={`text-stone-900 ${sizeConfig.titleClass} font-bold tracking-tight`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className={`text-stone-600 ${sizeConfig.subtitleClass} mt-2 sm:mt-3`}>{subtitle}</p>
            )}
          </div>

          {expandable && (
            <button
              onClick={onExpand}
              className="p-3 sm:p-3.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Expand table"
            >
              <Maximize2 size={20} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden sm:block'}`}>
        <div
          className="overflow-x-auto rounded-xl"
          style={{
            background: 'rgba(250, 250, 249, 0.5)',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
          }}
        >
          <table className="w-full min-w-max">
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(180deg, rgba(245, 245, 244, 0.8) 0%, rgba(250, 250, 249, 0.4) 100%)',
                }}
              >
                {/* Header for label column */}
                <th
                  className={`text-left ${sizeConfig.thFirstClass} font-semibold text-stone-600 uppercase tracking-wider`}
                  style={{
                    borderBottom: '2px solid rgba(214, 211, 209, 0.5)',
                    width: '40%',
                  }}
                >
                  Metric
                </th>
                {columns.map((col, index) => (
                  <th
                    key={col.key}
                    className={`${sizeConfig.thClass} font-semibold uppercase tracking-wider whitespace-nowrap ${
                      col.isTotals ? 'text-stone-800' : 'text-stone-600'
                    }`}
                    style={{
                      borderBottom: '2px solid rgba(214, 211, 209, 0.5)',
                      textAlign: col.align || 'left',
                      width: `${60 / columns.length}%`,
                      ...(col.isTotals && {
                        background: 'rgba(245, 245, 244, 0.6)',
                      }),
                    }}
                  >
                    <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      {col.header}
                      {col.tooltip && <HeaderTooltip text={col.tooltip} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const isLast = rowIndex === rows.length - 1;
                const rowBg = row.isHighlighted ? getHighlightBg(row.highlightColor) : '';
                const highlightTextColor = row.isHighlighted ? getHighlightTextColor(row.highlightColor) : '';

                return (
                  <tr
                    key={row.id}
                    className={`${rowBg} transition-colors duration-150 group`}
                    style={{
                      borderBottom: !isLast ? '1px solid rgba(231, 229, 228, 0.7)' : undefined,
                    }}
                  >
                    {/* Row label with optional indicator */}
                    <td
                      className={`${sizeConfig.tdPadding} group-hover:bg-stone-50/50 whitespace-nowrap`}
                      style={{ width: '40%' }}
                    >
                      <div className={`flex items-center ${sizeConfig.indicatorGap}`}>
                        {row.indicator && (
                          <div
                            className={`${sizeConfig.indicatorSize} rounded-full flex-shrink-0`}
                            style={{
                              backgroundColor: row.indicator.color,
                              boxShadow: `0 0 12px ${row.indicator.color}50, 0 2px 4px ${row.indicator.color}30`,
                            }}
                          />
                        )}
                        <span
                          className={`${sizeConfig.labelTextClass} font-semibold ${
                            row.isHighlighted && highlightTextColor
                              ? highlightTextColor
                              : 'text-stone-800'
                          }`}
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {row.label}
                        </span>
                      </div>
                    </td>

                    {/* Data cells */}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${sizeConfig.tdPadding} ${sizeConfig.cellTextClass} tabular-nums whitespace-nowrap group-hover:bg-stone-50/50 ${
                          col.isTotals
                            ? `font-bold ${row.valueColor || 'text-stone-900'}`
                            : `${row.isHighlighted ? 'font-bold' : 'font-medium'} ${row.valueColor || 'text-stone-700'}`
                        }`}
                        style={{
                          textAlign: col.align || 'left',
                          ...(col.isTotals && !row.isHighlighted && {
                            background: 'rgba(245, 245, 244, 0.4)',
                          }),
                        }}
                      >
                        {row.values[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Also improved */}
      <div className={`${forceMobileView ? 'block' : 'block sm:hidden'} space-y-4`}>
        {rows.map((row) => {
          const cardBg = row.isHighlighted && row.highlightColor
            ? `bg-${row.highlightColor}-50 border-${row.highlightColor}-200`
            : 'bg-white border-stone-200';

          return (
            <div
              key={row.id}
              className={`rounded-2xl p-5 border-2 ${cardBg}`}
              style={{
                boxShadow: row.isHighlighted
                  ? '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
                  : '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Card Header with Label */}
              <div className="flex items-center gap-3 mb-4">
                {row.indicator && (
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: row.indicator.color,
                      boxShadow: `0 0 10px ${row.indicator.color}40`,
                    }}
                  />
                )}
                <span
                  className={`text-lg font-bold ${
                    row.isHighlighted && row.highlightColor
                      ? `text-${row.highlightColor}-800`
                      : 'text-stone-800'
                  }`}
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {row.label}
                </span>
              </div>

              {/* Values Grid - LARGER text */}
              <div className="grid grid-cols-2 gap-3">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`flex flex-col ${col.isTotals ? 'bg-stone-50 rounded-xl p-3 -m-1' : ''}`}
                  >
                    <span className="text-stone-600 text-sm font-semibold uppercase tracking-wide mb-1 inline-flex items-center">
                      {col.header}
                      {col.tooltip && <HeaderTooltip text={col.tooltip} />}
                    </span>
                    <span
                      className={`text-lg tabular-nums ${
                        col.isTotals
                          ? `font-bold ${row.valueColor || 'text-stone-900'}`
                          : `font-semibold ${row.valueColor || 'text-stone-700'}`
                      }`}
                    >
                      {row.values[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataTableCard;
