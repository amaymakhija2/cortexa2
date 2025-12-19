# Cortexa Master Product Documentation

**Version:** 1.0
**Last Updated:** December 19, 2024
**Product:** Cortexa - Practice Intelligence Platform for Mental Health Practices

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Login Flow](#2-login-flow)
3. [Sign Up / Onboarding Flow](#3-sign-up--onboarding-flow)
4. [Dashboard - Overview Tab](#4-dashboard---overview-tab)
5. [Dashboard - Compare Tab](#5-dashboard---compare-tab)
6. [Clinician Spotlight - Ranking Tab](#6-clinician-spotlight---ranking-tab)
7. [Clinician Spotlight - Details Tab](#7-clinician-spotlight---details-tab)
   - 7.1-7.8 [Page Layout, Header, Financial, Sessions, Caseload](#71-page-layout-overview)
   - 7.9 [Retention Section (Detailed)](#79-section-4-retention-detailed)
   - 7.10 [Compliance & Documentation](#710-section-5-compliance--documentation)
   - 7.11-7.15 [Clinician Cards, Time Selector, Hero Stats, Metadata, AI Insights](#711-clinician-profile-cards-before-selection)
   - 7.16-7.22 [Expandable Charts, Session History, Switcher, Demographics, Roster, Goals](#716-expandable-charts-full-modal)
8. [Practice Analysis - Overview](#8-practice-analysis---overview)
9. [Practice Analysis - Client Roster Tab](#9-practice-analysis---client-roster-tab)
10. [Practice Analysis - Financial Tab](#10-practice-analysis---financial-tab)
11. [Practice Analysis - Sessions Tab](#11-practice-analysis---sessions-tab)
12. [Practice Analysis - Client & Capacity Tab](#12-practice-analysis---client--capacity-tab)
13. [Practice Analysis - Retention Tab](#13-practice-analysis---retention-tab)
14. [Practice Analysis - Insurance Tab](#14-practice-analysis---insurance-tab)
15. [Practice Analysis - Admin Tab](#15-practice-analysis---admin-tab)
16. [Practice Configuration - Overview](#16-practice-configuration---overview)
17. [Practice Configuration - Locations Tab](#17-practice-configuration---locations-tab)
18. [Practice Configuration - Team Members Tab](#18-practice-configuration---team-members-tab)
19. [Practice Configuration - Team Structure Tab](#19-practice-configuration---team-structure-tab)
20. [Practice Configuration - Clinician Goals Tab](#20-practice-configuration---clinician-goals-tab)
21. [Practice Configuration - Practice Goals Tab](#21-practice-configuration---practice-goals-tab)
22. [Practice Configuration - Thresholds Tab](#22-practice-configuration---thresholds-tab)
23. [Practice Configuration - EHR Connection Tab](#23-practice-configuration---ehr-connection-tab)
24. [Settings Page](#24-settings-page)

---

## 1. Product Overview

Cortexa is a Practice Intelligence Platform designed for mental health practice owners. It connects to Electronic Health Record (EHR) systems and transforms raw practice data into actionable insights.

### Target Users

- Practice Owners
- Clinical Directors
- Practice Managers
- Office Managers

### Core Value Propositions

1. **See what's happening** - Real-time metrics across revenue, sessions, clients, attendance
2. **Catch problems early** - AI-generated alerts for burnout, churn risk, engagement issues
3. **Compare performance** - Slice data by location, supervisor, or credential type
4. **Track clinicians** - Individual performance dashboards with coaching insights

### Supported EHR Systems

| EHR | Status |
|-----|--------|
| SimplePractice | Supported |
| TherapyNotes | Supported |
| Jane App | Supported |
| TheraNest | Supported |
| Practice Fusion | Supported |
| Kareo | Supported |
| DrChrono | Supported |
| athenahealth | Supported |

---

## 2. Login Flow

### Screen: Login Page

**URL:** `/login`

#### Layout

Split-screen design:
- **Left side (desktop only):** Animated falling lines with amber glow accents and "Practice Intelligence" tagline
- **Right side:** Login form on dark background

#### Header

- **Logo:** "Cortexa" in DM Serif Display font
- **Subtitle:** "Sign in to your account"

#### Google OAuth Option

- **Button text:** "Continue with Google"
- **Divider text:** "or sign in with email"

#### Form Fields

| Field | Label | Placeholder | Type |
|-------|-------|-------------|------|
| Username | "Username" | (none) | text |
| Password | "Password" | (none) | password |

- Password field has visibility toggle (eye icon)

#### Submit Button

- **Text:** "Sign In →"
- **Loading state:** Shows spinner

#### Error Message

- **Text:** "Invalid credentials. Please try again."
- Appears as red banner above form

#### Sign Up Link

- **Text:** "Don't have an account? Sign up"
- Links to `/signup`

#### Footer

- **Text:** "Questions? support@usecortexa.com"

---

## 3. Sign Up / Onboarding Flow

### Screen: Onboarding

**URL:** `/signup`

A multi-step wizard that guides new users through account creation and EHR connection.

#### Progress Indicator

Visual dots showing current step progress. Steps vary based on configuration:

**Standard Flow (7 steps):**
1. Get Started
2. Select EHR
3. Agreements
4. Connect
5. Subscribe
6. Create Account
7. Complete

---

### Step 0: Get Started

**Left panel text:** "Get Started"

#### Header

- **Badge:** "Takes about 5 minutes"
- **Title:** "Let's get you set up"
- **Subtitle:** "Tell us about your practice and we'll customize your dashboard."

#### Form Fields

| Field | Label | Required | Validation |
|-------|-------|----------|------------|
| Name | "Your name" | Yes | Non-empty |
| Email | "Email address" | Yes | Valid email format |
| Practice Name | "Practice name" | Yes | Non-empty |
| Phone | "Phone number" | Yes | Min 10 digits |
| Role | "Your role (optional)" | No | Dropdown selection |

#### Role Dropdown Options

- Practice Owner
- Clinical Director
- Practice Manager
- Office Manager
- Other

#### Call to Action

- **Button:** "Get Started →"

#### Sign In Link

- **Text:** "Already have an account? Sign in"

---

### Step 1: Select EHR

**Left panel text:** "Select Your EHR"

#### Header

- **Title:** "Which EHR does your practice use?"
- **Subtitle:** "We'll connect securely to pull your practice data."

#### Popular EHRs (Large Cards)

| EHR | Display Name |
|-----|--------------|
| SimplePractice | SimplePractice |
| TherapyNotes | TherapyNotes |
| Jane App | Jane App |

#### Other EHRs (Smaller Grid)

| EHR | Display Name |
|-----|--------------|
| TheraNest | TheraNest |
| Practice Fusion | Practice Fusion |
| Kareo | Kareo |
| DrChrono | DrChrono |
| athenahealth | athenahealth |

#### Trust Badges

- "HIPAA Compliant" (with shield icon)
- "Read-only access" (with eye icon)

#### Missing EHR Link

- **Text:** "Don't see your EHR? Let us know"

#### Call to Action

- **Button:** "Continue →"

---

### Step 2: Legal Agreements

**Left panel text:** "Agreements"

#### Header

- **Title:** "Review and accept"
- **Subtitle:** "We take security seriously. Please review our agreements."

#### Checkboxes

| Agreement | Description | View Link |
|-----------|-------------|-----------|
| Terms of Service | "Standard platform usage terms" | "View" |
| Business Associate Agreement | "HIPAA-required for handling your data" | "View" |

Both must be checked to continue.

#### Call to Action

- **Button:** "Continue →" (disabled until both checked)

---

### Step 3: Connect EHR

**Left panel text:** "Connect"

#### Header

- **Title:** "Connect {EHR Name}"
- **Subtitle:** "Create a Biller account in your EHR using these details"

#### Copy Fields

| Field | Label | Value |
|-------|-------|-------|
| First Name | "First Name" | "Cortexa" |
| Last Name | "Last Name" | "Biller" |
| Email | "Email" | "{practicename}@usecortexa.com" |

Each field has a "Copy" button that shows checkmark when copied.

#### Instructions Box

**Title:** "How to add in {EHR Name}:"

**Steps:**
1. Go to Settings → Team Members
2. Click "Add Team Member" or "Invite"
3. Select "Biller" as the role
4. Paste the details above
5. Leave all permissions unchecked

#### Primary Button

- **Text:** "Go to {EHR Name} ↗"
- Opens EHR in new tab

#### Secondary Link

- **Text:** "Open copy helper"
- Opens Picture-in-Picture widget

#### Help Section

- **Link 1:** "Book a call" → Calendly link
- **Link 2:** "Watch video" → Loom tutorial

#### After Visiting EHR

UI changes to show:
- **Title:** "Working in {EHR Name}?"
- **Subtitle:** "Add the biller account, then come back"
- **Button:** "I've Added the Biller"

---

### Step 3.5: Picture-in-Picture Copy Helper

A floating widget that stays visible while user works in their EHR.

#### Header

- **Title:** "Cortexa"
- **Close button:** X icon

#### Content

- **Title:** "Copy these into {EHR}"
- Same three copy fields as main screen
- Progress dots showing completion (e.g., "● ● ○ 2/3 copied")

#### Completion Button

- **Text:** "I've Added the Biller"

#### Footer Tips

- "Select 'Biller' as role"
- "No permissions needed"

---

### Step 4: Subscribe

**Left panel text:** "Subscribe"

#### Connection Success Banner

- **Icon:** Green checkmark
- **Title:** "You're connected!"
- **Subtitle:** "{EHR Name} is linked to {Practice Name}"

#### Pricing Card

**Monthly Plan:**
- **Price:** "$199/month"
- **Description:** "Everything you need to understand your practice"

**Features list:**
- ✓ Full dashboard access
- ✓ All clinician analytics
- ✓ Client retention tracking
- ✓ Revenue & session insights
- ✓ Daily data refresh from {EHR}

#### Money-Back Guarantee Badge

- **Icon:** Shield
- **Title:** "30-Day Money-Back Guarantee"
- **Description:** "Not what you expected? Full refund, no questions asked."

#### Call to Action

- **Button:** "🔒 Subscribe & Continue"

#### Trust Elements

- "🔒 Secure payment"
- "💳 Cancel anytime"

#### Alternative Action

- **Link:** "Questions? Book a quick call"

---

### Step 5: Create Account

**Left panel text:** "Create Account"

#### Header

- **Badge:** "✓ Final step"
- **Title:** "You're almost there!"
- **Subtitle:** "Create your login to access your practice dashboard."

#### Email Display

- **Label:** "Account email"
- **Value:** User's email (read-only)

#### Primary Option

- **Button:** "Continue with Google" (Google icon)

#### Divider

- **Text:** "or"

#### Secondary Option

- **Button:** "Create a password instead"

#### Password Form (if selected)

| Field | Validation |
|-------|------------|
| Password | Min 8 characters |
| Confirm Password | Must match |

---

### Step 6: Complete

**Left panel text:** "Complete"

#### Loading State

- **Spinner animation**
- **Title:** "Connecting to your EHR..."
- **Subtitle:** "This usually takes less than a minute."
- **Progress bar:** Animated fill from 0-100%

#### Status Messages (change as progress increases)

| Progress | Message |
|----------|---------|
| 0-59% | "Connecting to your EHR..." |
| 60-99% | "Syncing practice data..." |
| 100% | "All set!" |

#### Completion State

- **Icon:** Green checkmark
- **Title:** "Welcome, {Practice Name}!"
- **Subtitle:** "Your practice dashboard is ready."
- **Button:** "Go to Dashboard →"

#### Testimonial

- **Quote:** "I finally know what's happening in my practice without digging through spreadsheets."
- **Attribution:** "— Practice Owner, Brooklyn"

---

## 4. Dashboard - Overview Tab

### Screen: Dashboard Overview

**URL:** `/dashboard` or `/dashboard?tab=summary`

The primary landing page showing practice health at a glance.

---

### 4.1 Page Header

#### Label (small text above title)

- **Text:** "PRACTICE OVERVIEW"

#### Title

- **Live mode:** Current month name and year (e.g., "December 2024")
- **Historical mode:** Selected month name and year

#### View Mode Toggle

Three-option toggle in header:

| Option | Description |
|--------|-------------|
| Live | Current month in progress |
| Historical | View past months |

- Active option has white background
- Inactive options are semi-transparent

#### Month Picker (Historical mode only)

Dropdown showing:
- **Trigger:** Calendar icon + "December 2024" + chevron
- **Dropdown:** Year selector with arrows, 3x4 month grid
- **Quick actions:** "Current Month" and "Last Month" buttons
- **Disabled:** Future months are greyed out

---

### 4.2 Key Metrics Section

#### Section Header

- **Title:** "Key Metrics"
- No accent line

#### Layout

Horizontally scrollable row of 5 metric cards. Cards extend past screen edge to indicate scrollability.

---

### 4.3 Metric Card 1: Revenue

#### Card Header

- **Label:** "REVENUE"
- **Tooltip icon:** (i)

#### Tooltip Content

- **Title:** "Revenue"
- **Description:** "Total payments collected for the selected time period toward your monthly revenue goal."

#### Main Value

- **Format:** Currency with K suffix (e.g., "$153.4k")

#### Subtext

**If below goal:**
- "Goal: $160k · $6.6k left to reach target"

**If at/above goal:**
- "Goal: $160k · Target achieved!"

#### Status Indicator

| Condition | Status | Label |
|-----------|--------|-------|
| ≥95% of pro-rated goal | Healthy | "On Track" (green dot) |
| 80-94% of pro-rated goal | Needs attention | "Monitor" (amber dot) |
| <80% of pro-rated goal | Critical | "Action Needed" (red dot) |

#### Expand Button

- **Desktop text:** "Weekly Breakdown"
- **Mobile text:** "Weekly"

#### Expanded Content: Weekly Revenue Chart

Horizontal bar chart showing 4 weeks:

| Week | Example Value |
|------|---------------|
| Oct 28 – Nov 3 | $38.2k |
| Nov 4 – Nov 10 | $41.5k |
| Nov 11 – Nov 17 | $36.8k |
| Nov 18 – Nov 24 | $36.9k |

**Footer:** "$153.4k total this month"

---

### 4.4 Metric Card 2: Sessions

#### Card Header

- **Label:** "SESSIONS"
- **Tooltip icon:** (i)

#### Tooltip Content

- **Title:** "Completed Sessions"
- **Description:** "Number of sessions completed for the selected time period. Session Goal % shows completed sessions as a percentage of your session goal."

#### Main Value

- **Format:** Number with "completed" label (e.g., "698 completed")

#### Subtext

- "Goal: 475 · 147% of monthly goal"

#### Status Indicator

| Condition | Status | Label |
|-----------|--------|-------|
| ≥95% of pro-rated goal | Healthy | "On Track" |
| 80-94% of pro-rated goal | Needs attention | "Monitor" |
| <80% of pro-rated goal | Critical | "Action Needed" |

#### Expand Button

- **Desktop text:** "Upcoming Bookings"
- **Mobile text:** "Bookings"

#### Expanded Content: Booking Forecast

Horizontal bar chart showing next 4 weeks:

| Week | Example Value |
|------|---------------|
| Week of Nov 25 | 42 sessions |
| Week of Dec 2 | 38 sessions |
| Week of Dec 9 | 29 sessions |
| Week of Dec 16 | 18 sessions |

**Footer:** "127 sessions booked ahead"

---

### 4.5 Metric Card 3: Clients

#### Card Header

- **Label:** "CLIENTS"
- **Tooltip icon:** (i)

#### Tooltip Content

- **Title:** "Active Clients"
- **Description:** "Clients with active status (not discharged). Client Openings shows capacity for new clients."

#### Main Value

- **Format:** Number with "active" label (e.g., "156 active")

#### Subtext

- "18 Client Openings Available"

#### Status Indicator

| Condition | Status | Label |
|-----------|--------|-------|
| Net growth ≥ 0 | Healthy | "On Track" |
| Net growth -1 to -3 | Needs attention | "Monitor" |
| Net growth < -3 | Critical | "Action Needed" |

#### Expand Button

- **Desktop text:** "Client Details"
- **Mobile text:** "Details"

#### Expanded Content: Client Growth

- **Line 1:** "↗ 17 New Clients This Month" (green arrow)
- **Line 2:** "↘ 5 Clients Churned This Month" (red arrow)
- **Divider**
- **Summary:** "+12 net client growth this month" (green if positive, red if negative)

---

### 4.6 Metric Card 4: Attendance

#### Card Header

- **Label:** "ATTENDANCE"
- **Tooltip icon:** (i)

#### Tooltip Content

- **Title:** "Rebook Rate"
- **Description:** "Percentage of active clients who have their next appointment scheduled. A leading indicator of retention."

#### Main Value

- **Format:** Percentage with "rebook rate" label (e.g., "83% rebook rate")

#### Subtext

- "24% client cancel rate"

#### Status Indicator

| Condition | Status | Label |
|-----------|--------|-------|
| ≥ rebook rate goal | Healthy | "On Track" |
| Within 5% of goal | Needs attention | "Monitor" |
| >5% below goal | Critical | "Action Needed" |

#### Action Button

- **Desktop text:** "By Clinician"
- **Mobile text:** "Clinicians"
- **Navigates to:** `/clinician-overview?tab=ranking&metric=attendance`

---

### 4.7 Metric Card 5: Outstanding Notes

#### Card Header

- **Label:** "OUTSTANDING NOTES"
- **Tooltip icon:** (i)

#### Tooltip Content

- **Title:** "Outstanding Notes"
- **Description:** "Total notes that need to be completed. Includes overdue notes (past deadline) and notes due soon (within 48 hours)."

#### Main Value

- **Format:** Number with "notes to complete" label (e.g., "12 notes to complete")

#### Subtext

- "4 overdue · 8 due soon"

#### Status Indicator

| Condition | Status | Label |
|-----------|--------|-------|
| ≤10 notes | Healthy | "On Track" |
| 11-25 notes | Needs attention | "Monitor" |
| >25 notes | Critical | "Action Needed" |

#### Action Button

- **Desktop text:** "By Clinician"
- **Mobile text:** "Clinicians"
- **Navigates to:** `/clinician-overview?tab=ranking&metric=documentation`

---

### 4.8 Priority Tasks Section

#### Section Header

- **Title:** "Priority Tasks"
- **Description:** "{N} items" (e.g., "5 items")
- **Navigation controls:** Progress bar + left/right arrows

#### Layout

Horizontally scrollable carousel of actionable insight cards. First card is the Monthly Review, followed by AI-generated priority cards.

---

### 4.9 Monthly Review Card (First Card)

A "Spotify Wrapped" style monthly summary that opens into a fullscreen slideshow.

#### Card Preview

- Shows static preview image of the monthly review
- **Click/tap:** Opens fullscreen slideshow

#### Fullscreen Slideshow Navigation

- **Click left third of screen:** Previous slide
- **Click right two-thirds:** Next slide
- **Keyboard:** Left/Right arrows
- **Escape:** Close slideshow
- **Auto-advance:** Every 8 seconds

#### Progress Indicator

Story-style progress bars at top showing:
- Completed slides: Fully filled
- Current slide: Animated fill
- Upcoming slides: Empty

---

#### Slide 1: Intro

- **Background:** Stone/dark gradient
- **Title:** "{Month} {Year}" (e.g., "November 2024")
- **Subtitle:** "Your Month in Review"

---

#### Slide 2: Revenue

- **Background:** Emerald gradient
- **Title:** "Revenue"
- **Main stat:** Total revenue (e.g., "$153,400")
- **Comparison:** "vs. $160k goal"
- **Secondary stat:** Month-over-month change (e.g., "+12% from October")

---

#### Slide 3: Sessions

- **Background:** Blue/indigo gradient
- **Title:** "Sessions Completed"
- **Main stat:** Total sessions (e.g., "698")
- **Comparison:** "147% of goal"

---

#### Slide 4: New Clients

- **Background:** Cyan gradient
- **Title:** "New Clients"
- **Main stat:** Count (e.g., "17")
- **Highlight:** "Top acquirer: {Clinician Name}"

---

#### Slide 5: Retention

- **Background:** Rose gradient
- **Title:** "Client Retention"
- **Main stat:** Churned count (e.g., "5 clients churned")
- **Secondary stat:** "Net growth: +12"

---

#### Slide 6: Attendance

- **Background:** Amber gradient
- **Title:** "Attendance"
- **Stats:**
  - Show rate: 92%
  - Rebook rate: 83%
  - Cancel rate: 24%

---

#### Slide 7: MVP (Top Performer)

- **Background:** Violet gradient
- **Title:** "MVP of the Month"
- **Clinician name:** Large display
- **Stats:** Revenue, sessions, new clients

---

#### Slide 8: Team Breakdown

- **Background:** Slate gradient
- **Title:** "Team Performance"
- **Content:** Leaderboard showing each clinician's key metrics

---

#### Slide 9: Heads Up (Conditional)

- **Background:** Red gradient
- **Title:** "Heads Up"
- **Content:** Warning about concerning trend
- **Only shown if:** There's a significant issue to flag

---

#### Slide 10: Compliance

- **Background:** Indigo gradient
- **Title:** "Documentation"
- **Main stat:** Notes overdue percentage
- **Secondary:** Count of overdue notes

---

#### Slide 11: Looking Ahead

- **Background:** Teal gradient
- **Title:** "Looking Ahead"
- **Stats:**
  - Capacity utilization
  - Open slots this week
  - Clients needing rebooking

---

#### Slide 12: Closing

- **Background:** Amber gradient
- **Title:** "Great work, {Practice Name}!"
- **Subtitle:** Encouraging message based on performance

---

### 4.10 Priority Alert Cards

Dark-themed cards with AI-generated insights and recommended actions.

#### Card Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  [STATUS BADGE]                         │
│                                         │
│  Card Title                             │
│  (Second line if needed)                │
│                                         │
│  AI-generated guidance text explaining  │
│  the situation and what it means for    │
│  the practice...                        │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │ Val │  │ Val │  │ Val │             │
│  │Label│  │Label│  │Label│             │
│  └─────┘  └─────┘  └─────┘             │
│                                         │
│  ─────────────────────────────────────  │
│  Comparison text         [Action →]     │
│                                         │
└─────────────────────────────────────────┘
```

#### Status Badges

| Status | Badge Text | Badge Color |
|--------|------------|-------------|
| Critical | "CRITICAL" | Red |
| Warning | "ATTENTION" | Amber |
| Good | "OPPORTUNITY" | Green |
| Insight | "INSIGHT" | Blue |

---

### 4.11 Complete Priority Cards Reference (32 Cards)

#### CRITICAL Cards (4)

---

**Card: Early Engagement Warning**

| Element | Content |
|---------|---------|
| Status Badge | CRITICAL |
| Title | "Early Engagement Warning" |
| AI Guidance | "Priya P has lost 3 of their last 5 new clients before session 3. That's a 60% early drop-off rate — your practice average is 15%. This pattern suggests intake or early engagement issues worth investigating." |
| Stat 1 | "5" / "new clients" |
| Stat 2 | "3" / "lost" (red) |
| Stat 3 | "60%" / "drop-off" (red) |
| Comparison | "Practice average: 15%" |
| Action Button | "Review Intake Process" |

---

**Card: Burnout Signal**

| Element | Content |
|---------|---------|
| Status Badge | CRITICAL |
| Title | "Burnout Signal" |
| AI Guidance | "Maria R's patterns have changed significantly this month. Cancellations are up 4x, and she's had 3 same-day schedule changes. These combined signals often indicate burnout. A supportive check-in is recommended." |
| Stat 1 | "4x" / "increase" (red) |
| Stat 2 | "3" / "this month" (amber) |
| Stat 3 | "1" / "baseline" |
| Comparison | "Baseline: 1 cancellation/month" |
| Action Button | "Schedule Check-in" |

---

**Card: Outstanding Balances**

| Element | Content |
|---------|---------|
| Status Badge | CRITICAL |
| Title | "Outstanding Balances" |
| AI Guidance | "You have $2,450 in outstanding balances across 4 clients. Jennifer M has the longest outstanding at 12 days ($650). Best practice is to follow up within 7 days." |
| Stat 1 | "$2.4k" / "outstanding" (red) |
| Stat 2 | "4" / "clients" |
| Stat 3 | "12d" / "oldest" (amber) |
| Comparison | "Best practice: <7 days" |
| Action Button | "Send Reminders" |

---

**Card: Notes Due Soon**

| Element | Content |
|---------|---------|
| Status Badge | CRITICAL |
| Title | "Notes Due Soon" |
| AI Guidance | "8 session notes are due within 3 days for insurance billing. Sarah C has the most with 4 notes. Late notes delay reimbursement and create audit risk." |
| Stat 1 | "8" / "notes" (red) |
| Stat 2 | "3d" / "deadline" (amber) |
| Stat 3 | "Sarah C" / "most (4)" |
| Comparison | "Billing deadline: 7 days" |
| Action Button | "View Outstanding Notes" |

---

#### ATTENTION Cards (14)

---

**Card: Clients Need Rebooking**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Clients Need Rebooking" |
| AI Guidance | "6 clients finished sessions recently with nothing scheduled. 2 are high risk (14+ days). Your average rebook time is 2 days — these clients are overdue." |
| Stat 1 | "6" / "clients" (amber) |
| Stat 2 | "2" / "high risk" (red) |
| Stat 3 | "2d" / "typical" |
| Comparison | "Your average rebook time: 2 days" |
| Action Button | "View Clients" |

---

**Card: First Session Drop-off**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "First Session Drop-off" |
| AI Guidance | "28% of new clients this month didn't return after their first session. That's 4 potential long-term clients lost. Industry benchmark is 85% return rate. Review your intake experience." |
| Stat 1 | "28%" / "drop-off" (amber) |
| Stat 2 | "4" / "clients" |
| Stat 3 | "85%" / "typical" (green) |
| Comparison | "Industry benchmark: 85% return" |
| Action Button | "Review Intake Process" |

---

**Card: Cancellation Spike**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Cancellation Spike" |
| AI Guidance | "Maria R had 9 cancellations this month — that's 4x their usual rate of 2. The practice average is 3 cancellations per clinician. Worth a conversation." |
| Stat 1 | "9" / "this month" (amber) |
| Stat 2 | "2" / "typical" |
| Stat 3 | "4x" / "increase" (red) |
| Comparison | "Practice average: 3/month" |
| Action Button | "Explore Data" |

---

**Card: Revenue Behind Pace**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Revenue Behind Pace" |
| AI Guidance | "You're $18k behind pace to hit your $100k goal. With 12 days left, you need $1.5k/day to catch up. That's 4 more sessions than your current daily average." |
| Stat 1 | "$62k" / "current" |
| Stat 2 | "$100k" / "goal" (amber) |
| Stat 3 | "$18k" / "behind" (red) |
| Comparison | "12 days left in month" |
| Action Button | "View Revenue Details" |

---

**Card: Sessions Behind Pace**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Sessions Behind Pace" |
| AI Guidance | "You've completed 312 sessions with 10 days left. To hit your 475 goal, you need 163 more — that's 16/day vs your current pace of 12/day." |
| Stat 1 | "312" / "sessions" |
| Stat 2 | "475" / "goal" (amber) |
| Stat 3 | "163" / "to go" (red) |
| Comparison | "10 days left in month" |
| Action Button | "View Sessions Details" |

---

**Card: Caseload Imbalance**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Caseload Imbalance" |
| AI Guidance | "Sarah C is at 95% capacity while Michael J is at 38%. Consider rebalancing referrals. Sarah C may be at burnout risk; Michael J has room for 12 more clients." |
| Stat 1 | "95%" / "Sarah C" (red) |
| Stat 2 | "38%" / "Michael J" (amber) |
| Stat 3 | "57%" / "gap" |
| Comparison | "Michael J has 12 openings" |
| Action Button | "Rebalance Referrals" |

---

**Card: Higher Than Usual Churn**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Higher Than Usual Churn" |
| AI Guidance | "You lost 8 clients this month — that's 2x your usual rate of 4/month. Net growth is -3. Review the retention tab to understand patterns." |
| Stat 1 | "8" / "clients" (red) |
| Stat 2 | "4" / "typical" |
| Stat 3 | "-3" / "net" (red) |
| Comparison | "2x your usual churn rate" |
| Action Button | "View Retention Details" |

---

**Card: Rebook Rate Trending Down**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Rebook Rate Trending Down" |
| AI Guidance | "Your rebook rate has dropped from 88% to 79% over the last 3 months. That's 9 percentage points. Clients without next appointments are at risk of churning." |
| Stat 1 | "79%" / "current" (amber) |
| Stat 2 | "88%" / "3mo ago" |
| Stat 3 | "↓9" / "points" (red) |
| Comparison | "Goal: 85% rebook rate" |
| Action Button | "View At-Risk Clients" |

---

**Card: Clinician Needs Support**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Clinician Needs Support" |
| AI Guidance | "Michael J is 35% below team average on completed sessions. Their 42 sessions compares to the team average of 65. Consider a supportive check-in or coaching session." |
| Stat 1 | "42" / "sessions" (amber) |
| Stat 2 | "65" / "avg" |
| Stat 3 | "35%" / "below" (red) |
| Comparison | "Team average: 65 sessions" |
| Action Button | "Schedule Coaching" |

---

**Card: Long-Term Client at Risk**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Long-Term Client at Risk" |
| AI Guidance | "Sarah J has been with the practice for 14 months and completed 48 sessions, but hasn't scheduled in 18 days. This is a high-value relationship worth protecting. Reach out personally." |
| Stat 1 | "14mo" / "tenure" |
| Stat 2 | "48" / "sessions" (green) |
| Stat 3 | "18d" / "no appt" (red) |
| Comparison | "High-value: 12+ sessions" |
| Action Button | "Reach Out" |

---

**Card: Session Frequency Dropping**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Session Frequency Dropping" |
| AI Guidance | "David L has gone from weekly sessions to bi-weekly over the last 4 weeks. Frequency drops often precede churn. Their clinician (Sarah C) should check in about treatment goals." |
| Stat 1 | "Weekly" / "was" |
| Stat 2 | "Bi-weekly" / "now" (amber) |
| Stat 3 | "4wk" / "trend" (red) |
| Comparison | "Established client (10+ sessions)" |
| Action Button | "Notify Clinician" |

---

**Card: No-Show Spike**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "No-Show Spike" |
| AI Guidance | "Maria R had 6 no-shows this month — that's 3x their usual rate. No-shows can't be backfilled and often signal client disengagement. Review their caseload for patterns." |
| Stat 1 | "6" / "no-shows" (amber) |
| Stat 2 | "2" / "typical" |
| Stat 3 | "~$900" / "lost" (red) |
| Comparison | "3x baseline rate" |
| Action Button | "Review Clients" |

---

**Card: Client Quality Declining**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Client Quality Declining" |
| AI Guidance | "Clients acquired this year have generated $1,200 on average — that's 25% less than last year's clients at this point ($1,600). Your newer clients aren't as engaged or staying as long." |
| Stat 1 | "$1.2k" / "2025 LTV" (amber) |
| Stat 2 | "$1.6k" / "2024 LTV" |
| Stat 3 | "25%" / "lower" (red) |
| Comparison | "Same point in prior year" |
| Action Button | "View LTV Analysis" |

---

**Card: Margin Dropped**

| Element | Content |
|---------|---------|
| Status Badge | ATTENTION |
| Title | "Margin Dropped" |
| AI Guidance | "Your net margin dropped to 18% — down from 24% average. You're keeping $6k less per $100k in revenue. Review your cost structure." |
| Stat 1 | "18%" / "current" (amber) |
| Stat 2 | "24%" / "avg" |
| Stat 3 | "-$6k" / "per $100k" (red) |
| Comparison | "vs 3-month average" |
| Action Button | "View Financials" |

---

#### OPPORTUNITY Cards (7)

---

**Card: Open Slots This Week**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Open Slots This Week" |
| AI Guidance | "You have 34 open slots this week across 5 clinicians. Michael J has the most availability with 12 slots. Great time to activate your waitlist or increase marketing." |
| Stat 1 | "34" / "slots" (green) |
| Stat 2 | "5" / "clinicians" |
| Stat 3 | "Michael J" / "most (12)" |
| Comparison | "Utilization: 72%" |
| Action Button | "Activate Waitlist" |

---

**Card: Caseload Openings**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Caseload Openings" |
| AI Guidance | "Your team can take on 28 new clients. Michael J has the most room with 12 openings. Route new consultations to clinicians with capacity." |
| Stat 1 | "28" / "openings" (green) |
| Stat 2 | "Michael J" / "most (12)" |
| Stat 3 | "72%" / "filled" |
| Comparison | "Team capacity: 72% filled" |
| Action Button | "Route New Clients" |

---

**Card: Ahead of Goal**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Ahead of Goal" |
| AI Guidance | "You're 12% ahead of your revenue goal! At this pace, you'll hit $112k by month end — $12k above target. Keep the momentum going." |
| Stat 1 | "$112k" / "projected" (green) |
| Stat 2 | "$100k" / "goal" |
| Stat 3 | "+$12k" / "ahead" (green) |
| Comparison | "12% ahead of pace" |
| Action Button | "View Details" |

---

**Card: Strong Client Acquisition**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Strong Client Acquisition" |
| AI Guidance | "You've added 12 new clients this month — your best in 6 months! Sarah C brought in 4. Your client base is growing faster than usual." |
| Stat 1 | "12" / "clients" (green) |
| Stat 2 | "7" / "avg" |
| Stat 3 | "Sarah C" / "top (4)" |
| Comparison | "Best in 6 months" |
| Action Button | "View Client Details" |

---

**Card: Top Performer**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Top Performer" |
| AI Guidance | "Sarah C led the team in revenue this month with $32k. That's 28% above the team average. Consider recognition or sharing their approach with the team." |
| Stat 1 | "$32k" / "Sarah C" (green) |
| Stat 2 | "$25k" / "avg" |
| Stat 3 | "+28%" / "above" (green) |
| Comparison | "28% above team average" |
| Action Button | "View Team Rankings" |

---

**Card: Most Improved**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Most Improved" |
| AI Guidance | "James K improved their completed sessions by 35% this month — from 48 to 65. Great momentum worth acknowledging." |
| Stat 1 | "+35%" / "improved" (green) |
| Stat 2 | "65" / "sessions" |
| Stat 3 | "48" / "last month" |
| Comparison | "Month-over-month improvement" |
| Action Button | "View Performance" |

---

**Card: Exceptional Retention**

| Element | Content |
|---------|---------|
| Status Badge | OPPORTUNITY |
| Title | "Exceptional Retention" |
| AI Guidance | "Sarah C has maintained 94% client retention over the last 6 months. Only 2 of their 32 clients churned. Their approach is worth studying." |
| Stat 1 | "94%" / "retention" (green) |
| Stat 2 | "30" / "retained" |
| Stat 3 | "2" / "churned" |
| Comparison | "Over last 6 months" |
| Action Button | "View Retention Details" |

---

#### INSIGHT Cards (7)

---

**Card: Where Clients Leave**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Where Clients Leave" |
| AI Guidance | "68% of your churn happens in the first 5 sessions — that's 12 clients. This suggests onboarding or fit issues. Focus your retention efforts on the first 3 sessions." |
| Stat 1 | "68%" / "early (<5)" (blue) |
| Stat 2 | "22%" / "mid (5-15)" |
| Stat 3 | "10%" / "late (15+)" |
| Comparison | "Focus on first 3 sessions" |
| Action Button | "View Retention Details" |

---

**Card: Revenue Trending Down**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Revenue Trending Down" |
| AI Guidance | "Revenue has declined for 3 consecutive months — from $105k to $88k. That's a 16% drop. Worth investigating the cause." |
| Stat 1 | "$88k" / "current" (blue) |
| Stat 2 | "$105k" / "3mo ago" |
| Stat 3 | "↓16%" / "drop" (amber) |
| Comparison | "3 consecutive months" |
| Action Button | "View Revenue Details" |

---

**Card: Sessions Trending Down**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Sessions Trending Down" |
| AI Guidance | "Completed sessions have declined for 3 consecutive months — from 520 to 445. This affects both revenue and clinician utilization." |
| Stat 1 | "445" / "current" (blue) |
| Stat 2 | "520" / "3mo ago" |
| Stat 3 | "↓14%" / "drop" (amber) |
| Comparison | "3 consecutive months" |
| Action Button | "View Sessions Details" |

---

**Card: Revenue Concentration Risk**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Revenue Concentration Risk" |
| AI Guidance | "Sarah C generated 45% of your revenue this month ($42k). If they left or reduced hours, you'd lose nearly half your income. Consider diversifying your caseload distribution." |
| Stat 1 | "45%" / "share" (amber) |
| Stat 2 | "$42k" / "Sarah C" |
| Stat 3 | "$93k" / "total" |
| Comparison | "Threshold: 40%" |
| Action Button | "View Team Distribution" |

---

**Card: Seasonal Pattern Ahead**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Seasonal Pattern Ahead" |
| AI Guidance | "Historically, January sees a 15% drop in bookings. Last year you had 390 sessions vs your 460 average. Plan your marketing and scheduling accordingly." |
| Stat 1 | "↓15%" / "typical" (blue) |
| Stat 2 | "390" / "sessions" |
| Stat 3 | "460" / "avg" |
| Comparison | "January historically" |
| Action Button | "Plan Ahead" |

---

**Card: Slot Demand Insight**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Slot Demand Insight" |
| AI Guidance | "Evening slots fill 2.5x faster than morning slots. Consider expanding evening availability or offering incentives for morning bookings." |
| Stat 1 | "2.5x" / "evening" (green) |
| Stat 2 | "1x" / "morning" |
| Stat 3 | "18" / "slots" |
| Comparison | "Fill rate comparison" |
| Action Button | "View Calendar" |

---

**Card: Weekly Snapshot**

| Element | Content |
|---------|---------|
| Status Badge | INSIGHT |
| Title | "Week of Dec 2" |
| AI Guidance | "This week: 85 sessions booked, 22 slots open, 4 clients need rebooking. Following up on outstanding balances is your top priority." |
| Stat 1 | "85" / "sessions" (blue) |
| Stat 2 | "22" / "slots" |
| Stat 3 | "4" / "rebook" (amber) |
| Comparison | "Top priority for the week" |
| Action Button | "View Week" |

---

### 4.12 Dashboard Demo Card Order

The default dashboard shows these 5 priority cards (plus Monthly Review):

1. Early Engagement Warning
2. Cancellation Spike
3. Outstanding Balances
4. Open Slots This Week
5. Where Clients Leave (Churn Pattern)

---

### 4.13 Practice Goals

Goals that affect metric status calculations:

| Goal | Default Value | Configurable In |
|------|---------------|-----------------|
| Monthly Revenue | $100,000 | Settings |
| Monthly Sessions | 475 | Settings |
| Target Rebook Rate | 85% | Settings |

**Pro-rating:** For the current month, goals are pro-rated based on days elapsed. E.g., on day 15 of a 30-day month, the pro-rated revenue goal is $50,000.

---

## 5. Dashboard - Compare Tab

### Screen: Compare Performance

**URL:** `/dashboard?tab=compare`

**Purpose:** Allows practice owners to compare performance metrics across different segments of their practice - by location, supervisor, or license type.

**Access:** Click "Compare" tab in Dashboard header

---

### 5.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VIOLET HEADER (with grid pattern)                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ PRACTICE COMPARISON                                                 ││
│  │ Compare Performance                    [Last 12 Mo][Live][Historical]││
│  │ Jan 2024 – Dec 2024                              [Month Picker]     ││
│  │                                                                     ││
│  │ COMPARE BY                                                          ││
│  │ [📍 Location] [👥 Supervisor] [🎓 License Type]                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  By Location                                                             │
│  3 locations compared                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Metric     │ Revenue │Sessions│Wkly Avg│Goal %│Clients│Churn│Cancel││
│  ├────────────┼─────────┼────────┼────────┼──────┼───────┼─────┼──────┤│
│  │ ● Durham   │  $142K  │ 1,245  │   24   │ 112% │   89  │  8% │  12% ││
│  │ ● Chapel H │   $98K  │   876  │   17   │  87% │   62  │ 11% │  15% ││
│  │ ● Remote   │   $45K  │   412  │    8   │  65% │   31  │ 14% │  18% ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Page Header

#### Label (small uppercase text)

- **Text:** "PRACTICE COMPARISON"
- **Color:** Violet at 80% opacity

#### Title

- **Text:** "Compare Performance"
- **Font:** DM Serif Display

#### Subtitle (date range)

Changes based on view mode:

| View Mode | Subtitle Format | Example |
|-----------|-----------------|---------|
| Last 12 Months | "{Start Month} {Year} – {End Month} {Year}" | "Jan 2024 – Dec 2024" |
| Live | "{Full Month Name} {Year}" | "December 2024" |
| Historical | "{Full Month Name} {Year}" | "November 2024" |

#### Header Accent

- **Color:** Violet (purple)
- **Background:** Dark gradient with grid pattern overlay

---

### 5.3 View Mode Toggle

Located in the header actions area.

#### Toggle Options

| Button Text | View Mode | Data Shown |
|-------------|-----------|------------|
| "Last 12 Months" | Aggregate | Rolling 12-month totals and averages |
| "Live" | Point-in-time | Current month data |
| "Historical" | Point-in-time | Selected past month data |

#### Visual States

- **Active:** White background, dark text, shadow
- **Inactive:** Transparent, white text at 70% opacity
- **Hover (inactive):** White text, subtle white background at 10%

#### Default Selection

"Last 12 Months" is selected by default when entering Compare tab.

---

### 5.4 Month Picker

**Visible when:** View mode is "Historical"

**Behavior:** Auto-opens when switching to Historical mode

Same component as Dashboard Overview month picker (see section 4.1).

---

### 5.5 Dimension Selector

Located below the title in the header area.

#### Section Label

- **Text:** "COMPARE BY"
- **Style:** Uppercase, letter-spacing wide, stone-300 color

#### Segmented Control Options

| Option | Icon | Label | Description |
|--------|------|-------|-------------|
| Location | 📍 Map pin | "Location" | Compare metrics by office location |
| Supervisor | 👥 Users | "Supervisor" | Compare metrics by supervising clinician's team |
| License Type | 🎓 Graduation cap | "License Type" | Compare metrics by clinician credential |

#### Availability Logic

Each dimension only appears if the practice has multiple values:

| Dimension | Available When |
|-----------|---------------|
| Location | Practice has clinicians in 2+ locations |
| Supervisor | Practice has at least 1 supervisor defined |
| License Type | Practice has clinicians with 2+ credential types |

#### Visual States

- **Selected:** White/light background, dark text
- **Unselected:** Transparent, lighter text
- **Hover:** Subtle background change

---

### 5.6 Comparison Table Card

#### Card Header

- **Title:** "By {Dimension}"
  - "By Location"
  - "By Supervisor"
  - "By License Type"

- **Subtitle:** "{N} {item type} compared"
  - "3 locations compared"
  - "2 teams compared"
  - "4 license types compared"

#### Table First Column Header

- **Text:** "Metric"
- **Style:** Uppercase, bold, stone-600

---

### 5.7 Table Columns - Last 12 Months View (Aggregate)

When "Last 12 Months" is selected, shows aggregate metrics:

| # | Column Header | Tooltip Text | Data Format |
|---|---------------|--------------|-------------|
| 1 | "Revenue" | "Total revenue collected before any deductions." | "$142K" |
| 2 | "Sessions" | "Total number of sessions completed during this time period." | "1,245" |
| 3 | "Wkly Avg" | "Average number of sessions completed per week during this time period." | "24" |
| 4 | "Goal %" | "Percentage of session goal achieved. Completed sessions ÷ session goal." | "112%" |
| 5 | "Clients" | "Number of unique clients who had at least one session during this time period." | "89" |
| 6 | "Churn" | "Percentage of clients who churned (stopped coming). Lower is better." | "8%" |
| 7 | "Cancel" | "Percentage of booked sessions that were canceled. Lower is better." | "12%" |
| 8 | "Notes" | "Number of sessions with overdue notes. Lower is better." | "3" |

---

### 5.8 Table Columns - Live/Historical View (Point-in-Time)

When "Live" or "Historical" is selected, shows monthly snapshot:

| # | Column Header | Tooltip Text | Data Format |
|---|---------------|--------------|-------------|
| 1 | "Revenue" | "Total revenue collected before any deductions." | "$28K" |
| 2 | "Sessions" | "Total number of sessions completed during this month." | "98" |
| 3 | "Active" | "Number of clients currently active (had a session in last 30 days)." | "32" |
| 4 | "Capacity" | "How full is the caseload? Active clients ÷ client goal. Lower means more room for new clients." | "85%" |
| 5 | "Churn" | "Percentage of clients who churned (stopped coming). Lower is better." | "6%" |
| 6 | "Cancel" | "Percentage of booked sessions that were canceled. Lower is better." | "15%" |
| 7 | "Notes" | "Number of sessions with overdue notes. Lower is better." | "1" |

---

### 5.9 Column Tooltips

Each column header has an info icon (i) that shows a tooltip on hover.

#### Tooltip Behavior

- **Trigger:** Hover over info icon
- **Position:** Below the header, centered
- **Auto-reposition:** Moves if would overflow viewport

#### Tooltip Visual

- **Background:** Stone-900 (dark)
- **Text:** White, 14px
- **Padding:** 12px horizontal, 12px vertical
- **Border radius:** 12px (rounded-xl)
- **Shadow:** Large shadow
- **Max width:** 288px (w-72)

---

### 5.10 Table Row Indicators

Each row has a colored dot to help visually distinguish rows.

#### Color Sequence

| Row # | Color | Hex Code |
|-------|-------|----------|
| 1 | Purple | #a855f7 |
| 2 | Cyan | #06b6d4 |
| 3 | Amber | #f59e0b |
| 4 | Pink | #ec4899 |
| 5 | Emerald | #10b981 |
| 6 | Indigo | #6366f1 |
| 7+ | Repeats from Purple | — |

#### Dot Style

- **Size:** 10-12px (responsive)
- **Shape:** Circle
- **Glow:** Subtle colored shadow matching dot color

---

### 5.11 Example Dimension Values

#### By Location

Typical location values from practice data:

- Durham
- Chapel Hill
- Remote
- Raleigh
- Cary

#### By Supervisor

Shows supervisor name + "'s Team":

- Sarah's Team
- Maria's Team
- Priya's Team

**Note:** Only clinicians designated as supervisors appear here. Each supervisor's metrics include all clinicians they supervise.

#### By License Type (Credential)

Typical credential types:

- PhD (Doctor of Philosophy in Psychology)
- PsyD (Doctor of Psychology)
- LCSW (Licensed Clinical Social Worker)
- LPC (Licensed Professional Counselor)
- LMFT (Licensed Marriage and Family Therapist)
- LCMHC (Licensed Clinical Mental Health Counselor)

---

### 5.12 Mobile View

On mobile devices, the table transforms into stacked cards.

#### Mobile Card Structure

```
┌─────────────────────────────────┐
│ ● Durham                        │
├─────────────────────────────────┤
│ Revenue        Sessions         │
│ $142K          1,245           │
│                                 │
│ Wkly Avg       Goal %          │
│ 24             112%            │
│                                 │
│ Clients        Churn           │
│ 89             8%              │
│                                 │
│ Cancel         Notes           │
│ 12%            3               │
└─────────────────────────────────┘
```

- One card per row
- 2-column grid layout for metrics
- Same color dot indicator in card header

---

### 5.13 Empty State

**Shown when:** No comparison dimensions are available

This happens when:
- Practice has only 1 location
- No supervisors are defined
- All clinicians have the same credential type

#### Empty State Content

- **Title:** "No comparison data available"
- **Subtitle:** "Comparison requires multiple locations, supervisors, or credential types."
- **Visual:** Centered in content area with generous padding

---

### 5.14 Loading State

**Shown when:** Data is being fetched

- **Spinner:** Rotating loader icon (Loader2)
- **Text:** "Loading comparison data..."
- **Position:** Centered in content area

---

### 5.15 Error State

**Shown when:** API request fails

- **Title:** "Unable to load comparison data"
- **Subtitle:** Dynamic error message from API
- **Position:** Centered in content area

---

### 5.16 Data Refresh Behavior

- Data fetches when:
  - Tab is first opened
  - Dimension changes
  - View mode changes
  - Month changes (in Historical mode)

- No automatic refresh interval
- User must change a control or navigate away and back to refresh

---

## 6. Clinician Spotlight Page

### Screen: Clinician Spotlight (Ranking Tab)

**URL:** `/clinician-overview` or `/clinician-overview?tab=ranking`

**Deep Link:** `/clinician-overview?tab=ranking&metric={metricId}` (opens with specific metric selected)

**Purpose:** Rank and compare clinicians across 8 key performance metrics. Answers the question "How are my clinicians performing?"

**Access:** "Clinicians" in sidebar navigation

---

### 6.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AMBER HEADER (with grid pattern)                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ TEAM PERFORMANCE                                                    ││
│  │ Clinician Spotlight                   [Last 12 Mo][Live][Historical]││
│  │ Jan 2024 – Dec 2024                              [Month Picker]     ││
│  │                                                                     ││
│  │ SELECT METRIC TO RANK BY                  · Lower values rank higher││
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                ││
│  │ │ Revenue  │ │ Caseload │ │ Growth   │ │ Sessions │                ││
│  │ │ Who's    │ │ Who has  │ │ Who's    │ │ Who's    │                ││
│  │ │ gener... │ │ capac... │ │ bring... │ │ meet...  │                ││
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘                ││
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                ││
│  │ │Attendance│ │Engagement│ │Retention │ │ Notes    │                ││
│  │ │ Who has  │ │ Who's    │ │ Who's    │ │ Who      │                ││
│  │ │ most ... │ │ keep...  │ │ losing.. │ │ needs... │                ││
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘                ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Rank  Clinician         Revenue    Sessions   Avg $/Sess               │
│  ─────────────────────────────────────────────────────────────────────  │
│  ▀ 1   ● Sarah Chen      $142.5K     487        $185                    │
│        Clinical Director                                                 │
│                        ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                          │
│  ─ ⊚   Team Average      $101.3K     345        $168                    │
│        5 clinicians                                                      │
│                        ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                          │
│    2   ● Maria Rodriguez $128.0K     412        $172                    │
│    3   ● Priya Patel      $98.0K     342        $158                    │
│    4   ● James Kim        $86.0K     298        $165                    │
│  ▄ 5   ● Michael Johnson  $52.0K     186        $142                    │
│                                                                          │
│  ● Top performer  ● Needs attention                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Page Header

#### Label (small uppercase text)

- **Text:** "TEAM PERFORMANCE"
- **Color:** Amber at 80% opacity

#### Title

- **Text:** "Clinician Spotlight"
- **Font:** DM Serif Display

#### Subtitle (date range)

Same format as Compare Tab (see section 5.2).

#### Header Accent

- **Color:** Amber
- **Background:** Dark gradient with grid pattern overlay

---

### 6.3 View Mode Toggle

Located in the header actions area. Same as Compare Tab.

| Button Text | View Mode | Data Shown |
|-------------|-----------|------------|
| "Last 12 Months" | Aggregate | Rolling 12-month totals and averages |
| "Live" | Point-in-time | Current month data |
| "Historical" | Point-in-time | Selected past month data |

**Special Behavior by Metric:**
- **Notes:** Forces "Live" mode (point-in-time metric only)
- **Retention:** Defaults to "Last 12 Months" (historical metric)

---

### 6.4 Month Picker

**Visible when:** View mode is "Historical"

Same as Dashboard Overview (see section 4.1).

---

### 6.5 Metric Selector

Located below the header in the dark section.

#### Section Label

- **Text:** "Select metric to rank by"
- **Additional text (when applicable):** "· Lower values rank higher" (shown in amber for metrics where lower is better)

#### Metric Buttons

8 metric buttons displayed in a 2-row grid (4 per row on desktop, 2 per row on mobile).

| Metric ID | Label | Description Question |
|-----------|-------|---------------------|
| `revenue` | "Revenue" | "Who's generating the most revenue?" |
| `caseload` | "Caseload" | "Who has capacity for new clients?" |
| `growth` | "Growth" | "Who's bringing in new clients?" |
| `sessions` | "Sessions" | "Who's meeting session goals?" |
| `attendance` | "Attendance" | "Who has the most cancellations?" |
| `engagement` | "Engagement" | "Who's keeping clients engaged?" |
| `retention` | "Retention" | "Who's losing clients?" |
| `documentation` | "Notes" | "Who needs to catch up on notes?" |

#### Button States

- **Selected:** White background, dark text, amber accent bar at bottom, slight scale up
- **Unselected:** White/10 background, white/80 text
- **Hover:** White/20 background, white text

---

### 6.6 Metric Configurations

Each metric has a primary ranking column plus supporting columns for context.

---

#### Metric: Revenue

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "Gross Revenue" |
| Short Label | "Revenue" |
| Format | "$142.5K" (currency with K suffix) |
| Tooltip | "Total payments collected for the selected time period." |
| Higher is Better | Yes |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Completed Sessions" | "Completed" | "487" | "Number of sessions completed in the selected time period." |
| "Avg Revenue/Session" | "Avg $/Sess" | "$185" | "Average revenue collected per completed session." |

---

#### Metric: Caseload

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "Caseload Capacity" (or "Avg Caseload Capacity" for 12mo) |
| Short Label | "Caseload %" |
| Format | "93%" (percentage) |
| Tooltip | "Percentage of client capacity currently filled. Active Clients ÷ Client Goal." |
| Higher is Better | Yes |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Active Clients" (or "Avg Active Clients") | "Active" | "28" | "Clients with active status (not discharged)." |
| "Client Goal" | "Goal" | "30" | "Target number of active clients for this clinician." |

---

#### Metric: Growth

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "New Clients" |
| Short Label | "New Clients" |
| Format | "17" (number) |
| Tooltip | "Clients who had their first session during this time period." |
| Higher is Better | Yes |

**Supporting Columns:** None

---

#### Metric: Sessions

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "Session Goal %" (or "Avg Weekly Goal %"/"Avg Monthly Goal %") |
| Short Label | "Goal %" |
| Format | "108%" (percentage) |
| Tooltip | "Completed sessions as a percentage of session goal." |
| Higher is Better | Yes |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Completed Sessions" (or "Avg Weekly/Monthly Sessions") | "Sessions" | "487" or "24" | "Number of sessions completed in the selected time period." |
| "Session Goal" (or "Weekly/Monthly Goal") | "Goal" | "25" or "100" | "Target number of sessions for this clinician." |

**Additional Control - Sessions View Toggle:**

When Sessions metric is selected, shows toggle:
- **"Weekly"** - Shows weekly averages and goals
- **"Monthly"** - Shows monthly averages and goals

---

#### Metric: Attendance

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "Client Cancel Rate" |
| Short Label | "Client Cancel" |
| Format | "24%" (percentage) |
| Tooltip | "Percentage of booked sessions cancelled by the client." |
| Higher is Better | **No** (lower is better) |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Clinician Cancel Rate" | "Clinician" | "3%" | "Percentage of booked sessions cancelled by the clinician." |
| "No-Show Rate" | "No-Show" | "5%" | "Percentage of booked sessions where the client did not attend without canceling." |

---

#### Metric: Engagement

**Primary Column (Live/Historical):**

| Property | Value |
|----------|-------|
| Header | "Rebook Rate" |
| Short Label | "Rebook" |
| Format | "89%" (percentage) |
| Tooltip | "Percentage of active clients who have their next appointment scheduled." |
| Higher is Better | Yes |

**Primary Column (Last 12 Months):**

| Property | Value |
|----------|-------|
| Header | "Avg Session Retention" |
| Short Label | "Avg Retention" |
| Format | "82%" (percentage) |
| Tooltip | "Average of session 2, 5, and 12 return rates over the period." |
| Higher is Better | Yes |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Session 2 Return" (or "Session 2 Return (12mo)") | "1→2" | "92%" | "Percentage of new clients who return for their second session." |
| "Session 5 Return" (or "Session 5 Return (12mo)") | "→5" | "78%" | "Percentage of clients who reach their 5th session." |
| "Session 12 Return" (or "Session 12 Return (12mo)") | "→12" | "65%" | "Percentage of clients who reach their 12th session." |

---

#### Metric: Retention

**Primary Column (Live/Historical):**

| Property | Value |
|----------|-------|
| Header | "At-Risk Clients" |
| Short Label | "At Risk" |
| Format | "3" (number) |
| Tooltip | "Clients without upcoming appointments who may churn soon." |
| Higher is Better | **No** (lower is better) |

**Supporting Columns (Live/Historical):**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Active Clients" | "Active" | "28" | "Current active clients for this clinician." |

**Primary Column (Last 12 Months):**

Uses "Clients Churned" for ranking but displays full retention flow:

**Columns (Last 12 Months):**

| Header | Short | Format | Tooltip | Is Primary? |
|--------|-------|--------|---------|-------------|
| "Clients (Start)" | "Start" | "26" | "Active clients at the start of the 12-month period." | No |
| "Clients (End)" | "End" | "28" | "Active clients at the end of the 12-month period." | No |
| "Clients Churned" | "Churned" | "8" | "Clients who stopped seeing this clinician during the period." | **Yes** (ranking column) |
| "Churn Rate" | "Churn %" | "31%" | "Percentage of starting clients who churned." | No |
| "At-Risk (Current)" | "At Risk" | "2" | "Clients currently without upcoming appointments who may churn soon." | No |

---

#### Metric: Notes (Documentation)

**Primary Column:**

| Property | Value |
|----------|-------|
| Header | "Outstanding Notes" |
| Short Label | "Outstanding" |
| Format | "12" (number) |
| Tooltip | "Total notes not yet completed." |
| Higher is Better | **No** (lower is better) |

**Supporting Columns:**

| Header | Short | Format | Tooltip |
|--------|-------|--------|---------|
| "Overdue" | "Overdue" | "4" | "Notes past the practice's deadline." |
| "Due Within 48h" | "Due 48h" | "5" | "Notes due within the next 48 hours." |

**Special Behavior:** Forces "Live" view mode (Notes is always current state).

---

### 6.7 Ranking Table

#### Desktop Column Headers

| Column | Header Text | Tooltip | Alignment |
|--------|-------------|---------|-----------|
| 1 | "Rank" | — | Center |
| 2 | "Clinician" | — | Left |
| 3+ | (Primary metric label) | (Primary metric tooltip) | Right |
| 4+ | (Supporting metric labels) | (Supporting metric tooltips) | Right |

#### Row Types

**1. Clinician Row**

```
┌─────────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│ ← Accent bar (color based on rank)
│                                                                 │
│  1    [SC]  Sarah Chen          $142.5K      487       $185    │
│             Clinical Director                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- **Rank:** Large serif number
- **Avatar:** Initials in colored square (gradient based on rank)
- **Name:** Bold serif text
- **Role:** Smaller gray text below name
- **Values:** Right-aligned, serif font for primary, regular for supporting

**2. Team Average Row**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                                                                 │
│  ⊚    Team Average             $101.3K      345       $168     │ ← Users icon instead of rank
│       5 clinicians                                              │
│                                                                 │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

- **Dashed border:** Indicates this is not a ranked clinician
- **Icon:** Users icon in gray circle instead of rank
- **Values:** Team averages for all columns

**Position:** Team Average row appears in rank order based on where the average would fall.

---

### 6.8 Row Colors by Rank

| Rank | Accent Color | Text Color | Avatar Gradient |
|------|--------------|------------|-----------------|
| #1 (Top) | Emerald (#10b981) | Emerald (#059669) | Emerald gradient |
| #2 - #(N-1) | Stone (#78716c) | Stone (#44403c) | Stone gradient |
| #N (Last) | Rose (#ef4444) | Rose (#dc2626) | Rose gradient |

---

### 6.9 Legend

Located at bottom of ranking list.

```
● Top performer    ● Needs attention
```

- **Green dot:** Top performer
- **Red dot:** Needs attention

---

### 6.10 Mobile Layout

On mobile, each clinician displays as a card:

```
┌─────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│
│                                     │
│ 1  [SC] Sarah Chen      $142.5K    │
│         Clinical Dir.              │
│                                     │
│ Sessions: 487  Avg $/Sess: $185    │ ← Supporting metrics below
│                                     │
└─────────────────────────────────────┘
```

---

### 6.11 Clinician Data Fields

Each clinician has the following data available:

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Full name | "Sarah Chen" |
| `shortName` | Display name (may be anonymized) | "Sarah C" |
| `role` | Job title | "Clinical Director" |
| `avatar` | Initials | "SC" |
| `revenue` | Total revenue | 142500 |
| `revenuePerSession` | Avg revenue per session | 185 |
| `completedSessions` | Sessions completed | 487 |
| `weeklySessionGoal` | Target sessions per week | 25 |
| `sessionGoalPercent` | % of goal achieved | 108 |
| `caseloadCapacity` | Target active clients | 35 |
| `caseloadPercent` | % of capacity filled | 93 |
| `activeClients` | Current active clients | 28 |
| `newClients` | New clients acquired | 17 |
| `showRate` | % sessions completed | 71 |
| `clientCancelRate` | % cancelled by client | 24 |
| `clinicianCancelRate` | % cancelled by clinician | 3 |
| `noShowRate` | % no-shows | 5 |
| `rebookRate` | % with next appt booked | 89 |
| `atRiskClients` | Clients without next appt | 2 |
| `churnRate` | % clients churned | 8 |
| `clientsChurned` | Count churned | 3 |
| `activeClientsStart` | Active at period start | 26 |
| `activeClientsEnd` | Active at period end | 28 |
| `session1to2Retention` | % returning for 2nd session | 92 |
| `session5Retention` | % reaching 5th session | 78 |
| `session12Retention` | % reaching 12th session | 65 |
| `avgSessionRetention` | Avg of 2/5/12 retention | 78 |
| `outstandingNotes` | Total incomplete notes | 12 |
| `overdueNotes` | Notes past deadline | 4 |
| `dueWithin48hNotes` | Notes due in 48 hours | 5 |

---

### 6.12 Demo Mode (Anonymization)

When "Anonymize Clinician Names" is enabled in Settings:

| Real Name | Anonymized |
|-----------|------------|
| Sarah Chen | Clinician A |
| Maria Rodriguez | Clinician B |
| Priya Patel | Clinician C |
| James Kim | Clinician D |
| Michael Johnson | Clinician E |

Initials also update (e.g., "SC" → "CA").

---

### 6.13 Loading State

- **Spinner:** Rotating amber loader
- **Text:** "Loading clinician data..."

---

### 6.14 Error State

- **Text:** "Failed to load clinician data. Please try again."
- **Color:** Red

---

### 6.15 Deep Linking

The metric can be set via URL parameter:

| URL | Opens With |
|-----|------------|
| `/clinician-overview?metric=revenue` | Revenue selected |
| `/clinician-overview?metric=attendance` | Attendance selected |
| `/clinician-overview?tab=ranking&metric=documentation` | Notes selected |

**Used by:** Dashboard metric cards ("By Clinician" buttons) link here with relevant metric pre-selected.

---

## 7. Clinician Spotlight - Details Tab

### Screen: Clinician Details

**URL:** `/clinician-overview?tab=details` or `/clinician-overview?tab=details&clinician={id}`

**Purpose:** Deep-dive into individual clinician performance with detailed charts, metrics, and client roster.

**Access:** Click "Details" tab in Clinician Spotlight header

---

### 7.1 Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Clinician Dropdown ▼]  [Configure Goals ⚙]                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     CLINICIAN SPOTLIGHT HEADER                    │  │
│  │  [SC]  Sarah Chen                                    ● Healthy    │  │
│  │        Clinical Director · 4 years tenure                         │  │
│  │                                                                   │  │
│  │  "Exceptional quarter. Revenue up 12% with highest client         │  │
│  │   retention on team."                                             │  │
│  │                                                                   │  │
│  │  $142.5k    487      89%       2                                  │  │
│  │  Revenue    Sessions Rebook    Notes                              │  │
│  │  112% goal  108%     ●Healthy  Overdue                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  1. Financial Performance                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Monthly Revenue │  │ Revenue/Session │  │ Practice Share  │          │
│  │ [Line Chart]    │  │ [Bar Compare]   │  │ [Donut Chart]   │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  2. Session Analytics                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Monthly Sessions│  │ Session Outcome │  │ Cancellation    │          │
│  │ [Stacked Bar]   │  │ [Donut Chart]   │  │ [Diverging Bar] │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                          │
│  (continues with Caseload, Engagement, Documentation sections)           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.2 Clinician Selector Dropdown

Located at top of page.

#### Dropdown Trigger

- **Format:** "{Clinician Name}" with chevron icon
- **Example:** "Sarah Chen ▼"

#### Dropdown Options

Lists all clinicians with:
- Avatar (initials in colored circle)
- Name
- Health status dot (green/amber/red)
- Checkmark if selected

---

### 7.3 Configure Goals Button

- **Text:** "Configure Goals" with settings icon
- **Location:** Top right, next to clinician dropdown
- **Action:** Navigates to `/configure` (Practice Configuration page)

---

### 7.4 Clinician Spotlight Header Card

A hero card showing clinician summary.

#### Layout

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌────┐  Sarah Chen                                   ● Healthy      │
│  │ SC │  Clinical Director · 4 years · Supervised by: None           │
│  └────┘                                                               │
│                                                                       │
│  "Exceptional quarter. Revenue up 12% with highest client            │
│   retention on team."                                                │
│                                                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │  $142.5k    │ │    487      │ │    89%      │ │     2       │     │
│  │  Revenue    │ │  Sessions   │ │  Rebook     │ │   Notes     │     │
│  │  112% goal  │ │  108% goal  │ │  ● Healthy  │ │  Overdue    │     │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

#### Header Elements

| Element | Description | Example |
|---------|-------------|---------|
| Avatar | Large initials square with gradient | "SC" |
| Name | Clinician full name | "Sarah Chen" |
| Title | Role/position | "Clinical Director" |
| Tenure | Time at practice | "4 years" |
| Supervisor | Reports to (if applicable) | "Supervised by: Maria Rodriguez" |
| Health Status | Overall performance indicator | "● Healthy" (green) |
| AI Insight | Generated summary of performance | "Exceptional quarter..." |

#### Health Status Values

| Status | Dot Color | Label |
|--------|-----------|-------|
| Healthy | Green | "Healthy" |
| Attention | Amber | "Attention" |
| Critical | Red | "Critical" |

#### Quick Stat Cards (4)

| Stat | Value Format | Subtext |
|------|--------------|---------|
| Revenue | "$142.5k" | "112% of goal" |
| Sessions | "487" | "108% of goal" |
| Rebook Rate | "89%" | Health status dot |
| Notes Overdue | "2" | "Overdue" |

---

### 7.5 Section 1: Financial Performance

#### Section Header

- **Number:** 1
- **Title:** "Financial Performance"
- **Subtitle:** "How is {Clinician} contributing to practice revenue?"

#### Chart 1.1: Monthly Revenue (Line Chart)

| Property | Value |
|----------|-------|
| Title | "Monthly Revenue" |
| Subtitle | "Last 12 months" |
| Chart Type | Line chart with goal line |
| X-Axis | Months (Jan-Dec) |
| Y-Axis | Revenue ($) |
| Goal Line | Dashed line at revenue goal |
| Goal Badge | "Goal: $11.0k" |
| Data Point Hover | Month name + value |

#### Chart 1.2: Revenue Per Session (Bar Comparison)

| Property | Value |
|----------|-------|
| Title | "Revenue Per Session" |
| Subtitle | "vs Team Average" |
| Chart Type | Horizontal bar comparison |
| Bars | Clinician value vs Team average |
| Format | "$185" vs "$168" |

#### Chart 1.3: Practice Revenue Share (Donut Chart)

| Property | Value |
|----------|-------|
| Title | "Practice Revenue Share" |
| Subtitle | "% of total practice revenue" |
| Chart Type | Donut/pie chart |
| Center Value | "28%" |
| Center Label | "of practice" |

---

### 7.6 Section 2: Session Analytics

#### Section Header

- **Number:** 2
- **Title:** "Session Analytics"
- **Subtitle:** "How effectively is {Clinician} using their time?"

#### Chart 2.1: Monthly Sessions (Stacked Bar Chart)

| Property | Value |
|----------|-------|
| Title | "Monthly Sessions" |
| Subtitle | "Completed vs Cancelled" |
| Chart Type | Stacked bar chart |
| Categories | Completed, Client Cancelled, Clinician Cancelled, Late Cancel, No-Show |
| Goal Line | Session goal |
| Legend | Color-coded categories |

#### Chart 2.2: Session Outcomes (Donut Chart)

| Property | Value |
|----------|-------|
| Title | "Session Outcomes" |
| Subtitle | "Last 12 months breakdown" |
| Chart Type | Donut chart |
| Segments | Completed (green), Client Cancel (amber), Clinician Cancel (blue), Late Cancel (orange), No-Show (red) |

#### Chart 2.3: Cancellation Breakdown (Diverging Bar Chart)

| Property | Value |
|----------|-------|
| Title | "Cancellation Breakdown" |
| Subtitle | "By type over 12 months" |
| Chart Type | Diverging horizontal bar |
| Categories | Client Cancel, Clinician Cancel, Late Cancel, No-Show |
| Center Line | Zero point |

---

### 7.7 Section 3: Caseload Management

#### Section Header

- **Number:** 3
- **Title:** "Caseload Management"
- **Subtitle:** "How is {Clinician} managing their client base?"

#### Chart 3.1: Monthly Active Clients (Line Chart)

| Property | Value |
|----------|-------|
| Title | "Monthly Active Clients" |
| Subtitle | "vs Capacity" |
| Chart Type | Line chart with capacity line |
| Capacity Line | Dashed at capacity limit |

#### Chart 3.2: Client Flow (Table)

| Property | Value |
|----------|-------|
| Title | "Client Flow" |
| Subtitle | "New vs Churned by month" |
| Columns | Month, New Clients, Churned, Net |
| Highlight | Positive net = green, Negative = red |

#### Chart 3.3: Session Frequency (Donut Chart)

| Property | Value |
|----------|-------|
| Title | "Client Session Frequency" |
| Subtitle | "Current active clients" |
| Segments | Weekly (4+/mo), Bi-weekly (2-3/mo), Monthly (1/mo), Inconsistent (<1/mo) |

---

### 7.8 Section 4: Client Engagement

#### Section Header

- **Number:** 4
- **Title:** "Client Engagement"
- **Subtitle:** "How well is {Clinician} retaining clients?"

#### Chart 4.1: Retention Milestones (Horizontal Bar)

| Property | Value |
|----------|-------|
| Title | "Retention Milestones" |
| Subtitle | "% of clients reaching each milestone" |
| Bars | Session 2 (1→2), Session 5 (→5), Session 12 (→12) |
| Benchmark | Practice average line |

#### Chart 4.2: Client Roster Card

An interactive card showing all clients.

**Card Header:**
- **Title:** "Client Roster"
- **Client Count:** "28 active clients"
- **Expand Button:** Shows full roster

**Roster Categories (Tabs):**

| Tab | Filter | Badge Count |
|-----|--------|-------------|
| "All" | All clients | Total count |
| "At Risk" | `status === 'at-risk'` | At-risk count (red) |
| "New" | `status === 'new'` | New count (blue) |
| "Milestones" | `status === 'milestone'` | Milestone count (purple) |

**Client Row:**

```
┌────────────────────────────────────────────────────────────────┐
│ [ET] Emma Thompson          24 sessions    Next: Dec 12       │
│      Last seen: 3 days ago                 ● Healthy          │
└────────────────────────────────────────────────────────────────┘
```

| Field | Description |
|-------|-------------|
| Initials | Client initials in avatar |
| Name | Client full name |
| Total Sessions | Lifetime session count |
| Last Seen | Days since last appointment |
| Next Appointment | Next scheduled date or "Not scheduled" |
| Status | Healthy (green), At-Risk (amber), New (blue), Milestone (purple) |
| Milestone Badge | "Approaching 5th session!" |

---

### 7.9 Section 4: Retention (Detailed)

#### Section Header

- **Number:** 4
- **Accent Color:** Rose
- **Question:** "How well do they retain clients?"
- **Description:** "Rebook rates, churn patterns, and retention comparison"

---

#### Chart 4.1: New and Churned Clients Per Month

**Card Title:** "New and Churned Clients Per Month"
**Card Subtitle:** "How {First Name}'s client base is changing"

**Chart Type:** Diverging Bar Chart (mirrored bars above/below axis)

**Legend (shown in header):**

| Color | Label |
|-------|-------|
| Emerald gradient | "New" |
| Rose gradient | "Churned" |

**Data Points (12 months):**
- Green bars extend upward = new clients gained
- Red bars extend downward = clients churned

**Insight Pills Below Chart:**

| Insight | Format | Color Logic |
|---------|--------|-------------|
| Net Change | "+X" or "-X" | Green if positive, Red if negative |
| Avg New/mo | "+X.X" | Emerald |
| Avg Churn/mo | "-X.X" | Rose |

**Tooltip:** Hover shows exact values for each month

---

#### Chart 4.2: Churn Timing Donut

**Card Title:** "Churn Timing"
**Card Subtitle:** "How far {First Name}'s clients get before leaving"

**Donut Segments:**

| Segment | Label | Color | Meaning |
|---------|-------|-------|---------|
| 1 | "Early (<5 sessions)" | Red (#ef4444) | Clients who left before 5 sessions |
| 2 | "Medium (5-15)" | Amber (#f59e0b) | Clients who left between 5-15 sessions |
| 3 | "Late (>15)" | Emerald (#10b981) | Clients who left after 15+ sessions |

**Center Display:**
- **Label:** "Total Churned"
- **Value:** Total number churned

**Interpretation:** More "Late" churn = better engagement (clients stayed longer)

---

#### Chart 4.3: Retention Comparison Table

**Card Title:** "Retention Comparison"
**Card Subtitle:** "How {First Name}'s retention compares to the practice"

**Table Columns:**

| Column | Header | Alignment |
|--------|--------|-----------|
| Row Label | Metric name | Left |
| Clinician | {First Name} | Right |
| Practice | "Practice Avg" | Right |
| Diff | "Diff" | Right (highlighted) |

**Table Rows:**

| Row | Clinician Value | Practice Avg | Diff Color |
|-----|-----------------|--------------|------------|
| Rebook Rate | "91%" | "88%" | Green if positive, Red if negative |
| Avg Sessions Before Churn | "18.5" | "14.2" | Green if higher, Red if lower |

**Row Indicators:** Colored dot on left side matching performance

---

#### Chart 4.4: Return Rate Line Chart

**Card Title:** "Return Rate"
**Card Subtitle:** "% of clients still active at each milestone"

**Chart Type:** Multi-line chart

**Legend (shown in header):**

| Line | Color | Represents |
|------|-------|------------|
| {First Name} | Blue (#3b82f6) | Selected clinician |
| Practice Avg | Stone/Gray (#a8a29e) | Practice average |
| Top Performer | Emerald (#10b981) | Best in practice |

**X-Axis Labels (Time Milestones):**

| Point | Label |
|-------|-------|
| 1 | "Mo 1" |
| 2 | "Mo 3" |
| 3 | "Mo 6" |
| 4 | "Mo 9" |
| 5 | "Mo 12" |

**Y-Axis:** 0% to 100% (percentage of clients still active)

**Starting Point:** All lines start at 100% at Month 1 (all clients who had first session)

**Data Example (Sarah Chen - Top Performer):**

| Month | Clinician | Practice Avg | Top Performer |
|-------|-----------|--------------|---------------|
| Mo 1 | 100% | 100% | 100% |
| Mo 3 | 92% | 85% | 92% |
| Mo 6 | 85% | 72% | 85% |
| Mo 9 | 76% | 62% | 76% |
| Mo 12 | 68% | 55% | 68% |

**Tooltip on Hover:** Shows exact percentage for each line at that month

---

### 7.10 Section 5: Compliance & Documentation

#### Section Header

- **Number:** 5
- **Accent Color:** Stone/Gray
- **Question:** "Are they staying compliant?"
- **Description:** "Documentation status and overdue notes"

---

#### Chart 5.1: Outstanding Notes Donut

**Card Title:** "Outstanding Notes"
**Card Subtitle:** "How many notes {First Name} needs to complete"

**Donut Segments:**

| Segment | Label | Color |
|---------|-------|-------|
| 1 | "Overdue" | Red (#ef4444) |
| 2 | "Due within 48h" | Amber (#f59e0b) |

**Center Display:**
- **Label:** "Total"
- **Value:** Total outstanding notes
- **Color Logic:**
  - Emerald: 0 overdue
  - Amber: 1-3 overdue
  - Rose: 4+ overdue

---

#### Chart 5.2: Overdue Notes List

**Card Title:** "Overdue Notes"
**Card Subtitle:** "Notes {First Name} needs to catch up on"

**Header Right Side:** Large number showing total overdue (colored by severity)

**Empty State (0 overdue):**
- Emerald checkmark icon
- **Title:** "All caught up!"
- **Subtitle:** "No overdue notes"

**List Item Layout (when notes exist):**

```
┌────────────────────────────────────────────────┐
│  [Avatar]  Client Name                 [Badge] │
│            Session Date · Session Type         │
└────────────────────────────────────────────────┘
```

**List Item Fields:**

| Element | Content |
|---------|---------|
| Avatar | Client initials in gray gradient square |
| Client Name | Full name |
| Session Date | "Dec 8" format |
| Session Type | "Individual" or "Couples" |
| Badge | "Xd overdue" (red if >=7 days, amber otherwise) |

**Example Overdue Notes:**

| Client | Initials | Session Date | Days Overdue | Type |
|--------|----------|--------------|--------------|------|
| Robert Kim | RK | Nov 25 | 16 | Individual |
| Lisa Thompson | LT | Nov 28 | 13 | Individual |
| Kevin Patel | KP | Dec 1 | 10 | Individual |
| Maria Santos | MS | Dec 3 | 8 | Couples |
| Thomas Anderson | TA | Dec 5 | 6 | Individual |

**Footer (if >5 notes):**
- **Button Text:** "View all X overdue notes →"

---

### 7.11 Clinician Profile Cards (Before Selection)

When no clinician is selected, a gallery of clinician cards is shown.

#### Section Header

**Title:** "Select a Clinician" (DM Serif Display font)
**Subtitle:** "Choose a team member to explore their detailed performance metrics, trends, and insights."

#### Clinician Card Layout

```
┌──────────────────────────────────────────────┐
│  ┌──────┐                    [Health Badge]  │
│  │ Init │                                    │
│  │ials  │                                    │
│  └──────┘                                    │
│                                              │
│  Clinician Name                              │
│  Role                                        │
│                                              │
│  ────────────────────────────────────────    │
│  Last Month    │  Clients    │  Sessions    │
│  $X.Xk         │  XX         │  XX          │
│                                         [→]  │
└──────────────────────────────────────────────┘
```

**Card Elements:**

| Element | Content |
|---------|---------|
| Avatar | Large square with initials and gradient matching clinician color |
| Health Badge | "Healthy" / "Needs Attention" / "Critical" |
| Name | Full name |
| Role | "Clinical Director" / "Senior Therapist" / etc. |
| Last Month | Revenue formatted as "$X.Xk" |
| Clients | Active client count |
| Sessions | Completed sessions last month |
| Arrow | Appears on hover, right side |

**Card Hover Effects:**
- Slight scale up (1.02x)
- Lift up (-translate-y-1)
- Glow effect using clinician's color
- Bottom accent line slides in

---

### 7.12 Time Period Selector

Available in both pre-selection and spotlight modes.

**Dropdown Button:**
- Calendar icon (amber color)
- Current period text
- Chevron down icon (rotates when open)

**Preset Time Periods:**

| ID | Label |
|----|-------|
| last-12-months | "Last 12 months" |
| this-year | "This Year" |
| this-quarter | "This Quarter" |
| last-quarter | "Last Quarter" |
| this-month | "This Month" |
| last-month | "Last Month" |

**Divider** followed by:

- **Button:** "Custom Range" with calendar icon

**Custom Range Picker:**

| Element | Functionality |
|---------|---------------|
| Back button | Returns to preset list |
| Year selector | Chevron left/right to change year |
| Month grid | 4x3 grid (Jan-Dec) |
| Apply button | "Apply Range" - amber gradient |

**Month Selection Logic:**
- Click a month to set start
- Click another month to set end
- Clicking when range exists resets to single month

---

### 7.13 Hero Stats Row

Shown at top when clinician is selected.

**Grid:** 4 columns on desktop, 2 on mobile

**Stat Cards:**

| Card | Title | Value Format | Subtitle Format | Variant Logic |
|------|-------|--------------|-----------------|---------------|
| 1 | "Revenue" | "$XXK" | "+X% vs goal · X% of practice" | Positive if >=100% of goal |
| 2 | "Sessions" | "XX/mo" | "~X/week · XXX total" | Positive if >=100% of goal |
| 3 | "Caseload" | "XX/XX" (current/capacity) | "XX% capacity · +X% vs avg" | Positive if >= practice avg |
| 4 | "Notes Overdue" | Number | Status text | Positive if <=5, Negative if >10 |

**Notes Overdue Status Text:**

| Count | Text |
|-------|------|
| 0-5 | "On track" |
| 6-10 | "Needs attention" |
| 11+ | "Critical backlog" |

---

### 7.14 Metadata Cards (Spotlight Header)

Grid of 4 cards in header when clinician selected.

| Card | Label | Value | Background | Clickable |
|------|-------|-------|------------|-----------|
| Tenure | "TENURE" | "2 years" | White 6% opacity | No |
| Take Rate | "TAKE RATE" | "65%" | White 6% opacity | No |
| Session Goal | "SESSION GOAL" | "25/week" | Amber 10% opacity | Yes → Configure page |
| Caseload Goal | "CASELOAD GOAL" | "35 clients" | Amber 10% opacity | Yes → Configure page |

**Settings Icon:** Shows on goal cards, reveals on hover

---

### 7.15 AI Insight Quote

Large quote-style card in spotlight header.

**Layout:**
- Large decorative quote mark (") in top left
- **Label:** "AI Insight" in amber
- **Quote text:** Personalized insight about the clinician

**Example Insights:**

| Clinician | Insight |
|-----------|---------|
| Sarah Chen | "Strong performer who consistently exceeds goals. Her retention rate is the highest on the team." |
| Priya Patel | "Shows potential but struggling with early engagement. Consider intake training." |
| Michael Johnson | "Ramping up well but needs support with documentation habits." |

---

### 7.16 Expandable Charts (Full Modal)

Most charts have an expand button for fullscreen view.

**Expand Button:** Maximize icon in top-right corner of chart card

**Modal Overlay:**
- Dark semi-transparent background
- Centered white modal
- Full-width chart display

**Modal Header:**
- Chart title (large)
- Chart subtitle
- Close button (X) in top-right

**Modal Content:**
- Same chart at larger size (height: 400px)
- Larger font sizes for labels
- Same interactivity (tooltips, hovers)

**Close Actions:**
- Click X button
- Click outside modal
- Press Escape key

---

### 7.17 View Session History Link

Located in Section 3 (Caseload Management) header.

**Button Text:** "View Full Session History"
**Icon:** Calendar icon
**Action:** Navigates to `/clinician/{id}/session-history`

This opens a detailed session history page (separate from this tab).

---

### 7.18 Clinician Switcher (Spotlight Mode)

When viewing a clinician, a dropdown allows switching.

**Dropdown Button:**
- Mini avatar (clinician color + initials)
- First name
- Chevron down

**Dropdown Menu:**
- **Label:** "Switch Clinician"
- List of all clinicians with:
  - Mini avatar
  - Full name
  - Role
  - Health status dot
  - Checkmark on selected

**Selection Action:**
- Fade out current content
- Swap clinician data
- Fade in new content
- Dynamic glow color changes to match new clinician

---

### 7.19 Client Demographics Section

Located in Section 3 (Caseload Management).

**Three Stacked Bar Cards:**

**Card 1: Client Gender**
- **Title:** "Client Gender"
- **Subtitle:** "{First Name}'s current active clients"

| Segment | Color | Example Values |
|---------|-------|----------------|
| Male | Blue (#3b82f6) | 12 |
| Female | Pink (#ec4899) | 15 |
| Other | Purple (#a855f7) | 3 |

**Card 2: Client Modality**
- **Title:** "Client Modality"
- **Subtitle:** "{First Name}'s current active clients"

| Segment | Color | Example Values |
|---------|-------|----------------|
| In-Person | Amber (#f59e0b) | 18 |
| Telehealth | Cyan (#06b6d4) | 12 |

**Card 3: Client Age**
- **Title:** "Client Age"
- **Subtitle:** "{First Name}'s current active clients"

| Segment | Color | Example Values |
|---------|-------|----------------|
| 18-30 | Emerald (#10b981) | 8 |
| 31-45 | Blue (#3b82f6) | 12 |
| 46-60 | Amber (#f59e0b) | 7 |
| 60+ | Rose (#f43f5e) | 3 |

**Bar Display:**
- Horizontal stacked bar showing proportions
- Percentages shown below segments
- Legend with colored boxes

---

### 7.20 Client Session Frequency Donut

Located in Section 3 (Caseload Management).

**Card Title:** "Client Session Frequency"
**Card Subtitle:** "How often {First Name}'s clients come in"

**Donut Segments:**

| Segment | Label | Color | Meaning |
|---------|-------|-------|---------|
| 1 | "Weekly" | Emerald (#10b981) | Highly engaged |
| 2 | "Bi-weekly" | Blue (#3b82f6) | Stable engagement |
| 3 | "Monthly" | Amber (#f59e0b) | Lower engagement |
| 4 | "Inconsistent" | Gray (#6b7280) | At-risk engagement |

**Center Display:**
- **Label:** "Active"
- **Value:** Total active clients
- **Color Logic:** Emerald if >=50% weekly, Amber otherwise

---

### 7.21 Client Roster Card (Full Detail)

**Card Title:** "Client Roster"
**Card Subtitle:** "{First Name}'s {count} current active clients"

**Header Toggle:** Expand/collapse button

**Client List Entry:**

```
┌────────────────────────────────────────────────────────┐
│  [Avatar]  Client Name                     [Status]    │
│            X sessions · Last seen Xd ago               │
│            Next: [Date or "None scheduled"]            │
└────────────────────────────────────────────────────────┘
```

**Client Status Types:**

| Status | Badge Text | Badge Color | Icon |
|--------|------------|-------------|------|
| healthy | (none) | — | — |
| new | "New" | Blue | Star |
| at-risk | "At Risk" | Red | AlertTriangle |
| milestone | "Session X soon!" | Purple | Trophy |

**Milestone Sessions Tracked:**
- Session 8
- Session 12
- Session 24
- Session 50

**Next Appointment Display:**
- If scheduled: "Dec 14" format
- If not scheduled: "None scheduled" in amber

**Example Client Data:**

| Client | Initials | Sessions | Last Seen | Next Apt | Status |
|--------|----------|----------|-----------|----------|--------|
| Emily Watson | EW | 15 | 21 days | — | at-risk |
| Christina Liu | CL | 2 | 7 days | Dec 14 | new |
| Quinn Johnson | QJ | 11 | 4 days | Dec 11 | milestone (12) |
| Steven Clark | SC | 19 | 3 days | Dec 10 | healthy |

**Expand Action:** Opens modal with full client list

---

### 7.22 Clinician Goal Configuration (Full Reference)

Goals can be configured per-clinician in the Configure page.

**Access Methods:**
1. Click "Session Goal" metadata card in spotlight header
2. Click "Caseload Goal" metadata card in spotlight header
3. Navigate to Configure → Clinician Goals tab

**Configurable Goals:**

| Goal | Label | Default | Unit | Range |
|------|-------|---------|------|-------|
| Session Goal | "Weekly Session Goal" | 25 | sessions/week | 5-50 |
| Client Goal | "Caseload Capacity" | 35 | clients | 10-75 |
| Take Rate | "Revenue Split" | 65% | percentage | 40-85% |

**Goal Inheritance:**
- Practice defaults applied to all clinicians
- Individual overrides can be set per-clinician
- Settings saved to user preferences

---

---

## 8. Practice Analysis - Overview

The Practice Analysis section provides deep-dive analytics across all practice metrics, organized into 7 tabs.

**Route:** `/analysis`
**Navigation:** Main navigation → "Analysis"

### 8.1 Page Layout

**Header Pattern (all tabs):**
- Accent color gradient background (varies by tab)
- Label: "Detailed Analysis"
- Title: Tab name
- Subtitle: Current time period date range
- Time period selector (where applicable)

**Available Tabs:**

| Tab | Label | Short Label | Accent Color |
|-----|-------|-------------|--------------|
| clients | "Client Roster" | "Clients" | Amber |
| financial | "Financial Analysis" | "Financial" | Amber |
| sessions | "Sessions Analysis" | "Sessions" | Amber |
| capacity-client | "Client & Capacity Analysis" | "Client & Capacity" | Amber |
| retention | "Retention Analysis" | "Retention" | Rose |
| insurance | "Insurance Analysis" | "Insurance" | Violet |
| admin | "Admin Analysis" | "Admin" | Blue |

### 8.2 Time Period Selector

Available on most tabs (except Retention which uses cohort-based analysis).

**Time Period Options:**

| ID | Label |
|----|-------|
| last-12-months | "Last 12 months" |
| this-year | "This Year" |
| this-quarter | "This Quarter" |
| last-quarter | "Last Quarter" |
| this-month | "This Month" |
| last-month | "Last Month" |
| 2024 | "2024" |

---

## 9. Practice Analysis - Client Roster Tab

**Route:** `/analysis?tab=clients`
**Accent Color:** Amber

### 9.1 Page Header

**Label:** "Client Health"
**Title:** "Client Roster"
**Subtitle:** "{X} clients need attention" (sum of at-risk + new + milestone)

**Header Stats (right side):**

| Stat | Value | Color |
|------|-------|-------|
| Active Clients | Total count | White |
| Healthy | Percentage healthy | Emerald |

### 9.2 Client Segment Selector

Grid of 6 segment cards (2 rows × 3 columns on desktop).

**Segments:**

| ID | Label | Description | Status Color |
|----|-------|-------------|--------------|
| all | "All Clients" | "Everyone in your practice" | — |
| healthy | "Healthy" | "Active with next appointment booked" | Emerald |
| at-risk | "At-Risk" | "No upcoming appointment scheduled" | Rose |
| new | "New Clients" | "First 3 sessions, joined recently" | Cyan |
| milestone | "Milestone Approaching" | "Approaching session 3, 5, or 12" | Amber |
| churned | "Recently Churned" | "Left in the last 90 days" | Stone/Gray |

**Card Format:**
```
┌────────────────────────────────────────┐
│  Segment Label · COUNT                 │
│  Description text                      │
│  ════════════════════ (amber accent)   │
└────────────────────────────────────────┘
```

**Selected State:**
- White background
- Scale up slightly (1.02x)
- Amber accent line at bottom

### 9.3 Client List Table

**Desktop Column Headers:**

| Column | Width | Alignment |
|--------|-------|-----------|
| Client | 2fr | Left |
| Clinician | 1.2fr | Left |
| Sessions | 1fr | Right |
| Last Seen | 1fr | Right |
| Action | 160px | Right |

**Client Row Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ██████ (accent bar - color by status)                           │
├─────────────────────────────────────────────────────────────────┤
│ [Avatar]  Client Name      Clinician     Sessions   Last Seen   │
│           ● Status                                   [Action]   │
└─────────────────────────────────────────────────────────────────┘
```

**Status Indicator Colors:**

| Status | Background | Text | Dot |
|--------|------------|------|-----|
| healthy | bg-emerald-50 | text-emerald-700 | bg-emerald-500 |
| at-risk | bg-rose-50 | text-rose-700 | bg-rose-500 |
| new | bg-cyan-50 | text-cyan-700 | bg-cyan-500 |
| milestone | bg-amber-50 | text-amber-700 | bg-amber-500 |
| churned | bg-stone-100 | text-stone-600 | bg-stone-400 |

### 9.4 Client Row Details

**Avatar:** Square with initials, colored by status

**Client Name:** Bold, serif font (DM Serif Display)

**Status Badge:** Below name
- Status dot + capitalized status text
- Milestone badge: "→ Session {X}" if milestone approaching

**Sessions:** Large number

**Last Seen:**
- If next appointment: Calendar icon + date in emerald
- If no appointment: "X days ago" / "X weeks ago" format

**Action Button:**
- Default: "Mark Done" button
- Clicked: Emerald "Done" with checkmark
- Toggleable (can mark/unmark)

### 9.5 Last Seen Formatting

| Days | Display |
|------|---------|
| 0 | "Today" |
| 1 | "Yesterday" |
| 2-6 | "X days ago" |
| 7-13 | "1 week ago" |
| 14-29 | "X weeks ago" |
| 30+ | "X months ago" |

### 9.6 Client Counts (Example Data)

| Segment | Count |
|---------|-------|
| All Clients | 156 |
| Healthy | 128 |
| At-Risk | 8 |
| New Clients | 12 |
| Milestone Approaching | 5 |
| Recently Churned | 3 |

---

## 10. Practice Analysis - Financial Tab

**Route:** `/analysis?tab=financial`
**Accent Color:** Amber

### 10.1 Executive Summary

**Component:** Executive Summary card
**Accent:** Indigo gradient left border
**Headline:** "Revenue Healthy, Margins Improving"
**Summary:** Dynamic text with key metrics in bold, e.g.:
> "Your practice collected **$1.75M** this period with an average net margin of **16.2%**. You hit the $150k monthly goal in **9 of 12 months**. Best month was **October** at $155K."

### 10.2 Hero Stats Row

Grid of 4 stat cards:

| Card | Title | Value Format | Subtitle |
|------|-------|--------------|----------|
| 1 | "Revenue" | "$X.XXM" or "$XXXk" | "last 12 months" |
| 2 | "Net Margin" | "X.X%" | "average this period" |
| 3 | "Avg/Session" | "$XXX" | "revenue per session" |
| 4 | "At Goal" | "X/12" | "months at goal" |

### 10.3 Revenue Per Month Chart

**Card Title:** "Revenue Per Month"
**Card Subtitle:** "How much you're collecting each month"

**Toggle:** "By Clinician" button with Users icon

**Goal Indicator:** Shows configured monthly revenue goal (e.g., "$150k")

**Single Bar Mode (default):**
- Amber gradient bars
- Color changes based on goal achievement:
  - At/above goal: Emerald gradient
  - Below goal: Amber gradient

**Stacked Bar Mode (By Clinician):**

| Clinician | Color | Gradient |
|-----------|-------|----------|
| S Chen | #7c3aed (Purple) | Violet gradient |
| M Rodriguez | #0891b2 (Cyan) | Cyan gradient |
| A Patel | #d97706 (Amber) | Amber gradient |
| J Kim | #db2777 (Pink) | Pink gradient |
| M Johnson | #059669 (Emerald) | Emerald gradient |

**Insights Pills:**

| Insight | Example | Color |
|---------|---------|-------|
| Best Month | "Oct ($155k)" | Emerald |
| Goal Achievement | "9/12" | Emerald if >=6, Amber if <6 |
| Range | "$138k–$155k" | Stone |

### 10.4 Revenue Breakdown Table

**Card Title:** "Revenue Breakdown"
**Card Subtitle:** "Where your money goes each month"

**Table Rows:**

| Row | Indicator Color | Row Color |
|-----|-----------------|-----------|
| Gross Revenue | — | Default |
| Clinician Cost | Blue (#3b82f6) | Blue text |
| Supervisor Cost | Amber (#f59e0b) | Amber text |
| Credit Card Fees | Rose (#f43f5e) | Rose text |
| Net Revenue | Emerald (#10b981) | Emerald text, highlighted row |

**Columns:** One per month + "Total" column

### 10.5 Cost Trend Chart

**Card Title:** "Cost Trends"
**Card Subtitle:** "How costs are changing over time"

**Line Chart with two lines:**

| Line | Color | Label |
|------|-------|-------|
| Clinician Cost % | Blue (#3b82f6) | "Clinician %" |
| Supervisor Cost % | Amber (#f59e0b) | "Supervisor %" |

**Y-Axis:** Percentage of gross revenue

### 10.6 Cohort LTV Chart

**Card Title:** "Client Lifetime Value"
**Card Subtitle:** "Revenue per client over their journey"

**Line Chart:**

| Line | Color | Label |
|------|-------|-------|
| Current Year (2025) | Emerald (#10b981) | "2025" |
| Prior Year (2024) | Blue (#3b82f6) | "2024" |

**X-Axis:** M0, M1, M2... M12 (months since client started)
**Y-Axis:** Cumulative revenue per client ($)

**Example Data Points:**

| Month | 2025 | 2024 |
|-------|------|------|
| M0 | $479 | $499 |
| M3 | $2,031 | $2,084 |
| M6 | $3,057 | $3,067 |
| M9 | $3,576 | $3,800 |
| M12 | — | $4,390 |

---

## 11. Practice Analysis - Sessions Tab

**Route:** `/analysis?tab=sessions`
**Accent Color:** Amber

### 11.1 Executive Summary

**Headline:** "Sessions On Track, Monitor Cancellations"
**Summary:** Dynamic text with metrics, e.g.:
> "Your practice completed **7,977 sessions** this period with a **75.3% show rate**. You hit the 650-session goal in **8 of 12 months**. The client cancellation rate stands at **14.2%**—within acceptable range."

### 11.2 Hero Stats Row

| Card | Title | Value | Subtitle |
|------|-------|-------|----------|
| 1 | "Sessions Completed" | "7,977" | "total" |
| 2 | "Sessions Booked" | "8,385" | "total" |
| 3 | "Weekly Sessions" | "153" | "average" |
| 4 | "Cancel Rate" | "14.2%" | "average" |

### 11.3 Completed Sessions Chart

**Card Title:** "Completed Sessions Per Month"
**Card Subtitle:** "How many sessions you're completing each month"

**Toggle:** "By Clinician" button

**Goal Indicator:** Monthly sessions goal (e.g., "650")

**Bar Colors (single mode):**
- At/above goal: Emerald gradient
- Below goal: Amber gradient

**Insights Pills:**

| Insight | Format |
|---------|--------|
| Best Month | "Oct (712)" |
| Goal Achievement | "8/12" |
| Range | "628–712" |

### 11.4 Attendance Breakdown Donut

**Card Title:** "Attendance Breakdown"
**Card Subtitle:** "How sessions are ending up"

**Donut Segments:**

| Segment | Color | Example Value |
|---------|-------|---------------|
| Attended | Emerald (#10b981) | 6,062 |
| Client Cancelled | Rose (#ef4444) | 1,416 |
| Clinician Cancelled | Blue (#3b82f6) | 286 |
| Late Cancelled | Amber (#f59e0b) | 305 |
| No Show | Gray (#6b7280) | 96 |

**Center Display:** Total sessions count

### 11.5 Session Modality Chart

**Card Title:** "Session Modality"
**Card Subtitle:** "In-person vs telehealth breakdown"

**Split Bar or Stacked Bar:**

| Segment | Color |
|---------|-------|
| In-Person | Amber (#f59e0b) |
| Telehealth | Cyan (#06b6d4) |

### 11.6 Sessions Detail Table

**Rows:**

| Row | Indicator Color |
|-----|-----------------|
| Booked | Cyan (#06b6d4) |
| Completed | Emerald (#10b981) — highlighted |
| Client Cancelled | Rose (#ef4444) |
| Clinician Cancelled | Blue (#3b82f6) |
| Late Cancelled | Amber (#f59e0b) |
| No Show | Gray (#6b7280) |

---

## 12. Practice Analysis - Client & Capacity Tab

**Route:** `/analysis?tab=capacity-client`
**Accent Color:** Amber

### 12.1 Executive Summary

**Headline:** "Capacity Healthy, Room to Grow"
**Summary:** e.g.:
> "You currently have **156 active clients** out of **180 capacity** (**87% utilization**). Net growth this period is **+14 clients** (+72 new, -58 churned). Session utilization averages **85%**—excellent efficiency."

### 12.2 Hero Stats Row

| Card | Title | Value | Subtitle |
|------|-------|-------|----------|
| 1 | "Active Clients" | "156" | "right now" |
| 2 | "Net Growth" | "+14" | "total" |
| 3 | "Caseload Capacity" | "87%" | "average" |
| 4 | "Session Goal %" | "85%" | "average" |

### 12.3 Active Clients & Caseload Chart

**Card Title:** "Active Clients & Caseload Capacity"
**Card Subtitle:** "How full your practice is each month"

**Toggle:** "Caseload Capacity" — switches between:
- Active Clients count (bar chart)
- Capacity percentage (bar chart with color coding)

**Capacity % Bar Colors:**

| Range | Color |
|-------|-------|
| ≥90% | Emerald gradient |
| 75-89% | Amber gradient |
| <75% | Rose gradient |

**Insights (Active Clients mode):**

| Insight | Format |
|---------|--------|
| Best Month | "Oct (158)" |
| Average | "148" |
| Range | "142–158" |

**Insights (Capacity mode):**

| Insight | Format |
|---------|--------|
| Peak | "Oct (88%)" |
| Average | "83%" |
| Range | "81%–88%" |

### 12.4 Client Movement Chart

**Card Title:** "New & Churned Clients"
**Card Subtitle:** "How your client base is changing"

**Chart Type:** Diverging Bar Chart

**Legend:**

| Direction | Label | Color |
|-----------|-------|-------|
| Positive (up) | "New" | Emerald gradient |
| Negative (down) | "Churned" | Rose gradient |

**Insights:**

| Insight | Format | Color |
|---------|--------|-------|
| Net Change | "+14" or "-5" | Green if positive, Red if negative |
| Avg New/mo | "+6.0" | Emerald |
| Avg Churn/mo | "-4.8" | Rose |

### 12.5 Client Demographics (Stacked Bars)

Three horizontal stacked bar cards:

**Card 1: Client Gender**

| Segment | Color | Example |
|---------|-------|---------|
| Male | Blue (#3b82f6) | 127 (33%) |
| Female | Pink (#ec4899) | 241 (62%) |
| Other | Purple (#a855f7) | 18 (5%) |

**Card 2: Session Frequency**

| Segment | Color | Example |
|---------|-------|---------|
| Weekly | Emerald (#10b981) | 198 (51%) |
| Bi-weekly | Blue (#3b82f6) | 156 (40%) |
| Monthly | Amber (#f59e0b) | 32 (8%) |

### 12.6 Session Utilization Chart

**Card Title:** "Session Utilization"
**Card Subtitle:** "How efficiently you're using available time"

**Line Chart:**
- Y-Axis: Percentage (0-100%)
- Shows % of available hours actually used

---

## 13. Practice Analysis - Retention Tab

**Route:** `/analysis?tab=retention`
**Accent Color:** Rose

### 13.1 Page Header

**Label:** "Detailed Analysis"
**Title:** "Retention"
**Subtitle:** "Understand how clients progress through their journey with your practice"

**Note:** This tab uses cohort-based analysis instead of time period filtering.

### 13.2 Section 1: Cohort Selector

**Section Header:**
- **Number:** 1
- **Question:** "Which clients do you want to look at?"
- **Description:** "Pick a time period"
- **Accent:** Indigo

**Cohort Options:**

| ID | Label | Sublabel | Client Count | Recommended |
|----|-------|----------|--------------|-------------|
| all-time | "All Time" | "Every client since you opened" | 412 | Yes (badge) |
| this-year | "This Year" | "Clients who started in 2025" | 89 | No |
| last-year | "Last Year" | "Clients who started in 2024" | 142 | No |

**Card Selection:** Click to select, reveals data sections below

### 13.3 Cohort Summary Stats

When a cohort is selected, 4 stat cards appear:

| Card | Title | Value | Subtitle |
|------|-------|-------|----------|
| 1 | "Clients Acquired" | "412" | "since you opened" |
| 2 | "Clients Churned" | "256" | "62% of cohort" |
| 3 | "Active Clients" | "156" | "38% still active" |
| 4 | "Avg Sessions Completed" | "18.2" | "sessions per client" |

### 13.4 Section 2: Churn Patterns

**Section Header:**
- **Number:** 1
- **Question:** "When do clients leave?"
- **Description:** "Monthly churn trends and timing breakdown"
- **Accent:** Rose

#### Chart 1: Clients Churned Bar Chart

**Card Title:** "Clients Churned"
**Card Subtitle:** "Monthly churn breakdown"

**Toggle:** "By Clinician" button

**Single Mode:** Rose gradient bars

**Stacked Mode (By Clinician):**

| Clinician | Color |
|-----------|-------|
| S Chen | Cyan (#0891b2) |
| M Rodriguez | Teal (#0d9488) |
| A Patel | Sky (#0284c7) |
| J Kim | Purple (#7c3aed) |
| M Johnson | Pink (#db2777) |

**Insights:**

| Insight | Format |
|---------|--------|
| Total Churned | "58" |
| Avg/month | "4.8" |
| Peak | "Sep (11)" |

#### Chart 2: Churn Timing Donut

**Card Title:** "Churn Timing"
**Card Subtitle:** "When clients leave by session count"

**Donut Segments:**

| Segment | Label | Color | Meaning |
|---------|-------|-------|---------|
| 1 | "Early (<5 sessions)" | Rose (#ef4444) | Left before 5 sessions |
| 2 | "Medium (5-15)" | Amber (#f59e0b) | Left between 5-15 sessions |
| 3 | "Late (>15)" | Emerald (#10b981) | Left after 15+ sessions |

**Center Display:** "Total Churned" + count

### 13.5 Section 3: Return Rate Charts

**Section Header:**
- **Number:** 2
- **Question:** "How far do clients get?"
- **Description:** "Session milestones and time-based return rates"
- **Accent:** Amber

#### Chart 1: Return Rate by Session

**Card Title:** "Return Rate by Session"
**Card Subtitle:** "% of clients still active at each session milestone"

**Legend:**

| Line | Color |
|------|-------|
| Your Practice | Amber (#f59e0b) |
| Industry Avg | Stone/Gray (#a8a29e) |

**X-Axis Labels (Session Milestones):**

| Point | Label |
|-------|-------|
| 1 | "S1" |
| 2 | "S2" |
| 3 | "S5" |
| 4 | "S12" |
| 5 | "S24" |

**Example Data:**

| Milestone | Practice | Industry Avg |
|-----------|----------|--------------|
| S1 | 100% | 100% |
| S2 | 88% | 82% |
| S5 | 76% | 65% |
| S12 | 60% | 45% |
| S24 | 43% | 28% |

**Insights:**

| Insight | Format | Color |
|---------|--------|-------|
| Final Retention | "43%" | Amber |
| vs Industry | "+15%" | Emerald if positive |

#### Chart 2: Return Rate by Time

**Card Title:** "Return Rate by Time"
**Card Subtitle:** "% of clients still active at each time milestone"

**Legend:**

| Line | Color |
|------|-------|
| Your Practice | Indigo (#6366f1) |
| Industry Avg | Stone/Gray (#a8a29e) |

**X-Axis Labels (Time Milestones):**

| Point | Label |
|-------|-------|
| 1 | "Mo 1" |
| 2 | "Mo 3" |
| 3 | "Mo 6" |
| 4 | "Mo 9" |
| 5 | "Mo 12" |

**Example Data:**

| Milestone | Practice | Industry Avg |
|-----------|----------|--------------|
| Mo 1 | 100% | 100% |
| Mo 3 | 87% | 78% |
| Mo 6 | 72% | 55% |
| Mo 9 | 60% | 42% |
| Mo 12 | 57% | 38% |

---

## 14. Practice Analysis - Insurance Tab

**Route:** `/analysis?tab=insurance`
**Accent Color:** Violet

### 14.1 Page Header

**Label:** "Detailed Analysis"
**Title:** "Insurance"
**Subtitle:** Current time period date range

### 14.2 Coming Soon Card

**Title:** "Insurance Analytics"
**Description:** "Comprehensive insurance billing and claims analytics are being crafted to give you complete visibility into your practice's payer relationships."

**Planned Features (listed):**
- Claims Tracking
- Payer Mix Analysis
- Denial Management
- Reimbursement Rates
- AR Aging Reports

---

## 15. Practice Analysis - Admin Tab

**Route:** `/analysis?tab=admin`
**Accent Color:** Blue

### 15.1 Page Header

**Label:** "Detailed Analysis"
**Title:** "Admin"
**Subtitle:** Current time period date range

### 15.2 Coming Soon Card

**Title:** "Administrative Analytics"
**Description:** "Powerful administrative insights are being developed to streamline your practice operations and enhance team productivity."

**Planned Features (listed):**
- Note Compliance
- Reminder Delivery
- Client Balances
- Staff Productivity
- Audit Trails

---

---

## 16. Practice Configuration - Overview

The Practice Configuration page allows practice owners to set up and customize their practice structure, clinician settings, performance goals, and metric calculations.

**Route:** `/configure`
**Navigation:** Main navigation → "Configure"

### 16.1 Page Layout

**Header:**
- **Accent Color:** Amber gradient
- **Label:** "Settings"
- **Title:** "Configure"
- **Subtitle:** "Set up your practice structure, goals, and metrics"

**Tab Navigation (7 tabs):**

| Tab ID | Label | Description |
|--------|-------|-------------|
| locations | "Locations" | Practice office locations |
| members | "Team Members" | Clinician credentials and roles |
| team | "Team Structure" | Supervisor assignments |
| clinician-goals | "Clinician Goals" | Individual session/client/take rate targets |
| goals | "Practice Goals" | Practice-wide performance targets |
| thresholds | "Thresholds" | Metric calculation definitions |
| ehr | "EHR Connection" | Data sync settings |

---

## 17. Practice Configuration - Locations Tab

**Route:** `/configure?tab=locations`

### 17.1 Section Header

**Title:** "Practice Locations"
**Subtitle:** "Manage your physical office locations"

**Add Button:** "Add Location" (amber gradient)

### 17.2 Location Card

```
┌────────────────────────────────────────────────────┐
│ ══════════════════ (amber accent if primary)       │
│                                                    │
│  [Building Icon]   Location Name    [PRIMARY]      │
│                    Full address                    │
│                                                    │
│  ─────────────────────────────────────────────     │
│  [Set Primary]                         [Remove]    │
└────────────────────────────────────────────────────┘
```

**Fields:**

| Field | Example |
|-------|---------|
| Name | "Manhattan" |
| Address | "350 Fifth Avenue, Suite 4200, New York, NY 10118" |
| Primary Badge | "PRIMARY" (amber, only on primary location) |

**Actions:**
- "Set Primary" — makes this the primary location
- "Remove" — deletes the location

### 17.3 Add Location Form

| Field | Placeholder |
|-------|-------------|
| Location Name | "e.g., Main Office" |
| Address | "123 Main St, City, State ZIP" |

**Buttons:**
- "Cancel" — closes form
- "Save Location" — emerald gradient, saves location

### 17.4 Empty State

**Icon:** MapPin in stone circle
**Title:** "No locations yet"
**Subtitle:** "Add your first practice location to get started"

---

## 18. Practice Configuration - Team Members Tab

**Route:** `/configure?tab=members`

### 18.1 Section Header

**Title:** "Team Members"
**Subtitle:** "Configure credentials and roles for each clinician"

### 18.2 Team Members Table

**Column Headers:**

| Column | Width |
|--------|-------|
| Clinician | 4 cols |
| License | 2 cols |
| Role | 2 cols |
| Needs Supervision | 2 cols (center) |
| Status | 2 cols (center) |

### 18.3 Clinician Row

**Clinician Column:**
- Avatar (colored square with initials)
- Full name (DM Serif Display font)
- Start date: "Since {Mon YYYY}"

**License Dropdown Options:**

| Value | Full Name |
|-------|-----------|
| LCSW | Licensed Clinical Social Worker |
| LMSW | Licensed Master Social Worker |
| LMHC | Licensed Mental Health Counselor |
| MHC-LP | Mental Health Counselor - Limited Permit |
| LPC | Licensed Professional Counselor |
| LMFT | Licensed Marriage & Family Therapist |
| PhD | Doctor of Philosophy (Psychology) |
| PsyD | Doctor of Psychology |
| MD | Medical Doctor (Psychiatrist) |
| NP | Nurse Practitioner |
| Other | Other |

**Role Dropdown Options:**
- Clinical Director
- Supervisor
- Senior Therapist
- Therapist
- Associate

**Needs Supervision Toggle:**
- Violet toggle switch
- Auto-enabled for LMSW, MHC-LP, Associate roles

**Status Toggle:**
- "Active" — emerald pill
- "Inactive" — stone/gray pill

---

## 19. Practice Configuration - Team Structure Tab

**Route:** `/configure?tab=team`

### 19.1 Section Header

**Title:** "Team Structure"
**Subtitle:** "Assign supervisors to clinicians who need supervision"

### 19.2 Status Summary Bar

**If unassigned clinicians exist:**
- Amber background with warning icon
- Text: "{X} clinician(s) need(s) a supervisor"
- Right side: "{X} of {Y} assigned"

**If all assigned:**
- Emerald background with checkmark
- Text: "All clinicians have supervisors assigned"

### 19.3 Supervision Assignment Table

**Column Headers:**

| Column | Width |
|--------|-------|
| Clinician | 5 cols |
| License & Role | 3 cols |
| Supervisor | 4 cols |

**Clinician Row (needs supervision):**
- Avatar + name
- Warning text: "Needs supervisor" (amber) if unassigned
- Amber highlight on entire row if unassigned

**Supervisor Dropdown:**
- Placeholder: "Select supervisor..."
- Options: All clinicians who don't require supervision
- Format: "{Name} ({License})"

### 19.4 Available Supervisors Reference

**Section at bottom:**
- Label: "Available Supervisors"
- Cards showing: Avatar + Name + License type

### 19.5 Empty State

**Icon:** Checkmark in emerald circle
**Title:** "No supervision assignments needed"
**Subtitle:** "All active clinicians are marked as independent in Team Members"

---

## 20. Practice Configuration - Clinician Goals Tab

**Route:** `/configure?tab=clinician-goals`

### 20.1 Section Header

**Title:** "Clinician Goals"
**Subtitle:** "Set individual performance targets and compensation"

**Save Button:** "Save Changes" (emerald) — appears when changes made

### 20.2 Practice Totals Bar

Dark bar with totals:

| Metric | Icon | Format |
|--------|------|--------|
| Sessions | Calendar (blue) | "{total} sessions/wk" |
| Clients | Users (emerald) | "{total} clients" |
| Avg Take Rate | DollarSign (amber) | "{avg}% avg take" |

### 20.3 Clinician Goal Card

```
┌────────────────────────────────────────────────────────────────┐
│  [Avatar]  Clinician Name      [Session]  [Clients]  [Take%]  │
│            Role                                                │
└────────────────────────────────────────────────────────────────┘
```

**Inline Input Fields:**

| Field | Background | Icon | Suffix | Color |
|-------|------------|------|--------|-------|
| Session Goal | Blue-50 | Calendar | "/wk" | Blue |
| Client Goal | Emerald-50 | Users | "clients" | Emerald |
| Take Rate | Amber-50 | DollarSign | "%" | Amber |

**Input Format:** Large number input (DM Serif Display font)

---

## 21. Practice Configuration - Practice Goals Tab

**Route:** `/configure?tab=goals`

### 21.1 Section Header

**Title:** "Practice Goals"
**Subtitle:** "Set your practice-wide performance targets"

**Save Button:** "Save Changes" (emerald) — appears when changes made

### 21.2 Goal Cards (2x2 Grid)

#### Card 1: Monthly Revenue

**Icon:** DollarSign (emerald)
**Title:** "Monthly Revenue"
**Subtitle:** "Target gross revenue per month"
**Accent:** Emerald gradient

**Input:** Dollar amount with $ prefix
**Subtext:** "That's ${annual}/year"

#### Card 2: Monthly Sessions

**Icon:** Calendar (blue)
**Title:** "Monthly Sessions"
**Subtitle:** "Target completed sessions"
**Accent:** Blue gradient

**Input:** Number
**Subtext:** "That's {weekly} sessions/week"

#### Card 3: Target Rebook Rate

**Icon:** TrendingUp (amber)
**Title:** "Target Rebook Rate"
**Subtitle:** "Clients with next appointment scheduled"
**Accent:** Amber gradient

**Input:** Slider (50%-100%)
**Subtext:** "Industry average is 85%"

#### Card 4: Note Deadline

**Icon:** FileText (violet)
**Title:** "Note Deadline"
**Subtitle:** "Hours after session for completion"
**Accent:** Violet gradient

**Options (button row):** 24h, 48h, 72h, 96h
**Selected State:** Violet background with shadow
**Subtext:**
- 24h: "Strict compliance standard"
- 48h: "Standard practice policy"
- 72h: "Common 3-day policy"
- 96h: "Lenient 4-day policy"

---

## 22. Practice Configuration - Thresholds Tab

**Route:** `/configure?tab=thresholds`

### 22.1 Section Header

**Title:** "Metric Definitions"
**Subtitle:** "Customize how metrics are calculated and displayed"

**Save Button:** "Save Changes" (emerald) — appears when changes made

### 22.2 Active & Churned Client Definition

**Icon:** UserCircle (blue)
**Title:** "Active & Churned Clients"
**Subtitle:** "How to determine if a client is active or has churned"

**Option 1: SimplePractice Status**
- **Description:** Uses EHR status field
- Active = status is "Active" in SimplePractice
- Churned = status is "Inactive" with no future appointments

**Option 2: Activity-Based**
- **Description:** Uses session recency
- Active = had an appointment within threshold
- Churned = no appointment within threshold AND none scheduled
- **Additional Input:** Activity threshold (7-90 days)

**Selection:** Radio button style with checkmark

### 22.3 At-Risk Client Thresholds

**Icon:** Clock (amber)
**Title:** "At-Risk Client Thresholds"
**Subtitle:** "Days since last session for clients without upcoming appointments"

**Three-Column Layout:**

| Risk Level | Background | Default |
|------------|------------|---------|
| Low Risk | Emerald-50 | 14 days |
| Medium Risk | Amber-50 | 21 days |
| High Risk | Rose-50 | 30 days |

### 22.4 Churn Timing Categories

**Icon:** AlertTriangle (violet)
**Title:** "Churn Timing Categories"
**Subtitle:** "Categorize churned clients by sessions completed before leaving"

**Three-Column Layout:**

| Category | Background | Description | Input |
|----------|------------|-------------|-------|
| Early Churn | Rose-50 | "Engagement issues" | < X sessions |
| Medium Churn | Amber-50 | "Treatment plateau" | X – Y sessions (calculated) |
| Late Churn | Emerald-50 | "Natural completion" | > Y sessions |

### 22.5 Late Cancel Window

**Icon:** X (orange)
**Title:** "Late Cancel Window"
**Subtitle:** "Hours before appointment to count as late"

**Input:** Number (1-72 hours)
**Format:** "{hours} hours before"

### 22.6 Note Deadline

**Icon:** FileText (purple)
**Title:** "Note Deadline"
**Subtitle:** "Days after session for note completion"

**Input:** Number (1-14 days)
**Format:** "{days} days after session"

### 22.7 Revenue Status Thresholds

**Icon:** DollarSign (emerald)
**Title:** "Revenue Status"

**Sliders:**

| Setting | Range | Default |
|---------|-------|---------|
| Healthy above | 50-100% of goal | 95% |
| Critical below | 50-100% of goal | 80% |

### 22.8 Rebook Rate Status Thresholds

**Icon:** TrendingUp (blue)
**Title:** "Rebook Rate Status"

**Sliders:**

| Setting | Range | Default |
|---------|-------|---------|
| Healthy above | 50-100% | 90% |
| Critical below | 50-100% | 75% |

---

## 23. Practice Configuration - EHR Connection Tab

**Route:** `/configure?tab=ehr`

### 23.1 Section Header

**Title:** "EHR Connection"
**Subtitle:** "Manage your data sync with your practice management system"

### 23.2 Connection Status Card

**Full-width card with accent bar:**
- Connected: Emerald gradient
- Disconnected: Rose gradient

```
┌────────────────────────────────────────────────────────────────┐
│ ══════════════════ (emerald if connected)                      │
│                                                                │
│  [Wifi Icon]   SimplePractice   [CONNECTED]   [Refresh Now]   │
│                Last synced: Dec 12, 2024 6:00 AM               │
└────────────────────────────────────────────────────────────────┘
```

**Status Badge:**
- "Connected" — emerald
- "Syncing..." — amber
- "Disconnected" — rose

**Refresh Button:**
- Text: "Refresh Now"
- Icon: RefreshCw (spins while syncing)
- Disabled state when syncing

### 23.3 Synced Data Card

**Icon:** Users (blue)
**Title:** "Synced Data"

**Stats Grid (2 columns):**

| Stat | Value |
|------|-------|
| Active Clients | 156 |
| Clinicians | 5 |

### 23.4 Next Sync Card

**Icon:** Clock (amber)
**Title:** "Next Automatic Sync"

**Countdown Display:**
- Format: "Xh Xm" or "Available now"
- Date/time of next sync

**Note:** "Data syncs automatically once per day. Manual refresh available when countdown reaches zero."

---

---

## 24. Settings Page

The Settings page manages user account preferences, display options, billing, security, and support access.

**Route:** `/settings`
**Navigation:** Main navigation → "Settings" (user profile area)

### 24.1 Page Header

**Accent Color:** Amber gradient
**Label:** "Account"
**Title:** "Settings"
**Subtitle:** "Manage your account preferences and practice configuration"

---

### 24.2 Profile Card (Hero Section)

**Layout:** Full-width card at top of page

```
┌────────────────────────────────────────────────────────────────┐
│  [Profile Photo]   User Name   [PRO Badge]   [Edit Profile]   │
│       ✓            Practice Administrator                      │
│                    email@practice.com                          │
│                    Practice Name                               │
└────────────────────────────────────────────────────────────────┘
```

**Profile Photo:**
- 80x80px rounded square
- Green checkmark badge in bottom-right corner

**User Info:**
- **Name:** Large serif font (DM Serif Display)
- **PRO Badge:** Amber gradient pill with sparkle icon
- **Role:** "Practice Administrator" in amber
- **Email:** Icon + email address
- **Practice:** Building icon + practice name

**Edit Button:** "Edit Profile" — dark gradient button

---

### 24.3 Display Options Section

**Section Title:** "DISPLAY OPTIONS"

| Setting | Icon | Description | Control |
|---------|------|-------------|---------|
| Net Revenue Data | DollarSign | "Show net revenue, margins, and cost breakdowns" | Toggle |
| Demo Mode | UserX | "Use anonymized clinician names for presentations" | Toggle |

**Toggle Switch:**
- Off: Stone gray track
- On: Amber gradient track with dot indicator

---

### 24.4 Billing Section

**Section Title:** "BILLING"

**Subscription Card:**

| Element | Content |
|---------|---------|
| Icon | CreditCard in amber gradient square |
| Plan Name | "Cortexa Pro" |
| Status Badge | "Active" (emerald) |
| Price Details | "$199/month • Unlimited seats" |
| Price Display | "$199 per month" (large) |

**Action Button:**
- **Text:** "Manage Billing in Stripe"
- **Icon:** ExternalLink
- **Style:** Dark button, full-width
- **Action:** Opens Stripe Customer Portal

**Footer Text:** "Update payment method, view invoices, or cancel subscription"

---

### 24.5 Preferences Section

**Section Title:** "PREFERENCES"

| Setting | Icon | Value Display | Action |
|---------|------|---------------|--------|
| Time Zone | Clock | "Eastern (ET)" | Opens Time Zone Modal |

---

### 24.6 Security Section

**Section Title:** "SECURITY"

| Setting | Icon | Description | Action |
|---------|------|-------------|--------|
| Password | Shield | "Last changed 3 months ago" | Opens Password Modal |

---

### 24.7 Support Section

**Section Title:** "SUPPORT"

| Setting | Icon | Description | Action |
|---------|------|-------------|--------|
| Help Center | HelpCircle | "Browse guides and frequently asked questions" | Opens Help Center |
| Contact Support | ExternalLink | "Get help from our team" | Opens Support |

---

### 24.8 Sign Out Section

**Standalone card with red accent:**

| Setting | Icon | Description | Action |
|---------|------|-------------|--------|
| Sign Out | LogOut | "End your current session" | Opens Logout Modal |

**Danger Styling:**
- Red icon background
- Red text
- Red hover state

---

### 24.9 Version Footer

**Text (centered):**
- **Version:** "Cortexa v2.4.1"
- **Tagline:** "Practice Intelligence Platform"

---

### 24.10 Logout Confirmation Modal

**Header:** Red gradient with LogOut icon

**Content:**
- **Title:** "Sign out?"
- **Message:** "You'll need to sign in again to access your practice analytics."

**Buttons:**
- "Cancel" — stone gray
- "Sign Out" — red gradient

---

### 24.11 Change Password Modal

**Title:** "Change Password"
**Subtitle:** "Enter your current password and choose a new one"

**Form Fields:**

| Field | Placeholder | Features |
|-------|-------------|----------|
| Current Password | "Enter current password" | Show/hide toggle |
| New Password | "Enter new password" | Show/hide toggle, "Must be at least 8 characters" hint |
| Confirm Password | "Confirm new password" | Show/hide toggle |

**Validation Errors:**
- "All fields are required"
- "New password must be at least 8 characters"
- "New passwords do not match"

**Error Display:** Red alert box with AlertCircle icon

**Success State:**
- Emerald checkmark animation
- **Title:** "Password Updated"
- **Message:** "Your password has been changed successfully."
- Auto-closes after 1.5 seconds

**Buttons:**
- "Cancel" — outlined
- "Update Password" — dark gradient

---

### 24.12 Time Zone Modal

**Title:** "Time Zone"
**Subtitle:** "Select your local time zone"

**Time Zone Options:**

| Abbreviation | Label | UTC Offset |
|--------------|-------|------------|
| ET | Eastern | UTC-5 |
| CT | Central | UTC-6 |
| MT | Mountain | UTC-7 |
| PT | Pacific | UTC-8 |
| AKT | Alaska | UTC-9 |
| HT | Hawaii | UTC-10 |

**Selected State:**
- Dark background
- White text
- Checkmark indicator

**Footer Note:** "Times throughout the app will display in your selected zone"

---

*End of Master App Documentation*
