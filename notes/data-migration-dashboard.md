# Dashboard Key Metrics - Data Migration

## Summary
Replaced placeholder/hardcoded data in Dashboard.tsx with real data calculated from the SimplePractice payment CSV export.

## Data Source
- **File:** Pay period report CSV from SimplePractice
- **Records:** 11,331 payment records
- **Date Range:** Feb 2023 - Dec 2025
- **Clinicians:** 17

## Files Created/Modified

### New Files
1. **`scripts/parsePaymentData.cjs`** - Parses CSV and generates TypeScript data file
   - Extracts unique client ID from invoice URL (not initials - multiple clients have same initials)
   - Obscures clinician names: "Gaya Kodiyalam, LCSW" → "G. Kod"
   - Removes invoice # and URL columns

2. **`data/paymentData.ts`** - Generated data file containing:
   - `PaymentRecord` interface
   - `CLINICIANS` array (obscured names)
   - `PAYMENT_DATA` array (11,331 records)
   - `PRACTICE_SETTINGS` (manually configured values)

3. **`data/metricsCalculator.ts`** - Utility functions to calculate metrics:
   - `calculateDashboardMetrics(month, year)` - Returns all metrics for a month
   - `getRecordsForMonth()` - Filter by date
   - `calculateRevenue()` - Sum of amounts
   - `calculateSessions()` - Count of records
   - `getActiveClients()` - Unique client IDs in period
   - `getNewClients()` - First appearance in that month
   - `getChurnedClients()` - No payment in last 60 days, but had one 60-120 days ago
   - `getMonthlyData()` - Get data for charts

### Modified Files
1. **`components/Dashboard.tsx`** - Now imports and uses real calculated data

## Key Decisions

### Revenue Calculation
- **Uses `datePaid`** (cash basis), not `appointmentDate` (accrual)
- Summed by month when payment was received

### Client Counting
- **Uses unique client ID** extracted from invoice URL, NOT initials
- Multiple clients can have same initials, so initials were unreliable

### Status Determination (Smart Pro-Rating)
For current month (partial), status compares actual vs **pro-rated goal**:
- Day 6 of 31 = 19.4% through month
- Expected revenue = $100k × 0.194 = $19.4k
- If actual $13.7k → 70% of pace → "Critical"

For past months, compares to full goal.

### Metrics That CAN Be Calculated from CSV
| Metric | How |
|--------|-----|
| Revenue | Sum of `amount` by `datePaid` month |
| Sessions | Count of records |
| Active Clients | Unique `clientId` in month |
| New Clients | First appearance of `clientId` |
| Churned Clients | No payment in 60 days, had payment 60-120 days ago |

### Metrics That CANNOT Be Calculated (use PRACTICE_SETTINGS)
| Metric | Why | Current Value |
|--------|-----|---------------|
| Openings | Not in payment data | 18 |
| Rebook Rate | Need appointment data, not just payments | 83% |
| Client Cancel Rate | Need cancelled appointments | 24% |
| Late Cancel Rate | Need cancelled appointments | 3% |
| Clinician Cancel Rate | Need cancelled appointments | 3% |
| Outstanding Notes % | Need notes/documentation data | 22% |

## PRACTICE_SETTINGS (data/paymentData.ts)
```typescript
export const PRACTICE_SETTINGS = {
  currentOpenings: 18,
  attendance: {
    showRate: 0.71,
    clientCancelled: 0.24,
    lateCancelled: 0.03,
    clinicianCancelled: 0.03,
    rebookRate: 0.83,
  },
  outstandingNotesPercent: 0.22,
  churnWindowDays: 60,
};
```

## GOALS (components/Dashboard.tsx)
```typescript
const GOALS = {
  revenue: 100000,      // $100k monthly target
  sessions: 475,        // ~475 sessions/month target
  rebookRate: 0.85,     // 85% rebook rate target
  notesOverdue: 0.10,   // <10% overdue notes target
};
```

## Text Format (DO NOT CHANGE)
Keep original text format in subtext:
- Revenue: "Goal: $100k · $86.3k left to reach target"
- Sessions: "Goal: 475 · 14% of monthly goal"
- Clients: "2 new, 0 churned · 18 openings"
- Attendance: "24% client cancel rate"
- Notes: "Goal: <10% · 22% currently overdue"

## To Replicate for Other Tabs

1. **Identify what data the tab needs** - Check component for hardcoded data
2. **Check if calculable from CSV** - Revenue, sessions, clients can be calculated
3. **Add calculation functions to `metricsCalculator.ts`** if needed
4. **Add static values to `PRACTICE_SETTINGS`** for things not in CSV
5. **Import and use** in the component
6. **Keep original text format** - Only change values, not text structure

