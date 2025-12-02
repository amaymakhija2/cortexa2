import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, Calculator, Banknote, SlidersHorizontal, X, BarChart3, UserCircle, Layers } from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

// Constants for consistent sizing
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 256;
const ICON_SIZE = 20;
const ICON_BUTTON_SIZE = 44;

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen = false, setMobileMenuOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // App sections (non-navigable for now)
  const appSections = [
    { icon: LayoutGrid, label: 'Insights', active: true, comingSoon: false },
    { icon: Users, label: 'Consultations', active: false, comingSoon: true },
    { icon: Calculator, label: 'Accounting', active: false, comingSoon: true },
    { icon: Banknote, label: 'Payroll', active: false, comingSoon: true },
  ];

  // Page navigation items (for mobile drawer)
  const pageNavItems = [
    { icon: LayoutGrid, label: 'Practice Overview', to: '/dashboard' },
    { icon: BarChart3, label: 'Practice Analysis', to: '/practice-analysis' },
    { icon: UserCircle, label: 'Clinician Overview', to: '/clinician-overview' },
    { icon: Layers, label: 'Components', to: '/components' },
  ];

  const showLabels = mobileMenuOpen || isExpanded;

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transform transition-all duration-300 ease-out
          flex flex-col py-5 pt-safe pb-safe overflow-hidden
        `}
        style={{
          width: mobileMenuOpen ? 288 : (isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH),
          background: 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #44403c 100%)',
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          }}
        />

        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors active:bg-white/20"
          onClick={() => setMobileMenuOpen?.(false)}
        >
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div
          className="flex items-center mb-6 lg:mb-8 transition-all duration-300"
          style={{
            paddingLeft: showLabels ? 16 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
            paddingRight: showLabels ? 16 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
          }}
        >
          <div
            className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE }}
          >
            <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#292524"/>
              <path d="M2 17L12 22L22 17" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div
            className="overflow-hidden transition-all duration-300 whitespace-nowrap"
            style={{
              width: showLabels ? 'auto' : 0,
              opacity: showLabels ? 1 : 0,
              marginLeft: showLabels ? 12 : 0,
            }}
          >
            <h1 className="text-xl font-semibold text-stone-100 tracking-tight">Cortexa</h1>
          </div>
        </div>

        {/* Mobile Page Navigation */}
        <div className="lg:hidden px-3 mb-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-3 mb-2">Pages</p>
          <nav className="flex flex-col gap-1">
            {pageNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen?.(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10'
                    }`
                  }
                >
                  <Icon size={ICON_SIZE} className="flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-base font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden border-t border-white/10 mx-3 mb-4" />

        {/* App Sections */}
        <div className="flex-1">
          <p className="lg:hidden text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 mb-2">Modules</p>
          <nav className="flex flex-col gap-1">
            {appSections.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="transition-all duration-300"
                  style={{
                    paddingLeft: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
                    paddingRight: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
                  }}
                >
                  <button
                    className={`
                      flex items-center rounded-xl transition-all duration-200 w-full
                      ${item.active
                        ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10'
                      }
                    `}
                    style={{
                      height: ICON_BUTTON_SIZE,
                      paddingLeft: showLabels ? 12 : 0,
                      paddingRight: showLabels ? 12 : 0,
                      justifyContent: showLabels ? 'flex-start' : 'center',
                      gap: showLabels ? 12 : 0,
                    }}
                    title={!showLabels ? item.label : undefined}
                  >
                    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: ICON_SIZE, height: ICON_SIZE }}>
                      <Icon size={ICON_SIZE} strokeWidth={item.active ? 2 : 1.5} />
                      {item.comingSoon && !showLabels && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500/70 rounded-full hidden lg:block" />
                      )}
                    </div>
                    <div
                      className="flex flex-col items-start overflow-hidden transition-all duration-300"
                      style={{
                        width: showLabels ? 'auto' : 0,
                        opacity: showLabels ? 1 : 0,
                      }}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                      {item.comingSoon && (
                        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-amber-600/80 -mt-0.5">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Components (Design System) */}
        <div
          className="mb-1 transition-all duration-300"
          style={{
            paddingLeft: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
            paddingRight: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
          }}
        >
          <NavLink
            to="/components"
            onClick={() => setMobileMenuOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center rounded-xl transition-all duration-200 w-full ${
                isActive
                  ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10'
              }`
            }
            style={{
              height: ICON_BUTTON_SIZE,
              paddingLeft: showLabels ? 12 : 0,
              paddingRight: showLabels ? 12 : 0,
              justifyContent: showLabels ? 'flex-start' : 'center',
              gap: showLabels ? 12 : 0,
            }}
            title={!showLabels ? 'Components' : undefined}
          >
            <Layers size={ICON_SIZE} className="flex-shrink-0" strokeWidth={1.5} />
            <span
              className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
              style={{
                width: showLabels ? 'auto' : 0,
                opacity: showLabels ? 1 : 0,
              }}
            >
              Components
            </span>
          </NavLink>
        </div>

        {/* Settings */}
        <div
          className="mb-2 transition-all duration-300"
          style={{
            paddingLeft: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
            paddingRight: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
          }}
        >
          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center rounded-xl transition-all duration-200 w-full ${
                isActive
                  ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10'
              }`
            }
            style={{
              height: ICON_BUTTON_SIZE,
              paddingLeft: showLabels ? 12 : 0,
              paddingRight: showLabels ? 12 : 0,
              justifyContent: showLabels ? 'flex-start' : 'center',
              gap: showLabels ? 12 : 0,
            }}
            title={!showLabels ? 'Settings' : undefined}
          >
            <SlidersHorizontal size={ICON_SIZE} className="flex-shrink-0" strokeWidth={1.5} />
            <span
              className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
              style={{
                width: showLabels ? 'auto' : 0,
                opacity: showLabels ? 1 : 0,
              }}
            >
              Settings
            </span>
          </NavLink>
        </div>

        {/* Account Section */}
        <div
          className="pt-3 border-t border-white/10 transition-all duration-300"
          style={{
            paddingLeft: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
            paddingRight: showLabels ? 12 : (COLLAPSED_WIDTH - ICON_BUTTON_SIZE) / 2,
          }}
        >
          <div
            className="flex items-center rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer"
            style={{
              height: ICON_BUTTON_SIZE,
              paddingLeft: showLabels ? 8 : 0,
              paddingRight: showLabels ? 8 : 0,
              justifyContent: showLabels ? 'flex-start' : 'center',
              gap: showLabels ? 10 : 0,
            }}
          >
            <div
              className="rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-200/30"
              style={{ width: 32, height: 32 }}
            >
              <img
                src="https://picsum.photos/100/100?random=1"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="flex-1 min-w-0 overflow-hidden transition-all duration-300"
              style={{
                width: showLabels ? 'auto' : 0,
                opacity: showLabels ? 1 : 0,
              }}
            >
              <p className="text-sm font-medium text-stone-100 truncate">Dr. Sarah Chen</p>
              <p className="text-xs text-stone-500 truncate -mt-0.5">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
