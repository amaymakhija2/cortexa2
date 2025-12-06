# Cortexa Dashboard - Complete Chart & Metrics Reference

Cortexa Target Audience:
Psychotherapy practice owners and clinical directors who are very poor at reading charts and managing complex data. They need to understand their practice performance and take action to improve it, without it being too complex for them to understand. It is imperative that data is written in a simple and easy to understand manner, while retaining all the necessary information.

---

## OVERVIEW DASHBOARD (Practice Review)

### Page Header
- **Label**: "Practice Overview" (amber, uppercase)
- **Title**: "{Month} {Year}" (e.g., "November 2025")
- **Toggle**: Live | Historical (with month picker when Historical selected)

---

### Practice Goals (Used for Status Calculations)

| Metric | Goal | Status Thresholds |
|--------|------|-------------------|
| **Revenue** | $100k/month | ≥95% = Healthy, ≥80% = Needs attention, <80% = Critical |
| **Sessions** | 475/month | ≥95% = Healthy, ≥80% = Needs attention, <80% = Critical |
| **Rebook Rate** | 85% | ≥85% = Healthy, ≥80% = Needs attention, <80% = Critical |
| **Notes Overdue** | <10% | ≤10% = Healthy, ≤15% = Needs attention, >15% = Critical |

*Note: For current month, goals are pro-rated based on days elapsed.*

---

### Key Metrics Row (5 KPI Cards)

**Section Title**: "Key Metrics" (uses SectionHeader component with amber accent)

#### 1. Revenue
| Element | Content |
|---------|---------|
| **Label** | "Revenue" |
| **Value** | Formatted value (e.g., "$85.2k") |
| **Value Label** | (empty) |
| **Subtext** | "Goal: $100k · $X.Xk left to reach target" or "Goal: $100k · Target achieved!" |
| **Status** | Based on % of pro-rated goal |

#### 2. Sessions
| Element | Content |
|---------|---------|
| **Label** | "Sessions" |
| **Value** | Number completed (e.g., "432") |
| **Value Label** | "completed" |
| **Subtext** | "Goal: 475 · XX% of monthly goal" |
| **Status** | Based on % of pro-rated goal |

#### 3. Clients
| Element | Content |
|---------|---------|
| **Label** | "Clients" |
| **Value** | Active count (e.g., "156") |
| **Value Label** | "active" |
| **Subtext** | "X new, X churned · X openings" |
| **Status** | Healthy if net growth ≥0, Needs attention if ≥-3, Critical if <-3 |

#### 4. Attendance
| Element | Content |
|---------|---------|
| **Label** | "Attendance" |
| **Value** | Rebook rate percentage (e.g., "82%") |
| **Value Label** | "rebook rate" |
| **Subtext** | "X% client cancel rate" |
| **Status** | Based on rebook rate vs 85% goal |

#### 5. Outstanding Notes
| Element | Content |
|---------|---------|
| **Label** | "Outstanding Notes" |
| **Value** | Percentage overdue (e.g., "8%") |
| **Value Label** | "overdue" |
| **Subtext** | "Goal: <10% · X% currently overdue" |
| **Status** | Based on % overdue vs 10% goal |

---

### Priority Tasks Section

**Section Title**: Uses SectionHeader component with:
- `question`: "Priority Tasks"
- `description`: "{X} items"
- `accent`: amber
- `showAccentLine`: false
- `actions`: Navigation dots and prev/next buttons (when cards overflow)

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

### Executive Summary

| Element | Content |
|---------|---------|
| **Component** | `ExecutiveSummary` |
| **Accent** | amber |
| **Headline** | "Strong Revenue, Watch Your Margins" |
| **Summary** | Dynamic text including MoM change, months meeting goal, net margin %, and clinician compensation insights |
| **Style** | Editorial typography with DM Serif Display, collapsible design |

---

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
| **Subtext** | "months hit $100k goal" |

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
| **Y-Axis** | $0 - $120k (auto-scaled with buffer) |
| **X-Axis** | Month labels (Jan, Feb, Mar...) |
| **Goal Line** | Dashed amber line at $100k |
| **Goal Indicator Pill** | "$100k Goal" |
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

