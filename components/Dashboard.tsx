
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetricsRow } from './MetricsRow';
import { PriorityTaskCard } from './PriorityTaskCard';
import { PracticeMetrics } from '../types';

const INITIAL_METRICS: PracticeMetrics = {
  revenue: {
    label: "December Revenue",
    value: "$153.4k",
    subtext: "$160.0k goal, 96% complete",
    status: "Needs attention"
  },
  sessions: {
    label: "December Sessions",
    value: "698 sessions",
    subtext: "82% capacity · 18 open slots",
    status: "Healthy"
  },
  clientGrowth: {
    label: "Client growth",
    value: "+12 new clients",
    subtext: "(17 new - 5 churned)",
    status: "Healthy"
  },
  attendance: {
    label: "Client Attendance",
    value: "68% rebook rate",
    subtext: "8.9% cancel rate, 2% no show rate",
    status: "Needs attention"
  },
  compliance: {
    label: "Admin & compliance",
    value: "12 unsigned notes",
    subtext: "Goal: 0 · 3 clinicians affected",
    status: "Critical"
  }
};

export const Dashboard: React.FC = () => {
  const [metrics] = useState<PracticeMetrics>(INITIAL_METRICS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const totalCards = 4;

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
    // Card 1: Client Retention Alert
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
        {
          id: "Sarah M.",
          acquiredMonth: "June",
          sessions: [
            { month: "Jun", count: 3 },
            { month: "Jul", count: 2 },
            { month: "Aug", count: 0 },
            { month: "Sep", count: 0 },
          ],
          dropped: true,
          droppedAfter: "Jul"
        },
        {
          id: "James T.",
          acquiredMonth: "June",
          sessions: [
            { month: "Jun", count: 4 },
            { month: "Jul", count: 3 },
            { month: "Aug", count: 2 },
            { month: "Sep", count: 3 },
          ],
          dropped: false,
          droppedAfter: null
        },
        {
          id: "Maria G.",
          acquiredMonth: "June",
          sessions: [
            { month: "Jun", count: 2 },
            { month: "Jul", count: 0 },
            { month: "Aug", count: 0 },
            { month: "Sep", count: 0 },
          ],
          dropped: true,
          droppedAfter: "Jun"
        },
        {
          id: "Alex K.",
          acquiredMonth: "July",
          sessions: [
            { month: "Jun", count: 0 },
            { month: "Jul", count: 4 },
            { month: "Aug", count: 3 },
            { month: "Sep", count: 3 },
          ],
          dropped: false,
          droppedAfter: null
        },
        {
          id: "Emma R.",
          acquiredMonth: "July",
          sessions: [
            { month: "Jun", count: 0 },
            { month: "Jul", count: 2 },
            { month: "Aug", count: 0 },
            { month: "Sep", count: 0 },
          ],
          dropped: true,
          droppedAfter: "Jul"
        },
        {
          id: "David L.",
          acquiredMonth: "August",
          sessions: [
            { month: "Jun", count: 0 },
            { month: "Jul", count: 0 },
            { month: "Aug", count: 3 },
            { month: "Sep", count: 0 },
          ],
          dropped: true,
          droppedAfter: "Aug"
        },
      ]}
    />,
    // Card 2: Cancellation Spike
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
    // Card 3: Accounts Receivable
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
        {
          client: "Jennifer Martinez",
          clinician: "Chen",
          amount: 1850,
          daysOutstanding: 42
        },
        {
          client: "Robert Thompson",
          clinician: "Chen",
          amount: 1200,
          daysOutstanding: 35
        },
        {
          client: "Emily Davis",
          clinician: "Rodriguez",
          amount: 950,
          daysOutstanding: 28
        },
        {
          client: "Michael Brown",
          clinician: "Rodriguez",
          amount: 1450,
          daysOutstanding: 24
        },
        {
          client: "Sarah Johnson",
          clinician: "Kim",
          amount: 800,
          daysOutstanding: 21
        },
        {
          client: "David Wilson",
          clinician: "Kim",
          amount: 1150,
          daysOutstanding: 18
        },
        {
          client: "Lisa Anderson",
          clinician: "Johnson",
          amount: 1300,
          daysOutstanding: 16
        },
        {
          client: "James Taylor",
          clinician: "Patel",
          amount: 750,
          daysOutstanding: 14
        },
      ]}
    />,
    // Card 4: Open Slots
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
    <div className="flex-1 p-8 pt-2 flex flex-col h-[calc(100vh-80px)] overflow-hidden">

      {/* Title Section */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-4xl font-normal text-gray-900 tracking-tight">Monthly Practice Review</h1>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-6 flex-1 min-h-0">
          <div className="flex-shrink-0">
            <MetricsRow metrics={metrics} />
          </div>

          {/* Priority Tasks and Key Insights Section */}
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-900">Priority Tasks and Key Insights</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous card"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {currentCardIndex + 1} / {totalCards}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentCardIndex === totalCards - 1}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next card"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
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
            </div>
          </div>
      </div>

    </div>
  );
};
