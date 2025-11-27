# Cortexa Dashboard - Complete Chart & Metrics Reference

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
| **Y-Axis** | $0 - $160k (in $40k increments) |
| **X-Axis** | Month labels (Jan, Feb, Mar...) |
| **Goal Line** | Dashed amber line at $150k |
| **Goal Indicator Pill** | "$150k Goal" |
| **Bar Colors** | Green gradient (above goal), Blue gradient (below goal) |
| **Toggle Button** | "By Clinician" - switches to stacked bar view |
| **Action Button** | "Revenue Report →" |
| **Insights Row** | Best Month: {Month} (${X}k) · MoM Trend: +X.X% · Range: $XXk – $XXXk |
| **Legend (clinician view)** | Chen (purple) · Rodriguez (cyan) · Patel (amber) · Kim (pink) · Johnson (emerald) |

---

### Cost Breakdown Chart
| Element | Content |
|---------|---------|
| **Title** | "Cost Breakdown" |
| **Subtitle** | "Monthly expense allocation" |
| **Chart Type** | Stacked bar/area chart |
| **Categories** | Gross Revenue, Clinician Costs (~70%), Supervisor Costs (~10%), Credit Card Fees (~3%), Net Revenue |
| **Action Button** | "Full Report →" |

---

### Team Performance Section
| Element | Content |
|---------|---------|
| **Title** | "Team Performance" |
| **Subtitle** | "Revenue by clinician" |
| **Display** | 5 ranked cards (1-5) |
| **Card Content** | Clinician name, Total revenue, % of total, Progress bar |
| **Badge** | "Top" badge on #1 performer |

---

### Full Breakdown Table
| Element | Content |
|---------|---------|
| **Title** | "Full Breakdown" |
| **Columns** | Each month + Total column |
| **Rows** | Gross Revenue, Clinician Cost, Supervisor Cost, Credit Card Fees, Net Revenue |

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
| **Subtext** | "Client Cancellations + Clinician Cancellations" |

---

### Completed Sessions Chart
| Element | Content |
|---------|---------|
| **Title** | "Completed Sessions" |
| **Subtitle** | "Monthly performance" |
| **Chart Type** | Vertical bar chart |
| **Y-Axis** | 0 - 800 (in 200 increments) |
| **X-Axis** | Month labels |
| **Goal Line** | Dashed amber line at 700 |
| **Goal Indicator Pill** | "700 Goal" |
| **Bar Colors** | Green gradient (≥700), Blue gradient (<700) |
| **Toggle Button** | "By Clinician" - switches to stacked view |
| **Action Button** | "Sessions Report →" |
| **Insights Row** | Best Month: {Month} ({X}) · MoM Trend: +X.X% · Range: XXX – XXX |
| **Legend (clinician view)** | Chen (purple) · Rodriguez (cyan) · Patel (amber) · Kim (pink) · Johnson (emerald) |

---

