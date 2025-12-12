# Cortexa - Master Application Documentation

> **Purpose**: Complete reference of every screen, component, flow, and feature in the Cortexa application. Designed for AI systems to understand the full application context.

---

## 1. Application Overview

**Cortexa** is a practice management analytics dashboard for mental health/therapy practices. It provides executives and practice owners with:
- Real-time practice metrics and KPIs
- Clinician performance tracking and rankings
- Client health monitoring and retention analysis
- Financial analytics and revenue tracking
- Operational compliance dashboards

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Routing | React Router v7.9.6 |
| Styling | Tailwind CSS (CDN) + CSS custom properties |
| Charts | Recharts 3.4.1 |
| Animation | Framer Motion 12.23.24 |
| Icons | Lucide React |
| AI | Google Gemini (for insights) |
| Auth | Custom HMAC-SHA256 tokens |

### Aesthetic & Visual Identity
- **Color Palette**: Warm amber/peachy-orange gradients (`from-[#fef5e7] via-[#fae5c1] to-[#f5d5a8]`)
- **Typography**: DM Serif Display (headings/numbers), DM Sans (body), Playfair Display (display)
- **Status Colors**: Emerald (healthy), Amber (attention), Rose (critical)
- **Header Variants**: Light PageHeader and Dark PageHeader for contrast

---

## 2. Navigation Structure

### Sidebar Navigation
**Component**: `Sidebar.tsx`
- **Collapsed Width**: 80px
- **Expanded Width**: 320px
- **Background**: `#181716` (dark)

**Main Navigation Items**:
1. **Overview** → `/dashboard`
   - Icon: LayoutGrid
   - Description: "Key metrics & insights"

2. **Clinicians** → `/clinician-overview`
   - Icon: Users
   - Description: "Team performance"
   - Sub-items:
     - Spotlight (`?tab=ranking`)
     - Individual Details (`?tab=details`)

3. **Practice** → `/practice-analysis`
   - Icon: BarChart3
   - Description: "Operations & analytics"
   - Sub-items:
     - Client Roster (`?tab=clients`)
     - Financial (`?tab=financial`)
     - Sessions (`?tab=sessions`)
     - Capacity (`?tab=capacity-client`)
     - Retention (`?tab=retention`)
     - Insurance (`?tab=insurance`)
     - Admin (`?tab=admin`)

**Coming Soon** (grayed out):
- Consultations (MessageSquare)
- Accounting (Calculator)
- Payroll (Banknote)

### Mobile Navigation
- **Bottom Nav** (`BottomNav.tsx`): Fixed bottom bar with 4 items (Overview, Clinicians, Details, Settings)
- **Mobile Header**: Sticky top bar with hamburger menu
- **Mobile Menu**: Full-screen overlay drawer

---

## 3. Pages & Screens - Complete Detail

---

### 3.1 Login Page (`/login`)
**Component**: `LoginPage.tsx`

**Purpose**: Authenticate users into the application

**Visual Elements**:
- Animated falling lines canvas background
- Centered login card with dark styling
- Cortexa logo and branding

**Form Fields**:
- Email/username input
- Password input
- Submit button

**Functionality**:
- Validates against `VITE_AUTH_USERNAME` and `VITE_AUTH_PASSWORD`
- Generates HMAC-SHA256 token using `VITE_AUTH_SECRET`
- Stores auth state and token in sessionStorage
- Build version checking for cache invalidation
- Link to sign-up flow

---

### 3.2 Onboarding/Signup Flow (`/signup`)
**Component**: `OnboardingFlow.tsx`

**Purpose**: Multi-step registration for new users

**Slides**:
1. Email/password setup
2. Practice information
3. Terms acceptance
4. Completion confirmation

---

### 3.3 Dashboard - Practice Overview (`/dashboard`)
**Component**: `Dashboard.tsx`

**Purpose**: Executive-level view of practice health with priority alerts

#### Header Section
- **Style**: Dark themed header (`#1a1816`)
- **Label**: "Practice Overview"
- **Title**: Current month/year (e.g., "December 2024")
- **Controls**:
  - **Referral Badge**: Opens ReferralModal when clicked
  - **Live/Historical Toggle**: Switch between current month and past data
  - **Month Picker**: Appears in Historical mode to select past months

#### Key Metrics Row (5 StatCards, horizontal layout)

