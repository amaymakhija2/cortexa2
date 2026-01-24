import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

// =============================================================================
// EXECUTIVE SUMMARY COMPONENT
// =============================================================================
// A commanding editorial-style summary card designed for maximum impact and
// effortless readability. Inspired by premium financial publications -
// The Economist meets Bloomberg meets luxury annual reports.
//
// Design principles:
// - BOLD, generous typography - nothing small, nothing to squint at
// - Dramatic visual hierarchy with clear information architecture
// - Refined warm color palette with strategic accent highlights
// - Purposeful whitespace - let the content breathe
// - Sophisticated depth through layered shadows and refined borders
// =============================================================================

export interface ExecutiveSummaryProps {
  /** The headline - a single powerful statement */
  headline: string;
  /** The detailed summary text - use **bold** for emphasis */
  summary: string;
  /** Whether the summary starts expanded (default: false) */
  defaultExpanded?: boolean;
  /** Accent color theme */
  accent?: 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan';
  /** Additional className */
  className?: string;
}

// Premium accent configurations with sophisticated color relationships
const ACCENT_THEMES = {
  amber: {
    primary: '#b45309',
    secondary: '#d97706',
    light: '#fef3c7',
    ultraLight: 'rgba(251, 191, 36, 0.06)',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    glow: '0 0 60px rgba(251, 191, 36, 0.15)',
    border: 'rgba(217, 119, 6, 0.2)',
  },
  emerald: {
    primary: '#047857',
    secondary: '#059669',
    light: '#d1fae5',
    ultraLight: 'rgba(16, 185, 129, 0.06)',
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
    glow: '0 0 60px rgba(16, 185, 129, 0.15)',
    border: 'rgba(5, 150, 105, 0.2)',
  },
  rose: {
    primary: '#be123c',
    secondary: '#e11d48',
    light: '#ffe4e6',
    ultraLight: 'rgba(244, 63, 94, 0.06)',
    gradient: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 50%, #fda4af 100%)',
    glow: '0 0 60px rgba(244, 63, 94, 0.15)',
    border: 'rgba(225, 29, 72, 0.2)',
  },
  indigo: {
    primary: '#4338ca',
    secondary: '#4f46e5',
    light: '#e0e7ff',
    ultraLight: 'rgba(99, 102, 241, 0.06)',
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
    glow: '0 0 60px rgba(99, 102, 241, 0.15)',
    border: 'rgba(79, 70, 229, 0.2)',
  },
  cyan: {
    primary: '#0e7490',
    secondary: '#0891b2',
    light: '#cffafe',
    ultraLight: 'rgba(34, 211, 238, 0.06)',
    gradient: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 50%, #67e8f9 100%)',
    glow: '0 0 60px rgba(34, 211, 238, 0.15)',
    border: 'rgba(8, 145, 178, 0.2)',
  },
};

/**
 * Parses markdown-style **bold** text into styled React nodes
 */