### Attendance Breakdown Chart
| Element | Content |
|---------|---------|
| **Title** | "Attendance Breakdown" |
| **Subtitle** | "Session outcomes" |
| **Chart Type** | Donut chart (SVG arc paths) |
| **Center Display** | "Show Rate" label + "{XX.X}%" value |
| **Segments** | |
| - Attended | Green (#10b981) |
| - Client Cancelled | Red (#ef4444) |
| - Clinician Cancelled | Blue (#3b82f6) |
| - Late Cancelled | Amber (#f59e0b) |
| - No Show | Gray (#6b7280) |
| **Legend** | Each segment with color dot, label, count, and percentage |

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
| **Chart Type** | Split horizontal bar |
| **Left Segment** | Telehealth - Cyan (#0891b2) with video icon + percentage |
| **Right Segment** | In-Person - Amber (#d97706) with building icon + percentage |
| **Labels Below** | "Telehealth ({X,XXX})" and "In-Person ({X,XXX})" with color dots |

---

### Monthly Breakdown Table
| Element | Content |
|---------|---------|
| **Title** | "Monthly Breakdown" |
| **Columns** | Each month + Total column |
| **Rows** | |
| - Booked | Cyan dot |
| - Completed | Green dot, green text |
| - Cancelled | Rose dot, rose text |
| - Clinician Cancelled | Blue dot, blue text |
| - Late Cancelled | Amber dot, amber text |
| - No Show | Gray dot |

---

## CAPACITY & CLIENT TAB

### Client Capacity Chart (Main Left)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Client Capacity" |
| **Info Tooltip Title** | "Client Capacity Tracking" |
| **Info Tooltip Text** | "Compare your active client count versus your practice capacity. The percentage above shows how much of your capacity is being utilized. Higher utilization means you're closer to your practice limits." |
| **Chart Type** | Grouped bar chart |
| **Legend** | Client Capacity (gray) · Active Clients (teal) |
| **Bar 1** | Gray - Capacity |
| **Bar 2** | Teal (#2d6e7e) - Active Clients |
| **Pills Above Bars** | Utilization % (green <70%, amber 70-85%, red >85%) |

---

### Hours Utilization Chart (Top Right Small)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Hours Utilization" |
| **Info Tooltip Title** | "Practice Hours Utilization" |
| **Info Tooltip Text** | "Shows the percentage of billable hours utilized across the practice over time (based on 800 hrs/month = 5 clinicians × 160 hrs). Higher percentage indicates better capacity usage." |
| **Header Value** | "{XX.X}%" (avg or hovered value) |
| **Chart Type** | Line chart with area fill |
| **Line Color** | Teal (#2d6e7e) |
| **Data Labels** | Percentage on each point |

---

### Unfilled Client Slots Chart (Top Right Small)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Unfilled Client Slots" |
| **Info Tooltip Title** | "Unfilled Client Slots" |
| **Info Tooltip Text** | "Shows how many more clients clinicians can take on based on their capacity goals. If a clinician's goal is 25 clients and they have 20, they have 5 unfilled slots. Higher numbers indicate more room for growth." |
| **Header Value** | "{XX}" (avg or hovered value) |
| **Chart Type** | Line chart with area fill |
| **Line Color** | Teal (#2d6e7e) |

---

### Client Movement Chart (Bottom Right)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Client Movement" |
| **Info Tooltip Title** | "Client Movement Analysis" |
| **Info Tooltip Text** | "Visualizes the flow of clients in and out of your practice. New clients appear as positive bars (green) above the center line, while churned clients appear as negative bars (red) below. This helps you understand client retention and growth patterns." |
| **Chart Type** | Diverging bar chart |
| **Legend** | New Clients (green) · Churned Clients (red) |
| **Positive Bars** | Green - New clients (above center) |
| **Negative Bars** | Red - Churned clients (below center) |

---

## RETENTION TAB

### Churn Analysis by Clinician Chart (Main Left)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Churn Analysis by Clinician" |
| **Info Tooltip Title** | "Client Churn by Clinician" |
| **Info Tooltip Text** | "Shows the breakdown of churned clients each month by clinician. Stacked bars reveal which clinicians are experiencing client loss and help identify retention issues that may require intervention." |
| **Chart Type** | Stacked bar chart |
| **Legend** | Chen · Rodriguez · Patel · Kim · Johnson (teal gradient shades) |
| **Labels Above Bars** | Total churn count |

---

### Churn Timing Chart (Top Right Small)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Churn Timing" |
| **Info Tooltip Title** | "Client Churn Timing" |
| **Info Tooltip Text** | "Early (0-3mo), Medium (4-8mo), Late (9+mo)" |
| **Chart Type** | Donut/Pie chart |
| **Center Display** | Total churned count + "Total" label |
| **Segments** | |
| - Early (0-3mo) | Red (#ef4444) |
| - Medium (4-8mo) | Amber (#f59e0b) |
| - Late (9+mo) | Green (#10b981) |
| **Labels** | Segment name + percentage |

---

### Rebook Rate Chart (Top Right Small)
| Element | Content |
|---------|---------|
| **Category Label** | "ANALYTICS" |
| **Title** | "Rebook Rate" |
| **Info Tooltip Title** | "Rebook Rate" |
| **Info Tooltip Text** | "Of the active clients, this is the percentage that have their next appointment scheduled" |
| **Header Value** | "{XX.X}%" (average) |
| **Chart Type** | Line chart with area fill |
| **Line Color** | Green (#10b981) |
| **Data Labels** | Percentage on each point |

---

### Average Churn Point by Segment (Bottom Right)
| Element | Content |
|---------|---------|
| **Category Label** | "CHURN ANALYSIS" |
| **Title** | "Average Churn Point by Segment" |
| **Info Tooltip Title** | "Where Clients Drop Off" |
| **Info Tooltip Text** | "Shows the average session count at which clients churn within each segment: Early (<5 sessions), Mid (5-25 sessions), and Late (>25 sessions). Helps identify critical intervention points." |
| **Legend** | Early Churn (<5 sessions) red · Mid Churn (5-25 sessions) amber · Late Churn (>25 sessions) green |
| **Display** | Visual bars showing avg session count per segment |

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

### Clinician Colors
| Clinician | Color | Hex |
|-----------|-------|-----|
| Chen | Purple | #7c3aed |
| Rodriguez | Cyan | #0891b2 |
| Patel | Amber | #d97706 |
| Kim | Pink | #db2777 |
| Johnson | Emerald | #059669 |

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
