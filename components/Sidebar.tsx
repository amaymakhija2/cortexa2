import React from 'react';
import { LayoutGrid, Users, Calculator, Banknote, SlidersHorizontal } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-16 flex flex-col items-center py-6 gap-8 bg-transparent">
      {/* Logo Placeholder */}
      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-4">
         <div className="w-4 h-4 text-white font-bold text-xs flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
            </svg>
         </div>
      </div>

      <nav className="flex flex-col gap-6">
        {/* Insights */}
        <button className="p-2 bg-black text-white rounded-xl shadow-lg hover:scale-105 transition-transform" title="Insights">
          <LayoutGrid size={20} />
        </button>
        {/* Consultations */}
        <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-colors" title="Consultations">
          <Users size={20} />
        </button>
        {/* Accounting */}
        <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-colors" title="Accounting">
          <Calculator size={20} />
        </button>
        {/* Payroll */}
        <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-colors" title="Payroll">
          <Banknote size={20} />
        </button>
      </nav>

      <div className="mt-auto">
         <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-colors">
            <SlidersHorizontal size={20} />
         </button>
      </div>
    </div>
  );
};