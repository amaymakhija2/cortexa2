import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';
import { CLINICIANS } from '../data/clinicians';

// =============================================================================
// REVENUE BREAKDOWN PAGE
// =============================================================================
// Full-page view showing a clinician × month gross revenue matrix.
// Displays every clinician on the y-axis and months on the x-axis, with
// gross revenue in each cell. Hover to see the goal for that month.
// =============================================================================

// Generate month labels going back from current month
function generateMonthLabels(count: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push(label);
  }

  return months;
}

// Generate monthly revenue goals for a clinician (goals can change over time)
function generateMonthlyGoals(clinicianId: string, baseGoal: number, totalMonths: number): number[] {
  const seed = parseInt(clinicianId) * 500;
  const goals: number[] = [];

  for (let month = 0; month < totalMonths; month++) {
    // Goals typically increase over time, with occasional adjustments
    const growthFactor = Math.floor(month / 4) * 500; // +$500 every 4 months
    const adjustment = ((seed + month) % 3 - 1) * 200; // -$200, 0, or +$200 adjustment

    const goal = baseGoal + growthFactor + adjustment;
    goals.push(Math.max(5000, goal)); // Minimum goal of $5k
  }

  return goals;
}

// Generate revenue data for a clinician across months
function generateRevenueData(clinicianId: string, revenueGoal: number, totalMonths: number): number[] {
  const seed = parseInt(clinicianId) * 1000;
  const revenues: number[] = [];

  const baseRevenue = revenueGoal;

  for (let month = 0; month < totalMonths; month++) {
    const seasonalFactor = Math.sin((month + seed) * 0.5) * 1500;
    const trendFactor = (month - totalMonths / 2) * 100;
    const randomVariance = ((seed * (month + 1) * 7) % 2000) - 1000;

    const revenue = Math.round(baseRevenue + seasonalFactor + trendFactor + randomVariance);
    revenues.push(Math.max(3000, revenue));
  }

  return revenues;
}

// Get cell background color based on revenue relative to goal
function getCellColor(revenue: number, goal: number): string {
  const percentage = (revenue / goal) * 100;
  if (percentage >= 100) return 'bg-emerald-200';
  if (percentage >= 90) return 'bg-emerald-100';
  if (percentage >= 80) return 'bg-amber-100';
  if (percentage >= 70) return 'bg-amber-200';
  return 'bg-rose-100';
}

// Get cell text color based on revenue relative to goal
function getCellTextColor(revenue: number, goal: number): string {
  const percentage = (revenue / goal) * 100;
  if (percentage >= 90) return 'text-emerald-800';
  if (percentage >= 70) return 'text-amber-800';
  return 'text-rose-800';
}

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
}

