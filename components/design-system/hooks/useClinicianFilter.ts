import { useState, useMemo, useCallback } from 'react';
import type { SegmentConfig, HoverInfo } from '../charts/BarChart';
import type { ClinicianData, ClinicianFilterOption, ClinicianColorConfig } from '../utils/clinicianColors';
import {
  getClinicianColorConfig,
  aggregateOthersData,
  getAllSegments,
  calculateClinicianTotals,
} from '../utils/clinicianColors';

// =============================================================================
// USE CLINICIAN FILTER HOOK
// =============================================================================
// Encapsulates all the logic for the "Top N + Others" pattern.
// Manages filter state, color assignment, data transformation, and swapping.
// =============================================================================

export interface UseClinicianFilterOptions<T extends Record<string, unknown>> {
  /** Raw data with clinician values per time period */
  data: T[];
  /** All clinician keys present in the data */
  clinicianKeys: string[];
  /** Labels for clinicians (key -> display name) */
  clinicianLabels?: Record<string, string>;
  /** Initial filter mode (default: 'top5') */
  initialFilter?: ClinicianFilterOption;
}

export interface UseClinicianFilterResult<T extends Record<string, unknown>> {
  // Filter State
  /** Current filter mode */
  filterMode: ClinicianFilterOption;
  /** Update filter mode */
  setFilterMode: (mode: ClinicianFilterOption) => void;
  /** Custom selected clinicians (for 'custom' mode) */
  customSelection: string[];
  /** Update custom selection */
  setCustomSelection: (keys: string[]) => void;
  /** Clinicians pinned to always show */
  pinnedClinicians: string[];
  /** Pin a clinician */
  pinClinician: (key: string) => void;
  /** Unpin a clinician */
  unpinClinician: (key: string) => void;

  // Color Configuration
  /** Full color config with segments, stack order, etc. */
  colorConfig: ClinicianColorConfig;
  /** All segments including "Others" */
  segments: SegmentConfig[];
  /** Stack order for BarChart */
  stackOrder: string[];

  // Data
  /** All clinicians with their totals, sorted by value */
  allClinicians: ClinicianData[];
  /** Transformed data with __others__ aggregation */
  transformedData: (T & { __others__?: number })[];

  // Hover State for Others Tooltip
  /** Whether "Others" segment is currently hovered */
  isOthersHovered: boolean;
  /** Currently hovered data point (for tooltip) */
  hoveredDataPoint: T | null;
  /** Handle hover on chart segment */
  handleSegmentHover: (info: HoverInfo | null) => void;
  /** Current hover info (pass to BarChart onHover) */
  hoverInfo: HoverInfo | null;

  // Swap Interaction
  /** Swap a clinician from "Others" into the visible set */
  swapClinicianIntoView: (clinicianKey: string) => void;

  // Insights
  /** Top clinician for insights display */
  topClinician: ClinicianData | null;
  /** Average value per clinician */
  avgPerClinician: number;
  /** Total across all clinicians */
  grandTotal: number;
}

export function useClinicianFilter<T extends Record<string, unknown>>({
  data,
  clinicianKeys,
  clinicianLabels = {},
  initialFilter = 'top5',
}: UseClinicianFilterOptions<T>): UseClinicianFilterResult<T> {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  const [filterMode, setFilterMode] = useState<ClinicianFilterOption>(initialFilter);
  const [customSelection, setCustomSelection] = useState<string[]>([]);
  const [pinnedClinicians, setPinnedClinicians] = useState<string[]>([]);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  // -------------------------------------------------------------------------
  // COMPUTED: All clinicians with totals
  // -------------------------------------------------------------------------

  const allClinicians = useMemo(() => {
    return calculateClinicianTotals(data, clinicianKeys, clinicianLabels);
  }, [data, clinicianKeys, clinicianLabels]);

  // -------------------------------------------------------------------------
  // COMPUTED: Determine top N based on filter mode
  // -------------------------------------------------------------------------

  const topN = useMemo(() => {
    switch (filterMode) {
      case 'top5': return 5;
      case 'top7': return 7;
      case 'top10': return 10;
      case 'all': return clinicianKeys.length;
      case 'custom': return customSelection.length;
      default: return 5;
    }
  }, [filterMode, clinicianKeys.length, customSelection.length]);

  // For custom mode, we use the selection as "pinned"
  const effectivePinned = useMemo(() => {
    if (filterMode === 'custom') {
      return customSelection;
    }
    return pinnedClinicians;
  }, [filterMode, customSelection, pinnedClinicians]);

  // -------------------------------------------------------------------------
  // COMPUTED: Color configuration
  // -------------------------------------------------------------------------

  const colorConfig = useMemo(() => {
    return getClinicianColorConfig(allClinicians, topN, effectivePinned);
  }, [allClinicians, topN, effectivePinned]);

  const segments = useMemo(() => getAllSegments(colorConfig), [colorConfig]);
  const stackOrder = useMemo(() => colorConfig.stackOrder, [colorConfig]);

  // -------------------------------------------------------------------------
  // COMPUTED: Transformed data with Others aggregation
  // -------------------------------------------------------------------------

  const transformedData = useMemo(() => {
    return aggregateOthersData(data, colorConfig);
  }, [data, colorConfig]);

  // -------------------------------------------------------------------------
  // COMPUTED: Insights
  // -------------------------------------------------------------------------

  const topClinician = useMemo(() => {
    return allClinicians.length > 0 ? allClinicians[0] : null;
  }, [allClinicians]);

  const grandTotal = useMemo(() => {
    return allClinicians.reduce((sum, c) => sum + c.totalValue, 0);
  }, [allClinicians]);

  const avgPerClinician = useMemo(() => {
    return allClinicians.length > 0 ? grandTotal / allClinicians.length : 0;
  }, [grandTotal, allClinicians.length]);

  // -------------------------------------------------------------------------
  // HOVER STATE
  // -------------------------------------------------------------------------

  const isOthersHovered = hoverInfo?.segment === '__others__';

  const hoveredDataPoint = useMemo(() => {
    if (!hoverInfo) return null;
    return data.find(d => {
      // Match by label
      const labelKey = Object.keys(d).find(k =>
        k === 'label' || k === 'month' || k === 'period'
      );
      return labelKey && d[labelKey] === hoverInfo.label;
    }) || null;
  }, [hoverInfo, data]);

  // -------------------------------------------------------------------------
  // CALLBACKS
  // -------------------------------------------------------------------------

  const handleSegmentHover = useCallback((info: HoverInfo | null) => {
    setHoverInfo(info);
  }, []);

  const pinClinician = useCallback((key: string) => {
    setPinnedClinicians(prev => {
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  }, []);

  const unpinClinician = useCallback((key: string) => {
    setPinnedClinicians(prev => prev.filter(k => k !== key));
  }, []);

  const swapClinicianIntoView = useCallback((clinicianKey: string) => {
    // Add to pinned, which will push them into the visible set
    pinClinician(clinicianKey);
  }, [pinClinician]);

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // Filter State
    filterMode,
    setFilterMode,
    customSelection,
    setCustomSelection,
    pinnedClinicians,
    pinClinician,
    unpinClinician,

    // Color Configuration
    colorConfig,
    segments,
    stackOrder,

    // Data
    allClinicians,
    transformedData,

    // Hover State
    isOthersHovered,
    hoveredDataPoint,
    handleSegmentHover,
    hoverInfo,

    // Swap
    swapClinicianIntoView,

    // Insights
    topClinician,
    avgPerClinician,
    grandTotal,
  };
}

export default useClinicianFilter;
