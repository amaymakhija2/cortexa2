# Practice Analysis Tabs - Design System Refactor Tracker

## Overview
This document tracks the refactoring of all Practice Analysis tabs to use the design system components.

**Source File:** `components/PracticeAnalysis.tsx` (7,388 lines)
**Design System:** `components/design-system/`
**Output Directory:** `components/analysis/`

---

## Progress Summary

| Tab | Status | Component File | Lines in Original |
|-----|--------|----------------|-------------------|
| Financial | 🟢 Complete | `FinancialAnalysisTab.tsx` | 611-1672 |
| Sessions | 🟢 Complete | `SessionsAnalysisTab.tsx` | 1673-3074 |
| Capacity & Client | 🟢 Complete | `CapacityClientTab.tsx` | 3075-4710 |
| Retention | 🟢 Complete | `RetentionTab.tsx` | 4711-5195 |
| Insurance | 🔴 Not Started | `InsuranceTab.tsx` | 5196-5377 |
| Admin | 🔴 Not Started | `AdminTab.tsx` | 5378-5586 |
| Team Comparison | 🔴 Not Started | `TeamComparisonTab.tsx` | 5587-7388 |

**Status Key:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## Target File Structure

```
components/
  analysis/
    index.ts                       # Barrel export
    types.ts                       # Shared types for all tabs
    FinancialAnalysisTab.tsx       # ✅ Complete
    SessionsAnalysisTab.tsx        # Sessions tab
    CapacityClientTab.tsx          # Capacity & Client tab
    RetentionTab.tsx               # Retention tab
    InsuranceTab.tsx               # Insurance tab
    AdminTab.tsx                   # Admin tab
    TeamComparisonTab.tsx          # Team Comparison tab
  PracticeAnalysis.tsx             # Parent orchestrator (slimmed down)
```

---

## Accent Colors by Tab

| Tab | PageHeader Accent |
|-----|-------------------|
| Financial | `amber` |
| Sessions | `amber` |
| Capacity & Client | `amber` |
| Retention | `rose` |
| Insurance | `violet` |
| Admin | `blue` |
| Team Comparison | `stone` (or `blue`) |

---

# DESIGN SYSTEM COMPONENTS REFERENCE

## Available Components (import from '../design-system')

### Layout
- `PageHeader` - Tab header with accent color, time picker, tab navigation
- `PageContent` - Content wrapper with proper padding
- `Grid` - Responsive grid (cols={2}, cols={4})
- `Section` - Vertical spacing wrapper (spacing="md", "lg", "none")

### Cards
- `StatCard` - Hero stat display (title, value, subtitle)
- `StatCardWithBreakdown` - Stat with breakdown items
- `ChartCard` - Full chart container with headerControls, insights, expandable
- `SimpleChartCard` - Lighter chart container with valueIndicator
- `DonutChartCard` - Donut/pie chart with legend
- `DataTableCard` - Data table with indicators, highlights
- `CompactCard` - Small metric card
- `StackedBarCard` - Horizontal stacked bar (3+ segments)
- `SplitBarCard` - Two-value comparison bar (left vs right segments)
- `MetricListCard` - List of metrics

### Controls (for headerControls)
- `ToggleButton` - Toggle switch with label and icon
- `GoalIndicator` - Shows goal value with colored badge
- `ActionButton` - Action link button

### Charts
- `BarChart` - Design system bar chart (single or stacked mode)
- `LineChart` - Design system line chart with thick styling (strokeWidth={4}, dot r: 7)
- `ExpandedChartModal` - Fullscreen modal for expanded charts

> **Note:** Use the design system `LineChart` for consistent thick line styling. For advanced customization, raw Recharts can still be used inside `SimpleChartCard`.

---

# TAB 1: FINANCIAL ANALYSIS ✅ COMPLETE

## Final Component Structure

```
FinancialAnalysisTab.tsx
├── PageHeader (amber accent)
├── PageContent
│   ├── Section: Hero Stats Row
│   │   └── Grid cols={4}
│   │       ├── StatCard: Total Gross Revenue
│   │       ├── StatCard: Total Net Revenue
│   │       ├── StatCard: Goal Achievement
│   │       └── StatCard: Avg Revenue
│   │
│   ├── Section: Main Charts Row
│   │   └── Grid cols={2}
│   │       ├── ChartCard: Revenue Performance (BarChart)
│   │       │   ├── headerControls: ToggleButton, GoalIndicator, ActionButton
│   │       │   ├── insights row
│   │       │   └── BarChart (single or stacked mode)
│   │       │
│   │       └── DonutChartCard: Revenue Distribution
│   │           └── 4 segments (costs + net revenue)
│   │
│   ├── Section: Trend Charts Row (NEW)
│   │   └── Grid cols={2}
│   │       ├── SimpleChartCard: Net Revenue Margin
│   │       │   └── LineChart (single line, 0-30% domain)
│   │       │
│   │       └── SimpleChartCard: Cost as % of Revenue
│   │           └── LineChart (2 lines: clinician ~70%, supervisor ~10%)
│   │
│   └── Section: Breakdown Table
│       └── DataTableCard: Full Breakdown
│           └── Rows with indicators and highlight
│
└── Expanded Modals
    ├── ExpandedChartModal: Revenue Performance
    ├── ExpandedChartModal: Revenue Distribution
    └── ExpandedChartModal: Breakdown Table
```

## Key Implementation Details

### 1. Imports Pattern
```tsx
import React, { useState, useMemo } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  SimpleChartCard,
  DonutChartCard,
  DataTableCard,
  ToggleButton,
  GoalIndicator,
  ActionButton,
  BarChart,
  LineChart,
  ExpandedChartModal,
} from '../design-system';
import type { HoverInfo } from '../design-system';
import type { FinancialAnalysisTabProps } from './types';
```

