import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================
// The standard dark header for all analysis pages.
// Features: accent glow, grid texture, title, subtitle, time period selector, tabs
// =============================================================================

export type AccentColor = 'amber' | 'cyan' | 'emerald' | 'rose' | 'violet' | 'blue';

const ACCENT_COLORS: Record<AccentColor, { glow: string; glowSecondary: string; labelClass: string }> = {
  amber: { glow: '#f59e0b', glowSecondary: '#fbbf24', labelClass: 'text-amber-500/80' },
  cyan: { glow: '#06b6d4', glowSecondary: '#22d3ee', labelClass: 'text-cyan-500/80' },
  emerald: { glow: '#10b981', glowSecondary: '#34d399', labelClass: 'text-emerald-500/80' },
  rose: { glow: '#f43f5e', glowSecondary: '#fb7185', labelClass: 'text-rose-500/80' },
  violet: { glow: '#8b5cf6', glowSecondary: '#a78bfa', labelClass: 'text-violet-500/80' },
  blue: { glow: '#3b82f6', glowSecondary: '#60a5fa', labelClass: 'text-blue-500/80' },
};

export type TimePeriod = 'last-12-months' | 'this-year' | 'this-quarter' | 'last-quarter' | 'this-month' | 'last-month' | '2024' | '2023' | 'custom';

export interface Tab {
  id: string;
  label: string;
}

export interface PageHeaderProps {
  /** The accent color for the glow effect */
  accent?: AccentColor;
  /** Small uppercase label above the title */
  label?: string;
  /** Main page title */
  title: string;
  /** Content to render inline next to the title */
  titleAction?: React.ReactNode;
  /** Subtitle/description below title */
  subtitle?: string;
  /** Show grid pattern overlay (default: false) */
  showGridPattern?: boolean;
  /** Show time period selector */
  showTimePeriod?: boolean;
  /** Current time period */
  timePeriod?: TimePeriod;
  /** Callback when time period changes */
  onTimePeriodChange?: (period: TimePeriod) => void;
  /** Available time periods */
  timePeriods?: { id: TimePeriod; label: string }[];
  /** Tab navigation items */
  tabs?: Tab[];
  /** Currently active tab */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Custom content to render in the header (right side) */
  actions?: React.ReactNode;
  /** Children rendered below the header content */
  children?: React.ReactNode;
}

const DEFAULT_TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: 'last-12-months', label: 'Last 12 months' },
  { id: 'this-year', label: 'This Year' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'last-quarter', label: 'Last Quarter' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
];

