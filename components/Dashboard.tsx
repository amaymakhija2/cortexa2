
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
    subtext: "Goal: 850 · 82% of monthly goal",
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
    sessions: { label: "Sessions", value: "672", valueLabel: "completed", subtext: "79% of goal", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "149", valueLabel: "active", subtext: "+12 new · -4 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "71%", valueLabel: "rebook rate", subtext: "9.6% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "0", valueLabel: "overdue notes", subtext: "Goal achieved", status: "Healthy" }
  },
  '2025-9': { // September 2025
    revenue: { label: "Revenue", value: "$142.8k", valueLabel: "", subtext: "$150.0k goal, 95% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "645", valueLabel: "completed", subtext: "76% of goal", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "141", valueLabel: "active", subtext: "+8 new · -6 discharged", status: "Needs attention" },
    attendance: { label: "Attendance", value: "74%", valueLabel: "rebook rate", subtext: "8.0% non-billable cancel rate", status: "Healthy" },
    compliance: { label: "Outstanding Notes", value: "3", valueLabel: "overdue notes", subtext: "Goal: 0 · 2 clinicians affected", status: "Needs attention" }
  },
  '2025-8': { // August 2025
    revenue: { label: "Revenue", value: "$138.5k", valueLabel: "", subtext: "$145.0k goal, 96% achieved", status: "Needs attention" },
    sessions: { label: "Sessions", value: "628", valueLabel: "completed", subtext: "74% of goal", status: "Healthy" },
    clientGrowth: { label: "Clients", value: "139", valueLabel: "active", subtext: "+15 new · -3 discharged", status: "Healthy" },
    attendance: { label: "Attendance", value: "69%", valueLabel: "rebook rate", subtext: "11.3% non-billable cancel rate", status: "Needs attention" },
    compliance: { label: "Outstanding Notes", value: "5", valueLabel: "overdue notes", subtext: "Goal: 0 · 2 clinicians affected", status: "Needs attention" }
  },
  '2025-7': { // July 2025
    revenue: { label: "Revenue", value: "$125.3k", valueLabel: "", subtext: "$140.0k goal, 90% achieved", status: "Critical" },
    sessions: { label: "Sessions", value: "584", valueLabel: "completed", subtext: "69% of goal", status: "Needs attention" },
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
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full flex flex-col">

        {/* =============================================
            DARK HEADER SECTION
            ============================================= */}
        <div
          className="relative overflow-hidden flex-shrink-0"
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
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-amber-500/80 text-sm font-semibold tracking-widest uppercase mb-2">
                  Practice Overview
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {getTitle()}
                </h1>
              </div>

              {/* Live/Historical Toggle */}
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
        </div>

        {/* =============================================
            MAIN CONTENT AREA
            ============================================= */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1 min-h-0 px-6 sm:px-8 lg:px-12 py-6 lg:py-8">

          {/* Metrics Row */}
          <div className="flex-shrink-0">
            <h2
              className="text-xl sm:text-2xl text-stone-900 font-bold tracking-tight mb-4"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Key Metrics
            </h2>
            <MetricsRow metrics={metrics} />
          </div>

          {/* Priority Tasks Section */}
          <div className="flex flex-col gap-4 pb-4 sm:pb-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0">
              <h2
                className="text-xl sm:text-2xl text-stone-900 font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Priority Tasks
                <span className="ml-3 text-sm font-medium text-stone-400">
                  {totalCards} items
                </span>
              </h2>

              {/* Navigation - only show if cards overflow */}
              {needsNavigation && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 mr-3">
                    {Array.from({ length: totalCards }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentCardIndex(idx);
                          scrollToCard(idx);
                        }}
                        className={`transition-all duration-300 rounded-full ${
                          currentCardIndex === idx
                            ? 'w-6 h-1.5 bg-stone-800'
                            : 'w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400'
                        }`}
                        aria-label={`Go to card ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                    className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous card"
                  >
                    <ChevronLeft size={16} className="text-stone-600" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentCardIndex === totalCards - 1}
                    className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-all hover:border-stone-300 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next card"
                  >
                    <ChevronRight size={16} className="text-stone-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Cards Container */}
            <div className="relative flex-1 min-h-0 -mx-6 sm:-mx-8 lg:-mx-12">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 lg:gap-5 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2 px-6 sm:px-8 lg:px-12"
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
    </div>
  );
};
