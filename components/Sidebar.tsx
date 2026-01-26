import React, { useState, useRef, useCallback } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Users,
  House,
  TrendUp,
  Calculator,
  Money,
  X,
  Gear,
  ArrowsClockwise,
  CaretRight,
} from '@phosphor-icons/react';
import { useSettings } from '../context/SettingsContext';

// =============================================================================
// GLASSMORPHIC FLOATING SIDEBAR
// Matches the Cortexa LP navigation pill aesthetic exactly.
// Amber accent system, stone neutrals, luminous glass effects.
//
// COLOR PALETTE: LP Nav Pill System
// - Primary accent: Amber (#f59e0b / #fbbf24) - warm, energetic
// - Active states: Amber gradient underlines, not background fills
// - Text: Stone scale (stone-600 → stone-900 on hover/active)
// - Glass: Warm translucent with 20px blur
// =============================================================================

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

// Color palette - matching LP Navigation pill exactly
const COLORS = {
  // Primary accent - amber (from LP nav active underline)
  accent: '#f59e0b',        // amber-500
  accentLight: '#fbbf24',   // amber-400
  accentGlow: 'rgba(251, 191, 36, 0.4)',

  // Text colors - stone scale (from LP nav)
  textPrimary: '#1c1917',   // stone-900
  textSecondary: '#57534e', // stone-600
  textMuted: '#78716c',     // stone-500
  textDisabled: '#a8a29e',  // stone-400

  // Borders and dividers - warm stone
  border: 'rgba(168, 154, 140, 0.25)',
  borderHover: 'rgba(168, 154, 140, 0.4)',

  // Status colors - refined
  statusSynced: '#22c55e',  // green-500
  statusSyncing: '#f59e0b', // amber-500
} as const;

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Overview',
    icon: Compass,
    imageSrc: '/compass-icon.png',
    imageSize: 38,
    subItems: [
      { id: 'summary', label: 'Summary' },
      { id: 'compare', label: 'Compare' },
    ]
  },
  {
    path: '/clinician-overview',
    label: 'Clinicians',
    icon: Users,
    imageSrc: '/clinicians-icon.png',
    imageSize: 40,
    subItems: [
      { id: 'ranking', label: 'Spotlight' },
      { id: 'details', label: 'Details' },
    ]
  },
  {
    path: '/practice-analysis',
    label: 'Practice',
    icon: House,
    imageSrc: '/practice-icon.png',
    imageSize: 44,
    subItems: [
      { id: 'clients', label: 'Roster' },
      { id: 'consultations', label: 'Consults' },
      { id: 'financial', label: 'Financial' },
      { id: 'sessions', label: 'Sessions' },
      { id: 'retention', label: 'Retention' },
      { id: 'insurance', label: 'Insurance' },
    ]
  },
  {
    path: '/consultations',
    label: 'Pipeline',
    icon: TrendUp,
    imageSrc: '/pipeline-icon.png',
    imageSize: 44,
  },
];

const UPCOMING = [
  { label: 'Accounting', icon: Calculator },
  { label: 'Payroll', icon: Money },
];

// Glassmorphic style constants - higher opacity for readability
const GLASS_STYLES = {
  collapsed: {
    background: 'rgba(253, 252, 251, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(168, 154, 140, 0.25)',
    boxShadow: '0 4px 20px -4px rgba(120, 100, 80, 0.1), 0 8px 32px -8px rgba(0, 0, 0, 0.06)',
  },
  expanded: {
    // Higher opacity (0.88) ensures text is readable while maintaining glass feel
    background: 'rgba(253, 252, 251, 0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(168, 154, 140, 0.3)',
    boxShadow: '0 8px 32px -4px rgba(120, 100, 80, 0.15), 0 16px 48px -8px rgba(0, 0, 0, 0.1)',
  },
} as const;

