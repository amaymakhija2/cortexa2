import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

// =============================================================================
// EXECUTIVE SUMMARY COMPONENT
// =============================================================================
// The crown jewel of the dashboard - an editorial-style collapsible summary
// that leads the page with authority. Premium financial publication aesthetic
// with perfect integration into the Cortexa design system.
//
// Design principles:
// - Typography matches ChartCard exactly (DM Serif Display, same sizes)
// - Card styling matches design system (gradients, shadows, rounded corners)
// - Bold, readable collapse button that invites interaction
// - Summary text that tells a story with strategic highlights
// =============================================================================

export interface ExecutiveSummaryProps {
  /** The summary text - use **bold** for emphasis (markdown-style) */
  summary: string;
  /** Whether the summary starts expanded (default: true) */
  defaultExpanded?: boolean;
  /** Optional accent color */
  accent?: 'amber' | 'indigo' | 'rose' | 'emerald' | 'cyan' | 'stone';
  /** Additional className */
  className?: string;
}

const ACCENT_CONFIG: Record<string, {
  primary: string;
  gradient: string;
  lightBg: string;
  glow: string;
  border: string;
}> = {
  amber: {
    primary: '#d97706',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    lightBg: 'rgba(251, 191, 36, 0.08)',
    glow: '0 0 40px rgba(251, 191, 36, 0.2)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  indigo: {
    primary: '#4f46e5',
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    lightBg: 'rgba(129, 140, 248, 0.08)',
    glow: '0 0 40px rgba(129, 140, 248, 0.2)',
    border: 'rgba(129, 140, 248, 0.3)',
  },
  rose: {
    primary: '#e11d48',
    gradient: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
    lightBg: 'rgba(251, 113, 133, 0.08)',
    glow: '0 0 40px rgba(251, 113, 133, 0.2)',
    border: 'rgba(251, 113, 133, 0.3)',
  },
  emerald: {
    primary: '#059669',
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    lightBg: 'rgba(52, 211, 153, 0.08)',
    glow: '0 0 40px rgba(52, 211, 153, 0.2)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  cyan: {
    primary: '#0891b2',
    gradient: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
    lightBg: 'rgba(34, 211, 238, 0.08)',
    glow: '0 0 40px rgba(34, 211, 238, 0.2)',
    border: 'rgba(34, 211, 238, 0.3)',
  },
  stone: {
    primary: '#57534e',
    gradient: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
    lightBg: 'rgba(168, 162, 158, 0.08)',
    glow: '0 0 40px rgba(168, 162, 158, 0.15)',
    border: 'rgba(168, 162, 158, 0.25)',
  },
};

/**
 * Parses markdown-style **bold** text into React nodes with accent color
 */
const parseBoldText = (text: string, accentColor: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <span
          key={idx}
          className="font-semibold"
          style={{ color: accentColor }}
        >
          {boldText}
        </span>
      );
    }
    return part;
  });
};

/**
 * ExecutiveSummary - The commanding presence at the top of every tab
 *
 * @example
 * <ExecutiveSummary
 *   summary="Revenue is **up 12%** this month, exceeding the **$150k target** for the third consecutive month. However, **client retention dropped to 82%**, warranting attention. Your top performer generated **$45k** this period."
 *   accent="amber"
 * />
 */
export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  defaultExpanded = true,
  accent = 'amber',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const colors = ACCENT_CONFIG[accent];

  return (
    <div
      className={`executive-summary ${className}`}
      style={{
        animation: 'summarySlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {/* Main Card - matches ChartCard styling exactly */}
      <div
        className="rounded-2xl xl:rounded-3xl relative overflow-hidden transition-all duration-500"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: isExpanded
            ? `0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03), ${colors.glow}`
            : '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Accent gradient bar at top - distinctive identifier */}
        <div
          className="h-1.5 xl:h-2"
          style={{ background: colors.gradient }}
        />

        {/* Header Section - clickable, matches ChartCard header styling */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 p-6 sm:p-8 xl:p-10 text-left group transition-colors duration-200 hover:bg-stone-50/30"
        >
          {/* Left side - Title area */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Icon badge */}
            <div
              className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: colors.lightBg,
                border: `1px solid ${colors.border}`,
                boxShadow: isExpanded ? colors.glow : 'none',
              }}
            >
              <Sparkles
                className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 transition-transform duration-300"
                style={{
                  color: colors.primary,
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-15deg)',
                }}
              />
            </div>

            {/* Title - matches ChartCard title exactly */}
            <div>
              <h3
                className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Summary
              </h3>
              <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-1">
                {isExpanded ? 'Key insights at a glance' : 'Click to view insights'}
              </p>
            </div>
          </div>

          {/* Collapse/Expand button - BOLD and readable */}
          <div
            className="flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 flex-shrink-0"
            style={{
              background: isExpanded ? colors.gradient : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
              boxShadow: isExpanded
                ? `0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            <span
              className="text-base sm:text-lg font-bold tracking-tight transition-colors duration-200"
              style={{
                color: isExpanded ? colors.primary : '#57534e',
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            <ChevronDown
              className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300"
              style={{
                color: isExpanded ? colors.primary : '#78716c',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </div>
        </button>

        {/* Expandable Content */}
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: isExpanded ? '600px' : '0px',
            opacity: isExpanded ? 1 : 0,
          }}
        >
          {/* Divider - elegant separation */}
          <div className="px-6 sm:px-8 xl:px-10">
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, ${colors.border} 0%, rgba(0,0,0,0.04) 50%, transparent 100%)`,
              }}
            />
          </div>

          {/* Summary Text - editorial prose styling */}
          <div className="p-6 sm:p-8 xl:p-10 pt-6 sm:pt-8 xl:pt-8">
            <p
              className="text-stone-700 leading-relaxed"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                lineHeight: 1.75,
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
              {parseBoldText(summary, colors.primary)}
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes summarySlideIn {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ExecutiveSummary;