### 2. Props Interface (in types.ts)
```tsx
export interface FinancialAnalysisTabProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  timePeriods: readonly { value: string; label: string }[];
  tabs: { id: string; label: string; shortLabel: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  getDateRangeLabel: () => string;
  revenueData: RevenueDataPoint[];
  revenueBreakdownData: RevenueBreakdownDataPoint[];
  clinicianRevenueData: ClinicianRevenueDataPoint[];
}
```

### 3. Local State Pattern
```tsx
const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
const [expandedCard, setExpandedCard] = useState<string | null>(null);
const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);
```

### 4. Computed Values Pattern (useMemo)
```tsx
const totalGrossRevenue = useMemo(
  () => revenueData.reduce((sum, item) => sum + item.value, 0),
  [revenueData]
);

const avgMargin = useMemo(() => {
  const totalGross = revenueBreakdownData.reduce((sum, item) => sum + item.grossRevenue, 0);
  return totalGross > 0 ? (totalNetRevenue / totalGross) * 100 : 0;
}, [revenueBreakdownData, totalNetRevenue]);
```

### 5. BarChart Component Usage (Design System)
```tsx
// Single mode with goal line
<BarChart
  data={barChartData}  // { label: string, value: number }[]
  mode="single"
  goal={{ value: 150000 }}
  getBarColor={(value) =>
    value >= 150000
      ? {
          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
          shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35)',
          textColor: 'text-emerald-600',
        }
      : {
          gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
          shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35)',
          textColor: 'text-blue-600',
        }
  }
  formatValue={formatCurrencyShort}
  height="380px"
/>

// Stacked mode for clinician breakdown
<BarChart
  data={clinicianBarChartData}  // { label: string, Chen: number, Rodriguez: number, ... }[]
  mode="stacked"
  segments={CLINICIAN_SEGMENTS}
  stackOrder={CLINICIAN_STACK_ORDER}
  formatValue={formatCurrencyShort}
  onHover={setHoveredClinicianBar}
  showLegend
  height="380px"
/>
```

### 6. LineChart Pattern (Design System Component)

> **Updated:** Now uses the design system `LineChart` component with thick styling (strokeWidth={4}, dot r: 7) baked in.

```tsx
import { LineChart } from '../design-system';

<SimpleChartCard
  title="Net Revenue Margin"
  subtitle="Percentage of gross revenue retained"
  valueIndicator={{
    value: `${avgMargin.toFixed(1)}%`,
    label: 'Average',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  }}
  height="280px"
>
  <LineChart
    data={marginChartData}
    xAxisKey="month"
    lines={[{ dataKey: 'margin', color: '#10b981', activeColor: '#059669' }]}
    yDomain={[0, 30]}
    yTickFormatter={(v) => `${v}%`}
    tooltipFormatter={(value: number) => [`${value.toFixed(1)}%`, 'Margin']}
  />
</SimpleChartCard>
```

### 7. Multi-Line Chart Pattern (Design System)
```tsx
<SimpleChartCard
  title="Cost as % of Revenue"
  subtitle="Clinician and supervisor costs"
  valueIndicator={{
    value: `${(avgClinicianPct + avgSupervisorPct).toFixed(1)}%`,
    label: 'Total Avg',
    bgColor: 'bg-stone-100',
    textColor: 'text-stone-700',
  }}
  height="280px"
>
  <LineChart
    data={costPercentageData}
    xAxisKey="month"
    lines={[
      { dataKey: 'clinicianPct', color: '#3b82f6', activeColor: '#2563eb', name: 'Clinician' },
      { dataKey: 'supervisorPct', color: '#f59e0b', activeColor: '#d97706', name: 'Supervisor' },
    ]}
    yDomain={[0, 80]}
    yTickFormatter={(v) => `${v}%`}
    showLegend
  />
</SimpleChartCard>
```

### LineChart Props Reference
```tsx
interface LineConfig {
  dataKey: string;       // Data key for this line
  color: string;         // Line color
  activeColor?: string;  // Hover color (optional)
  name?: string;         // Display name for legend/tooltip
}

interface LineChartProps {
  data: Record<string, any>[];
  xAxisKey: string;
  lines: LineConfig[];
  yDomain?: [number, number];
  yTickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  showLegend?: boolean;
  height?: string;
  showAreaFill?: boolean;
  areaFillId?: string;
}
```

**Key Features:**
- Thick lines (strokeWidth: 4)
- Large dots (r: 7) with white stroke
- Large active dots (r: 10)
- Consistent dark tooltip styling
- Built-in legend support

### 8. ExpandedChartModal Pattern (Centralized Fullscreen)
```tsx
<ExpandedChartModal
  isOpen={expandedCard === 'revenue-performance'}
  onClose={() => setExpandedCard(null)}
  title="Revenue Performance"
  subtitle={showClinicianBreakdown ? 'Revenue by clinician breakdown' : 'Monthly revenue with $150k goal'}
  headerControls={
    <>
      <ToggleButton label="By Clinician" active={showClinicianBreakdown} onToggle={...} icon={<Users size={16} />} />
      <GoalIndicator value="$150k" label="Goal" color="amber" hidden={showClinicianBreakdown} />
      <ActionButton label="Revenue Report" icon={<ArrowRight size={16} />} />
    </>
  }
  insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
>
  <BarChart ... size="lg" height="100%" />
</ExpandedChartModal>
```

