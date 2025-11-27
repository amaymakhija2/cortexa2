import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, Calculator, Banknote, SlidersHorizontal, X, BarChart3, UserCircle } from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen = false, setMobileMenuOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // App sections (non-navigable for now)
  const appSections = [
    { icon: LayoutGrid, label: 'Insights', active: true },
    { icon: Users, label: 'Consultations', active: false },
    { icon: Calculator, label: 'Accounting', active: false },
    { icon: Banknote, label: 'Payroll', active: false },
  ];

  // Page navigation items (for mobile drawer)
  const pageNavItems = [
    { icon: LayoutGrid, label: 'Practice Overview', to: '/dashboard' },
    { icon: BarChart3, label: 'Practice Analysis', to: '/practice-analysis' },
    { icon: UserCircle, label: 'Clinician Overview', to: '/clinician-overview' },
  ];

  // On mobile, always show expanded (labels visible)
  // On desktop, use hover expand behavior
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
          w-72 lg:w-[72px]
          flex flex-col py-5 pt-safe pb-safe
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          background: 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #44403c 100%)',
        }}
      >
        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          }}
        />

        {/* Mobile/Tablet close button - larger touch target */}
        <button
          className="lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors active:bg-white/20"
          onClick={() => setMobileMenuOpen?.(false)}
        >
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div className={`flex items-center gap-3 mb-6 lg:mb-8 px-4 justify-start ${isExpanded ? 'lg:justify-start' : 'lg:justify-center'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#292524"/>
              <path d="M2 17L12 22L22 17" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${showLabels ? 'w-auto opacity-100' : 'lg:w-0 lg:opacity-0'}`}>
            <h1 className="text-lg font-semibold text-stone-100 whitespace-nowrap tracking-tight">Cortexa</h1>
          </div>
        </div>

        {/* Mobile/Tablet Page Navigation - Only on drawer */}
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
                  <Icon size={20} className="flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Divider on mobile/tablet */}
        <div className="lg:hidden border-t border-white/10 mx-3 mb-4" />

        {/* App Sections */}
        <div className="px-3 flex-1">
          <p className="lg:hidden text-xs font-semibold text-stone-500 uppercase tracking-wider px-3 mb-2">Modules</p>
          <nav className="flex flex-col gap-1.5">
            {appSections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10'
                  } justify-start ${isExpanded ? 'lg:justify-start' : 'lg:justify-center'}`}
                  title={!showLabels ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" strokeWidth={item.active ? 2 : 1.5} />
                  <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${showLabels ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings */}
        <div className="px-3 mb-3">
          <button
            className={`flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 text-stone-400 hover:text-stone-200 hover:bg-white/5 active:bg-white/10 w-full justify-start ${isExpanded ? 'lg:justify-start' : 'lg:justify-center'}`}
            title={!showLabels ? 'Settings' : undefined}
          >
            <SlidersHorizontal size={20} className="flex-shrink-0" strokeWidth={1.5} />
            <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${showLabels ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
              Settings
            </span>
          </button>
        </div>

        {/* Account Section */}
        <div className="px-3 pt-3 border-t border-white/10">
          <div
            className={`flex items-center gap-3 p-2 min-h-[44px] rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer justify-start ${isExpanded ? 'lg:justify-start' : 'lg:justify-center'}`}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-200/30">
              <img
                src="https://picsum.photos/100/100?random=1"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${showLabels ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
              <p className="text-sm font-medium text-stone-100 truncate">Dr. Sarah Chen</p>
              <p className="text-xs text-stone-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
