import React from 'react';
import { ComingSoonCard, PageHeader } from './design-system';

export const ClinicianDetails: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">
        {/* Header Section */}
        <PageHeader
          accent="blue"
          title="Clinician Details"
          showGridPattern
        />

        {/* Coming Soon Content */}
        <ComingSoonCard
          accent="blue"
          title="Clinician Details"
          description="Deep-dive analytics for individual clinician performance. Select a clinician to explore their metrics, trends, and actionable insights."
          features={[
            'Performance Trends',
            'Client Outcomes',
            'Session Analytics',
            'Goal Tracking',
            'Peer Comparison',
          ]}
        />
      </div>
    </div>
  );
};
