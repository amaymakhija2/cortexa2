import React from 'react';
import { PageHeader, PageContent, ComingSoonCard } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
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
  timeSelection,
  onTimeSelectionChange,
}) => {
  return (
    <div className="min-h-full">
      <PageHeader
        accent="amber"
        showGridPattern
        title="Admin"
        timeSelector={
          <TimeSelector
            value={timeSelection}
            onChange={onTimeSelectionChange}
            showAggregateOption={true}
            aggregateOnly={true}
            variant="header"
          />
        }
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
