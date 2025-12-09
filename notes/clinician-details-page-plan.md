# Clinician Details Page - Product Plan

## Purpose

Answer the question: **"How is [Clinician Name] performing, and what do I need to do about it?"**

This page gives practice owners a complete picture of a single clinician's health, performance, and any issues requiring attention—without overwhelming them with data.

---

## Design Philosophy

Per our audience profile:
- **Spoon-feed insights** - Don't make them hunt for problems
- **Lead with status** - Healthy/Warning/Critical at a glance
- **Compare to benchmarks** - "vs team avg" or "vs goal" on every metric
- **Action-oriented** - Every section should answer "so what?"
- **No complex charts** - Simple bars, single lines, or just numbers

---

## Page Structure

### 1. Header & Health Summary

**Clinician Identity Bar**
| Element | Content |
|---------|---------|
| Avatar | Colored square with initial (clinician color) |
| Name | Large, DM Serif Display |
| Role/Title | "Licensed Therapist" or similar |
| Supervisor | "Supervised by: Barbara Downs" (if applicable) |
| Location | "Durham" or "Remote" |
| Start Date | "With practice since Mar 2023" |

**Overall Health Score**
A single, prominent status indicator answering: "Should I be worried about this clinician?"

| Status | Criteria |
|--------|----------|
| **Healthy** | Meeting goals, no red flags |
| **Needs Attention** | 1-2 metrics below threshold |
| **Critical** | Multiple issues or severe underperformance |

Display as a large pill/badge with color coding (emerald/amber/rose).

**One-Line Summary** (AI-generated)
> "Chen is performing well overall. Revenue is 12% above team average, but cancellation rate has increased 2x in the last 30 days—worth a check-in."

---

### 2. Priority Alerts (Clinician-Specific)

**Section Header**: "Needs Your Attention" (only shows if there are issues)

Surface 1-3 actionable alerts specific to this clinician. Examples:

| Alert Type | Example |
|------------|---------|
| **Retention Drop** | "4 of Chen's new clients from August have already churned (50% vs 20% practice avg)" |
| **Cancellation Spike** | "Cancellations jumped from 2/month to 8/month in September" |
| **Notes Overdue** | "12 notes overdue (oldest: 18 days)" |
| **Low Rebook Rate** | "Only 72% of clients have next appointment scheduled (goal: 85%)" |
| **Capacity Issue** | "At 95% caseload capacity—may need to close to new clients" |

Each alert card includes:
- Status badge (Warning/Critical)
- Plain-English explanation
- Suggested action
- "View Details" button

**If no alerts**: Show a positive message: "No issues detected. Chen is performing well."

---

### 3. Key Metrics Row (6 Cards)

Quick-scan metrics with goal/benchmark comparison. All metrics show:
- Current value (large)
- vs Goal or vs Team Avg
- Trend arrow (up/down/flat from last period)

| Metric | Format | Comparison |
|--------|--------|------------|
| **Revenue** | $XX.Xk | vs $XXk goal |
| **Sessions Completed** | XXX | vs XXX goal |
| **Show Rate** | XX% | vs XX% team avg |
| **Rebook Rate** | XX% | vs 85% goal |
| **Active Clients** | XX | of XX capacity |
| **Notes Overdue** | X | vs <X goal |

**Status Colors**:
- Emerald border/accent if meeting goal
- Amber if within 10% of goal
- Rose if significantly below

---

### 4. Financial Performance

**Section Header**: "Financial" (indigo accent)

**4.1 Revenue Over Time**
| Element | Content |
|---------|---------|
| Chart Type | Simple bar chart (monthly) |
| Goal Line | Dashed line at clinician's revenue goal |
| Bars | Green if above goal, blue if below |
| Time Range | Last 6-12 months |

**4.2 Revenue Stats Row (3 cards)**
| Stat | Value |
|------|-------|
| Total Revenue (period) | $XX.Xk |
| Avg Monthly | $X.Xk |
| % of Practice Revenue | XX% |

**4.3 Revenue per Session**
| Element | Content |
|---------|---------|
| Value | $XXX avg |
| Comparison | "vs $XXX team avg" |
| Insight | Identifies if clinician has higher/lower-value sessions |

---

### 5. Session Performance

**Section Header**: "Sessions" (cyan accent)

**5.1 Sessions Over Time**
| Element | Content |
|---------|---------|
| Chart Type | Simple bar chart (monthly) |
| Goal Line | Dashed line at session goal |
| Time Range | Last 6-12 months |

**5.2 Attendance Breakdown**
| Element | Content |
|---------|---------|
| Chart Type | Horizontal stacked bar or simple donut |
| Segments | Completed, Client Cancelled, Clinician Cancelled, Late Cancel, No-Show |
| Key Metric | Show Rate (XX%) prominently displayed |

**5.3 Attendance Stats Row**
| Stat | Format | Comparison |
|------|--------|------------|
| Show Rate | XX% | vs XX% team avg |
| Client Cancel Rate | X.X% | vs X.X% team avg |
| Clinician Cancel Rate | X.X% | vs X.X% team avg |
| No-Show Rate | X.X% | vs X.X% team avg |

**Insight Card** (if applicable):
> "Chen's client cancellation rate (8.2%) is 2x the team average (4.1%). This may indicate scheduling issues or client-fit problems."

---

### 6. Client & Caseload

**Section Header**: "Clients" (amber accent)

**6.1 Caseload Capacity Gauge**
| Element | Content |
|---------|---------|
| Visual | Semi-circle gauge or simple progress bar |
| Value | XX/XX clients (XX% full) |
| Status | Color-coded (green <80%, amber 80-95%, red >95%) |

