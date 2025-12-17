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
} from 'lucide-react';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';

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
const COLLAPSE_DELAY = 400;
const TRANSITION_DURATION = '400ms';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

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
  upcoming: [
    { label: 'Consultations', icon: MessageSquare },
    { label: 'Accounting', icon: Calculator },
    { label: 'Payroll', icon: Banknote },
  ],
};

// =============================================================================
// NAV ITEM COMPONENT - Unified styling for all nav items
// =============================================================================

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  isExpanded: boolean;
  hasSubItems?: boolean;
  isSubActive?: boolean;
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
  isSubActive,
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
      {({ isActive }) => (
        <div
          className={`
            flex items-center h-12 rounded-xl mx-3
            transition-colors duration-200
            ${isActive ? 'bg-amber-500/15' : 'hover:bg-white/[0.06]'}
          `}
        >
          {/* Icon - fixed position, never moves */}
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Icon
              size={iconSize}
              strokeWidth={1.8}
              className={`transition-colors duration-200 ${
                isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-200'
              }`}
            />
          </div>

          {/* Expanded content - slides in with opacity */}
          <div
            className="flex-1 min-w-0 flex items-center pr-3 overflow-hidden"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
            }}
          >
            <div className="flex-1 min-w-0">
              <div
                className={`text-[15px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-stone-200 group-hover:text-white'
                }`}
              >
                {label}
              </div>
              {description && !isActive && (
                <div className="text-[13px] text-stone-500 truncate">
                  {description}
                </div>
              )}
            </div>
            {hasSubItems && isActive && (
              <ChevronRight
                size={16}
                className="text-amber-500/60 rotate-90 flex-shrink-0 ml-2"
              />
            )}
          </div>
        </div>
      )}
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
    setSearchParams(newParams);
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

          {/* Data freshness indicator */}
          <div className="mt-4 mx-3">
            {/* Collapsed: just show dot centered */}
            {!isExpanded && (
              <div className="flex items-center justify-center h-10">
                <DataFreshnessIndicator
                  isCollapsed={true}
                  lastSyncTime={lastSyncTime}
                  isSyncing={isSyncing}
                  onRefresh={handleRefresh}
                  canRefresh={true}
                  minutesUntilNextRefresh={0}
                />
              </div>
            )}
            {/* Expanded: show full indicator */}
            {isExpanded && (
              <div
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                }}
              >
                <DataFreshnessIndicator
                  isCollapsed={false}
                  lastSyncTime={lastSyncTime}
                  isSyncing={isSyncing}
                  onRefresh={handleRefresh}
                  canRefresh={true}
                  minutesUntilNextRefresh={0}
                />
              </div>
            )}
          </div>
        </div>

        {/* ==================== NAVIGATION ==================== */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {/* Section label */}
          <div
            className="h-8 flex items-center mx-3 mb-2"
            style={{
              opacity: isExpanded ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
            }}
          >
            <div className="w-12 flex-shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-500/80">
              Analytics
            </span>
          </div>

          {/* Main nav items */}
          <div className="space-y-1">
            {NAVIGATION.main.map((item) => {
              const isActive = currentPath === item.path;
              const activeSubItem = getActiveSubItem(item.path, item.subItems);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.path}>
                  <NavItem
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                    description={item.description}
                    isExpanded={isExpanded}
                    hasSubItems={hasSubItems}
                    onMobileClose={closeMobile}
                  />

                  {/* Sub-items */}
                  {isActive && hasSubItems && isExpanded && (
                    <div
                      className="mt-1 mb-2 ml-[60px] mr-3 space-y-0.5"
                      style={{
                        opacity: isExpanded ? 1 : 0,
                        transition: `opacity 200ms ease`,
                      }}
                    >
                      {item.subItems!.map((subItem) => {
                        const isSubActive = activeSubItem === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem.id)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-[13px]
                              transition-all duration-150
                              ${isSubActive
                                ? 'text-amber-300 bg-amber-500/10'
                                : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
                              }
                            `}
                          >
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-600">
                  Coming Soon
                </span>
                <Lock size={12} className="text-stone-700" />
              </div>
            </div>

            <div className="space-y-1">
              {NAVIGATION.upcoming.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center h-10 mx-3 rounded-lg opacity-40 cursor-not-allowed"
                  >
                    <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} strokeWidth={1.5} className="text-stone-600" />
                    </div>
                    <span className="text-[14px] text-stone-600">{item.label}</span>
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
