import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

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

// Primary navigation items
const PRIMARY_TABS = [
  { path: '/dashboard', label: 'Overview', shortLabel: 'Overview' },
  { path: '/practice-analysis', label: 'Practice Analysis', shortLabel: 'Analysis' },
  { path: '/clinician-overview', label: 'Clinicians', shortLabel: 'Clinicians' },
];

interface UnifiedNavigationProps {
  onMobileMenuOpen?: () => void;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubTabsVisible, setIsSubTabsVisible] = useState(false);

  // Determine current primary tab and sub-tabs
  const currentPath = location.pathname;
  const subTabs = SUB_TABS[currentPath];
  const hasSubTabs = !!subTabs && subTabs.length > 0;

  // Get current sub-tab from URL or default to first
  const currentSubTab = searchParams.get('tab') || (subTabs?.[0]?.id ?? '');

  // Animate sub-tabs in when route changes
  useEffect(() => {
    if (hasSubTabs) {
      const timer = setTimeout(() => setIsSubTabsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsSubTabsVisible(false);
    }
  }, [hasSubTabs, currentPath]);

  // Handle sub-tab change
  const handleSubTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
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
                      : 'text-stone-500 hover:text-stone-300'
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
            relative transition-all duration-400 ease-out overflow-hidden
            ${isSubTabsVisible ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            maxHeight: isSubTabsVisible ? '56px' : '0px',
          }}
        >
          {/* Desktop Sub-tabs - matches primary nav structure for alignment */}
          <div className="hidden lg:flex items-center justify-between px-4 lg:px-8 pt-0 pb-2.5">
            {/* Left spacer - empty to match primary nav's empty left section on desktop */}
            <div className="w-0" />

            {/* Center: Sub-tabs container */}
            <div
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-2xl"
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
                      relative px-5 py-2.5 rounded-xl text-[15px] font-bold tracking-[-0.01em] transition-all duration-300
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

            {/* Right spacer - matches action buttons width (2 buttons × 44px + gap) */}
            <div className="w-[94px]" />
          </div>

          {/* Mobile Sub-tabs - Horizontal scroll */}
          <div className="lg:hidden flex items-center justify-center gap-2 px-4 pt-0 pb-2.5 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => {
              const isActive = currentSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabChange(tab.id)}
                  className={`
                    px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0
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
