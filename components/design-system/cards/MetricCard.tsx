import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Info, ChevronRight } from 'lucide-react';

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================
// Key metric card for dashboard overview with optional expandable content.
// Used in the Practice Overview dashboard for displaying KPIs.
// =============================================================================

export type MetricStatus = 'Healthy' | 'Needs attention' | 'Critical';

export interface MetricCardProps {
  /** Card label/title */
  label: string;
  /** Main metric value */
  value: string;
  /** Optional label after the value (e.g., "completed", "active") */
  valueLabel?: string;
  /** Subtext description */
  subtext: string;
  /** Status indicator */
  status: MetricStatus;
  /** Tooltip content */
  tooltip?: {
    title: string;
    description: string;
  };
  /** Expandable panel content */
  expandableContent?: React.ReactNode;
  /** Label for the expand button */
  expandButtonLabel?: string;
  /** Shortened label for mobile */
  expandButtonLabelMobile?: string;
  /** Navigation link (alternative to expandable content) */
  navigateTo?: {
    path: string;
    label: string;
    labelMobile?: string;
  };
  /** Additional className */
  className?: string;
}

// =============================================================================
// TOOLTIP COMPONENT
// =============================================================================

const Tooltip: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = triggerRect.bottom + 8;
        let left = triggerRect.left - tooltipRect.width + triggerRect.width;

        if (left + tooltipRect.width > viewportWidth - 16) {
          left = viewportWidth - tooltipRect.width - 16;
        }

        if (left < 16) {
          left = 16;
        }

        if (top + tooltipRect.height > viewportHeight - 16) {
          top = triggerRect.top - tooltipRect.height - 8;
        }

        setPosition({ top, left });
      });
    } else {
      setPosition(null);
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info size={20} className="text-stone-300 hover:text-stone-500 cursor-help transition-colors" />
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-[100000] w-80 transition-opacity duration-150 ${position ? 'opacity-100' : 'opacity-0'}`}
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
          }}
        >
          <div className="bg-stone-900 text-white rounded-xl p-5 shadow-2xl text-left">
            <p className="font-bold text-base mb-2">{title}</p>
            <p className="text-stone-300 leading-relaxed text-sm">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// STATUS INDICATOR COMPONENT
// =============================================================================

const STATUS_CONFIG: Record<MetricStatus, { color: string; label: string }> = {
  'Healthy': { color: 'bg-emerald-500', label: 'On Track' },
  'Needs attention': { color: 'bg-amber-500', label: 'Monitor' },
  'Critical': { color: 'bg-rose-500', label: 'Action Needed' },
};

const StatusIndicator: React.FC<{ status: MetricStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${config.color}`} />
      <span className="text-sm sm:text-base lg:text-lg font-semibold text-stone-600">
        {config.label}
      </span>
    </div>
  );
};

// =============================================================================
// METRIC CARD
// =============================================================================

