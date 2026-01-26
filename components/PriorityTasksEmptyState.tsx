import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

// =============================================================================
// PRIORITY TASKS EMPTY STATE
// =============================================================================
// A serene, confident card displayed when there are no priority tasks.
// Mirrors the SimpleAlertCard structure exactly but communicates calm.
// Design direction: Editorial minimalism with a breath of fresh air.
// =============================================================================

interface PriorityTasksEmptyStateProps {
  /** Index for staggered animation */
  index?: number;
}

export const PriorityTasksEmptyState: React.FC<PriorityTasksEmptyStateProps> = ({
  index = 0,
}) => {
  const baseDelay = index * 0.1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: baseDelay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="h-full"
    >
      <div
        className="h-full relative rounded-3xl overflow-hidden bg-white transition-shadow duration-500 ease-out"
        style={{
          border: '1px solid rgba(231, 229, 228, 0.8)',
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Subtle grain - matching SimpleAlertCard */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle emerald wash - barely there, just enough warmth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(16, 185, 129, 0.03) 0%, transparent 60%)',
          }}
        />

        {/* Content - exact same structure as SimpleAlertCard */}
        <div className="relative h-full flex flex-col p-7 sm:p-8 lg:p-9">

          {/* Status - minimal: dot and quiet label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.1, duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10b981' }}
            />
            <span
              className="text-[11px] font-medium tracking-[0.06em] uppercase"
              style={{ color: '#a8a29e' }}
            >
              All clear
            </span>
          </motion.div>

          {/* Title - Editorial serif, same as SimpleAlertCard */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[24px] sm:text-[27px] lg:text-[30px] leading-[1.15] mb-4 tracking-[-0.015em]"
            style={{
              fontFamily: "'Tiempos Headline', Georgia, serif",
              fontWeight: 500,
              color: '#1c1917',
            }}
          >
            Nothing needs your attention
          </motion.h2>

          {/* Guidance narrative - same styling as SimpleAlertCard */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.22, duration: 0.5 }}
            className="text-[17px] sm:text-[18px] lg:text-[19px] leading-[1.65] flex-grow"
            style={{
              fontFamily: "'Suisse Intl', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
              color: '#57534e',
            }}
          >
            Your practice is running smoothly. When priorities emerge—revenue patterns, client engagement, or operational needs—they'll surface here automatically.
          </motion.p>

          {/* Footer - CTA-style badge, right-aligned like SimpleAlertCard button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.4, duration: 0.5 }}
            className="flex items-center justify-end mt-auto pt-6"
          >
            {/* CTA-style badge - looks like a button but isn't clickable */}
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4), 0 4px 12px -4px rgba(16, 185, 129, 0.2)',
                fontFamily: "'Suisse Intl', sans-serif",
              }}
            >
              <Leaf size={14} style={{ color: 'rgba(255,255,255,0.9)' }} strokeWidth={2} />
              <span
                className="text-[13px] sm:text-[14px] font-medium"
                style={{ color: '#ffffff' }}
              >
                Practice healthy
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

export default PriorityTasksEmptyState;
