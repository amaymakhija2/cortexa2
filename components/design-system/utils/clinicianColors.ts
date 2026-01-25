// =============================================================================
// CLINICIAN COLOR SYSTEM
// =============================================================================
// Scalable color assignment for clinician data visualization.
// Supports "Top N + Others" pattern for 20+ clinicians.
// =============================================================================

import type { SegmentConfig } from '../charts/BarChart';

// -----------------------------------------------------------------------------
// COLOR PALETTE
// -----------------------------------------------------------------------------
// 10 distinct, high-contrast colors for top performers
// These are carefully chosen for visual distinction and accessibility

export const CLINICIAN_COLOR_PALETTE = [
  { color: '#7c3aed', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' }, // Violet
  { color: '#0891b2', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)' }, // Cyan
  { color: '#d97706', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' }, // Amber
  { color: '#db2777', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)' }, // Pink
  { color: '#059669', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' }, // Emerald
  { color: '#4f46e5', gradient: 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)' }, // Indigo
  { color: '#dc2626', gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)' }, // Red
  { color: '#0284c7', gradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' }, // Sky
  { color: '#7c2d12', gradient: 'linear-gradient(180deg, #ea580c 0%, #7c2d12 100%)' }, // Orange
  { color: '#4338ca', gradient: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)' }, // Blue
] as const;

// "Others" segment styling - neutral gray with subtle gradient
export const OTHERS_SEGMENT_STYLE = {
  color: '#78716c',
  gradient: 'linear-gradient(180deg, #a8a29e 0%, #78716c 100%)',
} as const;

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface ClinicianData {
  /** Unique identifier for the clinician */
  key: string;
  /** Display name (e.g., "S Chen") */
  label: string;
  /** Total value for ranking (e.g., total sessions, revenue) */
  totalValue: number;
}

export interface ClinicianColorConfig {
  /** Top N clinicians with assigned colors */
  topClinicians: SegmentConfig[];
  /** "Others" segment config (if there are more than N clinicians) */
  othersSegment: SegmentConfig | null;
  /** All clinicians that are aggregated into "Others" */
  othersClinicians: ClinicianData[];
  /** Stack order for the bar chart (bottom to top) */
  stackOrder: string[];
  /** Map from clinician key to their color (for consistent reference) */
  colorMap: Record<string, { color: string; gradient: string }>;
}

export type ClinicianFilterOption = 'top5' | 'top7' | 'top10' | 'all' | 'custom';

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Calculate the top N clinicians based on total value
 * and create segment configurations for them.
 *
 * @param clinicians - Array of clinician data with totals
 * @param topN - Number of top clinicians to show (default: 5)
 * @param pinnedClinicians - Clinician keys that should always be visible
 * @returns Configuration for segments, colors, and "Others"
 */
export function getClinicianColorConfig(
  clinicians: ClinicianData[],
  topN: number = 5,
  pinnedClinicians: string[] = []
): ClinicianColorConfig {
  // Sort by total value (descending)
  const sorted = [...clinicians].sort((a, b) => b.totalValue - a.totalValue);

  // Separate pinned and unpinned
  const pinned = sorted.filter(c => pinnedClinicians.includes(c.key));
  const unpinned = sorted.filter(c => !pinnedClinicians.includes(c.key));

  // Calculate how many unpinned slots we have
  const unpinnedSlots = Math.max(0, topN - pinned.length);

  // Get top unpinned clinicians
  const topUnpinned = unpinned.slice(0, unpinnedSlots);

  // Combine pinned + top unpinned for display
  const topClinicians = [...pinned, ...topUnpinned];

  // Everyone else goes into "Others"
  const othersClinicians = unpinned.slice(unpinnedSlots);

  // Assign colors
  const colorMap: Record<string, { color: string; gradient: string }> = {};
  const topSegments: SegmentConfig[] = topClinicians.map((clinician, index) => {
    const colorConfig = CLINICIAN_COLOR_PALETTE[index % CLINICIAN_COLOR_PALETTE.length];
    colorMap[clinician.key] = colorConfig;
    return {
      key: clinician.key,
      label: clinician.label,
      color: colorConfig.color,
      gradient: colorConfig.gradient,
    };
  });

  // Create "Others" segment if needed
  const othersSegment: SegmentConfig | null = othersClinicians.length > 0
    ? {
        key: '__others__',
        label: `Others (${othersClinicians.length})`,
        color: OTHERS_SEGMENT_STYLE.color,
        gradient: OTHERS_SEGMENT_STYLE.gradient,
      }
    : null;

  // Stack order: Others at bottom, then ascending by value (so highest is on top)
  const stackOrder = [
    ...(othersSegment ? ['__others__'] : []),
    ...topSegments.map(s => s.key).reverse(),
  ];

  return {
    topClinicians: topSegments,
    othersSegment,
    othersClinicians,
    stackOrder,
    colorMap,
  };
}

/**
 * Transform raw clinician data to include the "Others" aggregation.
 *
 * @param data - Original data points with individual clinician values
 * @param colorConfig - Configuration from getClinicianColorConfig
 * @returns Data transformed to include __others__ key with aggregated values
 */
export function aggregateOthersData<T extends Record<string, unknown>>(
  data: T[],
  colorConfig: ClinicianColorConfig
): (T & { __others__?: number })[] {
  if (colorConfig.othersClinicians.length === 0) {
    return data;
  }

  return data.map(item => {
    const othersTotal = colorConfig.othersClinicians.reduce((sum, clinician) => {
      const value = item[clinician.key];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    return {
      ...item,
      __others__: othersTotal,
    };
  });
}

/**
 * Get the full segments array including "Others" if present.
 */
export function getAllSegments(colorConfig: ClinicianColorConfig): SegmentConfig[] {
  return colorConfig.othersSegment
    ? [...colorConfig.topClinicians, colorConfig.othersSegment]
    : colorConfig.topClinicians;
}

/**
 * Calculate clinician totals from time-series data.
 *
 * @param data - Array of data points with clinician values
 * @param clinicianKeys - Array of clinician keys to extract
 * @returns Array of ClinicianData with totals
 */
export function calculateClinicianTotals<T extends Record<string, unknown>>(
  data: T[],
  clinicianKeys: string[],
  clinicianLabels?: Record<string, string>
): ClinicianData[] {
  return clinicianKeys.map(key => {
    const total = data.reduce((sum, item) => {
      const value = item[key];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    return {
      key,
      label: clinicianLabels?.[key] || key,
      totalValue: total,
    };
  });
}
