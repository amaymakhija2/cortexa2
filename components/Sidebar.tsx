import React, { useState } from 'react';
import { LayoutGrid, Users, Calculator, Banknote, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

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
      className={`${isExpanded ? 'w-64' : 'w-20'} flex flex-col py-6 bg-gradient-to-b from-white/60 via-white/40 to-white/50 backdrop-blur-md border-r border-white/70 shadow-xl transition-all duration-300 ease-in-out relative`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        boxShadow: '4px 0 24px -2px rgba(0, 0, 0, 0.06), inset -1px 0 0 0 rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Logo Section */}
      <div className={`flex items-center gap-3 mb-8 px-5 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0 ring-1 ring-white/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#logo-gradient)"/>
            <defs>
              <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {isExpanded && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent whitespace-nowrap">Cortexa</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white shadow-xl ring-1 ring-gray-900/20'
                  : 'text-gray-600 hover:bg-gradient-to-br hover:from-white/70 hover:to-white/50 hover:text-gray-900 hover:shadow-md'
              } ${isExpanded ? 'justify-start' : 'justify-center'}`}
              title={!isExpanded ? item.label : undefined}
              style={item.active ? {
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
              } : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 mb-4">
        <button
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-white/60 hover:text-gray-900 w-full ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
          title={!isExpanded ? 'Settings' : undefined}
        >
          <SlidersHorizontal size={20} className="flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">Settings</span>
          )}
        </button>
      </div>

      {/* Account Section */}
      <div className="px-3 pt-4 border-t border-white/60">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 cursor-pointer ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden shadow-md flex-shrink-0 border-2 border-white">
            <img
              src="https://picsum.photos/100/100?random=1"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {isExpanded && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Dr. Sarah Chen</p>
              <p className="text-xs text-gray-600 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse Indicator */}
      <div className={`absolute top-6 ${isExpanded ? 'right-3' : 'right-3'} opacity-0 group-hover:opacity-100 transition-opacity`}>
        {isExpanded ? (
          <ChevronLeft size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </div>
    </div>
  );
};