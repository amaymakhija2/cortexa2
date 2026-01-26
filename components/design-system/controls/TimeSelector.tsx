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
   * Variant styles:
   * - 'default': Compact button style for general use
   * - 'header': Large, prominent display for page headers (positioned under title)
   */
  variant?: 'default' | 'header';
  className?: string;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  minYear = 2020,
  maxYear = new Date().getFullYear(),
  monthsToShow = 24,
  showAggregateOption = true,
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
  const headerLabel = getHeaderLabel();

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
                width: showMonthPicker ? '340px' : '280px',
                background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                animation: 'dropdownReveal 0.2s ease-out',
              }}
            >
              {/* Decorative top glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                }}
              />

              {showMonthPicker ? (
                // Month Picker View
                <div className="relative p-5">
                  {/* Header with back button */}
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={18} />
                      <span className="text-sm font-medium">Back</span>
                    </button>
                    <h3
                      className="text-white text-lg font-semibold"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      Select Month
                    </h3>
                    <div className="w-16" /> {/* Spacer for alignment */}
                  </div>

                  {/* Year selector */}
                  <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-white/10">
                    <button
                      onClick={() => setPickerYear(prev => Math.max(minYear, prev - 1))}
                      disabled={pickerYear <= minYear}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span
                      className="text-white text-2xl font-bold tabular-nums w-20 text-center"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      {pickerYear}
                    </span>
                    <button
                      onClick={() => setPickerYear(prev => Math.min(maxYear, prev + 1))}
                      disabled={pickerYear >= maxYear}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Month grid */}
                  <div className="grid grid-cols-4 gap-2">
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
                          className="h-11 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            background: isMonthSelected
                              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isMonthSelected
                              ? '#1c1917'
                              : '#a8a29e',
                            boxShadow: isMonthSelected
                              ? '0 2px 8px rgba(251, 191, 36, 0.3)'
                              : 'none',
                          }}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Main dropdown view
                <div className="relative py-2">
                  {/* Aggregate options - time ranges */}
                  {showAggregateOption && (
                    <>
                      <div className="px-5 pt-3 pb-2">
                        <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
                          Time range
                        </span>
                      </div>
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
                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 group/item"
                            style={{
                              background: selected
                                ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)'
                                : 'transparent',
                            }}
                          >
                            <TrendingUp
                              size={16}
                              className={selected ? 'text-amber-400' : 'text-stone-500 group-hover/item:text-stone-400'}
                            />
                            <span className={`flex-1 text-[15px] font-medium ${selected ? 'text-amber-300' : 'text-stone-300 group-hover/item:text-white'}`}>
                              {option.label}
                            </span>
                            {selected && <Check size={14} className="text-amber-400" />}
                          </button>
                        );
                      })}
                      <div className="mx-5 my-2 h-px bg-white/10" />
                    </>
                  )}

                  {/* Specific month section */}
                  <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
                      Specific month
                    </span>
                    <button
                      onClick={() => {
                        // Set picker year to current selection's year if applicable
                        if (!isAggregateValue(value)) {
                          setPickerYear(value.year);
                        }
                        setShowMonthPicker(true);
                      }}
                      className="text-[11px] font-medium text-amber-400/80 hover:text-amber-400 uppercase tracking-wide transition-colors"
                    >
                      Calendar →
                    </button>
                  </div>

                  {/* Recent months list */}
                  <div className="max-h-[240px] overflow-y-auto pb-2">
                    {monthOptions.slice(0, 12).map(({ month, year, isCurrent }) => {
                      const selected = isSelected(month, year);
                      return (
                        <button
                          key={`${month}-${year}`}
                          onClick={() => select({ month, year })}
                          className={`
                            w-full flex items-center justify-between px-5 py-2.5
                            text-left text-[14px] transition-all duration-200
                            ${selected
                              ? 'bg-white/10 font-medium text-white'
                              : 'hover:bg-white/5 text-stone-400 hover:text-stone-200'
                            }
                          `}
                        >
                          <span className="flex items-center gap-2">
                            {MONTHS[month]} {year}
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-amber-400/70 uppercase">
                                Now
                              </span>
                            )}
                          </span>
                          {selected && <Check size={14} className="text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CSS Animation */}
              <style>{`
                @keyframes dropdownReveal {
                  from {
                    opacity: 0;
                    transform: translateY(-8px) scale(0.96);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
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
  // DEFAULT VARIANT - Compact button style
  // ==========================================================================
  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl
          text-[15px] font-medium transition-colors
          bg-white hover:bg-stone-50 text-stone-800 border border-stone-200
          ${className}
        `}
      >
        <span>{getLabel()}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-stone-400`}
        />
      </button>

      {createPortal(
        isOpen && (
          <div
            ref={dropdownRef}
            className="fixed z-[100000] w-[280px] bg-white rounded-xl border border-stone-200 overflow-hidden"
            style={{
              top: position.top,
              left: position.left,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}
          >
            {/* Aggregate options - period ranges */}
            {showAggregateOption && (
              <>
                <div className="px-4 pt-3 pb-2">
                  <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">
                    Time range
                  </span>
                </div>
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
                      className={`
                        w-full flex items-center gap-3 px-4 py-3
                        text-left transition-colors border-l-2
                        ${selected
                          ? 'bg-amber-50/80 border-l-amber-500'
                          : 'hover:bg-stone-50 border-l-transparent'
                        }
                      `}
                    >
                      <TrendingUp
                        size={16}
                        className={selected ? 'text-amber-600' : 'text-stone-400'}
                      />
                      <span className={`flex-1 text-[14px] font-medium ${selected ? 'text-amber-900' : 'text-stone-700'}`}>
                        {option.label}
                      </span>
                      {selected && <Check size={14} className="text-amber-600" />}
                    </button>
                  );
                })}
                <div className="mx-4 my-2 h-px bg-stone-200" />
              </>
            )}

            {/* Section label */}
            <div className="px-4 pt-3 pb-2">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">
                Specific month
              </span>
            </div>

            {/* Month list */}
            <div className="max-h-[280px] overflow-y-auto pb-2">
              {monthOptions.map(({ month, year, isCurrent }) => {
                const selected = isSelected(month, year);
                return (
                  <button
                    key={`${month}-${year}`}
                    onClick={() => select({ month, year })}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5
                      text-left text-[14px] transition-colors
                      ${selected
                        ? 'bg-stone-100 font-medium text-stone-900'
                        : 'hover:bg-stone-50 text-stone-600'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {MONTHS[month]} {year}
                      {isCurrent && (
                        <span className="text-[10px] font-medium text-stone-400 uppercase">
                          Now
                        </span>
                      )}
                    </span>
                    {selected && <Check size={14} className="text-stone-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
};

export default TimeSelector;
