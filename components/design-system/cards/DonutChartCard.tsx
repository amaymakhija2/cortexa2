import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { Legend } from '../Legend';
import type { LegendItem } from '../Legend';

// =============================================================================
// DONUT CHART CARD COMPONENT
// =============================================================================
// Premium donut/pie chart with adaptive layouts based on container width.
// Switches between horizontal (wide) and vertical (narrow) layouts automatically.
// Now uses the unified Legend component for consistent styling.
// =============================================================================

export interface DonutSegment {
  /** Segment label */
  label: string;
  /** Segment value (raw number) */
  value: number;
  /** Segment color (hex code) */
  color: string;
}

export type ValueFormat = 'number' | 'currency' | 'percentage' | 'compact';

export interface DonutChartCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Data segments */
  segments: DonutSegment[];
  /** Center label (e.g., "Total", "Show Rate") */
  centerLabel?: string;
  /** Center value - if not provided, calculates total */
  centerValue?: string | number;
  /** Center value color class */
  centerValueColor?: string;
  /** How to format legend values */
  valueFormat?: ValueFormat;
  /** Currency symbol for currency format */
  currencySymbol?: string;
  /** @deprecated - size is now auto-detected based on container width */
  size?: string;
  /** Minimum height for the card (for grid alignment) */
  minHeight?: string;
  /** Custom controls in header (ToggleButton, GoalIndicator, ActionButton, etc.) */
  headerControls?: React.ReactNode;
  /** Show expand button */
  expandable?: boolean;
  /** Expand callback */
  onExpand?: () => void;
  /** Segment hover callback */
  onSegmentHover?: (segment: DonutSegment | null, percent: number) => void;
  /** Additional className */
  className?: string;
}

// Format value based on format type
const formatValue = (
  value: number,
  format: ValueFormat,
  currencySymbol: string = '$'
): string => {
  switch (format) {
    case 'currency':
      if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(2)}M`;
      if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
      return `${currencySymbol}${value.toFixed(0)}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
      return value.toLocaleString();
    case 'number':
    default:
      return value.toLocaleString();
  }
};

// Layout modes based on container width
type LayoutMode = 'wide' | 'medium' | 'compact';

// Size configurations for donut based on layout mode
const layoutConfig = {
  wide: { size: 320, outerRadius: 150, innerRadius: 92, gap: 0.025 },
  medium: { size: 280, outerRadius: 130, innerRadius: 80, gap: 0.03 },
  compact: { size: 220, outerRadius: 100, innerRadius: 62, gap: 0.035 },
};

/**
 * DonutChartCard - Premium donut chart with adaptive layout
 *
 * Layout modes:
 * - Wide (≥650px): Horizontal - donut left, detailed legend cards right
 * - Medium (450-649px): Vertical - centered donut, 2-column legend grid below
 * - Compact (<450px): Vertical - smaller donut, simple inline legend below
 */
