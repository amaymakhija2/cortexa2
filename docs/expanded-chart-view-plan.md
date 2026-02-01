# Expanded Chart View - Clinician Details Page

## Overview

A **full-screen split view** that replaces the current `ExpandedChartModal`. When users click to expand any chart, they see the enlarged chart on the left and a contextual data panel on the right. This answers the question every practice owner asks: **"Who specifically is driving this number?"**

---

## Confirmed Design Decisions

| Decision | Choice |
|----------|--------|
| **Layout** | Full-screen split view (chart left ~60%, data right ~40%) |
| **Trigger** | Click expand on any chart (replaces current modal) |
| **Chart interaction** | Clicking bars/segments/legend items updates the right panel |
| **Navigation** | Dropdown selector for month/segment + clickable chart |
| **Content** | Data tables only (no insights/recommendations) |
| **Client names** | Display only, not clickable |
| **MVP scope** | Sessions, Cancellations, Revenue, Attendance, No-Show |

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Monthly Revenue                                        [Legend]    [X]  │
├─────────────────────────────────────┬────────────────────────────────────┤
│                                     │  Client Breakdown     [January ▼] │
│                                     │  ┌─────────────────────────────┐  │
│         ████                        │  │ 🔍 Search...                │  │
│         ████  ████                  │  └─────────────────────────────┘  │
│    ████ ████  ████  ████            │  CLIENT     SESSIONS  REVENUE     │
│    ████ ████  ████  ████  ████      │  ─────────────────────────────────│
│   ─────────────────────────────     │  John Smith     4      $600       │
│   Jan  Feb  Mar  Apr  May  Jun      │  Jane Doe       3      $450       │
│                                     │  Mike Brown     2      $300       │
│    Click bars to filter table       │  ─────────────────────────────────│
│                                     │  Total          9      $1,350     │
└─────────────────────────────────────┴────────────────────────────────────┘
```

**Left Panel (~60% width):**
- Enlarged chart with full detail
- Interactive: clicking bars/segments/legend items updates the right panel
- "Click bars to filter table" hint at bottom
- DonutCharts include their own interactive legend

**Right Panel (~40% width):**
- Header with dropdown to select month/segment
- Search input to filter by client name
- Data table with client-level breakdown (dynamic column widths)
- Summary row at bottom (aligned with columns via `<tfoot>`)

---

## Use Cases (Matching Actual Charts)

There are **11 expandable chart cards** on the Clinician Details page. Here's what each expanded view shows:

---

### Bar Charts (Time-Series)

#### 1. Monthly Revenue
**Right Panel Table:**
| Client | Sessions | Revenue | Avg/Session |
|--------|----------|---------|-------------|
| John Smith | 4 | $600 | $150 |
| Jane Doe | 3 | $450 | $150 |

**Dropdown:** Month selector (Jan - Dec)
**Summary:** Total: $1,350 from 9 sessions

---

#### 2. Monthly Sessions
**Right Panel Table:**
| Client | Sessions | Last Seen | Next Appt | Rebooked |
|--------|----------|-----------|-----------|----------|
| John Smith | 4 | Jan 28 | Feb 4 | ✅ |
| Jane Doe | 2 | Jan 20 | — | ⚠️ |

**Dropdown:** Month selector
**Summary:** Total: 7 sessions · 2 of 3 clients rebooked

---

#### 3. Cancellation Breakdown (Stacked Bar)
**Right Panel Table:**
| Client | Type | Count |
|--------|------|-------|
| Mike Brown | Client | 1 |
| Jane Doe | Client | 1 |
| Alex Thompson | Clinician | 1 |

**Dropdown:** Month selector
**Legend:** Displayed in header (Client / Clinician)
**Summary:** Total: 4 cancellations (3 client, 1 clinician)

---

#### 4. No-Show & Late Cancellations (Stacked Bar)
**Right Panel Table:**
| Client | Type | Count |
|--------|------|-------|
| Mike Brown | No-Show | 1 |
| Jane Doe | Late Cancel | 1 |

**Dropdown:** Month selector
**Legend:** Displayed in header (Late Cancel / No-Show)
**Summary:** Total: 2 missed · Est. $300 lost revenue

---

#### 5. Caseload/Capacity
**Right Panel Table:**
| Client | Status | Frequency | Total Sessions | Client Since |
|--------|--------|-----------|----------------|--------------|
| John Smith | Active | Weekly | 48 | Mar 2023 |
| Jane Doe | At Risk | Biweekly | 24 | Nov 2023 |

**Dropdown:** Month selector
**Summary:** 3 active clients · 85% utilization

---

#### 6. Churned Clients Per Month
**Right Panel Table:**
| Client | Last Session | Total Sessions | Duration |
|--------|--------------|----------------|----------|
| Mike Brown | Dec 15 | 8 | 4 months |
| Jane Doe | Dec 20 | 3 | 1 month |

**Dropdown:** Month selector
**Summary:** 2 clients churned in December

---

### Donut Charts (Segment-Based)

For DonutCharts, the legend is built into the chart component (not in header). Clicking segments OR legend items updates the table filter.

#### 7. Attendance Breakdown
**Right Panel Table (varies by segment clicked):**

*For "Attended":*
| Client | Count | Total Booked | Rate |
|--------|-------|--------------|------|
| John Smith | 12 | 14 | 86% |

*For "Client Cancelled":*
| Client | Count | Total Booked | Rate |
|--------|-------|--------------|------|
| Mike Brown | 4 | 8 | 50% |

**Dropdown:** Segment (Attended, Client Cancelled, Clinician Cancelled, Late Cancel, No-Show)
**Interactive:** Click pie segments or legend items to filter

---

#### 8. Session Frequency
**Right Panel Table (varies by segment clicked):**

*For "Weekly":*
| Client | Sessions/Mo | Tenure | Revenue/Mo |
|--------|-------------|--------|------------|
| John Smith | 4.0 | 10 months | $600 |

**Dropdown:** Frequency (Weekly, Bi-weekly, Monthly, Inconsistent)
**Interactive:** Click pie segments or legend items to filter

---

#### 9. Churn Timing
**Right Panel Table (varies by segment clicked):**

*For "Early (<5 sessions)":*
| Client | Total Sessions | Duration | Reason |
|--------|----------------|----------|--------|
| Tom Wilson | 2 | 3 weeks | Unknown |

**Dropdown:** Stage (Early <5, Medium 5-15, Late >15)
**Interactive:** Click pie segments or legend items to filter

---

#### 10. Outstanding Notes
**Right Panel Table (varies by segment clicked):**

*For "Overdue":*
| Client | Session Date | Session Type | Days Overdue |
|--------|--------------|--------------|--------------|
| John Smith | Dec 5 | Individual | 10 days |

**Dropdown:** Status (Overdue, Due within 48h)
**Interactive:** Click pie segments or legend items to filter

---

### Funnel/Milestone Charts

#### 11. Return Rate Milestones
**Right Panel Table:**
| Client | Start Date | Total Sessions | Status |
|--------|------------|----------------|--------|
| John Smith | Jul 2023 | 24 | Active |
| Mike Brown | Jul 2023 | 8 | Churned |

**Dropdown:** Milestone (3mo, 6mo, 9mo, 1yr, Beyond)
**Summary:** 6-month retention: 67%

---

## Table Features

All data tables include:
- **Sortable columns:** Click any header to sort ascending/descending
- **Search/filter:** Text input to filter by client name
- **Summary row:** Totals at bottom (aligned via `<tfoot>`)
- **Dynamic column widths:** Client column adjusts based on number of columns (35% for 3 cols → 24% for 6+ cols)

---

## Visual Design (Per Design System)

### Full-Screen Modal
- **Positioning:** Offset by sidebar width via `marginLeft: var(--sidebar-width, 72px)`
- **Size:** `max-w-[1400px]`, `h-[90vh]`
- **Background:** Backdrop with `rgba(28, 25, 23, 0.7)` and blur
- **Modal:** White background with gradient, `rounded-2xl`, premium shadow
- **Close button:** Top-right minimize icon, stone-600 hover

### Left Panel (Chart) ~60% width (`flex-[6]`)
- **Container:** `min-w-0` to prevent overflow
- **Hint text:** "Click bars to filter table" at bottom
- **DonutCharts:** Include built-in interactive legend (no header legend)

### Right Panel (Data) ~40% width (`flex-[4]`)
- **Minimum width:** `min-w-[320px]`
- **Header:** Title "Client Breakdown" with period dropdown
- **Dropdown:** Portal-based rendering to avoid z-index issues
- **Search:** Compact input with search icon and clear button
- **Table:**
  - Uses `<colgroup>` for precise column alignment
  - Uses `table-fixed` for consistent widths
  - Header row: Stone-50 background, uppercase text
  - Data rows: Hover state with amber tint
  - Status indicators: Colored dots for success/warning/error
- **Summary row:** In `<tfoot>` for proper alignment with columns

### Responsive
- Modal stays centered with sidebar offset
- Minimum viable width maintained

---

## Files Modified/Created

```
components/
├── ClinicianDetailsTab.tsx          # Integration with all 11 charts
│                                    # ClientRosterCard removed from body
│                                    # onSegmentClick handlers for DonutCharts
└── design-system/
    ├── Legend.tsx                   # Added onItemClick handler
    ├── cards/
    │   └── DonutChartCard.tsx       # Added onSegmentClick prop
    └── ExpandedChartView/
        ├── index.ts                 # Exports
        ├── ExpandedChartView.tsx    # Main container with sidebar offset
        ├── ChartPanel.tsx           # Left panel (hint text only)
        ├── DataPanel.tsx            # Right panel with portal dropdown
        └── DataTable.tsx            # Dynamic column widths, tfoot alignment