function formatCurrencyShort(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

interface TooltipInfo {
  clinicianId: string;
  monthIdx: number;
  revenue: number;
  goal: number;
  x: number;
  y: number;
}

export const RevenueBreakdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [showPercentage, setShowPercentage] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [selectedClinicianIds, setSelectedClinicianIds] = useState<Set<string>>(
    () => new Set(CLINICIANS.filter(c => c.isActive).map(c => c.id))
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  // Generate data
  const totalMonths = 12;
  const monthLabels = useMemo(() => generateMonthLabels(totalMonths), []);

  const allClinicianData = useMemo(() => {
    return CLINICIANS.filter(c => c.isActive).map(clinician => {
      // Base revenue goal derived from session goal and avg rate
      const baseRevenueGoal = clinician.sessionGoal * 150; // ~$150 per session avg
      return {
        ...clinician,
        revenues: generateRevenueData(clinician.id, baseRevenueGoal, totalMonths),
        goals: generateMonthlyGoals(clinician.id, baseRevenueGoal, totalMonths),
      };
    });
  }, []);

  // Filter clinicians based on selection
  const clinicianData = useMemo(() => {
    return allClinicianData.filter(c => selectedClinicianIds.has(c.id));
  }, [allClinicianData, selectedClinicianIds]);

  // Filter dropdown options based on search
  const filteredDropdownOptions = useMemo(() => {
    if (!dropdownSearch.trim()) return allClinicianData;
    const query = dropdownSearch.toLowerCase();
    return allClinicianData.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query)
    );
  }, [allClinicianData, dropdownSearch]);

  const toggleClinician = (id: string) => {
    setSelectedClinicianIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedClinicianIds(new Set(allClinicianData.map(c => c.id)));
  };

  const selectNone = () => {
    setSelectedClinicianIds(new Set());
  };

  // Calculate totals
  const monthlyTotals = useMemo(() => {
    return monthLabels.map((_, monthIdx) =>
      clinicianData.reduce((sum, clinician) => sum + clinician.revenues[monthIdx], 0)
    );
  }, [clinicianData, monthLabels]);

  const grandTotal = useMemo(() =>
    monthlyTotals.reduce((sum, total) => sum + total, 0),
    [monthlyTotals]
  );

  const handleCellMouseEnter = (
    e: React.MouseEvent,
    clinicianId: string,
    monthIdx: number,
    revenue: number,
    goal: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      clinicianId,
      monthIdx,
      revenue,
      goal,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/practice-analysis?tab=financial')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-all duration-200 font-medium"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>

              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-stone-900"
                  style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                >
                  Revenue Breakdown
                </h1>
                <p className="text-stone-500 text-sm sm:text-base">
                  Gross revenue by month
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Multi-select Clinician Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${dropdownOpen
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }
                  `}
                >
                  <span>
                    {selectedClinicianIds.size === allClinicianData.length
                      ? 'All Clinicians'
                      : selectedClinicianIds.size === 0
                        ? 'No Clinicians'
                        : `${selectedClinicianIds.size} Clinician${selectedClinicianIds.size !== 1 ? 's' : ''}`
                    }
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 z-30 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-stone-100">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          placeholder="Search clinicians..."
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white text-sm text-stone-700 placeholder:text-stone-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        onClick={selectNone}
                        className="text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        Select None
                      </button>
                    </div>

                    {/* Clinician list */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredDropdownOptions.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-stone-400">
                          No clinicians match "{dropdownSearch}"
                        </div>
                      ) : (
                        filteredDropdownOptions.map(clinician => {
                          const isSelected = selectedClinicianIds.has(clinician.id);
                          return (
                            <label
                              key={clinician.id}
                              className={`
                                flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors
                                ${isSelected ? 'bg-stone-50' : 'hover:bg-stone-50'}
                              `}
                            >
                              {/* Custom Checkbox */}
                              <div className="relative flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleClinician(clinician.id)}
                                  className="sr-only peer"
                                />
                                <div
                                  className={`
                                    w-[18px] h-[18px] rounded-[5px] transition-all duration-200 ease-out
                                    ${isSelected
                                      ? 'bg-stone-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
                                      : 'bg-stone-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] hover:bg-stone-200'
                                    }
                                  `}
                                >
                                  <svg
                                    viewBox="0 0 12 12"
                                    className={`
                                      w-full h-full p-[3px] transition-all duration-200
                                      ${isSelected
                                        ? 'opacity-100 scale-100'
                                        : 'opacity-0 scale-75'
                                      }
                                    `}
                                    style={{
                                      transitionTimingFunction: isSelected
                                        ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        : 'ease-out'
                                    }}
                                  >
                                    <path
                                      d="M2 6.5L4.5 9L10 3"
                                      fill="none"
                                      stroke="white"
                                      strokeWidth="1.75"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: clinician.color }}
                              >
                                {clinician.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-stone-700 truncate">
                                  {clinician.name}
                                </p>
                                <p className="text-xs text-stone-400 truncate">
                                  {clinician.role}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setShowPercentage(!showPercentage)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${showPercentage
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }
                `}
              >
                <span>% of Total</span>
                <div
                  className={`
                    w-8 h-5 rounded-full transition-colors duration-200 relative
                    ${showPercentage ? 'bg-stone-600' : 'bg-stone-300'}
                  `}
                >
                  <div
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                      ${showPercentage ? 'translate-x-3.5' : 'translate-x-0.5'}
                    `}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend - only show for absolute view */}
      {!showPercentage && (
        <div className="px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-4 bg-white border-b border-stone-100">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-stone-500 font-medium">% of goal:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-emerald-200 flex items-center justify-center text-xs text-emerald-800 font-medium">100+</div>
                <span className="text-stone-500">At goal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-emerald-100" />
                <span className="text-stone-400">90+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-amber-100" />
                <span className="text-stone-400">80+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-amber-200" />
                <span className="text-stone-400">70+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-rose-100 flex items-center justify-center text-xs text-rose-800 font-medium">&lt;70</div>
                <span className="text-stone-500">Below</span>
              </div>
            </div>
            <span className="text-stone-400 text-xs ml-2">Hover for goal</span>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  <th
                    className="sticky left-0 z-10 bg-stone-50 px-4 py-3 text-left text-sm font-semibold text-stone-700 border-b border-r border-stone-200"
                    style={{ minWidth: '180px' }}
                  >
                    Clinician
                  </th>
                  {monthLabels.map((month, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-3 text-center text-xs font-semibold text-stone-500 border-b border-stone-200 whitespace-nowrap"
                      style={{ minWidth: '60px' }}
                    >
                      {month}
                    </th>
                  ))}
                  <th
                    className="px-3 py-3 text-center text-sm font-semibold text-stone-700 border-b border-l border-stone-200 bg-stone-100"
                    style={{ minWidth: '70px' }}
                  >
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinicianData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={monthLabels.length + 2}
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-stone-500">No clinicians selected</p>
                      <button
                        onClick={selectAll}
                        className="mt-2 text-sm font-medium text-stone-600 hover:text-stone-800 underline underline-offset-2"
                      >
                        Select all clinicians
                      </button>
                    </td>
                  </tr>
                ) : clinicianData.map((clinician, clinicianIdx) => {
                  const avgRevenue = Math.round(
                    clinician.revenues.reduce((sum, r) => sum + r, 0) / clinician.revenues.length
                  );
                  const avgGoal = Math.round(
                    clinician.goals.reduce((sum, g) => sum + g, 0) / clinician.goals.length
                  );

                  return (
                    <tr
                      key={clinician.id}
                      className={clinicianIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}
                    >
                      <td
                        className={`sticky left-0 z-10 px-4 py-2.5 border-r border-stone-200 ${
                          clinicianIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: clinician.color }}
                          >
                            {clinician.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">
                              {clinician.name}
                            </p>
                            <p className="text-xs text-stone-500 truncate">
                              {clinician.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {clinician.revenues.map((revenue, monthIdx) => {
                        const goal = clinician.goals[monthIdx];
                        const monthTotal = monthlyTotals[monthIdx];
                        const percentage = monthTotal > 0 ? (revenue / monthTotal) * 100 : 0;

                        return (
                          <td
                            key={monthIdx}
                            className="px-1 py-1.5 text-center"
                          >
                            {showPercentage ? (
                              <div
                                className="w-12 h-8 mx-auto rounded flex items-center justify-center text-xs font-semibold cursor-default bg-stone-100 text-stone-700"
                              >
                                {Math.round(percentage)}%
                              </div>
                            ) : (
                              <div
                                className={`
                                  w-12 h-8 mx-auto rounded flex items-center justify-center
                                  text-xs font-semibold cursor-default transition-transform hover:scale-110
                                  ${getCellColor(revenue, goal)}
                                  ${getCellTextColor(revenue, goal)}
                                `}
                                onMouseEnter={(e) => handleCellMouseEnter(e, clinician.id, monthIdx, revenue, goal)}
                                onMouseLeave={handleCellMouseLeave}
                              >
                                {formatCurrencyShort(revenue)}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-3 py-2.5 text-center border-l border-stone-200 bg-stone-100/50">
                        {showPercentage ? (
                          <span className="text-sm font-bold text-stone-800">
                            {Math.round((clinician.revenues.reduce((sum, r) => sum + r, 0) / grandTotal) * 100)}%
                          </span>
                        ) : (
                          <span className={`text-sm font-bold ${
                            avgRevenue >= avgGoal ? 'text-emerald-700' : 'text-stone-800'
                          }`}>
                            {formatCurrencyShort(avgRevenue)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              }
              </tbody>

              <tfoot>
                <tr className="bg-stone-100 border-t-2 border-stone-300">
                  <td className="sticky left-0 z-10 bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 border-r border-stone-200">
                    Total
                  </td>
                  {monthlyTotals.map((total, monthIdx) => (
                    <td key={monthIdx} className="px-2 py-3 text-center">
                      <span className="text-xs font-bold text-stone-700">
                        {showPercentage ? '100%' : formatCurrencyShort(total)}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center border-l border-stone-200 bg-stone-200/50">
                    <span className="text-sm font-bold text-stone-800">
                      {showPercentage ? '100%' : formatCurrencyShort(Math.round(grandTotal / totalMonths))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Tooltip - only show in absolute mode */}
      {tooltip && !showPercentage && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span>{formatCurrency(tooltip.revenue)}</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-300">{formatCurrency(tooltip.goal)} goal</span>
            <span className="text-stone-400">·</span>
            <span className={
              (tooltip.revenue / tooltip.goal) >= 1 ? 'text-emerald-400' :
              (tooltip.revenue / tooltip.goal) >= 0.9 ? 'text-emerald-300' :
              (tooltip.revenue / tooltip.goal) >= 0.7 ? 'text-amber-400' : 'text-rose-400'
            }>
              {Math.round((tooltip.revenue / tooltip.goal) * 100)}%
            </span>
          </div>
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #292524',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RevenueBreakdownPage;
