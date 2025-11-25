import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, Info, CheckCircle, ArrowRight, Clock, Zap } from "lucide-react"
import { cn } from "../lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts'

interface ClinicianBreakdown {
  name: string
  value: string | number
  subtext?: string
}

interface CarouselProps {
  currentIndex: number
  totalSlides: number
  goToSlide: (index: number) => void
  isActive: boolean
}

interface PriorityTaskProps {
  index: number
  title: string
  description: string
  aiGuidance: string
  impact: string
  impactBreakdown?: ClinicianBreakdown[]
  action: string
  status: "good" | "warning" | "critical"
  dueToday?: boolean
  chartData?: any[]
  chartData2?: any[]
  type?: "retention" | "slots" | "cancellations" | "accounts-receivable" | "default"
  retentionData?: any[]
  accountsReceivableData?: any[]
  onExplore?: () => void
  carouselProps?: CarouselProps
}

const statusStyles = {
  critical: {
    accent: "#dc2626",
    accentLight: "#fef2f2",
    text: "text-rose-700",
    icon: AlertCircle,
    priority: "High Priority",
    gradient: "from-rose-500 to-rose-600"
  },
  warning: {
    accent: "#d97706",
    accentLight: "#fffbeb",
    text: "text-amber-700",
    icon: Clock,
    priority: "Attention",
    gradient: "from-amber-500 to-amber-600"
  },
  good: {
    accent: "#059669",
    accentLight: "#ecfdf5",
    text: "text-emerald-700",
    icon: CheckCircle,
    priority: "Opportunity",
    gradient: "from-emerald-500 to-emerald-600"
  }
}

const CHART_COLORS = [
  "#292524", // stone-800
  "#57534e", // stone-600
  "#78716c", // stone-500
  "#a8a29e", // stone-400
  "#d6d3d1", // stone-300
]

const MinimalTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const label = data.name ? data.name.replace('Dr. ', '') : data.month || ''
    return (
      <div className="bg-stone-900 px-3 py-2 shadow-xl rounded-lg">
        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export const PriorityTaskCard: React.FC<PriorityTaskProps> = ({
  index,
  title,
  description,
  aiGuidance,
  impact,
  impactBreakdown,
  action,
  status,
  dueToday,
  chartData,
  chartData2,
  type = "default",
  retentionData,
  accountsReceivableData,
  onExplore,
  carouselProps
}) => {
  const styles = statusStyles[status]
  const StatusIcon = styles.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="relative h-full"
    >
      <div
        className="bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col h-full overflow-hidden relative group"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Border */}
        <div className="absolute inset-0 rounded-2xl border border-stone-200/70 group-hover:border-stone-300 transition-colors duration-300 pointer-events-none" />

        {/* Status accent */}
        <div className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-gradient-to-b ${styles.gradient}`} />

        {/* Header */}
        <div className="px-7 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 flex-1 pr-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", styles.text)}
                  style={{ backgroundColor: styles.accentLight }}
                >
                  <StatusIcon className="h-3 w-3" />
                  {styles.priority}
                </span>
                {dueToday && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                    <Zap className="h-3 w-3" />
                    Due Today
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-1 tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-stone-500">
                  {description}
                </p>
              </div>
            </div>

            {carouselProps && carouselProps.totalSlides > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: carouselProps.totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => carouselProps.goToSlide(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === carouselProps.currentIndex ? "w-5 bg-stone-800" : "w-1.5 bg-stone-200 hover:bg-stone-300"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mx-7 px-4 py-3 bg-stone-50/80 rounded-xl border border-stone-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-md bg-stone-200/60 flex items-center justify-center mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-stone-500">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Analysis</p>
              <p className="text-sm text-stone-600 leading-relaxed">
                {aiGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col mt-4">
          {/* Slots Chart */}
          {type === "slots" && chartData && chartData.length > 0 && (
            <div className="px-7 pb-4 flex-1 min-h-[180px]">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Available Slots</p>
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 16, right: 0, left: 0, bottom: 0 }} barCategoryGap="25%">
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                    <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(245, 245, 244, 0.8)' }} />
                    <Bar dataKey="slots" radius={[5, 5, 0, 0]}>
                      <LabelList dataKey="slots" position="top" style={{ fontSize: '11px', fill: '#292524', fontWeight: 600 }} dy={-5} />
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cancellations Charts */}
          {type === "cancellations" && chartData && chartData.length > 0 && (
            <div className="px-7 pb-4 space-y-5 flex-1">
              <div className="h-[140px]">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Monthly Trend</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                    <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(245, 245, 244, 0.8)' }} />
                    <Bar dataKey="cancellations" radius={[5, 5, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isSpike ? '#dc2626' : '#d6d3d1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {chartData2 && chartData2.length > 0 && (
                <div className="h-[140px]">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">By Clinician</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData2} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                      <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(245, 245, 244, 0.8)' }} />
                      <Bar dataKey="cancellations" radius={[5, 5, 0, 0]}>
                        {chartData2.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isSpike ? '#dc2626' : '#d6d3d1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Retention Table */}
          {type === "retention" && retentionData && (
            <div className="flex-1 flex flex-col min-h-0">
              <table className="w-full text-left border-collapse table-fixed h-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="w-[18%] px-7 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Client</th>
                    <th className="w-[52%] px-4 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">
                      Sessions <span className="font-normal text-stone-300">Jun–Sep</span>
                    </th>
                    <th className="w-[30%] px-7 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionData.map((client) => (
                    <tr key={client.id} className="group hover:bg-stone-50/50 transition-colors border-b border-stone-50 last:border-b-0">
                      <td className="px-7 py-2.5">
                        <span className="text-sm font-medium text-stone-700">{client.id}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {client.sessions.map((session: any, idx: number) => {
                            const isDropped = client.dropped && session.month === client.droppedAfter
                            const isAfterDrop = client.dropped && idx > client.sessions.findIndex((s: any) => s.month === client.droppedAfter)
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "w-9 h-7 rounded flex items-center justify-center text-xs font-semibold",
                                  session.count > 0
                                    ? isDropped ? "bg-rose-100 text-rose-700" : "bg-stone-100 text-stone-700"
                                    : isAfterDrop ? "bg-rose-50/50 text-rose-300" : "bg-stone-50 text-stone-300"
                                )}
                              >
                                {session.count > 0 ? session.count : "–"}
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-7 py-2.5 text-right">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          client.dropped ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {client.dropped ? "Lost" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Accounts Receivable */}
          {type === "accounts-receivable" && accountsReceivableData && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-7 pb-2">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Outstanding Payments</p>
              </div>
              <table className="w-full text-left h-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="flex-1 px-7 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Client</th>
                    <th className="w-24 px-4 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="w-20 px-7 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsReceivableData.map((item: any, idx: number) => {
                    const isUrgent = item.daysOutstanding >= 30
                    const isWarning = item.daysOutstanding >= 20 && item.daysOutstanding < 30
                    return (
                      <tr key={idx} className="group hover:bg-stone-50/50 transition-colors border-b border-stone-50 last:border-b-0">
                        <td className="px-7 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-stone-900">{item.client}</span>
                            <span className="text-[11px] text-stone-400">{item.clinician}</span>
                          </div>
                        </td>
                        <td className="w-24 px-4 py-2 text-right">
                          <span className="text-sm font-semibold text-stone-900 tabular-nums">${item.amount.toLocaleString()}</span>
                        </td>
                        <td className="w-20 px-7 py-2 text-right">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                            isUrgent ? "bg-rose-50 text-rose-600" : isWarning ? "bg-amber-50 text-amber-600" : "bg-stone-50 text-stone-500"
                          )}>
                            {item.daysOutstanding}d
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Default */}
          {type === "default" && impactBreakdown && (
            <div className="px-7 pb-4 flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{impact}</p>
              <div className="space-y-2">
                {impactBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-sm font-medium text-stone-600">{item.name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-stone-900">{item.value}</span>
                      {item.subtext && <span className="text-xs text-stone-400">{item.subtext}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="flex-1 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group/btn">
              {action}
              <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
            </button>
            {onExplore && (
              <button onClick={onExplore} className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all">
                Explore
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
