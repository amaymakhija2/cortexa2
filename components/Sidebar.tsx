import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
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
import type { Icon } from '@phosphor-icons/react';
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

// Static styles extracted to prevent recreation on each render
const MOBILE_BACKDROP_STYLE: React.CSSProperties = {
  background: 'rgba(254, 250, 245, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const HEADER_TRANSITION_STYLE: React.CSSProperties = {
  padding: '20px 8px 16px',
  transition: 'padding 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const TOP_HIGHLIGHT_STYLE: React.CSSProperties = {
  borderRadius: '24px 24px 0 0',
  background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
};

const LOGO_SHADOW_STYLE: React.CSSProperties = {
  filter: 'drop-shadow(0 2px 8px rgba(120, 100, 80, 0.12))',
};

const AVATAR_BORDER_STYLE: React.CSSProperties = {
  border: '2px solid rgba(168, 154, 140, 0.3)',
};

// Keyframe animations - defined once, not on every render
const KEYFRAME_STYLES = `
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
`;

// =============================================================================
// NAV ITEM COMPONENT - Memoized for performance
// =============================================================================
interface NavItemProps {
  item: typeof NAV_ITEMS[number];
  isExpanded: boolean;
  currentPath: string;
  activeSubItem: string | null;
  useIllustratedIcons: boolean;
  onClose: () => void;
  onSubItemClick: (id: string) => void;
}

