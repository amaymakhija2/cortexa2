
import React, { useState } from 'react';
import { MetricsRow } from './MetricsRow';
import { MetricChart } from './MetricChart';
import { PracticeMetrics } from '../types';

const INITIAL_METRICS: PracticeMetrics = {
  revenue: {
    label: "December Revenue",
    value: "$153.4k",
    subtext: "$160.0k goal, 96% complete",
    status: "Needs attention"
  },
  sessions: {
    label: "December Sessions",
    value: "698 sessions",
    subtext: "82% capacity · 18 open slots",
    status: "Healthy"
  },
  clientGrowth: {
    label: "Client growth",
    value: "+12 new clients",
    subtext: "(17 new - 5 churned)",
    status: "Healthy"
  },
  attendance: {
    label: "Client Attendance",
    value: "68% rebook rate",
    subtext: "8.9% cancel rate, 2% no show rate",
    status: "Needs attention"
  },
  compliance: {
    label: "Admin & compliance",
    value: "12 unsigned notes",
    subtext: "Goal: 0 · 3 clinicians affected",
    status: "Critical"
  }
};

const REVENUE_DATA = [
  { month: 'Sep', value: 142500 },
  { month: 'Oct', value: 155200 },
  { month: 'Nov', value: 148900 },
  { month: 'Dec', value: 153400 }
];

const SESSIONS_DATA = [
  { month: 'Sep', value: 645 },
  { month: 'Oct', value: 712 },
  { month: 'Nov', value: 683 },
  { month: 'Dec', value: 698 }
];

export const Dashboard: React.FC = () => {
  const [metrics] = useState<PracticeMetrics>(INITIAL_METRICS);

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}k`;

  return (
    <div className="flex-1 p-8 pt-2 overflow-y-auto h-[calc(100vh-80px)]">

      {/* Title Section */}
      <div className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium mb-1">December 2024</h2>
        <h1 className="text-4xl font-normal text-gray-900 tracking-tight">Monthly Practice Review</h1>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-6 h-[calc(100%-120px)]">
          <MetricsRow metrics={metrics} />

          {/* Charts Row - extends to bottom */}
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <MetricChart
              title="Gross Revenue"
              data={REVENUE_DATA}
              valueFormatter={formatCurrency}
            />
            <MetricChart
              title="Total Sessions"
              data={SESSIONS_DATA}
            />
          </div>
      </div>

    </div>
  );
};
