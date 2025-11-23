import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, Cell } from 'recharts';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface MetricChartProps {
  title: string;
  data: Array<{ month: string; value: number }>;
  valueFormatter?: (value: number) => string;
}

const TIME_PERIODS = ['Last 4 months', 'Last 6 months', 'Last 12 months', 'Year to date'];

export const MetricChart: React.FC<MetricChartProps> = ({ title, data, valueFormatter }) => {
  const formatValue = valueFormatter || ((value: number) => value.toString());
  const [selectedPeriod, setSelectedPeriod] = useState('Last 4 months');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCustomLabel = useMemo(() => (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#1f2937"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight={600}
      >
        {formatValue(value)}
      </text>
    );
  }, [formatValue]);

  const chartElement = useMemo(() => (
    <div className="flex-1 w-full min-h-0 relative z-0 overflow-hidden rounded-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4b5563', fontSize: 15, fontWeight: 500 }}
            dy={10}
          />
          <YAxis hide />
          <Bar
            dataKey="value"
            fill="#2d6e7e"
            radius={[6, 6, 0, 0]}
            maxBarSize={100}
          >
            <LabelList dataKey="value" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  ), [data, renderCustomLabel]);

  return (
    <div className="relative w-full h-full rounded-[32px] p-8 shadow-2xl bg-white border-2 border-[#2d6e7e] flex flex-col" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div className="mb-6 relative z-20">
        <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">ANALYTICS</div>
        <h3 className="text-gray-900 text-3xl font-semibold mb-6">{title}</h3>

        {/* Controls Row */}
        <div className="flex items-center justify-between relative">
          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedPeriod === period
                        ? 'bg-[#2d6e7e]/10 text-[#2d6e7e] font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explore Button */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2d6e7e] hover:bg-[#245563] text-white text-sm font-medium transition-all shadow-md hover:shadow-lg">
            <span>Explore</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Chart Area */}
      {chartElement}
    </div>
  );
};
