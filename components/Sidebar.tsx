import React, { useState, useRef, useCallback } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Calculator,
  Banknote,
  X,
  BarChart3,
  MessageSquare,
  Settings,
  Sliders,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

// =============================================================================
// GLASSMORPHIC FLOATING SIDEBAR
// Warm translucent glass with blur, inspired by the Cortexa LP navigation pill.
// Floats over content with pill-shaped edges and sophisticated shadows.
// =============================================================================

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Overview',
    icon: LayoutGrid,
    subItems: [
      { id: 'summary', label: 'Summary' },
      { id: 'compare', label: 'Compare' },
    ]
  },
  {
    path: '/clinician-overview',
    label: 'Clinicians',
    icon: Users,
    subItems: [
      { id: 'ranking', label: 'Spotlight' },
      { id: 'details', label: 'Details' },
    ]
  },
  {
    path: '/practice-analysis',
    label: 'Practice',
    icon: BarChart3,
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
    icon: MessageSquare,
  },
];

const FOOTER_ITEMS = [
  { path: '/components', label: 'Components', icon: LayoutGrid },
  { path: '/configure', label: 'Configure', icon: Sliders },
];

const UPCOMING = [
  { label: 'Accounting', icon: Calculator },
  { label: 'Payroll', icon: Banknote },
];