export const PageHeader: React.FC<PageHeaderProps> = ({
  accent = 'amber',
  label,
  title,
  titleAction,
  subtitle,
  showGridPattern = false,
  showTimePeriod = false,
  timePeriod = 'last-12-months',
  onTimePeriodChange,
  timePeriods = DEFAULT_TIME_PERIODS,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
}) => {
  const accentConfig = ACCENT_COLORS[accent];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartMonth, setCustomStartMonth] = useState(0);
  const [customEndMonth, setCustomEndMonth] = useState(11);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowCustomPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the current period label
  const getCurrentPeriodLabel = () => {
    if (timePeriod === 'custom') return formatCustomRange();
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label || 'Select period';
  };

  const formatCustomRange = () => {
    if (customStartMonth === customEndMonth) {
      return `${months[customStartMonth]} ${customYear}`;
    }
    return `${months[customStartMonth]} – ${months[customEndMonth]} ${customYear}`;
  };

  const applyCustomRange = () => {
    onTimePeriodChange?.('custom');
    setShowCustomPicker(false);
    setIsDropdownOpen(false);
  };

  const handlePeriodSelect = (periodId: TimePeriod) => {
    onTimePeriodChange?.(periodId);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
      }}
    >
      {/* Glow container - contains overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern overlay */}
        {showGridPattern && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
        )}

        {/* Primary glow accent */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${accentConfig.glow} 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            {label && (
              <p className={`${accentConfig.labelClass} text-sm font-semibold tracking-widest uppercase mb-2`}>
                {label}
              </p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {title}
              </h1>
              {titleAction}
            </div>
            {subtitle && (
              <p className="text-stone-400 text-base sm:text-lg mt-2">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Time Period Selector - Sophisticated Dropdown */}
            {showTimePeriod && (
              <div className="relative" ref={dropdownRef}>
                {/* Dropdown Trigger Button */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setShowCustomPicker(false);
                  }}
                  className="group flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isDropdownOpen
                      ? '0 0 0 2px rgba(251, 191, 36, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <Calendar
                    size={18}
                    className="text-amber-400/80"
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-white text-[15px] font-semibold tracking-[-0.01em]"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {getCurrentPeriodLabel()}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-stone-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </button>

                {/* Dropdown Panel */}
                {isDropdownOpen && !showCustomPicker && (
                  <div
                    className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                    style={{
                      minWidth: '240px',
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

                    <div className="relative py-2">
                      {/* Time period options */}
                      {timePeriods.map((period) => {
                        const isSelected = timePeriod === period.id;
                        return (
                          <button
                            key={period.id}
                            onClick={() => handlePeriodSelect(period.id)}
                            className="w-full flex items-center justify-between px-5 py-3 transition-all duration-200 group/item"
                            style={{
                              background: isSelected
                                ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)'
                                : 'transparent',
                            }}
                          >
                            <span
                              className={`text-[15px] font-medium transition-colors duration-200 ${
                                isSelected
                                  ? 'text-amber-300'
                                  : 'text-stone-300 group-hover/item:text-white'
                              }`}
                            >
                              {period.label}
                            </span>
                            {isSelected && (
                              <Check size={16} className="text-amber-400" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}

                      {/* Divider */}
                      <div className="mx-4 my-2 h-px bg-white/10" />

                      {/* Custom Range Option */}
                      <button
                        onClick={() => setShowCustomPicker(true)}
                        className="w-full flex items-center justify-between px-5 py-3 transition-all duration-200 group/item"
                        style={{
                          background: timePeriod === 'custom'
                            ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)'
                            : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-stone-500 group-hover/item:text-amber-400 transition-colors" />
                          <span
                            className={`text-[15px] font-medium transition-colors duration-200 ${
                              timePeriod === 'custom'
                                ? 'text-amber-300'
                                : 'text-stone-300 group-hover/item:text-white'
                            }`}
                          >
                            {timePeriod === 'custom' ? formatCustomRange() : 'Custom Range'}
                          </span>
                        </div>
                        {timePeriod === 'custom' && (
                          <Check size={16} className="text-amber-400" strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Date Picker Panel */}
                {showCustomPicker && (
                  <div
                    className="absolute top-full right-0 mt-2 z-[100000] overflow-hidden"
                    style={{
                      width: 'clamp(300px, 85vw, 360px)',
                      background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                      animation: 'dropdownReveal 0.2s ease-out',
                    }}
                  >
                    {/* Decorative top glow */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 opacity-25 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                      }}
                    />

                    <div className="relative p-5">
                      {/* Header with back button */}
                      <div className="flex items-center justify-between mb-5">
                        <button
                          onClick={() => setShowCustomPicker(false)}
                          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft size={18} />
                          <span className="text-sm font-medium">Back</span>
                        </button>
                        <h3
                          className="text-white text-lg font-semibold"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          Custom Range
                        </h3>
                        <button
                          onClick={() => {
                            setShowCustomPicker(false);
                            setIsDropdownOpen(false);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Year selector */}
                      <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-white/10">
                        <button
                          onClick={() => setCustomYear(prev => prev - 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span
                          className="text-white text-3xl font-bold tabular-nums w-24 text-center"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {customYear}
                        </span>
                        <button
                          onClick={() => setCustomYear(prev => prev + 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      {/* Month grid */}
                      <div className="grid grid-cols-4 gap-2 mb-5">
                        {months.map((month, idx) => {
                          const isStart = idx === customStartMonth;
                          const isEnd = idx === customEndMonth;
                          const isInRange = idx > customStartMonth && idx < customEndMonth;
                          const isSelected = isStart || isEnd;

                          return (
                            <button
                              key={month}
                              onClick={() => {
                                if (customStartMonth === customEndMonth) {
                                  if (idx < customStartMonth) setCustomStartMonth(idx);
                                  else if (idx > customStartMonth) setCustomEndMonth(idx);
                                } else {
                                  setCustomStartMonth(idx);
                                  setCustomEndMonth(idx);
                                }
                              }}
                              className="h-11 rounded-xl text-sm font-semibold transition-all duration-200"
                              style={{
                                background: isSelected
                                  ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                                  : isInRange
                                    ? 'rgba(251, 191, 36, 0.15)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: isSelected
                                  ? '#1c1917'
                                  : isInRange
                                    ? '#fcd34d'
                                    : '#a8a29e',
                                boxShadow: isSelected
                                  ? '0 2px 8px rgba(251, 191, 36, 0.3)'
                                  : 'none',
                              }}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected range display */}
                      <div
                        className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <span className="text-amber-300 font-semibold">{months[customStartMonth]}</span>
                        {customStartMonth !== customEndMonth && (
                          <>
                            <span className="text-stone-500">→</span>
                            <span className="text-amber-300 font-semibold">{months[customEndMonth]}</span>
                          </>
                        )}
                        <span className="text-stone-400">{customYear}</span>
                      </div>

                      {/* Apply button */}
                      <button
                        onClick={applyCustomRange}
                        className="w-full py-3.5 rounded-xl font-semibold transition-all duration-300 active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                          color: '#1c1917',
                          boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)',
                        }}
                      >
                        Apply Range
                      </button>
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
            )}

            {/* Custom actions */}
            {actions}
          </div>
        </div>

        {/* Tab Navigation */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-3 sm:gap-4 mt-8 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-900 shadow-lg'
                    : 'text-stone-400 hover:text-white border border-stone-600 hover:border-stone-500 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Optional children */}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
