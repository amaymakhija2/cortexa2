import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, Cell, ReferenceLine, Tooltip } from 'recharts';
import { ArrowRight, Info } from 'lucide-react';
import { useResponsiveChartSizes } from '../hooks/useResponsiveChartSizes';

type TimePeriod = 'last-4-months' | 'last-6-months' | 'last-12-months' | 'ytd';

interface MetricChartProps {
  title: string;
  data: Array<{ month: string; value: number }>;
  valueFormatter?: (value: number) => string;
  goal?: number;
  clinicianData?: Array<{
    month: string;
    Chen: number;
    Rodriguez: number;
    Patel: number;
    Kim: number;
    Johnson: number;
  }>;
  breakdownData?: Array<{
    month: string;
    grossRevenue?: number;
    clinicianCosts?: number;
    supervisorCosts?: number;
    creditCardFees?: number;
    netRevenue?: number;
    activeClients?: number;
    retained?: number;
    new?: number;
    churned?: number;
  }>;
  timePeriod: TimePeriod;
  showBreakdown?: boolean;
  onToggleBreakdown?: () => void;
}

const CLINICIAN_COLORS = {
  Chen: '#2d6e7e',
  Rodriguez: '#3d8a9e',
  Patel: '#4da6be',
  Kim: '#6bc2d8',
  Johnson: '#89d4e8'
};

const BREAKDOWN_COLORS = {
  netRevenue: '#10b981',      // Green - money you keep
  clinicianCosts: '#3b82f6',  // Blue - clinician costs
  supervisorCosts: '#f59e0b', // Amber - supervisor costs
  creditCardFees: '#ef4444'   // Red - credit card fees
};

const CLIENT_BREAKDOWN_COLORS = {
  retained: '#2d6e7e',  // Teal - retained clients (matching Chen)
  new: '#4da6be',       // Light teal - new clients (matching Patel)
};