| # | Metric | Display Example | Status Logic | Subtext |
|---|--------|-----------------|--------------|---------|
| 1 | Revenue | "$65.2k" | vs $100k goal | Gap to goal, target info |
| 2 | Sessions | "412" | vs 475 goal | % of monthly goal |
| 3 | Clients | "156" | Net growth | "+12 new, -4 churned, 8 openings" |
| 4 | Attendance | "85%" | vs 85% target | Cancel rate breakdown |
| 5 | Outstanding Notes | "18%" | vs 10% target | Compliance status |

**Status Color Logic**:
- Healthy (green): ≥95% of goal
- Needs Attention (amber): 80-95% of goal
- Critical (rose): <80% of goal

#### Priority Tasks Section
**Layout**: Horizontally scrollable card container with snap-to-card behavior

**Card 0 - Monthly Review Card**:
- Opens as multi-slide carousel
- Slides: Revenue, Sessions, New Clients, Retention, Attendance, Team MVP
- Shows trend comparisons
- Action buttons

**Cards 1-N - Priority Alert Cards**:
- Dynamic cards from `priorityCardsData.ts` (32 cards available)
- Each card displays:
  - Status badge (Critical/Attention/Opportunity/Insight)
  - Title
  - AI-generated guidance
  - Statistics with color coding
  - Comparison text vs benchmarks
  - CTA button

**Navigation Controls**:
- Previous/Next arrows
- Progress bar showing scroll position
- Disabled states at scroll bounds

---

### 3.4 Clinician Overview (`/clinician-overview`)
**Component**: `ClinicianOverview.tsx`

**Purpose**: Team performance metrics with clinician-by-clinician rankings

**URL Parameters**: `?tab=ranking` (default) or `?tab=details`

---

#### 3.4.1 Spotlight Tab (`?tab=ranking`)

**Header**:
- **Style**: Dark header with amber glow
- **Title**: "Clinician Spotlight"
- **Subtitle**: Date range (e.g., "Dec 2024 - Dec 2025")
- **Note**: "Lower values rank higher" (shown for metrics where lower is better)

**Time Period Selector**:
- Last 12 Months (default)
- Live (current month)
- Historical (with month picker)

**Metric Selector Buttons** (8 buttons in 2 rows):

| Button | Question | Primary Metric | Supporting Metrics | Lower is Better? |
|--------|----------|----------------|-------------------|------------------|
| Revenue | "Who's generating the most revenue?" | Gross Revenue | Sessions, Avg Revenue/Session | No |
| Caseload | "Who has capacity for new clients?" | Caseload % | Active Clients, Client Goal | No |
| Growth | "Who's bringing in new clients?" | New Clients | - | No |
| Sessions | "Who's meeting session goals?" | Session Goal % | Completed Sessions, Session Goal | No |
| Attendance | "Who's losing appointments?" | Non-Billable Cancel Rate | Client/Clinician Cancels, No-Shows | Yes |
| Engagement | "Who's keeping clients engaged?" | Rebook Rate | Avg Sessions/Client/Month | No |
| Retention | "Who's losing clients?" | Churn Rate | Clients Lost, At-Risk, Session 1→2/5/12 Retention | Yes |
| Notes | "Who needs to catch up on notes?" | Outstanding Notes | - | Yes |

**Ranking List Display**:
For each of 5 clinicians:
- **Rank Badge**: 1-5 with color coding
  - Rank 1: Green accent, top shadow
  - Rank 5: Red accent
  - Others: Gray
- **Avatar**: Colored box with initials
- **Name & Role**
- **Primary Metric Value** (right-aligned)
- **Horizontal Comparison Bar** (visual)
- **Supporting Metrics** (columns)

**Team Average Row**:
- Shows where average would rank
- Dashed border styling

---

#### 3.4.2 Details Tab (`?tab=details`)
**Component**: `ClinicianDetailsTab.tsx`

**Purpose**: Deep-dive analytics for individual clinician performance

**Two States**:

##### State 1: No Clinician Selected (Empty State)
- Centered icon with message "Select a Clinician"
- Instructions to use dropdown

##### State 2: Clinician Selected (Spotlight Mode)

