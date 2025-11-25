import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, AlertTriangle, TrendingUp, Clock } from "lucide-react"

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
    label: "Urgent",
    color: "#b91c1c",
    colorLight: "#fef2f2",
    colorMuted: "#fca5a5",
    gradient: "from-red-600 to-rose-700",
    icon: AlertTriangle,
    accentBorder: "border-l-red-500",
    topBar: "from-red-500 to-rose-600"
  },
  warning: {
    label: "Attention",
    color: "#b45309",
    colorLight: "#fffbeb",
    colorMuted: "#fcd34d",
    gradient: "from-amber-500 to-orange-600",
    icon: Clock,
    accentBorder: "border-l-amber-500",
    topBar: "from-amber-500 to-orange-500"
  },
  good: {
    label: "Opportunity",
    color: "#047857",
    colorLight: "#ecfdf5",
    colorMuted: "#6ee7b7",
    gradient: "from-emerald-500 to-teal-600",
    icon: TrendingUp,
    accentBorder: "border-l-emerald-500",
    topBar: "from-emerald-500 to-teal-500"
  }
}

// Elegant pill for session counts
const SessionPill: React.FC<{ count: number; isLast: boolean; isDropPoint: boolean; isEmpty: boolean }> = ({
  count, isLast, isDropPoint, isEmpty
}) => (
  <div className={`
    w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold
    transition-all duration-300
    ${isEmpty
      ? 'bg-stone-100 text-stone-300'
      : isDropPoint
        ? 'bg-red-500 text-white'
        : 'bg-stone-800 text-white'
    }
  `}>
    {isEmpty ? '–' : count}
  </div>
)

