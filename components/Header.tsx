import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const NavPill: React.FC<{ label: string; to: string }> = ({ label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
          : 'text-stone-400 hover:text-stone-200 hover:bg-white/10'
      }`
    }
  >
    {label}
  </NavLink>
);

export const Header: React.FC = () => {
  return (
    <header
      className="flex items-center justify-between px-8 py-5"
      style={{
        background: 'linear-gradient(90deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Left spacer */}
      <div className="w-12"></div>

      {/* Center Navigation */}
      <div className="flex items-center gap-2">
        <NavPill label="Practice Overview" to="/dashboard" />
        <NavPill label="Practice Detailed Analysis" to="/practice-analysis" />
        <NavPill label="Clinician Overview" to="/clinician-overview" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all">
          <Search size={20} strokeWidth={1.5} />
        </button>
        <button className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all relative">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
