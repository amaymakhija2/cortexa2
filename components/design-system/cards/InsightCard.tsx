import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

// =============================================================================
// INSIGHT CARD COMPONENT
// =============================================================================
// Insight-first cards that lead with the finding, not labels.
// The statement IS the content. Clean hierarchy, excellent readability.
// Matches the "Paper & Ink" design system aesthetic.
// =============================================================================

export type InsightSentiment = 'negative' | 'positive' | 'neutral';

export interface InsightCardProps {
  /** The main insight statement - this IS the headline */
  statement: string;
  /** Optional emphasized portion within statement (will be highlighted) */
  emphasis?: string;
  /** Optional metric value (e.g., "1.8×") - displayed prominently */
  metric?: string;
  /** Optional metric label (e.g., "overrepresented") */
  metricLabel?: string;
  /** Sentiment affects accent color */
  sentiment?: InsightSentiment;
  /** Optional category label */
  category?: string;
  /** Additional className */
  className?: string;
}

const SENTIMENT_CONFIG: Record<InsightSentiment, {
  icon: React.ReactNode;
  metricColor: string;
  metricBg: string;
  accentColor: string;
  iconBg: string;
}> = {
  negative: {
    icon: <ArrowDownRight size={16} strokeWidth={2.5} />,
    metricColor: '#be123c',
    metricBg: 'rgba(255, 241, 242, 0.8)',
    accentColor: '#e11d48',
    iconBg: 'rgba(225, 29, 72, 0.1)',
  },
  positive: {
    icon: <ArrowUpRight size={16} strokeWidth={2.5} />,
    metricColor: '#047857',
    metricBg: 'rgba(236, 253, 245, 0.8)',
    accentColor: '#059669',
    iconBg: 'rgba(5, 150, 105, 0.1)',
  },
  neutral: {
    icon: <Minus size={16} strokeWidth={2.5} />,
    metricColor: '#57534e',
    metricBg: 'rgba(245, 245, 244, 0.8)',
    accentColor: '#78716c',
    iconBg: 'rgba(120, 113, 108, 0.1)',
  },
};

/**
 * InsightCard - Insight-first presentation
 *
 * The insight statement is the headline. Clean, direct, editorial.
 * Excellent readability with clear visual hierarchy.
 *
 * @example
 * <InsightCard
 *   statement="Monthly clients are 35% of churn but only 20% of your client base"
 *   metric="1.8×"
 *   metricLabel="overrepresented"
 *   sentiment="negative"
 *   category="Session Frequency"
 * />
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  statement,
  emphasis,
  metric,
  metricLabel,
  sentiment = 'neutral',
  category,
  className = '',
}) => {
  const config = SENTIMENT_CONFIG[sentiment];

  // If emphasis is provided, wrap it in a styled span
  const renderStatement = () => {
    if (!emphasis) {
      return statement;
    }

    const parts = statement.split(emphasis);
    if (parts.length === 1) {
      return statement;
    }

    return (
      <>
        {parts[0]}
        <span style={{ color: config.accentColor, fontWeight: 500 }}>
          {emphasis}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={`insight-card ${className}`}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        boxShadow: `
          0 1px 2px rgba(0, 0, 0, 0.04),
          0 2px 4px rgba(0, 0, 0, 0.03),
          0 4px 8px rgba(0, 0, 0, 0.02),
          0 0 0 1px rgba(0, 0, 0, 0.04)
        `,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        minHeight: '180px',
      }}
    >
      {/* Top row: category + metric */}
      <div className="flex items-start justify-between gap-4">
        {/* Category label - matches standard card title styling */}
        {category ? (
          <h3
            className="text-2xl sm:text-3xl xl:text-4xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {category}
          </h3>
        ) : (
          <span />
        )}

        {/* Metric display - prominent and clear */}
        {metric && (
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl flex-shrink-0"
            style={{ background: config.metricBg }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: config.iconBg,
                color: config.metricColor,
              }}
            >
              {config.icon}
            </div>

            {/* Metric value + label stacked */}
            <div className="flex flex-col items-end">
              <span
                className="text-xl font-bold leading-none"
                style={{
                  color: config.metricColor,
                  fontFamily: "'DM Serif Display', Georgia, serif",
                }}
              >
                {metric}
              </span>
              {metricLabel && (
                <span
                  className="text-sm font-medium leading-tight mt-0.5"
                  style={{ color: config.metricColor, opacity: 0.85 }}
                >
                  {metricLabel}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* The insight statement - THE headline */}
      <p
        className="text-xl sm:text-2xl xl:text-[1.75rem] leading-relaxed text-stone-700 flex-1"
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontWeight: 400,
          lineHeight: 1.45,
        }}
      >
        {renderStatement()}
      </p>
    </div>
  );
};

export default InsightCard;
