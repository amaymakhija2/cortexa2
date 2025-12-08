import React from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface PriorityTaskProps {
  index: number
  title: string
  description: string
  aiGuidance: string
  impact: string
  action: string
  status: "good" | "warning" | "critical"
  dueToday?: boolean
  chartData?: any[]
  chartData2?: any[]
  type?: "retention" | "slots" | "cancellations" | "accounts-receivable" | "default"
  retentionData?: any[]
  accountsReceivableData?: any[]
  onExplore?: () => void
}

const statusConfig = {
  critical: {
    label: "CRITICAL",
    color: "#dc2626",
    badgeBg: "rgba(220, 38, 38, 0.15)",
    badgeBorder: "rgba(220, 38, 38, 0.3)",
  },
  warning: {
    label: "ATTENTION",
    color: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeBorder: "rgba(245, 158, 11, 0.3)",
  },
  good: {
    label: "OPPORTUNITY",
    color: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeBorder: "rgba(16, 185, 129, 0.3)",
  }
}

// Stat item component for the stats row
const StatItem: React.FC<{
  value: string | number
  label: string
  highlight?: boolean
  color?: string
}> = ({ value, label, highlight, color }) => (
  <div className="flex flex-col items-start">
    <span
      className="text-4xl font-bold tracking-tight"
      style={{
        color: highlight ? (color || '#dc2626') : '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      {value}
    </span>
    <span className="text-sm text-stone-500 mt-1">{label}</span>
  </div>
)

export const PriorityTaskCard: React.FC<PriorityTaskProps> = ({
  index,
  title,
  description,
  aiGuidance,
  action,
  status,
  dueToday,
  type = "default",
  retentionData,
  accountsReceivableData,
  chartData,
  chartData2,
}) => {
  const config = statusConfig[status]

  // Extract stats based on card type
  const getStats = () => {
    if (type === "retention" && retentionData) {
      const total = retentionData.length
      const lost = retentionData.filter((c: any) => c.dropped).length
      const dropOffRate = Math.round((lost / total) * 100)
      return [
        { value: `${total} new`, label: "", highlight: false },
        { value: `${lost} lost`, label: "", highlight: true },
        { value: `${dropOffRate}% drop-off`, label: "", highlight: true }
      ]
    }
    if (type === "cancellations" && chartData) {
      const latest = chartData[chartData.length - 1]
      const total = chartData.reduce((sum: number, d: any) => sum + d.cancellations, 0)
      return [
        { value: `${total}`, label: "this month", highlight: false },
        { value: `${latest?.cancellations || 0}`, label: "this week", highlight: true },
        { value: `2x`, label: "vs baseline", highlight: true }
      ]
    }
    if (type === "accounts-receivable" && accountsReceivableData) {
      const total = accountsReceivableData.reduce((sum: number, item: any) => sum + item.amount, 0)
      const count = accountsReceivableData.length
      const oldest = Math.max(...accountsReceivableData.map((d: any) => d.daysOutstanding))
      return [
        { value: `$${(total / 1000).toFixed(1)}k`, label: "outstanding", highlight: true },
        { value: `${count}`, label: "clients", highlight: false },
        { value: `${oldest}d`, label: "oldest", highlight: true }
      ]
    }
    if (type === "slots" && chartData) {
      const total = chartData.reduce((sum: number, item: any) => sum + item.slots, 0)
      const clinicians = chartData.length
      return [
        { value: `${total}`, label: "open slots", highlight: false },
        { value: `${clinicians}`, label: "clinicians", highlight: false },
        { value: `This week`, label: "", highlight: false }
      ]
    }
    return null
  }

  // Get comparison text (practice average, etc.)
  const getComparison = () => {
    if (type === "retention") return "Practice average: 15%"
    if (type === "cancellations") return "Team average: 3/month"
    if (type === "accounts-receivable") return "Best practice: <7 days"
    if (type === "slots") return "Utilization: 72%"
    return null
  }

  const stats = getStats()
  const comparison = getComparison()

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.12,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="h-full"
    >
      <div
        className="h-full rounded-3xl overflow-hidden flex flex-col relative"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a 0%, #141414 50%, #0d0d0d 100%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Subtle gradient overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.02) 0%, transparent 50%)',
          }}
        />

        <div className="flex flex-col h-full p-8 relative z-10">

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.12 + 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-[0.15em]"
              style={{
                color: config.color,
                backgroundColor: config.badgeBg,
                border: `1px solid ${config.badgeBorder}`,
              }}
            >
              {config.label}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 + 0.15, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4"
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </motion.h2>

          {/* Description / AI Guidance as italic subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 + 0.2, duration: 0.5 }}
            className="text-lg text-stone-400 mb-8 leading-relaxed"
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontStyle: 'italic',
            }}
          >
            {description || aiGuidance}
          </motion.p>

          {/* Stats Row */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 + 0.25, duration: 0.5 }}
              className="flex items-baseline gap-10 mb-auto"
            >
              {stats.map((stat, idx) => (
                <StatItem
                  key={idx}
                  value={stat.value}
                  label={stat.label}
                  highlight={stat.highlight}
                  color={config.color}
                />
              ))}
            </motion.div>
          )}

          {/* Bottom section: Comparison + Action */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 + 0.35, duration: 0.5 }}
            className="flex items-end justify-between mt-8 pt-6"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Practice average / comparison text */}
            {comparison && (
              <span className="text-sm text-stone-500">
                {comparison}
              </span>
            )}
            {!comparison && <div />}

            {/* Action Button */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 flex items-center gap-2"
                style={{
                  backgroundColor: status === 'critical' ? '#dc2626' :
                                   status === 'warning' ? '#d97706' : '#059669',
                  boxShadow: status === 'critical'
                    ? '0 4px 16px rgba(220, 38, 38, 0.3)'
                    : status === 'warning'
                    ? '0 4px 16px rgba(217, 119, 6, 0.3)'
                    : '0 4px 16px rgba(5, 150, 105, 0.3)',
                }}
              >
                {action}
              </motion.button>

              {/* Sparkle decoration */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-stone-600"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