### 9. Size Prop for Expanded Views
Components support `size="lg"` for expanded/fullscreen views:
- `BarChart size="lg"` - Larger fonts, bars, padding
- `DataTableCard size="lg"` - Larger text, cells

### 10. ChartCard with headerControls
```tsx
<ChartCard
  title="Revenue Performance"
  subtitle="Monthly breakdown"
  headerControls={
    <>
      <ToggleButton
        label="By Clinician"
        active={showClinicianBreakdown}
        onToggle={() => setShowClinicianBreakdown(!showClinicianBreakdown)}
        icon={<Users size={16} />}
        hidden={!!hoveredClinicianBar}  // Hide when showing hover tooltip
      />
      <GoalIndicator
        value="$150k"
        label="Goal"
        color="amber"
        hidden={showClinicianBreakdown || !!hoveredClinicianBar}
      />
      {/* Dynamic hover tooltip */}
      {hoveredClinicianBar && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ backgroundColor: `${hoveredClinicianBar.color}15` }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredClinicianBar.color }} />
          <span className="text-stone-700 font-semibold">{hoveredClinicianBar.segmentLabel}</span>
          <span className="font-bold" style={{ color: hoveredClinicianBar.color }}>{formatCurrencyShort(hoveredClinicianBar.value)}</span>
          <span className="text-stone-500 text-sm">in {hoveredClinicianBar.label}</span>
        </div>
      )}
      <ActionButton label="Revenue Report" icon={<ArrowRight size={16} />} />
    </>
  }
  expandable
  onExpand={() => setExpandedCard('revenue-performance')}
  insights={showClinicianBreakdown ? clinicianInsights : revenueInsights}
  minHeight="520px"
>
  {/* Chart content */}
</ChartCard>
```

### 11. Insights Array Pattern
```tsx
const revenueInsights = useMemo(() => [
  {
    value: bestMonth.month,
    label: `Best (${formatCurrencyShort(bestMonth.value)})`,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    value: `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}%`,
    label: 'MoM Trend',
    bgColor: momChange >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    textColor: momChange >= 0 ? 'text-emerald-600' : 'text-rose-600',
  },
  {
    value: `${formatCurrencyShort(revenueRange.min)}–${formatCurrencyShort(revenueRange.max)}`,
    label: 'Range',
    bgColor: 'bg-stone-100',
    textColor: 'text-stone-700',
  },
], [bestMonth, momChange, revenueRange]);
```

### 12. DataTableCard Pattern
```tsx
const buildTableColumns = () => {
  const monthColumns = revenueBreakdownData.map((item) => ({
    key: item.month.toLowerCase(),
    header: item.month,
    align: 'right' as const,
  }));
  return [...monthColumns, { key: 'total', header: 'Total', align: 'right' as const, isTotals: true }];
};

const buildTableRows = () => {
  const buildRowValues = (field: keyof typeof revenueBreakdownData[0]) => {
    const values: Record<string, string> = {};
    let total = 0;
    revenueBreakdownData.forEach((item) => {
      const val = item[field] as number;
      values[item.month.toLowerCase()] = formatCurrencyShort(val);
      total += val;
    });
    values.total = formatCurrency(total);
    return values;
  };

  return [
    { id: 'gross', label: 'Gross Revenue', values: buildRowValues('grossRevenue') },
    { id: 'clinician', label: 'Clinician Cost', indicator: { color: '#3b82f6' }, values: buildRowValues('clinicianCosts'), valueColor: 'text-blue-600' },
    { id: 'supervisor', label: 'Supervisor Cost', indicator: { color: '#f59e0b' }, values: buildRowValues('supervisorCosts'), valueColor: 'text-amber-600' },
    { id: 'fees', label: 'Credit Card Fees', indicator: { color: '#f43f5e' }, values: buildRowValues('creditCardFees'), valueColor: 'text-rose-600' },
    { id: 'net', label: 'Net Revenue', indicator: { color: '#10b981' }, values: buildRowValues('netRevenue'), valueColor: 'text-emerald-600', isHighlighted: true, highlightColor: 'emerald' as const },
  ];
};

<DataTableCard
  title="Full Breakdown"
  columns={buildTableColumns()}
  rows={buildTableRows()}
  expandable
  onExpand={() => setExpandedCard('breakdown-table')}
/>
```

---

## Bug Fixes & Lessons Learned

### 1. Recharts YAxis Domain Issue
**Problem:** YAxis showing values like 47424% instead of expected range
**Solution:**
- Set `domain={[min, max]}` that actually fits your data
- Use `allowDataOverflow={true}` if you want to enforce the domain strictly
- For percentage charts, check actual data range first!

### 2. Missing Lines in Multi-Line Chart
**Problem:** Only 1 line showing when 2 expected
**Cause:** Domain was `[0, 50]` but one line had values ~75%
**Solution:** Adjust domain to fit all data: `domain={[0, 80]}`

### 3. ExpandedChartModal Centralization
**Pattern:** All expanded views should use the centralized `ExpandedChartModal` component
- Supports `headerControls` prop for buttons/toggles
- Supports `insights` prop for bottom row
- Supports `legend` prop for chart legends
- Children render at `size="lg"` for immersive experience

---

## Color Reference

| Element | Color Code |
|---------|------------|
| Clinician Costs | `#3b82f6` (blue) |
| Supervisor Costs | `#f59e0b` (amber) |
| CC Fees | `#f43f5e` (rose) |
| Net Revenue | `#10b981` (emerald) |
| Goal Line | `#f59e0b` (amber, dashed) |
| Above Goal Bar | `#34d399` → `#059669` (emerald gradient) |
| Below Goal Bar | `#60a5fa` → `#2563eb` (blue gradient) |

