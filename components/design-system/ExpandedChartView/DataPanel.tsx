import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { DataTable } from './DataTable';
import type { DataTableColumn, DataTableRow } from './DataTable';

// =============================================================================
// DATA PANEL COMPONENT
// =============================================================================
// Right panel of ExpandedChartView showing client-level breakdown.
// Clean, minimal design with dropdown selector, search, and data table.
// =============================================================================

export interface ClientBreakdownRow {
  id: string;
  name: string;
  values: Record<string, string | number | null>;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface DataPanelProps {
  title: string;
  periodOptions: Array<{ value: string; label: string }>;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  columns: DataTableColumn[];
  rows: ClientBreakdownRow[];
  summary?: Record<string, string | number>;
  summaryLabel?: string;
  className?: string;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  title,
  periodOptions,
  selectedPeriod,
  onPeriodChange,
  columns,
  rows,
  summary,
  summaryLabel,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const selectedLabel = periodOptions.find(opt => opt.value === selectedPeriod)?.label || selectedPeriod;

  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const tableRows: DataTableRow[] = rows.map(row => ({
    id: row.id,
    values: { name: row.name, ...row.values },
    status: row.status,
  }));

  const tableColumns: DataTableColumn[] = [
    { key: 'name', header: 'Client', align: 'left', sortable: true },
    ...columns,
  ];

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-stone-100">
        {/* Title Row with Dropdown */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-stone-800 tracking-tight">
            {title}
          </h3>

          {/* Period Dropdown */}
          <button
            ref={dropdownRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-xs font-medium
              border transition-all duration-150
              ${isDropdownOpen
                ? 'bg-stone-100 border-stone-300 text-stone-900'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
              }
            `}
          >
            <span>{selectedLabel}</span>
            <ChevronDown
              size={14}
              className={`text-stone-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Portal */}
          {isDropdownOpen && dropdownPosition && createPortal(
            <div
              ref={dropdownMenuRef}
              className="fixed z-[100000]"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
              }}
            >
              <div
                className="bg-white rounded-lg border border-stone-200 shadow-lg overflow-hidden"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                  animation: 'dropdownFade 100ms ease-out',
                }}
              >
                <div className="py-1 max-h-[240px] overflow-y-auto">
                  {periodOptions.map((option) => {
                    const isSelected = option.value === selectedPeriod;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          onPeriodChange(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs
                          transition-colors duration-75
                          ${isSelected
                            ? 'bg-amber-50 text-amber-800 font-medium'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }
                        `}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={14} className="text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="
              w-full pl-8 pr-8 py-2 rounded-lg
              bg-stone-50 border border-transparent
              text-xs text-stone-800 placeholder:text-stone-400
              focus:outline-none focus:bg-white focus:border-stone-200 focus:ring-1 focus:ring-stone-200
              transition-all duration-150
            "
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-0">
        <DataTable
          columns={tableColumns}
          rows={tableRows}
          searchFilter={searchQuery}
          summary={summary ? { name: summaryLabel || 'Total', ...summary } : undefined}
          summaryLabel={summaryLabel}
          className="h-full"
        />
      </div>

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DataPanel;
