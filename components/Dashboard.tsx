
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// =============================================================================
// DRAG TO SCROLL HOOK (Performance optimized with refs)
// =============================================================================

const useDragToScroll = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [, forceUpdate] = useState(0); // Trigger re-run when ref is set

  // Callback ref to detect when element mounts
  const setRef = React.useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    forceUpdate(n => n + 1); // Trigger effect re-run
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      setIsDragging(true);
      container.style.scrollSnapType = 'none';
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 1.2;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      container.style.scrollSnapType = '';
      container.style.cursor = '';
    };

    const handleMouseLeave = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      container.style.scrollSnapType = '';
      container.style.cursor = '';
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef.current]); // Re-run when container element changes

  return { ref: setRef, isDragging };
};
import { motion } from 'framer-motion';
import { MetricsRow } from './MetricsRow';
import { SimpleAlertCard } from './SimpleAlertCard';
import { PriorityTasksEmptyState } from './PriorityTasksEmptyState';
import { TimeSelector, TimeSelectorValue } from './design-system/controls/TimeSelector';
import { CompareTab } from './CompareTab';
import { PageHeader, SectionHeader } from './design-system';
import { ReferralBadge, ReferralModal } from './referral';
import { PracticeMetrics, ConsultationMetricDetail } from '../types';
import { MOCK_CONSULTATIONS } from '../data/consultations';
import { useMetrics, useDataDateRange, DashboardMetrics } from '../hooks';
import { allPriorityCards } from '../data/priorityCardsData';
import { useSettings, PracticeGoals as PracticeGoalsSettings } from '../context/SettingsContext';
import { CLINICIANS, CLINICIAN_SYNTHETIC_METRICS } from '../data/clinicians';

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Default goals (used as fallback, main goals come from SettingsContext)
const DEFAULT_GOALS = {
  notesOverdue: 0.10,   // <10% overdue notes target (not in practice goals config)
  monthlyConsultations: 20, // Monthly consultation booking goal
};

// Calculate consultation metrics for a given month
const getConsultationMetrics = (month: number, year: number, consultationGoal: number): ConsultationMetricDetail => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const isInMonth = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= startOfMonth && date <= endOfMonth;
  };

  // Consultations booked this month (by createdAt date)
  const booked = MOCK_CONSULTATIONS.filter(c => isInMonth(c.createdAt)).length;

  // Converted this month (by convertedDate)
  const converted = MOCK_CONSULTATIONS.filter(c =>
    c.stage === 'converted' && isInMonth(c.convertedDate)
  ).length;

  // Lost this month (by lostDate)
  const lost = MOCK_CONSULTATIONS.filter(c =>
    c.stage === 'lost' && isInMonth(c.lostDate)
  ).length;

  // In progress (currently active in the pipeline, not yet converted/lost)
  const inProgress = MOCK_CONSULTATIONS.filter(c =>
    ['consult_complete', 'intake_pending', 'intake_scheduled', 'paperwork_pending', 'paperwork_complete'].includes(c.stage)
  ).length;

  // Determine status based on booked vs goal
  const getStatus = (): 'Healthy' | 'Needs attention' | 'Critical' => {
    const percentOfGoal = booked / consultationGoal;
    if (percentOfGoal >= 0.8) return 'Healthy';
    if (percentOfGoal >= 0.5) return 'Needs attention';
    return 'Critical';
  };

  return {
    label: 'Consultations',
    value: `${booked}`,
    valueLabel: 'booked',
    subtext: `Goal: ${consultationGoal} · ${converted} converted`,
    status: getStatus(),
    booked,
    converted,
    inProgress,
    lost,
  };
};

