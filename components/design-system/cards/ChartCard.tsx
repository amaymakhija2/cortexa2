import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Legend } from '../Legend';
import type { LegendItem as UnifiedLegendItem } from '../Legend';

// =============================================================================
// CHART CARD COMPONENT
// =============================================================================
// Container for charts with header, legend, expand functionality, and insights.
// Now uses the unified Legend component for consistent styling.
// =============================================================================

export interface LegendItem {
  /** Legend label */
  label: string;
  /** Color indicator type: 'box' maps to 'dot', 'line' stays as 'line' */
  type: 'box' | 'line';
  /** Color value (hex code, e.g., '#3b82f6') - Tailwind classes are deprecated */
  color: string;
}

// Helper to extract hex color from Tailwind class (backward compatibility)
// Maps common Tailwind bg-* classes to hex values
const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-blue-600': '#2563eb',
  'bg-emerald-500': '#10b981',
  'bg-emerald-600': '#059669',
  'bg-green-500': '#22c55e',
  'bg-amber-500': '#f59e0b',
  'bg-amber-600': '#d97706',
  'bg-rose-500': '#f43f5e',
  'bg-rose-600': '#e11d48',
  'bg-red-500': '#ef4444',
  'bg-stone-400': '#a8a29e',
  'bg-stone-500': '#78716c',
  'bg-violet-500': '#8b5cf6',
  'bg-violet-600': '#7c3aed',
  'bg-indigo-500': '#6366f1',
  'bg-indigo-600': '#4f46e5',
  'bg-cyan-500': '#06b6d4',
  'bg-teal-500': '#14b8a6',
  'bg-pink-500': '#ec4899',
  'bg-orange-500': '#f97316',
  'bg-gray-500': '#6b7280',
  // Gradient classes - extract the primary color
  'bg-gradient-to-b from-amber-400 to-amber-500': '#f59e0b',
  'bg-gradient-to-b from-emerald-400 to-emerald-500': '#10b981',
};

const extractHexFromTailwind = (tailwindClass: string): string => {
  // If it's already a hex color, return it
  if (tailwindClass.startsWith('#')) return tailwindClass;

  // Try to find in our mapping
  const hex = TAILWIND_TO_HEX[tailwindClass];
  if (hex) return hex;

  // Try to extract color from class name pattern (e.g., bg-blue-500)
  const match = tailwindClass.match(/bg-(\w+)-(\d+)/);
  if (match) {
    const baseKey = `bg-${match[1]}-${match[2]}`;
    if (TAILWIND_TO_HEX[baseKey]) return TAILWIND_TO_HEX[baseKey];
  }

  // Fallback to stone
  console.warn(`Unknown Tailwind color class: ${tailwindClass}, using fallback`);
  return '#78716c';
};

export interface InsightItem {
  /** Insight value */
  value: string | number;
  /** Insight label */
  label: string;
  /** Background color class */
  bgColor?: string;
  /** Text color class */
  textColor?: string;
}

export interface ChartCardProps {
  /** Card title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Legend items */
  legend?: LegendItem[];
  /** Show expand button */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Insights row at bottom */
  insights?: InsightItem[];
  /** Value indicator box (right side of header) */
  valueIndicator?: {
    value: string | number;
    label: string;
    bgColor?: string;
    textColor?: string;
  };
  /** Custom controls in header (ToggleButton, GoalIndicator, ActionButton, etc.) */
  headerControls?: React.ReactNode;
  /** Minimum height for the card */
  minHeight?: string;
  /** Additional className */
  className?: string;
  /** Chart content */
  children: React.ReactNode;
}

