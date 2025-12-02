import React from 'react';
import { PageHeader, PageContent, ComingSoonCard } from '../design-system';
import type { BaseAnalysisTabProps } from './types';

// =============================================================================
// ADMIN TAB COMPONENT
// =============================================================================

export const AdminTab: React.FC<BaseAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
}) => {
  return (
    <div className="min-h-full">
      <PageHeader
        accent="blue"
        label="Detailed Analysis"
        title="Admin"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod as any}
        timePeriods={timePeriods as any}
        onTimePeriodChange={onTimePeriodChange as any}
      />

      <PageContent>
        <ComingSoonCard
          accent="blue"
          title="Administrative Analytics"
          description="Powerful administrative insights are being developed to streamline your practice operations and enhance team productivity."
          features={[
            'Note Compliance',
            'Reminder Delivery',
            'Client Balances',
            'Staff Productivity',
            'Audit Trails',
          ]}
        />
      </PageContent>
    </div>
  );
};

export default AdminTab;