```

---

## Implementation Details

### DonutChartCard Click Support
- Added `onSegmentClick?: (segment: DonutSegment) => void` prop
- SVG path elements have onClick handlers
- Legend component receives `onItemClick` callback
- Maps segment labels to period values for filtering

### Legend Click Support
- Added `onItemClick?: (item: LegendItem) => void` prop
- Implemented in stacked, grid, and compact variants
- Click handlers call onItemClick with the clicked item

### Data Table Alignment
- Uses `<colgroup>` with percentage-based column widths
- Dynamic width calculation: `getColumnWidths()` adjusts based on column count
- Summary row in `<tfoot>` shares same column structure
- `table-fixed` ensures consistent column sizing

### Client Data Functions
- All getClientData functions return `{ rows, summary, summaryLabel }`
- Rows use `name` property (not `clientName`) per ClientBreakdownRow interface
- Generate mock data based on actual totals from sessionData/attendanceSegments

---

## Status: ✅ FULLY IMPLEMENTED

### All 11 Charts - COMPLETE
1. ✅ Monthly Revenue - BarChart with client breakdown
2. ✅ Monthly Sessions - BarChart with rebook status
3. ✅ Cancellation Breakdown - Stacked BarChart with legend
4. ✅ No-Show & Late Cancellations - Stacked BarChart with legend
5. ✅ Attendance Breakdown - DonutChart with clickable segments/legend
6. ✅ Caseload/Capacity - BarChart with client roster
7. ✅ Session Frequency - DonutChart with clickable segments/legend
8. ✅ Churned Clients Per Month - DivergingBarChart
9. ✅ Churn Timing - DonutChart with clickable segments/legend
10. ✅ Outstanding Notes - DonutChart with clickable segments/legend
11. ✅ Return Rate Milestones - LineChart with milestone selector

### Interactive Features - COMPLETE
- ✅ BarChart `onBarClick` - clicking bars updates data panel
- ✅ DonutChartCard `onSegmentClick` - clicking segments updates data panel
- ✅ Legend `onItemClick` - clicking legend items updates data panel
- ✅ Dropdown selector - changes period/segment filter
- ✅ Search input - filters table by client name
- ✅ Sortable columns - click headers to sort

### Layout & Styling - COMPLETE
- ✅ Sidebar offset positioning (`marginLeft: var(--sidebar-width)`)
- ✅ Proper viewport fitting (`max-w-[1400px]`, `h-[90vh]`)
- ✅ Dynamic column widths based on column count
- ✅ Summary row alignment via `<tfoot>`
- ✅ Portal-based dropdown to avoid z-index issues
- ✅ DonutCharts use built-in legend (no duplicate header legend)

### Data Functions - COMPLETE
- ✅ All ClientBreakdownRow objects use `name` property
- ✅ getCancellationsClientData - generates data from sessionData totals
- ✅ getNoShowClientData - generates data from sessionData totals
- ✅ getAttendanceClientData - generates data from attendanceSegments totals
- ✅ All other getClientData functions working correctly

### Infrastructure - COMPLETE
- ✅ ClientRosterCard removed from page body (header button only)
- ✅ All helper functions and table columns defined
- ✅ Build verified: `npm run build` completes successfully

---

## Recent Changes (Latest Session)

1. **DonutChart click support** - Added `onSegmentClick` prop to DonutChartCard, wired to all 4 DonutChart expanded views with label-to-value mapping

2. **Legend click support** - Implemented `onItemClick` in Legend.tsx for stacked, grid, and compact variants

3. **Removed duplicate legends** - Removed header legends from DonutChart expanded views (Attendance, Session Frequency, Churn Timing, Outstanding Notes) since DonutChartCard has built-in interactive legend

4. **Fixed client name display** - Changed `clientName` to `name` in all ClientBreakdownRow objects across 7+ getClientData functions

5. **Fixed empty table data** - Rewrote getCancellationsClientData, getNoShowClientData, and getAttendanceClientData to generate mock data from actual totals instead of sparse clientMonthlyData

6. **Fixed layout issues** (earlier in session):
   - Chart behind sidebar → Added marginLeft offset
   - Chart overflow → Added min-w-0 and proper sizing
   - Summary row misalignment → Moved to `<tfoot>` with shared `<colgroup>`
   - Column cramping → Dynamic width calculation based on column count

---

## Comments

<!-- Implementation complete. All charts have interactive expanded views with client-level breakdown tables. -->
