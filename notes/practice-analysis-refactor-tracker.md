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
| Sessions | 🔴 Not Started | `SessionsAnalysisTab.tsx` | 1673-3074 |
| Capacity & Client | 🔴 Not Started | `CapacityClientTab.tsx` | 3075-4710 |
| Retention | 🔴 Not Started | `RetentionTab.tsx` | 4711-5195 |
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
| Sessions | `cyan` |
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
- `StackedBarCard` - Horizontal stacked bar
- `MetricListCard` - List of metrics

### Controls (for headerControls)
- `ToggleButton` - Toggle switch with label and icon
- `GoalIndicator` - Shows goal value with colored badge
- `ActionButton` - Action link button

### Charts
- `BarChart` - Design system bar chart (single or stacked mode)
- `ExpandedChartModal` - Fullscreen modal for expanded charts

### Recharts (for line charts inside SimpleChartCard)
```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
```

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
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

### 6. LineChart Pattern (Recharts inside SimpleChartCard)
```tsx
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
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={marginChartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
      <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#57534e', fontSize: 12, fontWeight: 500 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#10b981', fontSize: 12, fontWeight: 600 }}
        domain={[0, 30]}  // Set appropriate domain for your data!
        allowDataOverflow={true}  // IMPORTANT: Forces domain to be respected
        tickFormatter={(v) => `${v}%`}
        width={45}
      />
      <Tooltip
        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Margin']}
        contentStyle={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '12px 16px',
        }}
        labelStyle={{ fontWeight: 600, color: '#1c1917' }}
      />
      <Line
        type="monotone"
        dataKey="margin"
        stroke="#10b981"
        strokeWidth={3}
        dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 7, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
      />
    </LineChart>
  </ResponsiveContainer>
</SimpleChartCard>
```

### 7. Multi-Line Chart Pattern
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
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={costPercentageData} margin={{ top: 30, right: 20, bottom: 10, left: 10 }}>
      <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" vertical={false} />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 12, fontWeight: 500 }} />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#57534e', fontSize: 12, fontWeight: 600 }}
        domain={[0, 80]}  // Must accommodate highest line value!
        tickFormatter={(v) => `${v}%`}
        width={45}
      />
      <Tooltip ... />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        iconSize={10}
        wrapperStyle={{ paddingBottom: '10px' }}
        formatter={(value) => (
          <span style={{ color: '#57534e', fontSize: '13px', fontWeight: 500 }}>
            {value === 'clinicianPct' ? 'Clinician' : 'Supervisor'}
          </span>
        )}
      />
      <Line type="monotone" dataKey="clinicianPct" name="clinicianPct" stroke="#3b82f6" strokeWidth={3} ... />
      <Line type="monotone" dataKey="supervisorPct" name="supervisorPct" stroke="#f59e0b" strokeWidth={3} ... />
    </LineChart>
  </ResponsiveContainer>
</SimpleChartCard>
```

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

# TAB 2: SESSIONS ANALYSIS 🔴 NOT STARTED

## Tab Info
- **Accent Color:** `cyan`
- **Original Lines:** 1673-3074 in PracticeAnalysis.tsx
- **Component File:** `SessionsAnalysisTab.tsx`

## Existing Sessions Tab Structure (from PracticeAnalysis.tsx)

Analyze lines 1673-3074 to identify:
1. Hero stats displayed
2. Main charts (bar charts, line charts, etc.)
3. Any toggle functionality
4. Breakdown sections
5. Data structures used

## Expected Component Structure

```
SessionsAnalysisTab.tsx
├── PageHeader (cyan accent)
├── PageContent
│   ├── Section: Hero Stats Row
│   │   └── Grid cols={4}
│   │       ├── StatCard: [Total Sessions or similar]
│   │       ├── StatCard: [Weekly Average]
│   │       ├── StatCard: [Show Rate]
│   │       └── StatCard: [Other metric]
│   │
│   ├── Section: Main Charts Row
│   │   └── Grid cols={2}
│   │       ├── ChartCard: Sessions Chart
│   │       │   └── BarChart or LineChart
│   │       │
│   │       └── [Second Chart - DonutChartCard or ChartCard]
│   │
│   ├── Section: Trend/Additional Charts (if applicable)
│   │   └── Grid cols={2}
│   │       └── SimpleChartCard(s) with LineChart
│   │
│   └── Section: Breakdown
│       └── DataTableCard or other breakdown component
│
└── Expanded Modals
    └── ExpandedChartModal for each expandable card
