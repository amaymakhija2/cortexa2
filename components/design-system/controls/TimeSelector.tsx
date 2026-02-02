import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

// =============================================================================
// TIME SELECTOR
// =============================================================================
// Dual-purpose: prominently displays the selected date range AND allows
// users to change it. Features a sophisticated 2-column dropdown layout
// for quick access to both aggregate periods and specific months.
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
  | { month: number; year: number };

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
  maxYear = new Date().getFullYear(),
  monthsToShow = 24,
  showAggregateOption = true,
  aggregateOnly = false,
  variant = 'default',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => {
    // Initialize to selected year if a month is selected, otherwise current year
    if (typeof value === 'object' && 'year' in value) {
      return value.year;
    }
    return new Date().getFullYear();
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Determine if we show 2 columns or 1
  const showBothColumns = showAggregateOption && !aggregateOnly;
  const showOnlyAggregate = showAggregateOption && aggregateOnly;
  const showOnlyMonths = !showAggregateOption && !aggregateOnly;

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = showBothColumns ? 480 : 300;

      // Calculate left position, ensuring dropdown doesn't go off-screen
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

  // Update picker year when value changes
  useEffect(() => {
    if (typeof value === 'object' && 'year' in value) {
      setPickerYear(value.year);
    }
  }, [value]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getLabel = (): string => {
    if (value === 'last-12-months') return 'Last 12 Months';
    if (value === 'last-6-months') return 'Last 6 Months';
    if (value === 'last-3-months') return 'Last 3 Months';
    return `${MONTHS[value.month]} ${value.year}`;
  };

  // Get a shorter, more elegant label for the header variant
  const getHeaderLabel = (): { main: string; suffix?: string } => {
    if (value === 'last-12-months') return { main: 'Last 12 Months' };
    if (value === 'last-6-months') return { main: 'Last 6 Months' };
    if (value === 'last-3-months') return { main: 'Last 3 Months' };
    return { main: MONTHS[value.month], suffix: `${value.year}` };
  };

  const isAggregateValue = (v: TimeSelectorValue): boolean => {
    return v === 'last-12-months' || v === 'last-6-months' || v === 'last-3-months';
  };

  const isSelected = (m: number, y: number): boolean => {
    if (isAggregateValue(value)) return false;
    return value.month === m && value.year === y;
  };

  const select = (v: TimeSelectorValue) => {
    onChange(v);
    setIsOpen(false);
  };

  const isHeader = variant === 'header';
  const isCompact = variant === 'compact';
  const headerLabel = getHeaderLabel();

  // Get a short label for compact variant
  const getCompactLabel = (): string => {
    if (value === 'last-12-months') return '12mo';
    if (value === 'last-6-months') return '6mo';
    if (value === 'last-3-months') return '3mo';
    if (typeof value === 'object' && 'month' in value) {
      return `${SHORT_MONTHS[value.month]} '${String(value.year).slice(-2)}`;
    }
    return '';
  };

  // ==========================================================================
  // SHARED DROPDOWN CONTENT - 2-Column Layout
  // REDESIGNED: Large, touch-friendly, highly readable
  // ==========================================================================
  const renderDropdownContent = () => {
    const aggregateOptions = [
      { value: 'last-12-months' as const, label: 'Last 12 Months' },
      { value: 'last-6-months' as const, label: 'Last 6 Months' },
      { value: 'last-3-months' as const, label: 'Last 3 Months' },
    ];

    // Generate year options from maxYear down to minYear (limit to 5 years)
    const yearOptions: number[] = [];
    for (let y = maxYear; y >= Math.max(minYear, maxYear - 4); y--) {
      yearOptions.push(y);
    }

    // Check if current month is selected
    const isCurrentMonthSelected = !isAggregateValue(value) &&
      value.month === currentMonth && value.year === currentYear;

    // Single column: Only aggregate options
    if (showOnlyAggregate) {
      return (
        <div className="p-5">
          {aggregateOptions.map((option, idx) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => select(option.value)}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-100
                  ${selected ? 'bg-amber-50' : 'hover:bg-stone-50'}
                `}
              >
                <span
                  className="w-1.5 h-7 rounded-full transition-all duration-100"
                  style={{ background: selected ? '#f59e0b' : 'transparent' }}
                />
                <span className={`text-[17px] ${selected ? 'font-semibold text-stone-900' : 'font-medium text-stone-600'}`}>
                  {option.label}
                </span>
                {selected && <Check size={22} className="ml-auto text-amber-500" />}
              </button>
            );
          })}
        </div>
      );
    }

    // Single column: Only month selection
    if (showOnlyMonths) {
      return (
        <div className="p-5">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[13px] font-bold uppercase tracking-wider text-stone-400">
              Select Month
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
                disabled={pickerYear <= minYear}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={22} />
              </button>
              <span className="text-stone-800 text-[18px] font-bold tabular-nums w-16 text-center">
                {pickerYear}
              </span>
              <button
                onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
                disabled={pickerYear >= maxYear}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Month grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2.5">
            {SHORT_MONTHS.map((month, idx) => {
              const isMonthSelected = isSelected(idx, pickerYear);
              const isFutureMonth = pickerYear === currentYear && idx > currentMonth;
              const isDisabled = isFutureMonth;

              return (
                <button
                  key={month}
                  onClick={() => !isDisabled && select({ month: idx, year: pickerYear })}
                  disabled={isDisabled}
                  className={`
                    h-14 rounded-xl text-[16px] font-semibold transition-all duration-100
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${isMonthSelected
                      ? 'bg-stone-800 text-white shadow-md'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // =========================================================================
    // TWO-COLUMN LAYOUT: Quick Select + Years | Month Selection
    // =========================================================================
    return (
      <div className="flex">
        {/* LEFT COLUMN: Quick Select + Years (unified list) */}
        <div
          className="flex-shrink-0 py-4 pl-4 pr-2 overflow-y-auto"
          style={{
            width: '200px',
            maxHeight: '420px',
            animation: 'columnSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Section: Quick Ranges */}
          <div className="px-2 mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-400">
              Quick Select
            </span>
          </div>

          <div className="space-y-1 mb-4">
            {aggregateOptions.map((option, idx) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => select(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
                    transition-all duration-100
                    ${selected
                      ? 'bg-amber-100/80'
                      : 'hover:bg-stone-100'
                    }
                  `}
                  style={{
                    animation: `itemFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 40}ms forwards`,
                    opacity: 0,
                  }}
                >
                  <span
                    className={`
                      w-2 h-6 rounded-full transition-all duration-100
                      ${selected ? 'bg-amber-500' : 'bg-transparent'}
                    `}
                  />
                  <span className={`text-[16px] ${selected ? 'font-semibold text-amber-900' : 'font-medium text-stone-600'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-3 my-3 h-px bg-stone-200" />

          {/* Section: Years (same list style) */}
          <div className="px-2 mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-400">
              By Year
            </span>
          </div>

          <div className="space-y-1">
            {yearOptions.map((year, idx) => {
              const isYearActive = pickerYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setPickerYear(year)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
                    transition-all duration-100
                    ${isYearActive
                      ? 'bg-stone-800'
                      : 'hover:bg-stone-100'
                    }
                  `}
                  style={{
                    animation: `itemFadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) ${150 + idx * 30}ms forwards`,
                    opacity: 0,
                  }}
                >
                  <span
                    className={`
                      w-2 h-6 rounded-full transition-all duration-100
                      ${isYearActive ? 'bg-white' : 'bg-transparent'}
                    `}
                  />
                  <span className={`text-[16px] font-semibold tabular-nums ${isYearActive ? 'text-white' : 'text-stone-500'}`}>
                    {year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="relative flex-shrink-0 w-px my-5">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(168, 154, 140, 0.35) 10%, rgba(168, 154, 140, 0.35) 90%, transparent 100%)',
            }}
          />
        </div>

        {/* RIGHT COLUMN: Month Selection */}
        <div
          className="flex-1 p-5"
          style={{
            minWidth: '220px',
            animation: 'columnSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards',
            opacity: 0,
          }}
        >
          {/* Header: Year with navigation */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[20px] font-bold text-stone-800 tabular-nums">
              {pickerYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
                disabled={pickerYear <= minYear}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
                disabled={pickerYear >= maxYear}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* THIS MONTH button (only when viewing current year) */}
          {pickerYear === currentYear && (
            <button
              onClick={() => select({ month: currentMonth, year: currentYear })}
              className={`
                w-full mb-4 px-5 py-4 rounded-2xl flex items-center justify-between
                transition-all duration-150
                ${isCurrentMonthSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-150 border border-amber-200/70'
                }
              `}
              style={{
                animation: 'itemFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) 40ms forwards',
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-xl
                    ${isCurrentMonthSelected ? 'bg-white/25' : 'bg-amber-400/25'}
                  `}
                >
                  <span className={`w-3 h-3 rounded-full ${isCurrentMonthSelected ? 'bg-white' : 'bg-amber-500'}`} />
                  {!isCurrentMonthSelected && (
                    <span className="absolute inset-0 rounded-xl bg-amber-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                  )}
                </span>
                <div className="flex flex-col items-start">
                  <span className={`text-[12px] font-bold uppercase tracking-wider leading-none ${isCurrentMonthSelected ? 'text-amber-100' : 'text-amber-600'}`}>
                    This Month
                  </span>
                  <span className={`text-[18px] font-bold leading-tight mt-1 ${isCurrentMonthSelected ? 'text-white' : 'text-amber-900'}`}>
                    {MONTHS[currentMonth]}
                  </span>
                </div>
              </div>
              {isCurrentMonthSelected && <Check size={24} className="text-white/90" />}
            </button>
          )}

          {/* Month grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2">
            {SHORT_MONTHS.map((month, idx) => {
              const isMonthSelected = isSelected(idx, pickerYear);
              const isFutureMonth = pickerYear === currentYear && idx > currentMonth;
              const isThisMonth = pickerYear === currentYear && idx === currentMonth;
              const isDisabled = isFutureMonth;

              // Placeholder for current month (shown in special button above)
              if (isThisMonth) {
                return (
                  <div
                    key={month}
                    className="h-14 rounded-xl flex items-center justify-center border-2 border-dashed border-amber-200"
                    style={{
                      animation: `itemFadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) ${60 + idx * 25}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <span className="text-[13px] font-semibold text-amber-300">↑</span>
                  </div>
                );
              }

              return (
                <button
                  key={month}
                  onClick={() => !isDisabled && select({ month: idx, year: pickerYear })}
                  disabled={isDisabled}
                  className={`
                    h-14 rounded-xl text-[15px] font-semibold transition-all duration-100
                    disabled:opacity-25 disabled:cursor-not-allowed
                    ${isMonthSelected
                      ? 'bg-stone-800 text-white shadow-md'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                  style={{
                    animation: `itemFadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) ${60 + idx * 25}ms forwards`,
                    opacity: 0,
                  }}
                >
                  {month}
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
    const dropdownWidth = showBothColumns ? 480 : 300;

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
                left: Math.max(12, position.left - (showBothColumns ? 100 : 0)),
                width: `${dropdownWidth}px`,
                background: 'rgba(253, 252, 251, 0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 16px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.6) inset',
                animation: 'dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {renderDropdownContent()}
              <style>{`
                @keyframes dropdownFade {
                  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes columnSlideIn {
                  from { opacity: 0; transform: translateX(-8px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes itemFadeIn {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
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
    const dropdownWidth = showBothColumns ? 480 : 300;

    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`group inline-flex items-center gap-3 transition-all duration-200 ${className}`}
        >
          {/* Date display with animated underline */}
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

            {/* Animated underline */}
            <span
              className={`
                absolute -bottom-1 left-0 h-[1px]
                bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-transparent
                transition-all duration-300 ease-out
                ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}
              `}
            />
          </span>

          {/* Circular dropdown indicator */}
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
                borderRadius: '18px',
                boxShadow: '0 8px 32px -8px rgba(120, 100, 80, 0.15), 0 16px 48px -16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
                animation: 'dropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {renderDropdownContent()}
              <style>{`
                @keyframes dropdownFade {
                  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes columnSlideIn {
                  from { opacity: 0; transform: translateX(-8px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes itemFadeIn {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
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
  const dropdownWidth = showBothColumns ? 480 : 300;

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
              borderRadius: '16px',
              boxShadow: '0 6px 24px -6px rgba(120, 100, 80, 0.12), 0 12px 40px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
              animation: 'dropdownFadeDefault 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {renderDropdownContent()}
            <style>{`
              @keyframes dropdownFadeDefault {
                from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes columnSlideIn {
                from { opacity: 0; transform: translateX(-8px); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes itemFadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        ),
        document.body
      )}
    </>
  );
};

export default TimeSelector;
