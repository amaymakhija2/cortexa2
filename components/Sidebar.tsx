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
  ChevronRight,
  Lock,
  Settings,
  Sliders,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// SIDEBAR NAVIGATION
// Smooth hover-to-expand with fixed icon rail architecture
// Icons never move - only the expanded content panel slides in
// =============================================================================

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

// Dimensions - icon rail is always 72px, expanded adds 228px more
const ICON_RAIL_WIDTH = 72;
const EXPANDED_CONTENT_WIDTH = 228;
const COLLAPSED_WIDTH = ICON_RAIL_WIDTH;
const EXPANDED_WIDTH = ICON_RAIL_WIDTH + EXPANDED_CONTENT_WIDTH;

// Timing
const COLLAPSE_DELAY = 250;
const TRANSITION_DURATION = '200ms';
const TRANSITION_EASING = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

// Navigation structure
const NAVIGATION = {
  main: [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: LayoutGrid,
      description: 'Key metrics & insights',
      subItems: [
        { id: 'summary', label: 'Summary' },
        { id: 'compare', label: 'Quick Compare' },
      ]
    },
    {
      path: '/clinician-overview',
      label: 'Clinicians',
      icon: Users,
      description: 'Team performance',
      subItems: [
        { id: 'ranking', label: 'Spotlight' },
        { id: 'details', label: 'Individual Details' },
      ]
    },
    {
      path: '/practice-analysis',
      label: 'Practice',
      icon: BarChart3,
      description: 'Operations & analytics',
      subItems: [
        { id: 'clients', label: 'Client Roster' },
        { id: 'consultations', label: 'Consultations' },
        { id: 'financial', label: 'Financial' },
        { id: 'sessions', label: 'Sessions' },
        { id: 'capacity-client', label: 'Clients' },
        { id: 'retention', label: 'Retention' },
        { id: 'insurance', label: 'Insurance' },
        { id: 'admin', label: 'Admin' },
      ]
    },
  ],
  footer: [
    { path: '/components', label: 'Components', icon: LayoutGrid },
    { path: '/configure', label: 'Configure', icon: Sliders },
  ],
  secondary: [
    { path: '/consultations', label: 'Consultations', icon: MessageSquare, description: 'Client pipeline' },
  ],
  upcoming: [
    { label: 'Accounting', icon: Calculator },
    { label: 'Payroll', icon: Banknote },
  ],
};

// =============================================================================
// NAV ITEM COMPONENT - Refined styling matching reference design
// =============================================================================

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  isExpanded: boolean;
  hasSubItems?: boolean;
  isActive?: boolean;
  onMobileClose?: () => void;
  size?: 'normal' | 'small';
}

const NavItem: React.FC<NavItemProps> = ({
  path,
  label,
  icon: Icon,
  description,
  isExpanded,
  hasSubItems,
  isActive: isActiveProp,
  onMobileClose,
  size = 'normal',
}) => {
  const iconSize = size === 'small' ? 20 : 22;

  return (
    <NavLink
      to={path}
      onClick={onMobileClose}
      className="group block"
      title={!isExpanded ? label : undefined}
    >
      {({ isActive: isRouteActive }) => {
        const isActive = isActiveProp !== undefined ? isActiveProp : isRouteActive;

        return (
          <div
            className={`
              relative mx-3 rounded-xl
              transition-all duration-200
              ${isActive
                ? 'bg-[#1f1e1c]'
                : 'hover:bg-white/[0.04]'
              }
            `}
            style={{
              border: isActive ? '1px solid rgba(180, 140, 80, 0.5)' : '1px solid transparent',
              boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.03)' : 'none',
            }}
          >
            <div className={`flex items-center ${hasSubItems && isActive ? 'py-3' : 'h-12'}`}>
              {/* Icon - fixed position, never moves */}
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Icon
                  size={iconSize}
                  strokeWidth={1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                  }`}
                />
              </div>

              {/* Expanded content - slides in with opacity */}
              <div
                className="flex-1 min-w-0 flex items-center pr-4 overflow-hidden"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[18px] font-semibold tracking-[-0.01em] whitespace-nowrap transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-stone-100 group-hover:text-white'
                    }`}
                  >
                    {label}
                  </div>
                  {/* Show description for non-active items that have no sub-items */}
                  {description && !isActive && isExpanded && (
                    <div
                      className="text-[13px] text-stone-400 truncate mt-0.5 transition-colors duration-200 group-hover:text-stone-300"
                    >
                      {description}
                    </div>
                  )}
                </div>
                {/* Dropdown chevron for active items with sub-items */}
                {hasSubItems && isActive && (
                  <ChevronRight
                    size={18}
                    className="text-stone-500 rotate-90 flex-shrink-0 ml-2"
                  />
                )}
              </div>
            </div>
          </div>
        );
      }}
    </NavLink>
  );
};

