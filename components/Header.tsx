import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

const NavPill: React.FC<{ label: string; to: string }> = ({ label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-4 lg:px-7 py-2.5 lg:py-3.5 rounded-xl text-base lg:text-lg font-semibold transition-all duration-200 whitespace-nowrap ${
        isActive
          ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 text-stone-900 shadow-md'
          : 'text-stone-400 hover:text-stone-200 hover:bg-white/10'
      }`
    }
  >
    {label}
  </NavLink>
);

interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuOpen }) => {
  const location = useLocation();

  // Get current page title for mobile display
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Practice Overview';
      case '/practice-analysis':
        return 'Practice Analysis';
      case '/clinician-overview':
        return 'Clinicians';
      case '/components':
        return 'Components';
      default:
        return 'Cortexa';
    }
  };

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-5 safe-area-top"
      style={{
        background: 'linear-gradient(90deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Left section - Mobile/Tablet: hamburger + title, Desktop: spacer */}
      <div className="flex items-center gap-3">
        {/* Mobile/Tablet Menu Button */}
        <button
          className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all"
          onClick={onMobileMenuOpen}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        {/* Mobile/Tablet Page Title */}
        <h1 className="lg:hidden text-white font-semibold text-lg truncate max-w-[180px] sm:max-w-none">
          {getPageTitle()}
        </h1>

        {/* Desktop spacer */}
        <div className="hidden lg:block w-12"></div>
      </div>

      {/* Center Navigation - hidden on mobile/tablet */}
      <div className="hidden lg:flex items-center gap-1 xl:gap-2">
        <NavPill label="Practice Overview" to="/dashboard" />
        <NavPill label="Practice Detailed Analysis" to="/practice-analysis" />
        <NavPill label="Clinician Overview" to="/clinician-overview" />
        <NavPill label="Components" to="/components" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all">
          <Search size={20} strokeWidth={1.5} />
        </button>
        <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all relative">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
