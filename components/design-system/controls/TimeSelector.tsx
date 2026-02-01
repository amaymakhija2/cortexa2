import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

// =============================================================================
// TIME SELECTOR
// =============================================================================
// Dual-purpose: prominently displays the selected date range AND allows
// users to change it. Designed to sit under the page title as a sophisticated
// inline element.
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
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position below the trigger, aligned to left edge
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthOptions = [];
  for (let i = 0; i < monthsToShow; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y -= 1; }
    if (y < minYear) break;
    monthOptions.push({ month: m, year: y, isCurrent: i === 0 });
  }

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
    setShowMonthPicker(false);
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
  // COMPACT VARIANT - Minimal inline style for collapsed headers
  // ==========================================================================
  if (isCompact) {
    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowMonthPicker(false);
          }}
          className={`
            group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            transition-all duration-200
            ${isOpen
              ? 'bg-white/12'
              : 'bg-white/6 hover:bg-white/10'
            }
            ${className}
          `}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className={`
              text-xs font-semibold tracking-wide
              transition-colors duration-200
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
              ${isOpen
                ? 'rotate-180 text-white/80'
                : 'text-white/40 group-hover:text-white/60'
              }
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
                left: Math.max(12, position.left - 60),
                width: showMonthPicker ? '280px' : '200px',
                background: 'rgba(253, 252, 251, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.5) inset',
                animation: 'dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {!showMonthPicker ? (
                <div className="p-2">
                  {/* Aggregate options */}
                  {showAggregateOption && (
                    <div className="space-y-0.5 mb-2">
                      {[
                        { key: 'last-12-months', label: '12 Months' },
                        { key: 'last-6-months', label: '6 Months' },
                        { key: 'last-3-months', label: '3 Months' },
                      ].map(({ key, label }) => {
                        const isActive = value === key;
                        return (
                          <button
                            key={key}
                            onClick={() => select(key as TimeSelectorValue)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2 rounded-lg
                              transition-all duration-150
                              ${isActive
                                ? 'bg-stone-100'
                                : 'hover:bg-stone-50'
                              }
                            `}
                          >
                            <span className={`text-sm ${isActive ? 'font-semibold text-stone-900' : 'text-stone-600'}`}>
                              {label}
                            </span>
                            {isActive && <Check size={14} className="text-amber-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!aggregateOnly && (
                    <>
                      <div className="h-px bg-stone-200/60 my-1.5" />
                      <button
                        onClick={() => setShowMonthPicker(true)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-sm text-stone-600">Select month</span>
                        <ChevronDown size={14} className="text-stone-400 -rotate-90" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-3">
                  {/* Year navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setPickerYear(y => Math.max(minYear, y - 1))}
                      className="p-1 rounded hover:bg-stone-100 text-stone-500"
                      disabled={pickerYear <= minYear}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-semibold text-stone-800">{pickerYear}</span>
                    <button
                      onClick={() => setPickerYear(y => Math.min(maxYear, y + 1))}
                      className="p-1 rounded hover:bg-stone-100 text-stone-500"
                      disabled={pickerYear >= maxYear}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Month grid */}
                  <div className="grid grid-cols-4 gap-1">
                    {SHORT_MONTHS.map((m, idx) => {
                      const isActive = isSelected(idx, pickerYear);
                      const isFuture = pickerYear === currentYear && idx > currentMonth;
                      return (
                        <button
                          key={m}
                          onClick={() => !isFuture && select({ month: idx, year: pickerYear })}
                          disabled={isFuture}
                          className={`
                            py-1.5 rounded-md text-xs font-medium transition-all
                            ${isFuture
                              ? 'text-stone-300 cursor-not-allowed'
                              : isActive
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-stone-600 hover:bg-stone-100'
                            }
                          `}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>

                  {/* Back button */}
                  <button
                    onClick={() => setShowMonthPicker(false)}
                    className="mt-3 w-full py-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              <style>{`
                @keyframes dropdownFade {
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
  // HEADER VARIANT - Prominent display under title
  // ==========================================================================
  // Design: Editorial luxury - elegant serif with refined interactivity cues
  //
  // Visual distinction from title:
  //   - Warm amber/stone tint (vs pure white title)
  //   - Lighter weight feeling through color, not font-weight
  //   - Animated underline on hover reveals interactivity
  //
  // Interactivity signals (subtle, not button-like):
  //   - Delicate underline animation
  //   - Small calendar icon as elegant punctuation
  //   - Chevron that feels like typography, not UI
  // ==========================================================================
  if (isHeader) {
    return (
      <>
        <button
          ref={triggerRef}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowMonthPicker(false);
          }}
          className={`
            group inline-flex items-center gap-3
            transition-all duration-200
            ${className}
          `}
        >
          {/* Date display with animated underline */}
          <span className="relative flex items-baseline gap-2">
            {/* Main date text - sans-serif contrasts with serif title */}
            <span
              className={`
                text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight
                transition-colors duration-300
                ${isOpen
                  ? 'text-amber-100'
                  : 'text-stone-300 group-hover:text-amber-100/90'
                }
              `}
            >
              {headerLabel.main}
            </span>

            {headerLabel.suffix && (
              <span
                className={`
                  text-xl sm:text-2xl lg:text-[1.5rem] font-medium tracking-tight
                  transition-colors duration-300
                  ${isOpen
                    ? 'text-stone-400'
                    : 'text-stone-500 group-hover:text-stone-400'
                  }
                `}
              >
                {headerLabel.suffix}
              </span>
            )}

            {/* Animated underline - reveals on hover */}
            <span
              className={`
                absolute -bottom-1 left-0 h-[1px]
                bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-transparent
                transition-all duration-300 ease-out
                ${isOpen
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                }
              `}
            />
          </span>

          {/* Circular dropdown indicator */}
          <span
            className={`
              flex items-center justify-center
              w-7 h-7 sm:w-8 sm:h-8 rounded-full
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
                ${isOpen
                  ? 'rotate-180 text-amber-400'
                  : 'text-white/50 group-hover:text-white/70'
                }
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
                width: showMonthPicker ? '320px' : '260px',
                background: 'rgba(253, 252, 251, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(168, 154, 140, 0.25)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px -4px rgba(120, 100, 80, 0.12), 0 8px 32px -8px rgba(0, 0, 0, 0.08)',
                animation: 'dropdownFade 0.15s ease-out',
              }}
            >
              {showMonthPicker ? (
                <div className="p-4">
                  {/* Back + Year row */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="flex items-center gap-1 transition-colors hover:opacity-70"
                      style={{ color: '#1c1917' }}
                    >
                      <ChevronLeft size={16} />
                      <span className="text-[13px] font-semibold">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
                        disabled={pickerYear <= minYear}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all disabled:opacity-30"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-stone-800 text-[15px] font-semibold tabular-nums w-12 text-center">
                        {pickerYear}
                      </span>
                      <button
                        onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
                        disabled={pickerYear >= maxYear}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all disabled:opacity-30"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Month grid - compact */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {SHORT_MONTHS.map((month, idx) => {
                      const isMonthSelected = !isAggregateValue(value) && value.month === idx && value.year === pickerYear;
                      const isFutureMonth = pickerYear === currentYear && idx > currentMonth;
                      const isPastMinYear = pickerYear < minYear;
                      const isDisabled = isFutureMonth || isPastMinYear;

                      return (
                        <button
                          key={month}
                          onClick={() => !isDisabled && select({ month: idx, year: pickerYear })}
                          disabled={isDisabled}
                          className={`
                            h-9 rounded-lg text-[13px] font-medium transition-colors duration-75
                            disabled:opacity-30 disabled:cursor-not-allowed
                            ${isMonthSelected
                              ? 'bg-stone-800 text-white'
                              : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                            }
                          `}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {/* Aggregate options */}
                  {showAggregateOption && (
                    <>
                      {[
                        { value: 'last-12-months' as const, label: 'Last 12 Months' },
                        { value: 'last-6-months' as const, label: 'Last 6 Months' },
                        { value: 'last-3-months' as const, label: 'Last 3 Months' },
                      ].map((option) => {
                        const selected = value === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => select(option.value)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                            style={{
                              background: selected ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                            }}
                          >
                            {/* Amber accent bar for selected */}
                            <span
                              className="w-[3px] h-4 rounded-full transition-colors duration-75"
                              style={{
                                background: selected ? '#f59e0b' : 'transparent',
                              }}
                            />
                            <span
                              className={`text-[14px] ${selected ? 'font-semibold' : 'font-medium'}`}
                              style={{ color: '#1c1917' }}
                            >
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                      {!aggregateOnly && (
                        <div className="mx-4 my-2 h-px" style={{ background: 'rgba(168, 154, 140, 0.2)' }} />
                      )}
                    </>
                  )}

                  {/* Specific month section */}
                  {!aggregateOnly && (
                    <>
                      <div className="px-4 pt-1 pb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#57534e' }}>
                          By Month
                        </span>
                        <button
                          onClick={() => {
                            if (!isAggregateValue(value)) setPickerYear(value.year);
                            setShowMonthPicker(true);
                          }}
                          className="text-[11px] font-semibold transition-colors hover:opacity-70"
                          style={{ color: '#d97706' }}
                        >
                          See Calendar
                        </button>
                      </div>

                      <div className="relative">
                        <div
                          className="overflow-y-auto"
                          style={{
                            maxHeight: showAggregateOption ? '132px' : '264px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                          }}
                        >
                          {monthOptions.slice(0, 12).map(({ month, year, isCurrent }) => {
                            const selected = isSelected(month, year);
                            return (
                              <button
                                key={`${month}-${year}`}
                                onClick={() => select({ month, year })}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                                style={{
                                  background: selected ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                                }}
                              >
                                {/* Amber accent bar for selected */}
                                <span
                                  className="w-[3px] h-4 rounded-full transition-colors duration-75"
                                  style={{
                                    background: selected ? '#f59e0b' : 'transparent',
                                  }}
                                />
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`text-[14px] ${selected ? 'font-semibold' : 'font-medium'}`}
                                    style={{ color: '#1c1917' }}
                                  >
                                    {MONTHS[month]} {year}
                                  </span>
                                  {isCurrent && (
                                    <span
                                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                      style={{ color: '#92400e', background: 'rgba(251, 191, 36, 0.2)' }}
                                    >
                                      This Month
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Subtle fade */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                          style={{
                            background: 'linear-gradient(to top, rgba(253, 252, 251, 0.9) 0%, transparent 100%)',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <style>{`
                @keyframes dropdownFade {
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
  // DEFAULT VARIANT - Glassmorphic floating pill (matches sidebar aesthetic)
  // ==========================================================================
  // Design: Warm translucent glass with amber accents
  // - Frosted backdrop blur effect
  // - Multi-layer soft shadows for depth
  // - Warm stone borders with subtle opacity
  // - Smooth 400ms transitions matching sidebar
  // ==========================================================================
  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
          text-[14px] font-medium
          transition-colors duration-75
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
              width: '260px',
              background: 'rgba(253, 252, 251, 0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(168, 154, 140, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px -4px rgba(120, 100, 80, 0.12), 0 8px 32px -8px rgba(0, 0, 0, 0.08)',
              animation: 'dropdownFadeDefault 0.15s ease-out',
            }}
          >
            {/* Aggregate options */}
            {showAggregateOption && (
              <>
                {[
                  { value: 'last-12-months' as const, label: 'Last 12 Months' },
                  { value: 'last-6-months' as const, label: 'Last 6 Months' },
                  { value: 'last-3-months' as const, label: 'Last 3 Months' },
                ].map((option) => {
                  const selected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => select(option.value)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                      style={{
                        background: selected ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                      }}
                    >
                      {/* Amber accent bar for selected */}
                      <span
                        className="w-[3px] h-4 rounded-full transition-colors duration-75"
                        style={{
                          background: selected ? '#f59e0b' : 'transparent',
                        }}
                      />
                      <span
                        className={`text-[14px] ${selected ? 'font-semibold' : 'font-medium'}`}
                        style={{ color: '#1c1917' }}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
                {!aggregateOnly && (
                  <div className="mx-4 my-2 h-px" style={{ background: 'rgba(168, 154, 140, 0.2)' }} />
                )}
              </>
            )}

            {/* Specific month section */}
            {!aggregateOnly && (
              <>
                <div className="px-4 pt-1 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#57534e' }}>
                    By Month
                  </span>
                </div>

                <div className="relative">
                  <div
                    className="overflow-y-auto"
                    style={{
                      maxHeight: showAggregateOption ? '132px' : '264px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {monthOptions.map(({ month, year, isCurrent }) => {
                      const selected = isSelected(month, year);
                      return (
                        <button
                          key={`${month}-${year}`}
                          onClick={() => select({ month, year })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                          style={{
                            background: selected ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                          }}
                        >
                          {/* Amber accent bar for selected */}
                          <span
                            className="w-[3px] h-4 rounded-full transition-colors duration-75"
                            style={{
                              background: selected ? '#f59e0b' : 'transparent',
                            }}
                          />
                          <span className="flex items-center gap-2">
                            <span
                              className={`text-[14px] ${selected ? 'font-semibold' : 'font-medium'}`}
                              style={{ color: '#1c1917' }}
                            >
                              {MONTHS[month]} {year}
                            </span>
                            {isCurrent && (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{ color: '#92400e', background: 'rgba(251, 191, 36, 0.2)' }}
                              >
                                This Month
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(253, 252, 251, 0.9) 0%, transparent 100%)' }}
                  />
                </div>
              </>
            )}

            <style>{`
              @keyframes dropdownFadeDefault {
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