### Clinician Colors (Stacked Bars)
| Clinician | Color |
|-----------|-------|
| Chen | `#7c3aed` (violet) |
| Rodriguez | `#0891b2` (cyan) |
| Patel | `#d97706` (amber) |
| Kim | `#db2777` (pink) |
| Johnson | `#059669` (emerald) |

---

# TAB 2: SESSIONS ANALYSIS ✅ COMPLETE

## Tab Info
- **Accent Color:** `amber`
- **Original Lines:** 1673-3074 in PracticeAnalysis.tsx
- **Component File:** `SessionsAnalysisTab.tsx`
- **Lines of Code:** ~590 lines

## Final Component Structure

```
SessionsAnalysisTab.tsx
├── PageHeader (amber accent)
├── PageContent
│   ├── Section: Hero Stats Row
│   │   └── Grid cols={4}
│   │       ├── StatCard: Total Completed (totalCompleted)
│   │       ├── StatCard: Total Booked (totalBooked + show rate)
│   │       ├── StatCard: Goal Achievement (monthsAtGoal/total)
│   │       └── StatCard: Avg Non-Billable Cancel Rate
│   │
│   ├── Section: Main Charts Row
│   │   └── Grid cols={2}
│   │       ├── ChartCard: Completed Sessions (BarChart)
│   │       │   ├── headerControls: ToggleButton (By Clinician), GoalIndicator, ActionButton
│   │       │   ├── insights row (Best month, MoM trend, Range)
│   │       │   └── BarChart (single mode with goal=700 or stacked by clinician)
│   │       │
│   │       └── DonutChartCard: Attendance Breakdown
│   │           └── 5 segments (Attended, Client Cancelled, Clinician Cancelled, Late Cancelled, No Show)
│   │
│   ├── Section: Secondary Metrics Row
│   │   └── Grid cols={3}
│   │       ├── StatCard: Avg Sessions per Client per Month
│   │       ├── StatCard: Avg Sessions (monthly + weekly)
│   │       └── SplitBarCard: Session Modality (Telehealth vs In-Person)
│   │
│   └── Section: Breakdown Table
│       └── DataTableCard: Monthly Breakdown
│           └── Rows: Booked, Completed (highlighted), Client Cancelled, Clinician Cancelled, Late Cancelled, No Show
│
└── Expanded Modals
    ├── ExpandedChartModal: Completed Sessions (with BarChart size="lg")
    ├── ExpandedChartModal: Attendance Breakdown (with DonutChartCard size="lg")
    ├── ExpandedChartModal: Session Modality (with SplitBarCard)
    └── ExpandedChartModal: Monthly Breakdown (with DataTableCard size="lg")
```

## Key Implementation Details

### 1. Imports Pattern
```tsx
import React, { useState, useMemo } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  DonutChartCard,
  DataTableCard,
  SplitBarCard,
  ToggleButton,
  GoalIndicator,
  ActionButton,
  BarChart,
  ExpandedChartModal,
} from '../design-system';
import type { HoverInfo, SegmentConfig } from '../design-system';
import type { SessionsAnalysisTabProps } from './types';
```

### 2. Props Interface (in types.ts)
```tsx
export interface SessionsDataPoint {
  month: string;
  completed: number;
  booked: number;
  clients: number;
  cancelled: number;
  clinicianCancelled: number;
  lateCancelled: number;
  noShow: number;
  show: number;
  telehealth: number;
  inPerson: number;
}

export interface ClinicianSessionsDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
}

export interface SessionsAnalysisTabProps extends BaseAnalysisTabProps {
  sessionsData: SessionsDataPoint[];
  clinicianSessionsData: ClinicianSessionsDataPoint[];
}
```

### 3. Local State
```tsx
const [showClinicianBreakdown, setShowClinicianBreakdown] = useState(false);
const [expandedCard, setExpandedCard] = useState<string | null>(null);
const [hoveredClinicianBar, setHoveredClinicianBar] = useState<HoverInfo | null>(null);
```

### 4. Key Computed Values
```tsx
const totalCompleted = useMemo(
  () => sessionsData.reduce((sum, item) => sum + item.completed, 0),
  [sessionsData]
);

const showRate = useMemo(
  () => totalBooked > 0 ? (totalShow / totalBooked) * 100 : 0,
  [totalShow, totalBooked]
);

const nonBillableCancelRate = useMemo(() => {
  const totalNonBillable = totalCancelled + totalClinicianCancelled;
  const totalOutcomes = totalShow + totalCancelled + totalClinicianCancelled + totalLateCancelled + totalNoShow;
  return totalOutcomes > 0 ? (totalNonBillable / totalOutcomes) * 100 : 0;
}, [totalShow, totalCancelled, totalClinicianCancelled, totalLateCancelled, totalNoShow]);
```

### 5. SplitBarCard Pattern (Two-Value Comparison)
```tsx
<SplitBarCard
  title="Session Modality"
  leftSegment={{
    label: 'Telehealth',
    value: totalTelehealth,
    color: '#0891b2',      // cyan-600
    colorEnd: '#0e7490',   // cyan-700 (gradient end)
  }}
  rightSegment={{
    label: 'In-Person',
    value: totalInPerson,
    color: '#d97706',      // amber-600
    colorEnd: '#b45309',   // amber-700 (gradient end)
  }}
  expandable
  onExpand={() => setExpandedCard('session-modality')}
/>
```

> **Important:** Use `SplitBarCard` for two-value comparisons (e.g., Telehealth vs In-Person). Use `StackedBarCard` for 3+ segments.

