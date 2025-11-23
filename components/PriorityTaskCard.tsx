import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, Info, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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

// Elite Light Palette - Sophisticated Status Colors
const statusStyles = {
  critical: {
    accent: "#ef4444", // red-500
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    icon: AlertCircle,
    priority: "High Priority"
  },
  warning: {
    accent: "#f59e0b", // amber-500
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    icon: Info,
    priority: "Medium Priority"
  },
  good: {
    accent: "#10b981", // emerald-500
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    icon: CheckCircle,
    priority: "On Track"
  }
}

// Chart colors - Monochrome Slate Palette
const CHART_COLORS = [
  "#1e293b", // slate-800
  "#64748b", // slate-500
  "#94a3b8", // slate-400
  "#cbd5e1", // slate-300
  "#e2e8f0", // slate-200
]

// Minimal tooltip
const MinimalTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const label = data.name ? data.name.replace('Dr. ', '') : data.month || ''
    return (
      <div className="bg-white px-3 py-2 shadow-xl rounded-lg border border-slate-100">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-900">{payload[0].value}</p>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="relative h-full"
    >
      {/* Card Container */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/30 rounded-2xl border border-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden relative group ring-1 ring-slate-200/50"
        style={{
          boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
        }}
      >

        {/* Carousel Navigation - Top Right */}
        {carouselProps && carouselProps.totalSlides > 1 && (
          <div className="absolute top-6 right-6 z-10">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: carouselProps.totalSlides }).map((_, idx) => {
                  const isActive = idx === carouselProps.currentIndex
                  return (
                    <button
                      key={idx}
                      onClick={() => carouselProps.goToSlide(idx)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        isActive
                          ? "w-6 bg-slate-800"
                          : "w-1.5 bg-slate-200 hover:bg-slate-300"
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-50">
          <div className="flex items-start justify-between pr-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                  styles.bg,
                  styles.text,
                  styles.border
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {styles.priority}
                </span>
                {dueToday && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Due Today
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-50">
          <div className="flex gap-3">
            <div className="mt-0.5 w-1 h-full min-h-[24px] rounded-full bg-gradient-to-b from-slate-300 to-transparent" />
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Analysis</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {aiGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section - Flexible Growth */}
        <div className="flex-1 min-h-0 bg-white flex flex-col">
          {/* Slots Chart */}
          {type === "slots" && chartData && chartData.length > 0 && (
            <div className="p-8 flex-1 min-h-[280px]">
              <div className="mb-4 flex items-center gap-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Slots by Clinician</p>
                <div className="group/info relative z-[100000]">
                  <Info size={12} className="text-slate-400 cursor-help" />
                  <div className="absolute left-0 top-5 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <p className="font-medium mb-1">Clinician Availability</p>
                      <p className="text-gray-300">Shows open appointment slots for each clinician. Use this to balance workload and identify who has capacity for new clients.</p>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap="20%"
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => value.replace('Dr. ', '')}
                      dy={10}
                    />
                    <Tooltip
                      content={<MinimalTooltip />}
                      cursor={{ fill: '#f8fafc', radius: 4 }}
                    />
                    <Bar
                      dataKey="slots"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="slots"
                        position="top"
                        style={{ fontSize: '12px', fill: '#1e293b', fontWeight: 600 }}
                        dy={-5}
                      />
                      {chartData.map((entry, index) => (
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
            <div className="p-8 space-y-8 flex-1">
              {/* Monthly Trend */}
              <div className="h-[200px]">
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Monthly Trend</p>
                  <div className="group/info relative z-[100000]">
                    <Info size={12} className="text-slate-400 cursor-help" />
                    <div className="absolute left-0 top-5 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                        <p className="font-medium mb-1">Cancellation Trends</p>
                        <p className="text-gray-300">Track monthly cancellation patterns. Red bars indicate months with unusually high cancellations (spikes) that may require attention.</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <Tooltip content={<MinimalTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="cancellations" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isSpike ? '#ef4444' : '#cbd5e1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Clinician Breakdown */}
              {chartData2 && chartData2.length > 0 && (
                <div className="h-[200px]">
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">By Clinician</p>
                    <div className="group/info relative z-[100000]">
                      <Info size={12} className="text-slate-400 cursor-help" />
                      <div className="absolute left-0 top-5 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-64 z-[100000]">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                          <p className="font-medium mb-1">Cancellations by Provider</p>
                          <p className="text-gray-300">Compare cancellation rates across your team. Red bars highlight clinicians with higher-than-normal cancellations to help identify training needs or scheduling issues.</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData2} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.replace('Dr. ', '')}
                        dy={10}
                      />
                      <Tooltip content={<MinimalTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="cancellations" radius={[4, 4, 0, 0]}>
                        {chartData2.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isSpike ? '#ef4444' : '#cbd5e1'}
                          />
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
            <div className="p-0 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-x-auto flex flex-col">
                <table className="w-full h-full text-left border-collapse table-fixed flex flex-col">
                  <thead className="flex-shrink-0">
                    <tr className="border-b border-slate-100 flex w-full">
                      <th className="w-[20%] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="w-[60%] px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        Sessions Trend
                        <div className="group/info relative z-[100000]">
                          <Info size={12} className="text-slate-400 cursor-help" />
                          <div className="absolute left-0 top-5 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-72 z-[100000]">
                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                              <p className="font-medium mb-1">Client Retention Patterns</p>
                              <p className="text-gray-300">Visualize session frequency over the last 4 months. Red cells indicate clients who dropped off, amber shows decreasing attendance, and darker cells show higher usage. This helps identify at-risk clients early.</p>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </th>
                      <th className="w-[20%] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="flex-1 flex flex-col">
                    {retentionData.map((client, clientIdx) => (
                      <tr
                        key={client.id}
                        className="group hover:bg-slate-50/50 transition-colors flex-1 flex w-full border-b border-slate-50 last:border-b-0"
                      >
                        <td className="w-[20%] px-8 py-4 text-sm font-medium text-slate-700 flex items-center">{client.id}</td>
                        <td className="w-[60%] px-4 py-4 flex items-center">
                          <div className="flex items-center justify-center gap-2 w-full h-full">
                            {client.sessions.map((session: any, idx: number) => {
                              const isDropped = client.dropped && session.month === client.droppedAfter
                              const isSpike = !client.dropped && session.count >= 6
                              const isWarning = !client.dropped && session.count === 2 && idx > 0 && client.sessions[idx - 1].count >= 3

                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex-1 h-full min-h-[3rem] rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                                    session.count > 0
                                      ? isDropped
                                        ? "bg-red-100 text-red-700"
                                        : isSpike
                                          ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                                          : isWarning
                                            ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                                            : "bg-slate-100 text-slate-600"
                                      : "bg-slate-50 text-slate-300"
                                  )}
                                >
                                  {session.count > 0 ? session.count : "·"}
                                </div>
                              )
                            })}
                          </div>
                        </td>
                        <td className="w-[20%] px-8 py-4 text-right flex items-center justify-end">
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full",
                            client.dropped
                              ? "bg-red-50 text-red-700"
                              : client.sessions.some((s: any) => s.count >= 6)
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-50 text-slate-600"
                          )}>
                            {client.dropped ? "Lost" : client.sessions.some((s: any) => s.count >= 6) ? "High Usage" : "Stable"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accounts Receivable List */}
          {type === "accounts-receivable" && accountsReceivableData && (
            <div className="p-0 flex-1 flex flex-col min-h-0">
              <div className="px-8 pt-4 pb-2 flex items-center gap-2 border-b border-slate-50">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Payments</p>
                <div className="group/info relative z-[100000]">
                  <Info size={12} className="text-slate-400 cursor-help" />
                  <div className="absolute left-0 top-5 invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-all duration-200 w-72 z-[100000]">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <p className="font-medium mb-1">Accounts Receivable Aging</p>
                      <p className="text-gray-300">Lists overdue payments with the number of days outstanding. Red badges (30+ days) indicate urgent follow-up needed, amber (20-29 days) shows warning status. Prioritize collection efforts based on age and amount.</p>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto flex flex-col">
                <table className="w-full h-full text-left flex flex-col">
                  <thead className="flex-shrink-0">
                    <tr className="border-b border-slate-100 flex w-full">
                      <th className="flex-1 px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="w-32 px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="w-32 px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Age</th>
                    </tr>
                  </thead>
                  <tbody className="flex-1 flex flex-col">
                    {accountsReceivableData.map((item: any, idx: number) => {
                      const isUrgent = item.daysOutstanding >= 30
                      const isWarning = item.daysOutstanding >= 20 && item.daysOutstanding < 30

                      return (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors flex-1 flex w-full border-b border-slate-50 last:border-b-0">
                          <td className="flex-1 px-8 py-4 flex items-center">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">{item.client}</span>
                              <span className="text-xs text-slate-500">{item.clinician}</span>
                            </div>
                          </td>
                          <td className="w-32 px-4 py-4 text-right flex items-center justify-end">
                            <span className="text-sm font-bold text-slate-900">
                              ${item.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="w-32 px-8 py-4 text-right flex items-center justify-end">
                            <span className={cn(
                              "text-xs font-bold px-2 py-1 rounded-full",
                              isUrgent
                                ? "bg-red-50 text-red-700"
                                : isWarning
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-50 text-slate-600"
                            )}>
                              {item.daysOutstanding} days
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Default Impact Breakdown */}
          {type === "default" && impactBreakdown && (
            <div className="p-8 flex-1 flex flex-col justify-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">{impact}</p>
              <div className="space-y-3">
                {impactBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">{item.value}</span>
                      {item.subtext && (
                        <span className="text-xs text-slate-400">{item.subtext}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group/btn">
              {action}
              <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
            </button>
            {onExplore && (
              <button
                onClick={onExplore}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
              >
                Explore
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
