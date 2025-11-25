import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface RetentionAlertCardProps {
  index: number
  title: string
  description: string
  aiGuidance: string
  action: string
  dueToday?: boolean
  retentionData: {
    id: string
    acquiredMonth: string
    sessions: { month: string; count: number }[]
    dropped: boolean
    droppedAfter: string | null
  }[]
}

export const RetentionAlertCard: React.FC<RetentionAlertCardProps> = ({
  index,
  title,
  aiGuidance,
  action,
  retentionData,
}) => {
  const lostClients = retentionData.filter(c => c.dropped).length
  const totalClients = retentionData.length
  const retainedClients = totalClients - lostClients

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div className="h-full bg-[#111] rounded-[24px] overflow-hidden flex flex-col">

        {/* Red accent line */}
        <div className="h-1.5 bg-red-500" />

        <div className="flex flex-col h-full p-8">

          {/* Top: Urgent badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                Urgent
              </span>
            </div>
          </div>

          {/* Title - Large */}
          <h2 className="text-3xl font-semibold text-white mb-8">
            {title}
          </h2>

          {/* Hero: The insight */}
          <p
            className="text-xl text-stone-300 leading-relaxed mb-10"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {aiGuidance}
          </p>

          {/* Large stats */}
          <div className="flex items-center gap-8 mb-10">
            <div>
              <span className="text-5xl font-semibold text-white">{totalClients}</span>
              <p className="text-lg text-stone-400 mt-1">new clients</p>
            </div>
            <div className="w-px h-16 bg-stone-700" />
            <div>
              <span className="text-5xl font-semibold text-red-400">{lostClients}</span>
              <p className="text-lg text-stone-400 mt-1">lost</p>
            </div>
            <div className="w-px h-16 bg-stone-700" />
            <div>
              <span className="text-5xl font-semibold text-emerald-400">{retainedClients}</span>
              <p className="text-lg text-stone-400 mt-1">retained</p>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-auto">
            <button className="
              w-full py-4
              bg-red-500 hover:bg-red-400
              text-white text-base font-semibold
              rounded-xl
              transition-colors duration-200
              flex items-center justify-center gap-2
              group
            ">
              {action}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
