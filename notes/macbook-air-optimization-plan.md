# MacBook Air Screen Optimization Plan

**Created:** December 13, 2024
**Status:** In Progress
**Target Device:** MacBook Air (13.3" at 1440x900 or 13.6" at ~1280-1440 logical pixels)
**Target Breakpoint:** `lg` (1024px) with sidebar = ~720-1120px content area

---

## Philosophy

**DO NOT** make things smaller, reduce fonts, or shrink padding.
**DO** show fewer items at once with scroll/carousel patterns to maintain readability.

The goal is to keep the premium, large, readable experience but adapt the layout to show fewer items per row, with natural scrolling to access additional content.

---

## Issue Summary from Screenshots

1. **Chart card title "Completed Sessions" is cut off** - showing only "pleted Sessions"
2. **Cards are being squished horizontally** - trying to fit too many in a row
3. **Insights row** (Oct, +2.2%, 628-712) is cramped
4. **Header controls** (By Clinician toggle, 200 Goal) overflow horizontally

---

## Implementation Tracker

### Phase 1: Core Layout Components
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.1 | Update Grid `cols={2}` breakpoint | `components/design-system/layout/Grid.tsx` | [ ] Pending | Change to `grid-cols-1 xl:grid-cols-2` |
| 1.2 | Update Grid `cols={3}` breakpoint | `components/design-system/layout/Grid.tsx` | [ ] Pending | Change to `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3` |
| 1.3 | Update Grid `cols={4}` breakpoint | `components/design-system/layout/Grid.tsx` | [ ] Pending | Change to `grid-cols-2 xl:grid-cols-4` |
| 1.4 | Update Grid `cols={5}` breakpoint | `components/design-system/layout/Grid.tsx` | [ ] Pending | Change to `grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` |

### Phase 2: ChartCard Header Fix
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 2.1 | Refactor header to stack title/controls | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | Title row on top, controls row below at lg |
| 2.2 | Add horizontal scroll for header controls | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | `overflow-x-auto` for controls row |
| 2.3 | Fix legend overflow | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | Allow legend to wrap or scroll |
| 2.4 | Fix SimpleChartCard header | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | Same pattern as ChartCard |
| 2.5 | Fix ExpandedChartModal header | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | Ensure modal header wraps properly |

### Phase 3: Insights Row Fix
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 3.1 | Change insights to flex with scroll | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | `flex overflow-x-auto xl:grid` pattern |
| 3.2 | Ensure insight boxes don't shrink | `components/design-system/cards/ChartCard.tsx` | [ ] Pending | Add `flex-shrink-0` to insight items |

### Phase 4: Dashboard Page
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 4.1 | MetricsRow: Extend scroll to lg | `components/MetricsRow.tsx` | [ ] Pending | Change `lg:hidden` scroll to `xl:hidden` |
| 4.2 | MetricsRow: Update grid cols at lg | `components/MetricsRow.tsx` | [ ] Pending | `xl:grid-cols-3 2xl:grid-cols-5` |
| 4.3 | Priority cards: Fix width at lg | `components/Dashboard.tsx` | [ ] Pending | Change `lg:w-[calc(25%-12px)]` to larger or scroll |
| 4.4 | PageHeader: Verify actions wrapping | `components/Dashboard.tsx` | [ ] Pending | Ensure Live/Historical toggle wraps gracefully |

### Phase 5: Clinician Overview Page
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 5.1 | Metric selector: Change to 2 cols at lg | `components/ClinicianOverview.tsx` | [ ] Pending | `grid-cols-2 xl:grid-cols-4` |
| 5.2 | Metric buttons: Reduce padding at lg | `components/ClinicianOverview.tsx` | [ ] Pending | `px-4 py-4 xl:px-6 xl:py-6` |
| 5.3 | Ranking table: Add horizontal scroll | `components/ClinicianOverview.tsx` | [ ] Pending | `overflow-x-auto` wrapper for table |
| 5.4 | Column headers: Add scroll sync | `components/ClinicianOverview.tsx` | [ ] Pending | Headers scroll with content |
| 5.5 | Header actions: Stack vertically at lg | `components/ClinicianOverview.tsx` | [ ] Pending | View mode toggles stack on smaller screens |

### Phase 6: Practice Analysis Tabs
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 6.1 | Sessions tab: Charts to 1 col at lg | `components/analysis/SessionsAnalysisTab.tsx` | [ ] Pending | Use updated Grid component |
| 6.2 | Sessions tab: StatCards scroll at lg | `components/analysis/SessionsAnalysisTab.tsx` | [ ] Pending | 4 cards → scroll or 2 per row |
| 6.3 | Financial tab: Same fixes | `components/analysis/FinancialAnalysisTab.tsx` | [ ] Pending | Charts 1 col, stats 2 per row |
| 6.4 | Capacity tab: Same fixes | `components/analysis/CapacityClientTab.tsx` | [ ] Pending | Charts 1 col, stats 2 per row |
| 6.5 | Retention tab: Same fixes | `components/analysis/RetentionTab.tsx` | [ ] Pending | Charts 1 col, stats 2 per row |
| 6.6 | Insurance tab: Same fixes | `components/analysis/InsuranceTab.tsx` | [ ] Pending | Charts 1 col, stats 2 per row |
| 6.7 | Admin tab: Same fixes | `components/analysis/AdminTab.tsx` | [ ] Pending | Charts 1 col, stats 2 per row |
| 6.8 | Client Roster: Verify scroll works | `components/ClientRoster.tsx` | [ ] Pending | Table should scroll horizontally |

