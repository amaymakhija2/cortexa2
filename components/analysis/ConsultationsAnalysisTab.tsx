import React, { useMemo } from 'react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  AnimatedGrid,
  AnimatedSection,
  ExecutiveSummary,
} from '../design-system';
import type { ConsultationsAnalysisTabProps } from './types';

// =============================================================================
// CONSULTATIONS ANALYSIS TAB
// =============================================================================
// Displays consultation metrics including volume, conversion rates,
// and pipeline health. Uses design system components throughout.
// =============================================================================

export const ConsultationsAnalysisTab: React.FC<ConsultationsAnalysisTabProps> = ({
  timePeriod,
  onTimePeriodChange,
  timePeriods,
  tabs,
  activeTab,
  onTabChange,
  getDateRangeLabel,
  consultationsData,
  consultationsByClinicianData,
  sourceData,
  pipelineData,
}) => {
  // =========================================================================
  // COMPUTED VALUES - HERO STATS
  // =========================================================================

  // Get user-friendly period label
  const periodLabel = useMemo(() => {
    const period = timePeriods.find(p => p.id === timePeriod);
    return period?.label.toLowerCase() || 'this period';
  }, [timePeriod, timePeriods]);

  // Total consultations in period
  const totalConsultations = useMemo(
    () => consultationsData.reduce((sum, item) => sum + item.consultations, 0),
    [consultationsData]
  );

  // Total new clients (converted)
  const totalNewClients = useMemo(
    () => consultationsData.reduce((sum, item) => sum + item.converted, 0),
    [consultationsData]
  );

  // Conversion rate
  const conversionRate = useMemo(
    () => totalConsultations > 0 ? (totalNewClients / totalConsultations) * 100 : 0,
    [totalNewClients, totalConsultations]
  );

  // Average days to first session
  const avgDaysToFirstSession = useMemo(() => {
    const totalDays = consultationsData.reduce((sum, item) => sum + item.totalDaysToFirstSession, 0);
    const totalConversions = consultationsData.reduce((sum, item) => sum + item.conversionsWithFirstSession, 0);
    return totalConversions > 0 ? totalDays / totalConversions : 0;
  }, [consultationsData]);

  // =========================================================================
  // EXECUTIVE SUMMARY GENERATION
  // =========================================================================

  const executiveSummary = useMemo(() => {
    const avgMonthlyConsultations = consultationsData.length > 0
      ? Math.round(totalConsultations / consultationsData.length)
      : 0;

    const conversionQuality = conversionRate >= 70 ? 'excellent' : conversionRate >= 50 ? 'solid' : 'room for improvement';
    const speedQuality = avgDaysToFirstSession <= 7 ? 'quickly' : avgDaysToFirstSession <= 14 ? 'at a reasonable pace' : 'slowly';

    return `You received **${totalConsultations} consultations** over ${periodLabel}, averaging **${avgMonthlyConsultations} per month**. Your conversion rate of **${conversionRate.toFixed(1)}%** is ${conversionQuality}, converting **${totalNewClients} new clients**. New clients are getting to their first session ${speedQuality}, averaging **${avgDaysToFirstSession.toFixed(1)} days** from consultation to first appointment.`;
  }, [totalConsultations, totalNewClients, conversionRate, avgDaysToFirstSession, periodLabel, consultationsData.length]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <PageHeader
        accent="cyan"
        label="Detailed Analysis"
        title="Consultations"
        subtitle={getDateRangeLabel()}
        showTimePeriod
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
        timePeriods={timePeriods}
      />

      <PageContent>
        {/* Executive Summary */}
        <Section spacing="md">
          <ExecutiveSummary
            headline="Your Consultation Pipeline"
            summary={executiveSummary}
            accent="cyan"
          />
        </Section>

        {/* Hero Stats Row */}
        <Section spacing="md">
          <AnimatedGrid cols={4} gap="md" staggerDelay={60}>
            <StatCard
              title="Consultations"
              value={totalConsultations.toLocaleString()}
              valueLabel="total"
              subtitle={periodLabel}
            />
            <StatCard
              title="New Clients"
              value={totalNewClients.toLocaleString()}
              valueLabel="converted"
              subtitle={periodLabel}
            />
            <StatCard
              title="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              valueLabel="average"
              subtitle={periodLabel}
            />
            <StatCard
              title="Days to First Session"
              value={avgDaysToFirstSession.toFixed(1)}
              valueLabel="average"
              subtitle={periodLabel}
            />
          </AnimatedGrid>
        </Section>

        {/* Placeholder for future chart sections */}
        {/*
        <AnimatedSection delay={280}>
          <Section spacing="md">
            <Grid cols={2} gap="lg">
              Future: Consultations over time chart
              Future: Conversion by source chart
            </Grid>
          </Section>
        </AnimatedSection>
        */}
      </PageContent>
    </div>
  );
};
