
import React from 'react';
import { PracticeMetrics, MetricDetail } from '../types';

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

const MetricCard: React.FC<{ data: MetricDetail }> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl flex flex-col h-52 shadow-lg border border-gray-200 relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
       <div className="flex justify-between items-start mb-4">
          <span className="text-gray-700 text-sm font-bold uppercase tracking-wider">{data.label}</span>
          <StatusBadge status={data.status} />
       </div>

       <div className="flex flex-col justify-end h-full pb-2">
          <div className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">{data.value}</div>
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
