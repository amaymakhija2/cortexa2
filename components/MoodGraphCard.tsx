import React from 'react';
import { Search, Info, Play } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { LiveNote } from '../types';

const data = [
  { time: 'Mon', booked: 30, completed: 20, cancelled: 5 },
  { time: 'Tue', booked: 40, completed: 35, cancelled: 2 },
  { time: 'Wed', booked: 45, completed: 40, cancelled: 4 },
  { time: 'Thu', booked: 50, completed: 48, cancelled: 2 },
  { time: 'Fri', booked: 48, completed: 45, cancelled: 3 },
  { time: 'Sat', booked: 20, completed: 18, cancelled: 1 },
  { time: 'Sun', booked: 10, completed: 8, cancelled: 0 },
];

interface MoodGraphCardProps {
  notes: LiveNote[];
  loadingNotes: boolean;
}

export const MoodGraphCard: React.FC<MoodGraphCardProps> = ({ notes, loadingNotes }) => {
  return (
    <div className="relative w-full h-[460px] rounded-[32px] p-6 overflow-hidden shadow-2xl bg-white border-2 border-[#2d6e7e]">
      {/* Background - removed gradient, using white background with teal border */}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Search Bar inside card */}
        <div className="w-full h-10 bg-[#f0f9ff] rounded-xl flex items-center px-4 mb-6 border border-[#2d6e7e]/20">
          <Search size={16} className="text-[#2d6e7e] mr-2" />
          <input
            type="text"
            placeholder="Search Trends"
            className="bg-transparent border-none outline-none text-gray-700 text-sm placeholder-gray-400 w-full"
          />
        </div>

        {/* Header & Legend */}
        <div className="flex items-center gap-6 mb-8">
          <h3 className="text-gray-800 text-xl font-medium flex items-center gap-2">
            Patient Volume
            <div className="group/info relative z-[100000]">
              <Info size={16} className="text-[#2d6e7e] cursor-help" />
              <div className="absolute left-0 top-6 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-72 z-[100000]">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                  <p className="font-medium mb-1">Patient Volume Overview</p>
                  <p className="text-gray-300">Track your weekly session activity. Shows booked appointments, completed sessions, and cancellations to help you understand patient attendance patterns and optimize scheduling.</p>
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </h3>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2d6e7e]/20 hatched-pattern border border-[#2d6e7e]"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2d6e7e]/30 hatched-pattern border border-[#2d6e7e]"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2d6e7e]/10 hatched-pattern border border-[#2d6e7e]"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-40 w-full mb-6 relative">
             <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <pattern id="hatched" patternUnits="userSpaceOnUse" width="4" height="4">
                  <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#2d6e7e" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6e7e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2d6e7e" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #2d6e7e', color: '#374151' }}
              />
              <Area
                type="monotone"
                dataKey="booked"
                stroke="#2d6e7e"
                fill="url(#hatched)"
                strokeWidth={2}
              />
               <Area
                type="monotone"
                dataKey="completed"
                stroke="#2d6e7e"
                fill="url(#gradientCompleted)"
                strokeWidth={1.5}
                strokeDasharray="5,5"
              />
            </AreaChart>
          </ResponsiveContainer>

           {/* Vertical line indicator */}
          <div className="absolute left-[60%] top-0 bottom-8 w-[1px] bg-[#2d6e7e]/40 flex flex-col justify-end items-center">
             <div className="w-2 h-2 rounded-full bg-[#2d6e7e] mb-[-4px]"></div>
          </div>
        </div>

        {/* Live Insights Section */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
             <h4 className="text-gray-800 text-lg font-medium">AI Insights</h4>
             <span className="text-gray-500 text-xs uppercase tracking-wide">Generated from Practice Data</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {loadingNotes ? (
                 <>
                   <div className="bg-[#f0f9ff] border border-[#2d6e7e]/20 rounded-2xl h-24 animate-pulse"></div>
                   <div className="bg-[#f0f9ff] border border-[#2d6e7e]/20 rounded-2xl h-24 animate-pulse"></div>
                 </>
            ) : (
                notes.map((note) => (
                    <div key={note.id} className="bg-[#f0f9ff] rounded-2xl p-4 flex gap-3 relative group hover:bg-[#e6f4ff] transition-colors cursor-pointer border border-[#2d6e7e]/20">
                      <div className="mt-1 flex-shrink-0">
                         <Info size={16} className="text-[#2d6e7e]" />
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed font-light">
                        {note.text}
                      </p>
                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play size={12} className="text-[#2d6e7e] fill-current" />
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};