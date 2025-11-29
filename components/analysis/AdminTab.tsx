import React from 'react';
import { PageHeader, PageContent } from '../design-system';
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
        tabs={tabs.map((t) => ({ id: t.id, label: t.shortLabel }))}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <PageContent>
        {/* Content will be added in future iterations */}
      </PageContent>
    </div>
  );
};

export default AdminTab;
