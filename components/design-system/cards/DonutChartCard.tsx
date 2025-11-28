import React, { useState, useMemo } from 'react';
import { Maximize2 } from 'lucide-react';

// =============================================================================
// DONUT CHART CARD COMPONENT
// =============================================================================
// Premium donut/pie chart with center content, animated segments, and legend.
// Uses pure SVG for crisp rendering at any size.
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
  /** Donut size: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
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

// Size configurations
const sizeConfig = {
  sm: { size: 240, outerRadius: 110, innerRadius: 70, gap: 0.03 },
  md: { size: 320, outerRadius: 150, innerRadius: 95, gap: 0.02 },
  lg: { size: 400, outerRadius: 190, innerRadius: 120, gap: 0.015 },
};

/**
 * DonutChartCard - Premium donut chart with legend
 *
 * @example
 * <DonutChartCard
 *   title="Revenue Distribution"
 *   subtitle="Total across all months"
 *   segments={[
 *     { label: 'Clinician Costs', value: 450000, color: '#3b82f6' },
 *     { label: 'Net Revenue', value: 280000, color: '#10b981' },
 *   ]}
 *   centerLabel="Gross Revenue"
 *   centerValue="$1.73M"
 *   valueFormat="currency"
 *   expandable
 * />
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
  size = 'md',
  expandable = false,
  onExpand,
  onSegmentHover,
  className = '',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Get size config
  const config = sizeConfig[size];
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
  }, [segments, total, outerRadius, innerRadius, gap]);

  // Handle segment hover
  const handleSegmentHover = (segment: DonutSegment | null, percent: number) => {
    setHoveredSegment(segment?.label || null);
    onSegmentHover?.(segment, percent);
  };

  // Calculate center display value
  const displayCenterValue = centerValue !== undefined
    ? centerValue
    : formatValue(total, valueFormat, currencySymbol);

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl p-6 sm:p-8 xl:p-10 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 xl:mb-8">
        <div>
          <h3
            className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-stone-500 text-base sm:text-lg xl:text-xl">{subtitle}</p>
          )}
        </div>

        {expandable && (
          <button
            onClick={onExpand}
            className="p-2.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Expand chart"
          >
            <Maximize2 size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Chart + Legend Layout */}
      <div className="flex items-center justify-center gap-8 lg:gap-12 xl:gap-16">
        {/* SVG Donut */}
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
            {segmentPaths.map((segment) => {
              const isHovered = hoveredSegment === segment.label;
              return (
                <path
                  key={segment.label}
                  d={segment.path}
                  fill={segment.color}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 8px 16px ${segment.color}40) brightness(1.1)`
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${centerX}px ${centerY}px`,
                  }}
                  onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
                  onMouseLeave={() => handleSegmentHover(null, 0)}
                />
              );
            })}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerLabel && (
              <span className="text-stone-500 text-sm sm:text-base font-medium mb-1">
                {centerLabel}
              </span>
            )}
            <span
              className={`${centerValueColor} font-bold text-2xl sm:text-3xl lg:text-4xl`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {displayCenterValue}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 lg:gap-5 flex-1 max-w-[360px]">
          {segmentPaths.map((segment) => {
            const isHovered = hoveredSegment === segment.label;
            const percentDisplay = (segment.percent * 100).toFixed(1);

            return (
              <div
                key={segment.label}
                className={`relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  isHovered ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, ${segment.color}12 0%, ${segment.color}08 100%)`
                    : 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                  boxShadow: isHovered
                    ? `0 8px 24px -4px ${segment.color}25, 0 0 0 1px ${segment.color}20`
                    : '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                }}
                onMouseEnter={() => handleSegmentHover(segment, segment.percent * 100)}
                onMouseLeave={() => handleSegmentHover(null, 0)}
              >
                {/* Percentage bar background */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                  style={{
                    width: `${segment.percent * 100}%`,
                    background: `linear-gradient(90deg, ${segment.color}18 0%, ${segment.color}08 100%)`,
                  }}
                />

                <div className="relative flex items-center gap-4 py-4 px-5">
                  {/* Color indicator with glow */}
                  <div
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: segment.color,
                      boxShadow: isHovered
                        ? `0 0 20px ${segment.color}60, 0 0 8px ${segment.color}40`
                        : `0 0 12px ${segment.color}30`,
                    }}
                  />

                  {/* Label */}
                  <span
                    className="flex-1 text-stone-700 font-semibold text-sm lg:text-base truncate"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {segment.label}
                  </span>

                  {/* Value and Percentage - stacked for prominence */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-stone-900 font-bold text-base lg:text-lg xl:text-xl tabular-nums"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {formatValue(segment.value, valueFormat, currencySymbol)}
                    </span>

                    {/* Prominent percentage pill */}
                    <div
                      className="px-3 py-1.5 rounded-lg font-bold text-sm lg:text-base tabular-nums transition-all duration-300"
                      style={{
                        backgroundColor: isHovered ? segment.color : `${segment.color}15`,
                        color: isHovered ? '#fff' : segment.color,
                        boxShadow: isHovered
                          ? `0 4px 12px ${segment.color}40`
                          : 'none',
                      }}
                    >
                      {percentDisplay}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChartCard;
