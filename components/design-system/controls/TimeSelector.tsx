import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// =============================================================================
// TIME SELECTOR
// =============================================================================
// Three selection modes:
// 1. Quick ranges: Last 12/6/3 months
// 2. Full year: All of 2026, 2025, etc.
// 3. Specific month: January 2026, etc.
// =============================================================================

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type TimeSelectorValue =
  | 'last-12-months'
  | 'last-6-months'
  | 'last-3-months'
  | { year: number }
  | { month: number; year: number };

// Type guard helpers
export const isYearOnly = (v: TimeSelectorValue): v is { year: number } => {
  return typeof v === 'object' && 'year' in v && !('month' in v);
};

export const isMonthYear = (v: TimeSelectorValue): v is { month: number; year: number } => {
  return typeof v === 'object' && 'month' in v && 'year' in v;
};

export const isAggregate = (v: TimeSelectorValue): boolean => {
  return v === 'last-12-months' || v === 'last-6-months' || v === 'last-3-months';
};

export interface TimeSelectorProps {
  value: TimeSelectorValue;
  onChange: (value: TimeSelectorValue) => void;
  minYear?: number;
  maxYear?: number;
  monthsToShow?: number;
  showAggregateOption?: boolean;
  /**
   * When true, only shows aggregate options (Last 12/6/3 months) without specific month selection.
   * Useful for practice-level analytics where month-by-month selection isn't needed.
   */
  aggregateOnly?: boolean;
  /**
   * Variant styles:
   * - 'default': Compact button style for general use
   * - 'header': Large, prominent display for page headers (positioned under title)
   * - 'compact': Minimal inline style for collapsed headers
   */
  variant?: 'default' | 'header' | 'compact';
  className?: string;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  minYear = 2020,
  maxYear: maxYearProp,
  monthsToShow = 24,
  showAggregateOption = true,
  aggregateOnly = false,
  variant = 'default',
  className = '',
}) => {
  // Always allow navigation to at least the current year
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(maxYearProp ?? currentYear, currentYear);

  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => {
    if (isMonthYear(value)) return value.year;
    if (isYearOnly(value)) return value.year;
    return currentYear;
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Determine layout mode
  const showBothColumns = showAggregateOption && !aggregateOnly;
  const showOnlyAggregate = showAggregateOption && aggregateOnly;
  const showOnlyMonths = !showAggregateOption && !aggregateOnly;

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = showBothColumns ? 460 : 320;

      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      left = Math.max(16, left);

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }
  }, [isOpen, showBothColumns]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync picker year with value
  useEffect(() => {
    if (isMonthYear(value)) setPickerYear(value.year);
    else if (isYearOnly(value)) setPickerYear(value.year);
  }, [value]);

  const now = new Date();
  const currentMonth = now.getMonth();

  const getLabel = (): string => {
    if (value === 'last-12-months') return 'Last 12 Months';
    if (value === 'last-6-months') return 'Last 6 Months';
    if (value === 'last-3-months') return 'Last 3 Months';
    if (isMonthYear(value)) return `${MONTHS[value.month]} ${value.year}`;
    if (isYearOnly(value)) return `${value.year}`;
    return '';
  };

  const getHeaderLabel = (): { main: string; suffix?: string } => {
    if (value === 'last-12-months') return { main: 'Last 12 Months' };
    if (value === 'last-6-months') return { main: 'Last 6 Months' };
    if (value === 'last-3-months') return { main: 'Last 3 Months' };
    if (isMonthYear(value)) return { main: MONTHS[value.month], suffix: `${value.year}` };
    if (isYearOnly(value)) return { main: `${value.year}` };
    return { main: '' };
  };

  const isMonthSelected = (m: number, y: number): boolean => {
    if (!isMonthYear(value)) return false;
    return value.month === m && value.year === y;
  };

  const isYearSelected = (y: number): boolean => {
    return isYearOnly(value) && value.year === y;
  };

  const select = (v: TimeSelectorValue) => {
    onChange(v);
    setIsOpen(false);
  };

  const isHeader = variant === 'header';
  const isCompact = variant === 'compact';
  const headerLabel = getHeaderLabel();

  const getCompactLabel = (): string => {
    if (value === 'last-12-months') return '12mo';
    if (value === 'last-6-months') return '6mo';
    if (value === 'last-3-months') return '3mo';
    if (isMonthYear(value)) return `${SHORT_MONTHS[value.month]} '${String(value.year).slice(-2)}`;
    if (isYearOnly(value)) return `${value.year}`;
    return '';
  };

  // ==========================================================================
  // DROPDOWN CONTENT
  // ==========================================================================
  const renderDropdownContent = () => {
    const aggregateOptions = [
      { value: 'last-12-months' as const, label: 'Last 12 Months', short: 'Last 12 mo' },
      { value: 'last-6-months' as const, label: 'Last 6 Months', short: 'Last 6 mo' },
      { value: 'last-3-months' as const, label: 'Last 3 Months', short: 'Last 3 mo' },
    ];

    // Years: only show 3 years (current and 2 previous)
    const yearOptions: number[] = [];
    for (let y = maxYear; y >= Math.max(minYear, maxYear - 2); y--) {
      yearOptions.push(y);
    }

    // Single column: Only aggregate options
    if (showOnlyAggregate) {
      return (
        <div className="p-4">
          <div className="space-y-1">
            {aggregateOptions.map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => select(option.value)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all
                    ${selected ? 'bg-stone-800 text-white' : 'hover:bg-stone-100 text-stone-700'}
                  `}
                >
                  <span className="text-[15px] font-medium">{option.label}</span>
                  {selected && <Check size={18} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Single column: Only month selection - LARGE & READABLE
    if (showOnlyMonths) {
      return (
        <div className="p-4">
          {/* Year navigation - PROMINENT */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
              disabled={pickerYear <= minYear}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <span className="text-stone-800 text-[28px] font-bold tabular-nums tracking-tight min-w-[80px] text-center">
              {pickerYear}
            </span>
            <button
              onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
              disabled={pickerYear >= maxYear}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Month grid - 3 columns for LARGER buttons */}
          <div className="grid grid-cols-3 gap-2">
            {SHORT_MONTHS.map((month, idx) => {
              const selected = isMonthSelected(idx, pickerYear);
              const isFuture = pickerYear === currentYear && idx > currentMonth;
              const isCurrent = pickerYear === currentYear && idx === currentMonth;

              return (
                <button
                  key={month}
                  onClick={() => !isFuture && select({ month: idx, year: pickerYear })}
                  disabled={isFuture}
                  className={`
                    relative h-14 rounded-xl text-[15px] font-semibold transition-all
                    disabled:opacity-20 disabled:cursor-not-allowed
                    ${selected
                      ? 'bg-stone-800 text-white shadow-md'
                      : isCurrent
                        ? 'bg-amber-50 text-amber-900 ring-2 ring-amber-300 hover:bg-amber-100'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                >
                  {month}
                  {isCurrent && !selected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // =========================================================================
    // TWO-COLUMN LAYOUT
    // Left: Quick Select (ranges) + Full Year (selectable)
    // Right: Month grid for specific month selection
    // =========================================================================
    return (
      <div className="flex">
        {/* LEFT COLUMN - Compact sidebar */}
        <div
          className="flex-shrink-0 py-4 px-3 border-r border-stone-200/50"
          style={{ width: '140px' }}
        >
          {/* Quick Ranges */}
          <div className="mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Ranges
            </span>
          </div>
          <div className="space-y-1 mb-4">
            {aggregateOptions.map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => select(option.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all
                    ${selected
                      ? 'bg-amber-500 text-white'
                      : 'hover:bg-stone-100 text-stone-600'
                    }
                  `}
                >
                  <span className={`text-[13px] ${selected ? 'font-semibold' : 'font-medium'}`}>
                    {option.short}
                  </span>
                  {selected && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          {/* Full Year Selection - only 3 years */}
          <div className="mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Full Year
            </span>
          </div>
          <div className="space-y-1">
            {yearOptions.map((year) => {
              const selected = isYearSelected(year);
              return (
                <button
                  key={year}
                  onClick={() => select({ year })}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all
                    ${selected
                      ? 'bg-stone-800 text-white'
                      : 'hover:bg-stone-100 text-stone-500'
                    }
                  `}
                >
                  <span className="text-[13px] font-semibold tabular-nums">
                    {year}
                  </span>
                  {selected && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Month Selection - LARGE & READABLE */}
        <div className="flex-1 p-4" style={{ minWidth: '280px' }}>
          {/* Year navigation - PROMINENT */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
              disabled={pickerYear <= minYear}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <span className="text-stone-800 text-[28px] font-bold tabular-nums tracking-tight min-w-[80px] text-center">
              {pickerYear}
            </span>
            <button
              onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
              disabled={pickerYear >= maxYear}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Month grid - 3 columns for LARGER buttons */}
          <div className="grid grid-cols-3 gap-2">
            {SHORT_MONTHS.map((month, idx) => {
              const selected = isMonthSelected(idx, pickerYear);
              const isFuture = pickerYear === currentYear && idx > currentMonth;
              const isCurrent = pickerYear === currentYear && idx === currentMonth;

              return (
                <button
                  key={month}
                  onClick={() => !isFuture && select({ month: idx, year: pickerYear })}
                  disabled={isFuture}
                  className={`
                    relative h-14 rounded-xl text-[15px] font-semibold transition-all
                    disabled:opacity-20 disabled:cursor-not-allowed
                    ${selected
                      ? 'bg-stone-800 text-white shadow-md'
                      : isCurrent
                        ? 'bg-amber-50 text-amber-900 ring-2 ring-amber-300 hover:bg-amber-100'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                >
                  {month}
                  {isCurrent && !selected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // COMPACT VARIANT
  // ==========================================================================
  if (isCompact) {
    const dropdownWidth = showBothColumns ? 460 : 320;

    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            transition-all duration-200
            ${isOpen ? 'bg-white/12' : 'bg-white/6 hover:bg-white/10'}
            ${className}
          `}
          style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <span
            className={`
              text-xs font-semibold tracking-wide transition-colors duration-200
              ${isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'}
            `}
          >
            {getCompactLabel()}
          </span>
          <ChevronDown
            size={12}
            strokeWidth={2.5}
            className={`
              transition-all duration-200
              ${isOpen ? 'rotate-180 text-white/80' : 'text-white/40 group-hover:text-white/60'}
            `}
          />
        </button>

        {createPortal(
          isOpen && (
            <div
              ref={dropdownRef}
              className="fixed z-[100000] overflow-hidden"
              style={{
                top: position.top,
                left: Math.max(12, position.left - (showBothColumns ? 80 : 0)),
                width: `${dropdownWidth}px`,
                background: 'rgba(253, 252, 251, 0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 16px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.6) inset',
              }}
            >
              {renderDropdownContent()}
            </div>
          ),
          document.body
        )}
      </>
    );
  }

  // ==========================================================================
  // HEADER VARIANT
  // ==========================================================================
  if (isHeader) {
    const dropdownWidth = showBothColumns ? 460 : 320;

    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`group inline-flex items-center gap-3 transition-all duration-200 ${className}`}
        >
          <span className="relative flex items-baseline gap-2">
            <span
              className={`
                text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight
                transition-colors duration-300
                ${isOpen ? 'text-amber-100' : 'text-stone-300 group-hover:text-amber-100/90'}
              `}
            >
              {headerLabel.main}
            </span>

            {headerLabel.suffix && (
              <span
                className={`
                  text-xl sm:text-2xl lg:text-[1.5rem] font-medium tracking-tight
                  transition-colors duration-300
                  ${isOpen ? 'text-stone-400' : 'text-stone-500 group-hover:text-stone-400'}
                `}
              >
                {headerLabel.suffix}
              </span>
            )}

            <span
              className={`
                absolute -bottom-1 left-0 h-[1px]
                bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-transparent
                transition-all duration-300 ease-out
                ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}
              `}
            />
          </span>

          <span
            className={`
              flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full
              transition-all duration-300
              ${isOpen
                ? 'bg-amber-400/20 border border-amber-400/30'
                : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
              }
            `}
          >
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`
                transition-all duration-300
                ${isOpen ? 'rotate-180 text-amber-400' : 'text-white/50 group-hover:text-white/70'}
              `}
            />
          </span>
        </button>

        {createPortal(
          isOpen && (
            <div
              ref={dropdownRef}
              className="fixed z-[100000] overflow-hidden"
              style={{
                top: position.top,
                left: position.left,
                width: `${dropdownWidth}px`,
                background: 'rgba(253, 252, 251, 0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(168, 154, 140, 0.2)',
                borderRadius: '14px',
                boxShadow: '0 8px 32px -8px rgba(120, 100, 80, 0.15), 0 16px 48px -16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
              }}
            >
              {renderDropdownContent()}
            </div>
          ),
          document.body
        )}
      </>
    );
  }

  // ==========================================================================
  // DEFAULT VARIANT
  // ==========================================================================
  const dropdownWidth = showBothColumns ? 460 : 320;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
          text-[14px] font-medium transition-colors duration-75
          ${className}
        `}
        style={{
          background: 'rgba(253, 252, 251, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 154, 140, 0.25)',
          boxShadow: '0 2px 8px -2px rgba(120, 100, 80, 0.08)',
          color: '#44403c',
        }}
      >
        <span>{getLabel()}</span>
        <ChevronDown
          size={14}
          className={`text-stone-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(
        isOpen && (
          <div
            ref={dropdownRef}
            className="fixed z-[100000] overflow-hidden"
            style={{
              top: position.top,
              left: position.left,
              width: `${dropdownWidth}px`,
              background: 'rgba(253, 252, 251, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(168, 154, 140, 0.2)',
              borderRadius: '14px',
              boxShadow: '0 6px 24px -6px rgba(120, 100, 80, 0.12), 0 12px 40px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
            }}
          >
            {renderDropdownContent()}
          </div>
        ),
        document.body
      )}
    </>
  );
};

export default TimeSelector;
