import React from "react"
import { motion } from "framer-motion"

interface SimpleAlertCardProps {
  index: number
  title: string
  aiGuidance: string
  action: string
  status: "critical" | "warning" | "good" | "insight"
  stats: {
    value: number | string
    label: string
    color?: "red" | "amber" | "emerald" | "white" | "blue"
  }[]
  comparisonText?: string
}

const statusConfig = {
  critical: {
    label: "CRITICAL",
    color: "#ef4444",
    badgeBg: "rgba(239, 68, 68, 0.2)",
    badgeBorder: "rgba(239, 68, 68, 0.5)",
    buttonBg: "#dc2626",
    buttonShadow: "0 4px 20px rgba(220, 38, 38, 0.35)",
  },
  warning: {
    label: "ATTENTION",
    color: "#fbbf24",
    badgeBg: "rgba(251, 191, 36, 0.18)",
    badgeBorder: "rgba(251, 191, 36, 0.45)",
    buttonBg: "#d97706",
    buttonShadow: "0 4px 20px rgba(217, 119, 6, 0.35)",
  },
  good: {
    label: "OPPORTUNITY",
    color: "#34d399",
    badgeBg: "rgba(52, 211, 153, 0.18)",
    badgeBorder: "rgba(52, 211, 153, 0.45)",
    buttonBg: "#059669",
    buttonShadow: "0 4px 20px rgba(5, 150, 105, 0.35)",
  },
  insight: {
    label: "INSIGHT",
    color: "#60a5fa",
    badgeBg: "rgba(96, 165, 250, 0.18)",
    badgeBorder: "rgba(96, 165, 250, 0.45)",
    buttonBg: "#2563eb",
    buttonShadow: "0 4px 20px rgba(37, 99, 235, 0.35)",
  }
}

const colorMap = {
  red: "#dc2626",
  amber: "#f59e0b",
  emerald: "#10b981",
  white: "#ffffff",
  blue: "#60a5fa"
}

export const SimpleAlertCard: React.FC<SimpleAlertCardProps> = ({
  index,
  title,
  aiGuidance,
  action,
  status,
  stats,
  comparisonText,
}) => {
  const config = statusConfig[status]

  // Get default comparison text based on status/context
  const getDefaultComparison = () => {
    if (title.toLowerCase().includes('retention')) return "Practice average: 80%"
    if (title.toLowerCase().includes('cancel')) return "Team average: 2-3/month"
    if (title.toLowerCase().includes('receivable') || title.toLowerCase().includes('ar')) return "Best practice: <7 days"
    if (title.toLowerCase().includes('slot') || title.toLowerCase().includes('open')) return "Utilization: 72%"
    return null
  }

  const comparison = comparisonText || getDefaultComparison()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="h-full"
    >
      <div
        className="h-full rounded-[24px] overflow-hidden flex flex-col relative"
        style={{
          background: 'linear-gradient(165deg, #0c0c0c 0%, #111111 40%, #0a0a0a 100%)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Subtle top highlight for depth */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 100%)',
          }}
        />

        <div className="flex flex-col h-full p-6 sm:p-7 lg:p-8 relative z-10">

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.08, duration: 0.35 }}
            className="mb-5 sm:mb-6"
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-bold tracking-[0.1em]"
              style={{
                color: config.color,
                backgroundColor: config.badgeBg,
                border: `1px solid ${config.badgeBorder}`,
              }}
            >
              {config.label}
            </span>
          </motion.div>

          {/* Title - Editorial Serif */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.12, duration: 0.45 }}
            className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-white leading-[1.15] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              letterSpacing: '-0.015em',
            }}
          >
            {title}
          </motion.h2>

          {/* AI Guidance */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.16, duration: 0.45 }}
            className="text-[16px] sm:text-[17px] lg:text-[18px] leading-[1.65] mb-6 sm:mb-8 text-white"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 400,
            }}
          >
            {aiGuidance}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.22, duration: 0.45 }}
            className="flex items-baseline gap-6 sm:gap-8 lg:gap-10 mb-auto"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span
                  className="text-[32px] sm:text-[36px] lg:text-[40px] font-bold tracking-tight"
                  style={{
                    color: colorMap[stat.color || 'white'],
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  {stat.value}
                </span>
                {stat.label && (
                  <span
                    className="text-[14px] sm:text-[15px] mt-1.5 font-medium tracking-wide uppercase"
                    style={{ color: '#a8a29e' }}
                  >
                    {stat.label}
                  </span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Bottom: Comparison + Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.45 }}
            className="flex items-end justify-between mt-6 sm:mt-8 pt-5 sm:pt-6"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Comparison Text */}
            {comparison ? (
              <span
                className="text-[14px] sm:text-[15px] font-medium"
                style={{ color: '#78716c' }}
              >
                {comparison}
              </span>
            ) : (
              <div />
            )}

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[14px] sm:text-[15px] font-semibold text-white transition-all duration-300"
              style={{
                backgroundColor: config.buttonBg,
                boxShadow: config.buttonShadow,
              }}
            >
              {action}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
