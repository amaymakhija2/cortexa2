import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// =============================================================================
// ATTENDANCE BREAKDOWN PAGE
// =============================================================================
// Full-page view showing attendance metrics × months matrix.
// Displays Booked, Completed, Client Cancelled, Clinician Cancelled,
// Late Cancelled, and No Show metrics across all months.
// =============================================================================

// Metric configuration
const METRICS = [
  { id: 'booked', label: 'Booked', color: '#78716c' },
  { id: 'completed', label: 'Completed', color: '#10b981' },
  { id: 'cancelled', label: 'Client Cancelled', color: '#ef4444' },
  { id: 'clinicianCancelled', label: 'Clinician Cancelled', color: '#3b82f6' },
  { id: 'lateCancelled', label: 'Late Cancelled', color: '#f59e0b' },
  { id: 'noShow', label: 'No Show', color: '#6b7280' },
];

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

// Generate session data for demonstration
function generateSessionData(totalMonths: number): Record<string, number[]> {
  const data: Record<string, number[]> = {
    booked: [],
    completed: [],
    cancelled: [],
    clinicianCancelled: [],
    lateCancelled: [],
    noShow: [],
  };

  const baseBooked = 750;

  for (let month = 0; month < totalMonths; month++) {
    const seasonalFactor = Math.sin(month * 0.5) * 50;
    const trendFactor = month * 3;
    const randomVariance = ((month * 7 + 13) % 40) - 20;
    const booked = Math.round(baseBooked + seasonalFactor + trendFactor + randomVariance);

    const showRateBase = 0.88 + (month % 5) * 0.01 - ((month * 3) % 7) * 0.005;
    const completed = Math.round(booked * showRateBase);

    const cancelRate = 0.05 + ((month * 2) % 3) * 0.01;
    const cancelled = Math.round(booked * cancelRate);

    const clinicianCancelRate = 0.01 + ((month * 5) % 3) * 0.005;
    const clinicianCancelled = Math.round(booked * clinicianCancelRate);

    const lateCancelRate = 0.02 + ((month * 3) % 3) * 0.007;
    const lateCancelled = Math.round(booked * lateCancelRate);

    const noShow = Math.max(0, booked - completed - cancelled - clinicianCancelled - lateCancelled);

    data.booked.push(booked);
    data.completed.push(completed);
    data.cancelled.push(cancelled);
    data.clinicianCancelled.push(clinicianCancelled);
    data.lateCancelled.push(lateCancelled);
    data.noShow.push(noShow);
  }

  return data;
}

// Get cell background color based on show rate
function getCellColor(metricId: string, value: number, booked: number): string {
  if (metricId === 'booked') return 'bg-stone-100';
  if (metricId === 'completed') {
    const rate = (value / booked) * 100;
    if (rate >= 90) return 'bg-emerald-200';
    if (rate >= 85) return 'bg-emerald-100';
    if (rate >= 80) return 'bg-amber-100';
    return 'bg-amber-200';
  }
  if (metricId === 'cancelled') return 'bg-rose-100';
  if (metricId === 'clinicianCancelled') return 'bg-blue-100';
  if (metricId === 'lateCancelled') return 'bg-amber-100';
  if (metricId === 'noShow') return 'bg-stone-200';
  return 'bg-stone-100';
}

// Get cell text color
function getCellTextColor(metricId: string, value: number, booked: number): string {
  if (metricId === 'booked') return 'text-stone-700';
  if (metricId === 'completed') {
    const rate = (value / booked) * 100;
    if (rate >= 85) return 'text-emerald-800';
    return 'text-amber-800';
  }
  if (metricId === 'cancelled') return 'text-rose-800';
  if (metricId === 'clinicianCancelled') return 'text-blue-800';
  if (metricId === 'lateCancelled') return 'text-amber-800';
  if (metricId === 'noShow') return 'text-stone-700';
  return 'text-stone-700';
}

interface TooltipInfo {
  metricId: string;
  monthIdx: number;
  value: number;
  booked: number;
  x: number;
  y: number;
}

