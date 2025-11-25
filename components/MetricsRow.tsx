
import React from 'react';
import { PracticeMetrics, MetricDetail } from '../types';
import { Info, DollarSign, Users, Calendar, UserCheck, FileText } from 'lucide-react';

const StatusIndicator: React.FC<{ status: MetricDetail['status'] }> = ({ status }) => {
  const configs = {
    'Healthy': { color: 'bg-emerald-500', label: 'On Track' },
    'Needs attention': { color: 'bg-amber-500', label: 'Monitor' },
    'Critical': { color: 'bg-rose-500', label: 'Action Needed' },
  };

  const config = configs[status];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
      <span className="text-sm font-medium text-stone-600">
        {config.label}
      </span>
    </div>
  );
};

const getMetricIcon = (label: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Revenue': <DollarSign size={22} strokeWidth={1.5} />,
    'Sessions': <Calendar size={22} strokeWidth={1.5} />,
    'Active Clients': <Users size={22} strokeWidth={1.5} />,
    'Attendance': <UserCheck size={22} strokeWidth={1.5} />,
    'Compliance': <FileText size={22} strokeWidth={1.5} />,
  };
  return icons[label] || <Info size={22} strokeWidth={1.5} />;
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
    'Active Clients': {
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
  const icon = getMetricIcon(data.label);

  return (
    <div
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col h-52 transition-all duration-300 hover:bg-white hover:shadow-xl"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-stone-200/60 group-hover:border-stone-300 transition-colors duration-300" />

      {/* Status line */}
      <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-full ${
        data.status === 'Healthy' ? 'bg-emerald-400' :
        data.status === 'Needs attention' ? 'bg-amber-400' :
        'bg-rose-400'
      }`} />

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              data.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' :
              data.status === 'Needs attention' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'
            }`}>
              {icon}
            </div>
            <span className="text-sm font-semibold text-stone-700 uppercase tracking-wide">{data.label}</span>
          </div>

          {/* Tooltip */}
          <div className="group/tooltip relative z-[100000]">
            <Info size={16} className="text-stone-300 hover:text-stone-400 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 w-56 z-[100000]">
              <div className="bg-stone-900 text-white text-sm rounded-xl p-4 shadow-2xl">
                <p className="font-semibold mb-1">{tooltip.title}</p>
                <p className="text-stone-300 leading-relaxed text-xs">{tooltip.description}</p>
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-stone-900 transform rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-stone-900 tracking-tight">
              {data.value}
            </span>
            {data.valueLabel && (
              <span className="text-lg text-stone-500">
                {data.valueLabel}
              </span>
            )}
          </div>
          <div className="text-base text-stone-500 leading-relaxed">
            {data.subtext}
          </div>
        </div>

        {/* Footer */}
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