### 6. DonutChartCard Pattern (Attendance Breakdown)
```tsx
const attendanceSegments = useMemo(() => [
  { label: 'Attended', value: totalShow, color: '#10b981' },
  { label: 'Client Cancelled', value: totalCancelled, color: '#ef4444' },
  { label: 'Clinician Cancelled', value: totalClinicianCancelled, color: '#3b82f6' },
  { label: 'Late Cancelled', value: totalLateCancelled, color: '#f59e0b' },
  { label: 'No Show', value: totalNoShow, color: '#6b7280' },
], [totalShow, totalCancelled, totalClinicianCancelled, totalLateCancelled, totalNoShow]);

<DonutChartCard
  title="Attendance Breakdown"
  subtitle="Session outcomes"
  segments={attendanceSegments}
  centerLabel="Show Rate"
  centerValue={`${showRate.toFixed(1)}%`}
  valueFormat="number"
  expandable
  onExpand={() => setExpandedCard('attendance-breakdown')}
/>
```

### 7. BarChart with Goal (Sessions Performance)
```tsx
<BarChart
  data={barChartData}  // { label: string, value: number }[]
  mode="single"
  goal={{ value: 700 }}
  getBarColor={(value) =>
    value >= 700
      ? {
          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
          shadow: '0 4px 12px -2px rgba(16, 185, 129, 0.35)',
          textColor: 'text-emerald-600',
        }
      : {
          gradient: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
          shadow: '0 4px 12px -2px rgba(37, 99, 235, 0.35)',
          textColor: 'text-blue-600',
        }
  }
  formatValue={(v) => v.toString()}
  height="380px"
/>
```

### 8. DataTableCard with Multiple Metrics
```tsx
const buildTableRows = () => {
  const buildRowValues = (field: keyof typeof sessionsData[0]) => {
    const values: Record<string, string> = {};
    let total = 0;
    sessionsData.forEach((item) => {
      const val = item[field] as number;
      values[item.month.toLowerCase()] = val.toLocaleString();
      total += val;
    });
    values.total = total.toLocaleString();
    return values;
  };

  return [
    { id: 'booked', label: 'Booked', indicator: { color: '#06b6d4' }, values: buildRowValues('booked') },
    { id: 'completed', label: 'Completed', indicator: { color: '#10b981' }, values: buildRowValues('completed'), valueColor: 'text-emerald-600', isHighlighted: true, highlightColor: 'emerald' as const },
    { id: 'cancelled', label: 'Client Cancelled', indicator: { color: '#ef4444' }, values: buildRowValues('cancelled'), valueColor: 'text-rose-600' },
    { id: 'clinicianCancelled', label: 'Clinician Cancelled', indicator: { color: '#3b82f6' }, values: buildRowValues('clinicianCancelled'), valueColor: 'text-blue-600' },
    { id: 'lateCancelled', label: 'Late Cancelled', indicator: { color: '#f59e0b' }, values: buildRowValues('lateCancelled'), valueColor: 'text-amber-600' },
    { id: 'noShow', label: 'No Show', indicator: { color: '#6b7280' }, values: buildRowValues('noShow'), valueColor: 'text-stone-600' },
  ];
};
```

## Color Reference (Sessions Tab)

| Element | Color Code |
|---------|------------|
| Attended / Show | `#10b981` (emerald) |
| Client Cancelled | `#ef4444` (red) |
| Clinician Cancelled | `#3b82f6` (blue) |
| Late Cancelled | `#f59e0b` (amber) |
| No Show | `#6b7280` (gray) |
| Booked | `#06b6d4` (cyan) |
| Completed (highlighted) | `#10b981` (emerald) |
| Telehealth | `#0891b2` → `#0e7490` (cyan gradient) |
| In-Person | `#d97706` → `#b45309` (amber gradient) |
| Goal Line | `#f59e0b` (amber, dashed) |

## Bug Fixes & Lessons Learned (Sessions Tab)

### 1. SplitBarCard vs StackedBarCard
**Problem:** Initially used `StackedBarCard` for Session Modality
**Solution:** Use `SplitBarCard` for two-value comparisons (e.g., Telehealth vs In-Person). `StackedBarCard` is for 3+ segments.

### 2. Accent Color Mismatch
**Problem:** Used `accent="cyan"` but should have been `accent="amber"`
**Solution:** Always verify the accent color from existing UI or design spec before implementing.

### 3. Large Code Replacement
**Problem:** When replacing ~1400 lines of old tab code, partial replacement left orphaned JSX
**Solution:** Do multiple sequential edits to fully remove old code chunks. Verify the remaining code compiles after each edit.

## Implementation Checklist ✅

### Phase 1: Analysis & Setup
- [x] Read lines 1673-3074 in PracticeAnalysis.tsx
- [x] Identify all UI sections and components
- [x] Identify data props needed
- [x] Add types to `types.ts` (SessionsDataPoint, ClinicianSessionsDataPoint, SessionsAnalysisTabProps)
- [x] Add export to `index.ts`

### Phase 2: Component Creation
- [x] Create `SessionsAnalysisTab.tsx`
- [x] Add imports (follow Financial tab pattern)
- [x] Define props interface
- [x] Set up local state

### Phase 3: PageHeader
- [x] Add PageHeader with `accent="amber"`
- [x] Configure time period selector
- [x] Configure tab navigation

### Phase 4: Hero Stats Row
- [x] Add Section + Grid cols={4}
- [x] Add 4 StatCards (Total Completed, Total Booked, Goal Achievement, Non-Billable Cancel Rate)

