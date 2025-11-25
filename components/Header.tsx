import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const NavPill: React.FC<{ label: string; to: string }> = ({ label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-stone-900 text-stone-50 shadow-sm'
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
      }`
    }
  >
    {label}
  </NavLink>
);

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 w-full">
      {/* Left spacer */}
      <div className="w-12"></div>

      {/* Center Navigation */}
      <div
        className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 flex items-center gap-1 border border-stone-200/60"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)'
        }}
      >
        <NavPill label="Practice Overview" to="/dashboard" />
        <NavPill label="Practice Detailed Analysis" to="/practice-analysis" />
        <NavPill label="Clinician Overview" to="/clinician-overview" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white transition-all">
          <Search size={18} strokeWidth={1.5} />
        </button>
        <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white transition-all relative">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
