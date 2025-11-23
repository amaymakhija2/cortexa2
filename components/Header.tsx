import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const NavPill: React.FC<{ label: string; to: string }> = ({ label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-8 py-4 rounded-full text-base font-medium transition-all ${
        isActive
          ? 'bg-[#dfc1a4] text-black shadow-inner'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`
    }
  >
    {label}
  </NavLink>
);

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 w-full relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      {/* Left spacer to align with content */}
      <div className="w-14"></div>

      {/* Center Navigation */}
      <div className="bg-gradient-to-b from-white via-white to-white/95 rounded-full p-2 flex items-center gap-3 shadow-2xl ring-1 ring-white/50"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <NavPill label="Practice Overview" to="/dashboard" />
        <NavPill label="Practice Detailed Analysis" to="/practice-analysis" />
        <NavPill label="Clinician Overview" to="/clinician-overview" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-white/60 to-white/40 hover:from-white hover:to-white/95 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all shadow-lg hover:shadow-xl ring-1 ring-white/50">
          <Search size={22} />
        </button>
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-white/60 to-white/40 hover:from-white hover:to-white/95 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all shadow-lg hover:shadow-xl ring-1 ring-white/50 relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-md"></span>
        </button>
      </div>
    </header>
  );
};