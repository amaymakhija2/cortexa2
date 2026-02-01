import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// =============================================================================
// DATA TABLE COMPONENT
// =============================================================================
// Clean, minimal data table with precise alignment and refined typography.
// Designed for the right panel of ExpandedChartView.
// =============================================================================

export interface DataTableColumn {
  /** Unique key matching data keys */
  key: string;
  /** Column header text */
  header: string;
  /** Text alignment */
  align?: 'left' | 'right' | 'center';
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Format function for cell values */
  format?: (value: string | number) => string;
  /** Width hint (e.g., 'w-24', 'flex-1') */
  width?: string;
}

export interface DataTableRow {
  /** Unique identifier */
  id: string;
  /** Row values keyed by column key */
  values: Record<string, string | number | null>;
  /** Optional status indicator */
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps {
  /** Table columns configuration */
  columns: DataTableColumn[];
  /** Table rows data */
  rows: DataTableRow[];
  /** Current search filter (applied externally) */
  searchFilter?: string;
  /** Initial sort configuration */
  defaultSort?: SortConfig;
  /** Callback when sort changes */
  onSortChange?: (sort: SortConfig | null) => void;
  /** Summary row data (displayed at bottom) */
  summary?: Record<string, string | number>;
  /** Summary label (first column) */
  summaryLabel?: string;
  /** Additional className */
  className?: string;
}

/**
 * DataTable - Clean, minimal sortable data table
 */
export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  searchFilter = '',
  defaultSort,
  onSortChange,
  summary,
  summaryLabel = 'Total',
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return rows;

    const search = searchFilter.toLowerCase();
    return rows.filter(row =>
      Object.values(row.values).some(val =>
        val !== null && String(val).toLowerCase().includes(search)
      )
    );
  }, [rows, searchFilter]);

  // Sort filtered rows
  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a.values[sortConfig.key];
      const bVal = b.values[sortConfig.key];

      if (aVal === null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal === null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortConfig]);

  // Handle column header click for sorting
  const handleSort = (column: DataTableColumn) => {
    if (!column.sortable) return;

    let newSort: SortConfig | null;

    if (sortConfig?.key === column.key) {
      if (sortConfig.direction === 'asc') {
        newSort = { key: column.key, direction: 'desc' };
      } else {
        newSort = null;
      }
    } else {
      newSort = { key: column.key, direction: 'asc' };
    }

    setSortConfig(newSort);
    onSortChange?.(newSort);
  };

  const getAlignClass = (align?: 'left' | 'right' | 'center') => {
    switch (align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  };

  // Calculate optimal column widths based on number of columns
  const getColumnWidths = () => {
    const totalCols = columns.length;
    // Client column gets proportionally less space as more columns are added
    // 3 cols: 35%, 4 cols: 30%, 5 cols: 26%, 6+ cols: 24%
    const clientWidth = totalCols <= 3 ? 35 : totalCols === 4 ? 30 : totalCols === 5 ? 26 : 24;
    const remainingWidth = 100 - clientWidth;
    const otherColWidth = remainingWidth / (totalCols - 1);

    return columns.map((_, idx) => idx === 0 ? `${clientWidth}%` : `${otherColWidth}%`);
  };

  const columnWidths = getColumnWidths();

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Table Container */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full table-fixed">
          {/* Column sizing */}
          <colgroup>
            {columns.map((col, idx) => (
              <col
                key={col.key}
                style={{ width: columnWidths[idx] }}
              />
            ))}
          </colgroup>

          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-stone-50 border-b border-stone-200">
              {columns.map((col) => {
                const isActive = sortConfig?.key === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`
                      py-3 px-4 text-[11px] font-semibold uppercase tracking-wide
                      ${getAlignClass(col.align)}
                      ${col.sortable ? 'cursor-pointer select-none hover:bg-stone-100 transition-colors' : ''}
                      ${isActive ? 'text-stone-900' : 'text-stone-500'}
                    `}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && isActive && (
                        sortConfig?.direction === 'asc'
                          ? <ArrowUp size={12} strokeWidth={2.5} />
                          : <ArrowDown size={12} strokeWidth={2.5} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-stone-100">
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-stone-400 text-sm"
                >
                  {searchFilter ? 'No matching clients' : 'No data'}
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-amber-50/30 transition-colors"
                >
                  {columns.map((col, colIdx) => {
                    const value = row.values[col.key];
                    const displayValue = col.format && value !== null
                      ? col.format(value)
                      : value ?? '—';
                    const isFirst = colIdx === 0;

                    return (
                      <td
                        key={col.key}
                        className={`
                          py-3 px-4 text-[13px]
                          ${getAlignClass(col.align)}
                          ${isFirst ? 'font-medium text-stone-800' : 'text-stone-600 tabular-nums'}
                        `}
                      >
                        {isFirst && row.status ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`
                                w-2 h-2 rounded-full flex-shrink-0
                                ${row.status === 'success' ? 'bg-emerald-500' : ''}
                                ${row.status === 'warning' ? 'bg-amber-500' : ''}
                                ${row.status === 'error' ? 'bg-rose-500' : ''}
                                ${row.status === 'info' ? 'bg-sky-500' : ''}
                              `}
                            />
                            <span className="truncate">{displayValue}</span>
                          </span>
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>

          {/* Summary Footer - inside same table for alignment */}
          {summary && sortedRows.length > 0 && (
            <tfoot className="sticky bottom-0 z-10">
              <tr className="bg-stone-50 border-t-2 border-stone-200">
                {columns.map((col, idx) => (
                  <td
                    key={col.key}
                    className={`
                      py-3 px-4 text-[13px] font-semibold
                      ${getAlignClass(col.align)}
                      ${idx === 0 ? 'text-stone-700' : 'text-stone-800 tabular-nums'}
                    `}
                  >
                    {idx === 0 ? summaryLabel : (
                      col.format && summary[col.key] !== undefined
                        ? col.format(summary[col.key])
                        : summary[col.key] ?? ''
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DataTable;
