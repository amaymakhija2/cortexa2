import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Bell, Menu, Calendar, ChevronDown, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

// =============================================================================
// UNIFIED NAVIGATION COMPONENT
// =============================================================================
// A sophisticated connected tab panel navigation system.
// Design: Seamless flow from primary tabs → sub-tabs with no visual breaks.
// Aesthetic: Luxury editorial with warm amber accents on deep charcoal.
// =============================================================================

// Sub-tab configuration for pages that have them
const SUB_TABS: Record<string, { id: string; label: string; shortLabel: string }[]> = {
  '/practice-analysis': [
    { id: 'financial', label: 'Financial', shortLabel: 'Financial' },
    { id: 'sessions', label: 'Sessions', shortLabel: 'Sessions' },
    { id: 'capacity-client', label: 'Clients & Capacity', shortLabel: 'Clients' },
    { id: 'retention', label: 'Retention', shortLabel: 'Retention' },
    { id: 'insurance', label: 'Insurance', shortLabel: 'Insurance' },
    { id: 'admin', label: 'Admin', shortLabel: 'Admin' },
  ],
};

// Time period options
type TimePeriod = 'last-12-months' | 'this-year' | 'this-quarter' | 'last-quarter' | 'this-month' | 'last-month' | '2024' | 'custom';

const TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: 'last-12-months', label: 'Last 12 months' },
  { id: 'this-year', label: 'This Year' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'last-quarter', label: 'Last Quarter' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: '2024', label: '2024' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Primary navigation items
const PRIMARY_TABS = [
  { path: '/dashboard', label: 'Overview', shortLabel: 'Overview' },
  { path: '/clinician-overview', label: 'Clinicians', shortLabel: 'Clinicians' },
  { path: '/practice-analysis', label: 'Practice Details', shortLabel: 'Details' },
];

interface UnifiedNavigationProps {
  onMobileMenuOpen?: () => void;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubTabsVisible, setIsSubTabsVisible] = useState(false);

  // Time period selector state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartMonth, setCustomStartMonth] = useState(0);
  const [customEndMonth, setCustomEndMonth] = useState(11);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current primary tab and sub-tabs
  const currentPath = location.pathname;
  const subTabs = SUB_TABS[currentPath];
  const hasSubTabs = !!subTabs && subTabs.length > 0;

  // Get current sub-tab from URL or default to first
  const currentSubTab = searchParams.get('tab') || (subTabs?.[0]?.id ?? '');

  // Get current time period from URL or default
  const timePeriod = (searchParams.get('period') || 'last-12-months') as TimePeriod;

  // Animate sub-tabs in when route changes
  useEffect(() => {
    if (hasSubTabs) {
      const timer = setTimeout(() => setIsSubTabsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsSubTabsVisible(false);
    }
  }, [hasSubTabs, currentPath]);

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

  // Handle sub-tab change
  const handleSubTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  // Handle time period change
  const handlePeriodSelect = (periodId: TimePeriod) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('period', periodId);
    setSearchParams(newParams);
    setIsDropdownOpen(false);
  };

  // Get the current period label
  const getCurrentPeriodLabel = () => {
    if (timePeriod === 'custom') return formatCustomRange();
    const period = TIME_PERIODS.find(p => p.id === timePeriod);
    return period?.label || 'Select period';
  };

  const formatCustomRange = () => {
    if (customStartMonth === customEndMonth) {
      return `${MONTHS[customStartMonth]} ${customYear}`;
    }
    return `${MONTHS[customStartMonth]} – ${MONTHS[customEndMonth]} ${customYear}`;
  };

  const applyCustomRange = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('period', 'custom');
    setSearchParams(newParams);
    setShowCustomPicker(false);
    setIsDropdownOpen(false);
  };

  // Get page title for mobile
  const getPageTitle = () => {
    const tab = PRIMARY_TABS.find(t => t.path === currentPath);
    if (tab) return tab.label;
    if (currentPath === '/clinician-details') return 'Clinician Details';
    if (currentPath === '/settings') return 'Settings';
    return 'Cortexa';
  };

  return (
    <div
      className="relative"
      style={{
        // Single unified background for entire navigation
        background: '#1a1816',
      }}
    >
      {/* Subtle warm glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 opacity-[0.08] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
        }}
      />

      {/* ===== PRIMARY NAVIGATION BAR ===== */}
      <div className="relative flex items-center justify-between px-4 lg:px-8 pt-4 lg:pt-5 pb-3">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={onMobileMenuOpen}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <h1 className="lg:hidden text-white font-semibold text-lg truncate max-w-[200px]">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center justify-center">
          <div className="flex items-center gap-2">
            {PRIMARY_TABS.map((tab) => {
              const isActive = currentPath === tab.path;
              const willHaveSubTabs = !!SUB_TABS[tab.path];

              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`
                    relative px-7 py-3.5 rounded-2xl text-[17px] font-bold tracking-[-0.01em] transition-all duration-300
                    ${isActive
                      ? 'text-white'
                      : 'text-stone-300 hover:text-white'
                    }
                  `}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                      : 'transparent',
                    boxShadow: isActive
                      ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.2)'
                      : 'none',
                  }}
                >
                  {tab.label}

                  {/* Active indicator line */}
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                        boxShadow: '0 0 12px rgba(251, 191, 36, 0.6)',
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200 relative">
            <Bell size={18} strokeWidth={1.5} />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)',
              }}
            />
          </button>
        </div>
      </div>

      {/* ===== SUB-TAB PANEL (Connected) ===== */}
      {hasSubTabs && (
        <div
          className={`
            relative transition-all duration-400 ease-out
            ${isSubTabsVisible ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            maxHeight: isSubTabsVisible ? '80px' : '0px',
            overflow: isSubTabsVisible ? 'visible' : 'hidden',
          }}
        >
          {/* Desktop Sub-tabs - matches primary nav structure for alignment */}
          <div className="hidden lg:flex items-center justify-between px-4 lg:px-8 pt-0 pb-5">
            {/* Left spacer for centering */}
            <div className="w-[180px]" />

            {/* Center: Sub-tabs */}
            <div
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {subTabs.map((tab) => {
                const isActive = currentSubTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSubTabChange(tab.id)}
                    className={`
                      relative px-6 py-3 rounded-xl text-[16px] font-bold tracking-[-0.01em] transition-all duration-300
                      ${isActive
                        ? 'text-stone-900'
                        : 'text-stone-300 hover:text-white hover:bg-white/[0.06]'
                      }
                    `}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)'
                        : 'transparent',
                      boxShadow: isActive
                        ? '0 2px 8px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
                        : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Time Period Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setShowCustomPicker(false);
                  }}
                  className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isDropdownOpen
                      ? '0 0 0 2px rgba(251, 191, 36, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  <Calendar
                    size={18}
                    className="text-amber-400"
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-white text-[16px] font-semibold tracking-[-0.01em]"
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
                      minWidth: '220px',
                      background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                      animation: 'dropdownReveal 0.2s ease-out',
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 opacity-30 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                      }}
                    />

                    <div className="relative py-2">
                      {TIME_PERIODS.map((period) => {
                        const isSelected = timePeriod === period.id;
                        return (
                          <button
                            key={period.id}
                            onClick={() => handlePeriodSelect(period.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 group/item"
                            style={{
                              background: isSelected
                                ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)'
                                : 'transparent',
                            }}
                          >
                            <span
                              className={`text-[14px] font-medium transition-colors duration-200 ${
                                isSelected
                                  ? 'text-amber-300'
                                  : 'text-stone-300 group-hover/item:text-white'
                              }`}
                            >
                              {period.label}
                            </span>
                            {isSelected && (
                              <Check size={14} className="text-amber-400" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}

                      <div className="mx-4 my-2 h-px bg-white/10" />

                      <button
                        onClick={() => setShowCustomPicker(true)}
                        className="w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 group/item"
                        style={{
                          background: timePeriod === 'custom'
                            ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, transparent 100%)'
                            : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-stone-500 group-hover/item:text-amber-400 transition-colors" />
                          <span
                            className={`text-[14px] font-medium transition-colors duration-200 ${
                              timePeriod === 'custom'
                                ? 'text-amber-300'
                                : 'text-stone-300 group-hover/item:text-white'
                            }`}
                          >
                            {timePeriod === 'custom' ? formatCustomRange() : 'Custom Range'}
                          </span>
                        </div>
                        {timePeriod === 'custom' && (
                          <Check size={14} className="text-amber-400" strokeWidth={2.5} />
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
                      width: '320px',
                      background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                      animation: 'dropdownReveal 0.2s ease-out',
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 opacity-25 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center top, #f59e0b 0%, transparent 70%)',
                      }}
                    />

                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setShowCustomPicker(false)}
                          className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft size={16} />
                          <span className="text-sm font-medium">Back</span>
                        </button>
                        <h3 className="text-white text-base font-semibold">Custom Range</h3>
                        <button
                          onClick={() => {
                            setShowCustomPicker(false);
                            setIsDropdownOpen(false);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-3 mb-4 pb-4 border-b border-white/10">
                        <button
                          onClick={() => setCustomYear(prev => prev - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-white text-2xl font-bold tabular-nums w-20 text-center">
                          {customYear}
                        </span>
                        <button
                          onClick={() => setCustomYear(prev => prev + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 mb-4">
                        {MONTHS.map((month, idx) => {
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
                              className="h-9 rounded-lg text-xs font-semibold transition-all duration-200"
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

                      <div
                        className="flex items-center justify-center gap-2.5 mb-4 py-2.5 px-3 rounded-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <span className="text-amber-300 font-semibold text-sm">{MONTHS[customStartMonth]}</span>
                        {customStartMonth !== customEndMonth && (
                          <>
                            <span className="text-stone-500">→</span>
                            <span className="text-amber-300 font-semibold text-sm">{MONTHS[customEndMonth]}</span>
                          </>
                        )}
                        <span className="text-stone-400 text-sm">{customYear}</span>
                      </div>

                      <button
                        onClick={applyCustomRange}
                        className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-[0.98]"
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
          </div>

          {/* Mobile Sub-tabs - Horizontal scroll */}
          <div className="lg:hidden flex items-center justify-center gap-2 px-4 pt-0 pb-3 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => {
              const isActive = currentSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabChange(tab.id)}
                  className={`
                    px-5 py-3 rounded-xl text-[15px] font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0
                    ${isActive
                      ? 'text-stone-900'
                      : 'text-stone-300'
                    }
                  `}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: '1px solid',
                    borderColor: isActive
                      ? 'rgba(251, 191, 36, 0.3)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedNavigation;
