import React from 'react';
import { ArrowUp, Maximize2, Plus } from 'lucide-react';

export const ContextPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Departments Card */}
      <div className="bg-[#f0dcc5] rounded-3xl p-3 flex items-center justify-between shadow-sm">
         <div className="flex -space-x-3 overflow-hidden pl-2">
            {[1,2,3].map((i) => (
                <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#f0dcc5] object-cover"
                    src={`https://picsum.photos/100/100?random=${i+20}`}
                    alt="Dept Head"
                />
            ))}
            <button className="h-10 w-10 rounded-full bg-[#e8cfb3] ring-2 ring-[#f0dcc5] flex items-center justify-center text-gray-500 hover:bg-[#dfc1a4]">
               <Plus size={16}/>
            </button>
         </div>
         <div className="pr-4 flex items-baseline gap-1">
             <span className="text-xl font-medium text-gray-800">4</span>
             <span className="text-gray-500 text-sm">Departments</span>
         </div>
      </div>

      {/* Context Card */}
      <div className="bg-[#dfc1a4] rounded-[32px] p-6 flex-1 shadow-sm border border-white/30 relative">
         <button className="absolute top-6 right-6 p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
            <Maximize2 size={16} className="text-gray-600"/>
         </button>

         <h3 className="text-xl font-medium text-gray-800 mb-6">Financial Health</h3>

         <div className="flex items-center gap-3 mb-8">
            <img src="https://picsum.photos/100/100?random=60" alt="Admin" className="w-12 h-12 rounded-xl object-cover" />
            <div>
               <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Administrator</p>
               <p className="text-gray-900 font-medium">Sarah Jenkins</p>
            </div>
         </div>

         <div className="space-y-6">
            <div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Revenue Goal</span>
                    <span className="text-gray-900 font-bold">82%</span>
                </div>
                {/* Custom Gradient Progress Bar */}
                <div className="h-1.5 w-full bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-gradient-to-r from-green-400 via-emerald-300 to-gray-300 rounded-full"></div>
                </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-300/50">
                 <span className="text-gray-600 font-medium">Operating Costs</span>
                 <span className="text-gray-900 font-medium">$42k (Monthly)</span>
            </div>

             <div className="flex justify-between items-center py-2">
                 <span className="text-gray-600 font-medium">Net Profit Trend</span>
                 <span className="text-green-600 font-medium flex items-center gap-1">
                    <ArrowUp size={16} /> 
                    12% vs Last Month
                 </span>
            </div>
         </div>

         {/* Tags */}
         <div className="mt-8 flex flex-wrap gap-2">
             <span className="px-4 py-2 rounded-full border border-gray-400/30 text-xs font-medium text-gray-700 bg-transparent">Growth</span>
             <span className="px-4 py-2 rounded-full border border-gray-400/30 text-xs font-medium text-gray-700 bg-transparent">Efficiency</span>
             <span className="px-4 py-2 rounded-full border border-gray-400/30 text-xs font-medium text-gray-700 bg-transparent">Staffing</span>
         </div>

      </div>
    </div>
  );
};