export const Sidebar: React.FC<SidebarProps> = ({
  mobileMenuOpen = false,
  setMobileMenuOpen,
  isCollapsed = true,
  setIsCollapsed
}) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSettings();
  const useIllustratedIcons = settings.iconStyle === 'illustrated';
  const currentPath = location.pathname;
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Cancel any pending collapse
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    // Delay expansion to avoid triggering on quick hover-through
    expandTimeoutRef.current = setTimeout(() => {
      setIsCollapsed?.(false);
    }, 200);
  }, [setIsCollapsed]);

  const handleMouseLeave = useCallback(() => {
    // Cancel any pending expansion
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }
    // Delay collapse
    collapseTimeoutRef.current = setTimeout(() => {
      setIsCollapsed?.(true);
    }, 400);
  }, [setIsCollapsed]);

  const isExpanded = mobileMenuOpen || !isCollapsed;
  const glassStyle = isExpanded ? GLASS_STYLES.expanded : GLASS_STYLES.collapsed;

  const handleSubItemClick = (itemId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', itemId);
    setSearchParams(newParams, { replace: true });
    setMobileMenuOpen?.(false);
  };

  const getActiveSubItem = (path: string, subItems?: { id: string }[]) => {
    if (currentPath !== path || !subItems) return null;
    return searchParams.get('tab') || subItems[0]?.id;
  };

  const closeMobile = () => setMobileMenuOpen?.(false);

  // Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <>
      {/* Mobile backdrop - frosted glass effect */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMobile}
          style={{
            background: 'rgba(254, 250, 245, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      )}

      {/* Floating Glassmorphic Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed z-50 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          lg:translate-x-0 lg:opacity-100
        `}
        style={{
          // Floating position with margin from edges
          top: 12,
          left: 12,
          bottom: 12,
          width: isExpanded ? 280 : 68,
          // Pill shape - rounded on all sides since it's floating
          borderRadius: 24,
          // Allow compass icon to overflow
          overflow: 'visible',
          // Glassmorphic styling
          ...glassStyle,
          // Smooth transitions
          transition: `
            width 400ms cubic-bezier(0.22, 0.61, 0.36, 1),
            transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity 300ms ease,
            background 400ms ease,
            box-shadow 400ms ease,
            border 400ms ease
          `,
        }}
      >
        {/* Subtle top highlight for glass edge - LP style */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            borderRadius: '24px 24px 0 0',
            background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
          }}
        />

        {/* Mobile close button - LP style */}
        <button
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-10 hover:scale-105 active:scale-95"
          onClick={closeMobile}
          style={{
            color: COLORS.textSecondary,
            background: 'transparent',
          }}
        >
          <X size={18} weight="regular" />
        </button>

        {/* ══════════════ HEADER ══════════════ */}
        <div
          className="flex-shrink-0 relative"
          style={{
            padding: '20px 8px 16px',
            transition: 'padding 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {/* Logo + Brand - LP nav style */}
          <a
            href="#"
            className="flex items-center group"
            style={{
              transition: 'all 200ms ease-out',
            }}
          >
            {/* Logo mark - 52px container to center in collapsed state */}
            <div
              className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.02]"
              style={{ width: 52 }}
            >
              <img
                src="/cortexa-mark.png"
                alt="Cortexa"
                className="h-11 w-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(120, 100, 80, 0.12))',
                }}
              />
            </div>

            {/* Wordmark - matches LP exactly */}
            <span
              className="font-medium tracking-[-0.02em] leading-none"
              style={{
                fontSize: '1.65rem',
                color: COLORS.textPrimary,
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                transitionDelay: isExpanded ? '100ms' : '0ms',
                pointerEvents: isExpanded ? 'auto' : 'none',
              }}
            >
              Cortexa
            </span>
          </a>

          {/* ═══════════════════════════════════════════════════════════════════
              UNIFIED SYNC STATUS - Precision Morphing Element
              Collapsed: Jewel-like indicator centered in 52px column
              Expanded: Content reveals to the right, jewel stays FIXED
              Swiss precision - zero unnecessary movement
          ═══════════════════════════════════════════════════════════════════ */}
          <div
            className="flex items-center"
            style={{
              marginTop: 16,
              height: 36,
            }}
          >
            <button
              onClick={handleSync}
              className="group relative flex items-center"
              style={{
                width: isExpanded ? '100%' : 52,
                height: 36,
                borderRadius: 18,
                padding: 0,
                background: isExpanded
                  ? 'rgba(120, 113, 108, 0.045)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'width 500ms cubic-bezier(0.22, 0.61, 0.36, 1), background 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
              }}
            >
              {/* ─────────── THE STATUS JEWEL ─────────── */}
              {/* Fixed 52px container - jewel is ALWAYS centered here, never moves */}
              <div
                className="relative flex-shrink-0 flex items-center justify-center"
                style={{ width: 52, height: 36 }}
              >
                {/* Outer bezel - architectural frame */}
                <div
                  className="absolute transition-all duration-300"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `conic-gradient(
                      from 0deg,
                      ${isSyncing ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.08)'} 0deg,
                      ${isSyncing ? 'rgba(245, 158, 11, 0.03)' : 'rgba(34, 197, 94, 0.02)'} 180deg,
                      ${isSyncing ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.08)'} 360deg
                    )`,
                    boxShadow: isSyncing
                      ? 'inset 0 0 0 1px rgba(245, 158, 11, 0.15)'
                      : 'inset 0 0 0 1px rgba(34, 197, 94, 0.1)',
                    animation: isSyncing ? 'bezelRotate 3s linear infinite' : 'none',
                  }}
                />

                {/* Middle glow layer - ambient luminosity */}
                <div
                  className="absolute transition-all duration-300"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isSyncing
                      ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)'
                      : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 70%)',
                    animation: isSyncing ? 'glowPulse 2s ease-in-out infinite' : 'none',
                  }}
                />

                {/* Core status gem - the heart */}
                <div
                  className="absolute transition-all duration-300"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isSyncing
                      ? `radial-gradient(circle at 30% 30%, #fcd34d 0%, ${COLORS.statusSyncing} 50%, #d97706 100%)`
                      : `radial-gradient(circle at 30% 30%, #4ade80 0%, ${COLORS.statusSynced} 50%, #16a34a 100%)`,
                    boxShadow: isSyncing
                      ? '0 0 12px 2px rgba(245, 158, 11, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                      : '0 0 8px 1px rgba(34, 197, 94, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
                    animation: isSyncing ? 'corePulse 2s ease-in-out infinite' : 'none',
                  }}
                />
              </div>

              {/* ─────────── EXPANDED CONTENT ─────────── */}
              {/* Text and icon reveal to the right of the fixed jewel */}
              <div
                className="flex items-center justify-between flex-1 overflow-hidden"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transition: 'opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                  transitionDelay: isExpanded ? '150ms' : '0ms',
                }}
              >
                <span
                  className="text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap group-hover:text-stone-800 transition-colors duration-200"
                  style={{ color: COLORS.textSecondary }}
                >
                  {isSyncing ? 'Syncing...' : 'Synced 2h ago'}
                </span>

                <ArrowsClockwise
                  size={13}
                  weight="regular"
                  className={`mr-3 transition-colors duration-200 group-hover:text-stone-600 ${isSyncing ? 'animate-spin' : ''}`}
                  style={{ color: COLORS.textMuted }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ══════════════ NAVIGATION ══════════════ */}
        <nav
          className="flex-1 overflow-y-auto relative"
          style={{ padding: '0 8px', overflowX: 'visible' }}
        >
          <div className="space-y-4">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              const activeSubItem = getActiveSubItem(item.path, item.subItems);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const Icon = item.icon;

              return (
                <div key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeMobile}
                    className="group relative block"
                  >
                    {/* Container with icon + label */}
                    <div
                      className="relative flex items-center"
                      style={{
                        height: 48,
                        overflow: 'visible',
                        transition: 'all 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                      }}
                    >
                      {/* Icon - 52px to center in 68px collapsed (68 - 16px padding = 52) */}
                      <div
                        className="flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{
                          width: 52,
                          height: 48,
                          overflow: 'visible',
                          transition: 'all 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                        }}
                      >
                        {useIllustratedIcons && item.imageSrc ? (
                          <img
                            src={item.imageSrc}
                            alt={item.label}
                            style={{
                              width: item.imageSize || 72,
                              height: item.imageSize || 72,
                              objectFit: 'contain',
                              opacity: isActive ? 1 : 0.75,
                              transition: 'all 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                            }}
                          />
                        ) : Icon ? (
                          <Icon
                            size={20}
                            weight="regular"
                            className="transition-colors duration-500"
                            style={{
                              color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
                            }}
                          />
                        ) : null}
                      </div>

                      {/* Label - LP nav style */}
                      <span
                        className="relative z-10 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-500"
                        style={{
                          color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
                          opacity: isExpanded ? 1 : 0,
                          transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
                          transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1), color 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                          transitionDelay: isExpanded ? '80ms' : '0ms',
                          pointerEvents: isExpanded ? 'auto' : 'none',
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Active indicator - amber gradient underline (LP style) */}
                      <span
                        className="absolute rounded-full transition-all duration-200 ease-out origin-center"
                        style={{
                          left: 8,
                          right: isExpanded ? 8 : 8,
                          bottom: -2,
                          height: 2,
                          background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        }}
                      />

                      {/* Hover underline - appears on non-active items */}
                      <span
                        className="absolute rounded-full transition-all duration-200 ease-out origin-center opacity-0 group-hover:opacity-70 group-hover:scale-x-100"
                        style={{
                          left: 8,
                          right: isExpanded ? 8 : 8,
                          bottom: -2,
                          height: 2,
                          background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                          transform: 'scaleX(0)',
                          display: isActive ? 'none' : 'block',
                        }}
                      />
                    </div>
                  </NavLink>

                  {/* Sub-items - refined LP style */}
                  {hasSubItems && isActive && isExpanded && (
                    <div
                      className="mb-2 ml-[26px] pl-[18px]"
                      style={{
                        borderLeft: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {item.subItems!.map((sub, idx) => {
                        const isSubActive = activeSubItem === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubItemClick(sub.id);
                            }}
                            className="group/sub relative w-full text-left py-2 pl-1 flex items-center"
                            style={{
                              animation: `fadeSlideIn 300ms cubic-bezier(0.22, 0.61, 0.36, 1) ${idx * 50}ms both`,
                            }}
                          >
                            <span
                              className="text-[14px] font-medium tracking-[-0.01em] transition-colors duration-200 group-hover/sub:text-stone-900"
                              style={{
                                color: isSubActive ? COLORS.textPrimary : COLORS.textMuted,
                              }}
                            >
                              {sub.label}
                            </span>

                            {/* Sub-item active indicator */}
                            {isSubActive && (
                              <CaretRight
                                size={12}
                                weight="bold"
                                className="ml-auto"
                                style={{ color: COLORS.accent }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Coming Soon - subtle, muted */}
          <div
            className="mt-8 pt-4"
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            <div
              className="mb-3 text-[10px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: COLORS.textDisabled, paddingLeft: 20 }}
            >
              Coming Soon
            </div>
            {UPCOMING.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center cursor-not-allowed opacity-40"
                  style={{ height: 40 }}
                >
                  <div className="w-[52px] flex items-center justify-center">
                    <Icon size={18} weight="regular" style={{ color: COLORS.textDisabled }} />
                  </div>
                  <span
                    className="text-[14px] font-medium tracking-[-0.01em]"
                    style={{ color: COLORS.textDisabled }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </nav>

        {/* ══════════════ FOOTER ══════════════ */}
        <div
          className="flex-shrink-0 relative"
          style={{
            padding: '12px 8px 16px',
          }}
        >
          {/* Settings link - LP nav style */}
          <NavLink
            to="/settings"
            onClick={closeMobile}
            className="group relative block"
          >
            {({ isActive }) => (
              <div
                className="relative flex items-center"
                style={{ height: 52 }}
              >
                {/* Avatar - 52px container to match nav icons */}
                <div
                  className="flex items-center justify-center flex-shrink-0 relative transition-transform duration-200 group-hover:scale-[1.02]"
                  style={{ width: 52 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                    style={{
                      border: '2px solid rgba(168, 154, 140, 0.3)',
                    }}
                  />
                  {/* Online indicator */}
                  <div
                    className="absolute bottom-1 right-1 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS.statusSynced,
                      border: '2px solid rgba(253, 252, 251, 0.9)',
                      boxShadow: '0 0 6px rgba(34, 197, 94, 0.4)',
                    }}
                  />
                </div>

                {/* User info */}
                <div
                  className="flex-1 min-w-0"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
                    transition: 'all 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                    transitionDelay: isExpanded ? '80ms' : '0ms',
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  <p
                    className="text-[14px] font-semibold tracking-[-0.01em] truncate transition-colors duration-500"
                    style={{ color: isActive ? COLORS.textPrimary : COLORS.textSecondary }}
                  >
                    Sarah Mitchell
                  </p>
                  <p
                    className="text-[12px] font-medium truncate"
                    style={{ color: COLORS.textMuted }}
                  >
                    Practice Admin
                  </p>
                </div>

                <Gear
                  size={16}
                  weight="regular"
                  className="flex-shrink-0 transition-all duration-200 group-hover:rotate-45 mr-2"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 500ms ease, transform 300ms ease',
                    color: COLORS.textMuted,
                  }}
                />

                {/* Active indicator - amber underline */}
                <span
                  className="absolute bottom-0 rounded-full transition-all duration-200 ease-out origin-center"
                  style={{
                    left: 8,
                    right: 8,
                    height: 2,
                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />

                {/* Hover underline */}
                <span
                  className="absolute bottom-0 rounded-full transition-all duration-200 ease-out origin-center opacity-0 group-hover:opacity-70 group-hover:scale-x-100"
                  style={{
                    left: 8,
                    right: 8,
                    height: 2,
                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    transform: 'scaleX(0)',
                    display: isActive ? 'none' : 'block',
                  }}
                />
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Luxury horology-inspired animations */
        @keyframes bezelRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 10px 2px rgba(245, 158, 11, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 16px 4px rgba(245, 158, 11, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4); }
        }
      `}</style>
    </>
  );
};
