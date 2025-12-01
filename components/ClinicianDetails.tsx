import React from 'react';
import { ComingSoonCard } from './design-system';

export const ClinicianDetails: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">
        {/* Header Section */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
          }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Warm glow accent */}
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
          />

          <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-amber-500/80 text-sm font-semibold tracking-widest uppercase mb-2">
                  Individual Performance
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Clinician Details
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <ComingSoonCard
          accent="amber"
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