/**
 * ChartCard - Container for charts with full features
 *
 * @example
 * <ChartCard
 *   title="Caseload Capacity"
 *   subtitle="Active clients & capacity rate over time"
 *   legend={[
 *     { label: 'Active Clients', type: 'box', color: 'bg-gradient-to-b from-amber-400 to-amber-500' },
 *     { label: 'Capacity %', type: 'line', color: 'bg-emerald-500' }
 *   ]}
 *   expandable
 *   onExpand={() => setExpanded('capacity')}
 *   insights={[
 *     { value: 148, label: 'Avg Clients', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
 *     { value: '84%', label: 'Avg Capacity', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
 *     { value: 'Jun', label: 'Peak (87%)', bgColor: 'bg-stone-100', textColor: 'text-stone-800' }
 *   ]}
 * >
 *   <YourChart data={data} />
 * </ChartCard>
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  legend,
  expandable = false,
  onExpand,
  insights,
  valueIndicator,
  headerControls,
  minHeight = '480px',
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 2xl:p-12 relative flex flex-col overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: 'var(--shadow-card)',
        minHeight,
      }}
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 mb-8">
        <div>
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-3 tracking-tight"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-600 text-base sm:text-lg xl:text-xl">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Custom Header Controls (ToggleButton, GoalIndicator, ActionButton, etc.) */}
          {headerControls}

          {/* Value Indicator */}
          {valueIndicator && (
            <div className={`${valueIndicator.bgColor || 'bg-stone-50'} rounded-xl px-5 py-3 text-center`}>
              <div
                className={`${valueIndicator.textColor || 'text-stone-900'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
              >
                {valueIndicator.value}
              </div>
              <div className="text-stone-500 text-sm font-medium">{valueIndicator.label}</div>
            </div>
          )}

          {/* Legend - using unified Legend component */}
          {legend && legend.length > 0 && (
            <Legend
              items={legend.map((item) => ({
                label: item.label,
                color: item.color.startsWith('#') ? item.color : extractHexFromTailwind(item.color),
                type: item.type === 'box' ? 'dot' : 'line',
              }))}
              variant="inline"
              size="md"
            />
          )}

        </div>
      </div>

      {/* Expand Button - Absolute positioned in top right */}
      {expandable && (
        <button
          onClick={onExpand}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 xl:top-8 xl:right-8 p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          title="Expand chart"
        >
          <Maximize2 size={18} strokeWidth={2} />
        </button>
      )}

      {/* Chart Area */}
      <div className="flex-1 min-h-[280px]">
        {children}
      </div>

      {/* Insights Row */}
      {insights && insights.length > 0 && (
        <div className={`grid grid-cols-${insights.length} gap-4 pt-3 mt-4 border-t-2 border-stone-100`}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${insight.bgColor || 'bg-stone-100'} rounded-xl p-4 text-center`}
            >
              <div
                className={`${insight.textColor || 'text-stone-800'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
              >
                {insight.value}
              </div>
              <div className="text-stone-600 text-sm sm:text-base font-medium mt-1">
                {insight.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SIMPLE CHART CARD
// =============================================================================
// Simpler version without legend/insights for basic charts
// =============================================================================

export interface MetricIndicator {
  /** The metric value */
  value: string | number;
  /** Label for the metric */
  label: string;
  /** Background color (hex) */
  bgColor?: string;
  /** Text color (hex) */
  textColor?: string;
  /** Accent color for subtle left border (hex) */
  accentColor?: string;
  /** Whether this is the primary/highlighted metric */
  isPrimary?: boolean;
}

export interface SimpleChartCardProps {
  /** Card title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Metric indicators displayed as elegant boxes in header (e.g., Your Avg, Industry, Last Year) */
  metrics?: MetricIndicator[];
  /** Insights row at bottom (same as ChartCard) */
  insights?: InsightItem[];
  /** Show expand button */
  expandable?: boolean;
  /** Callback when expand is clicked */
  onExpand?: () => void;
  /** Chart height */
  height?: string;
  /** Additional className */
  className?: string;
  /** Chart content */
  children: React.ReactNode;
}

/**
 * SimpleChartCard - Simpler chart container with maximum space utilization
 *
 * @example
 * <SimpleChartCard
 *   title="Session Goal %"
 *   subtitle="Percentage of session goal achieved"
 *   valueIndicator={{ value: '85%', label: 'Average', bgColor: 'bg-blue-50', textColor: 'text-blue-600' }}
 *   expandable
 * >
 *   <LineChart ... />
 * </SimpleChartCard>
 */
export const SimpleChartCard: React.FC<SimpleChartCardProps> = ({
  title,
  subtitle,
  metrics,
  insights,
  expandable = false,
  onExpand,
  height = '620px',
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-5 sm:p-6 xl:p-8 overflow-hidden flex flex-col relative ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: 'var(--shadow-card)',
        minHeight: height,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Metrics row - elegant comparison boxes */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-stretch gap-2.5 sm:gap-3">
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-center overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                    metric.isPrimary ? 'ring-1 ring-stone-200/60' : ''
                  }`}
                  style={{
                    background: metric.bgColor || '#f5f5f4',
                    minWidth: '90px',
                  }}
                >
                  {/* Subtle left accent bar for non-primary metrics */}
                  {metric.accentColor && !metric.isPrimary && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                      style={{
                        backgroundColor: metric.accentColor,
                        opacity: 0.8,
                      }}
                    />
                  )}

                  {/* Value */}
                  <div
                    className="text-xl sm:text-2xl xl:text-3xl font-bold leading-none"
                    style={{
                      fontFamily: "'Suisse Intl', system-ui, sans-serif",
                      color: metric.textColor || '#44403c',
                    }}
                  >
                    {metric.value}
                  </div>

                  {/* Label */}
                  <div className="text-stone-500 text-sm sm:text-base font-medium mt-1.5">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Expand button - Absolute positioned in top right */}
      {expandable && (
        <button
          onClick={onExpand}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 xl:top-6 xl:right-6 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          title="Expand chart"
        >
          <Maximize2 size={16} strokeWidth={2} />
        </button>
      )}

      {/* Chart Area */}
      <div className="flex-1 min-h-[280px]">
        {children}
      </div>

      {/* Insights Row - same styling as ChartCard */}
      {insights && insights.length > 0 && (
        <div
          className="grid gap-4 pt-3 mt-4 border-t-2 border-stone-100"
          style={{ gridTemplateColumns: `repeat(${insights.length}, 1fr)` }}
        >
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${insight.bgColor || 'bg-stone-100'} rounded-xl p-4 text-center`}
            >
              <div
                className={`${insight.textColor || 'text-stone-800'} text-2xl sm:text-3xl font-bold`}
                style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
              >
                {insight.value}
              </div>
              <div className="text-stone-600 text-sm sm:text-base font-medium mt-1">
                {insight.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// EXPANDED CHART MODAL
// =============================================================================
// Immersive fullscreen modal for expanded charts.
// Provides a centralized, consistent expanded experience for all chart components.
// =============================================================================

export interface ExpandedChartModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Subtitle */
  subtitle?: string;
  /** Legend items (displayed in header) */
  legend?: LegendItem[];
  /** Custom header controls (ToggleButton, GoalIndicator, ActionButton, etc.) */
  headerControls?: React.ReactNode;
  /** Insights row at the bottom (optional) */
  insights?: InsightItem[];
  /** Modal content */
  children: React.ReactNode;
}

/**
 * ExpandedChartModal - Immersive fullscreen modal for charts
 *
 * Features:
 * - 95vw x 90vh immersive viewport
 * - Blur backdrop with elegant shadows
 * - Large typography for titles/subtitles
 * - Support for header controls (toggles, buttons, indicators)
 * - Optional legend display
 * - Optional insights row at bottom
 *
 * @example Basic usage
 * ```tsx
 * <ExpandedChartModal
 *   isOpen={expanded === 'revenue'}
 *   onClose={() => setExpanded(null)}
 *   title="Revenue Performance"
 *   subtitle="Monthly breakdown with goal tracking"
 * >
 *   <BarChart data={data} size="lg" />
 * </ExpandedChartModal>
 * ```
 *
 * @example With header controls
 * ```tsx
 * <ExpandedChartModal
 *   isOpen={expanded === 'revenue'}
 *   onClose={() => setExpanded(null)}
 *   title="Revenue Performance"
 *   subtitle="Monthly breakdown"
 *   headerControls={
 *     <>
 *       <ToggleButton label="By Clinician" active={showBreakdown} onToggle={toggle} />
 *       <GoalIndicator value="$150k" label="Goal" color="amber" />
 *       <ActionButton label="Export" icon={<Download />} />
 *     </>
 *   }
 * >
 *   <BarChart data={data} size="lg" />
 * </ExpandedChartModal>
 * ```
 */
export const ExpandedChartModal: React.FC<ExpandedChartModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  legend,
  headerControls,
  insights,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - full screen on mobile, offset by sidebar on desktop */}
      {/* Uses CSS variable --sidebar-width set by App.tsx */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{
          left: 'var(--sidebar-width, 0px)',
          backgroundColor: 'rgba(28, 25, 23, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />

      {/* Modal container - respects sidebar on desktop */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8 lg:p-10"
        style={{
          left: 'var(--sidebar-width, 0px)',
        }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[98%] lg:max-w-[96%] h-[90vh] rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-all duration-200 hover:scale-105 active:scale-95 group"
          title="Close"
        >
          <Minimize2 size={22} strokeWidth={2} className="group-hover:rotate-180 transition-transform duration-300" />
        </button>

        {/* Content */}
        <div className="p-8 sm:p-12 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 flex-shrink-0">
            <div>
              <h3
                className="text-stone-900 text-3xl sm:text-4xl xl:text-5xl font-bold mb-3 tracking-tight"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl">{subtitle}</p>
              )}
            </div>

            {/* Right side: Controls and/or Legend */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Custom Header Controls */}
              {headerControls}

              {/* Legend - using unified Legend component */}
              {legend && legend.length > 0 && (
                <Legend
                  items={legend.map((item) => ({
                    label: item.label,
                    color: item.color.startsWith('#') ? item.color : extractHexFromTailwind(item.color),
                    type: item.type === 'box' ? 'dot' : 'line',
                  }))}
                  variant="inline"
                  size="lg"
                />
              )}
            </div>
          </div>

          {/* Chart Content */}
          <div className="flex-1 min-h-0">
            {children}
          </div>

          {/* Insights Row (optional) */}
          {insights && insights.length > 0 && (
            <div className="grid gap-6 pt-6 mt-4 border-t-2 border-stone-100 flex-shrink-0" style={{ gridTemplateColumns: `repeat(${insights.length}, 1fr)` }}>
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`${insight.bgColor || 'bg-stone-100'} rounded-2xl p-6 text-center`}
                >
                  <div
                    className={`${insight.textColor || 'text-stone-800'} text-3xl sm:text-4xl font-bold`}
                    style={{ fontFamily: "'Suisse Intl', system-ui, sans-serif" }}
                  >
                    {insight.value}
                  </div>
                  <div className="text-stone-600 text-base sm:text-lg font-medium mt-2">
                    {insight.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default ChartCard;
