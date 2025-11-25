
import React from 'react';
import { PracticeMetrics, MetricDetail } from '../types';
import { Info } from 'lucide-react';

const StatusIndicator: React.FC<{ status: MetricDetail['status'] }> = ({ status }) => {
  const configs = {
    'Healthy': { color: 'bg-emerald-500', label: 'On Track' },
    'Needs attention': { color: 'bg-amber-500', label: 'Monitor' },
    'Critical': { color: 'bg-rose-500', label: 'Action Needed' },
  };

  const config = configs[status];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${config.color}`} />
      <span className="text-lg font-semibold text-stone-600">
        {config.label}
      </span>
    </div>
  );
};

const getMetricTooltip = (label: string): { title: string; description: string } => {
  const tooltips: Record<string, { title: string; description: string }> = {
    'Revenue': {
      title: 'Monthly Revenue',
      description: 'Track your current month\'s gross revenue against your monthly target.'
    },
    'Sessions': {
      title: 'Session Capacity',
      description: 'Total completed sessions for the month and remaining open slots.'
    },
    'Clients': {
      title: 'Client Growth',
      description: 'Active client count with new acquisitions and churn this month.'
    },
    'Attendance': {
      title: 'Attendance Rate',
      description: 'Client rebook rate, cancellations, and no-shows.'
    },
    'Compliance': {
      title: 'Compliance Status',
      description: 'Outstanding notes and documentation requiring attention.'
    }
  };

  return tooltips[label] || { title: label, description: 'Practice metric overview' };
};

const MetricCard: React.FC<{ data: MetricDetail; index: number }> = ({ data, index }) => {
  const tooltip = getMetricTooltip(data.label);

  const statusColors = {
    'Healthy': 'bg-emerald-500',
    'Needs attention': 'bg-amber-500',
    'Critical': 'bg-rose-500'
  };

  return (
    <div
      className="group relative bg-white rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Bold status bar at top */}
      <div className={`h-1.5 ${statusColors[data.status]}`} />

      {/* Content */}
      <div className="p-6 flex flex-col">

        {/* Label row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-stone-700 uppercase tracking-wide">
            {data.label}
          </span>
          <div className="group/tooltip relative">
            <Info size={20} className="text-stone-300 hover:text-stone-500 cursor-help transition-colors" />
            <div className="absolute right-0 top-8 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 w-56 z-[100000]">
              <div className="bg-stone-900 text-white rounded-xl p-4 shadow-2xl">
                <p className="font-bold text-base mb-1">{tooltip.title}</p>
                <p className="text-stone-300 leading-relaxed text-sm">{tooltip.description}</p>
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-stone-900 transform rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Big value - the hero */}
        <div className="mb-3">
          <span className="text-5xl font-black text-stone-900 tracking-tight">
            {data.value}
          </span>
          {data.valueLabel && (
            <span className="text-xl font-medium text-stone-400 ml-2">
              {data.valueLabel}
            </span>
          )}
        </div>

        {/* Subtext */}
        <p className="text-lg text-stone-500 leading-snug mb-5">
          {data.subtext}
        </p>

        {/* Status footer */}
        <div className="pt-4 border-t border-stone-100">
          <StatusIndicator status={data.status} />
        </div>
      </div>
    </div>
  );
};

export const MetricsRow: React.FC<{ metrics: PracticeMetrics }> = ({ metrics }) => {
  const cards = [
    metrics.revenue,
    metrics.sessions,
    metrics.clientGrowth,
    metrics.attendance,
    metrics.compliance
  ];

  return (
    <div className="grid grid-cols-5 gap-5">
      {cards.map((metric, index) => (
        <MetricCard key={index} data={metric} index={index} />
      ))}
    </div>
  );
};
