import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Maximize2 } from 'lucide-react';

// =============================================================================
// DONUT CHART CARD COMPONENT
// =============================================================================
// Premium donut/pie chart with adaptive layouts based on container width.
// Switches between horizontal (wide) and vertical (narrow) layouts automatically.
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
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {displayCenterValue}
        </span>
      </div>
    </div>
  );

  // Render legend for WIDE layout - detailed cards on the right
  const renderWideLegend = () => (
    <div className="flex flex-col gap-3 xl:gap-4 flex-1 min-w-[220px] max-w-[380px]">
      {segmentPaths.map((segment, idx) => {
        const isHovered = hoveredSegment === segment.label;
        const percentDisplay = (segment.percent * 100).toFixed(1);
        const legendDelay = 200 + idx * 60;

        return (
          <div
            key={segment.label}
            className={`relative rounded-xl cursor-pointer overflow-hidden transition-transform duration-200 ${
              isHovered ? 'scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            style={{
              background: isHovered
                ? `linear-gradient(135deg, ${segment.color}12 0%, ${segment.color}06 100%)`
                : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
              boxShadow: isHovered
                ? `0 6px 20px -4px ${segment.color}30, inset 0 0 0 1px ${segment.color}25`
                : '0 2px 8px -2px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateX(0)' : 'translateX(20px)',
              transition: `opacity 400ms ease ${legendDelay}ms, transform 400ms ease ${legendDelay}ms, background 200ms ease, box-shadow 200ms ease`,
            }}
            onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
            onMouseLeave={() => handleSegmentHover(null, 0)}
          >
            <div className="relative flex items-center gap-3 xl:gap-4 py-3 xl:py-4 px-4 xl:px-5">
              {/* Color dot */}
              <div
                className="w-3.5 h-3.5 xl:w-4 xl:h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: segment.color,
                  boxShadow: `0 0 8px ${segment.color}50`,
                }}
              />

              {/* Label - matches design system typography */}
              <span
                className="flex-1 text-stone-700 font-semibold text-sm sm:text-base"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {segment.label}
              </span>

              {/* Value + Percent */}
              <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
                <span
                  className="text-stone-900 font-bold text-sm sm:text-base xl:text-lg tabular-nums"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {formatValue(segment.value, valueFormat, currencySymbol)}
                </span>
                <span
                  className="px-2 xl:px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold tabular-nums"
                  style={{
                    backgroundColor: `${segment.color}18`,
                    color: segment.color,
                  }}
                >
                  {percentDisplay}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render legend for MEDIUM layout - 2-column grid below
  const renderMediumLegend = () => (
    <div className="grid grid-cols-2 gap-3 w-full">
      {segmentPaths.map((segment, idx) => {
        const isHovered = hoveredSegment === segment.label;
        const percentDisplay = (segment.percent * 100).toFixed(1);
        const legendDelay = 200 + idx * 50;

        return (
          <div
            key={segment.label}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
            style={{
              background: isHovered ? `${segment.color}12` : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.03)',
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity 300ms ease ${legendDelay}ms, transform 300ms ease ${legendDelay}ms, background 150ms ease`,
            }}
            onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
            onMouseLeave={() => handleSegmentHover(null, 0)}
          >
            {/* Color dot */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />

            {/* Label */}
            <span
              className="flex-1 text-stone-700 font-medium text-sm truncate"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {segment.label}
            </span>

            {/* Percentage */}
            <span
              className="text-sm font-bold tabular-nums flex-shrink-0"
              style={{ color: segment.color }}
            >
              {percentDisplay}%
            </span>
          </div>
        );
      })}
    </div>
  );

  // Render legend for COMPACT layout - simple inline list below
  const renderCompactLegend = () => (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5">
      {segmentPaths.map((segment, idx) => {
        const isHovered = hoveredSegment === segment.label;
        const percentDisplay = (segment.percent * 100).toFixed(0);
        const legendDelay = 200 + idx * 40;

        return (
          <div
            key={segment.label}
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
            style={{
              opacity: isAnimated ? (isHovered ? 1 : 0.9) : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 300ms ease ${legendDelay}ms, transform 300ms ease ${legendDelay}ms`,
            }}
            onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
            onMouseLeave={() => handleSegmentHover(null, 0)}
          >
            {/* Color dot */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />

            {/* Label */}
            <span
              className="text-stone-600 text-sm font-medium"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {segment.label}
            </span>

            {/* Percentage */}
            <span
              className="text-sm font-bold"
              style={{ color: segment.color }}
            >
              {percentDisplay}%
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 2xl:p-12 overflow-hidden flex flex-col ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        minHeight: minHeight || undefined,
      }}
    >
      {/* Header - matches ChartCard design system */}
      <div className="flex items-start justify-between mb-6 xl:mb-8">
        <div className="min-w-0 flex-1">
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">
              {subtitle}
            </p>
          )}
        </div>

        {expandable && (
          <button
            onClick={onExpand}
            className="p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ml-3"
            title="Expand chart"
          >
            <Maximize2 size={18} strokeWidth={2} />
          </button>
        )}
      </div>

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