export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  subtitle,
  segments,
  centerLabel,
  centerValue,
  centerValueColor = 'text-stone-900',
  valueFormat = 'number',
  currencySymbol = '$',
  size: _size, // Deprecated - ignored, layout is auto-detected
  minHeight,
  headerControls,
  expandable = false,
  onExpand,
  onSegmentHover,
  className = '',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Responsive layout detection using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial measurement
    const initialWidth = containerRef.current.offsetWidth;
    if (initialWidth > 0) {
      setContainerWidth(initialWidth);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Determine layout mode based on container width
  const layoutMode: LayoutMode = useMemo(() => {
    if (containerWidth >= 650) return 'wide';
    if (containerWidth >= 450) return 'medium';
    return 'compact';
  }, [containerWidth]);

  // Get size config based on layout
  const config = layoutConfig[layoutMode];
  const { size: svgSize, outerRadius, innerRadius, gap } = config;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Calculate total
  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);

  // Create arc path for a segment
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    outerR: number,
    innerR: number
  ): string => {
    const startOuterX = centerX + outerR * Math.cos(startAngle);
    const startOuterY = centerY + outerR * Math.sin(startAngle);
    const endOuterX = centerX + outerR * Math.cos(endAngle);
    const endOuterY = centerY + outerR * Math.sin(endAngle);
    const startInnerX = centerX + innerR * Math.cos(endAngle);
    const startInnerY = centerY + innerR * Math.sin(endAngle);
    const endInnerX = centerX + innerR * Math.cos(startAngle);
    const endInnerY = centerY + innerR * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${startOuterX} ${startOuterY}
            A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
            L ${startInnerX} ${startInnerY}
            A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
            Z`;
  };

  // Calculate segment paths
  const segmentPaths = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top
    return segments.map((segment) => {
      const percent = segment.value / total;
      const angleSize = percent * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSize - gap;
      currentAngle += angleSize;

      return {
        ...segment,
        percent,
        path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
      };
    });
  }, [segments, total, outerRadius, innerRadius, gap, centerX, centerY]);

  // Handle segment hover
  const handleSegmentHover = (segment: DonutSegment | null, percent: number) => {
    setHoveredSegment(segment?.label || null);
    onSegmentHover?.(segment, percent);
  };

  // Calculate center display value
  const displayCenterValue = centerValue !== undefined
    ? centerValue
    : formatValue(total, valueFormat, currencySymbol);

  // Render the donut SVG
  const renderDonut = () => (
    <div className="relative flex-shrink-0" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} className="overflow-visible">
        {/* Subtle background ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="#f5f5f4"
          strokeWidth={outerRadius - innerRadius}
          opacity={0.5}
        />

        {/* Segments */}
        {segmentPaths.map((segment, idx) => {
          const isHovered = hoveredSegment === segment.label;
          const staggerDelay = idx * 80;
          return (
            <path
              key={segment.label}
              d={segment.path}
              fill={segment.color}
              className="cursor-pointer"
              style={{
                filter: isHovered
                  ? `drop-shadow(0 8px 16px ${segment.color}40) brightness(1.1)`
                  : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                transform: isAnimated
                  ? (isHovered ? 'scale(1.03)' : 'scale(1)')
                  : 'scale(0)',
                opacity: isAnimated ? 1 : 0,
                transformOrigin: `${centerX}px ${centerY}px`,
                transition: `transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}ms, opacity 400ms ease ${staggerDelay}ms, filter 300ms ease`,
              }}
              onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
              onMouseLeave={() => handleSegmentHover(null, 0)}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 400ms ease 300ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms',
        }}
      >
        {centerLabel && (
          <span className="text-stone-500 text-sm sm:text-base font-medium mb-1">
            {centerLabel}
          </span>
        )}
        <span
          className={`${centerValueColor} font-bold text-2xl sm:text-3xl xl:text-4xl`}
          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
        >
          {displayCenterValue}
        </span>
      </div>
    </div>
  );

  // Build legend items from segment data - using unified Legend component
  const legendItems: LegendItem[] = useMemo(() => {
    return segmentPaths.map((segment) => ({
      label: segment.label,
      color: segment.color,
      type: 'dot' as const,
      value: formatValue(segment.value, valueFormat, currencySymbol),
      percent: segment.percent * 100,
    }));
  }, [segmentPaths, valueFormat, currencySymbol]);

  // Handle legend item hover
  const handleLegendItemHover = (item: LegendItem | null) => {
    if (item) {
      const segment = segmentPaths.find((s) => s.label === item.label);
      if (segment) {
        handleSegmentHover(segment, segment.percent * 100);
      }
    } else {
      handleSegmentHover(null, 0);
    }
  };

  // Render legend for WIDE layout - using unified Legend stacked variant
  const renderWideLegend = () => (
    <div
      className="flex-1 min-w-[220px] max-w-[380px]"
      style={{
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 400ms ease 200ms, transform 400ms ease 200ms',
      }}
    >
      <Legend
        items={legendItems}
        variant="stacked"
        size="md"
        interactive
        hoveredItem={hoveredSegment}
        onItemHover={handleLegendItemHover}
      />
    </div>
  );

  // Render legend for MEDIUM layout - using unified Legend grid variant
  const renderMediumLegend = () => (
    <div
      className="w-full"
      style={{
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 300ms ease 200ms, transform 300ms ease 200ms',
      }}
    >
      <Legend
        items={legendItems}
        variant="grid"
        size="md"
        interactive
        hoveredItem={hoveredSegment}
        onItemHover={handleLegendItemHover}
      />
    </div>
  );

  // Render legend for COMPACT layout - using unified Legend compact variant
  const renderCompactLegend = () => (
    <div
      style={{
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 300ms ease 200ms, transform 300ms ease 200ms',
      }}
    >
      <Legend
        items={legendItems}
        variant="compact"
        size="sm"
        interactive
        hoveredItem={hoveredSegment}
        onItemHover={handleLegendItemHover}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 2xl:p-12 overflow-hidden flex flex-col relative ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: 'var(--shadow-card)',
        minHeight: minHeight || undefined,
      }}
    >
      {/* Header - matches ChartCard design system */}
      <div className="flex items-start justify-between mb-6 xl:mb-8">
        <div className="min-w-0 flex-1">
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Custom Header Controls (ToggleButton, etc.) */}
        {headerControls && (
          <div className="flex items-center gap-4 flex-wrap">
            {headerControls}
          </div>
        )}
      </div>

      {/* Expand button - Absolute positioned in top right */}
      {expandable && (
        <button
          onClick={onExpand}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 xl:top-8 xl:right-8 p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          title="Expand chart"
        >
          <Maximize2 size={18} strokeWidth={2} />
        </button>
      )}

      {/* Content - layout changes based on mode */}
      {layoutMode === 'wide' ? (
        // Wide: Horizontal layout
        <div className="flex items-center justify-center gap-8 flex-1">
          {renderDonut()}
          {renderWideLegend()}
        </div>
      ) : (
        // Medium & Compact: Vertical layout - legend pushed to bottom
        <div className="flex flex-col items-center flex-1 justify-between">
          <div className="flex-1 flex items-center">
            {renderDonut()}
          </div>
          {layoutMode === 'medium' ? renderMediumLegend() : renderCompactLegend()}
        </div>
      )}
    </div>
  );
};

export default DonutChartCard;
