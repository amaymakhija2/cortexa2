# Cortexa Dashboard - Complete Chart & Metrics Reference

Cortexa Target Audience:
Psychotherapy practice owners and clinical directors who are very poor at reading charts and managing complex data. They need to understand their practice performance and take action to improve it, without it being too complex for them to understand. It is imperative that data is written in a simple and easy to understand manner, while retaining all the necessary information.

---

## OVERVIEW DASHBOARD (Practice Review)

### Page Header
- **Breadcrumb**: Practice / Overview
- **Title**: "{Month} {Year} Practice Review" (e.g., "November 2025 Practice Review")
- **Toggle**: Live | Historical (with month picker when Historical selected)

---

### Top Metrics Row (5 KPI Cards)

#### 1. Revenue
| Element | Content |
|---------|---------|
| **Label** | "Revenue" |
| **Value** | "$153.4k" |
| **Value Label** | (none) |
| **Subtext** | "Goal: $160k · $6.6k left to reach target" |
| **Status** | Needs attention (amber) |

#### 2. Sessions
| Element | Content |
|---------|---------|
| **Label** | "Sessions" |
| **Value** | "698" |
| **Value Label** | "completed" |
| **Subtext** | "82% utilization" |
| **Status** | Healthy (green) |

#### 3. Clients
| Element | Content |
|---------|---------|
| **Label** | "Clients" |
| **Value** | "156" |
| **Value Label** | "active" |
| **Subtext** | "17 new, 5 discharged · 18 openings" |
| **Status** | Healthy (green) |

#### 4. Attendance
| Element | Content |
|---------|---------|
| **Label** | "Attendance" |
| **Value** | "68%" |
| **Value Label** | "rebook rate" |
| **Subtext** | "10.9% non-billable cancel rate" |
| **Status** | Needs attention (amber) |

#### 5. Outstanding Notes
| Element | Content |
|---------|---------|
| **Label** | "Outstanding Notes" |
| **Value** | "12" |
| **Value Label** | "overdue notes" |
| **Subtext** | "3 clinicians with overdue notes" |
| **Status** | Critical (red) |

---

### Priority Tasks Section

**Section Title**: "Priority Tasks" with "{X} items" count

#### Card 1: Client Retention Alert
| Element | Content |
|---------|---------|
| **Title** | "Client Retention Alert" |
| **Status** | Critical (red) |
| **AI Guidance** | "Patel acquired 6 new clients from June–August 2024. Of those 6, only 2 remain by September—a 33% retention rate, significantly below your practice average of 80%. The drop-off pattern suggests early engagement issues that warrant investigation." |
| **Stats** | 6 new clients (white) · 4 lost (red) · 2 retained (emerald) |
| **Action Button** | "Explore Data" |

#### Card 2: Cancellation Spike
| Element | Content |
|---------|---------|
| **Title** | "Cancellation Spike" |
| **Status** | Warning (amber) |
| **AI Guidance** | "Kim had 2 cancellations per month in June-July, but this jumped to 8 in August and 9 in September. This represents a 4x increase compared to baseline. The practice average is 2-3 cancellations per clinician per month." |
| **Stats** | 9 this month (amber) · 2 baseline (white) · 4x increase (red) |
| **Action Button** | "Explore Data" |

#### Card 3: Accounts Receivable
| Element | Content |
|---------|---------|
| **Title** | "Accounts Receivable" |
| **Status** | Warning (amber) |
| **AI Guidance** | "You have $9,450 in outstanding receivables across 8 clients. Jennifer Martinez and Robert Thompson have the longest outstanding balances at 42 and 35 days respectively. Industry best practice is to follow up on invoices after 14 days." |
| **Stats** | $9.4k outstanding (amber) · 8 clients (white) · 42d oldest (red) |
| **Action Button** | "Explore Data" |

#### Card 4: Open Slots This Week
| Element | Content |
|---------|---------|
| **Title** | "Open Slots This Week" |
| **Status** | Good (green) |
| **AI Guidance** | "You have good capacity across the team to take on new clients. Chen and Rodriguez have the most availability. This is a great time to activate your waitlist or increase marketing spend. Evening slots typically fill fastest." |
| **Stats** | 34 open slots (emerald) · 5 clinicians (white) |
| **Action Button** | "Explore Data" |

