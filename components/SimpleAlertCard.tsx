import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface SimpleAlertCardProps {
  index: number
  title: string
  aiGuidance: string
  action: string
  status: "critical" | "warning" | "good"
  stats: {
    value: number | string
    label: string
    color?: "red" | "amber" | "emerald" | "white"
  }[]
}

const statusConfig = {
  critical: {
    label: "Urgent",
    accent: "bg-red-500",
    badge: "bg-red-500/15 text-red-400",
    button: "bg-red-500 hover:bg-red-400",
    ping: "bg-red-400",
    dot: "bg-red-500"
  },
  warning: {
    label: "Attention",
    accent: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-400",
    button: "bg-amber-500 hover:bg-amber-400",
    ping: "bg-amber-400",
    dot: "bg-amber-500"
  },
  good: {
    label: "Opportunity",
    accent: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400",
    button: "bg-emerald-500 hover:bg-emerald-400",
    ping: "bg-emerald-400",
    dot: "bg-emerald-500"
  }
}

const colorMap = {
  red: "text-red-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  white: "text-white"
}

export const SimpleAlertCard: React.FC<SimpleAlertCardProps> = ({
  index,
  title,
  aiGuidance,
  action,
  status,
  stats,
}) => {
  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div
        className="h-full rounded-[20px] overflow-hidden flex flex-col border border-stone-700/50 shadow-xl"
        style={{
          background: 'linear-gradient(145deg, rgba(41, 37, 36, 0.97) 0%, rgba(28, 25, 23, 0.98) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >

        {/* Accent line */}
        <div className={`h-1 ${config.accent}`} />

        <div className="flex flex-col h-full p-4 sm:p-5">

          {/* Badge */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${config.badge}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">
                {config.label}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-semibold text-white mb-2 sm:mb-4">
            {title}
          </h2>

          {/* Insight */}
          <p
            className="text-base sm:text-lg xl:text-xl text-stone-300 leading-relaxed mb-4 xl:mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {aiGuidance}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:gap-6">
            {stats.map((stat, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="w-px h-12 sm:h-14 xl:h-16 bg-stone-700" />}
                <div>
                  <span className={`text-3xl sm:text-4xl xl:text-5xl font-semibold ${colorMap[stat.color || 'white']}`}>
                    {stat.value}
                  </span>
                  <p className="text-sm sm:text-base xl:text-lg text-stone-400 mt-0.5 sm:mt-1">{stat.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Button - pinned to bottom */}
          <button className={`
            w-full py-3 xl:py-4 mt-auto
            ${config.button}
            text-white text-sm xl:text-base font-semibold
            rounded-xl
            transition-colors duration-200
            flex items-center justify-center gap-2
            group
          `}>
            {action}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