### Phase 5: Main Charts
- [x] ChartCard for Completed Sessions with BarChart (single + stacked modes)
- [x] DonutChartCard for Attendance Breakdown
- [x] Configure headerControls (ToggleButton, GoalIndicator, ActionButton)
- [x] Configure insights

### Phase 6: Additional Sections
- [x] Add Grid cols={3} with secondary metrics
- [x] Add StatCards for avg sessions
- [x] Add SplitBarCard for Session Modality

### Phase 7: Breakdown Table
- [x] Add DataTableCard with monthly metrics
- [x] Configure rows with indicators and highlights

### Phase 8: Expanded Modals
- [x] ExpandedChartModal for Completed Sessions
- [x] ExpandedChartModal for Attendance Breakdown
- [x] ExpandedChartModal for Session Modality
- [x] ExpandedChartModal for Monthly Breakdown
- [x] Pass `size="lg"` to charts in expanded view

### Phase 9: Integration
- [x] Import in PracticeAnalysis.tsx
- [x] Add to conditional render
- [x] Pass required props
- [x] Remove old Sessions tab code (~1400 lines)

### Phase 10: Testing
- [x] All functionality works
- [x] Expanded modals work
- [x] No console errors

---

# TAB 3: CAPACITY & CLIENT ✅ COMPLETE

## Tab Info
- **Accent Color:** `amber`
- **Original Lines:** 3075-4710 (~1634 lines removed from PracticeAnalysis.tsx)
- **Component File:** `CapacityClientTab.tsx`
- **Lines of Code:** ~725 lines

## Final Component Structure

```
CapacityClientTab.tsx
├── PageHeader (amber accent)
├── PageContent
│   ├── Section: Hero Stats Row
│   │   └── Grid cols={4}
│   │       ├── StatCard: Active Clients (of capacity)
│   │       ├── StatCard: Net Growth (+new -churned)
│   │       ├── StatCard: Client Utilization %
│   │       └── StatCard: Session Utilization %
│   │
│   ├── Section: Main Charts Row
│   │   └── Grid cols={2}
│   │       ├── ChartCard: Client Utilization (ComposedChart)
│   │       │   ├── headerControls: ActionButton
│   │       │   ├── Bar (Active Clients) + Line (Utilization %)
│   │       │   └── expandable
│   │       │
│   │       └── ChartCard: Client Movement (DivergingBarChart)
│   │           ├── headerControls: ActionButton
│   │           ├── Positive bars (New) + Negative bars (Churned)
│   │           └── expandable
│   │
│   ├── Section: Client Demographics Row
│   │   └── Grid cols={2}
│   │       ├── StackedBarCard: Client Gender (Male, Female, Other)
│   │       └── StackedBarCard: Client Session Frequency (Weekly, Bi-weekly, Monthly)
│   │
│   └── Section: Trend Charts Row
│       └── Grid cols={2}
│           ├── SimpleChartCard: Session Utilization Trend
│           │   └── LineChart (percentage 70-100% domain)
│           │
│           └── SimpleChartCard: Open Slots Trend
│               └── LineChart (with area fill)
│
└── Expanded Modals
    ├── ExpandedChartModal: Client Utilization
    ├── ExpandedChartModal: Client Movement
    ├── ExpandedChartModal: Session Utilization
    └── ExpandedChartModal: Open Slots
```

## Key Implementation Details

### 1. Imports Pattern
```tsx
import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import {
  PageHeader,
  PageContent,
  Grid,
  Section,
  StatCard,
  ChartCard,
  SimpleChartCard,
  StackedBarCard,
  ActionButton,
  DivergingBarChart,
  LineChart,
  ExpandedChartModal,
} from '../design-system';
import type { CapacityClientTabProps } from './types';
```

### 2. Props Interface (in types.ts)
```tsx
export interface ClientGrowthDataPoint {
  month: string;
  activeClients: number;
  capacity: number;
  retained: number;
  new: number;
  churned: number;
  withNextAppt: number;
}

export interface GenderData {
  male: number;
  female: number;
  other: number;
  total: number;
}

export interface SessionFrequencyData {
  weekly: number;
  biweekly: number;
  monthly: number;
  total: number;
}

export interface OpenSlotsDataPoint {
  month: string;
  value: number;
}

export interface HoursUtilizationDataPoint {
  month: string;
  percentage: number;
}

export interface CapacityClientTabProps extends BaseAnalysisTabProps {
  clientGrowthData: ClientGrowthDataPoint[];
  genderData: GenderData;
  sessionFrequencyData: SessionFrequencyData;
  openSlotsData: OpenSlotsDataPoint[];
  hoursUtilizationData: HoursUtilizationDataPoint[];
}
```

### 3. DivergingBarChart Pattern (Client Movement)
```tsx
import { DivergingBarChart } from '../design-system';

<ChartCard
  title="Client Movement"
  subtitle="New vs churned clients"
  headerControls={<ActionButton label="Client Report" icon={<ArrowRight size={16} />} />}
  expandable
  onExpand={() => setExpandedCard('client-movement')}
>
  <DivergingBarChart
    data={clientMovementData}  // { label: string, positive: number, negative: number }[]
    positiveConfig={{
      label: 'New Clients',
      color: '#34d399',
      colorEnd: '#10b981',
    }}
    negativeConfig={{
      label: 'Churned',
      color: '#fb7185',
      colorEnd: '#f43f5e',
    }}
    height={380}
  />
</ChartCard>
```