---

## FINANCIAL TAB

### Hero Stats Row (4 Cards)

#### 1. Total Gross Revenue
| Element | Content |
|---------|---------|
| **Title** | "Total Gross Revenue" |
| **Value** | "${X.XX}M" (calculated from data) |
| **Subtext** | "across {X} months" |

#### 2. Total Net Revenue
| Element | Content |
|---------|---------|
| **Title** | "Total Net Revenue" |
| **Value** | "${XXX}k" (calculated from data) |
| **Subtext** | "{X.X}% avg margin" |

#### 3. Goal Achievement
| Element | Content |
|---------|---------|
| **Title** | "Goal Achievement" |
| **Value** | "{X}/{Y}" (months meeting goal / total months) |
| **Subtext** | "months hit $150k goal" |

#### 4. Avg Revenue
| Element | Content |
|---------|---------|
| **Title** | "Avg Revenue" |
| **Value** | "${XXX}k/mo" |
| **Subtext** | "${XX.X}k/week" |

---

### Revenue Performance Chart
| Element | Content |
|---------|---------|
| **Title** | "Revenue Performance" |
| **Subtitle** | "Monthly breakdown" |
| **Chart Type** | Vertical bar chart |
| **Y-Axis** | $0 - $160k (auto-scaled with buffer) |
| **X-Axis** | Month labels (Jan, Feb, Mar...) |
| **Goal Line** | Dashed amber line at $150k |
| **Goal Indicator Pill** | "$150k Goal" |
| **Bar Colors** | Green gradient (above goal), Blue gradient (below goal) |
| **Toggle Button** | "By Clinician" - switches to stacked bar view |
| **Legend Position** | Top-right (clinician view) |
| **Action Button** | "Revenue Report →" |
| **Insights Row** | Best Month: {Month} (${X}k) · MoM Trend: +X.X% · Range: $XXk – $XXXk |
| **Legend (clinician view)** | Chen (purple) · Rodriguez (cyan) · Patel (amber) · Kim (pink) · Johnson (emerald) |

---

