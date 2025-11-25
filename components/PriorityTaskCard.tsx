import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

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
    color: "#dc2626",
    colorLight: "#fef2f2",
    gradient: "from-red-500 to-rose-600"
  },
  warning: {
    label: "Attention",
    color: "#d97706",
    colorLight: "#fffbeb",
    gradient: "from-amber-500 to-orange-500"
  },
  good: {
    label: "Opportunity",
    color: "#059669",
    colorLight: "#ecfdf5",
    gradient: "from-emerald-500 to-teal-500"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full"
    >
      <div className="h-full bg-white rounded-[28px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">

        {/* Top color bar */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

        <div className="flex flex-col h-full p-8">

          {/* Header: Status + Metric */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                {dueToday && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 leading-tight">
                {title}
              </h2>
              <p className="text-base text-stone-500 mt-1">
                {description}
              </p>
            </div>

            {/* Hero Metric */}
            {metric && (
              <div className="text-right flex-shrink-0 pl-6">
                <div className="flex items-baseline justify-end gap-2">
                  <span
                    className="text-5xl font-black tracking-tight tabular-nums"
                    style={{ color: config.color }}
                  >
                    {metric.value}
                  </span>
                  {metric.change && (
                    <span className="text-lg font-bold text-red-500">{metric.change}</span>
                  )}
                </div>
                <span className="text-sm text-stone-400 font-medium">{metric.label}</span>
              </div>
            )}
          </div>

          {/* Visualization Area */}
          <div className="flex-1 min-h-0 py-4">

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

          {/* AI Insight */}
          <div className="pt-5 border-t border-stone-100 mt-auto">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-[15px] text-stone-600 leading-relaxed">
                {aiGuidance}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button className="
            mt-6 w-full py-4
            bg-stone-900 hover:bg-stone-800 active:bg-stone-950
            text-white text-base font-semibold
            rounded-2xl
            transition-all duration-200
            flex items-center justify-center gap-2
            group
            shadow-lg shadow-stone-900/10
          ">
            {action}
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