### 4. StackedBarCard Pattern (Demographics)
```tsx
<StackedBarCard
  title="Client Gender"
  segments={[
    { label: 'Male', value: genderData.male, color: 'bg-blue-500' },
    { label: 'Female', value: genderData.female, color: 'bg-pink-500' },
    { label: 'Other', value: genderData.other, color: 'bg-violet-500' },
  ]}
/>

<StackedBarCard
  title="Client Session Frequency"
  segments={[
    { label: 'Weekly', value: sessionFrequencyData.weekly, color: 'bg-emerald-500' },
    { label: 'Bi-weekly', value: sessionFrequencyData.biweekly, color: 'bg-amber-500' },
    { label: 'Monthly', value: sessionFrequencyData.monthly, color: 'bg-stone-400' },
  ]}
/>
```

> **Important:** StackedBarCard uses Tailwind class names (e.g., `bg-blue-500`), NOT hex colors!

### 5. ComposedChart Pattern (Client Utilization)
Uses raw Recharts ComposedChart inside ChartCard for combined Bar + Line visualization:
```tsx
<ChartCard title="Client Utilization" ...>
  <ResponsiveContainer width="100%" height={380}>
    <ComposedChart data={chartData}>
      <Bar dataKey="activeClients" fill="url(#clientsGradient)" radius={[8, 8, 0, 0]} />
      <Line dataKey="utilization" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6 }} />
    </ComposedChart>
  </ResponsiveContainer>
</ChartCard>
```

### 6. LineChart with Area Fill Pattern
```tsx
<SimpleChartCard
  title="Open Slots"
  subtitle="Unfilled slots per month"
  expandable
  onExpand={() => setExpandedCard('open-slots')}
>
  <LineChart
    data={openSlotsChartData}
    xAxisKey="month"
    lines={[{ dataKey: 'value', color: '#f43f5e', activeColor: '#e11d48' }]}
    tooltipFormatter={(value: number) => [String(value), 'Open Slots']}
    showAreaFill
  />
</SimpleChartCard>
```

## Color Reference (Capacity & Client Tab)

| Element | Color Code |
|---------|------------|
| Active Clients Bar | `#60a5fa` → `#3b82f6` (blue gradient) |
| Utilization Line | `#f59e0b` (amber) |
| New Clients | `#34d399` → `#10b981` (emerald gradient) |
| Churned Clients | `#fb7185` → `#f43f5e` (rose gradient) |
| Male | `bg-blue-500` |
| Female | `bg-pink-500` |
| Other | `bg-violet-500` |
| Weekly | `bg-emerald-500` |
| Bi-weekly | `bg-amber-500` |
| Monthly | `bg-stone-400` |
| Session Utilization | `#10b981` (emerald) |
| Open Slots | `#f43f5e` (rose) |

## Bug Fixes & Lessons Learned

### 1. StackedBarCard Color Format
**Problem:** Used hex colors like `#3b82f6` for StackedBarCard segments
**Solution:** StackedBarCard expects Tailwind class names (`bg-blue-500`), not hex values

### 2. LineChart yDomain with 'auto'
**Problem:** Used `yDomain={[0, 'auto']}` but LineChart expects `[number, number]`
**Solution:** Remove yDomain when auto-scaling is desired, or provide numeric bounds

### 3. tooltipFormatter Return Type
**Problem:** `tooltipFormatter` returned `[number, string]` but should return `[string, string]`
**Solution:** Convert value to string: `(value: number) => [String(value), 'Label']`

## Implementation Checklist ✅

- [x] Phase 1: Analyze tab structure in PracticeAnalysis.tsx
- [x] Phase 2: Add types to types.ts
- [x] Phase 3: Create CapacityClientTab.tsx component
- [x] Phase 4: Integrate in PracticeAnalysis.tsx
- [x] Phase 5: Remove old code (~1634 lines)
- [x] Phase 6: Fix TypeScript errors
- [x] Phase 7: Update tracker

---

# TAB 4: RETENTION ✅ COMPLETE

## Tab Info
- **Accent Color:** `rose`
- **Original Lines:** ~485 lines removed from PracticeAnalysis.tsx
- **Component File:** `RetentionTab.tsx`
- **Lines of Code:** ~260 lines

## Final Component Structure

```
RetentionTab.tsx
├── PageHeader (rose accent)
├── PageContent
│   └── Section: Main Charts Row
│       └── Grid cols={2}
│           ├── ChartCard: Churn by Clinician (BarChart stacked)
│           │   ├── headerControls: ActionButton
│           │   ├── Stacked bars by clinician (teal gradient shades)
│           │   └── Legend
│           │
│           └── Right Column (flex col)
│               ├── Grid cols={2}: Small Charts
│               │   ├── DonutChartCard: Churn Timing
│               │   │   └── Early/Medium/Late segments
│               │   │
│               │   └── SimpleChartCard: Rebook Rate
│               │       └── LineChart (85-100% domain)
│               │
│               └── Custom Card: Churn Segment Analysis
│                   └── 3 vertical bars showing avg churn point
```

## Key Implementation Details

### 1. Props Interface (in types.ts)
```tsx
export interface ChurnByClinicianDataPoint {
  month: string;
  Chen: number;
  Rodriguez: number;
  Patel: number;
  Kim: number;
  Johnson: number;
  total: number;
}

export interface ChurnTimingDataPoint {
  month: string;
  earlyChurn: number;
  mediumChurn: number;
  lateChurn: number;
}

export interface RetentionTabProps extends BaseAnalysisTabProps {
  churnByClinicianData: ChurnByClinicianDataPoint[];
  churnTimingData: ChurnTimingDataPoint[];
  clientGrowthData: ClientGrowthDataPoint[]; // For rebook rate
}
```