**6.2 Client Movement (This Period)**
| Stat | Value | Sentiment |
|------|-------|-----------|
| New Clients | +X | Positive (emerald) |
| Churned Clients | -X | Negative (rose) |
| Net Change | +/-X | Calculated |

**6.3 Client Retention Funnel**
Simplified funnel for THIS clinician's clients:

| Stage | Count | % |
|-------|-------|---|
| Started | XX | 100% |
| Reached Session 5 | XX | XX% |
| Reached Session 12 | XX | XX% |
| Still Active | XX | XX% |

**6.4 At-Risk Clients List**
| Element | Content |
|---------|---------|
| Title | "Clients Without Upcoming Appointments" |
| Display | Client name, days since last session, risk level |
| Max Preview | 5 clients |
| Action | "View All" link |

---

### 7. Retention Deep-Dive

**Section Header**: "Retention" (rose accent)

**7.1 Rebook Rate Trend**
| Element | Content |
|---------|---------|
| Chart Type | Simple line chart |
| Y-Axis | 70-100% |
| Benchmark Line | 85% goal (dashed) |
| Time Range | Last 6 months |

**7.2 Retention Comparison**
| Metric | This Clinician | Team Avg | Status |
|--------|----------------|----------|--------|
| Rebook Rate | XX% | XX% | ✓/⚠/✗ |
| Churn Rate | X.X% | X.X% | ✓/⚠/✗ |
| Avg Sessions/Client | X.X | X.X | ✓/⚠/✗ |
| Session 2 Return Rate | XX% | XX% | ✓/⚠/✗ |

**7.3 Insight Card**
> "Chen retains clients longer than average (14.2 sessions vs 11.8 team avg), but new client retention is concerning—only 65% return for session 2 (vs 78% team avg)."

---

### 8. Compliance

**Section Header**: "Compliance" (stone accent)

**8.1 Notes Status**
| Element | Content |
|---------|---------|
| Primary Metric | X notes overdue |
| Status | Green (<5), Amber (5-10), Red (>10) |
| Detail | "Oldest: X days overdue" |

**8.2 Notes Overdue List** (if any)
| Client | Session Date | Days Overdue |
|--------|--------------|--------------|
| John Smith | Nov 15 | 12 days |
| Jane Doe | Nov 18 | 9 days |

**8.3 Compliance Trend**
| Element | Content |
|---------|---------|
| Chart Type | Simple line or sparkline |
| Metric | % of notes completed on time (last 6 months) |

---

### 9. Trends & Comparison

**Section Header**: "Performance Trends" (indigo accent)

**9.1 Multi-Metric Trend View**
Small multiples or sparklines showing 6-month trends for:
- Revenue
- Sessions
- Show Rate
- Rebook Rate
- Active Clients

Each shows direction arrow and % change.

**9.2 Team Comparison Card**
| Metric | Rank | Percentile |
|--------|------|------------|
| Revenue | #2 of 5 | Top 40% |
| Sessions | #1 of 5 | Top 20% |
| Show Rate | #4 of 5 | Bottom 40% |
| Retention | #3 of 5 | Middle |

Visual: Simple horizontal position indicator showing where they fall in the team.

---

## Navigation & Actions

**Quick Actions (Top Right)**
| Action | Description |
|--------|-------------|
| Schedule Check-in | Opens calendar to schedule 1:1 |
| Send Message | Opens communication modal |
| View Full Report | Exports detailed PDF |
| Edit Goals | Adjust clinician's personal goals |

**Tab Navigation** (if page gets long)
- Overview (default)
- Financial
- Sessions
- Clients
- Retention
- Compliance

Or: Single scrollable page with sticky section navigation.

---

## Data & Time Controls

**Time Period Selector**
| Option | Description |
|--------|-------------|
| This Month | Current month to date |
| Last Month | Previous complete month |
| This Quarter | Current quarter |
| Last 6 Months | Rolling 6 months |
| Last 12 Months | Rolling 12 months |
| Custom Range | Date picker |

**Comparison Toggle**
- vs Previous Period
- vs Team Average
- vs Goal

---

## Empty States & Edge Cases

| Scenario | Handling |
|----------|----------|
| New clinician (<30 days) | "Chen just started! We'll have meaningful data after their first full month." |
| No alerts | "No issues detected. Chen is performing well across all metrics." |
| Missing data | Gray out metric, show "Data unavailable" |
| Terminated clinician | Show historical data with "No longer active" banner |

---

## Priority for MVP

### Must Have (Phase 1)
1. Header with health score
2. Key Metrics Row (6 cards)
3. Priority Alerts section
4. Sessions over time chart
5. Attendance breakdown
6. Active clients & caseload capacity
7. Notes overdue count

### Should Have (Phase 2)
1. Revenue over time chart
2. Client movement (new/churned)
3. Rebook rate trend
4. At-risk clients list
5. Team comparison card

### Nice to Have (Phase 3)
1. AI-generated summary
2. Full retention funnel
3. Compliance trend
4. Export/reporting
5. Quick actions (schedule check-in, etc.)

---

## Success Metrics

How we know this page is working:

| Metric | Target |
|--------|--------|
| Time to find issue | <30 seconds |
| User comprehension | >90% understand health status |
| Action taken | >50% of visits result in action (if alert shown) |
| Return visits | Users check individual clinicians weekly |

---

## Open Questions

1. **Should we show compensation data?** (sensitive, may need role-based access)
2. **How granular should time controls be?** (weekly vs monthly)
3. **Should clinicians see their own page?** (self-service vs manager-only)
4. **What triggers an alert?** (need to define exact thresholds)
5. **How do we handle part-time clinicians?** (pro-rated goals?)

---

## Next Steps

1. Review with stakeholders for priority alignment
2. Define exact alert thresholds
3. Create wireframes for key sections
4. Validate with 2-3 practice owners
5. Finalize MVP scope
