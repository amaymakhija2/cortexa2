import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, X, ArrowRight, TrendingUp, TrendingDown,
  Users, DollarSign, Award, Heart, Calendar, Target, UserMinus,
  UserPlus, Clock, AlertTriangle, FileText, Briefcase, CheckCircle2,
  Loader2
} from 'lucide-react';
import { useMetrics, useClinicianMetricsForMonth, useMonthlyData } from '../hooks';

// Format currency helper (moved here from metricsCalculator)
function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

// Practice settings (static values - must match paymentData.ts)
const PRACTICE_SETTINGS = {
  capacity: 23,
  currentOpenings: 18,
  attendance: {
    showRate: 0.71,
    clientCancelled: 0.24,
    lateCancelled: 0.03,
    clinicianCancelled: 0.03,
    rebookRate: 0.83,
  },
  outstandingNotesPercent: 0.22,
};

interface MonthlyReviewCardProps {
  month: number; // 0-11
  year: number;
  index?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Goals (matching Dashboard.tsx)
const GOALS = {
  revenue: 100000,
  sessions: 475,
  rebookRate: 0.85,
  notesOverdue: 0.10,
};

// Extended slide themes for more slides
const SLIDE_THEMES = [
  { bg: 'from-stone-900 via-stone-800 to-stone-900', accent: 'stone' },      // Intro
  { bg: 'from-emerald-900 via-emerald-800 to-teal-900', accent: 'emerald' }, // Revenue (green = money)
  { bg: 'from-blue-900 via-indigo-900 to-violet-900', accent: 'blue' },      // Sessions
  { bg: 'from-cyan-900 via-teal-900 to-emerald-900', accent: 'cyan' },       // New clients
  { bg: 'from-rose-900 via-pink-900 to-red-900', accent: 'rose' },           // Retention (warm)
  { bg: 'from-amber-900 via-orange-900 to-yellow-900', accent: 'amber' },    // Attendance
  { bg: 'from-violet-900 via-purple-900 to-fuchsia-900', accent: 'violet' }, // MVP
  { bg: 'from-slate-900 via-gray-900 to-zinc-900', accent: 'slate' },        // Team breakdown
  { bg: 'from-red-900 via-rose-900 to-orange-900', accent: 'red' },          // Heads up
  { bg: 'from-indigo-900 via-blue-900 to-cyan-900', accent: 'indigo' },      // Compliance
  { bg: 'from-teal-900 via-emerald-900 to-green-900', accent: 'teal' },      // Looking ahead
  { bg: 'from-amber-900 via-orange-900 to-rose-900', accent: 'amber' },      // Closing
];

export const MonthlyReviewCard: React.FC<MonthlyReviewCardProps> = ({
  month,
  year,
  index = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch metrics from API
  const { data: metricsData, loading: metricsLoading } = useMetrics(month, year);
  const { data: clinicianMetrics, loading: cliniciansLoading } = useClinicianMetricsForMonth(month, year);
  const { data: monthlyData, loading: monthlyLoading } = useMonthlyData(6);

  const isLoading = metricsLoading || cliniciansLoading || monthlyLoading;

  // Use API data or provide defaults while loading
  const metrics = metricsData || {
    revenue: { value: 0, formatted: '$0' },
    sessions: { completed: 0 },
    clients: { active: 0, new: 0, churned: 0, openings: 0 },
    attendance: { showRate: 0, clientCancelRate: 0, lateCancelRate: 0, clinicianCancelRate: 0, rebookRate: 0 },
    notes: { outstandingPercent: 0 },
  };

  // Sort clinicians by revenue (with fallback for loading state)
  const clinicians = clinicianMetrics || [];
  const sortedClinicians = [...clinicians].sort((a, b) => b.revenue - a.revenue);
  const topClinician = sortedClinicians[0];

  // Find clinician who brought most new clients
  const topAcquirer = [...clinicians].sort((a, b) => b.newClients - a.newClients)[0];

  // Find any clinician with concerning churn
  const highChurnClinician = clinicians.find(c => c.clientsChurned >= 3);

  // Calculate month-over-month changes
  const months = monthlyData || [];
  const prevMonthData = months.find(m => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return m.monthNum === prevMonth && m.year === prevYear;
  });

  const revenueChange = prevMonthData
    ? ((metrics.revenue.value - prevMonthData.revenue) / prevMonthData.revenue * 100)
    : null;

  const sessionsChange = prevMonthData
    ? ((metrics.sessions.completed - prevMonthData.sessions) / prevMonthData.sessions * 100)
    : null;

  // Goal calculations
  const revenueVsGoal = ((metrics.revenue.value / GOALS.revenue) * 100);
  const hitRevenueGoal = metrics.revenue.value >= GOALS.revenue;
  const sessionsVsGoal = ((metrics.sessions.completed / GOALS.sessions) * 100);
  const hitSessionsGoal = metrics.sessions.completed >= GOALS.sessions;

  // Net client growth
  const netClientGrowth = metrics.clients.new - metrics.clients.churned;

  // Attendance & compliance from practice settings
  const showRate = Math.round(PRACTICE_SETTINGS.attendance.showRate * 100);
  const rebookRate = Math.round(PRACTICE_SETTINGS.attendance.rebookRate * 100);
  const clientCancelRate = Math.round(PRACTICE_SETTINGS.attendance.clientCancelled * 100);
  const notesOverdue = Math.round(PRACTICE_SETTINGS.outstandingNotesPercent * 100);
  const notesOnTrack = notesOverdue <= GOALS.notesOverdue * 100;

  const monthName = MONTH_NAMES[month];

  // Determine if we need a "heads up" slide
  const hasHeadsUp = highChurnClinician || notesOverdue > 15 || rebookRate < 80;
  const headsUpMessage = highChurnClinician
    ? `${highChurnClinician.clinicianName.split(' ')[0]} lost ${highChurnClinician.clientsChurned} clients this month. Consider a check-in.`
    : notesOverdue > 15
    ? `${notesOverdue}% of notes are overdue. This affects billing and compliance.`
    : `Rebook rate dropped to ${rebookRate}%. Follow up with clients who haven't scheduled.`;

  // Build slides data
  const slides: SlideData[] = [
    // 1. Intro
    { type: 'intro', theme: SLIDE_THEMES[0] },

    // 2. Revenue
    {
      type: 'revenue',
      theme: SLIDE_THEMES[1],
      icon: DollarSign,
      value: metrics.revenue.formatted,
      hitGoal: hitRevenueGoal,
      vsGoal: revenueVsGoal,
      change: revenueChange,
      goalAmount: formatCurrency(GOALS.revenue),
    },

    // 3. Sessions
    {
      type: 'sessions',
      theme: SLIDE_THEMES[2],
      icon: Calendar,
      value: metrics.sessions.completed,
      hitGoal: hitSessionsGoal,
      vsGoal: sessionsVsGoal,
      change: sessionsChange,
      goalAmount: GOALS.sessions,
    },

    // 4. New Clients
    {
      type: 'new-clients',
      theme: SLIDE_THEMES[3],
      icon: UserPlus,
      value: metrics.clients.new,
      totalActive: metrics.clients.active,
      topAcquirer: topAcquirer?.clinicianName?.split(' ')[0] || 'Team',
      topAcquirerCount: topAcquirer?.newClients || 0,
    },

    // 5. Retention
    {
      type: 'retention',
      theme: SLIDE_THEMES[4],
      icon: Users,
      churned: metrics.clients.churned,
      netGrowth: netClientGrowth,
      isPositive: netClientGrowth >= 0,
    },

    // 6. Attendance
    {
      type: 'attendance',
      theme: SLIDE_THEMES[5],
      icon: Clock,
      showRate,
      rebookRate,
      cancelRate: clientCancelRate,
    },

    // 7. MVP
    {
      type: 'mvp',
      theme: SLIDE_THEMES[6],
      icon: Award,
      name: topClinician?.clinicianName || 'Star Clinician',
      revenue: formatCurrency(topClinician?.revenue || 0),
      sessions: topClinician?.completedSessions || 0,
      clients: topClinician?.activeClients || 0,
    },

    // 8. Team Breakdown
    {
      type: 'team',
      theme: SLIDE_THEMES[7],
      clinicians: sortedClinicians.slice(0, 6), // Top 6
    },

    // 9. Heads Up (conditional)
    ...(hasHeadsUp ? [{
      type: 'heads-up' as const,
      theme: SLIDE_THEMES[8],
      icon: AlertTriangle,
      message: headsUpMessage,
    }] : []),

    // 10. Compliance
    {
      type: 'compliance',
      theme: SLIDE_THEMES[9],
      icon: FileText,
      notesOverdue,
      isOnTrack: notesOnTrack,
    },

    // 11. Looking Ahead
    {
      type: 'looking-ahead',
      theme: SLIDE_THEMES[10],
      icon: Briefcase,
      openings: PRACTICE_SETTINGS.currentOpenings,
      capacity: PRACTICE_SETTINGS.capacity,
      utilizationRate: Math.round(((PRACTICE_SETTINGS.capacity - PRACTICE_SETTINGS.currentOpenings) / PRACTICE_SETTINGS.capacity) * 100),
    },

    // 12. Closing
    { type: 'closing', theme: SLIDE_THEMES[11] },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setCurrentSlide(0), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <>
      {/* Trigger Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        <div
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
          className="relative h-full rounded-[20px] overflow-hidden flex flex-col border border-amber-500/30 shadow-xl group cursor-pointer transition-all duration-300 hover:shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(180, 83, 9, 0.95) 0%, rgba(124, 45, 18, 0.98) 50%, rgba(67, 20, 7, 0.99) 100%)',
          }}
        >
          {/* Animated sparkle background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-8 w-2 h-2 bg-amber-300 rounded-full animate-pulse opacity-60" />
            <div className="absolute top-12 right-4 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-8 right-16 w-1 h-1 bg-yellow-200 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-6 w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.7s' }} />
          </div>

          <div className="flex flex-col h-full p-4 sm:p-5 relative z-10">
            {/* Badge */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-400/20 text-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">
                  New
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl xl:text-3xl font-semibold text-white mb-2 sm:mb-4">
              {monthName} Review
            </h2>

            {/* Description */}
            <p
              className="text-base sm:text-lg xl:text-xl text-amber-100/80 leading-relaxed mb-4 xl:mb-6"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Your practice wrapped. See how {monthName} shaped up with personalized insights.
            </p>

            {/* Preview Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:gap-6">
              <div>
                <span className="text-3xl sm:text-4xl xl:text-5xl font-semibold text-white">
                  {metrics.revenue.formatted}
                </span>
                <p className="text-sm sm:text-base xl:text-lg text-amber-200/70 mt-0.5 sm:mt-1">revenue</p>
              </div>
              <div className="w-px h-12 sm:h-14 xl:h-16 bg-amber-500/30" />
              <div>
                <span className="text-3xl sm:text-4xl xl:text-5xl font-semibold text-white">
                  {metrics.sessions.completed}
                </span>
                <p className="text-sm sm:text-base xl:text-lg text-amber-200/70 mt-0.5 sm:mt-1">sessions</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-auto pt-4">
              <div className="w-full py-3 xl:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm xl:text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-white/20">
                View Your Review
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

            {/* Content Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full max-w-lg max-h-[90vh] mx-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Slide Container */}
              <div className="flex-1 relative overflow-hidden rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-0 ${slides[currentSlide].type === 'intro' ? 'bg-black' : `bg-gradient-to-br ${slides[currentSlide].theme.bg}`} flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
                    onClick={handleNext}
                  >
                    {/* Intro slide - full bleed image */}
                    {slides[currentSlide].type === 'intro' ? (
                      <>
                        <img
                          src="/wrapped/intro.png"
                          alt="Monthly Review Intro"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        {/* Tap hint */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="absolute bottom-8 text-white/40 text-sm z-10"
                        >
                          Tap to continue
                        </motion.p>
                      </>
                    ) : (
                      <>
                        {/* Decorative elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                        </div>

                        {/* Slide Content */}
                        <div className="relative z-10 text-center max-w-sm w-full p-8">
                          {renderSlide(slides[currentSlide], monthName, year, handleClose)}
                        </div>

                        {/* Tap hint */}
                        {currentSlide < slides.length - 1 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-8 text-white/40 text-sm"
                          >
                            Tap to continue
                          </motion.p>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="py-4 px-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white/40 text-xs text-center mt-2">
                  {currentSlide + 1} of {slides.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Types
interface SlideData {
  type: string;
  theme: { bg: string; accent: string };
  icon?: React.ComponentType<{ className?: string }>;
  [key: string]: unknown;
}

// Render the appropriate slide based on type
function renderSlide(slide: SlideData, monthName: string, year: number, onClose: () => void) {
  switch (slide.type) {
    case 'intro':
      return <IntroSlide monthName={monthName} year={year} />;
    case 'revenue':
      return <RevenueSlide slide={slide} />;
    case 'sessions':
      return <SessionsSlide slide={slide} />;
    case 'new-clients':
      return <NewClientsSlide slide={slide} />;
    case 'retention':
      return <RetentionSlide slide={slide} />;
    case 'attendance':
      return <AttendanceSlide slide={slide} />;
    case 'mvp':
      return <MVPSlide slide={slide} />;
    case 'team':
      return <TeamSlide slide={slide} />;
    case 'heads-up':
      return <HeadsUpSlide slide={slide} />;
    case 'compliance':
      return <ComplianceSlide slide={slide} />;
    case 'looking-ahead':
      return <LookingAheadSlide slide={slide} />;
    case 'closing':
      return <ClosingSlide monthName={monthName} onClose={onClose} />;
    default:
      return null;
  }
}

// ============ SLIDE COMPONENTS ============

const IntroSlide: React.FC<{ monthName: string; year: number }> = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0"
  >
    <img
      src="/wrapped/intro.png"
      alt="Monthly Review Intro"
      className="w-full h-full object-cover"
    />
  </motion.div>
);

const RevenueSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { value, hitGoal, vsGoal, change, goalAmount } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${hitGoal ? 'bg-emerald-500/20' : 'bg-white/10'}`}
      >
        {hitGoal ? (
          <Target className="w-8 h-8 text-emerald-400" />
        ) : (
          <DollarSign className="w-8 h-8 text-white/80" />
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-2"
      >
        {hitGoal ? 'You hit your goal!' : 'Your practice earned'}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-6xl sm:text-7xl font-bold text-white mb-2"
      >
        {value as string}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg"
      >
        in revenue
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 space-y-2"
      >
        <div className={`px-4 py-2 rounded-full inline-flex items-center gap-2 ${hitGoal ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
          <span className={`text-sm ${hitGoal ? 'text-emerald-400' : 'text-white/70'}`}>
            {Math.round(vsGoal as number)}% of {goalAmount as string} goal
          </span>
        </div>
        {change !== null && (
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            {(change as number) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span>{(change as number) >= 0 ? '+' : ''}{Math.round(change as number)}% vs last month</span>
          </div>
        )}
      </motion.div>
    </>
  );
};

const SessionsSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { value, hitGoal, vsGoal, change, goalAmount } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto"
      >
        <Calendar className="w-8 h-8 text-white/80" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-2"
      >
        Your team completed
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-6xl sm:text-7xl font-bold text-white mb-2"
      >
        {value as number}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg"
      >
        therapy sessions
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 space-y-2"
      >
        <div className={`px-4 py-2 rounded-full inline-flex items-center gap-2 ${hitGoal ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
          <span className={`text-sm ${hitGoal ? 'text-emerald-400' : 'text-white/70'}`}>
            {Math.round(vsGoal as number)}% of {goalAmount as number} goal
          </span>
        </div>
        {change !== null && (
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            {(change as number) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span>{(change as number) >= 0 ? '+' : ''}{Math.round(change as number)}% vs last month</span>
          </div>
        )}
      </motion.div>
    </>
  );
};

const NewClientsSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { value, totalActive, topAcquirer, topAcquirerCount } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 mx-auto"
      >
        <UserPlus className="w-8 h-8 text-cyan-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-2"
      >
        You welcomed
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-6xl sm:text-7xl font-bold text-white mb-2"
      >
        {value as number}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg"
      >
        new clients
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 space-y-3"
      >
        <div className="px-4 py-2 rounded-full bg-white/10 inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-white/60" />
          <span className="text-white/70 text-sm">{totalActive as number} active clients total</span>
        </div>
        {(topAcquirerCount as number) > 0 && (
          <p className="text-white/50 text-sm">
            {topAcquirer as string} brought in {topAcquirerCount as number} new clients
          </p>
        )}
      </motion.div>
    </>
  );
};

const RetentionSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { churned, netGrowth, isPositive } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${isPositive ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
      >
        <UserMinus className={`w-8 h-8 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-2"
      >
        {(churned as number) > 0 ? 'You lost' : 'No clients churned'}
      </motion.p>
      {(churned as number) > 0 && (
        <motion.h2
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="text-6xl sm:text-7xl font-bold text-rose-400 mb-2"
        >
          {churned as number}
        </motion.h2>
      )}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg"
      >
        {(churned as number) > 0 ? 'clients this month' : 'Great retention!'}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <div className={`px-4 py-3 rounded-xl ${isPositive ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{netGrowth as number} net client growth
          </p>
          <p className="text-white/50 text-sm mt-1">
            {isPositive ? 'Your practice is growing!' : 'Focus on retention next month'}
          </p>
        </div>
      </motion.div>
    </>
  );
};

const AttendanceSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { showRate, rebookRate, cancelRate } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 mx-auto"
      >
        <Clock className="w-8 h-8 text-amber-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-4"
      >
        Attendance Overview
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm uppercase tracking-wide mb-1">Show Rate</p>
          <p className="text-4xl font-bold text-white">{showRate as number}%</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl p-4">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Rebook Rate</p>
            <p className={`text-2xl font-bold ${(rebookRate as number) >= 85 ? 'text-emerald-400' : (rebookRate as number) >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
              {rebookRate as number}%
            </p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-4">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Cancel Rate</p>
            <p className={`text-2xl font-bold ${(cancelRate as number) <= 15 ? 'text-emerald-400' : (cancelRate as number) <= 25 ? 'text-amber-400' : 'text-rose-400'}`}>
              {cancelRate as number}%
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const MVPSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { name, revenue, sessions, clients } = slide;
  const firstName = (name as string).split(' ')[0];
  return (
    <>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 mx-auto"
      >
        <Award className="w-10 h-10 text-white" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-amber-200/80 text-lg mb-2 uppercase tracking-wide"
      >
        Top Performer
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-5xl sm:text-6xl font-bold text-white mb-4"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {firstName}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-6 mt-4"
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{revenue as string}</p>
          <p className="text-white/50 text-sm">revenue</p>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{sessions as number}</p>
          <p className="text-white/50 text-sm">sessions</p>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{clients as number}</p>
          <p className="text-white/50 text-sm">clients</p>
        </div>
      </motion.div>
    </>
  );
};

const TeamSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const clinicians = slide.clinicians as Array<{
    clinicianName: string;
    revenue: number;
    completedSessions: number;
  }>;
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-white/60 text-lg mb-4"
      >
        Team Breakdown
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {clinicians.map((c, i) => (
          <motion.div
            key={c.clinicianName}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-sm w-4">{i + 1}</span>
              <span className="text-white font-medium">{c.clinicianName.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/70 text-sm">{c.completedSessions} sessions</span>
              <span className="text-emerald-400 font-semibold">{formatCurrency(c.revenue)}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

const HeadsUpSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { message } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-6 mx-auto"
      >
        <AlertTriangle className="w-8 h-8 text-rose-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-rose-300 text-lg mb-4 uppercase tracking-wide"
      >
        Heads Up
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white text-xl leading-relaxed"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {message as string}
      </motion.p>
    </>
  );
};

const ComplianceSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { notesOverdue, isOnTrack } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${isOnTrack ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}
      >
        {isOnTrack ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        ) : (
          <FileText className="w-8 h-8 text-amber-400" />
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-2"
      >
        Notes Compliance
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className={`text-6xl sm:text-7xl font-bold mb-2 ${isOnTrack ? 'text-emerald-400' : 'text-amber-400'}`}
      >
        {notesOverdue as number}%
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg"
      >
        notes overdue
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/40 text-sm mt-4"
      >
        {isOnTrack ? 'Great job staying on top of documentation!' : 'Goal is under 10%. Consider a documentation sprint.'}
      </motion.p>
    </>
  );
};

const LookingAheadSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const { openings, capacity, utilizationRate } = slide;
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-6 mx-auto"
      >
        <Briefcase className="w-8 h-8 text-teal-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-lg mb-4"
      >
        Looking Ahead
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm uppercase tracking-wide mb-1">Current Capacity</p>
          <p className="text-3xl font-bold text-white">{utilizationRate as number}%</p>
          <p className="text-white/50 text-sm mt-1">
            {(capacity as number) - (openings as number)} of {capacity as number} slots filled
          </p>
        </div>
        <div className="bg-teal-500/20 rounded-xl p-4">
          <p className="text-teal-300 text-sm uppercase tracking-wide mb-1">Open Slots</p>
          <p className="text-4xl font-bold text-teal-400">{openings as number}</p>
          <p className="text-white/50 text-sm mt-1">Ready for new clients</p>
        </div>
      </motion.div>
    </>
  );
};

const ClosingSlide: React.FC<{ monthName: string; onClose: () => void }> = ({ monthName, onClose }) => (
  <>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 mx-auto"
    >
      <Heart className="w-10 h-10 text-white" />
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-4xl sm:text-5xl font-bold text-white mb-4"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      Great work!
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-white/70 text-lg mb-8"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      You made a difference for your clients in {monthName}. Here's to an even better month ahead.
    </motion.p>
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="px-8 py-4 bg-white text-stone-900 font-semibold rounded-2xl hover:bg-white/90 transition-colors flex items-center gap-2 mx-auto"
    >
      Done
      <ChevronRight className="w-5 h-5" />
    </motion.button>
  </>
);

export default MonthlyReviewCard;
