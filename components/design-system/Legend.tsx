import React from 'react';

// =============================================================================
// LEGEND COMPONENT SYSTEM
// =============================================================================
// Unified legend system for consistent styling across all chart components.
// Provides multiple variants for different contexts while maintaining visual
// consistency in typography, spacing, and color handling.
//
// Design Philosophy:
// - All legends use hex colors (not Tailwind classes) for consistency
// - Rounded indicators (dots) are the default, with line variant for line charts
// - Typography uses the design system's Tiempos Headline for labels
// - Consistent spacing and sizing across all variants
// =============================================================================

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface LegendItem {
  /** Display label */
  label: string;
  /** Color value (hex code, e.g., '#3b82f6') */
  color: string;
  /** Indicator type: 'dot' for bars/areas, 'line' for line charts */
  type?: 'dot' | 'line';
  /** Optional value to display alongside label */
  value?: string | number;
  /** Optional percentage to display as badge */
  percent?: number;
}

export type LegendVariant =
  | 'inline'      // Horizontal row in card headers (ChartCard, ExpandedModal)
  | 'floating'    // Floating overlay with backdrop blur (BarChart top-right)
  | 'stacked'     // Vertical list with values (DonutChartCard wide mode)
  | 'grid'        // 2-column grid (DonutChartCard medium mode)
  | 'compact'     // Simple horizontal wrap (DonutChartCard compact, SplitBarCard)
  | 'chart';      // Inside chart area (Recharts replacement)

export type LegendSize = 'sm' | 'md' | 'lg';

export interface LegendProps {
  /** Legend items to display */
  items: LegendItem[];
  /** Display variant */
  variant?: LegendVariant;
  /** Size variant */
  size?: LegendSize;
  /** Currently hovered item label (for interactive highlighting) */
  hoveredItem?: string | null;
  /** Callback when an item is hovered */
  onItemHover?: (item: LegendItem | null) => void;
  /** Whether legend is interactive (shows hover states) */
  interactive?: boolean;
  /** Additional className */
  className?: string;
}

// -----------------------------------------------------------------------------
// SIZE CONFIGURATIONS
// -----------------------------------------------------------------------------

const SIZE_CONFIG = {
  sm: {
    dotSize: 'w-2.5 h-2.5',
    lineSize: 'w-6 h-0.5',
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    gap: 'gap-1.5',
    itemGap: 'gap-3',
    padding: 'px-3 py-2',
    badgePadding: 'px-1.5 py-0.5',
    badgeSize: 'text-xs',
  },
  md: {
    dotSize: 'w-3 h-3',
    lineSize: 'w-8 h-1',
    fontSize: 'text-sm',
    fontWeight: 'font-semibold',
    gap: 'gap-2',
    itemGap: 'gap-4',
    padding: 'px-4 py-2.5',
    badgePadding: 'px-2 py-0.5',
    badgeSize: 'text-xs',
  },
  lg: {
    dotSize: 'w-4 h-4',
    lineSize: 'w-10 h-1.5',
    fontSize: 'text-base',
    fontWeight: 'font-semibold',
    gap: 'gap-2.5',
    itemGap: 'gap-5',
    padding: 'px-5 py-3',
    badgePadding: 'px-2.5 py-1',
    badgeSize: 'text-sm',
  },
} as const;

// -----------------------------------------------------------------------------
// LEGEND INDICATOR (DOT OR LINE)
// -----------------------------------------------------------------------------

interface LegendIndicatorProps {
  type: 'dot' | 'line';
  color: string;
  size: LegendSize;
  isHovered?: boolean;
}