**Header - Clinician Profile**:
- **Clinician Avatar**: Large colored avatar with glow ring, clickable to switch clinician
- **Name**: Large serif display (e.g., "Sarah Chen")
- **Health Status Badge**: Healthy/Needs Attention/Critical with icon and glow
- **Title**: License type (e.g., "Licensed Clinical Psychologist")
- **Details Row**: Role, Tenure, Take Rate %, Supervisor (if applicable)
- **AI Insight Quote**: Italicized insight about clinician performance
- **Time Period Selector**: Last 12 months, This Year, This Quarter, etc.

**Hero Stats Row** (4 StatCards):
| Stat | Example | Subtitle |
|------|---------|----------|
| Revenue | "$142K" | "+12% vs goal · 28% of practice" |
| Sessions | "41/mo" | "~10/week · 487 total" |
| Caseload | "27/30" | "90% capacity · +5% vs avg" |
| Notes Overdue | "2" | "On track" |

**Content Sections**:

**Section 1: Priority Alerts** (Only shows if clinician has issues)
- Actionable alerts requiring follow-up
- Rose accent color

**Section 2: Financial Performance**
- **Chart**: "Revenue Over Time" - Bar chart with 12 months
  - Goal line indicator
  - Green bars for months at/above goal
  - Blue bars for months below goal
- **Insights**: Best month, Revenue per session (vs team avg), Months hitting goal

**Section 3: Session Performance**
- **Chart 1**: "Completed Sessions" - Bar chart
  - Toggle: Monthly Total / Weekly Average
  - Goal line indicator
- **Chart 2**: "Attendance Breakdown" - Donut chart
  - Segments: Attended, Client Cancelled, Clinician Cancelled, Late Cancelled, No Show
  - Center: Show Rate percentage

**Section 4: Client & Caseload**
- **Chart**: "Client Movement" - Diverging bar chart
  - Green bars (up): New Clients
  - Red bars (down): Churned Clients
- **Card**: "Client Roster" - List of clinician's clients
  - Status badges: Healthy, At-Risk, New, Milestone
  - Total sessions, last seen days, next appointment

**Section 5: Retention** (Placeholder)
- Rebook Rate Trend
- Retention Comparison Table

**Section 6: Compliance** (Placeholder)
- Notes Status Card
- Overdue Notes List

**Section 7: Trends & Team Comparison** (Placeholder)
- Multi-Metric Sparklines
- Team Ranking Comparison

---

### 3.5 Practice Analysis (`/practice-analysis`)
**Component**: `PracticeAnalysis.tsx`

**Purpose**: Deep-dive operational analytics across 7 specialized tabs

**URL Structure**: `/practice-analysis?tab=<tabId>`

**Time Period Selector**: Last 12 months, This Year, This Quarter, Last Quarter, Custom

---

#### 3.5.1 Client Roster Tab (`?tab=clients`)
**Component**: `ClientRoster.tsx`

**Purpose**: Client health dashboard organized by lifecycle stage

**Segment Filter Buttons**:
| Segment | Count | Definition |
|---------|-------|------------|
| All Clients | 156 | Everyone in practice |
| Healthy | 128 | Active with upcoming appointment scheduled |
| At-Risk | 8 | No upcoming appointment scheduled |
| New Clients | 12 | Within first 3 sessions |
| Milestone Approaching | 6 | Near session 3, 5, or 12 |
| Recently Churned | 2 | Left in last 90 days |

**Client List Display** (each row):
- Avatar with initials
- Client name
- Assigned clinician
- Total sessions count
- Days since last session
- Next appointment (or "No upcoming")
- Status indicator dot (colored by segment)

**Sorting**: Clickable column headers (Name, Clinician, Sessions, Last Seen, Next Apt)

---

#### 3.5.2 Financial Analysis Tab (`?tab=financial`)
**Component**: `FinancialAnalysisTab.tsx`

**Purpose**: Revenue tracking, breakdown, and clinician performance

**Header**:
- Accent: Emerald
- Title: "Financial Performance"
- Subtitle: Date range

**Charts & Visualizations**:

| Chart | Type | Description |
|-------|------|-------------|
| Revenue Over Time | Bar Chart | 12-month gross revenue with $150k goal line |
| Revenue by Clinician | Stacked Bar Chart | Toggle to show clinician breakdown (5 clinicians, color-coded) |
| Revenue Breakdown | Data Table | Gross → Clinician Costs → Supervisor Costs → CC Fees → Net |
| Cost Percentages | Line Chart | Clinician % and Supervisor % over time |
| Cohort LTV | Line Chart | 2025 vs 2024 cohort comparison by month |

