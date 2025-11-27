import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart3, Users, SlidersHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: LayoutGrid, label: 'Overview', to: '/dashboard' },
    { icon: BarChart3, label: 'Analysis', to: '/practice-analysis' },
    { icon: Users, label: 'Clinicians', to: '/clinician-overview' },
    { icon: SlidersHorizontal, label: 'Settings', to: '/settings' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-stone-800"
      style={{
        background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] min-w-[44px] transition-all duration-200 ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-stone-500 active:text-stone-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-amber-400/10' : ''}`}>
                    <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
