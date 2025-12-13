
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricsRow } from './MetricsRow';
import { SimpleAlertCard } from './SimpleAlertCard';
import { MonthlyReviewCard } from './MonthlyReviewCard';
import { MonthPicker } from './MonthPicker';
import { PageHeader, SectionHeader } from './design-system';
import { ReferralBadge, ReferralModal } from './referral';
import { PracticeMetrics } from '../types';
import { useMetrics, useDataDateRange, DashboardMetrics } from '../hooks';
import { allPriorityCards } from '../data/priorityCardsData';
import { useSettings, PracticeGoals as PracticeGoalsSettings } from '../context/SettingsContext';

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Default goals (used as fallback, main goals come from SettingsContext)
const DEFAULT_GOALS = {
  notesOverdue: 0.10,   // <10% overdue notes target (not in practice goals config)
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

  // Notes compliance calculations (not pro-rated - it's a rate)
  const notesPercent = Math.round(calc.notes.outstandingPercent * 100);
  const getNotesStatus = (): "Healthy" | "Needs attention" | "Critical" => {
    if (calc.notes.outstandingPercent <= DEFAULT_GOALS.notesOverdue) return "Healthy";
    if (calc.notes.outstandingPercent <= DEFAULT_GOALS.notesOverdue * 1.5) return "Needs attention";
    return "Critical";
  };

  // Build subtext - keep original format
  const revenueGap = revenueGoal - calc.revenue.value;
  const revenueSubtext = revenueGap > 0
    ? `Goal: $${revenueGoal / 1000}k · $${(revenueGap / 1000).toFixed(1)}k left to reach target`
    : `Goal: $${revenueGoal / 1000}k · Target achieved!`;

  const sessionsSubtext = `Goal: ${sessionsGoal} · ${sessionsPercent}% of monthly goal`;

  const clientSubtext = `${calc.clients.new} new, ${calc.clients.churned} churned · ${calc.clients.openings} openings`;

  const attendanceSubtext = `${Math.round(calc.attendance.clientCancelRate * 100)}% client cancel rate`;

  const notesSubtext = `Goal: <${Math.round(DEFAULT_GOALS.notesOverdue * 100)}% · ${notesPercent}% currently overdue`;

  return {
    revenue: {
      label: "Revenue",
      value: calc.revenue.formatted,
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
    clientGrowth: {
      label: "Clients",
      value: `${calc.clients.active}`,
      valueLabel: "active",
      subtext: clientSubtext,
      status: getClientStatus()
    },
    attendance: {
      label: "Attendance",
      value: `${rebookPercent}%`,
      valueLabel: "rebook rate",
      subtext: attendanceSubtext,
      status: getAttendanceStatus()
    },
    compliance: {
      label: "Outstanding Notes",
      value: `${notesPercent}%`,
      valueLabel: "overdue",
      subtext: notesSubtext,
      status: getNotesStatus()
    }
  };
};

export const Dashboard: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [needsNavigation, setNeedsNavigation] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'live' | 'historical'>('live');
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Get practice goals from settings context
  const { settings } = useSettings();
  const { practiceGoals } = settings;

  const totalCards = 1 + allPriorityCards.length; // MonthlyReviewCard + priority cards

  // Get data date range from API
  const { data: dataRange, loading: rangeLoading } = useDataDateRange();

  // Determine which month to fetch
  const activeMonth = viewMode === 'live' ? now.getMonth() : selectedMonth;
  const activeYear = viewMode === 'live' ? now.getFullYear() : selectedYear;

  // Fetch metrics from API
  const { data: apiMetrics, loading: metricsLoading, error: metricsError } = useMetrics(activeMonth, activeYear);

  // Build display metrics when API data is available
  const metrics = useMemo(() => {
    if (!apiMetrics) return null;
    return buildPracticeMetrics(apiMetrics, activeMonth, activeYear, practiceGoals);
  }, [apiMetrics, activeMonth, activeYear, practiceGoals]);

  const isLoading = metricsLoading || rangeLoading;

  // Handle month selection from picker
  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Get the display title based on view mode
  const getTitle = () => {
    if (viewMode === 'live') {
      return `${FULL_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
    return `${FULL_MONTHS[selectedMonth]} ${selectedYear}`;
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

  const priorityCards = [
    <MonthlyReviewCard
      key="monthly-review"
      month={10} // November (0-indexed)
      year={2025}
      index={0}
    />,
    ...allPriorityCards.map((card, idx) => (
      <SimpleAlertCard
        key={card.id}
        index={idx + 1}
        title={card.title}
        aiGuidance={card.aiGuidance}
        action={card.action}
        status={card.status}
        stats={card.stats}
        comparisonText={card.comparisonText}
      />
    ))
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full flex flex-col">

        {/* =============================================
            DARK HEADER SECTION
            ============================================= */}
        <PageHeader
          accent="amber"
          label="Practice Overview"
          title={getTitle()}
          titleAction={<ReferralBadge onClick={() => setIsReferralModalOpen(true)} />}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('live')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    viewMode === 'live'
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setViewMode('historical')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    viewMode === 'historical'
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Historical
                </button>
              </div>

              {viewMode === 'historical' && dataRange && (
                <MonthPicker
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onSelect={handleMonthSelect}
                  minYear={dataRange.earliest.getFullYear()}
                  maxYear={dataRange.latest.getFullYear()}
                  autoOpen={true}
                />
              )}
            </div>
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
        <div className="flex flex-col gap-6 lg:gap-8 flex-1 min-h-0 px-6 sm:px-8 lg:px-12 py-6 lg:py-8">

          {/* Metrics Row */}
          <div className="flex-shrink-0">
            <SectionHeader
              question="Key Metrics"
              accent="amber"
              showAccentLine={false}
              compact
              className="!mb-4"
            />
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
              <MetricsRow metrics={metrics} />
            ) : null}
          </div>

          {/* Priority Tasks Section */}
          <div className="flex flex-col pb-4 sm:pb-6 flex-1">
            <SectionHeader
              question="Priority Tasks"
              description={`${totalCards} items`}
              accent="amber"
              showAccentLine={false}
              compact
              className="!mb-4"
              actions={
                needsNavigation ? (
                  <div className="flex items-center gap-4">
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
                  </div>
                ) : undefined
              }
            />

            {/* Cards Container */}
            <div className="relative flex-1 min-h-[560px]">
              <div
                ref={scrollContainerRef}
                className="absolute inset-0 flex gap-4 lg:gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {priorityCards.map((card, index) => (
                  <div
                    key={index}
                    className="snap-start flex-shrink-0 h-[540px] w-[280px] sm:w-[320px] md:w-[340px] lg:w-[calc(25%-12px)]"
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
