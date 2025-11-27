
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetricsRow } from './MetricsRow';
import { SimpleAlertCard } from './SimpleAlertCard';
import { MonthPicker } from './MonthPicker';
import { PracticeMetrics } from '../types';

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Current month metrics (live data)
const LIVE_METRICS: PracticeMetrics = {
  revenue: {
    label: "Revenue",
    value: "$153.4k",
    valueLabel: "",
    subtext: "Goal: $160k · $6.6k left to reach target",
    status: "Needs attention"
  },
  sessions: {
    label: "Sessions",
    value: "698",
    valueLabel: "completed",
    subtext: "82% utilization",
    status: "Healthy"
  },
  clientGrowth: {
    label: "Clients",
    value: "156",
    valueLabel: "active",
    subtext: "17 new, 5 discharged · 18 openings",
    status: "Healthy"
  },
  attendance: {
    label: "Attendance",
    value: "68%",
    valueLabel: "rebook rate",
    subtext: "10.9% non-billable cancel rate",
    status: "Needs attention"
  },
  compliance: {
    label: "Outstanding Notes",
    value: "12",
    valueLabel: "overdue notes",
    subtext: "3 clinicians with overdue notes",
    status: "Critical"
  }
};

// Historical metrics data by month/year
const HISTORICAL_METRICS: Record<string, PracticeMetrics> = {
  '2025-10': { // October 2025
    revenue: { label: "Revenue", value: "$148.2k", valueLabel: "", subtext: "$155.0k goal, 96% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "672", valueLabel: "completed", subtext: "79% utilization", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "149", valueLabel: "active", subtext: "+12 new · -4 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "71%", valueLabel: "rebook rate", subtext: "9.6% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "0", valueLabel: "overdue notes", subtext: "Goal achieved", status: "Healthy" }
  },
  '2025-9': { // September 2025
    revenue: { label: "Revenue", value: "$142.8k", valueLabel: "", subtext: "$150.0k goal, 95% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "645", valueLabel: "completed", subtext: "76% utilization", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "141", valueLabel: "active", subtext: "+8 new · -6 discharged", status: "Needs attention" },
    attendance: { label: "Attendance", value: "74%", valueLabel: "rebook rate", subtext: "8.0% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "3", valueLabel: "overdue notes", subtext: "Goal: 0 · 2 clinicians affected", status: "Needs attention" }
  },
  '2025-8': { // August 2025
    revenue: { label: "Revenue", value: "$138.5k", valueLabel: "", subtext: "$145.0k goal, 96% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "628", valueLabel: "completed", subtext: "74% utilization", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "139", valueLabel: "active", subtext: "+15 new · -3 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "69%", valueLabel: "rebook rate", subtext: "11.3% non-billable cancel rate", status: "Needs attention" },
    compliance: { label: "Outstanding Notes", value: "5", valueLabel: "overdue notes", subtext: "Goal: 0 · 2 clinicians affected", status: "Needs attention" }
  },
  '2025-7': { // July 2025
    revenue: { label: "Revenue", value: "$125.3k", valueLabel: "", subtext: "$140.0k goal, 90% achieved", status: "Critical" },
    sessions: { label: "Sessions", value: "584", valueLabel: "completed", subtext: "69% utilization", status: "Needs attention" },
    clientGrowth: { label: "Clients", value: "127", valueLabel: "active", subtext: "+6 new · -8 discharged", status: "Critical" },
    attendance: { label: "Attendance", value: "65%", valueLabel: "rebook rate", subtext: "14.6% non-billable cancel rate", status: "Critical" },
    compliance: { label: "Outstanding Notes", value: "8", valueLabel: "overdue notes", subtext: "Goal: 0 · 4 clinicians affected", status: "Critical" }
  },
  '2025-6': { // June 2025
    revenue: { label: "Revenue", value: "$132.1k", valueLabel: "", subtext: "$135.0k goal, 98% achieved", status: "Healthy" },
    sessions: { label: "Sessions", value: "612", valueLabel: "completed", subtext: "72% utilization", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "129", valueLabel: "active", subtext: "+11 new · -5 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "72%", valueLabel: "rebook rate", subtext: "9.0% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "2", valueLabel: "overdue notes", subtext: "Goal: 0 · 1 clinician affected", status: "Needs attention" }
  },
  '2024-11': { // November 2024
    revenue: { label: "Revenue", value: "$118.7k", valueLabel: "", subtext: "$125.0k goal, 95% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "548", valueLabel: "completed", subtext: "65% utilization", status: "Needs attention" },
    clientGrowth: { label: "Clients", value: "112", valueLabel: "active", subtext: "+9 new · -7 discharged", status: "Needs attention" },
    attendance: { label: "Attendance", value: "70%", valueLabel: "rebook rate", subtext: "11.0% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "6", valueLabel: "overdue notes", subtext: "Goal: 0 · 3 clinicians affected", status: "Critical" }
  },
  '2024-10': { // October 2024
    revenue: { label: "Revenue", value: "$115.2k", valueLabel: "", subtext: "$120.0k goal, 96% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "532", valueLabel: "completed", subtext: "63% utilization", status: "Needs attention" },
    clientGrowth: { label: "Clients", value: "110", valueLabel: "active", subtext: "+7 new · -4 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "73%", valueLabel: "rebook rate", subtext: "9.0% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "4", valueLabel: "overdue notes", subtext: "Goal: 0 · 2 clinicians affected", status: "Needs attention" }
  }
};

// Generate placeholder metrics for months without specific data
const getMetricsForMonth = (month: number, year: number): PracticeMetrics => {
  const key = `${year}-${month}`;
  if (HISTORICAL_METRICS[key]) {
    return HISTORICAL_METRICS[key];
  }

  // Generate reasonable placeholder data based on trends
  const baseRevenue = 100 + (year - 2020) * 15 + month * 2;
  const baseSessions = 400 + (year - 2020) * 50 + month * 10;
  const baseClients = 80 + (year - 2020) * 15 + month * 3;

  const cancelRate = (6 + Math.random() * 6).toFixed(1);

  return {
    revenue: {
      label: "Revenue",
      value: `$${baseRevenue.toFixed(1)}k`,
      valueLabel: "",
      subtext: `$${(baseRevenue + 10).toFixed(0)}k goal`,
      status: Math.random() > 0.5 ? "Healthy" : "Needs attention"
    },
    sessions: {
      label: "Sessions",
      value: `${baseSessions}`,
      valueLabel: "completed",
      subtext: `${Math.floor(60 + Math.random() * 25)}% utilization`,
      status: "Healthy"
    },
    clientGrowth: {
      label: "Clients",
      value: `${baseClients}`,
      valueLabel: "active",
      subtext: `+${Math.floor(5 + Math.random() * 10)} new · -${Math.floor(2 + Math.random() * 5)} discharged`,
      status: "Healthy"
    },
    attendance: {
      label: "Attendance",
      value: `${Math.floor(65 + Math.random() * 15)}%`,
      valueLabel: "rebook rate",
      subtext: `${cancelRate}% non-billable cancel rate`,
      status: Math.random() > 0.6 ? "Healthy" : "Needs attention"
    },
    compliance: {
      label: "Outstanding Notes",
      value: `${Math.floor(Math.random() * 10)}`,
      valueLabel: "overdue notes",
      subtext: "Historical data",
      status: Math.random() > 0.7 ? "Healthy" : "Needs attention"
    }
  };
};

export const Dashboard: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [needsNavigation, setNeedsNavigation] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'live' | 'historical'>('live');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const totalCards = 4;

  // Get metrics based on view mode
  const metrics = React.useMemo(() => {
    // If current month/year is selected (either live or historical), show live metrics
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (viewMode === 'live' || isCurrentMonth) {
      return LIVE_METRICS;
    }
    return getMetricsForMonth(selectedMonth, selectedYear);
  }, [viewMode, selectedMonth, selectedYear, now]);

  // Handle month selection from picker
  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Get the display title based on view mode
  const getTitle = () => {
    if (viewMode === 'live') {
      return `${FULL_MONTHS[now.getMonth()]} ${now.getFullYear()} Practice Review`;
    }
    return `${FULL_MONTHS[selectedMonth]} ${selectedYear} Practice Review`;
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


  const handlePrevious = () => {
    const newIndex = currentCardIndex === 0 ? 0 : currentCardIndex - 1;
    setCurrentCardIndex(newIndex);
    scrollToCard(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentCardIndex === totalCards - 1 ? totalCards - 1 : currentCardIndex + 1;
    setCurrentCardIndex(newIndex);
    scrollToCard(newIndex);
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (cards[index]) {
        const card = cards[index] as HTMLElement;
        container.scrollTo({
          left: card.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const priorityCards = [
    <SimpleAlertCard
      key="retention"
      index={1}
      title="Client Retention Alert"
      aiGuidance="Patel acquired 6 new clients from June–August 2024. Of those 6, only 2 remain by September—a 33% retention rate, significantly below your practice average of 80%. The drop-off pattern suggests early engagement issues that warrant investigation."
      action="Explore Data"
      status="critical"
      stats={[
        { value: 6, label: "new clients", color: "white" },
        { value: 4, label: "lost", color: "red" },
        { value: 2, label: "retained", color: "emerald" },
      ]}
    />,
    <SimpleAlertCard
      key="cancellations"
      index={2}
      title="Cancellation Spike"
      aiGuidance="Kim had 2 cancellations per month in June-July, but this jumped to 8 in August and 9 in September. This represents a 4x increase compared to baseline. The practice average is 2-3 cancellations per clinician per month."
      action="Explore Data"
      status="warning"
      stats={[
        { value: 9, label: "this month", color: "amber" },
        { value: 2, label: "baseline", color: "white" },
        { value: "4x", label: "increase", color: "red" },
      ]}
    />,
    <SimpleAlertCard
      key="ar"
      index={3}
      title="Accounts Receivable"
      aiGuidance="You have $9,450 in outstanding receivables across 8 clients. Jennifer Martinez and Robert Thompson have the longest outstanding balances at 42 and 35 days respectively. Industry best practice is to follow up on invoices after 14 days."
      action="Explore Data"
      status="warning"
      stats={[
        { value: "$9.4k", label: "outstanding", color: "amber" },
        { value: 8, label: "clients", color: "white" },
        { value: "42d", label: "oldest", color: "red" },
      ]}
    />,
    <SimpleAlertCard
      key="slots"
      index={4}
      title="Open Slots This Week"
      aiGuidance="You have good capacity across the team to take on new clients. Chen and Rodriguez have the most availability. This is a great time to activate your waitlist or increase marketing spend. Evening slots typically fill fastest."
      action="Explore Data"
      status="good"
      stats={[
        { value: 34, label: "open slots", color: "emerald" },
        { value: 5, label: "clinicians", color: "white" },
      ]}
    />
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-br from-stone-50 via-orange-50/20 to-stone-100/50">

      {/* Warm gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.03) 0%, transparent 50%)',
        }}
      />

      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 xl:pt-8 pb-4 xl:pb-6 flex-shrink-0 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="text-stone-400 text-xs sm:text-sm font-medium uppercase tracking-widest">Practice</span>
              <span className="text-stone-300">/</span>
              <span className="text-amber-600 text-xs sm:text-sm font-bold uppercase tracking-widest">Overview</span>
            </div>
            <div className="flex items-baseline gap-4">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-stone-900 font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {getTitle()}
              </h1>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/60">
              <button
                onClick={() => setViewMode('live')}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  viewMode === 'live'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setViewMode('historical')}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  viewMode === 'historical'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Historical
              </button>
            </div>

            {viewMode === 'historical' && (
              <MonthPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSelect={handleMonthSelect}
                minYear={2020}
                maxYear={new Date().getFullYear()}
                autoOpen={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:gap-8 flex-1 min-h-0 px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Metrics Row */}
        <div className="flex-shrink-0">
          <MetricsRow metrics={metrics} />
        </div>

        {/* Priority Tasks Section */}
        <div className="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-6 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0">
            <h2
              className="text-xl sm:text-2xl xl:text-3xl text-stone-900 font-bold tracking-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Priority Tasks
              <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium text-stone-400">
                {totalCards} items
              </span>
            </h2>

            {/* Navigation - only show if cards overflow */}
            {needsNavigation && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-1.5 mr-2 sm:mr-3">
                  {Array.from({ length: totalCards }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentCardIndex(idx);
                        scrollToCard(idx);
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        currentCardIndex === idx
                          ? 'w-5 sm:w-6 h-1 sm:h-1.5 bg-stone-800'
                          : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Go to card ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous card"
                >
                  <ChevronLeft size={16} className="text-stone-600" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentCardIndex === totalCards - 1}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next card"
                >
                  <ChevronRight size={16} className="text-stone-600" />
                </button>
              </div>
            )}
          </div>

          {/* Cards Container */}
          <div className="relative flex-1 min-h-0 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10">
            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 xl:gap-5 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2 px-4 sm:px-6 lg:px-8 xl:px-10"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {priorityCards.map((card, index) => (
                <div
                  key={index}
                  className="snap-start flex-shrink-0 h-full w-[280px] sm:w-[320px] md:w-[340px] lg:w-[calc(25%-12px)]"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