// Get progress through the month (0-1) for pro-rating goals
const getMonthProgress = (month: number, year: number): number => {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  if (!isCurrentMonth) {
    return 1; // Past months are 100% complete
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  return currentDay / daysInMonth;
};

// Convert API metrics to PracticeMetrics format for display
const buildPracticeMetrics = (calc: DashboardMetrics, month: number, year: number, practiceGoals: PracticeGoalsSettings): PracticeMetrics => {
  const monthProgress = getMonthProgress(month, year);

  // Use practice goals from settings
  const revenueGoal = practiceGoals.monthlyRevenue;
  const sessionsGoal = practiceGoals.monthlySessions;
  const rebookRateGoal = practiceGoals.targetRebookRate / 100; // Convert from percentage to decimal

  // Pro-rated goals for current month
  const proRatedRevenueGoal = revenueGoal * monthProgress;
  const proRatedSessionsGoal = sessionsGoal * monthProgress;

  // Revenue calculations - compare to pro-rated goal for current month
  const revenueVsProRated = calc.revenue.value / proRatedRevenueGoal;
  const revenuePercent = Math.round((calc.revenue.value / revenueGoal) * 100);
  const getRevenueStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (revenueVsProRated >= 0.95) return "Healthy";
    if (revenueVsProRated >= 0.80) return "Needs attention";
    return "Critical";
  };

  // Sessions calculations - compare to pro-rated goal
  const sessionsVsProRated = calc.sessions.completed / proRatedSessionsGoal;
  const sessionsPercent = Math.round((calc.sessions.completed / sessionsGoal) * 100);
  const getSessionsStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (sessionsVsProRated >= 0.95) return "Healthy";
    if (sessionsVsProRated >= 0.80) return "Needs attention";
    return "Critical";
  };

  // Client growth calculations
  const netGrowth = calc.clients.new - calc.clients.churned;
  const getClientStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (netGrowth >= 0) return "Healthy";
    if (netGrowth >= -3) return "Needs attention";
    return "Critical";
  };

  // Attendance calculations (not pro-rated - it's a rate)
  const rebookPercent = Math.round(calc.attendance.rebookRate * 100);
  const rebookGoalPercent = Math.round(rebookRateGoal * 100);
  const getAttendanceStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (calc.attendance.rebookRate >= rebookRateGoal) return "Healthy";
    if (calc.attendance.rebookRate >= rebookRateGoal - 0.05) return "Needs attention";
    return "Critical";
  };

  // Notes compliance calculations - use actual count from clinician data
  const activeClinicians = CLINICIANS.filter(c => c.isActive);
  const totalOutstandingNotes = activeClinicians.reduce((sum, c) => {
    const metrics = CLINICIAN_SYNTHETIC_METRICS[c.id];
    return sum + (metrics?.outstandingNotes ?? 0);
  }, 0);
  const totalOverdueNotes = activeClinicians.reduce((sum, c) => {
    const metrics = CLINICIAN_SYNTHETIC_METRICS[c.id];
    return sum + (metrics?.overdueNotes ?? 0);
  }, 0);
  const totalDueSoonNotes = totalOutstandingNotes - totalOverdueNotes;

  const getNotesStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (totalOutstandingNotes <= 10) return "Healthy";
    if (totalOutstandingNotes <= 25) return "Needs attention";
    return "Critical";
  };

  // Build subtext - keep original format
  const revenueGap = revenueGoal - calc.revenue.value;
  const revenueSubtext = revenueGap > 0
    ? `Goal: $${revenueGoal / 1000}k · $${Math.round(revenueGap / 1000)}k left to reach target`
    : `Goal: $${revenueGoal / 1000}k · Target achieved!`;

  const sessionsSubtext = `Goal: ${sessionsGoal} · ${sessionsPercent}% of monthly goal`;

  const clientSubtext = `${calc.clients.new} new, ${calc.clients.churned} churned · ${calc.clients.openings} openings`;

  const attendanceSubtext = `${Math.round(calc.attendance.clientCancelRate * 100)}% client cancel rate`;

  const notesSubtext = `${totalOverdueNotes} overdue · ${totalDueSoonNotes} due soon`;

  // Get consultation metrics for this month
  const consultationMetrics = getConsultationMetrics(month, year, DEFAULT_GOALS.monthlyConsultations);

  // Format revenue with separate value and suffix for better typography
  const formatRevenueParts = (value: number): { value: string; suffix: string } => {
    if (value >= 1000) {
      return { value: `$${(value / 1000).toFixed(1)}`, suffix: 'k' };
    }
    return { value: `$${value.toFixed(0)}`, suffix: '' };
  };
  const revenueParts = formatRevenueParts(calc.revenue.value);

  return {
    revenue: {
      label: "Revenue",
      value: revenueParts.value,
      valueSuffix: revenueParts.suffix || undefined,
      valueLabel: "",
      subtext: revenueSubtext,
      status: getRevenueStatus()
    },
    sessions: {
      label: "Sessions",
      value: `${calc.sessions.completed}`,
      valueLabel: "completed",
      subtext: sessionsSubtext,
      status: getSessionsStatus()
    },
    consultations: consultationMetrics,
    clientGrowth: {
      label: "Clients",
      value: `${calc.clients.active}`,
      valueLabel: "active",
      subtext: clientSubtext,
      status: getClientStatus()
    },
    attendance: {
      label: "Attendance",
      value: `${rebookPercent}`,
      valueSuffix: "%",
      valueLabel: "rebook rate",
      subtext: attendanceSubtext,
      status: getAttendanceStatus()
    },
    compliance: {
      label: "Outstanding Notes",
      value: `${totalOutstandingNotes}`,
      valueLabel: "notes to complete",
      subtext: notesSubtext,
      status: getNotesStatus()
    }
  };
};

