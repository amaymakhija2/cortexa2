
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetricsRow } from './MetricsRow';
import { PriorityTaskCard } from './PriorityTaskCard';
import { PracticeMetrics } from '../types';

const INITIAL_METRICS: PracticeMetrics = {
  revenue: {
    label: "Revenue",
    value: "$153.4k",
    valueLabel: "",
    subtext: "$160.0k goal, 96% complete",
    status: "Needs attention"
  },
  sessions: {
    label: "Sessions",
    value: "698",
    valueLabel: "completed sessions",
    subtext: "82% capacity · 18 open slots",
    status: "Healthy"
  },
  clientGrowth: {
    label: "Clients",
    value: "156",
    valueLabel: "active clients",
    subtext: "+17 new · -5 churned",
    status: "Healthy"
  },
  attendance: {
    label: "Attendance",
    value: "68%",
    valueLabel: "rebook rate",
    subtext: "8.9% cancel · 2% no show",
    status: "Needs attention"
  },
  compliance: {
    label: "Compliance",
    value: "12",
    valueLabel: "unsigned notes",
    subtext: "Goal: 0 · 3 clinicians affected",
    status: "Critical"
  }
};

export const Dashboard: React.FC = () => {
  const [metrics] = useState<PracticeMetrics>(INITIAL_METRICS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'live' | 'historical'>('live');
  const [selectedMonth, setSelectedMonth] = useState('December');
  const [selectedYear, setSelectedYear] = useState('2025');

  const totalCards = 4;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2025', '2024', '2023', '2022'];

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
      const cardWidth = container.scrollWidth / totalCards;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const priorityCards = [
    <PriorityTaskCard
      key="retention"
      index={1}
      title="Client Retention Alert"
      description="Patel's new client cohort"
      aiGuidance="Patel acquired 6 new clients from June - August 2024. 3 in June, 2 in July and 1 in August. Of those 6, only 2 are remaining (33% retention rate) by September 2024. This pattern is significantly below your practice average and warrants investigation."
      impact="Patel • Jun-Aug 2024 Cohort"
      action="Schedule clinician check-in"
      status="critical"
      dueToday={true}
      type="retention"
      retentionData={[
        { id: "Sarah M.", acquiredMonth: "June", sessions: [{ month: "Jun", count: 3 }, { month: "Jul", count: 2 }, { month: "Aug", count: 0 }, { month: "Sep", count: 0 }], dropped: true, droppedAfter: "Jul" },
        { id: "James T.", acquiredMonth: "June", sessions: [{ month: "Jun", count: 4 }, { month: "Jul", count: 3 }, { month: "Aug", count: 2 }, { month: "Sep", count: 3 }], dropped: false, droppedAfter: null },
        { id: "Maria G.", acquiredMonth: "June", sessions: [{ month: "Jun", count: 2 }, { month: "Jul", count: 0 }, { month: "Aug", count: 0 }, { month: "Sep", count: 0 }], dropped: true, droppedAfter: "Jun" },
        { id: "Alex K.", acquiredMonth: "July", sessions: [{ month: "Jun", count: 0 }, { month: "Jul", count: 4 }, { month: "Aug", count: 3 }, { month: "Sep", count: 3 }], dropped: false, droppedAfter: null },
        { id: "Emma R.", acquiredMonth: "July", sessions: [{ month: "Jun", count: 0 }, { month: "Jul", count: 2 }, { month: "Aug", count: 0 }, { month: "Sep", count: 0 }], dropped: true, droppedAfter: "Jul" },
        { id: "David L.", acquiredMonth: "August", sessions: [{ month: "Jun", count: 0 }, { month: "Jul", count: 0 }, { month: "Aug", count: 3 }, { month: "Sep", count: 0 }], dropped: true, droppedAfter: "Aug" },
      ]}
    />,
    <PriorityTaskCard
      key="cancellations"
      index={2}
      title="Cancellation Spike"
      description="Kim's cancellations increased"
      aiGuidance="Kim had 2 cancellations per month in June-July, but this jumped to 8 in August and 9 in September. This represents a 4x increase compared to baseline. The practice average is 2-3 cancellations per clinician per month."
      impact="Kim • Monthly Trend & Comparison"
      action="Review scheduling patterns"
      status="warning"
      dueToday={false}
      type="cancellations"
      chartData={[
        { month: "June", cancellations: 2, isSpike: false },
        { month: "July", cancellations: 2, isSpike: false },
        { month: "August", cancellations: 8, isSpike: true },
        { month: "September", cancellations: 9, isSpike: true },
      ]}
      chartData2={[
        { name: "Kim", cancellations: 8.5, isSpike: true },
        { name: "Rodriguez", cancellations: 2.5, isSpike: false },
        { name: "Chen", cancellations: 2, isSpike: false },
        { name: "Patel", cancellations: 1.5, isSpike: false },
        { name: "Johnson", cancellations: 2, isSpike: false },
      ]}
    />,
    <PriorityTaskCard
      key="ar"
      index={3}
      title="Accounts Receivable Follow-up"
      description="8 clients with overdue payments"
      aiGuidance="You have $9,450 in outstanding receivables across 8 clients. Jennifer Martinez and Robert Thompson (both under Chen) have the longest outstanding balances at 42 and 35 days respectively. Industry best practice is to follow up on invoices after 14 days."
      impact="Total Outstanding: $9,450"
      action="Send payment reminders"
      status="warning"
      dueToday={true}
      type="accounts-receivable"
      accountsReceivableData={[
        { client: "Jennifer Martinez", clinician: "Chen", amount: 1850, daysOutstanding: 42 },
        { client: "Robert Thompson", clinician: "Chen", amount: 1200, daysOutstanding: 35 },
        { client: "Emily Davis", clinician: "Rodriguez", amount: 950, daysOutstanding: 28 },
        { client: "Michael Brown", clinician: "Rodriguez", amount: 1450, daysOutstanding: 24 },
        { client: "Sarah Johnson", clinician: "Kim", amount: 800, daysOutstanding: 21 },
        { client: "David Wilson", clinician: "Kim", amount: 1150, daysOutstanding: 18 },
        { client: "Lisa Anderson", clinician: "Johnson", amount: 1300, daysOutstanding: 16 },
        { client: "James Taylor", clinician: "Patel", amount: 750, daysOutstanding: 14 },
      ]}
    />,
    <PriorityTaskCard
      key="slots"
      index={4}
      title="Open Slots This Week"
      description="34 total slots available"
      aiGuidance="You have good capacity across the team to take on new clients. Chen and Rodriguez have the most availability. This is a great time to activate your waitlist or increase marketing spend. Evening slots typically fill fastest and command premium rates."
      impact="Opportunity for growth"
      action="Contact waitlist clients"
      status="good"
      dueToday={false}
      type="slots"
      chartData={[
        { name: "Chen", slots: 8, unit: "slots" },
        { name: "Rodriguez", slots: 7, unit: "slots" },
        { name: "Patel", slots: 7, unit: "slots" },
        { name: "Kim", slots: 6, unit: "slots" },
        { name: "Johnson", slots: 6, unit: "slots" }
      ]}
    />
  ];

  return (
    <div className="flex-1 p-8 pt-6 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-stone-50 via-orange-50/20 to-stone-100/50">

      {/* Warm gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.03) 0%, transparent 50%)',
        }}
      />

      {/* Header Section - Simplified */}
      <div className="mb-8 flex-shrink-0 relative">
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-light text-stone-900 tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            December Practice Review
          </h1>

          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/60">
              <button
                onClick={() => setViewMode('live')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'live'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setViewMode('historical')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'historical'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Historical
              </button>
            </div>

            {viewMode === 'historical' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 border border-stone-200/60">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-sm font-medium text-stone-700 border-none outline-none cursor-pointer appearance-none"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <span className="text-stone-300">·</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-sm font-medium text-stone-700 border-none outline-none cursor-pointer appearance-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-8 flex-1 min-h-0">
        {/* Metrics Row */}
        <div className="flex-shrink-0">
          <MetricsRow metrics={metrics} />
        </div>

        {/* Priority Tasks Section */}
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-medium text-stone-800 tracking-tight">
              Priority Tasks
              <span className="ml-3 text-sm font-normal text-stone-400">
                {totalCards} items
              </span>
            </h2>

            {/* Navigation */}
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
          </div>

          {/* Cards Container */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-5 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {priorityCards.map((card, index) => (
                <div
                  key={index}
                  className="snap-start flex-shrink-0 h-full"
                  style={{
                    width: 'calc(66.666% - 10px)',
                    minWidth: 'calc(66.666% - 10px)'
                  }}
                >
                  {card}
                </div>
              ))}
            </div>

            {/* Fade edge */}
            <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