// Glassmorphic style constants (matching LP navigation pill)
// READABILITY FIX: Higher opacity when expanded for text contrast
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
  const currentPath = location.pathname;
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsCollapsed?.(false);
  }, [setIsCollapsed]);

  const handleMouseLeave = useCallback(() => {
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
        {/* Inner glow overlay for depth + frosted edge highlights */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 24,
            background: `
              linear-gradient(180deg,
                rgba(255, 255, 255, 0.5) 0%,
                rgba(255, 255, 255, 0.15) 8%,
                rgba(255, 255, 255, 0) 25%,
                rgba(255, 255, 255, 0) 75%,
                rgba(250, 248, 245, 0.2) 100%
              )
            `,
          }}
        />

        {/* Subtle inner border for glass edge definition */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 24,
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(168, 154, 140, 0.1)',
          }}
        />

        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 rounded-full transition-all z-10"
          onClick={closeMobile}
          style={{
            background: 'rgba(168, 154, 140, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* ══════════════ HEADER ══════════════ */}
        <div
          className="flex-shrink-0 relative"
          style={{
            padding: isExpanded ? '20px 16px 14px' : '20px 10px 14px',
            transition: 'padding 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <img
                src="/cortexa-mark.png"
                alt="Cortexa"
                className="w-12 h-12 object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(120, 100, 80, 0.12))',
                }}
              />
            </div>

            <div
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 350ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                transitionDelay: isExpanded ? '100ms' : '0ms',
                pointerEvents: isExpanded ? 'auto' : 'none',
              }}
            >
              <span
                className="text-[22px] font-medium tracking-[-0.02em] text-stone-800"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                Cortexa
              </span>
            </div>
          </div>

          {/* Sync status row */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid rgba(168, 154, 140, 0.15)',
              opacity: isExpanded ? 1 : 0,
              maxHeight: isExpanded ? 50 : 0,
              overflow: 'hidden',
              transition: 'all 350ms cubic-bezier(0.22, 0.61, 0.36, 1)',
              transitionDelay: isExpanded ? '50ms' : '0ms',
            }}
          >
            <button
              onClick={handleSync}
              className="group flex items-center gap-2 w-full"
            >
              <div className="relative">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isSyncing ? '#f59e0b' : '#10b981',
                    boxShadow: `0 0 8px ${isSyncing ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)'}`,
                  }}
                />
              </div>
              <span
                className="text-[12px] text-stone-500 group-hover:text-stone-700 transition-colors"
                style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
              >
                {isSyncing ? 'Syncing...' : 'Synced 2h ago'}
              </span>
              <RefreshCw
                size={11}
                className={`ml-auto text-stone-400 group-hover:text-stone-600 transition-all ${isSyncing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* ══════════════ NAVIGATION ══════════════ */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          style={{ padding: '0 8px' }}
        >
          <div className="space-y-1">
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
                    className="group block"
                  >
                    <div
                      className="relative flex items-center overflow-hidden"
                      style={{
                        height: 48,
                        borderRadius: 16,
                        background: isActive
                          ? 'rgba(245, 158, 11, 0.12)'
                          : 'transparent',
                        transition: 'background 250ms ease',
                      }}
                    >
                      {/* Hover state - subtle glass effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: isActive ? 'transparent' : 'rgba(168, 154, 140, 0.08)',
                          borderRadius: 16,
                        }}
                      />

                      {/* Active indicator - amber gradient underline */}
                      {isActive && (
                        <div
                          className="absolute bottom-2 left-3 right-3 h-[2px] rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{ width: 52, height: 48 }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.75}
                          style={{
                            color: isActive ? '#d97706' : '#78716c',
                            transition: 'color 200ms ease',
                          }}
                          className="group-hover:text-stone-700"
                        />
                      </div>

                      {/* Label */}
                      <div
                        className="flex-1 flex items-center justify-between pr-3 relative z-10"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
                          transition: 'all 250ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                          transitionDelay: isExpanded ? '80ms' : '0ms',
                          pointerEvents: isExpanded ? 'auto' : 'none',
                        }}
                      >
                        <span
                          className="text-[14px] font-semibold tracking-[-0.01em]"
                          style={{
                            color: isActive ? '#292524' : '#57534e',
                            fontFamily: "'Suisse Intl', system-ui, sans-serif",
                            transition: 'color 200ms ease',
                          }}
                        >
                          {item.label}
                        </span>

                        {hasSubItems && (
                          <ChevronDown
                            size={14}
                            style={{
                              color: isActive ? '#d97706' : '#a8a29e',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'all 250ms ease',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </NavLink>

                  {/* Sub-items with staggered animation */}
                  {hasSubItems && isActive && isExpanded && (
                    <div
                      className="mt-1 mb-2"
                      style={{
                        marginLeft: 24,
                        paddingLeft: 18,
                        borderLeft: '1px solid rgba(168, 154, 140, 0.18)',
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
                            className="group/sub w-full text-left py-2 flex items-center gap-2"
                            style={{
                              opacity: 1,
                              animation: `fadeSlideIn 250ms cubic-bezier(0.22, 0.61, 0.36, 1) ${idx * 40}ms both`,
                            }}
                          >
                            {/* Active dot with glow */}
                            <div
                              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                              style={{
                                backgroundColor: isSubActive ? '#d97706' : 'transparent',
                                border: isSubActive ? 'none' : '1.5px solid #a8a29e',
                                transform: isSubActive ? 'scale(1)' : 'scale(0.85)',
                                boxShadow: isSubActive ? '0 0 6px rgba(217, 119, 6, 0.4)' : 'none',
                              }}
                            />
                            <span
                              className="text-[13px] transition-colors duration-200"
                              style={{
                                color: isSubActive ? '#292524' : '#78716c',
                                fontFamily: "'Suisse Intl', system-ui, sans-serif",
                                fontWeight: isSubActive ? 600 : 500,
                              }}
                            >
                              {sub.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Coming Soon - muted section */}
          <div
            className="mt-6 pt-4"
            style={{
              borderTop: '1px solid rgba(168, 154, 140, 0.12)',
              opacity: isExpanded ? 0.5 : 0,
              transition: 'opacity 350ms ease',
            }}
          >
            <div
              className="px-3 mb-2 text-[10px] font-semibold tracking-[0.1em] uppercase"
              style={{
                color: '#a8a29e',
                fontFamily: "'Suisse Intl', system-ui, sans-serif",
              }}
            >
              Coming Soon
            </div>
            {UPCOMING.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center h-10 rounded-xl cursor-not-allowed"
                >
                  <div className="w-[52px] flex items-center justify-center">
                    <Icon size={18} strokeWidth={1.5} className="text-stone-400" />
                  </div>
                  <span
                    className="text-[13px] text-stone-400"
                    style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
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
            padding: '12px 8px 14px',
            borderTop: '1px solid rgba(168, 154, 140, 0.12)',
          }}
        >
          {/* Footer nav items */}
          <div className="space-y-0.5 mb-3">
            {FOOTER_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className="group flex items-center h-10 rounded-xl transition-all duration-200"
                  style={{
                    background: 'transparent',
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                        style={{ background: 'rgba(168, 154, 140, 0.08)' }}
                      />
                      <div className="w-[52px] flex items-center justify-center relative z-10">
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          style={{
                            color: isActive ? '#d97706' : '#78716c',
                            transition: 'color 200ms ease',
                          }}
                        />
                      </div>
                      <span
                        className="text-[13px] relative z-10"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          color: isActive ? '#292524' : '#78716c',
                          fontFamily: "'Suisse Intl', system-ui, sans-serif",
                          fontWeight: isActive ? 600 : 500,
                          transition: 'opacity 250ms ease, color 200ms ease',
                        }}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* User profile card - glassmorphic */}
          <NavLink
            to="/settings"
            onClick={closeMobile}
            className="group block"
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  padding: isExpanded ? '10px 12px' : '8px',
                  borderRadius: 16,
                  background: isActive
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(168, 154, 140, 0.08)',
                  border: isActive
                    ? '1px solid rgba(245, 158, 11, 0.2)'
                    : '1px solid rgba(168, 154, 140, 0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Avatar with status indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                    alt="Profile"
                    className="w-9 h-9 rounded-xl object-cover"
                    style={{
                      border: '2px solid rgba(168, 154, 140, 0.2)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: '#10b981',
                      border: '2px solid rgba(253, 252, 251, 0.9)',
                      boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
                    }}
                  />
                </div>

                {/* User info */}
                <div
                  className="flex-1 min-w-0"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
                    transition: 'all 250ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  <p
                    className="text-[13px] font-medium text-stone-800 truncate"
                    style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
                  >
                    Sarah Mitchell
                  </p>
                  <p
                    className="text-[11px] text-stone-500 truncate"
                    style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
                  >
                    Practice Admin
                  </p>
                </div>

                <Settings
                  size={14}
                  className="text-stone-400 group-hover:text-stone-600 transition-colors flex-shrink-0"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 250ms ease',
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
      `}</style>
    </>
  );
};
