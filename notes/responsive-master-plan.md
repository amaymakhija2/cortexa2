# Responsive Redesign Master Plan

**Created:** November 26, 2025
**Status:** ✅ COMPLETE
**Approach:** Hybrid (Mobile-First Binary + Fluid Sizing)

---

## Table of Contents
1. [Problem Summary](#problem-summary)
2. [Strategy Overview](#strategy-overview)
3. [Breakpoint Strategy](#breakpoint-strategy)
4. [Critical Issues Inventory](#critical-issues-inventory)
5. [Implementation Phases](#implementation-phases)
6. [Detailed File Changes](#detailed-file-changes)
7. [New Files to Create](#new-files-to-create)
8. [Testing Checklist](#testing-checklist)
9. [Progress Tracker](#progress-tracker)

---

## Problem Summary

### Current State
The Cortexa dashboard has severe responsive issues causing:
- Content cut off on tablets and small laptops (768px-1200px range)
- Charts overflowing their containers
- Fixed percentage layouts (`w-[55%]`) breaking on narrow screens
- Inconsistent breakpoints creating broken middle states
- Tables with 12+ columns unusable on mobile
- Hardcoded pixel values that don't scale

### Root Causes Identified

1. **Inconsistent Breakpoints:** Navigation uses `lg:` (1024px) but content uses `md:` (768px), creating a 768-1024px zone where some elements think desktop, others think mobile.

2. **Fixed Dimensions:** Many inline styles with hardcoded pixels:
   - `width: '340px'` (date picker)
   - `height: '110px'` (heatmap cells)
   - `height: 'calc(100vh - 400px)'` (chart containers)

3. **Missing Breakpoints:** Grids jump from 2 to 4 columns without intermediate steps (e.g., `sm:grid-cols-2 xl:grid-cols-4` skips `lg:`).

4. **Percentage Layouts Without Fallback:** `w-[55%]` / `w-[45%]` splits have no mobile alternative.

---

## Strategy Overview

### Hybrid Approach

**Core Principle:** Use `lg:` (1024px) as the hard mobile/desktop breakpoint for layout switches, but use fluid sizing (clamp, min, max) within each mode.

| Screen Size | Mode | Characteristics |
|-------------|------|-----------------|
| 0-1023px | Mobile/Tablet | Bottom nav, hamburger menu, stacked layouts, horizontal scroll cards |
| 1024px+ | Desktop | Sidebar, header nav, grid layouts, full complexity |

### Why 1024px?
- Navigation already uses `lg:` (1024px) as the switch point
- iPad landscape is 1024px (good tablet/desktop boundary)
- Below 1024px, complex multi-column layouts simply don't work well

### Within Each Mode
- **Mobile:** Use `clamp()` for fluid sizing so 375px and 900px both work
- **Desktop:** Use `clamp()` so 1024px and 1920px both work
- No more fighting with intermediate breakpoints

---

## Breakpoint Strategy

### Standard Breakpoint Roles

| Breakpoint | Width | Role |
|------------|-------|------|
| Base | 0-639px | Mobile phones - single column, max simplicity |
| `sm:` | 640px+ | Large phones/small tablets - 2 columns for cards |
| `md:` | 768px+ | Tablets - **ONLY for spacing/sizing, NOT layout switches** |
| `lg:` | 1024px+ | **DESKTOP START** - sidebar, header nav, grid layouts |
| `xl:` | 1280px+ | 13-14" laptops - primary target, 4-column grids |
| `2xl:` | 1536px+ | Large monitors - 5-column grids |

### Key Rules

1. **All show/hide logic must use `lg:`**
   ```tsx
   // CORRECT:
   className="lg:hidden"      // Hide on desktop
   className="hidden lg:flex" // Show on desktop only

   // WRONG:
   className="md:hidden"      // Inconsistent with nav
   ```

2. **Grid columns must be progressive**
   ```tsx
   // CORRECT:
   className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

   // WRONG (skips breakpoints):
   className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
   ```

3. **Flex direction changes use `lg:`**
   ```tsx
   // CORRECT:
   className="flex flex-col lg:flex-row"

   // WRONG:
   className="flex flex-col md:flex-row"
   ```

---

## Critical Issues Inventory

### Severity: CRITICAL (Content Cut Off / Broken)

| # | Issue | File | Lines | Current | Fix |
|---|-------|------|-------|---------|-----|
| C1 | Fixed 55%/45% splits | PracticeAnalysis.tsx | 2963, 3119, 3611, 3749 | `w-[55%]` / `w-[45%]` | `w-full lg:w-[55%]` + stack parent |
| C2 | Chart height overflow | PracticeAnalysis.tsx | 936, 1274, 1979, 2320 | `clamp(450px, 55vh, 750px)` | Responsive classes `h-[300px] lg:h-[420px]` |
| C3 | Viewport calc overflow | PracticeAnalysis.tsx | 2962, 3610 | `calc(100vh - 400px)` | `clamp(300px, calc(100dvh - 300px), 600px)` |
| C4 | Date picker overflow | PracticeAnalysis.tsx | 683, 1732 | `width: '340px'` | `clamp(280px, 85vw, 380px)` |
| C5 | Non-responsive 3-col grids | PracticeAnalysis.tsx | 2465, 2778, 4095, 4277 | `grid-cols-3` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |

### Severity: HIGH (Inconsistent Behavior)

| # | Issue | File | Lines | Current | Fix |
|---|-------|------|-------|---------|-----|
| H1 | Wrong breakpoint for flex | Dashboard.tsx | 301 | `md:flex-row` | `lg:flex-row` |
| H2 | Time selector breakpoint | PracticeAnalysis.tsx | 627, 637 | `md:hidden` / `hidden md:flex` | `lg:hidden` / `hidden lg:flex` |
| H3 | Time selector breakpoint | PracticeAnalysis.tsx | 1676, 1686 | `md:hidden` / `hidden md:flex` | `lg:hidden` / `hidden lg:flex` |
| H4 | Grid skips xl breakpoint | MetricsRow.tsx | 451 | `lg:grid-cols-3 2xl:grid-cols-5` | Add `xl:grid-cols-4` |
| H5 | KPI grid skips lg | PracticeAnalysis.tsx | 818, 1867 | `sm:grid-cols-2 xl:grid-cols-4` | Add `lg:grid-cols-3` |
| H6 | Chart grid skips lg | PracticeAnalysis.tsx | 930, 1973 | `grid-cols-1 xl:grid-cols-2` | Change to `lg:grid-cols-2` |

### Severity: MEDIUM (Mobile UX)

| # | Issue | File | Lines | Current | Fix |
|---|-------|------|-------|---------|-----|
| M1 | Tables too wide for mobile | PracticeAnalysis.tsx | 1495-1565, 2634-2719, 4791-4996 | 12+ column tables | Add mobile card view |
| M2 | Heatmap fixed height | PracticeAnalysis.tsx | 3152, 3243, 3453, 3544, 3900 | `height: '110px'` | `clamp(80px, 15vw, 120px)` |
| M3 | Card max-width limiting | MetricsRow.tsx | 433-445 | `max-w-[400px]` | Remove or increase |

### Severity: LOW (Polish)

| # | Issue | File | Lines | Current | Fix |
|---|-------|------|-------|---------|-----|
| L1 | Chart bar label width | PracticeAnalysis.tsx | 1071, 2117 | `maxWidth: '72px'` | `clamp(48px, 6vw, 80px)` |
| L2 | Comparison chart heights | PracticeAnalysis.tsx | 4008, 4036, 4064 | Fixed pixel heights | Use `clamp()` |

---

## Implementation Phases

### Phase 1: Breakpoint Standardization
**Goal:** Make navigation and content use consistent breakpoints
**Files:** Dashboard.tsx, PracticeAnalysis.tsx, MetricsRow.tsx
**Issues:** H1, H2, H3, H4, H5, H6

### Phase 2: Critical Layout Fixes
**Goal:** Fix content that gets cut off or overflows
**Files:** PracticeAnalysis.tsx
**Issues:** C1, C2, C3, C4, C5

### Phase 3: Mobile Components
**Goal:** Create mobile-optimized alternatives for complex content
**Files:** hooks/useIsMobile.ts (NEW), PracticeAnalysis.tsx
**Issues:** M1

### Phase 4: Fluid Sizing
**Goal:** Replace remaining hardcoded pixels with fluid values
**Files:** PracticeAnalysis.tsx, MetricsRow.tsx
**Issues:** M2, M3, L1, L2

### Phase 5: CSS Foundation
**Goal:** Add CSS custom properties for consistency
**Files:** index.html

---

## Detailed File Changes

### File: `components/Dashboard.tsx`

#### Change D1: Fix flex breakpoint (Issue H1)
**Line:** 301
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0">

// AFTER:
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0">
```

---

### File: `components/MetricsRow.tsx`

#### Change M1: Add xl grid breakpoint (Issue H4)
**Line:** 451
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="hidden lg:grid lg:grid-cols-3 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5 items-start">

// AFTER:
<div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-5 items-start">
```

---

### File: `components/PracticeAnalysis.tsx`

This is the largest file with most issues. Changes organized by section.

#### Change P1: Time selector breakpoint - Financial Tab (Issues H2)
**Lines:** 627, 637
**Status:** ⬜ Not Started

```tsx
// Line 627 BEFORE:
className="md:hidden px-3 py-2 rounded-xl ..."

// Line 627 AFTER:
className="lg:hidden px-3 py-2 rounded-xl ..."

// Line 637 BEFORE:
className="hidden md:flex items-center gap-1 p-1 lg:p-1.5 ..."

// Line 637 AFTER:
className="hidden lg:flex items-center gap-1 p-1 xl:p-1.5 ..."
```

#### Change P2: KPI grid breakpoints - Financial Tab (Issue H5)
**Line:** 818
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 xl:gap-6">
```

#### Change P3: Chart grid breakpoint - Financial Tab (Issue H6)
**Line:** 930
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">

// AFTER:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
```

#### Change P4: Chart height - Financial Tab (Issue C2)
**Line:** 936 (and similar at 1274)
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div
  className="rounded-2xl sm:rounded-3xl ... relative flex flex-col overflow-hidden"
  style={{
    background: '...',
    height: 'clamp(450px, 55vh, 750px)',
  }}
>

// AFTER:
<div
  className="rounded-2xl sm:rounded-3xl ... relative flex flex-col overflow-hidden h-[300px] sm:h-[350px] lg:h-[420px] xl:h-[500px]"
  style={{
    background: '...',
    // REMOVE height from style
  }}
>
```

#### Change P5: Date picker width (Issue C4)
**Lines:** 683, 1732
**Status:** ⬜ Not Started

```tsx
// BEFORE:
style={{
  width: '340px',
  boxShadow: '...',
  ...
}}

// AFTER:
style={{
  width: 'clamp(280px, 85vw, 380px)',
  maxWidth: 'calc(100vw - 32px)',
  boxShadow: '...',
  ...
}}
```

#### Change P6: Time selector breakpoint - Sessions Tab (Issue H3)
**Lines:** 1676, 1686
**Status:** ⬜ Not Started

```tsx
// Line 1676 BEFORE:
className="md:hidden px-3 py-2 rounded-xl ..."

// Line 1676 AFTER:
className="lg:hidden px-3 py-2 rounded-xl ..."

// Line 1686 BEFORE:
className="hidden md:flex items-center gap-1 p-1 lg:p-1.5 ..."

// Line 1686 AFTER:
className="hidden lg:flex items-center gap-1 p-1 xl:p-1.5 ..."
```

#### Change P7: KPI grid breakpoints - Sessions Tab (Issue H5)
**Line:** 1867
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 xl:gap-6">
```

#### Change P8: Chart grid breakpoint - Sessions Tab (Issue H6)
**Line:** 1973
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">

// AFTER:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
```

#### Change P9: Chart height - Sessions Tab (Issue C2)
**Lines:** 1979, 2320
**Status:** ⬜ Not Started

Same pattern as P4 - replace inline `height: 'clamp(...)'` with responsive Tailwind classes.

#### Change P10: Non-responsive 3-column grids (Issue C5)
**Lines:** 2465, 2778, 4095, 4277
**Status:** ⬜ Not Started

```tsx
// BEFORE:
<div className="grid grid-cols-3 gap-6">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
```

#### Change P11: Fixed 55%/45% layout splits (Issue C1)
**Lines:** 2963, 3119, 3611, 3749
**Status:** ⬜ Not Started

```tsx
// BEFORE (parent container):
<div className="flex gap-6 flex-shrink-0" style={{ height: 'calc(100vh - 400px)' }}>
  <div className="w-[55%]" style={{ height: '100%' }}>
    ...
  </div>
  <div className="flex flex-col gap-6 w-[45%]" style={{ height: '100%' }}>
    ...
  </div>
</div>

// AFTER:
<div
  className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-shrink-0 min-h-[300px] lg:min-h-[400px]"
  style={{ height: 'clamp(300px, calc(100dvh - 300px), 600px)' }}
>
  <div className="w-full lg:w-[55%] h-auto lg:h-full">
    ...
  </div>
  <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[45%] h-auto lg:h-full">
    ...
  </div>
</div>
```

#### Change P12: Viewport calc heights (Issue C3)
**Lines:** 2962, 3610
**Status:** ⬜ Not Started

```tsx
// BEFORE:
style={{ height: 'calc(100vh - 400px)' }}

// AFTER:
className="min-h-[300px] lg:min-h-[400px]"
style={{ height: 'clamp(300px, calc(100dvh - 300px), 600px)' }}
```

#### Change P13: Heatmap cell heights (Issue M2)
**Lines:** 3152, 3243, 3453, 3544, 3900
**Status:** ⬜ Not Started

```tsx
// BEFORE:
style={{ height: '110px' }}

// AFTER:
style={{ height: 'clamp(80px, 15vw, 120px)' }}
```

#### Change P14: Tables mobile view (Issue M1)
**Lines:** 1495-1565, 2634-2719, 4791-4996
**Status:** ⬜ Not Started

This requires conditional rendering. Add `useIsMobile` hook import and wrap tables:

```tsx
import { useIsMobile } from '../hooks/useIsMobile';

// Inside component:
const isMobile = useIsMobile(1024);

// Replace table section:
{isMobile ? (
  <div className="space-y-3">
    {tableData.map(row => (
      <div key={row.id} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
        <div className="font-semibold text-stone-800 mb-2">{row.name || row.location}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-stone-500">Sessions:</span>
            <span className="font-medium ml-1">{row.sessions}</span>
          </div>
          <div>
            <span className="text-stone-500">Revenue:</span>
            <span className="font-medium ml-1">{row.revenue}</span>
          </div>
          <div>
            <span className="text-stone-500">Utilization:</span>
            <span className="font-medium ml-1">{row.utilization}%</span>
          </div>
          <div>
            <span className="text-stone-500">Retention:</span>
            <span className="font-medium ml-1">{row.retention}%</span>
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="w-full">
      {/* Existing table code */}
    </table>
  </div>
)}
```

---

## New Files to Create

### File: `hooks/useIsMobile.ts`
**Status:** ⬜ Not Started

```tsx
import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport is below a breakpoint.
 * Default breakpoint is 1024px (lg: in Tailwind).
 *
 * @param breakpoint - Width in pixels below which is considered "mobile"
 * @returns boolean - true if viewport width < breakpoint
 */
export const useIsMobile = (breakpoint: number = 1024): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    handleResize();

    // Add debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
```

---

### File: `index.html` CSS Additions
**Status:** ⬜ Not Started

Add to existing `<style>` block:

```css
:root {
  /* Responsive chart heights */
  --chart-height-sm: clamp(280px, 40vh, 380px);
  --chart-height-md: clamp(350px, 50vh, 500px);
  --chart-height-lg: clamp(400px, 55vh, 600px);

  /* Card constraints */
  --card-min-width: 280px;
  --card-max-width: 420px;

  /* Spacing scale */
  --gap-sm: clamp(8px, 1.5vw, 12px);
  --gap-md: clamp(12px, 2vw, 20px);
  --gap-lg: clamp(16px, 2.5vw, 28px);
}

/* Dynamic viewport height support */
@supports (height: 100dvh) {
  .h-dvh { height: 100dvh; }
  .min-h-dvh { min-height: 100dvh; }
}
```

---

## Testing Checklist

### Viewport Tests

| Width | Device | Expected Behavior | Status |
|-------|--------|-------------------|--------|
| 375px | iPhone SE | Full mobile: bottom nav, hamburger, stacked layouts, horizontal scroll | ⬜ |
| 390px | iPhone 14 | Same as above | ⬜ |
| 414px | iPhone 14 Pro Max | Same as above | ⬜ |
| 640px | sm breakpoint | Mobile with 2-column grids where applicable | ⬜ |
| 768px | iPad Mini portrait | Still mobile nav, NOT desktop | ⬜ |
| 820px | iPad Air portrait | Still mobile nav | ⬜ |
| 900px | **KEY TEST** | Must still be mobile nav | ⬜ |
| 1024px | iPad landscape | Desktop starts: sidebar, header nav | ⬜ |
| 1280px | MacBook Air 13" | Full desktop, 4-column grids | ⬜ |
| 1440px | MacBook Pro 14" | Comfortable laptop view | ⬜ |
| 1536px | 2xl breakpoint | 5-column grids | ⬜ |
| 1920px | External monitor | Max comfortable width | ⬜ |

### Component-Specific Tests

| Component | Test | Status |
|-----------|------|--------|
| Dashboard header | Flex layout switches at 1024px, not 768px | ⬜ |
| MetricsRow | 3 cols at 1024px, 4 cols at 1280px, 5 cols at 1536px | ⬜ |
| PracticeAnalysis KPI cards | 2 cols at 640px, 3 cols at 1024px, 4 cols at 1280px | ⬜ |
| PracticeAnalysis charts | Side-by-side at 1024px, not cutting off | ⬜ |
| PracticeAnalysis 55/45 layout | Stacks vertically below 1024px | ⬜ |
| Date picker | Fits on 375px screen without overflow | ⬜ |
| Tables | Card view on mobile, table on desktop | ⬜ |
| Time period selectors | Dropdown on mobile, pills on desktop | ⬜ |

### Critical Regression Tests

| Test | Status |
|------|--------|
| No horizontal scroll on any viewport | ⬜ |
| All content visible (nothing cut off) | ⬜ |
| Charts render correctly at all sizes | ⬜ |
| Navigation works: bottom nav < 1024px, sidebar >= 1024px | ⬜ |
| iOS Safari: safe areas respected | ⬜ |
| Touch targets minimum 44px on mobile | ⬜ |

---

## Progress Tracker

### Overall Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Breakpoint Standardization | ✅ Complete | 6/6 |
| Phase 2: Critical Layout Fixes | ✅ Complete | 5/5 |
| Phase 3: Mobile Components | ✅ Complete | 2/2 |
| Phase 4: Fluid Sizing | ✅ Complete | 3/3 |
| Phase 5: CSS Foundation | ✅ Complete | 1/1 |
| **TOTAL** | **✅ COMPLETE** | **17/17** |

### Detailed Task Status

#### Phase 1: Breakpoint Standardization
- [x] D1: Dashboard.tsx line 301 - flex breakpoint
- [x] P1: PracticeAnalysis.tsx lines 627, 637 - time selector breakpoint (Financial)
- [x] P6: PracticeAnalysis.tsx lines 1676, 1686 - time selector breakpoint (Sessions)
- [x] M1: MetricsRow.tsx line 451 - add xl:grid-cols-4
- [x] P2: PracticeAnalysis.tsx line 818 - KPI grid (Financial)
- [x] P7: PracticeAnalysis.tsx line 1867 - KPI grid (Sessions)

#### Phase 2: Critical Layout Fixes
- [x] P11: Fixed 55%/45% splits (lines 2968, 3125, 3617, 3755) - all converted to `w-full lg:w-[55%/45%]` with flex-col lg:flex-row
- [x] P3/P4/P8/P9: Chart grid + heights (lines 930, 1269, 1971, 2313) - grid to lg:grid-cols-2, heights to responsive classes
- [x] P12: Viewport calc heights (lines 2968, 3616) - changed to clamp() with dvh
- [x] P5: Date picker width (lines 683, 1732) - both fixed with clamp(280px, 85vw, 380px)
- [x] P10: Non-responsive 3-col grids (lines 2463, 4283, 4411, 4467) - all fixed

#### Phase 3: Mobile Components
- [x] Create hooks/useIsMobile.ts - created with debounced resize listener
- [x] P14: Table mobile card views - **ALL COMPLETE**
  - Financial breakdown table (line ~1497) - mobile card view with totals + monthly cards
  - Sessions Monthly Breakdown table (line ~2692) - mobile card view with period totals + monthly cards
  - Group by Primary Location table (line ~4951) - mobile card view per location with all metrics
  - Group by Supervisor table (line ~5125) - mobile card view per supervisor with all metrics
  - Clinicians Details table (line ~5297) - mobile card view per clinician with location/supervisor info

#### Phase 4: Fluid Sizing
- [x] P13: Heatmap cell heights - all 5 occurrences changed to `clamp(80px, 15vw, 120px)`
- [x] Chart bar label widths - all 4 occurrences changed to `clamp(48px, 6vw, 80px)`
- [x] Comparison chart heights - 3 bars changed to fluid heights with responsive widths

#### Phase 5: CSS Foundation
- [x] index.html CSS custom properties - added chart heights, card constraints, gap scale, dvh support

---

## Post-Implementation Fixes (November 26, 2025)

### Issues Found During Testing

| Issue | File | Fix Applied |
|-------|------|-------------|
| Priority Tasks large gap on right | Dashboard.tsx | Removed `justify-between` from main layout, changed to natural flow with `flex-1` |
| Top cards bunching when resizing | MetricsRow.tsx | Changed from `w-[85vw] sm:w-[45vw]` to fixed widths `w-[280px] sm:w-[320px] md:w-[340px]` |
| Mobile cards not horizontally scrollable | Dashboard.tsx, MetricsRow.tsx | Removed `overflow-x-hidden` from container, added `WebkitOverflowScrolling: 'touch'` |

### Detailed Fixes

1. **Dashboard.tsx line 289**: Removed `overflow-x-hidden` to allow horizontal scrolling
2. **Dashboard.tsx line 358**: Changed from `justify-between` to natural flex flow
3. **Dashboard.tsx line 418**: Removed `overflow-hidden` from cards container
4. **Dashboard.tsx line 431**: Changed Priority Tasks card widths from vw-based to fixed pixel widths; increased to `lg:w-[calc(25%-12px)]` so 4 fit on page
5. **MetricsRow.tsx line 430-452**: Changed mobile card widths from `w-[85vw] sm:w-[45vw]` to `w-[280px] sm:w-[320px] md:w-[340px]`
6. **PracticeAnalysis.tsx lines 1299, 2396**: Fixed donut chart sizing - increased SVG size to 320px, outer radius to 150px, inner radius to 95px
7. **PracticeAnalysis.tsx**: Enhanced chart card heights to `h-[380px] sm:h-[450px] lg:h-[520px] xl:h-[600px]` for Revenue Performance, Revenue Distribution, Completed Sessions, and Attendance Breakdown
8. **PracticeAnalysis.tsx**: Improved donut chart legend layout with larger gaps (`gap-3`/`gap-4`), better padding (`py-3 px-4`), larger color dots (`w-6 h-6`), and improved typography (`text-base lg:text-lg` for labels, `text-xl lg:text-2xl` for values)

---

## Notes for Future AI

### Key Context
1. The codebase already has a `hooks/useResponsiveChartSizes.ts` - check it for patterns
2. Navigation (Sidebar, Header, BottomNav) already correctly uses `lg:` breakpoint
3. MetricsRow.tsx has a good pattern: separate mobile scroll view and desktop grid view
4. PracticeAnalysis.tsx is ~5100 lines - it's the main problem file

### Common Patterns in This Codebase
- Tailwind CSS with arbitrary values `w-[85vw]`
- Inline styles for complex values `style={{ height: 'clamp(...)' }}`
- React state for responsive: `useState` with resize listener
- Gradient backgrounds on cards (preserve these)

### Watch Out For
- The date picker dropdown positioning may need adjustment after width changes
- Chart tooltips may overflow on mobile - test carefully
- Some charts have custom SVG elements (donut charts) that may need separate handling

### Testing Commands
```bash
npm run dev  # Start dev server
# Then use browser DevTools responsive mode to test
```