export const AttendanceBreakdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [showPercentage, setShowPercentage] = useState(false);

  // Generate data
  const totalMonths = 12;
  const monthLabels = useMemo(() => generateMonthLabels(totalMonths), []);
  const sessionData = useMemo(() => generateSessionData(totalMonths), []);

  // Calculate totals for each metric
  const metricTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    METRICS.forEach(metric => {
      totals[metric.id] = sessionData[metric.id].reduce((sum, val) => sum + val, 0);
    });
    return totals;
  }, [sessionData]);

  // Calculate show rate for each month
  const monthlyShowRates = useMemo(() => {
    return monthLabels.map((_, monthIdx) => {
      const booked = sessionData.booked[monthIdx];
      const completed = sessionData.completed[monthIdx];
      return booked > 0 ? (completed / booked) * 100 : 0;
    });
  }, [sessionData, monthLabels]);

  // Overall show rate
  const overallShowRate = useMemo(() => {
    return metricTotals.booked > 0 ? (metricTotals.completed / metricTotals.booked) * 100 : 0;
  }, [metricTotals]);

  const handleCellMouseEnter = (
    e: React.MouseEvent,
    metricId: string,
    monthIdx: number,
    value: number,
    booked: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      metricId,
      monthIdx,
      value,
      booked,
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
                onClick={() => navigate('/practice-analysis?tab=sessions')}
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
                  Attendance Breakdown
                </h1>
                <p className="text-stone-500 text-sm sm:text-base">
                  Session outcomes by month
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
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
                <span>% of Booked</span>
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
                    Metric
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
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric, metricIdx) => {
                  const values = sessionData[metric.id];
                  const total = metricTotals[metric.id];

                  return (
                    <tr
                      key={metric.id}
                      className={metricIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}
                    >
                      <td
                        className={`sticky left-0 z-10 px-4 py-2.5 border-r border-stone-200 ${
                          metricIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: metric.color }}
                          />
                          <span className="text-sm font-medium text-stone-700">
                            {metric.label}
                          </span>
                        </div>
                      </td>

                      {values.map((value, monthIdx) => {
                        const booked = sessionData.booked[monthIdx];
                        const percentage = booked > 0 ? (value / booked) * 100 : 0;

                        return (
                          <td
                            key={monthIdx}
                            className="px-1 py-1.5 text-center"
                          >
                            {showPercentage ? (
                              <div
                                className="w-12 h-8 mx-auto rounded flex items-center justify-center text-xs font-semibold cursor-default bg-stone-100 text-stone-700"
                              >
                                {percentage.toFixed(0)}%
                              </div>
                            ) : (
                              <div
                                className={`
                                  w-12 h-8 mx-auto rounded flex items-center justify-center
                                  text-xs font-semibold cursor-default transition-transform hover:scale-110
                                  ${getCellColor(metric.id, value, booked)}
                                  ${getCellTextColor(metric.id, value, booked)}
                                `}
                                onMouseEnter={(e) => handleCellMouseEnter(e, metric.id, monthIdx, value, booked)}
                                onMouseLeave={handleCellMouseLeave}
                              >
                                {value.toLocaleString()}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-3 py-2.5 text-center border-l border-stone-200 bg-stone-100/50">
                        <span className="text-sm font-bold text-stone-800">
                          {showPercentage
                            ? `${((total / metricTotals.booked) * 100).toFixed(0)}%`
                            : total.toLocaleString()
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="bg-stone-100 border-t-2 border-stone-300">
                  <td className="sticky left-0 z-10 bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 border-r border-stone-200">
                    Show Rate
                  </td>
                  {monthlyShowRates.map((rate, monthIdx) => (
                    <td key={monthIdx} className="px-2 py-3 text-center">
                      <span className={`text-xs font-bold ${
                        rate >= 90 ? 'text-emerald-700' :
                        rate >= 85 ? 'text-emerald-600' :
                        rate >= 80 ? 'text-amber-600' :
                        'text-amber-700'
                      }`}>
                        {rate.toFixed(0)}%
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center border-l border-stone-200 bg-stone-200/50">
                    <span className={`text-sm font-bold ${
                      overallShowRate >= 85 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {overallShowRate.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Tooltip */}
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
            <span>{tooltip.value.toLocaleString()}</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-300">{tooltip.booked.toLocaleString()} booked</span>
            <span className="text-stone-400">·</span>
            <span className={
              (tooltip.value / tooltip.booked) * 100 >= 85 ? 'text-emerald-400' :
              (tooltip.value / tooltip.booked) * 100 >= 70 ? 'text-amber-400' : 'text-rose-400'
            }>
              {((tooltip.value / tooltip.booked) * 100).toFixed(0)}%
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

export default AttendanceBreakdownPage;