---

# Clinicians Tab - Data Migration

## Summary
Replaced placeholder/hardcoded clinician data in ClinicianOverview.tsx with real data calculated from the SimplePractice payment CSV export.

## Files Modified

### `data/metricsCalculator.ts` - Added clinician-level functions:
- `getClinicianMetricsForPeriod(periodId)` - Get all clinician metrics for a time period
- `getClinicianMetricsForMonth(month, year)` - Get clinician metrics for specific month
- `calculateClinicianMetrics(startDate, endDate)` - Core calculation function

### `components/ClinicianOverview.tsx` - Updated to use real data:
- Imports `getClinicianMetricsForPeriod`, `getClinicianMetricsForMonth`, `getDataDateRange`
- Added `buildClinicianData()` function to convert calculated metrics to UI format
- Replaced hardcoded fake clinicians with real data from CSV

### `scripts/parsePaymentData.cjs` - Updated name format:
- Changed from "G. Kod" to "Gaya K" (FirstName LastInitial)

## Clinician Metrics Interface
```typescript
interface ClinicianMetricsCalculated {
  clinicianId: string;
  clinicianName: string;
  revenue: number;
  completedSessions: number;
  revenuePerSession: number;
  activeClients: number;
  newClients: number;
  clientsChurned: number;
  avgSessionsPerClient: number;
  churnRate: number;
}
```

## Time Period Selector
Simplified to 3 options (matching Dashboard pattern):
- **Last 12 Months** - Aggregated data for rolling 12 months
- **Live** - Current month data
- **Historical** - MonthPicker to select any past month

Notes tab is locked to "Current Month" only (point-in-time metric).

Time period persists across all tabs (except Notes).

## Metrics That CAN Be Calculated Per Clinician
| Metric | How |
|--------|-----|
| Revenue | Sum of `amount` for clinician's records |
| Sessions | Count of clinician's records |
| Active Clients | Unique `clientId` in clinician's records |
| New Clients | First appearance of client with this clinician |
| Churned Clients | Client had payment 60-120 days ago but not in last 60 days |
| Revenue Per Session | Revenue / Sessions |
| Avg Sessions Per Client | Sessions / Active Clients |
| Churn Rate | Churned / Active Clients × 100 |

## Metrics That CANNOT Be Calculated (use PRACTICE_SETTINGS)
| Metric | Why |
|--------|-----|
| Caseload Capacity | Not in payment data (default: 35) |
| Weekly Session Goal | Not in payment data (default: 25) |
| Attendance Rates | Need appointment data, not just payments |
| Rebook Rate | Need appointment data |
| Outstanding Notes | Need notes/documentation data |
| Retention Milestones | Need session sequence data |

## UI Formatting Rules
- **Revenue**: Show decimals for $K values (`$86.3K`)
- **Percentages**: Whole numbers only (`24%` not `24.0%`)
- **Averages**: Whole numbers (`4` not `4.2`)
- **Counts**: Whole numbers (`156` sessions)

## Key Implementation Details

### buildClinicianData() Function
Converts calculated metrics to UI format with derived values:
```typescript
function buildClinicianData(calculated: ClinicianMetricsCalculated[], periodId: string): ClinicianData[]
```

### View Mode State
```typescript
type ViewMode = 'last-12-months' | 'live' | 'historical';
const [viewMode, setViewMode] = useState<ViewMode>('live');
const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
const [selectedYear, setSelectedYear] = useState(now.getFullYear());
```

### Data Fetching Logic
```typescript
const CLINICIANS_DATA = useMemo(() => {
  if (viewMode === 'last-12-months') {
    return buildClinicianData(getClinicianMetricsForPeriod('last-12-months'), 'last-12-months');
  } else if (viewMode === 'live') {
    return buildClinicianData(getClinicianMetricsForMonth(now.getMonth(), now.getFullYear()), 'this-month');
  } else {
    return buildClinicianData(getClinicianMetricsForMonth(selectedMonth, selectedYear), 'this-month');
  }
}, [viewMode, selectedMonth, selectedYear]);
```

### Date Range Label
Shows human-readable date range below title:
- Last 12 Months: "Jan 2025 – Dec 2025"
- Live: "December 2025"
- Historical: "November 2025" (selected month)

## Overflow Fix for MonthPicker
The header container had `overflow-hidden` which clipped the MonthPicker dropdown. Fixed by moving decorative elements (grid pattern, glow) to a separate inner container with `overflow-hidden`, while the main container allows overflow.

---

# Practice Details Tab - TODO

Next tab to migrate. Currently uses hardcoded data in `PracticeAnalysis.tsx` and sub-components in `components/analysis/`.
