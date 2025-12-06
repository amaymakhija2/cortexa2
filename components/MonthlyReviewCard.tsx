import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, X, ArrowRight, TrendingUp, Users, DollarSign, Award, Heart, Calendar } from 'lucide-react';
import { calculateDashboardMetrics, getClinicianMetricsForMonth, formatCurrency, getMonthlyData } from '../data/metricsCalculator';

interface MonthlyReviewCardProps {
  month: number; // 0-11
  year: number;
  index?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Slide backgrounds - warm, celebratory gradients
const SLIDE_THEMES = [
  { bg: 'from-amber-900 via-orange-900 to-rose-900', accent: 'amber' },
  { bg: 'from-emerald-900 via-teal-900 to-cyan-900', accent: 'emerald' },
  { bg: 'from-violet-900 via-purple-900 to-fuchsia-900', accent: 'violet' },
  { bg: 'from-rose-900 via-pink-900 to-orange-900', accent: 'rose' },
  { bg: 'from-blue-900 via-indigo-900 to-violet-900', accent: 'blue' },
  { bg: 'from-teal-900 via-emerald-900 to-green-900', accent: 'teal' },
];

export const MonthlyReviewCard: React.FC<MonthlyReviewCardProps> = ({
  month,
  year,
  index = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Calculate metrics for the month
  const metrics = calculateDashboardMetrics(month, year);
  const clinicianMetrics = getClinicianMetricsForMonth(month, year);
  const monthlyData = getMonthlyData(6);

  // Find top performer
  const topClinician = clinicianMetrics.reduce((prev, current) =>
    (prev.revenue > current.revenue) ? prev : current
  , clinicianMetrics[0]);

  // Calculate month-over-month changes
  const currentMonthData = monthlyData.find(m => m.monthNum === month && m.year === year);
  const prevMonthData = monthlyData.find(m => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return m.monthNum === prevMonth && m.year === prevYear;
  });

  const revenueChange = prevMonthData
    ? ((metrics.revenue.value - prevMonthData.revenue) / prevMonthData.revenue * 100).toFixed(0)
    : null;

  const sessionsChange = prevMonthData
    ? ((metrics.sessions.completed - prevMonthData.sessions) / prevMonthData.sessions * 100).toFixed(0)
    : null;

  const monthName = MONTH_NAMES[month];

  // Build slides data
  const slides = [
    // Intro
    {
      type: 'intro',
      theme: SLIDE_THEMES[0],
    },
    // Revenue
    {
      type: 'metric',
      theme: SLIDE_THEMES[1],
      icon: DollarSign,
      preText: 'Your practice earned',
      value: metrics.revenue.formatted,
      postText: 'in revenue',
      subtext: revenueChange ? `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}% vs last month` : undefined,
    },
    // Sessions
    {
      type: 'metric',
      theme: SLIDE_THEMES[2],
      icon: Calendar,
      preText: 'Your team completed',
      value: metrics.sessions.completed.toString(),
      postText: 'therapy sessions',
      subtext: sessionsChange ? `${Number(sessionsChange) >= 0 ? '+' : ''}${sessionsChange}% vs last month` : undefined,
    },
    // Clients
    {
      type: 'metric',
      theme: SLIDE_THEMES[3],
      icon: Users,
      preText: 'You welcomed',
      value: metrics.clients.new.toString(),
      postText: 'new clients',
      subtext: `${metrics.clients.active} active clients total`,
    },
    // Top Performer
    {
      type: 'spotlight',
      theme: SLIDE_THEMES[4],
      icon: Award,
      preText: 'Top performer',
      value: topClinician?.clinicianName?.split(' ')[1] || 'Star Clinician',
      postText: `${formatCurrency(topClinician?.revenue || 0)} revenue`,
      subtext: `${topClinician?.completedSessions || 0} sessions completed`,
    },
    // Closing
    {
      type: 'closing',
      theme: SLIDE_THEMES[5],
    },
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
              Your practice wrapped. See how {monthName} shaped up with personalized insights just for you.
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
                    className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].theme.bg} flex flex-col items-center justify-center p-8 cursor-pointer`}
                    onClick={handleNext}
                  >
                    {/* Decorative elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                      {/* Floating particles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white/30 rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 3) * 30}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>

                    {/* Slide Content */}
                    <div className="relative z-10 text-center max-w-sm">
                      {slides[currentSlide].type === 'intro' && (
                        <IntroSlide monthName={monthName} year={year} />
                      )}
                      {slides[currentSlide].type === 'metric' && (
                        <MetricSlide slide={slides[currentSlide]} />
                      )}
                      {slides[currentSlide].type === 'spotlight' && (
                        <SpotlightSlide slide={slides[currentSlide]} />
                      )}
                      {slides[currentSlide].type === 'closing' && (
                        <ClosingSlide monthName={monthName} onClose={handleClose} />
                      )}
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
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 py-4">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === idx
                        ? 'w-8 h-2 bg-white'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Intro Slide Component
const IntroSlide: React.FC<{ monthName: string; year: number }> = ({ monthName, year }) => (
  <>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-8"
    >
      <Sparkles className="w-10 h-10 text-amber-300" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-amber-200/80 text-lg mb-2 tracking-wide uppercase"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      Your Practice
    </motion.p>
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-5xl sm:text-6xl font-bold text-white mb-4"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {monthName}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="text-2xl text-white/60"
    >
      {year}
    </motion.p>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-white/50 text-base mt-8"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      Let's see how you did
    </motion.p>
  </>
);

// Metric Slide Component
interface SlideData {
  icon?: React.ComponentType<{ className?: string }>;
  preText?: string;
  value?: string;
  postText?: string;
  subtext?: string;
}

const MetricSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const Icon = slide.icon;
  return (
    <>
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6"
        >
          <Icon className="w-8 h-8 text-white/80" />
        </motion.div>
      )}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/70 text-xl mb-2"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {slide.preText}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-7xl sm:text-8xl font-bold text-white mb-2"
      >
        {slide.value}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/70 text-xl"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {slide.postText}
      </motion.p>
      {slide.subtext && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 px-4 py-2 rounded-full bg-white/10 inline-flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-white/80 text-sm">{slide.subtext}</span>
        </motion.div>
      )}
    </>
  );
};

// Spotlight Slide Component
const SpotlightSlide: React.FC<{ slide: SlideData }> = ({ slide }) => {
  const Icon = slide.icon;
  return (
    <>
      {Icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>
      )}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-amber-200/80 text-lg mb-2 uppercase tracking-wide"
      >
        {slide.preText}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="text-5xl sm:text-6xl font-bold text-white mb-4"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {slide.value}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl text-white/70"
      >
        {slide.postText}
      </motion.p>
      {slide.subtext && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/50 text-base mt-4"
        >
          {slide.subtext}
        </motion.p>
      )}
    </>
  );
};

// Closing Slide Component
const ClosingSlide: React.FC<{ monthName: string; onClose: () => void }> = ({ monthName, onClose }) => (
  <>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
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
      You helped countless clients on their journey in {monthName}. Here's to an even better month ahead.
    </motion.p>
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="px-8 py-4 bg-white text-stone-900 font-semibold rounded-2xl hover:bg-white/90 transition-colors flex items-center gap-2"
    >
      Done
      <ChevronRight className="w-5 h-5" />
    </motion.button>
  </>
);

export default MonthlyReviewCard;
