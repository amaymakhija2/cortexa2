import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, Cell, ReferenceLine, Tooltip } from 'recharts';
import { ArrowRight } from 'lucide-react';

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
    grossRevenue: number;
    clinicianCosts: number;
    supervisorCosts: number;
    creditCardFees: number;
    netRevenue: number;
  }>;
  timePeriod: TimePeriod;
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

export const MetricChart: React.FC<MetricChartProps> = ({ title, data, valueFormatter, goal, clinicianData, breakdownData, timePeriod }) => {
  const formatValue = valueFormatter || ((value: number) => value.toString());
  const [showByclinician, setShowByclinician] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const renderCustomLabel = useMemo(() => (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#1f2937"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={15}
        fontWeight={700}
      >
        {formatValue(value)}
      </text>
    );
  }, [formatValue]);

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
          fontSize={10}
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
          fontSize={14}
          fontWeight={700}
        >
          {formattedGoal}
        </text>
      </g>
    );
  }, [goal, formatValue]);

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
            tick={{ fill: '#4b5563', fontSize: 18, fontWeight: 600 }}
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
              padding: '16px 20px',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ color: '#9ca3af', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}
            itemStyle={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}
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
          {showBreakdown && breakdownData ? (
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
                        fontSize={15}
                        fontWeight={700}
                      >
                        {formatValue(dataPoint.grossRevenue)}
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
                        fontSize={15}
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
  ), [chartData, renderCustomLabel, renderGoalLabel, goal, showByclinician, clinicianData, showBreakdown, breakdownData]);

  return (
    <div className="relative w-full h-full rounded-[32px] p-8 shadow-2xl bg-white border-2 border-[#2d6e7e] flex flex-col" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div className="mb-6 relative z-20">
        <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">ANALYTICS</div>
        <h3 className="text-gray-900 text-3xl font-semibold mb-6">{title}</h3>

        {/* Controls Row */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            {/* Breakdown by Clinician Button */}
            {clinicianData && (
              <button
                onClick={() => {
                  setShowByclinician(!showByclinician);
                  if (!showByclinician) setShowBreakdown(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showByclinician
                    ? 'bg-[#2d6e7e] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Breakdown by Clinician
              </button>
            )}

            {/* Revenue Allocation Breakdown Button */}
            {breakdownData && (
              <button
                onClick={() => {
                  setShowBreakdown(!showBreakdown);
                  if (!showBreakdown) setShowByclinician(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showBreakdown
                    ? 'bg-[#2d6e7e] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Where Does Revenue Go?
              </button>
            )}
          </div>

          {/* Explore Button */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2d6e7e] hover:bg-[#245563] text-white text-sm font-medium transition-all shadow-md hover:shadow-lg ml-auto">
            <span>Explore</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Legend for Revenue Breakdown */}
        {showBreakdown && (
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.netRevenue }}></div>
              <span className="text-sm font-medium text-gray-700">Net Revenue (You Keep)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.clinicianCosts }}></div>
              <span className="text-sm font-medium text-gray-700">Clinician Costs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.supervisorCosts }}></div>
              <span className="text-sm font-medium text-gray-700">Supervisor Costs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: BREAKDOWN_COLORS.creditCardFees }}></div>
              <span className="text-sm font-medium text-gray-700">Credit Card Fees</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      {chartElement}
    </div>
  );
};
