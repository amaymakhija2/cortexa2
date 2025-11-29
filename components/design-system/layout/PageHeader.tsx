import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  /** Subtitle/description below title */
  subtitle?: string;
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
  subtitle,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartMonth, setCustomStartMonth] = useState(0);
  const [customEndMonth, setCustomEndMonth] = useState(11);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatCustomRange = () => {
    if (customStartMonth === customEndMonth) {
      return `${months[customStartMonth]} ${customYear}`;
    }
    return `${months[customStartMonth]} – ${months[customEndMonth]} ${customYear}`;
  };

  const applyCustomRange = () => {
    onTimePeriodChange?.('custom');
    setShowDatePicker(false);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Primary glow accent */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentConfig.glow} 0%, transparent 70%)` }}
      />

      {/* Secondary glow accent */}
      <div
        className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15 blur-2xl"
        style={{ background: `radial-gradient(circle, ${accentConfig.glowSecondary} 0%, transparent 70%)` }}
      />

      <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            {label && (
              <p className={`${accentConfig.labelClass} text-sm font-semibold tracking-widest uppercase mb-2`}>
                {label}
              </p>
            )}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-stone-400 text-base sm:text-lg mt-2">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Time Period Selector */}
            {showTimePeriod && (
              <div className="relative">
                {/* Mobile: Select dropdown */}
                <select
                  value={timePeriod}
                  onChange={(e) => onTimePeriodChange?.(e.target.value as TimePeriod)}
                  className="lg:hidden px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-sm font-medium text-white"
                >
                  {timePeriods.map((period) => (
                    <option key={period.id} value={period.id} className="text-stone-900">{period.label}</option>
                  ))}
                  <option value="custom" className="text-stone-900">Custom Range</option>
                </select>

                {/* Desktop: Button group */}
                <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => onTimePeriodChange?.(period.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        timePeriod === period.id
                          ? 'bg-white text-stone-900 shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                  {/* Custom Range Button */}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`group px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      timePeriod === 'custom'
                        ? 'bg-white text-stone-900 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Calendar
                      size={16}
                      className={`transition-transform duration-500 ${showDatePicker ? 'rotate-12' : 'group-hover:rotate-6'}`}
                    />
                    <span>{timePeriod === 'custom' ? formatCustomRange() : 'Custom'}</span>
                  </button>
                </div>

                {/* Custom Date Picker */}
                {showDatePicker && (
                  <div
                    className="absolute top-full right-0 mt-3 z-[100000] rounded-2xl bg-white p-4 sm:p-6"
                    style={{
                      width: 'clamp(280px, 85vw, 380px)',
                      maxWidth: 'calc(100vw - 32px)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-stone-900 text-lg font-semibold">Custom Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-stone-100">
                      <button
                        onClick={() => setCustomYear(prev => prev - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span
                        className="text-stone-900 text-2xl font-bold tabular-nums w-20 text-center"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {customYear}
                      </span>
                      <button
                        onClick={() => setCustomYear(prev => prev + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 sm:mb-5">
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
                            className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-stone-900 text-white'
                                : isInRange
                                  ? 'bg-stone-100 text-stone-700'
                                  : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-xl bg-stone-50">
                      <span className="text-stone-900 font-semibold">{months[customStartMonth]}</span>
                      {customStartMonth !== customEndMonth && (
                        <>
                          <span className="text-stone-400">→</span>
                          <span className="text-stone-900 font-semibold">{months[customEndMonth]}</span>
                        </>
                      )}
                      <span className="text-stone-500">{customYear}</span>
                    </div>

                    <button
                      onClick={applyCustomRange}
                      className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold transition-all hover:bg-stone-800 active:scale-[0.98]"
                    >
                      Apply
                    </button>
                  </div>
                )}
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