export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  data,
  valueFormatter,
  goal,
  clinicianData,
  breakdownData,
  timePeriod,
  showBreakdown: externalShowBreakdown,
  onToggleBreakdown
}) => {
  const formatValue = valueFormatter || ((value: number) => value.toString());
  const [showByclinician, setShowByclinician] = useState(false);
  const [internalShowBreakdown, setInternalShowBreakdown] = useState(false);
  const chartSizes = useResponsiveChartSizes();

  // Use external breakdown state if provided, otherwise use internal
  const showBreakdown = externalShowBreakdown !== undefined ? externalShowBreakdown : internalShowBreakdown;
  const handleToggleBreakdown = onToggleBreakdown || (() => setInternalShowBreakdown(!internalShowBreakdown));

  // Detect if this is client growth data
  const isClientGrowth = breakdownData && breakdownData[0] && 'activeClients' in breakdownData[0];

  const renderCustomLabel = useMemo(() => (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#1f2937"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={chartSizes.label}
        fontWeight={700}
      >
        {formatValue(value)}
      </text>
    );
  }, [formatValue, chartSizes.label]);

  const renderGoalLabel = useMemo(() => (props: any) => {
    const { viewBox } = props;
    const formattedGoal = goal ? formatValue(goal) : '';

    // Position at extreme left
    const x = viewBox.x + 5;
    const y = viewBox.y;

    return (
      <g>
        {/* "Target" label */}
        <text
          x={x}
          y={y - 8}
          fill="#94a3b8"
          textAnchor="start"
          fontSize={chartSizes.title}
          fontWeight={600}
          letterSpacing={1}
        >
          TARGET
        </text>
        {/* Value */}
        <text
          x={x + 55}
          y={y - 8}
          fill="#475569"
          textAnchor="start"
          fontSize={chartSizes.label}
          fontWeight={700}
        >
          {formattedGoal}
        </text>
      </g>
    );
  }, [goal, formatValue, chartSizes]);

  // Determine which data to show
  const chartData = showBreakdown && breakdownData
    ? breakdownData
    : (showByclinician && clinicianData ? clinicianData : data);

  const chartElement = useMemo(() => (
    <div className="flex-1 w-full min-h-0 relative z-0 overflow-hidden rounded-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4b5563', fontSize: chartSizes.tick, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          {goal && !showBreakdown && (
            <ReferenceLine
              y={goal}
              stroke="#cbd5e1"
              strokeDasharray="6 6"
              strokeWidth={2}
              label={renderGoalLabel}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ color: '#9ca3af', fontSize: chartSizes.tooltipLabel, fontWeight: 600, marginBottom: '6px' }}
            itemStyle={{ color: '#fff', fontSize: chartSizes.tooltipItem, fontWeight: 700 }}
            formatter={(value: number, name: string, props: any) => {
              if (showBreakdown && breakdownData) {
                const labels: { [key: string]: string } = {
                  creditCardFees: 'Credit Card Fees',
                  supervisorCosts: 'Supervisor Costs',
                  clinicianCosts: 'Clinician Costs',
                  netRevenue: 'Net Revenue'
                };
                const dataPoint = props.payload;
                const percentage = ((value / dataPoint.grossRevenue) * 100).toFixed(1);
                return [`${formatValue(value)} (${percentage}%)`, labels[name] || name];
              }
              return formatValue(value);
            }}
          />
          {showBreakdown && breakdownData && isClientGrowth ? (
            <>
              <Bar dataKey="retained" stackId="a" fill={CLIENT_BREAKDOWN_COLORS.retained} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="new" stackId="a" fill={CLIENT_BREAKDOWN_COLORS.new} radius={[6, 6, 0, 0]} maxBarSize={100}>
                <LabelList
                  content={(props: any) => {
                    const { x, y, width, index } = props;
                    if (index === undefined || !breakdownData || !breakdownData[index]) return null;
                    const dataPoint = breakdownData[index];
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#1f2937"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={chartSizes.label}
                        fontWeight={700}
                      >
                        {dataPoint.activeClients}
                      </text>
                    );
                  }}
                />
              </Bar>
            </>
          ) : showBreakdown && breakdownData ? (
            <>
              <Bar dataKey="creditCardFees" stackId="a" fill={BREAKDOWN_COLORS.creditCardFees} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="supervisorCosts" stackId="a" fill={BREAKDOWN_COLORS.supervisorCosts} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="clinicianCosts" stackId="a" fill={BREAKDOWN_COLORS.clinicianCosts} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="netRevenue" stackId="a" fill={BREAKDOWN_COLORS.netRevenue} radius={[6, 6, 0, 0]} maxBarSize={100}>
                <LabelList
                  content={(props: any) => {
                    const { x, y, width, index } = props;
                    if (index === undefined || !breakdownData || !breakdownData[index]) return null;
                    const dataPoint = breakdownData[index];
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#1f2937"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={chartSizes.label}
                        fontWeight={700}
                      >
                        {formatValue(dataPoint.grossRevenue || 0)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </>
          ) : showByclinician && clinicianData ? (
            <>
              <Bar dataKey="Chen" stackId="a" fill={CLINICIAN_COLORS.Chen} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="Rodriguez" stackId="a" fill={CLINICIAN_COLORS.Rodriguez} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="Patel" stackId="a" fill={CLINICIAN_COLORS.Patel} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="Kim" stackId="a" fill={CLINICIAN_COLORS.Kim} radius={[0, 0, 0, 0]} maxBarSize={100} />
              <Bar dataKey="Johnson" stackId="a" fill={CLINICIAN_COLORS.Johnson} radius={[6, 6, 0, 0]} maxBarSize={100}>
                <LabelList
                  content={(props: any) => {
                    const { x, y, width, index } = props;
                    if (index === undefined || !clinicianData || !clinicianData[index]) return null;
                    const dataPoint = clinicianData[index];
                    const total = dataPoint.Chen + dataPoint.Rodriguez + dataPoint.Patel + dataPoint.Kim + dataPoint.Johnson;
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#1f2937"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={chartSizes.label}
                        fontWeight={700}
                      >
                        {formatValue(total)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </>
          ) : (
            <Bar
              dataKey="value"
              fill="#2d6e7e"
              radius={[6, 6, 0, 0]}
              maxBarSize={100}
            >
              <LabelList dataKey="value" content={renderCustomLabel} />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  ), [chartData, renderCustomLabel, renderGoalLabel, goal, showByclinician, clinicianData, showBreakdown, breakdownData, chartSizes]);

  return (
    <div className="relative w-full h-full rounded-xl lg:rounded-2xl xl:rounded-[32px] p-4 sm:p-6 xl:p-8 shadow-lg xl:shadow-2xl bg-white border lg:border-2 border-[#2d6e7e] flex flex-col" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div className="mb-3 sm:mb-4 xl:mb-6 relative">
        <div className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2 sm:mb-3">ANALYTICS</div>
        <h3 className="text-gray-900 text-xl sm:text-2xl xl:text-3xl font-semibold mb-3 sm:mb-4 xl:mb-6 flex items-center gap-2">
          {title}
          <div className="group/info relative z-[100000]">
            <Info size={20} className="text-[#2d6e7e] cursor-help" />
            <div className="absolute left-0 top-8 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-80 z-[100000]">
              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                <p className="font-medium mb-1">Revenue Analysis</p>
                <p className="text-gray-300">View your practice's gross revenue trends over time. Toggle between standard view, breakdown by clinician to see individual contributions, or revenue allocation to understand where your money goes (net revenue, clinician costs, supervisor costs, and credit card fees).</p>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </h3>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Breakdown by Clinician Button */}
            {clinicianData && (
              <button
                onClick={() => {
                  setShowByclinician(!showByclinician);
                  if (!showByclinician) setShowBreakdown(false);
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  showByclinician
                    ? 'bg-[#2d6e7e] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Breakdown by Clinician</span>
                <span className="sm:hidden">By Clinician</span>
              </button>
            )}

            {/* Revenue Allocation / Client Growth Breakdown Button */}
            {breakdownData && (
              <button
                onClick={() => {
                  handleToggleBreakdown();
                  if (!showBreakdown) setShowByclinician(false);
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  showBreakdown
                    ? 'bg-[#2d6e7e] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{isClientGrowth ? 'Show Breakdown (Retained + New)' : 'Where Does Revenue Go?'}</span>
                <span className="sm:hidden">{isClientGrowth ? 'Breakdown' : 'Revenue Split'}</span>
              </button>
            )}
          </div>

          {/* Explore Button */}
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#2d6e7e] hover:bg-[#245563] text-white text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-lg sm:ml-auto">
            <span>Explore</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Legend for Breakdown */}
        {showBreakdown && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 items-center">
            {isClientGrowth ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: CLIENT_BREAKDOWN_COLORS.retained }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Retained</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: CLIENT_BREAKDOWN_COLORS.new }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">New</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.netRevenue }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700"><span className="hidden sm:inline">Net Revenue</span><span className="sm:hidden">Net</span></span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.clinicianCosts }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700"><span className="hidden sm:inline">Clinician Costs</span><span className="sm:hidden">Clinician</span></span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.supervisorCosts }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700"><span className="hidden sm:inline">Supervisor Costs</span><span className="sm:hidden">Supervisor</span></span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.creditCardFees }}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700"><span className="hidden sm:inline">Credit Card Fees</span><span className="sm:hidden">CC Fees</span></span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chart Area */}
      {chartElement}
    </div>
  );
};
