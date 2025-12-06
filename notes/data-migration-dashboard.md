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