**Key Metrics Displayed**:
- Total gross revenue
- Total net revenue
- Average margin %
- Months at goal
- Best month
- MoM change %
- Revenue per session

**Insights Row**:
- Best (month + value)
- MoM Trend (% change)
- Range (min-max)

---

#### 3.5.3 Sessions Analysis Tab (`?tab=sessions`)
**Component**: `SessionsAnalysisTab.tsx`

**Purpose**: Session volume, completion rates, clinician workload

**Header**:
- Accent: Amber/Cyan
- Title: "Sessions Performance"

**Charts & Visualizations**:

| Chart | Type | Description |
|-------|------|-------------|
| Completed Sessions | Bar Chart | Monthly completed with 700 goal line |
| Sessions by Clinician | Stacked Bar Chart | Toggle for clinician breakdown |
| Attendance Breakdown | Donut Chart | Attended, Client Cancel, Clinician Cancel, Late Cancel, No Show |
| Session Modality | Split Bar | Telehealth vs In-Person |
| Sessions Data Table | Table | Monthly breakdown by status |

**Key Metrics Displayed**:
- Total completed sessions
- Total booked sessions
- Show rate %
- Client cancel rate %
- Avg sessions per client
- Avg weekly completed
- Telehealth vs in-person split

**Insights Row**:
- Best (month + count)
- MoM Trend
- Range

---

#### 3.5.4 Capacity & Client Tab (`?tab=capacity-client`)
**Component**: `CapacityClientTab.tsx`

**Purpose**: Client growth, capacity utilization, demographics

**Charts & Visualizations**:

| Chart | Type | Description |
|-------|------|-------------|
| Active Clients Trend | Line Chart | Monthly active client count |
| Client Movement | Diverging Bar | New clients (up) vs Churned (down) |
| Gender Distribution | Donut Chart | Male, Female, Other |
| Session Frequency | Donut Chart | Weekly, Bi-weekly, Monthly clients |
| Capacity Utilization | Stat Cards | Current clients / capacity |
| Open Slots | Visual | Available appointment slots |

**Key Metrics Displayed**:
- Active clients
- New clients
- Churned clients
- Net client growth
- Capacity utilization %
- Open slots

---

#### 3.5.5 Retention Analysis Tab (`?tab=retention`)
**Component**: `RetentionTab.tsx`

**Purpose**: Client retention, churn analysis, cohort performance

**Header**:
- Accent: Rose
- Title: "Retention"

**Section 1: Track Current Retention**

| Chart | Type | Description |
|-------|------|-------------|
| Rebook Rate | Line Chart | % of clients with next appointment scheduled over time |
| At-Risk Clients | Card List | Clients without upcoming appointments, sorted by days since last session |

**Section 2: Cohort Analysis**

**Cohort Selector** (dropdown):
| Cohort | Clients | Maturity |
|--------|---------|----------|
| All Time | 847 | Mature |
| 2025 YTD | 312 | Mature |
| Q3 2025 | 142 | Mature |
| Q4 2025 | 89 | Partial |
| Nov 2025 | 23 | Immature |

**Cohort Summary Stats** (4 StatCards):
- Clients Acquired
- Clients Churned
- Active Clients
- Avg Sessions Completed

**Section 3: When Do Clients Leave?**

| Chart | Type | Description |
|-------|------|-------------|
| Clients Churned | Bar Chart | Monthly churn with clinician breakdown toggle |
| Churn Timing | Donut Chart | Early (<5 sessions), Medium (5-15), Late (>15) |

**Section 4: How Far Do Clients Get?**

| Chart | Type | Description |
|-------|------|-------------|
| Retention by Sessions | Funnel Chart | Session 1 → 2 → 5 → 12 → 24 milestones |
| Retention by Time | Funnel Chart | 1 month → 3 months → 6 months → 12 months |
| Session 1→2 Drop-off | Stat Card | % who don't return after first session |

**Section 5: What Type of Clients Do We Lose?**

| Card | Type | Description |
|------|------|-------------|
| Churn by Frequency | Insight Card | "Monthly clients are X% of churn but only Y% of base" |
| Churn by Gender | Insight Card | Demographics impact analysis |

---

#### 3.5.6 Insurance Analysis Tab (`?tab=insurance`)
**Component**: `InsuranceTab.tsx`

