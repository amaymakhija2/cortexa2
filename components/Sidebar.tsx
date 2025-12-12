import React from 'react';
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
  PanelLeftClose,
  PanelLeft,
  Settings,
} from 'lucide-react';

// =============================================================================
// REFINED SIDEBAR NAVIGATION
// Collapsible sidebar with manual toggle control
// =============================================================================

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

// Dimensions
const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 320;

// Navigation structure
const NAVIGATION = {
  main: [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: LayoutGrid,
      description: 'Key metrics & insights'
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
        { id: 'capacity-client', label: 'Capacity' },
        { id: 'retention', label: 'Retention' },
        { id: 'insurance', label: 'Insurance' },
        { id: 'admin', label: 'Admin' },
      ]
    },
  ],
  upcoming: [
    { label: 'Consultations', icon: MessageSquare },
    { label: 'Accounting', icon: Calculator },
    { label: 'Payroll', icon: Banknote },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({
  mobileMenuOpen = false,
  setMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed
}) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = location.pathname;

  const isExpanded = mobileMenuOpen || !isCollapsed;

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

  // Centered icon box size for collapsed state (icon 24px + padding)
  const ICON_BOX_SIZE = 52;

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col overflow-hidden
        `}
        style={{
          width: mobileMenuOpen ? EXPANDED_WIDTH : (isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH),
          background: '#181716',
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Subtle right edge */}
        <div
          className="absolute top-0 right-0 w-px h-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors z-10"
          onClick={() => setMobileMenuOpen?.(false)}
        >
          <X size={20} />
        </button>

        {/* Content wrapper */}
        <div className="flex flex-col h-full py-6">

          {/* ==================== HEADER: Logo + Toggle ==================== */}
          <div
            className="mb-8 flex flex-col items-center"
            style={{
              paddingLeft: isExpanded ? 20 : 0,
              paddingRight: isExpanded ? 16 : 0,
            }}
          >
            {/* Row: Logo + Brand + Toggle (when expanded) */}
            <div
              className="flex items-center w-full"
              style={{
                justifyContent: isExpanded ? 'space-between' : 'center',
              }}
            >
              {/* Logo + Brand */}
              <div
                className="flex items-center"
                style={{ justifyContent: 'center' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1a1918"/>
                    <path d="M2 17L12 22L22 17" stroke="#1a1918" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#1a1918" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {isExpanded && (
                  <span
                    className="text-[26px] font-semibold tracking-tight whitespace-nowrap ml-4"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      color: '#fafaf9',
                    }}
                  >
                    Cortexa
                  </span>
                )}
              </div>

              {/* Toggle button - inline when expanded */}
              {isExpanded && (
                <button
                  onClick={() => setIsCollapsed?.(!isCollapsed)}
                  className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors flex-shrink-0"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={20} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Toggle button - below logo when collapsed, perfectly centered */}
            {!isExpanded && (
              <button
                onClick={() => setIsCollapsed?.(!isCollapsed)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors mt-3"
                title="Expand sidebar"
              >
                <PanelLeft size={20} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* ==================== MAIN NAVIGATION ==================== */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Section label - only when expanded */}
            {isExpanded && (
              <div className="mb-5 px-5">
                <span className="text-[13px] font-semibold uppercase tracking-widest text-amber-500">
                  Analytics
                </span>
              </div>
            )}

            {/* Main nav items */}
            <div
              className="space-y-1.5"
              style={{
                paddingLeft: isExpanded ? 16 : 0,
                paddingRight: isExpanded ? 16 : 0,
              }}
            >
              {NAVIGATION.main.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                const activeSubItem = getActiveSubItem(item.path, item.subItems);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.path} className="mb-1.5">
                    <NavLink
                      to={item.path}
                      onClick={() => !hasSubItems && setMobileMenuOpen?.(false)}
                      className="group block"
                      title={!isExpanded ? item.label : undefined}
                    >
                      <div
                        className={`
                          flex items-center rounded-xl
                          transition-all duration-200
                          ${isActive ? 'bg-amber-500/15' : 'hover:bg-white/[0.05]'}
                        `}
                        style={isExpanded ? {
                          padding: '16px',
                          justifyContent: 'flex-start',
                          gap: '16px',
                        } : {
                          // Collapsed: center the icon box within 80px
                          width: ICON_BOX_SIZE,
                          height: ICON_BOX_SIZE,
                          marginLeft: (COLLAPSED_WIDTH - ICON_BOX_SIZE) / 2,
                          marginRight: (COLLAPSED_WIDTH - ICON_BOX_SIZE) / 2,
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          size={24}
                          strokeWidth={1.8}
                          className={`flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-300'}`}
                        />
                        {isExpanded && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[18px] font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-stone-200 group-hover:text-white'}`}>
                                {item.label}
                              </div>
                              {!isActive && (
                                <div className="text-[14px] text-stone-500 truncate mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {hasSubItems && isActive && (
                              <ChevronRight size={18} className="text-amber-500/60 rotate-90 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    </NavLink>

                    {/* Sub-items - only when expanded and active */}
                    {isActive && hasSubItems && isExpanded && (
                      <div className="mt-2 ml-5 pl-5 border-l-2 border-amber-500/30 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = activeSubItem === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubItemClick(subItem.id)}
                              className={`
                                w-full text-left px-4 py-3 rounded-lg
                                transition-all duration-150
                                ${isSubActive
                                  ? 'text-amber-300 bg-amber-500/15'
                                  : 'text-stone-400 hover:text-white hover:bg-white/[0.05]'
                                }
                              `}
                            >
                              <span className="text-[16px]">{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Divider & Coming Soon - only when expanded */}
            {isExpanded && (
              <>
                <div className="my-6 mx-5 h-px bg-stone-700/50" />

                <div className="mb-5 px-5 flex items-center gap-2">
                  <span className="text-[13px] font-semibold uppercase tracking-widest text-stone-500">
                    Coming Soon
                  </span>
                  <Lock size={14} className="text-stone-600" />
                </div>

                <div className="space-y-1 px-4">
                  {NAVIGATION.upcoming.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        <Icon size={22} strokeWidth={1.5} className="text-stone-600" />
                        <span className="text-[16px] text-stone-500">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </nav>

          {/* ==================== FOOTER ==================== */}
          <div
            className="mt-auto"
            style={{
              paddingLeft: isExpanded ? 16 : 0,
              paddingRight: isExpanded ? 16 : 0,
            }}
          >
            {/* Components - internal dev tool */}
            {isExpanded && (
              <NavLink
                to="/components"
                onClick={() => setMobileMenuOpen?.(false)}
                className={({ isActive }) => `
                  block text-center py-2 mb-4
                  text-[14px] transition-colors duration-200
                  ${isActive ? 'text-stone-400' : 'text-stone-600 hover:text-stone-400'}
                `}
              >
                Components
              </NavLink>
            )}

            {/* User Profile → Settings */}
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen?.(false)}
              title={!isExpanded ? 'Settings' : undefined}
              className={({ isActive }) => `
                group block pt-6 border-t border-stone-700/50
                transition-all duration-200
                ${isActive ? '' : ''}
              `}
            >
              {({ isActive }) => (
                <div
                  className={`
                    flex items-center rounded-xl
                    transition-all duration-200
                    ${isActive ? 'bg-white/10' : 'hover:bg-white/[0.05]'}
                  `}
                  style={isExpanded ? {
                    padding: '12px',
                    justifyContent: 'flex-start',
                    gap: '14px',
                  } : {
                    width: ICON_BOX_SIZE,
                    height: ICON_BOX_SIZE,
                    marginLeft: (COLLAPSED_WIDTH - ICON_BOX_SIZE) / 2,
                    marginRight: (COLLAPSED_WIDTH - ICON_BOX_SIZE) / 2,
                    justifyContent: 'center',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                      ring-2 transition-all duration-200
                      ${isActive ? 'ring-amber-500/50' : 'ring-stone-600 group-hover:ring-stone-500'}
                    `}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isExpanded && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-medium truncate whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-stone-200 group-hover:text-white'}`}>
                          Sarah Mitchell
                        </p>
                        <p className="text-[13px] text-stone-500 truncate whitespace-nowrap">
                          Practice Admin
                        </p>
                      </div>
                      <Settings
                        size={18}
                        strokeWidth={1.5}
                        className={`flex-shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-400'}`}
                      />
                    </>
                  )}
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