const NavItem = memo<NavItemProps>(({
  item,
  isExpanded,
  currentPath,
  activeSubItem,
  useIllustratedIcons,
  onClose,
  onSubItemClick,
}) => {
  const isActive = currentPath === item.path;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = item.icon;

  const labelStyle = useMemo<React.CSSProperties>(() => ({
    color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
    transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1), color 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    transitionDelay: isExpanded ? '80ms' : '0ms',
    pointerEvents: isExpanded ? 'auto' : 'none',
  }), [isActive, isExpanded]);

  const activeIndicatorStyle = useMemo<React.CSSProperties>(() => ({
    left: 8,
    right: isExpanded ? 8 : 8,
    bottom: -2,
    height: 2,
    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    opacity: isActive ? 1 : 0,
    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
  }), [isActive, isExpanded]);

  const hoverIndicatorStyle = useMemo<React.CSSProperties>(() => ({
    left: 8,
    right: isExpanded ? 8 : 8,
    bottom: -2,
    height: 2,
    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    transform: 'scaleX(0)',
    display: isActive ? 'none' : 'block',
  }), [isActive, isExpanded]);

  return (
    <div>
      <NavLink
        to={item.path}
        onClick={onClose}
        className="group relative block"
      >
        <div
          className="relative"
          style={{
            height: 48,
            overflow: 'visible',
          }}
        >
          {/* Icon container - FIXED position, never moves */}
          <div
            className="absolute left-0 top-0 flex items-center justify-center z-10"
            style={{
              width: 52,
              height: 48,
              overflow: 'visible',
            }}
          >
            {useIllustratedIcons && item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt={item.label}
                loading="lazy"
                style={{
                  width: item.imageSize || 72,
                  height: item.imageSize || 72,
                  objectFit: 'contain',
                  opacity: isActive ? 1 : 0.75,
                  transition: 'opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
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

          {/* Label - positioned after the fixed icon column */}
          <span
            className="absolute left-[52px] top-0 h-full flex items-center z-10 text-[15px] font-semibold tracking-[-0.01em]"
            style={labelStyle}
          >
            {item.label}
          </span>

          {/* Active indicator */}
          <span
            className="absolute rounded-full transition-all duration-200 ease-out origin-center"
            style={activeIndicatorStyle}
          />

          {/* Hover underline */}
          <span
            className="absolute rounded-full transition-all duration-200 ease-out origin-center opacity-0 group-hover:opacity-70 group-hover:scale-x-100"
            style={hoverIndicatorStyle}
          />
        </div>
      </NavLink>

      {/* Sub-items */}
      {hasSubItems && isActive && isExpanded && (
        <div
          className="mb-2 ml-[26px] pl-[18px]"
          style={{ borderLeft: `1px solid ${COLORS.border}` }}
        >
          {item.subItems!.map((sub, idx) => {
            const isSubActive = activeSubItem === sub.id;
            return (
              <button
                key={sub.id}
                onClick={(e) => {
                  e.preventDefault();
                  onSubItemClick(sub.id);
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
});

NavItem.displayName = 'NavItem';

// =============================================================================
// UPCOMING ITEM COMPONENT - Memoized for performance
// =============================================================================
interface UpcomingItemProps {
  label: string;
  icon: Icon;
}

const UpcomingItem = memo<UpcomingItemProps>(({ label, icon: Icon }) => (
  <div
    className="relative cursor-not-allowed opacity-40"
    style={{ height: 40 }}
  >
    {/* Icon - FIXED position */}
    <div className="absolute left-0 top-0 w-[52px] h-full flex items-center justify-center">
      <Icon size={18} weight="regular" style={{ color: COLORS.textDisabled }} />
    </div>
    {/* Label - positioned after fixed icon column */}
    <span
      className="absolute left-[52px] top-0 h-full flex items-center text-[14px] font-medium tracking-[-0.01em]"
      style={{ color: COLORS.textDisabled }}
    >
      {label}
    </span>
  </div>
));

UpcomingItem.displayName = 'UpcomingItem';

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


  // Filter NAV_ITEMS to hide consultations sub-item if toggle is off
  const filteredNavItems = useMemo(() => {
    return NAV_ITEMS.map(item => {
      if (item.path === '/practice-analysis' && item.subItems && !settings.showConsultationMetrics) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => sub.id !== 'consultations')
        };
      }
      return item;
    });
  }, [settings.showConsultationMetrics]);
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

  const handleSubItemClick = useCallback((itemId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', itemId);
    setSearchParams(newParams, { replace: true });
    setMobileMenuOpen?.(false);
  }, [searchParams, setSearchParams, setMobileMenuOpen]);

  const getActiveSubItem = useCallback((path: string, subItems?: { id: string }[]) => {
    if (currentPath !== path || !subItems) return null;
    return searchParams.get('tab') || subItems[0]?.id;
  }, [currentPath, searchParams]);

  const closeMobile = useCallback(() => setMobileMenuOpen?.(false), [setMobileMenuOpen]);

  // Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  }, []);

  // Memoized styles that depend on state
  const sidebarStyle = useMemo<React.CSSProperties>(() => ({
    top: 12,
    left: 12,
    bottom: 12,
    width: isExpanded ? 280 : 68,
    borderRadius: 24,
    overflow: 'visible',
    ...glassStyle,
    transition: `
      width 400ms cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 300ms ease,
      background 400ms ease,
      box-shadow 400ms ease,
      border 400ms ease
    `,
  }), [isExpanded, glassStyle]);

  const wordmarkStyle = useMemo<React.CSSProperties>(() => ({
    fontSize: '1.65rem',
    color: COLORS.textPrimary,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
    transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    transitionDelay: isExpanded ? '100ms' : '0ms',
    pointerEvents: isExpanded ? 'auto' : 'none',
  }), [isExpanded]);

  const syncButtonStyle = useMemo<React.CSSProperties>(() => ({
    width: isExpanded ? '100%' : 52,
    height: 36,
    borderRadius: 18,
    padding: 0,
    background: isExpanded ? 'rgba(120, 113, 108, 0.045)' : 'transparent',
    cursor: 'pointer',
    transition: 'width 500ms cubic-bezier(0.22, 0.61, 0.36, 1), background 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
  }), [isExpanded]);

  const comingSoonStyle = useMemo<React.CSSProperties>(() => ({
    borderTop: `1px solid ${COLORS.border}`,
    opacity: isExpanded ? 1 : 0,
    transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
  }), [isExpanded]);

  const userInfoStyle = useMemo<React.CSSProperties>(() => ({
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
    transition: 'opacity 500ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    transitionDelay: isExpanded ? '80ms' : '0ms',
    pointerEvents: isExpanded ? 'auto' : 'none',
  }), [isExpanded]);

  const gearStyle = useMemo<React.CSSProperties>(() => ({
    opacity: isExpanded ? 1 : 0,
    transition: 'opacity 500ms ease, transform 300ms ease',
    color: COLORS.textMuted,
  }), [isExpanded]);

  // Memoized sync indicator styles
  const bezelStyle = useMemo<React.CSSProperties>(() => ({
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
  }), [isSyncing]);

  const glowLayerStyle = useMemo<React.CSSProperties>(() => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: isSyncing
      ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)'
      : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 70%)',
    animation: isSyncing ? 'glowPulse 2s ease-in-out infinite' : 'none',
  }), [isSyncing]);

  const coreGemStyle = useMemo<React.CSSProperties>(() => ({
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
  }), [isSyncing]);

  const expandedContentStyle = useMemo<React.CSSProperties>(() => ({
    opacity: isExpanded ? 1 : 0,
    transition: 'opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    transitionDelay: isExpanded ? '150ms' : '0ms',
  }), [isExpanded]);

  return (
    <>
      {/* Mobile backdrop - frosted glass effect */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMobile}
          style={MOBILE_BACKDROP_STYLE}
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
        style={sidebarStyle}
      >
        {/* Subtle top highlight for glass edge - LP style */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={TOP_HIGHLIGHT_STYLE}
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
          style={HEADER_TRANSITION_STYLE}
        >
          {/* Logo + Brand - LP nav style */}
          <a
            href="#"
            className="relative block group"
            style={{ height: 44 }}
          >
            {/* Logo mark - FIXED position, never moves */}
            <div
              className="absolute left-0 top-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]"
              style={{ width: 52, height: 44 }}
            >
              <img
                src="/cortexa-mark.png"
                alt="Cortexa"
                className="h-11 w-auto object-contain"
                style={LOGO_SHADOW_STYLE}
              />
            </div>

            {/* Wordmark - positioned after the fixed logo column */}
            <span
              className="absolute left-[52px] top-0 h-full flex items-center font-medium tracking-[-0.02em] leading-none"
              style={wordmarkStyle}
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
            className="relative"
            style={{
              marginTop: 16,
              height: 36,
            }}
          >
            <button
              onClick={handleSync}
              className="group relative block"
              style={syncButtonStyle}
            >
              {/* ─────────── THE STATUS JEWEL ─────────── */}
              {/* FIXED position - jewel never moves */}
              <div
                className="absolute left-0 top-0 flex items-center justify-center"
                style={{ width: 52, height: 36 }}
              >
                {/* Outer bezel - architectural frame */}
                <div
                  className="absolute transition-all duration-300"
                  style={bezelStyle}
                />

                {/* Middle glow layer - ambient luminosity */}
                <div
                  className="absolute transition-all duration-300"
                  style={glowLayerStyle}
                />

                {/* Core status gem - the heart */}
                <div
                  className="absolute transition-all duration-300"
                  style={coreGemStyle}
                />
              </div>

              {/* ─────────── EXPANDED CONTENT ─────────── */}
              {/* Text positioned after the fixed jewel column */}
              <div
                className="absolute left-[52px] top-0 right-0 h-full flex items-center justify-between overflow-hidden"
                style={expandedContentStyle}
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
            {filteredNavItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isExpanded={isExpanded}
                currentPath={currentPath}
                activeSubItem={getActiveSubItem(item.path, item.subItems)}
                useIllustratedIcons={useIllustratedIcons}
                onClose={closeMobile}
                onSubItemClick={handleSubItemClick}
              />
            ))}
          </div>

          {/* Coming Soon - subtle, muted */}
          <div
            className="mt-8 pt-4"
            style={comingSoonStyle}
          >
            <div
              className="mb-3 text-[10px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: COLORS.textDisabled, paddingLeft: 20 }}
            >
              Coming Soon
            </div>
            {UPCOMING.map((item) => (
              <UpcomingItem key={item.label} label={item.label} icon={item.icon} />
            ))}
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
                className="relative"
                style={{ height: 52 }}
              >
                {/* Avatar - FIXED position, never moves */}
                <div
                  className="absolute left-0 top-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]"
                  style={{ width: 52, height: 52 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                    alt="Profile"
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover"
                    style={AVATAR_BORDER_STYLE}
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

                {/* User info - positioned after fixed avatar column */}
                <div
                  className="absolute left-[52px] top-0 h-full flex flex-col justify-center min-w-0 pr-8"
                  style={userInfoStyle}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 group-hover:rotate-45"
                  style={gearStyle}
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

      {/* Keyframes for animations - defined once outside component */}
      <style>{KEYFRAME_STYLES}</style>
    </>
  );
};
