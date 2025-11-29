import React, { useState, useEffect } from 'react';
import { ChevronRight, User } from 'lucide-react';

// =============================================================================
// ACTIONABLE CLIENT LIST CARD
// =============================================================================
// A reusable card component for displaying lists of clients that need action.
// Used for at-risk clients, milestone opportunities, and similar use cases.
// =============================================================================

export type AccentColor = 'rose' | 'emerald' | 'amber' | 'indigo' | 'cyan' | 'stone';

export interface Badge {
  /** Number to display */
  count: number;
  /** Main label */
  label: string;
  /** Secondary label (e.g., "(21+ days)") */
  sublabel?: string;
  /** Badge color */
  color: AccentColor;
}

export interface ClientRowProps<T> {
  /** The client data */
  client: T;
  /** Row index for animation delay */
  index: number;
  /** Whether the row is visible (for animation) */
  isVisible: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface ActionableClientListCardProps<T extends { id: string }> {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle: string;
  /** Accent color for the summary stat */
  accentColor: AccentColor;
  /** Summary stat value */
  summaryValue: number | string;
  /** Summary stat label */
  summaryLabel: string;
  /** Badge breakdown row */
  badges?: Badge[];
  /** Client list */
  clients: T[];
  /** Render function for each client row */
  renderClientRow: (props: ClientRowProps<T>) => React.ReactNode;
  /** Callback when "View All" is clicked */
  onViewAll?: () => void;
  /** Callback when a client is clicked */
  onClientClick?: (clientId: string) => void;
  /** Maximum clients to show in preview */
  maxPreview?: number;
  /** Empty state title */
  emptyStateTitle?: string;
  /** Empty state description */
  emptyStateDescription?: string;
  /** Additional className */
  className?: string;
}

const ACCENT_COLORS: Record<AccentColor, {
  text: string;
  bg: string;
  border: string;
  dot: string;
  hoverBg: string;
}> = {
  rose: {
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    hoverBg: 'hover:bg-rose-50',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-50',
  },
  amber: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-50',
  },
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    hoverBg: 'hover:bg-indigo-50',
  },
  cyan: {
    text: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    hoverBg: 'hover:bg-cyan-50',
  },
  stone: {
    text: 'text-stone-600',
    bg: 'bg-stone-100',
    border: 'border-stone-200',
    dot: 'bg-stone-400',
    hoverBg: 'hover:bg-stone-50',
  },
};

export function ActionableClientListCard<T extends { id: string }>({
  title,
  subtitle,
  accentColor,
  summaryValue,
  summaryLabel,
  badges = [],
  clients,
  renderClientRow,
  onViewAll,
  onClientClick,
  maxPreview = 5,
  emptyStateTitle = 'No clients',
  emptyStateDescription = 'No clients match this criteria',
  className = '',
}: ActionableClientListCardProps<T>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const previewClients = clients.slice(0, maxPreview);
  const accentConfig = ACCENT_COLORS[accentColor];

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.4s ease-out',
      }}
    >
      {/* Header - matches design system */}
      <div className="p-6 sm:p-8 xl:p-10 border-b border-stone-100">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-2xl sm:text-3xl xl:text-4xl text-stone-900 font-bold tracking-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {title}
            </h3>
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl mt-2">
              {subtitle}
            </p>
          </div>

          {/* Summary stat */}
          <div className="text-right flex-shrink-0">
            <div
              className={`text-4xl sm:text-5xl xl:text-6xl font-bold ${accentConfig.text}`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {summaryValue}
            </div>
            <div className="text-stone-500 text-base mt-1">{summaryLabel}</div>
          </div>
        </div>

        {/* Badge breakdown row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {badges.map((badge, idx) => {
              if (badge.count === 0) return null;
              const badgeColors = ACCENT_COLORS[badge.color];
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${badgeColors.bg} border ${badgeColors.border}`}
                >
                  <div className={`w-2 h-2 rounded-full ${badgeColors.dot}`} />
                  <span className={`text-sm font-semibold ${badgeColors.text}`}>
                    {badge.count} {badge.label}
                  </span>
                  {badge.sublabel && (
                    <span className="text-xs opacity-60">{badge.sublabel}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Client list preview */}
      {previewClients.length > 0 && (
        <div className="divide-y divide-stone-100">
          {previewClients.map((client, index) => (
            <div key={client.id}>
              {renderClientRow({
                client,
                index,
                isVisible,
                onClick: () => onClientClick?.(client.id),
              })}
            </div>
          ))}
        </div>
      )}

      {/* View all footer */}
      {clients.length > maxPreview && onViewAll && (
        <button
          onClick={onViewAll}
          className={`w-full px-6 xl:px-8 py-4 flex items-center justify-center gap-2 ${accentConfig.text} font-semibold ${accentConfig.hoverBg} transition-colors border-t border-stone-100`}
        >
          <span>View all {clients.length} clients</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="px-6 xl:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-4">
            <User size={32} className="text-stone-400" />
          </div>
          <h4 className="text-lg font-semibold text-stone-900 mb-1">
            {emptyStateTitle}
          </h4>
          <p className="text-stone-500 text-sm">{emptyStateDescription}</p>
        </div>
      )}
    </div>
  );
}

export default ActionableClientListCard;