const parseHighlightedText = (text: string, accentColor: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const highlightedText = part.slice(2, -2);
      return (
        <span
          key={idx}
          className="relative inline-block font-semibold"
          style={{
            color: accentColor,
          }}
        >
          {highlightedText}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

/**
 * ExecutiveSummary - The commanding presence at the top of the dashboard
 *
 * A premium editorial-style card that delivers key insights with authority.
 * Designed for maximum readability and visual impact.
 */
export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  headline,
  summary,
  defaultExpanded = false,
  accent = 'amber',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const theme = ACCENT_THEMES[accent];

  return (
    <div
      className={`executive-summary-card ${className}`}
      style={{
        animation: 'summaryFadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {/* Main Card Container */}
      <div
        className="relative overflow-hidden transition-all duration-700 ease-out"
        style={{
          borderRadius: 'var(--radius-2xl, 28px)',
          background: '#ffffff',
          boxShadow: isExpanded
            ? `
                0 1px 2px rgba(0, 0, 0, 0.03),
                0 4px 8px rgba(0, 0, 0, 0.04),
                0 16px 32px rgba(0, 0, 0, 0.06),
                0 32px 64px rgba(0, 0, 0, 0.04),
                inset 0 0 0 1px rgba(0, 0, 0, 0.04),
                ${theme.glow}
              `
            : `
                0 1px 2px rgba(0, 0, 0, 0.03),
                0 4px 8px rgba(0, 0, 0, 0.04),
                0 8px 16px rgba(0, 0, 0, 0.03),
                inset 0 0 0 1px rgba(0, 0, 0, 0.04)
              `,
        }}
      >
        {/* Premium Accent Bar - Thick and Bold */}
        <div
          className="h-2"
          style={{
            background: theme.gradient,
          }}
        />

        {/* Header Section - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-amber-400"
        >
          <div className="px-10 py-6 sm:px-12 sm:py-7 transition-colors duration-300 hover:bg-stone-50/40">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">

              {/* Left: Icon + Headline */}
              <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0">
                {/* Decorative Icon Badge */}
                <div
                  className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: theme.ultraLight,
                    border: `2px solid ${theme.border}`,
                    boxShadow: isExpanded ? theme.glow : 'none',
                  }}
                >
                  <Sparkles
                    className="w-7 h-7 sm:w-8 sm:h-8 transition-all duration-500"
                    style={{
                      color: theme.secondary,
                      transform: isExpanded ? 'rotate(0deg) scale(1)' : 'rotate(-10deg) scale(0.95)',
                    }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Headline Text */}
                <div className="flex-1 min-w-0 pt-1">
                  <h2
                    className="text-stone-900 leading-tight tracking-tight"
                    style={{
                      fontFamily: "'Tiempos Headline', Georgia, 'Times New Roman', serif",
                      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {headline}
                  </h2>
                  <p
                    className="text-stone-500 mt-2 font-medium"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                  >
                    {isExpanded ? 'Executive Summary' : 'Tap to expand insights'}
                  </p>
                </div>
              </div>

              {/* Right: Collapse/Expand Control */}
              <div
                className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 flex-shrink-0"
                style={{
                  background: isExpanded
                    ? theme.gradient
                    : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                  boxShadow: isExpanded
                    ? `0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                    : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                <span
                  className="text-lg sm:text-xl font-semibold tracking-tight transition-colors duration-300"
                  style={{
                    fontFamily: "'Tiempos Headline', Georgia, serif",
                    color: isExpanded ? theme.primary : '#57534e',
                  }}
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
                <ChevronDown
                  className="w-6 h-6 transition-all duration-500 ease-out"
                  style={{
                    color: isExpanded ? theme.primary : '#78716c',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </button>

        {/* Expandable Content */}
        <div
          className="overflow-hidden transition-all duration-700 ease-out"
          style={{
            maxHeight: isExpanded ? '1200px' : '0px',
            opacity: isExpanded ? 1 : 0,
          }}
        >
          {/* Summary Prose - Editorial Style */}
          <div className="px-10 sm:px-12 pb-8 sm:pb-10">
            <div
              className="relative rounded-2xl p-8 sm:p-10"
              style={{
                background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Decorative Quote Mark */}
              <div
                className="absolute -top-2 left-8 text-8xl leading-none select-none pointer-events-none"
                style={{
                  fontFamily: "'Tiempos Headline', Georgia, serif",
                  color: theme.border,
                  opacity: 0.5,
                }}
              >
                "
              </div>

              <p
                className="relative text-stone-700 leading-relaxed"
                style={{
                  fontFamily: "'Tiempos Headline', Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
              >
                {parseHighlightedText(summary, theme.primary)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes summaryFadeIn {
          from {
            opacity: 0;
            transform: translateY(-16px);
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

// Keep KeyMetric export for backwards compatibility but it's no longer used
export interface KeyMetric {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  comparison?: string;
}

export default ExecutiveSummary;
