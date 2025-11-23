import React from 'react';
import { Search, Bell } from 'lucide-react';

const NavPill: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <button
    className={`px-8 py-4 rounded-full text-base font-medium transition-all ${
      active
        ? 'bg-[#dfc1a4] text-black shadow-inner'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 w-full">
        {/* Left spacer to align with content */}
      <div className="w-14"></div>

      {/* Center Navigation */}
      <div className="bg-white rounded-full p-2 flex items-center gap-3 shadow-2xl">
        <NavPill label="Practice Overview" active />
        <NavPill label="Practice Detailed Analysis" />
        <NavPill label="Clinician Overview" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="w-14 h-14 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-700 transition-colors shadow-sm">
          <Search size={22} />
        </button>
        <button className="w-14 h-14 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-700 transition-colors shadow-sm relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="w-14 h-14 rounded-full bg-white border-2 border-white overflow-hidden shadow-sm">
           <img src="https://picsum.photos/100/100?random=1" alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
};