### 2. Stacked BarChart Segments
```tsx
const CLINICIAN_SEGMENTS = [
  { key: 'Chen', label: 'Chen', color: '#2d6e7e', gradient: 'linear-gradient(180deg, #2d6e7e 0%, #1d4e5e 100%)' },
  { key: 'Rodriguez', label: 'Rodriguez', color: '#3d8a9e', gradient: 'linear-gradient(180deg, #3d8a9e 0%, #2d6a7e 100%)' },
  // ... etc
];

<BarChart
  data={churnBarChartData}
  mode="stacked"
  segments={CLINICIAN_SEGMENTS}
  stackOrder={['Chen', 'Rodriguez', 'Patel', 'Kim', 'Johnson']}
  formatValue={(v) => v.toString()}
  showLegend
  height="380px"
/>
```

### 3. DonutChartCard for Churn Timing
```tsx
<DonutChartCard
  title="Churn Timing"
  subtitle="When clients leave"
  segments={[
    { label: 'Early (0-3mo)', value: earlyTotal, color: '#ef4444' },
    { label: 'Medium (4-8mo)', value: mediumTotal, color: '#f59e0b' },
    { label: 'Late (9+mo)', value: lateTotal, color: '#10b981' },
  ]}
  centerLabel="Total"
  centerValue={totalChurn.toString()}
  valueFormat="number"
  size="sm"
/>
```

### 4. Custom Churn Segment Card
Simple custom card with 3 gradient bars showing average session count at churn:
- Early: 3.5 sessions (rose)
- Mid: 8 sessions (amber)
- Late: 30 sessions (emerald)

## Color Reference (Retention Tab)

| Element | Color Code |
|---------|------------|
| Chen | `#2d6e7e` (teal) |
| Rodriguez | `#3d8a9e` |
| Patel | `#4da6be` |
| Kim | `#6bc2d8` |
| Johnson | `#89d4e8` |
| Early Churn | `#ef4444` (red) |
| Medium Churn | `#f59e0b` (amber) |
| Late Churn | `#10b981` (emerald) |
| Rebook Rate | `#10b981` (emerald) |

## Implementation Checklist ✅

- [x] Phase 1: Analyze tab structure
- [x] Phase 2: Add types (ChurnByClinicianDataPoint, ChurnTimingDataPoint, RetentionTabProps)
- [x] Phase 3: Create RetentionTab.tsx
- [x] Phase 4: Integrate in PracticeAnalysis.tsx
- [x] Phase 5: Remove old code (~485 lines)
- [x] Phase 6: Update tracker

---

# IMPLEMENTATION TIPS FOR AI

## 1. Start by Reading the Original
Always read the original tab code in PracticeAnalysis.tsx first to understand:
- What data is displayed
- What interactions exist (toggles, hovers)
- What charts/visualizations are used

## 2. Map to Design System Components
- Custom stat boxes → `StatCard`
- Custom bar charts → `ChartCard` + `BarChart`
- Custom line charts → `SimpleChartCard` + `LineChart` (design system)
- Custom tables → `DataTableCard`
- Toggle buttons → `ToggleButton` in headerControls
- Donut/pie charts → `DonutChartCard`
- Two-value comparisons → `SplitBarCard` (NOT StackedBarCard!)
- 3+ segment stacks → `StackedBarCard`

## 3. Follow the Patterns
Copy patterns from FinancialAnalysisTab.tsx or SessionsAnalysisTab.tsx:
- Import structure (all from '../design-system')
- useMemo for computed values
- useState for local UI state
- ExpandedChartModal for fullscreen

## 4. Common Gotchas
- Use `SplitBarCard` for 2 values, `StackedBarCard` for 3+ values
- LineChart design system component has thick styling baked in (strokeWidth: 4, dot r: 7)
- Use `size="lg"` in expanded modals for immersive view
- Pass `height="100%"` for charts in expanded view
- When replacing large code blocks, do multiple edits to avoid orphaned JSX
- Verify accent color from existing UI before implementing

## 5. Testing Checklist
- [ ] PageHeader renders with correct accent
- [ ] Stats show correct values
- [ ] Charts render properly
- [ ] Toggle buttons work
- [ ] Expand buttons open modals
- [ ] Expanded view is immersive (large)
- [ ] Mobile responsive
- [ ] No console errors

---

# Critical Files Reference

**Design System Components:**
1. `components/design-system/index.ts` - All exports
2. `components/design-system/layout/PageHeader.tsx` - Page header
3. `components/design-system/layout/Grid.tsx` - Grid, Section, PageContent
4. `components/design-system/cards/StatCard.tsx` - Stat cards
5. `components/design-system/cards/ChartCard.tsx` - Chart containers + ExpandedChartModal
6. `components/design-system/cards/DonutChartCard.tsx` - Donut charts
7. `components/design-system/cards/DataTableCard.tsx` - Data tables
8. `components/design-system/cards/CompactCard.tsx` - StackedBarCard, MetricListCard
9. `components/design-system/cards/SplitBarCard.tsx` - Two-value comparison bar
10. `components/design-system/controls/index.ts` - ToggleButton, GoalIndicator, ActionButton
11. `components/design-system/charts/BarChart.tsx` - Bar chart component
12. `components/design-system/charts/LineChart.tsx` - Line chart with thick styling

**Reference Implementations:**
- `components/design-system/Reference.tsx` - Component usage examples
- `components/analysis/FinancialAnalysisTab.tsx` - ✅ Complete reference implementation
- `components/analysis/SessionsAnalysisTab.tsx` - ✅ Complete reference implementation

**Types:**
- `components/analysis/types.ts` - Shared type definitions