**Purpose**: Claims management, client balance aging

**Charts & Visualizations**:

| Chart | Type | Description |
|-------|------|-------------|
| Claims Status | Stat Cards | Paid, Rejected, Denied, Deductible counts |
| Client Balance Aging | Stacked Bar | Current, 1-30 days, 31-60 days, 61+ days |
| Outstanding Claims | Bar Chart | Unbilled, Due 30, Due 60, Due 90+ |
| Top Past-Due Clients | Table | Sorted by balance amount |
| Reminder Delivery | Stats | SMS/Email sent vs failed |

---

#### 3.5.7 Admin Analysis Tab (`?tab=admin`)
**Component**: `AdminTab.tsx`

**Purpose**: Administrative operations and compliance

**Charts & Visualizations**:

| Chart | Type | Description |
|-------|------|-------------|
| Notes Status | Donut/Stats | No note, Unlocked, Locked counts |
| At-Risk Compliance | Table | Oldest appointments without notes |
| Reminder Tracking | Line Chart | Delivery success rates over time |
| Claims Pipeline | Bar Chart | Claims by status stage |

---

### 3.6 Clinician Details Page (`/clinician-details`)
**Component**: `ClinicianDetails.tsx`

**Status**: Redirects to `/clinician-overview?tab=details`

---

### 3.7 Settings Page (`/settings`)
**Component**: `SettingsPage.tsx`

**Purpose**: User and application preferences

**Sections**:

1. **Data Privacy**
   - **Anonymize Clinician Names** toggle
     - When ON: Shows demo names (e.g., "Sarah Chen" → "Emily Thompson")
     - Mapping in `SettingsContext.tsx`
   - **Show Net Revenue Data** toggle
     - When ON: Shows cost breakdowns and net revenue
     - When OFF: Shows gross revenue only

2. **General Settings**
   - Practice name/timezone
   - Data export options

3. **Logout**
   - Sign out button

**Storage**: localStorage key `cortexa_settings`

---

### 3.8 Metric Definitions Page (`/settings/metric-definitions`)
**Component**: `MetricDefinitionsPage.tsx`

**Purpose**: Customize how metrics are calculated

**Configurable Settings**:

| Setting | Default | Description |
|---------|---------|-------------|
| Active Client Window | 30 days | Days to consider client "active" |
| Low Risk Threshold | 7-14 days | Days since last session for low risk |
| Medium Risk Threshold | 14-21 days | Days for medium risk |
| High Risk Threshold | 21+ days | Days for high risk |
| Early Churn | 0-5 months | Churn timing classification |
| Late Churn | 15+ months | Churn timing classification |
| Late Cancel Window | 24 hours | Cancellations within this = "late" |
| Note Deadline | 3 days | Notes overdue after this |

---

### 3.9 Components Reference (`/components`)
**Component**: `Reference.tsx`

**Purpose**: Interactive showcase of all design system components

**Categories**:
- Layout Components
- Card Components (18 types)
- Chart Components
- Control Components

---

## 4. Referral System

### Referral Badge
**Component**: `ReferralBadge.tsx`
- Displayed in Dashboard header
- Shows invites remaining count
- Click opens ReferralModal

### Referral Modal
**Component**: `ReferralModal.tsx`

**Two Tabs**:

**Tab 1: Invite**
- Visual invite indicators (remaining/used pills)
- Large number display (invites remaining)
- Reward callout ($X per referral)
- Referral code with copy button
- "Share via Email" button

**Tab 2: Earnings**
- Total earned display
- Pending earnings
- Referral list (email, status: confirmed/pending)
- Payout setup CTA

### Referral Context
**Component**: `ReferralContext.tsx`

**State**:
- `invitesRemaining`: Number
- `totalInvites`: Number
- `referralCode`: String
- `pendingEarnings`: Number
- `confirmedEarnings`: Number
- `rewardPerReferral`: Number
- `isPayoutSetup`: Boolean
- `referrals`: Array of referral objects

---

## 5. Design System Components

