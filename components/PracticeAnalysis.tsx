import React, { useState } from 'react';
import { MetricChart } from './MetricChart';

type TabType = 'financial' | 'capacity' | 'client-growth' | 'retention' | 'admin';

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

export const PracticeAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('financial');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'financial', label: 'Financial Analysis' },
    { id: 'capacity', label: 'Capacity' },
    { id: 'client-growth', label: 'Client Growth' },
    { id: 'retention', label: 'Retention' },
    { id: 'admin', label: 'Admin' }
  ];

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(1)}k`;

  return (
    <div className="flex-1 p-8 pt-2 overflow-y-auto h-[calc(100vh-80px)]">

      {/* Title Section */}
      <div className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium mb-1">DETAILED INSIGHTS</h2>
        <h1 className="text-4xl font-normal text-gray-900 tracking-tight">Practice Detailed Analysis</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 rounded-full text-base font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-black text-white'
                : 'bg-black text-white opacity-50 hover:opacity-70'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'financial' && (
        <div className="flex flex-col gap-6 h-[calc(100%-240px)]">
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <MetricChart
              title="Gross Revenue"
              data={REVENUE_DATA}
              valueFormatter={formatCurrency}
              goal={150000}
            />
            <MetricChart
              title="Total Sessions"
              data={SESSIONS_DATA}
              goal={700}
            />
          </div>
        </div>
      )}

      {activeTab !== 'financial' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[500px]">

        {activeTab === 'capacity' && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Capacity</h3>
            <p className="text-gray-600">Capacity analysis content goes here...</p>
          </div>
        )}

        {activeTab === 'client-growth' && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Client Growth</h3>
            <p className="text-gray-600">Client growth analysis content goes here...</p>
          </div>
        )}

        {activeTab === 'retention' && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Retention</h3>
            <p className="text-gray-600">Retention analysis content goes here...</p>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Admin</h3>
            <p className="text-gray-600">Admin analysis content goes here...</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};