/**
 * MetricCard - Key metric display card with optional expandable content
 *
 * @example
 * // Basic metric card
 * <MetricCard
 *   label="Sessions"
 *   value="698"
 *   valueLabel="completed"
 *   subtext="82% of goal"
 *   status="Healthy"
 *   tooltip={{ title: "Sessions", description: "Total completed sessions" }}
 * />
 *
 * @example
 * // With expandable content
 * <MetricCard
 *   label="Revenue"
 *   value="$153.4k"
 *   subtext="Goal: $160k"
 *   status="Needs attention"
 *   expandButtonLabel="Weekly Breakdown"
 *   expandableContent={<WeeklyRevenueChart />}
 * />
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  valueLabel,
  subtext,
  status,
  tooltip,
  expandableContent,
  expandButtonLabel = 'Details',
  expandButtonLabelMobile = 'Details',
  navigateTo,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const hasExpandable = Boolean(expandableContent);
  const hasNavigation = Boolean(navigateTo);
  const hasButton = hasExpandable || hasNavigation;

  const statusColor = STATUS_CONFIG[status].color;

  // Update portal position based on card location
  const updatePortalPosition = useCallback(() => {
    if (cardRef.current && isExpanded) {
      const rect = cardRef.current.getBoundingClientRect();
      setPortalPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isExpanded]);

  // Update position on expand, scroll, resize
  useEffect(() => {
    if (isExpanded) {
      updatePortalPosition();

      // Listen for scroll on all scrollable parents
      const handleScroll = () => updatePortalPosition();
      const handleResize = () => updatePortalPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isExpanded, updatePortalPosition]);

  // Close on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside both card and portal content
      if (cardRef.current && !cardRef.current.contains(target)) {
        const portalContent = document.getElementById(`metric-card-portal-${label}`);
        if (!portalContent || !portalContent.contains(target)) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, label]);

  return (
    <>
      <div ref={cardRef} className={`relative h-full flex flex-col ${className}`}>
        {/* Main Card */}
        <div
          className={`group relative rounded-2xl flex flex-col h-full transition-all duration-300 hover:shadow-xl overflow-hidden ${
            isExpanded && hasExpandable ? 'rounded-b-none' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Status bar */}
          <div className={`h-1.5 ${statusColor}`} />

          {/* Content */}
          <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 xl:px-5 xl:pt-5 xl:pb-4 flex flex-col">
            {/* Label row */}
            <div className="flex items-center justify-between mb-2 xl:mb-3">
              <h3
                className="text-sm sm:text-base lg:text-lg font-bold text-stone-700 uppercase tracking-wide"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {label}
              </h3>
              {tooltip && <Tooltip title={tooltip.title} description={tooltip.description} />}
            </div>

            {/* Value */}
            <div className="mb-2 xl:mb-3">
              <span
                className="text-3xl sm:text-4xl xl:text-5xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {value}
              </span>
              {valueLabel && (
                <span className="text-base sm:text-lg xl:text-xl font-medium text-stone-400 ml-2">
                  {valueLabel}
                </span>
              )}
            </div>

            {/* Subtext */}
            <p className="text-sm sm:text-base lg:text-lg text-stone-500 leading-snug mb-2 xl:mb-3">
              {subtext}
            </p>

            {/* Footer */}
            <div className={`pt-2 xl:pt-3 border-t border-stone-100 ${hasButton ? 'flex items-center justify-between' : ''}`}>
              <StatusIndicator status={status} />
              {hasExpandable && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    isExpanded
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span className="hidden sm:inline">{isExpanded ? 'Close' : expandButtonLabel}</span>
                  <span className="sm:hidden">{isExpanded ? 'Close' : expandButtonLabelMobile}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
              {hasNavigation && !hasExpandable && (
                <button
                  onClick={() => navigate(navigateTo!.path)}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 bg-stone-100 text-stone-600 hover:bg-stone-200"
                >
                  <span className="hidden sm:inline">{navigateTo!.label}</span>
                  <span className="sm:hidden">{navigateTo!.labelMobile || navigateTo!.label}</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Panel - rendered via Portal to escape overflow clipping */}
      {hasExpandable && isExpanded && portalPosition && createPortal(
        <div
          id={`metric-card-portal-${label}`}
          className="fixed z-[9999] transition-opacity duration-300"
          style={{
            top: portalPosition.top,
            left: portalPosition.left,
            width: portalPosition.width,
          }}
        >
          <div
            className="bg-white border-t border-stone-100 rounded-b-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            {expandableContent}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// =============================================================================
// BAR CHART COMPONENT (for expandable content)
// =============================================================================

export interface BarChartItem {
  label: string;
  value: number;
  displayValue?: string;
}

export interface ExpandableBarChartProps {
  data: BarChartItem[];
  totalLabel?: string;
  isExpanded?: boolean;
}

/**
 * ExpandableBarChart - Simple horizontal bar chart for use in MetricCard expandable content
 *
 * @example
 * <ExpandableBarChart
 *   data={[
 *     { label: 'Week 1', value: 38200, displayValue: '$38.2k' },
 *     { label: 'Week 2', value: 41500, displayValue: '$41.5k' },
 *   ]}
 *   totalLabel="total this month"
 *   isExpanded={true}
 * />
 */
export const ExpandableBarChart: React.FC<ExpandableBarChartProps> = ({
  data,
  totalLabel,
  isExpanded = true,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };

  return (
    <>
      <div className="space-y-3">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;

          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-stone-500 w-28 shrink-0">{item.label}</span>
              <div className="flex-1 h-8 bg-stone-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-stone-800 rounded-lg transition-all duration-700 ease-out"
                  style={{
                    width: isExpanded ? `${barWidth}%` : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                />
              </div>
              <span className="text-sm font-bold text-stone-800 w-12 text-right">
                {item.displayValue || formatValue(item.value)}
              </span>
            </div>
          );
        })}
      </div>

      {totalLabel && (
        <div className="mt-4 pt-3 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            <span className="font-bold text-stone-800">{formatValue(total)}</span> {totalLabel}
          </p>
        </div>
      )}
    </>
  );
};

export default MetricCard;
