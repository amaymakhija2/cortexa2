import React from 'react';
import { PageHeader, PageContent, ComingSoonCard } from '../design-system';
import { TimeSelector } from '../design-system/controls/TimeSelector';
import type { BaseAnalysisTabProps } from './types';

// =============================================================================
// INSURANCE TAB COMPONENT
// =============================================================================

export const InsuranceTab: React.FC<BaseAnalysisTabProps> = ({
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
        accent="violet"
        title="Insurance"
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
          accent="violet"
          title="Insurance Analytics"
          description="Comprehensive insurance billing and claims analytics are being crafted to give you complete visibility into your practice's payer relationships."
          features={[
            'Claims Tracking',
            'Payer Mix Analysis',
            'Denial Management',
            'Reimbursement Rates',
            'AR Aging Reports',
          ]}
        />
      </PageContent>
    </div>
  );
};

export default InsuranceTab;