// =============================================================================
// MAIN SIDEBAR COMPONENT
// =============================================================================

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

  // Hover handlers with delayed collapse
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
    }, COLLAPSE_DELAY);
  }, [setIsCollapsed]);

  const isExpanded = mobileMenuOpen || !isCollapsed;

  // Data sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime] = useState(() => {
    const time = new Date();
    time.setHours(time.getHours() - 2);
    return time;
  });

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

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

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col
        `}
        style={{
          width: mobileMenuOpen ? EXPANDED_WIDTH : (isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH),
          background: 'linear-gradient(180deg, #1a1918 0%, #141312 100%)',
          transition: `width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
          boxShadow: isExpanded
            ? '4px 0 32px rgba(0, 0, 0, 0.3), 1px 0 0 rgba(255,255,255,0.03)'
            : '1px 0 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors z-10"
          onClick={closeMobile}
        >
          <X size={20} />
        </button>

        {/* ==================== HEADER ==================== */}
        <div className="pt-6 pb-4">
          {/* Logo row */}
          <div className="flex items-center h-12 mx-3">
            {/* Logo - fixed position */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1a1918"/>
                  <path d="M2 17L12 22L22 17" stroke="#1a1918" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#1a1918" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Brand name - fades in */}
            <div
              className="flex-1 overflow-hidden"
              style={{
                opacity: isExpanded ? 1 : 0,
                transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
              }}
            >
              <span
                className="text-2xl font-semibold tracking-tight text-stone-50 whitespace-nowrap"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Cortexa
              </span>
            </div>
          </div>

          {/* Data freshness indicator - refined status badge */}
          <div className="mt-4 mx-3 overflow-hidden">
            <div
              className="group flex items-center h-11 rounded-lg"
              style={{
                /* Fixed width prevents layout shift during transition */
                width: `${EXPANDED_CONTENT_WIDTH + ICON_RAIL_WIDTH - 24}px`,
                background: isExpanded
                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.06) 0%, rgba(52, 211, 153, 0.02) 100%)'
                  : 'transparent',
                border: isExpanded ? '1px solid rgba(52, 211, 153, 0.12)' : '1px solid transparent',
                transition: `background ${TRANSITION_DURATION} ${TRANSITION_EASING}, border ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
              }}
            >
              {/* Dot - fixed in icon rail, never moves */}
              <div className="w-12 h-11 flex items-center justify-center flex-shrink-0">
                <div className="relative">
                  {/* Soft glow */}
                  <div
                    className="absolute -inset-2 rounded-full opacity-60"
                    style={{
                      background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)',
                    }}
                  />
                  {/* Dot */}
                  <div
                    className="relative w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: '#34d399',
                      boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
                    }}
                  />
                </div>
              </div>

              {/* Content - fixed width, fades in/out, clipped by parent */}
              <div
                className="pr-3 whitespace-nowrap"
                style={{
                  width: `${EXPANDED_CONTENT_WIDTH - 24}px`,
                  opacity: isExpanded ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[13px] font-medium text-stone-300">
                      Data synced
                    </span>
                    <span className="text-[12px] text-stone-600 ml-2">
                      2h ago
                    </span>
                  </div>
                  {/* Subtle refresh hint on hover */}
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <RefreshCw
                      size={13}
                      className="text-stone-600 hover:text-emerald-400 cursor-pointer transition-colors"
                      onClick={handleRefresh}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== NAVIGATION ==================== */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {/* Section label */}
          <div
            className="h-10 flex items-center mx-6 mb-3"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
            }}
          >
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgb(180, 140, 80)' }}
            >
              Analytics
            </span>
          </div>

          {/* Main nav items */}
          <div className="space-y-2">
            {NAVIGATION.main.map((item) => {
              const isActive = currentPath === item.path;
              const activeSubItem = getActiveSubItem(item.path, item.subItems);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const Icon = item.icon;

              return (
                <div key={item.path} className="mx-3 overflow-hidden">
                  {/* Custom nav item with integrated sub-items */}
                  <NavLink
                    to={item.path}
                    onClick={closeMobile}
                    className="group block"
                    title={!isExpanded ? item.label : undefined}
                  >
                    <div
                      className={`
                        relative rounded-xl
                        ${isActive
                          ? 'bg-[#1f1e1c]'
                          : 'hover:bg-white/[0.04]'
                        }
                      `}
                      style={{
                        /* Fixed width prevents layout shift during transition */
                        width: `${EXPANDED_WIDTH - 24}px`,
                        border: isActive && isExpanded ? '1px solid rgba(180, 140, 80, 0.5)' : '1px solid transparent',
                        boxShadow: isActive && isExpanded ? 'inset 0 1px 0 rgba(255,255,255,0.03)' : 'none',
                      }}
                    >
                      {/* Main item row */}
                      <div className="flex items-center h-12">
                        {/* Icon - fixed position */}
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <Icon
                            size={22}
                            strokeWidth={1.8}
                            className={`transition-colors duration-200 ${
                              isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                            }`}
                          />
                        </div>

                        {/* Expanded content - fixed width */}
                        <div
                          className="pr-4 whitespace-nowrap"
                          style={{
                            width: `${EXPANDED_CONTENT_WIDTH - 16}px`,
                            opacity: isExpanded ? 1 : 0,
                            transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div
                                className={`text-[18px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                                  isActive ? 'text-white' : 'text-stone-100 group-hover:text-white'
                                }`}
                              >
                                {item.label}
                              </div>
                              {/* Description for non-active items */}
                              {item.description && !isActive && (
                                <div
                                  className="text-[13px] text-stone-400 mt-0.5 transition-colors duration-200 group-hover:text-stone-300"
                                >
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {/* Dropdown chevron */}
                            {hasSubItems && isActive && (
                              <ChevronRight
                                size={18}
                                className="text-stone-500 rotate-90 flex-shrink-0 ml-2"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sub-items inside the bordered container */}
                      {isActive && hasSubItems && isExpanded && (
                        <div
                          className="pb-3 pl-4 pr-3"
                          style={{
                            opacity: isExpanded ? 1 : 0,
                            transition: `opacity 200ms ease`,
                          }}
                        >
                          <div className="ml-8 border-l border-stone-700/50 pl-0">
                            {item.subItems!.map((subItem) => {
                              const isSubActive = activeSubItem === subItem.id;
                              return (
                                <button
                                  key={subItem.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSubItemClick(subItem.id);
                                  }}
                                  className={`
                                    w-full text-left pl-4 pr-3 py-2.5 text-[15px] font-medium
                                    relative whitespace-nowrap tracking-[-0.01em]
                                    transition-colors duration-150
                                    ${isSubActive
                                      ? 'text-stone-50'
                                      : 'text-stone-400 hover:text-stone-100'
                                    }
                                  `}
                                  style={{
                                    marginLeft: '-1px',
                                    borderLeft: isSubActive ? '2px solid rgb(180, 140, 80)' : '2px solid transparent',
                                  }}
                                >
                                  {subItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </NavLink>
                </div>
              );
            })}
          </div>

          {/* Operations section */}
          <div className="mt-6 pt-4 border-t border-stone-800/50">
            {/* Section label */}
            <div
              className="h-10 flex items-center mx-6 mb-3"
              style={{
                opacity: isExpanded ? 1 : 0,
                transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
              }}
            >
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'rgb(6, 182, 212)' }}
              >
                Operations
              </span>
            </div>

            {/* Secondary nav items */}
            <div className="space-y-1">
              {NAVIGATION.secondary.map((item) => (
                <NavItem
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                  description={item.description}
                  isExpanded={isExpanded}
                  onMobileClose={closeMobile}
                />
              ))}
            </div>
          </div>

          {/* Coming Soon section */}
          <div
            className="mt-6 pt-4 border-t border-stone-800/50"
            style={{
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? 'auto' : 'none',
              transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
            }}
          >
            <div className="h-8 flex items-center mx-3 mb-2">
              <div className="w-12 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500">
                  Coming Soon
                </span>
                <Lock size={12} className="text-stone-500" />
              </div>
            </div>

            <div className="space-y-1">
              {NAVIGATION.upcoming.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center h-10 mx-3 rounded-lg cursor-not-allowed hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} strokeWidth={1.5} className="text-stone-500" />
                    </div>
                    <span className="text-[14px] text-stone-400">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ==================== FOOTER ==================== */}
        <div className="pb-4 border-t border-stone-800/50">
          {/* Footer nav items */}
          <div className="pt-3 space-y-1">
            {NAVIGATION.footer.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isExpanded={isExpanded}
                onMobileClose={closeMobile}
                size="small"
              />
            ))}
          </div>

          {/* User profile */}
          <div className="mt-3 pt-3 border-t border-stone-800/50 mx-3">
            <NavLink
              to="/settings"
              onClick={closeMobile}
              title={!isExpanded ? 'Settings' : undefined}
              className="group block"
            >
              {({ isActive }) => (
                <div
                  className={`
                    flex items-center h-14 rounded-xl -mx-0
                    transition-colors duration-200
                    ${isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}
                  `}
                >
                  {/* Avatar - fixed position */}
                  <div className="w-12 h-14 flex items-center justify-center flex-shrink-0">
                    <div
                      className={`
                        w-9 h-9 rounded-lg overflow-hidden
                        ring-2 transition-all duration-200
                        ${isActive ? 'ring-amber-500/50' : 'ring-stone-700 group-hover:ring-stone-600'}
                      `}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* User info - fades in */}
                  <div
                    className="flex-1 min-w-0 flex items-center pr-3 overflow-hidden"
                    style={{
                      opacity: isExpanded ? 1 : 0,
                      transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-medium truncate transition-colors ${
                        isActive ? 'text-white' : 'text-stone-200 group-hover:text-white'
                      }`}>
                        Sarah Mitchell
                      </p>
                      <p className="text-[12px] text-stone-500 truncate">
                        Practice Admin
                      </p>
                    </div>
                    <Settings
                      size={16}
                      strokeWidth={1.5}
                      className={`flex-shrink-0 ml-2 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-stone-600 group-hover:text-stone-400'
                      }`}
                    />
                  </div>
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