type DashboardTabType = 'summary' | 'compare';

export const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [needsNavigation, setNeedsNavigation] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { ref: dragScrollRef, isDragging } = useDragToScroll();

  // Combined ref for both drag scroll and navigation
  const setCombinedRef = React.useCallback((node: HTMLDivElement | null) => {
    (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    dragScrollRef(node);
  }, [dragScrollRef]);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const now = new Date();
  // Dashboard defaults to current month (no aggregate option)
  const [timeSelection, setTimeSelection] = useState<TimeSelectorValue>({
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  // Get active tab from URL search params
  const activeTab = (searchParams.get('tab') || 'summary') as DashboardTabType;

  // Get practice goals from settings context
  const { settings } = useSettings();
  const { practiceGoals } = settings;

  const totalCards = allPriorityCards.length;

  // Get data date range from API
  const { data: dataRange, loading: rangeLoading } = useDataDateRange();

  // Determine which month to fetch (Dashboard always shows specific month, no aggregate)
  const activeMonth = timeSelection === 'last-12-months' ? now.getMonth() : timeSelection.month;
  const activeYear = timeSelection === 'last-12-months' ? now.getFullYear() : timeSelection.year;

  // Fetch metrics from API
  const { data: apiMetrics, loading: metricsLoading, error: metricsError } = useMetrics(activeMonth, activeYear);

  // Build display metrics when API data is available
  const metrics = useMemo(() => {
    if (!apiMetrics) return null;
    return buildPracticeMetrics(apiMetrics, activeMonth, activeYear, practiceGoals);
  }, [apiMetrics, activeMonth, activeYear, practiceGoals]);

  const isLoading = metricsLoading || rangeLoading;

  // Get the display title based on time selection
  const getTitle = () => {
    if (timeSelection === 'last-12-months') {
      return 'Last 12 Months';
    }
    return `${FULL_MONTHS[timeSelection.month]} ${timeSelection.year}`;
  };

  // Check if cards overflow the container
  React.useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setNeedsNavigation(container.scrollWidth > container.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  // Track scroll progress and button states
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }

      const progress = container.scrollLeft / maxScroll;
      setScrollProgress(progress);
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(container.scrollLeft < maxScroll - 10);
    };

    updateScrollState();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    return () => container.removeEventListener('scroll', updateScrollState);
  }, []);

  // Scroll by one page (viewport width)
  const handlePrevious = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.clientWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.clientWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  const priorityCards = allPriorityCards.map((card, idx) => (
    <SimpleAlertCard
      key={card.id}
      index={idx}
      title={card.title}
      aiGuidance={card.aiGuidance}
      action={card.action}
      status={card.status}
      stats={card.stats}
      comparisonText={card.comparisonText}
    />
  ));

  // If compare tab is selected, render the compare component
  if (activeTab === 'compare') {
    return <CompareTab />;
  }

  // Default: render the summary tab
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full flex flex-col">

        {/* =============================================
            DARK HEADER SECTION
            ============================================= */}
        <PageHeader
          accent="amber"
          title="Practice Overview"
          timeSelector={
            <TimeSelector
              value={timeSelection}
              onChange={setTimeSelection}
              showAggregateOption={false}
              variant="header"
              minYear={dataRange?.earliest.getFullYear()}
              maxYear={dataRange?.latest.getFullYear()}
            />
          }
        />

        {/* Referral Modal */}
        <ReferralModal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
        />

        {/* =============================================
            MAIN CONTENT AREA
            ============================================= */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1 min-h-0 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-6 lg:py-8">

          {/* Metrics Row */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="ml-3 text-stone-500">Loading metrics...</span>
              </div>
            ) : metricsError ? (
              <div className="flex items-center justify-center py-12 text-red-500">
                <span>Failed to load metrics. Please try again.</span>
              </div>
            ) : metrics ? (
              <MetricsRow metrics={metrics} showConsultations={settings.showConsultationMetrics} />
            ) : null}
          </div>

          {/* Priority Tasks Section */}
          <div className="flex flex-col pb-4 sm:pb-6 flex-1">
            <SectionHeader
              question="Priority Tasks"
              accent="amber"
              showAccentLine={false}
              compact
              className="!mb-4"
              actions={
                <div className="flex items-center gap-4">
                  {needsNavigation && !settings.showPriorityTasksEmptyState && (
                    <>
                      {/* Progress Bar */}
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            initial={{ width: '5%' }}
                            animate={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-stone-600 tabular-nums">
                          {totalCards} items
                        </span>
                      </div>

                      {/* Navigation Arrows */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevious}
                          disabled={!canScrollLeft}
                          className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-md hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none disabled:active:scale-100"
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={20} className="text-stone-700" />
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={!canScrollRight}
                          className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-md hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none disabled:active:scale-100"
                          aria-label="Next page"
                        >
                          <ChevronRight size={20} className="text-stone-700" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              }
            />

            {/* Cards Container - breaks out of parent padding to extend to viewport edge */}
            <div className="relative flex-1 min-h-[560px] -mr-6 sm:-mr-8 lg:-mr-12">
              {settings.showPriorityTasksEmptyState ? (
                /* Empty State Preview */
                <div className="absolute inset-0 flex gap-4 lg:gap-5 pb-2 pr-6 sm:pr-8 lg:pr-12">
                  <div
                    className="flex-shrink-0 h-[540px]"
                    style={{ width: 'clamp(320px, 38vw, 520px)' }}
                  >
                    <PriorityTasksEmptyState index={0} />
                  </div>
                </div>
              ) : (
                /* Priority Cards Carousel */
                <div
                  ref={setCombinedRef}
                  className={`absolute inset-0 flex gap-4 lg:gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2 pr-6 sm:pr-8 lg:pr-12 cursor-grab ${
                    isDragging ? 'select-none' : ''
                  }`}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {priorityCards.map((card, index) => (
                    <div
                      key={index}
                      className="snap-start flex-shrink-0 h-[540px]"
                      style={{
                        width: 'clamp(320px, 38vw, 520px)',
                        pointerEvents: isDragging ? 'none' : 'auto', // Prevent clicks while dragging
                      }}
                    >
                      {card}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