const LegendIndicator: React.FC<LegendIndicatorProps> = ({
  type,
  color,
  size,
  isHovered = false,
}) => {
  const config = SIZE_CONFIG[size];

  if (type === 'line') {
    return (
      <div
        className={`${config.lineSize} rounded-full flex-shrink-0 transition-all duration-200`}
        style={{
          backgroundColor: color,
          boxShadow: isHovered ? `0 0 8px ${color}60` : undefined,
          transform: isHovered ? 'scaleX(1.1)' : undefined,
        }}
      />
    );
  }

  return (
    <div
      className={`${config.dotSize} rounded-full flex-shrink-0 transition-all duration-200`}
      style={{
        backgroundColor: color,
        boxShadow: isHovered ? `0 0 8px ${color}60` : `0 1px 3px ${color}30`,
        transform: isHovered ? 'scale(1.15)' : undefined,
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// LEGEND ITEM COMPONENT
// -----------------------------------------------------------------------------

interface LegendItemComponentProps {
  item: LegendItem;
  size: LegendSize;
  variant: LegendVariant;
  isHovered?: boolean;
  interactive?: boolean;
  onHover?: (item: LegendItem | null) => void;
  showValue?: boolean;
  showPercent?: boolean;
}

const LegendItemComponent: React.FC<LegendItemComponentProps> = ({
  item,
  size,
  variant,
  isHovered = false,
  interactive = false,
  onHover,
  showValue = false,
  showPercent = false,
}) => {
  const config = SIZE_CONFIG[size];
  const indicatorType = item.type || 'dot';

  // Base styles for all variants
  const baseStyles = `flex items-center ${config.gap} transition-all duration-200`;

  // Interactive styles
  const interactiveStyles = interactive
    ? 'cursor-pointer'
    : '';

  // Hover opacity for non-hovered items when something is hovered
  const opacityStyle = interactive && isHovered === false && onHover
    ? 'opacity-60'
    : 'opacity-100';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${opacityStyle}`}
      onMouseEnter={() => interactive && onHover?.(item)}
      onMouseLeave={() => interactive && onHover?.(null)}
    >
      <LegendIndicator
        type={indicatorType}
        color={item.color}
        size={size}
        isHovered={isHovered}
      />

      <span
        className={`${config.fontSize} ${config.fontWeight} text-stone-700 transition-colors duration-200`}
        style={{
          fontFamily: variant === 'stacked' ? "'Tiempos Headline', Georgia, serif" : undefined,
          color: isHovered ? item.color : undefined,
        }}
      >
        {item.label}
      </span>

      {showValue && item.value !== undefined && (
        <span
          className={`${config.fontSize} font-bold tabular-nums text-stone-900`}
          style={{
            fontFamily: "'Tiempos Headline', Georgia, serif",
            color: isHovered ? item.color : undefined,
          }}
        >
          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
        </span>
      )}

      {showPercent && item.percent !== undefined && (
        <span
          className={`${config.badgeSize} ${config.badgePadding} rounded-lg font-bold tabular-nums`}
          style={{
            backgroundColor: `${item.color}18`,
            color: item.color,
          }}
        >
          {item.percent.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN LEGEND COMPONENT
// -----------------------------------------------------------------------------

/**
 * Legend - Unified legend component for all chart types
 *
 * @example Inline variant (for ChartCard headers)
 * ```tsx
 * <Legend
 *   items={[
 *     { label: 'Revenue', color: '#10b981', type: 'dot' },
 *     { label: 'Goal', color: '#f59e0b', type: 'line' },
 *   ]}
 *   variant="inline"
 * />
 * ```
 *
 * @example Floating variant (for BarChart overlay)
 * ```tsx
 * <Legend
 *   items={segments}
 *   variant="floating"
 *   interactive
 *   hoveredItem={hoveredSegment}
 *   onItemHover={setHoveredSegment}
 * />
 * ```
 *
 * @example Stacked variant (for DonutChartCard)
 * ```tsx
 * <Legend
 *   items={segments.map(s => ({
 *     ...s,
 *     value: formatValue(s.value),
 *     percent: (s.value / total) * 100,
 *   }))}
 *   variant="stacked"
 *   interactive
 * />
 * ```
 */
export const Legend: React.FC<LegendProps> = ({
  items,
  variant = 'inline',
  size = 'md',
  hoveredItem,
  onItemHover,
  interactive = false,
  className = '',
}) => {
  const config = SIZE_CONFIG[size];

  // Determine if any item is hovered
  const hasHoveredItem = hoveredItem !== null && hoveredItem !== undefined;

  // ---------------------------------------------------------------------
  // INLINE VARIANT - Horizontal row for card headers
  // ---------------------------------------------------------------------
  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center ${config.itemGap} bg-stone-50 rounded-xl ${config.padding} ${className}`}
        style={{
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            {idx > 0 && <div className="w-px h-5 bg-stone-200" />}
            <LegendItemComponent
              item={item}
              size={size}
              variant={variant}
              isHovered={hasHoveredItem ? hoveredItem === item.label : undefined}
              interactive={interactive}
              onHover={onItemHover}
            />
          </React.Fragment>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // FLOATING VARIANT - Overlay with backdrop blur
  // ---------------------------------------------------------------------
  if (variant === 'floating') {
    return (
      <div
        className={`flex items-center ${config.itemGap} rounded-xl ${config.padding} transition-all duration-150 ${className}`}
        style={{
          backgroundColor: hasHoveredItem && hoveredItem
            ? `${items.find(i => i.label === hoveredItem)?.color}12`
            : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        }}
      >
        {items.map((item) => (
          <LegendItemComponent
            key={item.label}
            item={item}
            size={size}
            variant={variant}
            isHovered={hasHoveredItem ? hoveredItem === item.label : undefined}
            interactive={interactive}
            onHover={onItemHover}
          />
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // STACKED VARIANT - Vertical list with values (DonutChartCard wide)
  // ---------------------------------------------------------------------
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {items.map((item, idx) => {
          const isItemHovered = hasHoveredItem ? hoveredItem === item.label : undefined;
          const staggerDelay = 200 + idx * 60;

          return (
            <div
              key={item.label}
              className={`relative rounded-xl cursor-pointer overflow-hidden transition-all duration-200 ${
                isItemHovered ? 'scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background: isItemHovered
                  ? `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)`
                  : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                boxShadow: isItemHovered
                  ? `0 6px 20px -4px ${item.color}30, inset 0 0 0 1px ${item.color}25`
                  : '0 2px 8px -2px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
                animationDelay: `${staggerDelay}ms`,
              }}
              onMouseEnter={() => interactive && onItemHover?.(item)}
              onMouseLeave={() => interactive && onItemHover?.(null)}
            >
              <div className={`relative flex items-center ${config.gap} py-3 px-4`}>
                <LegendIndicator
                  type={item.type || 'dot'}
                  color={item.color}
                  size={size}
                  isHovered={isItemHovered}
                />

                <span
                  className={`flex-1 text-stone-700 ${config.fontWeight} ${config.fontSize}`}
                  style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                >
                  {item.label}
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.value !== undefined && (
                    <span
                      className={`text-stone-900 font-bold ${config.fontSize} tabular-nums`}
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    </span>
                  )}
                  {item.percent !== undefined && (
                    <span
                      className={`${config.badgePadding} rounded-lg ${config.badgeSize} font-bold tabular-nums`}
                      style={{
                        backgroundColor: `${item.color}18`,
                        color: item.color,
                      }}
                    >
                      {item.percent.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // GRID VARIANT - 2-column grid (DonutChartCard medium)
  // ---------------------------------------------------------------------
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {items.map((item) => {
          const isItemHovered = hasHoveredItem ? hoveredItem === item.label : undefined;

          return (
            <div
              key={item.label}
              className={`flex items-center ${config.gap} ${config.padding} rounded-xl cursor-pointer transition-all duration-200`}
              style={{
                background: isItemHovered
                  ? `${item.color}12`
                  : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.03)',
              }}
              onMouseEnter={() => interactive && onItemHover?.(item)}
              onMouseLeave={() => interactive && onItemHover?.(null)}
            >
              <LegendIndicator
                type={item.type || 'dot'}
                color={item.color}
                size={size}
                isHovered={isItemHovered}
              />

              <span
                className={`flex-1 text-stone-700 ${config.fontWeight} ${config.fontSize} truncate`}
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                {item.label}
              </span>

              {item.percent !== undefined && (
                <span
                  className={`${config.fontSize} font-bold tabular-nums flex-shrink-0`}
                  style={{ color: item.color }}
                >
                  {item.percent.toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // COMPACT VARIANT - Simple horizontal wrap
  // ---------------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap justify-center gap-x-5 gap-y-2.5 ${className}`}>
        {items.map((item) => {
          const isItemHovered = hasHoveredItem ? hoveredItem === item.label : undefined;

          return (
            <div
              key={item.label}
              className={`flex items-center ${config.gap} cursor-pointer transition-opacity duration-200`}
              style={{
                opacity: hasHoveredItem && !isItemHovered ? 0.5 : 1,
              }}
              onMouseEnter={() => interactive && onItemHover?.(item)}
              onMouseLeave={() => interactive && onItemHover?.(null)}
            >
              <LegendIndicator
                type={item.type || 'dot'}
                color={item.color}
                size={size}
                isHovered={isItemHovered}
              />

              <span className={`text-stone-600 ${config.fontSize} ${config.fontWeight}`}>
                {item.label}
              </span>

              {item.percent !== undefined && (
                <span
                  className={`${config.fontSize} font-bold`}
                  style={{ color: item.color }}
                >
                  {item.percent.toFixed(0)}%
                </span>
              )}

              {item.value !== undefined && !item.percent && (
                <span className="text-stone-400 text-sm">
                  ({typeof item.value === 'number' ? item.value.toLocaleString() : item.value})
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // CHART VARIANT - For use inside chart area (Recharts replacement)
  // ---------------------------------------------------------------------
  if (variant === 'chart') {
    return (
      <div className={`flex items-center justify-end ${config.itemGap} pb-2 ${className}`}>
        {items.map((item) => (
          <div key={item.label} className={`flex items-center ${config.gap}`}>
            <LegendIndicator
              type={item.type || 'dot'}
              color={item.color}
              size={size}
            />
            <span className={`text-stone-600 ${config.fontSize} ${config.fontWeight}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default fallback to inline
  return (
    <div className={`flex items-center ${config.itemGap} ${className}`}>
      {items.map((item) => (
        <LegendItemComponent
          key={item.label}
          item={item}
          size={size}
          variant="inline"
        />
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// HOVER INFO DISPLAY COMPONENT
// -----------------------------------------------------------------------------
// Replaces legend with contextual hover information (used by BarChart)
// -----------------------------------------------------------------------------

export interface HoverInfoDisplayProps {
  /** Label of the data point (e.g., month) */
  label: string;
  /** Segment/series label */
  segmentLabel: string;
  /** Value of the hovered item */
  value: number | string;
  /** Color of the segment */
  color: string;
  /** Format function for value display */
  formatValue?: (value: number) => string;
  /** Size variant */
  size?: LegendSize;
  /** Additional className */
  className?: string;
}

/**
 * HoverInfoDisplay - Contextual hover information that can replace a legend
 *
 * @example
 * ```tsx
 * {hoveredBar ? (
 *   <HoverInfoDisplay
 *     label={hoveredBar.label}
 *     segmentLabel={hoveredBar.segmentLabel}
 *     value={hoveredBar.value}
 *     color={hoveredBar.color}
 *   />
 * ) : (
 *   <Legend items={segments} variant="floating" />
 * )}
 * ```
 */
export const HoverInfoDisplay: React.FC<HoverInfoDisplayProps> = ({
  label,
  segmentLabel,
  value,
  color,
  formatValue,
  size = 'md',
  className = '',
}) => {
  const config = SIZE_CONFIG[size];
  const displayValue = typeof value === 'number' && formatValue
    ? formatValue(value)
    : typeof value === 'number'
      ? value.toLocaleString()
      : value;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl ${config.padding} transition-all duration-150 ${className}`}
      style={{
        backgroundColor: `${color}12`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: `0 2px 12px -2px ${color}20, 0 0 0 1px ${color}15`,
      }}
    >
      <div
        className={`${config.dotSize} rounded-full flex-shrink-0`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}50`,
        }}
      />
      <span className={`text-stone-700 ${config.fontWeight} ${config.fontSize}`}>
        {segmentLabel}
      </span>
      <span
        className={`${config.fontSize} font-bold`}
        style={{ color }}
      >
        {displayValue}
      </span>
      <span className="text-stone-500 text-sm">
        in {label}
      </span>
    </div>
  );
};

export default Legend;