### Revenue Distribution Chart
| Element | Content |
|---------|---------|
| **Title** | "Revenue Distribution" |
| **Subtitle** | "Total across all {X} months" |
| **Chart Type** | Donut chart |
| **Center Display** | "Gross Revenue" label + formatted value |
| **Segments** | |
| - Clinician Costs | Blue (#3b82f6) |
| - Supervisor Costs | Amber (#f59e0b) |
| - CC Fees | Rose (#f43f5e) |
| - Net Revenue | Emerald (#10b981) |
| **Value Format** | Currency |
| **Expandable** | Yes |

---

### Net Revenue Margin Chart
| Element | Content |
|---------|---------|
| **Title** | "Net Revenue Margin" |
| **Subtitle** | "Percentage of gross revenue retained" |
| **Chart Type** | Line chart with area fill |
| **Value Indicator** | Average margin % (emerald) |
| **Y-Axis** | 0 - 30% |
| **Line Color** | Emerald (#10b981) |
| **Height** | 280px |

---

### Cost as % of Revenue Chart
| Element | Content |
|---------|---------|
| **Title** | "Cost as % of Revenue" |
| **Subtitle** | "Clinician and supervisor costs" |
| **Chart Type** | Multi-line chart |
| **Value Indicator** | Total average % (stone) |
| **Y-Axis** | 0 - 80% |
| **Lines** | |
| - Clinician | Blue (#3b82f6) |
| - Supervisor | Amber (#f59e0b) |
| **Show Legend** | Yes |
| **Height** | 280px |

---

### Full Breakdown Table
| Element | Content |
|---------|---------|
| **Title** | "Full Breakdown" |
| **Columns** | Each month + Total column |
| **Rows** | |
| - Gross Revenue | No indicator |
| - Clinician Cost | Blue indicator (#3b82f6), blue text |
| - Supervisor Cost | Amber indicator (#f59e0b), amber text |
| - Credit Card Fees | Rose indicator (#f43f5e), rose text |
| - Net Revenue | Emerald indicator (#10b981), emerald text, highlighted row |

---

## SESSIONS TAB

### Hero Stats Row (4 Cards)

#### 1. Total Completed
| Element | Content |
|---------|---------|
| **Title** | "Total Completed" |
| **Value** | "{X,XXX}" (sum of completed sessions) |
| **Subtext** | "across {X} months" |

#### 2. Total Booked
| Element | Content |
|---------|---------|
| **Title** | "Total Booked" |
| **Value** | "{X,XXX}" (sum of booked sessions) |
| **Subtext** | "{XX.X}% show rate" |

#### 3. Goal Achievement
| Element | Content |
|---------|---------|
| **Title** | "Goal Achievement" |
| **Value** | "{X}/{Y}" (months meeting goal / total) |
| **Subtext** | "months hit 700 goal" |

#### 4. Avg Non-Billable Cancel Rate
| Element | Content |
|---------|---------|
| **Title** | "Avg Non-Billable Cancel Rate" |
| **Value** | "{X.X}%" |
| **Subtext** | "Client + Clinician Cancellations" |

---

### Completed Sessions Chart
| Element | Content |
|---------|---------|
| **Title** | "Completed Sessions" |
| **Subtitle** | "Monthly performance" |
| **Chart Type** | Vertical bar chart |
| **Y-Axis** | 0 - 900 (maxValue: 900) |
| **X-Axis** | Month labels |
| **Goal Line** | Dashed amber line at 700 |
| **Goal Indicator Pill** | "700 Goal" |
| **Bar Colors** | Green gradient (≥700), Blue gradient (<700) |
| **Toggle Button** | "By Clinician" - switches to stacked view |
| **Legend Position** | Top-right (clinician view) |
| **Action Button** | "Sessions Report →" |
| **Insights Row** | Best Month: {Month} ({X}) · MoM Trend: +X.X% · Range: XXX – XXX |
| **Legend (clinician view)** | Chen (purple) · Rodriguez (cyan) · Patel (amber) · Kim (pink) · Johnson (emerald) |
| **Height** | 380px |

---

### Attendance Breakdown Chart
| Element | Content |
|---------|---------|
| **Title** | "Attendance Breakdown" |
| **Subtitle** | "Session outcomes" |
| **Chart Type** | Donut chart |
| **Center Display** | "Show Rate" label + "{XX.X}%" value |
| **Segments** | |
| - Attended | Green (#10b981) |
| - Client Cancelled | Red (#ef4444) |
| - Clinician Cancelled | Blue (#3b82f6) |
| - Late Cancelled | Amber (#f59e0b) |
| - No Show | Gray (#6b7280) |
| **Value Format** | Number |
| **Expandable** | Yes |

---

### Secondary Metrics Row (3 Cards)

#### 1. Avg Sessions per Client per Month
| Element | Content |
|---------|---------|
| **Title** | "Avg Sessions per Client per Month" |
| **Value** | "{X.X}" (completed ÷ active clients) |
| **Subtext** | "sessions per active client per month" |

#### 2. Avg Sessions
| Element | Content |
|---------|---------|
| **Title** | "Avg Sessions" |
| **Value** | "{XXX}/mo" |
| **Subtext** | "{XX}/week" |

#### 3. Session Modality
| Element | Content |
|---------|---------|
| **Title** | "Session Modality" |
| **Chart Type** | Split horizontal bar (SplitBarCard) |
| **Left Segment** | Telehealth - Cyan (#0891b2 to #0e7490) |
| **Right Segment** | In-Person - Amber (#d97706 to #b45309) |
| **Expandable** | Yes |

---

### Monthly Breakdown Table
| Element | Content |
|---------|---------|
| **Title** | "Monthly Breakdown" |
| **Columns** | Each month + Total column |
| **Rows** | |
| - Booked | Cyan indicator (#06b6d4) |
| - Completed | Green indicator (#10b981), green text, highlighted row |
| - Client Cancelled | Rose indicator (#ef4444), rose text |
| - Clinician Cancelled | Blue indicator (#3b82f6), blue text |
| - Late Cancelled | Amber indicator (#f59e0b), amber text |
| - No Show | Gray indicator (#6b7280), stone text |

---

## CAPACITY & CLIENT TAB

### Hero Stats Row (4 Cards)

#### 1. Active Clients
| Element | Content |
|---------|---------|
| **Title** | "Active Clients" |
| **Value** | "{XXX}" (current active clients count) |
| **Subtext** | "of {XXX} capacity" |

#### 2. Net Growth
| Element | Content |
|---------|---------|
| **Title** | "Net Growth" |
| **Value** | "+{X}" or "-{X}" (new - churned) |
| **Subtext** | "+{X} new, -{X} churned" |

#### 3. Client Utilization
| Element | Content |
|---------|---------|
| **Title** | "Client Utilization" |
| **Value** | "{XX}%" (active/capacity) |
| **Subtext** | "of client capacity filled" |

#### 4. Session Utilization
| Element | Content |
|---------|---------|
| **Title** | "Session Utilization" |
| **Value** | "{XX}%" (average) |
| **Subtext** | "avg across {X} months" |

---

### Client Utilization Chart (Main Left)
| Element | Content |
|---------|---------|
| **Title** | "Client Utilization" |
| **Subtitle** | "Active clients & utilization rate over time" |
| **Chart Type** | Combo chart (Bar + Line) |
| **Legend** | Active Clients (amber bar) · Utilization % (emerald line) |
| **Bar** | Amber gradient - Active Clients (left Y-axis, 0-200) |
| **Line** | Emerald (#059669) - Utilization Rate % (right Y-axis, 0-100%) |
| **Bar Labels** | Inside top of bars, white text |
| **Action Button** | "View Report →" |
| **Insights Row** | Avg Clients: {X} · Avg Utilization: {X}% · Peak: {Month} ({X}%) |
| **Expandable** | Yes |
| **Height** | 350px |

---

### Client Movement Chart (Main Right)
| Element | Content |
|---------|---------|
| **Title** | "Client Movement" |
| **Subtitle** | "New acquisitions vs churned clients" |
| **Chart Type** | Diverging bar chart |
| **Legend** | New Clients (emerald) · Churned (rose) |
| **Positive Bars** | Green gradient (#34d399 → #10b981) - New clients (above center) |
| **Negative Bars** | Rose gradient (#fb7185 → #f43f5e) - Churned clients (below center) |
| **Action Button** | "View Report →" |
| **Insights Row** | Net Change: +/-{X} · Avg New/mo: +{X.X} · Avg Churn/mo: -{X.X} |
| **Expandable** | Yes |
| **Height** | 350px |

---

### Client Demographics Row (2 Cards)

#### 1. Client Gender
| Element | Content |
|---------|---------|
| **Title** | "Client Gender" |
| **Chart Type** | Stacked horizontal bar (StackedBarCard) |
| **Segments** | |
| - Male | Blue (#3b82f6) |
| - Female | Pink (#ec4899) |
| - Other | Violet (#8b5cf6) |

#### 2. Client Session Frequency
| Element | Content |
|---------|---------|
| **Title** | "Client Session Frequency" |
| **Chart Type** | Stacked horizontal bar (StackedBarCard) |
| **Segments** | |
| - Weekly | Emerald (#10b981) |
| - Bi-weekly | Amber (#f59e0b) |
| - Monthly | Stone (#a8a29e) |

---

### Utilization & Slots Row (2 Charts)

#### 1. Session Utilization
| Element | Content |
|---------|---------|
| **Title** | "Session Utilization" |
| **Subtitle** | "Percentage of session capacity utilized" |
| **Chart Type** | Line chart with area fill |
| **Value Indicator** | Average % (blue) |
| **Y-Axis** | 70 - 100% |
| **Line Color** | Blue (#3b82f6) |
| **Expandable** | Yes |
| **Height** | 320px |

#### 2. Open Slots
| Element | Content |
|---------|---------|
| **Title** | "Open Slots" |
| **Subtitle** | "Unfilled appointment slots per month" |
| **Chart Type** | Line chart with area fill |
| **Value Indicator** | Average count (rose) |
| **Line Color** | Rose (#f43f5e) |
| **Expandable** | Yes |
| **Height** | 320px |

---

## RETENTION TAB

### Hero Stats Row (4 Cards)

#### 1. Avg Client Tenure
| Element | Content |
|---------|---------|
| **Title** | "Avg Client Tenure" |
| **Value** | "{X.X} months" |
| **Subtext** | "across {X} discharged clients" |

#### 2. Avg Sessions per Client
| Element | Content |
|---------|---------|
| **Title** | "Avg Sessions per Client" |
| **Value** | "{X.X}" |
| **Subtext** | "before discharge" |

#### 3. Session 5 Retention
| Element | Content |
|---------|---------|
| **Title** | "Session 5 Retention" |
| **Value** | "{XX}%" |
| **Subtext** | "of new clients reach session 5" |

#### 4. 3-Month Retention
| Element | Content |
|---------|---------|
| **Title** | "3-Month Retention" |
| **Value** | "{XX}%" |
| **Subtext** | "of new clients stay 3+ months" |

---

### Main Charts Row (2 Charts)

#### Clients Churned Chart (Left)
| Element | Content |
|---------|---------|
| **Title** | "Clients Churned" |
| **Subtitle** | "Monthly churn breakdown" |
| **Chart Type** | Vertical bar chart |
| **Y-Axis** | 0 - 15 (maxValue: 15) |
| **X-Axis** | Month labels |
| **Bar Colors (single mode)** | Rose gradient (#fb7185 → #e11d48) |
| **Toggle Button** | "By Clinician" - switches to stacked view |
| **Legend Position** | Top-right (clinician view) |
| **Clinician Colors (stacked)** | Chen (cyan #0891b2) · Rodriguez (teal #0d9488) · Patel (sky #0284c7) · Kim (violet #7c3aed) · Johnson (pink #db2777) |
| **Action Button** | "Retention Report →" |
| **Insights Row** | Total Churned: {X} · Avg/month: {X.X} · Peak: {Month} ({X}) |
| **Expandable** | Yes |
| **Height** | 380px |

---

#### Churn Timing Chart (Right)
| Element | Content |
|---------|---------|
| **Title** | "Churn Timing" |
| **Subtitle** | "When clients leave by session count" |
| **Chart Type** | Donut chart |
| **Center Display** | "Total Churned" label + count value |
| **Segments** | |
| - Early (<5 sessions) | Red (#ef4444) |
| - Medium (5-15) | Amber (#f59e0b) |
| - Late (>15) | Green (#10b981) |
| **Value Format** | Number |
| **Expandable** | Yes |

---

### Rebook Rate Chart
| Element | Content |
|---------|---------|
| **Title** | "Rebook Rate" |
| **Subtitle** | "% of clients with next appointment scheduled" |
| **Chart Type** | Line chart with area fill |
| **Value Indicator** | Average % (emerald) |
| **Y-Axis** | 80 - 100% |
| **Line Color** | Emerald (#10b981) |
| **Expandable** | Yes |
| **Height** | 320px |

---

### Hero Stats Row — Metric Options (Choose 4)

**Selected metrics: A, B, C, D**

| Option | Metric | Value Example | Subtext | Notes |
|--------|--------|---------------|---------|-------|
| A ✓ | Avg Client Tenure | "7.4 months" | "across discharged clients" | Anchor metric for "how long do clients stay?" |
| B ✓ | Avg Sessions per Client | "14.3" | "before discharge" | Pairs with tenure to show engagement intensity |
| C ✓ | Session 5 Retention | "76%" | "of new clients reach session 5" | Early stickiness signal, most predictive |
| D ✓ | 3-Month Retention | "62%" | "of new clients stay 3+ months" | Durability signal, actionable timeframe |
| E | Median Tenure | "5.2 months" | "half of clients stay longer" | Alternative to avg if outliers skew data |
| F | Early Dropout Rate | "24%" | "leave before session 5" | Inverse of C, frames as problem to solve |
| G | 6-Month Retention | "41%" | "of new clients stay 6+ months" | Alternative to D for long-term focused practices |

---

### Retention Funnel Cards (2 Cards in Grid)

Two separate funnel cards side-by-side showing client retention journeys.

**Color Philosophy**: Single solid color per funnel type for clarity and visual impact. Values displayed outside the bars for maximum readability.

---

#### Retention by Sessions Card (Left)
| Element | Content |
|---------|---------|
| **Icon** | Users (amber-700) in amber-50 badge |
| **Title** | "Retention by Sessions" |
| **Subtitle** | "Client milestones reached" |
| **Expandable** | Yes |
| **Bar Color** | Solid Amber-600 (#d97706) |
| **Bar Height** | h-12 (md), h-14 (lg) |

**Stages**:
| Stage | Example Values |
|-------|----------------|
| Started | 100 clients · 100% |
| Session 5 | 76 clients · 76% |
| Session 12 | 52 clients · 52% |
| Session 24 | 31 clients · 31% |

**Bar Structure**:
- Label inside bar (white text with DM Serif Display font)
- Client count and percentage displayed outside bar to the right
- Percentage shown in amber-50 pill with amber-700 text

**Insights Row** (3 values at bottom):
| Value | Label | Style |
|-------|-------|-------|
| {count} | "Started" | bg-amber-50, text-amber-700 |
| "{X}%" | "Final Retention" | bg-amber-50, text-amber-700 |
| "{X}%" | "Drop-off" | bg-stone-100, text-stone-700 |

---

#### Retention by Time Card (Right)
| Element | Content |
|---------|---------|
| **Icon** | Clock (indigo-700) in indigo-50 badge |
| **Title** | "Retention by Time" |
| **Subtitle** | "Duration with practice" |
| **Expandable** | Yes |
| **Bar Color** | Solid Indigo-600 (#4f46e5) |
| **Bar Height** | h-12 (md), h-14 (lg) |

**Stages**:
| Stage | Example Values |
|-------|----------------|
| Started | 100 clients · 100% |
| 1 Month | 82 clients · 82% |
| 3 Months | 62 clients · 62% |
| 6 Months | 41 clients · 41% |

**Bar Structure**:
- Label inside bar (white text with DM Serif Display font)
- Client count and percentage displayed outside bar to the right
- Percentage shown in indigo-50 pill with indigo-700 text

**Insights Row** (3 values at bottom):
| Value | Label | Style |
|-------|-------|-------|
| {count} | "Started" | bg-indigo-50, text-indigo-700 |
| "{X}%" | "Final Retention" | bg-indigo-50, text-indigo-700 |
| "{X}%" | "Drop-off" | bg-stone-100, text-stone-700 |

---

**Shared Features**:
- Staggered entrance animation (100ms delay per stage)
- Hover: translateX(4px) + enhanced glow shadow
- Bar width scales with percentage (min 25%)
- Subtle dot pattern background matching accent color
- Top highlight gradient inside bar for depth

**Component**: `RetentionFunnelCard` from design system

Scope: Data calculated from cohort within tab time selector period

---

## INSURANCE TAB

### Health Tiles (2 Cards)

#### 1. Outstanding Insurance
| Element | Content |
|---------|---------|
| **Category Label** | "OUTSTANDING INSURANCE" |
| **Value** | "${XX.X}K" |
| **Subtext** | "Unpaid by insurance payers" |

#### 2. Needs Attention
| Element | Content |
|---------|---------|
| **Category Label** | "NEEDS ATTENTION" |
| **Value** | "{XX}" (rejected + denied count) |
| **Subtext** | "Rejected ({X}) + Denied ({X}) claims" |

---

### Claims Status Section
| Element | Content |
|---------|---------|
| **Category Label** | "CLAIMS STATUS" |
| **Title** | "Last 30 Days Claims Activity" |

**Claims Breakdown (4 Tiles)**:
| Tile | Color | Content |
|------|-------|---------|
| Paid | Green | Count + "Paid claims" |
| Rejected | Red | Count + "Rejected" |
| Denied | Orange | Count + "Denied" |
| Deductible | Blue | Count + "Deductible" |

**Claims Trend Chart**:
| Element | Content |
|---------|---------|
| **Subtitle** | "Claims Trend" |
| **Chart Type** | Multi-line chart |
| **Lines** | Paid (green), Rejected (red), Denied (orange) |

---

### Outstanding Claims by Aging Section
| Element | Content |
|---------|---------|
| **Category Label** | "OUTSTANDING CLAIMS" |
| **Title** | "Claims Aging Analysis" |

**Aging Bar Chart**:
| Element | Content |
|---------|---------|
| **Subtitle** | "Outstanding by Age" |
| **Chart Type** | Horizontal bar chart |
| **Bar Colors** | Unbilled (green), 30 days (yellow), 60 days (orange), 90+ days (red) |

**Aging Breakdown List**:
| Category | Description | Color |
|----------|-------------|-------|
| Unbilled | "Not yet billed to insurance" | Green |
| 30 Days | "Claims due in 30 days" | Yellow |
| 60 Days | "Claims due in 60 days" | Orange |
| 90+ Days | "Claims overdue 90+ days" | Red |

---

## ADMIN TAB

### Health Tiles (3 Cards)

#### 1. Billing
| Element | Content |
|---------|---------|
| **Category Label** | "BILLING" |
| **Value** | "${XX.X}K" |
| **Subtext** | "Clients still owe after invoices" |

#### 2. Compliance
| Element | Content |
|---------|---------|
| **Category Label** | "COMPLIANCE" |
| **Value** | Notes status indicator |
| **Subtext** | Status description |

#### 3. Reminders
| Element | Content |
|---------|---------|
| **Category Label** | "REMINDERS" |
| **Value** | Success rate or count |
| **Subtext** | Delivery status |

---

### Client Balance Aging
- **Chart Type**: Stacked bar or area chart
- **Categories**: Current, 1-30 days, 31-60 days, 61+ days

### Notes Status
- **Chart Type**: Stacked bar chart
- **Categories**: No Note, Unlocked, Locked

---

## TEAM COMPARISON TAB

### Comparison Tables (3 Views)

**Sortable Columns**:
- Location/Supervisor/Clinician name
- Avg Weekly Sessions
- Completed Sessions
- Utilization %
- Clients Seen
- Cancel Rate
- Churn Rate
- Retention Rate
- Outstanding Notes

**Location Data**: Durham, Chapel Hill, Remote, Chicago
**Supervisor Data**: Barbara Downs, Eugene Miller
**Clinician Data**: All 5 clinicians with expandable detail view

---

## COLOR PALETTE REFERENCE

### Status Colors
| Status | Color | Hex |
|--------|-------|-----|
| Healthy/Good | Emerald | #10b981, #059669 |
| Warning/Attention | Amber | #f59e0b, #d97706 |
| Critical/Bad | Rose/Red | #ef4444, #dc2626 |

### Clinician Colors (Financial/Sessions)
| Clinician | Color | Hex |
|-----------|-------|-----|
| Chen | Purple | #7c3aed |
| Rodriguez | Cyan | #0891b2 |
| Patel | Amber | #d97706 |
| Kim | Pink | #db2777 |
| Johnson | Emerald | #059669 |

### Clinician Colors (Retention - Teal Shades)
| Clinician | Color | Hex |
|-----------|-------|-----|
| Chen | Cyan | #0891b2 |
| Rodriguez | Teal | #0d9488 |
| Patel | Sky | #0284c7 |
| Kim | Violet | #7c3aed |
| Johnson | Pink | #db2777 |

### Brand/UI Colors
| Usage | Color | Hex |
|-------|-------|-----|
| Primary Accent | Teal | #2d6e7e |
| Background | Stone gradient | #fafaf9, #f5f5f4 |
| Text Primary | Stone-900 | #1c1917 |
| Text Secondary | Stone-700 | #44403c |
| Text Muted | Stone-500 | #78716c |
| Text Light | Stone-400 | #a8a29e |

### Chart-Specific Colors
| Usage | Color | Hex |
|-------|-------|-----|
| Goal Lines | Amber dashed | #f59e0b |
| Above Goal | Emerald gradient | #34d399 → #059669 |
| Below Goal | Blue gradient | #60a5fa → #2563eb |
| Telehealth | Cyan | #0891b2 |
| In-Person | Amber | #d97706 |

### Typography
| Usage | Font |
|-------|------|
| Headings | DM Serif Display, Georgia, serif |
| Body | System UI, sans-serif |
