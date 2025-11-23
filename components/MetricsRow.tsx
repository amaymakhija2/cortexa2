
import React from 'react';
import { PracticeMetrics, MetricDetail } from '../types';
import { Info } from 'lucide-react';

const StatusBadge: React.FC<{ status: MetricDetail['status'] }> = ({ status }) => {
  const styles = {
    'Healthy': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Needs attention': 'bg-amber-100 text-amber-800 border-amber-200',
    'Critical': 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

const getMetricTooltip = (label: string): { title: string; description: string } => {
  const tooltips: Record<string, { title: string; description: string }> = {
    'December Revenue': {
      title: 'Monthly Revenue Goal',
      description: 'Track your current month\'s gross revenue against your monthly target. See how close you are to hitting your revenue goals and what percentage of your target you\'ve achieved.'
    },
    'December Sessions': {
      title: 'Session Capacity',
      description: 'Monitor your practice capacity utilization. Shows total completed sessions for the month, your current capacity percentage, and remaining open appointment slots.'
    },
    'Client Overview': {
      title: 'Client Growth Metrics',
      description: 'Track your active client base size and monthly changes. See how many active clients you have, new client acquisitions, and client churn to understand your practice growth.'
    },
    'Client Attendance': {
      title: 'Attendance & Retention',
      description: 'Monitor client engagement and attendance patterns. Track rebook rates (clients scheduling follow-up appointments), cancellation rates, and no-show rates to identify retention opportunities.'
    },
    'Admin & compliance': {
      title: 'Administrative Compliance',
      description: 'Stay on top of required administrative tasks. Shows outstanding items like unsigned session notes, overdue documentation, and which clinicians need attention to maintain compliance.'
    }
  };

  return tooltips[label] || { title: label, description: 'Practice metric overview' };
};

const MetricCard: React.FC<{ data: MetricDetail }> = ({ data }) => {
  const tooltip = getMetricTooltip(data.label);

  return (
    <div className="bg-gradient-to-br from-white via-white to-slate-50/20 p-6 rounded-2xl flex flex-col h-52 shadow-lg border border-white relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ring-1 ring-slate-200/40"
      style={{
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
      }}
    >
       {/* Subtle gradient overlay */}
       <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

       <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm font-bold uppercase tracking-wider">{data.label}</span>
            <div className="group/tooltip relative z-[100000]">
              <Info size={14} className="text-[#2d6e7e] cursor-help" />
              <div className="absolute left-0 top-6 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 w-64 z-[100000]">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                  <p className="font-medium mb-1">{tooltip.title}</p>
                  <p className="text-gray-300">{tooltip.description}</p>
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
          <StatusBadge status={data.status} />
       </div>

       <div className="flex flex-col justify-end h-full pb-2 relative z-10">
          <div className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 tracking-tight">{data.value}</div>
          <div className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
            {data.subtext}
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
    <div className="grid grid-cols-5 gap-5 mb-6">
      {cards.map((metric, index) => (
        <MetricCard key={index} data={metric} />
      ))}
    </div>
  );
};