### Layout Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `PageHeader` | Page header with accent glow | `accent`, `label`, `title`, `subtitle`, `actions`, `children` |
| `DarkPageHeader` | Dark-themed header variant | Same as PageHeader |
| `Grid` | Responsive grid container | `cols`, `gap` |
| `Section` | Named content section | `title`, `spacing` |
| `SectionHeader` | Section title with number | `number`, `question`, `description`, `accent` |
| `SectionContainer` | Section with accent divider | `accent`, `index`, `isFirst`, `isLast` |
| `AnimatedSection` | Motion-enabled section | `delay` |
| `AnimatedGrid` | Motion-enabled grid | `staggerDelay` |
| `PageContent` | Full-page wrapper | - |

### Card Components

| Component | Purpose |
|-----------|---------|
| `StatCard` | Single metric with status |
| `MetricCard` | Metric with expandable breakdown |
| `ChartCard` | Container for Recharts |
| `SimpleChartCard` | Minimal chart wrapper |
| `CompactCard` | Condensed metric |
| `DonutChartCard` | Donut/pie visualization |
| `DataTableCard` | Sortable data table |
| `ClientRosterCard` | Client status table |
| `ActionableClientListCard` | Client list with actions |
| `AtRiskClientsCard` | At-risk highlighting |
| `MilestoneOpportunityCard` | Milestone approaching |
| `InsightCard` | Text insight/alert |
| `ComingSoonCard` | Feature placeholder |
| `ExecutiveSummary` | High-level overview |
| `SplitBarCard` | Side-by-side comparison |
| `StackedBarCard` | Stacked visualization |
| `RetentionFunnelCard` | Funnel display |
| `CohortSelector` | Cohort dropdown |

### Chart Components

| Component | Purpose |
|-----------|---------|
| `BarChart` | Bar chart with single/stacked modes |
| `LineChart` | Multi-line with reference lines |
| `DivergingBarChart` | Bars from center axis |
| `RetentionFunnelChart` | Funnel visualization |

### Control Components

| Component | Purpose |
|-----------|---------|
| `ToggleButton` | On/off switch |
| `GoalIndicator` | Progress indicator |
| `ActionButton` | Primary/secondary button |
| `ExpandedChartModal` | Fullscreen chart modal |

---

## 6. Data Architecture

### Contexts

| Context | Purpose | Key State |
|---------|---------|-----------|
| `AuthContext` | Authentication | `isAuthenticated`, `token`, `login()`, `logout()` |
| `SettingsContext` | App preferences | `showNetRevenueData`, `anonymizeClinicianNames` |
| `ReferralContext` | Referral program | Invite count, earnings, referral code |

### Custom Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useMetrics(month, year)` | `{ data, loading, error }` | Dashboard metrics |
| `useClinicianMetricsForPeriod(period)` | `{ data, loading, error }` | Clinician rankings |
| `useClinicianMetricsForMonth(month, year)` | `{ data, loading, error }` | Monthly clinician data |
| `useDataDateRange()` | `{ earliest, latest }` | Available data range |
| `useMonthlyData(month, year)` | `{ data }` | Raw monthly data |
| `useIsMobile(breakpoint?)` | `boolean` | Responsive detection |
| `useResponsiveChartSizes()` | `{ width, height }` | Chart dimensions |

