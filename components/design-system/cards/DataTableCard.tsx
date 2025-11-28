import React from 'react';
import { Maximize2 } from 'lucide-react';

// =============================================================================
// DATA TABLE CARD COMPONENT
// =============================================================================
// Premium data table with responsive card view for mobile.
// Features row indicators, hover states, totals column, and highlighted rows.
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
}

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
  /** Additional className */
  className?: string;
}

// Size-based styling configurations
const SIZE_CONFIG = {
  default: {
    // Container
    containerPadding: 'p-5 sm:p-6 xl:p-8',
    headerMargin: 'mb-6 xl:mb-8',
    // Header text
    titleClass: 'text-2xl sm:text-3xl xl:text-4xl',
    subtitleClass: 'text-base sm:text-lg',
    // Table header
    thClass: 'py-4 px-3 text-xs',
    // Table cells
    tdPadding: 'py-4 px-3',
    cellTextClass: 'text-sm',
    labelTextClass: 'text-sm',
    // Indicator
    indicatorSize: 'w-2.5 h-2.5',
    indicatorGap: 'gap-2.5',
  },
  lg: {
    // Container - more padding for expanded view
    containerPadding: 'p-0', // No padding when inside ExpandedChartModal (it provides its own)
    headerMargin: 'mb-8',
    // Header text - larger for expanded view
    titleClass: 'text-3xl sm:text-4xl xl:text-5xl',
    subtitleClass: 'text-lg sm:text-xl',
    // Table header - larger
    thClass: 'py-5 px-4 text-sm',
    // Table cells - larger text and more padding
    tdPadding: 'py-5 px-4',
    cellTextClass: 'text-base sm:text-lg',
    labelTextClass: 'text-base sm:text-lg',
    // Indicator - larger
    indicatorSize: 'w-3.5 h-3.5',
    indicatorGap: 'gap-3',
  },
} as const;

/**
 * DataTableCard - Premium data table with responsive design
 *
 * @example
 * <DataTableCard
 *   title="Revenue Breakdown"
 *   subtitle="Monthly financial summary"
 *   columns={[
 *     { key: 'jan', header: 'Jan', align: 'right' },
 *     { key: 'feb', header: 'Feb', align: 'right' },
 *     { key: 'total', header: 'Total', align: 'right', isTotals: true },
 *   ]}
 *   rows={[
 *     {
 *       id: 'gross',
 *       label: 'Gross Revenue',
 *       values: { jan: '$142k', feb: '$156k', total: '$298k' },
 *     },
 *     {
 *       id: 'costs',
 *       label: 'Clinician Cost',
 *       indicator: { color: '#3b82f6' },
 *       values: { jan: '$63k', feb: '$69k', total: '$132k' },
 *       valueColor: 'text-blue-600',
 *     },
 *     {
 *       id: 'net',
 *       label: 'Net Revenue',
 *       indicator: { color: '#10b981' },
 *       values: { jan: '$79k', feb: '$87k', total: '$166k' },
 *       valueColor: 'text-emerald-600',
 *       isHighlighted: true,
 *       highlightColor: 'emerald',
 *     },
 *   ]}
 *   expandable
 * />
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
  className = '',
}) => {
  // Get size configuration
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
      case 'emerald': return 'bg-emerald-50/60';
      case 'blue': return 'bg-blue-50/60';
      case 'amber': return 'bg-amber-50/60';
      case 'rose': return 'bg-rose-50/60';
      default: return 'bg-stone-50/60';
    }
  };

  // For lg size inside ExpandedChartModal, use minimal container styling
  const containerStyle = size === 'lg'
    ? {}
    : {
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      };

  return (
    <div
      className={`${size === 'lg' ? '' : 'rounded-2xl xl:rounded-3xl'} ${sizeConfig.containerPadding} overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* Header - only show if title exists */}
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
              <p className={`text-stone-500 ${sizeConfig.subtitleClass} mt-2`}>{subtitle}</p>
            )}
          </div>

          {expandable && (
            <button
              onClick={onExpand}
              className="p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Expand table"
            >
              <Maximize2 size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden sm:block'}`}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-stone-200/80">
                {/* Empty header for label column */}
                <th className={`text-left ${sizeConfig.thClass} font-bold text-stone-400 uppercase tracking-wider`}></th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${sizeConfig.thClass} font-bold uppercase tracking-wider ${getAlignClass(col.align)} ${
                      col.isTotals ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const isLast = rowIndex === rows.length - 1;
                const rowBg = row.isHighlighted ? getHighlightBg(row.highlightColor) : '';

                return (
                  <tr
                    key={row.id}
                    className={`${!isLast ? 'border-b border-stone-100' : ''} ${rowBg} hover:bg-stone-50/80 transition-colors duration-150`}
                  >
                    {/* Row label with optional indicator */}
                    <td className={sizeConfig.tdPadding}>
                      <div className={`flex items-center ${sizeConfig.indicatorGap}`}>
                        {row.indicator && (
                          <div
                            className={`${sizeConfig.indicatorSize} rounded-full flex-shrink-0`}
                            style={{
                              backgroundColor: row.indicator.color,
                              boxShadow: `0 0 8px ${row.indicator.color}40`,
                            }}
                          />
                        )}
                        <span
                          className={`${sizeConfig.labelTextClass} font-semibold ${
                            row.isHighlighted && row.highlightColor
                              ? `text-${row.highlightColor}-700`
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
                        className={`${sizeConfig.tdPadding} ${sizeConfig.cellTextClass} tabular-nums ${getAlignClass(col.align)} ${
                          col.isTotals
                            ? `font-bold ${row.valueColor || 'text-stone-900'}`
                            : `${row.isHighlighted ? 'font-bold' : 'font-medium'} ${row.valueColor || 'text-stone-600'}`
                        }`}
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

      {/* Mobile Card View */}
      <div className={`${forceMobileView ? 'block' : 'block sm:hidden'} space-y-3`}>
        {rows.map((row) => {
          const cardBg = row.isHighlighted && row.highlightColor
            ? `bg-${row.highlightColor}-50 border-${row.highlightColor}-200`
            : 'bg-white border-stone-200';

          return (
            <div
              key={row.id}
              className={`rounded-xl p-4 border shadow-sm ${cardBg}`}
            >
              {/* Card Header with Label */}
              <div className="flex items-center gap-2.5 mb-3">
                {row.indicator && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: row.indicator.color,
                      boxShadow: `0 0 8px ${row.indicator.color}40`,
                    }}
                  />
                )}
                <span
                  className={`text-sm font-semibold ${
                    row.isHighlighted && row.highlightColor
                      ? `text-${row.highlightColor}-800`
                      : 'text-stone-800'
                  }`}
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {row.label}
                </span>
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between items-center">
                    <span className="text-stone-500 text-xs uppercase tracking-wide">
                      {col.header}
                    </span>
                    <span
                      className={`tabular-nums ${
                        col.isTotals
                          ? `font-bold ${row.valueColor || 'text-stone-900'}`
                          : `font-medium ${row.valueColor || 'text-stone-700'}`
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
