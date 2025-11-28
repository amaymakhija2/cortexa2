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

export interface DataTableCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Table columns */
  columns: TableColumn[];
  /** Table rows */
  rows: TableRow[];
  /** Show expand button */
  expandable?: boolean;
  /** Expand callback */
  onExpand?: () => void;
  /** Force mobile card view */
  forceMobileView?: boolean;
  /** Additional className */
  className?: string;
}

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
  expandable = false,
  onExpand,
  forceMobileView = false,
  className = '',
}) => {
  // Responsive hook would go here in real implementation
  // For now, using CSS breakpoints and optional force flag

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

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-5 sm:p-6 xl:p-8 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5 xl:mb-6">
        <div>
          <h3
            className="text-stone-800 text-lg sm:text-xl xl:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-sm sm:text-base mt-1">{subtitle}</p>
          )}
        </div>

        {expandable && (
          <button
            onClick={onExpand}
            className="p-2 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Expand table"
          >
            <Maximize2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden sm:block'}`}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-stone-200/80">
                {/* Empty header for label column */}
                <th className="text-left py-4 px-3 text-xs font-bold text-stone-400 uppercase tracking-wider"></th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-4 px-3 text-xs font-bold uppercase tracking-wider ${getAlignClass(col.align)} ${
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
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
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
                        className={`py-4 px-3 text-sm tabular-nums ${getAlignClass(col.align)} ${
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
