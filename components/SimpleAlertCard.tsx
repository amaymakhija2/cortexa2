import React, { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { ArrowRight } from "lucide-react"

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

// Minimal status theme - just enough color to communicate, never shout
const statusTheme = {
  critical: {
    label: "Needs attention",
    dotColor: "#ef4444",
    glowColor: "251, 146, 60",
    buttonBg: "#292524", // Neutral dark - let urgency come from content
  },
  warning: {
    label: "Review",
    dotColor: "#f59e0b",
    glowColor: "251, 191, 36",
    buttonBg: "#292524",
  },
  good: {
    label: "Opportunity",
    dotColor: "#10b981",
    glowColor: "52, 211, 153",
    buttonBg: "#292524",
  },
  insight: {
    label: "Insight",
    dotColor: "#6366f1",
    glowColor: "99, 102, 241",
    buttonBg: "#292524",
  }
}

// Semantic stat colors - muted for light mode elegance
const statColors: Record<string, string> = {
  red: "#dc2626",
  amber: "#d97706",
  emerald: "#059669",
  white: "#1c1917",
  blue: "#2563eb"
}

// Animated counter for stats
function AnimatedStat({ value, color, delay }: { value: string | number; color: string; delay: number }) {
  const isNumeric = typeof value === 'number' || /^[\d.]+/.test(String(value))

  if (!isNumeric) {
    return <span style={{ color }}>{value}</span>
  }

  const numericPart = parseFloat(String(value).replace(/[^0-9.]/g, ''))
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || ''
  const suffix = String(value).match(/[^0-9.]*$/)?.[0] || ''

  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => `${prefix}${Math.round(v)}${suffix}`)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(motionValue, numericPart, {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      })
      return controls.stop
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [numericPart, motionValue, delay])

  return <motion.span style={{ color }}>{rounded}</motion.span>
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
  const theme = statusTheme[status]

  const baseDelay = index * 0.1

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
        className="h-full relative rounded-3xl overflow-hidden bg-white transition-shadow duration-500 ease-out hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]"
        style={{
          border: '1px solid rgba(231, 229, 228, 0.8)',
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-7 sm:p-8 lg:p-9">

          {/* Status - minimal: just a dot and quiet label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.1, duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.dotColor }}
            />
            <span
              className="text-[11px] font-medium tracking-[0.06em] uppercase"
              style={{ color: '#a8a29e' }}
            >
              {theme.label}
            </span>
          </motion.div>

          {/* Title - Editorial serif */}
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
            {title}
          </motion.h2>

          {/* Guidance narrative */}
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
            {aiGuidance}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.3, duration: 0.5 }}
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid #e7e5e4' }}
          >
            <div className="flex items-end gap-10 sm:gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span
                    className="text-[36px] sm:text-[42px] lg:text-[48px] font-light tracking-[-0.02em] leading-none"
                    style={{ fontFamily: "'Suisse Intl', sans-serif" }}
                  >
                    <AnimatedStat
                      value={stat.value}
                      color={statColors[stat.color || 'white']}
                      delay={baseDelay + 0.4 + idx * 0.1}
                    />
                  </span>
                  <span
                    className="text-[11px] sm:text-[12px] mt-2.5 font-medium tracking-[0.04em] uppercase"
                    style={{ color: '#a8a29e' }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.4, duration: 0.5 }}
            className="flex items-center justify-between mt-6 gap-4"
          >
            {comparisonText ? (
              <span
                className="text-[13px] sm:text-[14px]"
                style={{
                  color: '#78716c',
                  fontFamily: "'Suisse Intl', sans-serif",
                }}
              >
                {comparisonText}
              </span>
            ) : (
              <div />
            )}

            {/* Button - neutral dark, sophisticated */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="group/btn relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium overflow-hidden"
              style={{
                background: theme.buttonBg,
                color: '#FAFAF9',
                fontFamily: "'Suisse Intl', sans-serif",
                boxShadow: '0 2px 8px -2px rgba(0,0,0,0.2), 0 4px 12px -4px rgba(0,0,0,0.1)',
              }}
            >
              {/* Shimmer */}
              <span
                className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                }}
              />
              <span className="relative">{action}</span>
              <ArrowRight
                size={14}
                className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2}
              />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