```

## Implementation Checklist

### Phase 1: Analysis & Setup
- [ ] Read lines 1673-3074 in PracticeAnalysis.tsx
- [ ] Identify all UI sections and components
- [ ] Identify data props needed
- [ ] Add types to `types.ts`
- [ ] Add export to `index.ts`

### Phase 2: Component Creation
- [ ] Create `SessionsAnalysisTab.tsx`
- [ ] Add imports (follow Financial tab pattern)
- [ ] Define props interface
- [ ] Set up local state

### Phase 3: PageHeader
- [ ] Add PageHeader with `accent="cyan"`
- [ ] Configure time period selector
- [ ] Configure tab navigation

### Phase 4: Hero Stats Row
- [ ] Add Section + Grid cols={4}
- [ ] Add 4 StatCards with appropriate metrics

### Phase 5: Main Charts
- [ ] Identify chart types needed (bar, line, donut)
- [ ] Use `ChartCard` for main charts with controls
- [ ] Use `SimpleChartCard` for simpler charts
- [ ] Configure headerControls if needed
- [ ] Configure insights

### Phase 6: Additional Sections
- [ ] Add trend charts if applicable
- [ ] Add breakdown table/cards

### Phase 7: Expanded Modals
- [ ] Add `ExpandedChartModal` for each expandable card
- [ ] Pass `size="lg"` to charts in expanded view

### Phase 8: Integration
- [ ] Import in PracticeAnalysis.tsx
- [ ] Add to conditional render
- [ ] Pass required props

### Phase 9: Testing
- [ ] All functionality works
- [ ] Mobile responsive
- [ ] Expanded modals work
- [ ] No console errors

---

# TAB 3: CAPACITY & CLIENT 🔴 NOT STARTED

## Tab Info
- **Accent Color:** `amber`
- **Original Lines:** 3075-4710
- **Component File:** `CapacityClientTab.tsx`

(Follow same pattern as Sessions tab)

---

# IMPLEMENTATION TIPS FOR AI

## 1. Start by Reading the Original
Always read the original tab code in PracticeAnalysis.tsx first to understand:
- What data is displayed
- What interactions exist (toggles, hovers)
- What charts/visualizations are used

## 2. Map to Design System Components
- Custom stat boxes → `StatCard`
- Custom charts → `ChartCard` + `BarChart` or Recharts
- Custom tables → `DataTableCard`
- Toggle buttons → `ToggleButton` in headerControls
- Donut/pie charts → `DonutChartCard`

## 3. Follow the Patterns
Copy patterns from FinancialAnalysisTab.tsx:
- Import structure
- useMemo for computed values
- useState for local UI state
- ExpandedChartModal for fullscreen

## 4. Common Gotchas
- Recharts `domain` is a suggestion - use `allowDataOverflow={true}` to enforce
- Set domain to fit actual data range
- Use `size="lg"` in expanded modals
- Pass `height="100%"` for charts in expanded view

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
9. `components/design-system/controls/index.ts` - ToggleButton, GoalIndicator, ActionButton
10. `components/design-system/charts/BarChart.tsx` - Bar chart component

**Reference Implementations:**
- `components/design-system/Reference.tsx` - Component usage examples
- `components/analysis/FinancialAnalysisTab.tsx` - ✅ Complete reference implementation

**Types:**
- `components/analysis/types.ts` - Shared type definitions
