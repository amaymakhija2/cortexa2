import React, { useState } from 'react';
import { LayoutGrid, Users, Calculator, Banknote, SlidersHorizontal } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: LayoutGrid, label: 'Insights', active: true },
    { icon: Users, label: 'Consultations', active: false },
    { icon: Calculator, label: 'Accounting', active: false },
    { icon: Banknote, label: 'Payroll', active: false },
  ];

  return (
    <div
      className={`${isExpanded ? 'w-56' : 'w-[72px]'} flex flex-col py-5 transition-all duration-300 ease-out relative`}
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

      {/* Logo Section */}
      <div className={`flex items-center gap-3 mb-8 px-4 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#292524"/>
            <path d="M2 17L12 22L22 17" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#292524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
          <h1 className="text-lg font-semibold text-stone-100 whitespace-nowrap tracking-tight">Cortexa</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              } ${isExpanded ? 'justify-start' : 'justify-center'}`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" strokeWidth={item.active ? 2 : 1.5} />
              <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 mb-3">
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-stone-400 hover:text-stone-200 hover:bg-white/5 w-full ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
          title={!isExpanded ? 'Settings' : undefined}
        >
          <SlidersHorizontal size={20} className="flex-shrink-0" strokeWidth={1.5} />
          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            Settings
          </span>
        </button>
      </div>

      {/* Account Section */}
      <div className="px-3 pt-3 border-t border-white/10">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-200/30">
            <img
              src="https://picsum.photos/100/100?random=1"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            <p className="text-sm font-medium text-stone-100 truncate">Dr. Sarah Chen</p>
            <p className="text-xs text-stone-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