// Minimal horizontal bar
const HorizontalBar: React.FC<{ value: number; max: number; label: string; highlight?: boolean; color: string }> = ({
  value, max, label, highlight, color
}) => {
  const percentage = (value / max) * 100
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-base font-medium text-stone-600 truncate">{label}</span>
      <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className={`h-full rounded-full ${highlight ? `bg-gradient-to-r ${color}` : 'bg-stone-300'}`}
        />
      </div>
      <span className={`w-12 text-right text-base font-bold ${highlight ? 'text-stone-900' : 'text-stone-500'}`}>
        {value}
      </span>
    </div>
  )
}

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
  const StatusIcon = config.icon

  // Extract the key metric
  const getMetric = () => {
    if (type === "retention" && retentionData) {
      const lost = retentionData.filter((c: any) => c.dropped).length
      const total = retentionData.length
      return { value: `${lost}/${total}`, label: "clients lost" }
    }
    if (type === "cancellations" && chartData) {
      const latest = chartData[chartData.length - 1]
      const prev = chartData[chartData.length - 2]
      const change = prev ? Math.round(((latest.cancellations - prev.cancellations) / prev.cancellations) * 100) : 0
      return { value: latest?.cancellations, label: "this month", change: change > 0 ? `+${change}%` : null }
    }
    if (type === "accounts-receivable" && accountsReceivableData) {
      const total = accountsReceivableData.reduce((sum: number, item: any) => sum + item.amount, 0)
      return { value: `$${(total / 1000).toFixed(1)}k`, label: "outstanding" }
    }
    if (type === "slots" && chartData) {
      const total = chartData.reduce((sum: number, item: any) => sum + item.slots, 0)
      return { value: total, label: "open slots" }
    }
    return null
  }

  const metric = getMetric()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full group"
    >
      <div className="h-full bg-white rounded-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col border border-stone-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.1)] transition-shadow duration-500">

        {/* Bold top color bar for instant recognition */}
        <div className={`h-2 bg-gradient-to-r ${config.topBar}`} />

        <div className="flex flex-col h-full">

          {/* Top Section: Compact Header with Status + Title + Metric */}
          <div className="px-8 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Status Badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.colorLight }}
                  >
                    <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  {dueToday && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Today</span>
                    </>
                  )}
                </div>

                {/* Title & Description */}
                <h2 className="text-xl font-semibold text-stone-900 leading-snug tracking-tight">
                  {title}
                </h2>
                <p className="text-sm text-stone-500 mt-1 font-medium">
                  {description}
                </p>
              </div>

              {/* Hero Metric - Compact */}
              {metric && (
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span
                      className="text-4xl font-black tracking-tight tabular-nums"
                      style={{ color: config.color }}
                    >
                      {metric.value}
                    </span>
                    {metric.change && (
                      <span className="text-sm font-bold text-red-500">{metric.change}</span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 font-medium">{metric.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* HERO: AI Insight - The Main Event */}
          <div className="px-8 py-5 bg-stone-50 border-y border-stone-100">
            <div className={`relative pl-5 border-l-[3px] ${config.accentBorder}`}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.15em]">
                    AI Insight
                  </span>
                </div>
                <p
                  className="text-[15px] text-stone-700 leading-[1.65]"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  {aiGuidance}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Visualization Area - Compact */}
          <div className="flex-1 min-h-0 px-8 py-4 overflow-hidden">

            {/* RETENTION: Clean session matrix */}
            {type === "retention" && retentionData && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-6 mb-4 pl-28">
                  {['Jun', 'Jul', 'Aug', 'Sep'].map(month => (
                    <span key={month} className="w-11 text-center text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      {month}
                    </span>
                  ))}
                </div>
                <div className="space-y-3 flex-1 overflow-hidden">
                  {retentionData.slice(0, 5).map((client: any) => {
                    const dropIndex = client.sessions.findIndex((s: any) => s.month === client.droppedAfter)
                    return (
                      <div key={client.id} className="flex items-center gap-6">
                        <span className="w-24 text-base font-medium text-stone-700 truncate">
                          {client.id}
                        </span>
                        <div className="flex items-center gap-2">
                          {client.sessions.map((session: any, idx: number) => (
                            <SessionPill
                              key={idx}
                              count={session.count}
                              isLast={idx === client.sessions.length - 1}
                              isDropPoint={client.dropped && idx === dropIndex}
                              isEmpty={session.count === 0}
                            />
                          ))}
                        </div>
                        <span className={`
                          ml-auto text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full
                          ${client.dropped ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}
                        `}>
                          {client.dropped ? 'Lost' : 'Active'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CANCELLATIONS: Trend bars */}
            {type === "cancellations" && chartData && (
              <div className="h-full flex flex-col">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-5">Monthly Trend</p>
                <div className="flex items-end gap-4 h-32 mb-6">
                  {chartData.map((item: any, idx: number) => {
                    const maxVal = Math.max(...chartData.map((d: any) => d.cancellations))
                    const height = (item.cancellations / maxVal) * 100
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <span className={`text-lg font-bold ${item.isSpike ? 'text-red-600' : 'text-stone-600'}`}>
                          {item.cancellations}
                        </span>
                        <div className="w-full h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * idx, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className={`w-full rounded-t-xl ${item.isSpike ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-stone-200'}`}
                          />
                        </div>
                        <span className="text-sm font-medium text-stone-400">{item.month?.slice(0, 3)}</span>
                      </div>
                    )
                  })}
                </div>

                {chartData2 && (
                  <>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">By Clinician</p>
                    <div className="space-y-3">
                      {chartData2.slice(0, 4).map((item: any, idx: number) => (
                        <HorizontalBar
                          key={idx}
                          value={item.cancellations}
                          max={Math.max(...chartData2.map((d: any) => d.cancellations))}
                          label={item.name}
                          highlight={item.isSpike}
                          color={config.gradient}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ACCOUNTS RECEIVABLE: Clean list */}
            {type === "accounts-receivable" && accountsReceivableData && (
              <div className="h-full flex flex-col">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-5">Outstanding by Age</p>
                <div className="space-y-2 flex-1 overflow-hidden">
                  {accountsReceivableData.slice(0, 6).map((item: any, idx: number) => {
                    const urgency = item.daysOutstanding >= 30 ? 'critical' : item.daysOutstanding >= 20 ? 'warning' : 'ok'
                    return (
                      <div
                        key={idx}
                        className={`
                          flex items-center justify-between p-4 rounded-2xl
                          ${urgency === 'critical' ? 'bg-red-50' : urgency === 'warning' ? 'bg-amber-50' : 'bg-stone-50'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-2.5 h-2.5 rounded-full
                            ${urgency === 'critical' ? 'bg-red-500' : urgency === 'warning' ? 'bg-amber-500' : 'bg-stone-300'}
                          `} />
                          <div>
                            <p className="text-base font-semibold text-stone-800">{item.client}</p>
                            <p className="text-sm text-stone-400">{item.clinician}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-lg font-bold text-stone-800 tabular-nums">
                            ${item.amount.toLocaleString()}
                          </span>
                          <span className={`
                            text-sm font-bold tabular-nums px-3 py-1 rounded-full
                            ${urgency === 'critical' ? 'bg-red-100 text-red-600' : urgency === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}
                          `}>
                            {item.daysOutstanding}d
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SLOTS: Horizontal bars */}
            {type === "slots" && chartData && (
              <div className="h-full flex flex-col justify-center">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6">Available by Clinician</p>
                <div className="space-y-4">
                  {chartData.map((item: any, idx: number) => (
                    <HorizontalBar
                      key={idx}
                      value={item.slots}
                      max={Math.max(...chartData.map((d: any) => d.slots))}
                      label={item.name}
                      highlight={idx < 2}
                      color={config.gradient}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button - Refined */}
          <div className="px-8 pb-7 pt-4 mt-auto">
            <button
              className={`
                w-full py-4 px-6
                bg-gradient-to-r ${config.gradient}
                hover:brightness-110 active:brightness-95
                text-white text-[15px] font-semibold
                rounded-2xl
                transition-all duration-300
                flex items-center justify-center gap-2.5
                shadow-lg shadow-stone-900/10
                group
              `}
            >
              {action}
              <ArrowRight className="w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