### API Endpoints

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/metrics?month=YYYY-MM` | GET | Monthly metrics + practice settings |
| `/api/metrics/all?start=&end=` | GET | Multi-month metrics |
| `/api/metrics/date-range` | GET | `{ earliest, latest }` |

---

## 7. Clinician Data

**5 Clinicians in Mock Data**:

| ID | Name | Initials | Color | Role | Health |
|----|------|----------|-------|------|--------|
| 1 | Sarah Chen | SC | #a855f7 | Clinical Director | Healthy |
| 2 | Maria Rodriguez | MR | #06b6d4 | Senior Therapist | Healthy |
| 3 | Priya Patel | PP | #f59e0b | Therapist | Attention |
| 4 | James Kim | JK | #ec4899 | Associate Therapist | Healthy |
| 5 | Michael Johnson | MJ | #10b981 | Associate Therapist | Critical |

**Metrics Tracked Per Clinician**:
- Revenue (gross, vs goal %)
- Sessions (completed, vs goal %)
- Rebook Rate
- Notes Overdue
- Take Rate %
- Tenure
- Supervisor assignment

---

## 8. Client Data

**156 Total Clients** distributed across segments:
- Healthy: 128
- At-Risk: 8
- New Clients: 12
- Milestone Approaching: 6
- Recently Churned: 2

**Client Data Fields**:
- ID, Name, Initials
- Assigned Clinician ID
- Total Sessions
- Last Seen (days ago)
- Next Appointment (date or null)
- Status (healthy/at-risk/new/milestone/churned)
- Gender (male/female/other)
- Frequency (weekly/bi-weekly/monthly)

---

## 9. Key User Flows

### Flow 1: Daily Practice Check
1. Login → Dashboard
2. Review 5 key metrics (green/yellow/red)
3. Scroll priority cards for alerts
4. Click card → detailed action

### Flow 2: Clinician Performance Review
1. Navigate to Clinician Overview → Spotlight
2. Select metric (Revenue, Sessions, etc.)
3. Review rankings
4. Click clinician avatar → Details tab
5. Deep-dive into individual performance

### Flow 3: Client Health Analysis
1. Navigate to Practice Analysis → Client Roster
2. Filter by segment (At-Risk, New, etc.)
3. Review individual client status
4. Take action (schedule, contact)

### Flow 4: Monthly Financial Review
1. Navigate to Practice Analysis → Financial
2. Review revenue trend
3. Check cost breakdown
4. Compare clinician revenue
5. Analyze cohort LTV

### Flow 5: Retention Analysis
1. Navigate to Practice Analysis → Retention
2. Check rebook rate trend
3. Review at-risk clients
4. Select cohort
5. Analyze retention funnel
6. Identify drop-off points

---

## 10. File Structure

```
cortexa2/
├── App.tsx                         # Router + main layout
├── index.tsx                       # React entry
├── types.ts                        # Global types
│
├── components/
│   ├── design-system/
│   │   ├── cards/                  # 18 card types
│   │   ├── charts/                 # Chart wrappers
│   │   ├── controls/               # Buttons, toggles
│   │   ├── layout/                 # Headers, grids
│   │   ├── Reference.tsx           # Design system showcase
│   │   └── index.ts                # Barrel exports
│   │
│   ├── analysis/
│   │   ├── FinancialAnalysisTab.tsx
│   │   ├── SessionsAnalysisTab.tsx
│   │   ├── CapacityClientTab.tsx
│   │   ├── RetentionTab.tsx
│   │   ├── InsuranceTab.tsx
│   │   ├── AdminTab.tsx
│   │   └── ClinicianRankingTab.tsx
│   │
│   ├── referral/
│   │   ├── ReferralBadge.tsx
│   │   ├── ReferralModal.tsx
│   │   ├── ReferralContext.tsx
│   │   └── index.ts
│   │
│   ├── Dashboard.tsx               # Practice Overview
│   ├── PracticeAnalysis.tsx        # Analytics hub (7 tabs)
│   ├── ClinicianOverview.tsx       # Team rankings
│   ├── ClinicianDetails.tsx        # Individual redirect
│   ├── ClinicianDetailsTab.tsx     # Individual deep-dive
│   ├── ClientRoster.tsx            # Client table
│   ├── SettingsPage.tsx            # Preferences
│   ├── MetricDefinitionsPage.tsx   # Metric config
│   ├── LoginPage.tsx               # Auth
│   ├── OnboardingFlow.tsx          # Signup
│   ├── Sidebar.tsx                 # Navigation
│   └── BottomNav.tsx               # Mobile nav
│
├── hooks/
│   ├── useMetrics.ts
│   ├── useClinicianMetrics.ts
│   ├── useDataDateRange.ts
│   ├── useMonthlyData.ts
│   ├── useIsMobile.ts
│   └── useResponsiveChartSizes.ts
│
├── context/
│   ├── AuthContext.tsx
│   └── SettingsContext.tsx
│
├── lib/
│   ├── apiClient.ts
│   └── utils.ts
│
├── data/
│   ├── paymentData.ts
│   ├── priorityCardsData.ts
│   └── metricsCalculator.ts
│
└── services/
    └── geminiService.ts
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav, mobile header |
| Tablet | 640-1024px | 2-3 columns, bottom nav |
| Desktop | ≥ 1024px | Full sidebar, multi-column, no bottom nav |

---

## 12. Coming Soon Features

Based on navigation and placeholder content:
1. Consultations tab
2. Accounting tab
3. Payroll tab
4. Full Clinician Details retention/compliance sections
5. Benchmarking
6. Automations & alerts
7. Custom reports
8. Mobile app

---

*Last Updated: December 2024*
*Document Version: 2.0*