### Client Lifetime Value Chart
| Element | Content |
|---------|---------|
| **Title** | "Client Lifetime Value" |
| **Subtitle** | "Average revenue per client by months since first session" |
| **Chart Type** | Multi-line chart |
| **Metrics Row** | Current year LTV (emerald, primary) · Prior year LTV (blue) |
| **X-Axis** | M0, M1, M2... M12 (months since cohort start) |
| **Y-Axis** | $0 - auto-scaled |
| **Lines** | |
| - Current Year (e.g., 2025) | Emerald (#10b981) |
| - Prior Year (e.g., 2024) | Blue (#3b82f6) |
| **Show Legend** | Yes |
| **Date Picker** | Disconnected - always shows current year vs prior year |
| **Purpose** | Compare client quality year-over-year. If lines track closely, client unit economics are healthy regardless of volume changes. |

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

### Executive Summary

| Element | Content |
|---------|---------|
| **Component** | `ExecutiveSummary` |
| **Accent** | indigo |
| **Headline** | "Sessions Strong, Monitor Cancellations" |
| **Summary** | Dynamic text including show rate performance, goal achievement, and non-billable cancellation insights |
| **Style** | Editorial typography with DM Serif Display, collapsible design |

---

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
| **Subtext** | "months hit 475 goal" |

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
| **Y-Axis** | 0 - 600 (maxValue: auto-scaled) |
| **X-Axis** | Month labels |
| **Goal Line** | Dashed amber line at 475 |
| **Goal Indicator Pill** | "475 Goal" |
| **Bar Colors** | Green gradient (≥475), Blue gradient (<475) |
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

### Executive Summary

| Element | Content |
|---------|---------|
| **Component** | `ExecutiveSummary` |
| **Accent** | cyan |
| **Headline** | "Healthy Growth, Room to Expand" |
| **Summary** | Dynamic text including caseload capacity, net growth trends, and capacity insights |
| **Style** | Editorial typography with DM Serif Display, collapsible design |

---

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

#### 3. Caseload Capacity
| Element | Content |
|---------|---------|
| **Title** | "Caseload Capacity" |
| **Value** | "{XX}%" (active/capacity) |
| **Subtext** | "of client capacity filled" |

#### 4. Session Goal %
| Element | Content |
|---------|---------|
| **Title** | "Session Goal %" |
| **Value** | "{XX}%" (average) |
| **Subtext** | "avg across {X} months" |

---

### Caseload Capacity Chart (Main Left)
| Element | Content |
|---------|---------|
| **Title** | "Caseload Capacity" |
| **Subtitle** | "Active clients & capacity rate over time" |
| **Chart Type** | Combo chart (Bar + Line) |
| **Legend** | Active Clients (amber bar) · Capacity % (emerald line) |
| **Bar** | Amber gradient - Active Clients (left Y-axis, 0-200) |
| **Line** | Emerald (#059669) - Capacity Rate % (right Y-axis, 0-100%) |
| **Bar Labels** | Inside top of bars, white text |
| **Action Button** | "View Report →" |
| **Insights Row** | Avg Clients: {X} · Avg Capacity: {X}% · Peak: {Month} ({X}%) |
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

### Goal Progress & Slots Row (2 Charts)

#### 1. Session Goal %
| Element | Content |
|---------|---------|
| **Title** | "Session Goal %" |
| **Subtitle** | "Percentage of session goal achieved" |
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

The Retention tab is organized into **two main sections** for clarity:

1. **Track Current Retention** - Real-time actionable items (always visible)
2. **Cohort Analysis** - Historical cohort exploration (requires cohort selection)

### UX Flow

1. **Section 1 (Always Visible)**: Track Current Retention shows real-time metrics
2. **Section 2 (Cohort Selection)**: User selects a cohort to explore historical patterns
3. **Cohort Data Display**: Hero stats with benchmarks and analysis sections appear

### Section Order (After Cohort Selection)
1. **Churn Patterns** → "When do clients leave?" (see the problem first)
2. **Retention Journey** → "How far do they get?" (understand the mechanics)
3. **What Type of Clients** → "What type of clients do we lose?" (identify patterns)

---

### Section 1: Track Current Retention (Rose)

| Element | Content |
|---------|---------|
| **Section Header** | Question: "Track Current Retention" |
| **Description** | "Real-time indicators and clients who need attention today" |
| **Number** | 1 |
| **Accent** | Rose |
| **Component** | `SectionContainer` + `SectionHeader` |

#### Layout
2-column grid with consistent card sizing.

#### 1.1 Rebook Rate Chart (Left)
| Element | Content |
|---------|---------|
| **Component** | `ChartCard` |
| **Title** | "Rebook Rate" |
| **Subtitle** | "% of clients with next appointment scheduled" |
| **Chart Type** | Line chart with area fill |
| **Y-Axis** | 70 - 100% |
| **Line Color** | Emerald (#10b981) |
| **Insights Row** | Average % (emerald) · Industry Avg 85% (stone) |
| **Expandable** | Yes |
| **Min Height** | 520px |

#### 1.2 At-Risk Clients Card (Right)
| Element | Content |
|---------|---------|
| **Component** | `AtRiskClientsCard` |
| **Title** | "At-Risk Clients" |
| **Description** | Clients without upcoming appointments |
| **Risk Levels** | High (21+ days), Medium (14-21 days), Low (7-14 days) |
| **List Display** | Client name, days since last session, clinician |
| **Max Preview** | 6 clients |
| **Action** | "View All" link to full list |

---

### Section 2: Cohort Analysis (Indigo)

| Element | Content |
|---------|---------|
| **Section Header** | Question: "Cohort Analysis" |
| **Description** | "Select a cohort to explore retention patterns and churn drivers" |
| **Number** | 2 |
| **Accent** | Indigo |
| **Component** | `SectionContainer` + `SectionHeader` |

---

### Cohort Selector

The cohort selector has two visual states with luxury-level typography matching the design system.

#### Expanded State (Initial / Editing)

**Container**:
| Element | Content |
|---------|---------|
| **Background** | Stone gradient (#fafaf9 → #f5f5f4) with dot pattern overlay |
| **Accents** | Dual amber gradient glows (top-right, bottom-left) |
| **Padding** | p-8 sm:p-10 xl:p-14 |
| **Corner Radius** | rounded-2xl xl:rounded-3xl |

**Header**:
| Element | Typography |
|---------|------------|
| **Title** | text-3xl sm:text-4xl xl:text-5xl, DM Serif Display |
| **Subtitle** | text-lg xl:text-xl, stone-500, leading-relaxed |
| **Collapse Button** | Appears when cohort already selected |

**Cohort Cards** (5-column grid):
| Element | Typography / Style |
|---------|-------------------|
| **Card Padding** | p-6 sm:p-7 xl:p-8 |
| **Cohort Label** | text-2xl sm:text-3xl xl:text-3xl, DM Serif Display, stone-900 |
| **Sublabel** | text-base xl:text-lg, stone-500 |
| **Client Count** | text-4xl sm:text-5xl xl:text-5xl, DM Serif Display (HERO number) |
| **"clients" label** | text-lg xl:text-xl, stone-500 |
| **Maturity Badge** | text-sm, px-4 py-2.5, rounded-xl with glow shadow |
| **Recommended Badge** | text-sm font-bold, amber gradient, rotates on hover |

**Card States**:
| State | Visual Treatment |
|-------|-----------------|
| **Default** | White gradient, subtle shadow |
| **Hover** | translateY(-4px), deeper shadow, amber tint overlay |
| **Selected** | Warm amber gradient (#fffbeb → #fef3c7), amber border, checkmark pulse |
| **Disabled** | 50% opacity, cursor-not-allowed |

#### Collapsed State (After Selection)
| Element | Content |
|---------|---------|
| **Style** | Compact horizontal bar (~60px height) |
| **Left Accent** | 4px amber gradient bar |
| **Icon** | Users in amber-50 rounded-xl container |
| **Label** | text-lg font-bold, DM Serif Display |
| **Details** | Client count, maturity badge inline |
| **Action** | "Change" button with Pencil icon |
| **Transition** | Auto-collapses 400ms after selection |

**Design Philosophy**: Luxury-level typography with hero-sized client counts. Make selection prominent initially with sophisticated visuals, then collapse to let users focus on data.

**Cohort Options** (in order):

| Cohort | Sublabel | Maturity |
|--------|----------|----------|
| All Time | "Since practice opened" | Mature (recommended) |
| 2025 YTD | "Jan - Nov 2025" | Mature |
| Q3 2025 | "Jul - Sep" | Mature |
| Q4 2025 | "Oct - Dec" | Partial |
| Nov 2025 | "23 clients" | Immature (grayed out, shows "Data available Jan 15, 2026") |

**Maturity Badge Styles**:
| Maturity | Background | Text | Border | Glow |
|----------|------------|------|--------|------|
| **Mature** | emerald-50 | emerald-700 | emerald-200 | rgba(16, 185, 129, 0.15) |
| **Partial** | amber-50 | amber-700 | amber-200 | rgba(245, 158, 11, 0.15) |
| **Immature** | stone-100 | stone-500 | stone-300 | rgba(120, 113, 108, 0.1) |

---

### Definitions Bar

| Element | Content |
|---------|---------|
| **Location** | Below cohort selector, before hero stats |
| **Style** | Subtle stone-100 background, compact horizontal layout |
| **Icon** | Info icon (16px) |
| **Definitions** | |
| - Churned | "No appointment in 30+ days and none scheduled" |
| - Retained | "Active or has appointment scheduled within 30 days" |

**Component**: `DefinitionsBar`

---

### Hero Stats Row (4 Cards) - With Benchmarks

Uses the standard `StatCard` component from the design system. Displayed in a 4-column grid after cohort selection. Benchmarks are shown in subtexts where applicable.

#### 1. Clients Acquired
| Element | Content |
|---------|---------|
| **Title** | "Clients Acquired" |
| **Value** | "{XXX}" (total clients in cohort) |
| **Subtext** | "in {Cohort Label}" |
| **Variant** | default (stone-900) |

#### 2. Clients Churned
| Element | Content |
|---------|---------|
| **Title** | "Clients Churned" |
| **Value** | "{XXX}" (churned count) |
| **Subtext** | "{X}% of cohort (avg: {benchmark}%)" |
| **Variant** | negative (rose-600) |
| **Benchmark** | Industry average churn rate shown in subtext |

#### 3. Active Clients
| Element | Content |
|---------|---------|
| **Title** | "Active Clients" |
| **Value** | "{XXX}" (still active from cohort) |
| **Subtext** | "{X}% still active" |
| **Variant** | positive (emerald-600) |

#### 4. Avg Client Tenure
| Element | Content |
|---------|---------|
| **Title** | "Avg Client Tenure" |
| **Value** | "{X.X}" |
| **Subtext** | "sessions per client (avg: {benchmark})" |
| **Variant** | default (stone-900) |
| **Benchmark** | Industry average tenure shown in subtext |
| **Note** | **IMPORTANT**: This is the average number of sessions across ALL clients in the cohort, not just churned clients. This provides an accurate view of client engagement. |

---

### Cohort Section 1: Churn Patterns (Rose)

| Element | Content |
|---------|---------|
| **Section Header** | Question: "When do clients leave?" |
| **Description** | "Monthly churn trends and timing breakdown" |
| **Number** | 1 |
| **Accent** | Rose |
| **Visibility** | Only shown after cohort selection |

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

### Cohort Section 2: Retention Journey (Amber)

| Element | Content |
|---------|---------|
| **Section Header** | Question: "How far do clients get?" |
| **Description** | "Session milestones and time-based retention" |
| **Number** | 2 |
| **Accent** | Amber |
| **Visibility** | Only shown after cohort selection |

#### Layout
Both funnel cards displayed **side-by-side** in a 2-column grid, followed by the First Session Drop-off card below.

#### Retention by Sessions Funnel (Left)
See Retention Funnel Cards section below for funnel details.

#### Retention by Time Funnel (Right)
See Retention Funnel Cards section below for funnel details.

#### First Session Drop-off StatCard (Below Funnels)
| Element | Content |
|---------|---------|
| **Component** | `StatCard` |
| **Title** | "Session 1→2 Drop-off" |
| **Value** | "{X}%" (drop-off percentage) |
| **Subtitle** | "{Y}% return rate (industry avg: {Z}%)" |
| **Variant** | negative if below benchmark, positive if above |
| **Layout** | Single compact card (max-w-md) |

**Why This Matters**: The Session 1→2 transition is often the steepest cliff in client retention. Highlighting it separately ensures practice owners don't miss this critical insight.

---

### Cohort Section 3: What Type of Clients Do We Lose (Cyan)

| Element | Content |
|---------|---------|
| **Section Header** | Question: "What type of clients do we lose?" |
| **Description** | "Comparing churn rates across client segments" |
| **Number** | 3 |
| **Accent** | Cyan |

#### Churn by Frequency InsightCard (Left)
| Element | Content |
|---------|---------|
| **Component** | `InsightCard` |
| **Statement** | "Monthly clients are {X}% of churn but only {Y}% of your client base" |
| **Emphasis** | "{X}% of churn" |
| **Metric** | "{Z}×" |
| **Metric Label** | "overrepresented" |
| **Sentiment** | negative |
| **Category** | "Session Frequency" |
| **Text Size** | text-xl sm:text-2xl xl:text-[1.75rem] (large, readable) |

#### Churn by Gender InsightCard (Right)
| Element | Content |
|---------|---------|
| **Component** | `InsightCard` |
| **Statement** | "No significant difference in churn rates across client genders" |
| **Sentiment** | neutral |
| **Category** | "Demographics" |
| **Text Size** | text-xl sm:text-2xl xl:text-[1.75rem] (large, readable) |

---

### Retention Funnel Cards

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

Scope: Data calculated for the selected cohort (clients who STARTED during that period)

---

## INSURANCE TAB

> **🚧 COMING SOON** - This tab currently shows a placeholder card. Full implementation is planned.

### Current Implementation

| Element | Content |
|---------|---------|
| **Component** | `ComingSoonCard` |
| **Accent** | violet |
| **Title** | "Insurance Analytics" |
| **Description** | "Comprehensive insurance billing and claims analytics are being crafted to give you complete visibility into your practice's payer relationships." |
| **Planned Features** | Claims Tracking, Payer Mix Analysis, Denial Management, Reimbursement Rates, AR Aging Reports |

### Planned Features (Not Yet Implemented)

<details>
<summary>Click to see planned Insurance Tab features</summary>

#### Health Tiles (2 Cards)

##### 1. Outstanding Insurance
| Element | Content |
|---------|---------|
| **Category Label** | "OUTSTANDING INSURANCE" |
| **Value** | "${XX.X}K" |
| **Subtext** | "Unpaid by insurance payers" |

##### 2. Needs Attention
| Element | Content |
|---------|---------|
| **Category Label** | "NEEDS ATTENTION" |
| **Value** | "{XX}" (rejected + denied count) |
| **Subtext** | "Rejected ({X}) + Denied ({X}) claims" |

#### Claims Status Section
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

#### Outstanding Claims by Aging Section
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

</details>

---

## ADMIN TAB

> **🚧 COMING SOON** - This tab currently shows a placeholder card. Full implementation is planned.

### Current Implementation

| Element | Content |
|---------|---------|
| **Component** | `ComingSoonCard` |
| **Accent** | blue |
| **Title** | "Administrative Analytics" |
| **Description** | "Powerful administrative insights are being developed to streamline your practice operations and enhance team productivity." |
| **Planned Features** | Note Compliance, Reminder Delivery, Client Balances, Staff Productivity, Audit Trails |

### Planned Features (Not Yet Implemented)

<details>
<summary>Click to see planned Admin Tab features</summary>

#### Health Tiles (3 Cards)

##### 1. Billing
| Element | Content |
|---------|---------|
| **Category Label** | "BILLING" |
| **Value** | "${XX.X}K" |
| **Subtext** | "Clients still owe after invoices" |

##### 2. Compliance
| Element | Content |
|---------|---------|
| **Category Label** | "COMPLIANCE" |
| **Value** | Notes status indicator |
| **Subtext** | Status description |

##### 3. Reminders
| Element | Content |
|---------|---------|
| **Category Label** | "REMINDERS" |
| **Value** | Success rate or count |
| **Subtext** | Delivery status |

#### Client Balance Aging
- **Chart Type**: Stacked bar or area chart
- **Categories**: Current, 1-30 days, 31-60 days, 61+ days

#### Notes Status
- **Chart Type**: Stacked bar chart
- **Categories**: No Note, Unlocked, Locked

</details>

---

## CLINICIAN RANKING TAB

The Clinician Ranking tab allows practice owners to **select a metric** and see clinicians **ranked/ordered** by that metric. This enables quick identification of top performers and those needing support.

### Page Header

| Element | Content |
|---------|---------|
| **Accent** | Indigo |
| **Label** | "Team Performance" (uppercase) |
| **Title** | "Clinician Rankings" |
| **Subtitle** | "Compare clinician performance across key metrics" |

---

### Metric Selector

| Element | Content |
|---------|---------|
| **Component** | Dropdown with category grouping |
| **Default Selection** | Revenue Generated |
| **Display** | Category icon + Metric name + Category label |

#### Available Metrics by Category

**Financial**:
| Metric | Format | Direction |
|--------|--------|-----------|
| Revenue Generated | $XX.Xk | Higher is better |

**Sessions**:
| Metric | Format | Direction |
|--------|--------|-----------|
| Completed Sessions | X,XXX | Higher is better |
| Cancellation Rate | X.X% | Lower is better |
| Show Rate | XX% | Higher is better |

**Clients**:
| Metric | Format | Direction |
|--------|--------|-----------|
| Utilization Rate | XX% | Higher is better |
| New Clients Acquired | +X | Higher is better |
| Active Clients | XX | Higher is better |

**Retention**:
| Metric | Format | Direction |
|--------|--------|-----------|
| Retention Rate | XX% | Higher is better |
| Rebook Rate | XX% | Higher is better |
| Churn Rate | X.X% | Lower is better |
| Avg Sessions/Client | X.X | Higher is better |

**Compliance**:
| Metric | Format | Direction |
|--------|--------|-----------|
| Outstanding Notes | X | Lower is better |

---

### Ranking List

| Element | Content |
|---------|---------|
| **Component** | Table-style list with header row |
| **Columns** | Rank, Clinician, Metric Value, Trend |

#### Row Components

**Rank Badge**:
| Rank | Style |
|------|-------|
| 1st | Gold circle (amber-100, amber-700 text) |
| 2nd | Silver circle (stone-200, stone-700 text) |
| 3rd | Bronze circle (orange-100, orange-700 text) |
| 4th+ | Stone circle (stone-100, stone-600 text) |

**Clinician Info**:
| Element | Content |
|---------|---------|
| **Avatar** | Colored square with initial (clinician-specific color) |
| **Name** | DM Serif Display font |
| **Performance Badge** | "+X% vs avg" (emerald) or "-X% vs avg" (rose) |

**Metric Value**:
- Large, bold DM Serif Display
- Formatted according to metric type

**Trend Indicator**:
| Trend | Style |
|-------|-------|
| Positive (good direction) | Emerald pill with up arrow |
| Negative (bad direction) | Rose pill with down arrow |
| Neutral | Stone pill with dash |

---

### Team Average Row

| Element | Content |
|---------|---------|
| **Position** | Inserted in ranking at correct position |
| **Visual Style** | Dashed border top/bottom, stone background gradient |
| **Icon** | Users icon in stone circle |
| **Label** | "Team Average" |
| **Sublabel** | "X clinicians" |
| **Purpose** | Divides above-average from below-average clinicians |

---

### Quick Stats Summary (3 Cards)

#### 1. Top Performer
| Element | Content |
|---------|---------|
| **Background** | Amber gradient (#fef3c7 → #fef9c3) |
| **Icon** | Gold rank badge "1" |
| **Content** | Clinician name + metric value |

#### 2. Most Improved
| Element | Content |
|---------|---------|
| **Background** | Emerald gradient (#d1fae5 → #ecfdf5) |
| **Icon** | TrendingUp (emerald) |
| **Content** | Clinician name + trend percentage |

#### 3. Needs Support
| Element | Content |
|---------|---------|
| **Background** | Rose gradient (#fee2e2 → #fef2f2) |
| **Icon** | AlertTriangle (rose) |
| **Content** | Clinician name + % below average |

---

### Clinician Colors

| Clinician | Color | Hex |
|-----------|-------|-----|
| Chen | Purple | #7c3aed |
| Rodriguez | Cyan | #0891b2 |
| Patel | Amber | #d97706 |
| Kim | Pink | #db2777 |
| Johnson | Emerald | #059669 |

---

## TEAM COMPARISON TAB (Legacy)

> **⚠️ SUPERSEDED** - The Team Comparison tab concept has been replaced by the Clinician Ranking tab above, which provides a cleaner metric-focused comparison experience.

<details>
<summary>Click to see original Team Comparison Tab plans</summary>

#### Comparison Tables (3 Views)

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

</details>

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