### Phase 7: PageHeader Component
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 7.1 | Stack title and actions at lg | `components/design-system/layout/PageHeader.tsx` | [ ] Pending | `flex-col xl:flex-row` pattern |
| 7.2 | Tab navigation: Add scroll | `components/design-system/layout/PageHeader.tsx` | [ ] Pending | Already has `overflow-x-auto`, verify works |

### Phase 8: StatCard Component
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 8.1 | Add minimum width constraint | `components/design-system/cards/StatCard.tsx` | [ ] Pending | `min-w-[280px]` for scrollable layouts |
| 8.2 | Ensure flex-shrink-0 in scroll contexts | `components/design-system/cards/StatCard.tsx` | [ ] Pending | Prevent squishing in flex containers |

### Phase 9: Settings & Auth Pages
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 9.1 | Settings page audit | TBD | [ ] Pending | Check layout at lg breakpoint |
| 9.2 | Configure page audit | TBD | [ ] Pending | Check layout at lg breakpoint |
| 9.3 | Login page audit | TBD | [ ] Pending | Check centering and form width |
| 9.4 | Signup page audit | TBD | [ ] Pending | Check centering and form width |

### Phase 10: Final Testing & Polish
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 10.1 | Test all pages at 1280px width | - | [ ] Pending | Simulate MacBook Air |
| 10.2 | Test all pages at 1024px width | - | [ ] Pending | Edge of lg breakpoint |
| 10.3 | Test with sidebar collapsed | - | [ ] Pending | Should give more content space |
| 10.4 | Test with sidebar expanded | - | [ ] Pending | Most constrained scenario |
| 10.5 | Fix any remaining overflow issues | - | [ ] Pending | Address as found |

---

## Detailed Implementation Notes

### 1. Grid.tsx Changes

**Current:**
```tsx
const COLS_CLASSES: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};
```

**New:**
```tsx
const COLS_CLASSES: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 xl:grid-cols-2',           // 1 col at lg, 2 at xl
  3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',  // 2 at lg, 3 at xl
  4: 'grid-cols-2 xl:grid-cols-4',           // 2 at lg, 4 at xl
  5: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5', // 3 at lg, 5 at xl
};
```

### 2. ChartCard Header Layout

**Current:** Single row with title on left, controls on right
```tsx
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
```

**New:** Stacked layout at smaller breakpoints
```tsx
<div className="flex flex-col gap-4 mb-6 xl:mb-8">
  {/* Title Section - always full width */}
  <div className="flex-1 min-w-0">
    <h3>Title</h3>
    <p>Subtitle</p>
  </div>

  {/* Controls Section - horizontal scroll */}
  <div className="flex items-center gap-3 overflow-x-auto pb-2 -mb-2 xl:overflow-visible xl:pb-0 xl:mb-0 xl:justify-end">
    {headerControls}
    {legend}
    {expandButton}
  </div>
</div>
```

### 3. Insights Row Fix

**Current:**
```tsx
<div className={`grid grid-cols-${insights.length} gap-4 ...`}>
```

**New:**
```tsx
<div className="flex gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0">
  {insights.map((insight, idx) => (
    <div key={idx} className="flex-shrink-0 min-w-[140px] xl:min-w-0 ...">
```

### 4. MetricsRow Changes

**Current:**
```tsx
{/* Desktop: Grid layout (lg/1024px and above) */}
<div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5 items-stretch">
```

**New:**
```tsx
{/* Mobile/Tablet/Small Laptop: Horizontal scroll (below xl/1280px) */}
<div className="xl:hidden flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory ...">

{/* Desktop: Grid layout (xl/1280px and above) */}
<div className="hidden xl:grid xl:grid-cols-4 2xl:grid-cols-5 gap-4 xl:gap-5 items-stretch">
```

### 5. Clinician Overview Metric Selector

**Current:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
```

**New:**
```tsx
<div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
  {/* Also reduce button padding */}
  <button className="px-4 py-4 xl:px-6 xl:py-6 min-h-[80px] xl:min-h-[100px]">
```

---

## Key Breakpoint Strategy

| Breakpoint | Width | Sidebar | Content Width | Strategy |
|------------|-------|---------|---------------|----------|
| `sm` | 640px | Hidden | 640px | Mobile scroll |
| `md` | 768px | Hidden | 768px | Mobile scroll |
| `lg` | 1024px | 320px | ~700px | **Hybrid: Fewer cols + scroll** |
| `xl` | 1280px | 320px | ~960px | Desktop grid |
| `2xl` | 1536px | 320px | ~1216px | Full layout |

**The `lg` breakpoint is the critical one for MacBook Air.**

At `lg` with 320px sidebar:
- `cols={2}` charts → Show 1, scroll to see 2nd
- `cols={4}` stat cards → Show 2 per row or scroll
- Chart headers → Stack title above controls

---

## Progress Summary

- [ ] Phase 1: Core Layout (0/4 tasks)
- [ ] Phase 2: ChartCard Header (0/5 tasks)
- [ ] Phase 3: Insights Row (0/2 tasks)
- [ ] Phase 4: Dashboard (0/4 tasks)
- [ ] Phase 5: Clinician Overview (0/5 tasks)
- [ ] Phase 6: Analysis Tabs (0/8 tasks)
- [ ] Phase 7: PageHeader (0/2 tasks)
- [ ] Phase 8: StatCard (0/2 tasks)
- [ ] Phase 9: Settings/Auth (0/4 tasks)
- [ ] Phase 10: Testing (0/5 tasks)

**Total: 0/41 tasks complete**

---

## Change Log

| Date | Phase | Tasks | Notes |
|------|-------|-------|-------|
| - | - | - | - |

