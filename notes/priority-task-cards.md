# Priority Task Cards — Complete Specification

> **Purpose:** The Priority Tasks section serves as the practice owner's daily briefing. They should never *need* to explore dashboards to understand how their practice is doing. Cards surface everything important, with clear storylines and actions.

---

## Design Philosophy

### Audience Reminder
- **Poor at understanding data** — no complex charts, just clear statements
- **Struggle with technology** — zero learning curve
- **Hate admin work** — tell them what to do, not just what's happening
- **Time-starved** — glanceable, scannable, actionable

### Card Principles
1. **One clear takeaway** per card
2. **Specific names** — "Patel" not "a clinician"
3. **Comparison to baseline** — vs goal, vs average, vs last month
4. **Action-oriented** — every card answers "what do I do?"
5. **Time-sensitive framing** — "today" vs "this week" vs "this month"

---

## Card Anatomy

Every card follows this structure:

```
┌─────────────────────────────────────────┐
│ [Status Color Bar]                      │
├─────────────────────────────────────────┤
│ [Badge: Urgent/Attention/Opportunity]   │
│                                         │
│ [Title]                                 │
│                                         │
│ [AI Guidance — the storyline]           │
│                                         │
│ [Stats Row — 2-4 key numbers]           │
│                                         │
│ [Action Button]                         │
└─────────────────────────────────────────┘
```

### Status Levels

| Status | Color | Badge Text | Use For |
|--------|-------|------------|---------|
| Critical | Red | "Urgent" | Problems that need immediate action |
| Warning | Amber | "Attention" | Issues that will become problems if ignored |
| Good | Green | "Opportunity" | Positive situations to capitalize on |
| Neutral | Blue/Indigo | "Insight" | Patterns and trends worth knowing |

---

## Card Catalog

### 🔴 URGENT CARDS (Critical)

---

#### 1. Early Engagement Warning

**Purpose:** Alert when a clinician is losing new clients before they establish a therapeutic relationship.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician's new clients (last 90 days) have <70% return rate after session 1 or 2, minimum 3 clients |
| **Status** | Critical |
| **Title** | "Early Engagement Warning" |

**AI Guidance Template:**
> "{Clinician} has lost {X} of their last {Y} new clients before session 3. That's a {Z}% early drop-off rate — your practice average is {avg}%. This pattern suggests intake or early engagement issues worth investigating.

**Example:**
> "Rachel K has lost 3 of their last 5 new clients before session 3. That's a 60% early drop-off rate — your practice average is 15%. This pattern suggests intake or early engagement issues worth investigating."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| New clients | White | "5 new clients" |
| Lost early | Red | "3 lost" |
| Drop-off rate | Red | "60%" |

**Action Button:** "Review Intake Process" or "Schedule Check-in"

**Configuration:**
- Threshold: Return rate % (default: 70%)
- Minimum clients: (default: 3)
- Lookback period: (default: 90 days)

---

#### 2. Burnout Signal

**Purpose:** Flag when a clinician shows multiple behavioral indicators of burnout or distress.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician has 2+ of: cancellation spike (2x baseline), schedule changes, reduced hours, late notes spike |
| **Status** | Critical |
| **Title** | "Burnout Signal" |

**AI Guidance Template:**
> "{Clinician}'s patterns have changed significantly this month. Cancellations are up {X}x, and {additional_signal}. These combined signals often indicate burnout. A supportive check-in is recommended."

**Example:**
> "Maria G's patterns have changed significantly this month. Cancellations are up 4x, and she's had 3 same-day schedule changes. These combined signals often indicate burnout. A supportive check-in is recommended."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Cancellations | Red | "4x increase" |
| Schedule changes | Amber | "3 this month" |
| Baseline | White | "vs 1/month" |

**Action Button:** "Schedule Check-in"

**Configuration:**
- Cancellation spike multiplier: (default: 2x)
- Signals required: (default: 2)

---

#### 3. Cash at Risk

**Purpose:** Surface accounts receivable early enough to address before it becomes awkward or uncollectible.

| Element | Specification |
|---------|---------------|
| **Trigger** | Any client balance outstanding > X days (default: 5 days) |
| **Status** | Critical if any balance >14 days, Warning if 5-14 days |
| **Title** | "Outstanding Balances" |

**AI Guidance Template:**
> "You have ${total} in outstanding balances across {count} clients. {Oldest_client} has the longest outstanding at {days} days (${amount}). Best practice is to follow up within 7 days."

**Example:**
> "You have $2,450 in outstanding balances across 4 clients. Jennifer Martinez has the longest outstanding at 12 days ($650). Best practice is to follow up within 7 days."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Total outstanding | Amber/Red | "$2.4k" |
| Clients | White | "4 clients" |
| Oldest | Red | "12 days" |

**Action Button:** "Send Reminders" or "View Balances"

**Tiered Display:**
| Days | Urgency | Row Color |
|------|---------|-----------|
| 5-7 days | Low | Stone/neutral |
| 8-14 days | Medium | Amber background |
| 15+ days | High | Red background |

**Configuration:**
- Initial alert threshold: (default: 5 days)
- Tier boundaries: (default: 5/8/15 days)

---

#### 4. Compliance Deadline

**Purpose:** Prevent billing and audit issues by surfacing notes that are due soon.

| Element | Specification |
|---------|---------------|
| **Trigger** | Notes due within X days for insurance billing or compliance |
| **Status** | Critical if due within 2 days, Warning if due within 7 days |
| **Title** | "Notes Due Soon" |

**AI Guidance Template:**
> "{Count} session notes are due within {days} for insurance billing. {Clinician} has the most with {X} notes. Late notes delay reimbursement and create audit risk."

**Example:**
> "8 session notes are due within 3 days for insurance billing. Sarah M has the most with 4 notes. Late notes delay reimbursement and create audit risk."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Notes due | Amber/Red | "8 notes" |
| Due in | Red | "3 days" |
| Most behind | White | "Rodriguez (4)" |

**Action Button:** "View Outstanding Notes"

**Configuration:**
- Warning threshold: (default: 7 days)
- Critical threshold: (default: 2 days)
- Notes deadline: (from practice settings)

---

### 🟠 ATTENTION CARDS (Warning)

---

#### 5. Rebook Needed

**Purpose:** Surface clients who haven't scheduled their next appointment, before they churn.

| Element | Specification |
|---------|---------------|
| **Trigger** | Active clients with no upcoming appointment, tiered by days since last session |
| **Status** | Warning |
| **Title** | "Clients Need Rebooking" |

**AI Guidance Template:**
> "{Count} clients finished sessions recently with nothing scheduled. {High_risk_count} are high risk (14+ days). Your average rebook time is {avg} days — these clients are overdue."

**Example:**
> "6 clients finished sessions recently with nothing scheduled. 2 are high risk (14+ days). Your average rebook time is 2 days — these clients are overdue."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Total unrebooked | Amber | "6 clients" |
| High risk | Red | "2 high risk" |
| Avg rebook time | White | "2 days typical" |

**Action Button:** "View Clients" or "Send Reminders"

**Risk Tiers:**
| Risk Level | Days Since Last Session | Display |
|------------|------------------------|---------|
| Low | 5-7 days | Stone/neutral |
| Medium | 7-14 days | Amber |
| High | 14+ days | Red |

**Configuration:**
- Risk tier boundaries: (default: 5/7/14 days)
- Exclude clients marked "on break"

---

#### 6. Session 1→2 Drop-off

**Purpose:** Highlight the critical first-session retention cliff at the practice level.

| Element | Specification |
|---------|---------------|
| **Trigger** | Practice-wide Session 1→2 return rate below threshold |
| **Status** | Warning |
| **Title** | "First Session Drop-off" |

**AI Guidance Template:**
> "{Percent}% of new clients this month didn't return after their first session. That's {count} potential long-term clients lost. Industry benchmark is 85% return rate. Review your intake experience."

**Example:**
> "28% of new clients this month didn't return after their first session. That's 4 potential long-term clients lost. Industry benchmark is 85% return rate. Review your intake experience."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Drop-off rate | Red | "28%" |
| Clients lost | Red | "4 clients" |
| Benchmark | White | "85% typical" |

**Action Button:** "Review Intake Process"

**Configuration:**
- Alert threshold: (default: <80% return rate)
- Minimum new clients for signal: (default: 5)

---

#### 7. Cancellation Pattern

**Purpose:** Surface unusual cancellation spikes for a clinician or time pattern.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician cancellations > 2x their baseline, OR day-of-week with > 2x practice average |
| **Status** | Warning |
| **Title** | "Cancellation Spike" |

**AI Guidance Template (Clinician):**
> "{Clinician} had {count} cancellations this month — that's {multiplier}x their usual rate of {baseline}. The practice average is {avg} cancellations per clinician. Worth a conversation."

**Example (Clinician):**
> "Maria G had 9 cancellations this month — that's 4x their usual rate of 2. The practice average is 3 cancellations per clinician. Worth a conversation."

**AI Guidance Template (Day Pattern):**
> "Tuesdays have {multiplier}x the cancellation rate of other days. {Count} of your {total} cancellations this month happened on Tuesdays. Review your Tuesday caseload."

**Example (Day Pattern):**
> "Tuesdays have 3x the cancellation rate of other days. 12 of your 28 cancellations this month happened on Tuesdays. Review your Tuesday caseload."

**Stats Row (Clinician):**
| Stat | Color | Example |
|------|-------|---------|
| This month | Amber | "9 cancellations" |
| Baseline | White | "2 typical" |
| Multiplier | Red | "4x increase" |

**Action Button:** "Explore Data" or "Schedule Check-in"

**Configuration:**
- Spike multiplier: (default: 2x)
- Minimum cancellations for signal: (default: 4)

---

#### 8. Revenue Behind Pace

// this is useful to alert that we are below the goal but not what we need to do  to get to the goal as the clinician cannot really do anything about it in this month

**Purpose:** Alert when monthly revenue is tracking below goal with time to recover.

| Element | Specification |
|---------|---------------|
| **Trigger** | Projected revenue (based on current pace) will miss monthly goal |
| **Status** | Warning |
| **Title** | "Revenue Behind Pace" |

**AI Guidance Template:**
> "You're ${gap}k behind pace to hit your ${goal}k goal. With {days} days left, you need ${daily}k/day to catch up. That's {sessions} more sessions than your current daily average."

**Example:**
> "You're $18k behind pace to hit your $100k goal. With 12 days left, you need $1.5k/day to catch up. That's 4 more sessions than your current daily average."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Current | Amber | "$62k" |
| Goal | White | "$100k goal" |
| Gap | Red | "$18k behind" |

**Action Button:** "View Revenue Details"

**Configuration:**
- Goal amount: (from practice settings)
- Alert threshold: (default: <90% of pro-rated goal)

---

#### 9. Sessions Behind Pace

// this is useful to alert that we are below the goal but not what we need to do  to get to the goal as the clinician cannot really do anything about it in this month

**Purpose:** Alert when monthly sessions are tracking below goal.

| Element | Specification |
|---------|---------------|
| **Trigger** | Projected sessions (based on current pace) will miss monthly goal |
| **Status** | Warning |
| **Title** | "Sessions Behind Pace" |

**AI Guidance Template:**
> "You've completed {current} sessions with {days} days left. To hit your {goal} goal, you need {needed} more — that's {daily}/day vs your current pace of {current_daily}/day."

**Example:**
> "You've completed 312 sessions with 10 days left. To hit your 475 goal, you need 163 more — that's 16/day vs your current pace of 12/day."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Completed | Amber | "312 sessions" |
| Goal | White | "475 goal" |
| Needed | Red | "163 to go" |

**Action Button:** "View Sessions Details"

**Configuration:**
- Goal amount: (from practice settings)
- Alert threshold: (default: <90% of pro-rated goal)

---

#### 10. Caseload Imbalance

**Purpose:** Flag when one clinician is overloaded while another is underutilized.

| Element | Specification |
|---------|---------------|
| **Trigger** | One clinician >90% capacity AND another <50% capacity |
| **Status** | Warning |
| **Title** | "Caseload Imbalance" |

**AI Guidance Template:**
> "{Overloaded} is at {high}% capacity while {Underutilized} is at {low}%. Consider rebalancing referrals. {Overloaded} may be at burnout risk; {Underutilized} has room for {openings} more clients."

**Example:**
> "Sarah M is at 95% capacity while Jasmine W is at 38%. Consider rebalancing referrals. Sarah M may be at burnout risk; Jasmine W has room for 12 more clients."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Highest | Red | "Chen: 95%" |
| Lowest | Amber | "Johnson: 38%" |
| Gap | White | "57% gap" |

**Action Button:** "Rebalance Referrals" or "View Caseloads"

**Configuration:**
- Overload threshold: (default: 90%)
- Underutilized threshold: (default: 50%)

---

#### 11. Churn Spike

**Purpose:** Alert when client churn is unusually high this period.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clients churned this month > 1.5x monthly average |
| **Status** | Warning |
| **Title** | "Higher Than Usual Churn" |

**AI Guidance Template:**
> "You lost {count} clients this month — that's {multiplier}x your usual rate of {avg}/month. Net growth is {net}. Review the retention tab to understand patterns."

**Example:**
> "You lost 8 clients this month — that's 2x your usual rate of 4/month. Net growth is -3. Review the retention tab to understand patterns."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Churned | Red | "8 clients" |
| Typical | White | "4/month" |
| Net growth | Red | "-3" |

**Action Button:** "View Retention Details"

**Configuration:**
- Spike multiplier: (default: 1.5x)

---

#### 12. Rebook Rate Dropping

**Purpose:** Surface a downward trend in rebook rate before it becomes critical.

| Element | Specification |
|---------|---------------|
| **Trigger** | Rebook rate declined for 2+ consecutive periods |
| **Status** | Warning |
| **Title** | "Rebook Rate Trending Down" |

**AI Guidance Template:**
> "Your rebook rate has dropped from {start}% to {current}% over the last {periods} months. That's {drop} percentage points. Clients without next appointments are at risk of churning."

**Example:**
> "Your rebook rate has dropped from 88% to 79% over the last 3 months. That's 9 percentage points. Clients without next appointments are at risk of churning."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Current rate | Amber | "79%" |
| Was | White | "88% (3mo ago)" |
| Drop | Red | "↓9 points" |

**Action Button:** "View At-Risk Clients"

**Configuration:**
- Minimum decline to alert: (default: 5 percentage points)
- Periods to compare: (default: 3 months)

---

#### 13. Needs Support

**Purpose:** Identify clinicians who are significantly underperforming and may need coaching.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician is >25% below team average on key metrics (revenue, sessions, or retention) |
| **Status** | Warning |
| **Title** | "Clinician Needs Support" |

**AI Guidance Template:**
> "{Clinician} is {percent}% below team average on {metric}. Their {metric_value} compares to the team average of {team_avg}. Consider a supportive check-in or coaching session."

**Example:**
> "Jasmine W is 35% below team average on completed sessions. Their 42 sessions compares to the team average of 65. Consider a supportive check-in or coaching session."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Their performance | Red | "42 sessions" |
| Team average | White | "65 avg" |
| Gap | Red | "35% below" |

**Action Button:** "Schedule Coaching"

**Configuration:**
- Below average threshold: (default: 25%)
- Metrics to evaluate: revenue, sessions, retention rate

---

#### 14. High-Value Client Risk

<!-- we should also flag which clinician this client belongs to -->


**Purpose:** Flag when a long-tenure, high-engagement client shows warning signs.

| Element | Specification |
|---------|---------------|
| **Trigger** | Client with >12 sessions or >6 months tenure has: no upcoming appointment, recent cancellation, or frequency drop |
| **Status** | Warning |
| **Title** | "Long-Term Client at Risk" |

**AI Guidance Template:**
> "{Client} has been with the practice for {tenure} and completed {sessions} sessions, but {risk_signal}. This is a high-value relationship worth protecting. Reach out personally."

**Example:**
> "Sarah Johnson has been with the practice for 14 months and completed 48 sessions, but hasn't scheduled in 18 days. This is a high-value relationship worth protecting. Reach out personally."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Tenure | White | "14 months" |
| Sessions | White | "48 sessions" |
| Risk signal | Red | "18 days no appt" |

**Action Button:** "Reach Out"

**Configuration:**
- Tenure threshold: (default: 6 months or 12 sessions)
- Days without appointment: (default: 14)

---

#### 15. Session Frequency Dropping

**Purpose:** Surface clients whose booking frequency is declining — an early churn indicator before they stop booking entirely.

| Element | Specification |
|---------|---------------|
| **Trigger** | Established client (10+ sessions) decreased session frequency by >50% for 3+ weeks |
| **Status** | Warning |
| **Title** | "Session Frequency Dropping" |

**AI Guidance Template:**
> "{Client} has gone from {previous_frequency} to {current_frequency} over the last {weeks} weeks. Frequency drops often precede churn. Their clinician ({Clinician}) should check in about treatment goals."

**Example:**
> "David L has gone from weekly sessions to bi-weekly over the last 4 weeks. Frequency drops often precede churn. Their clinician (Sarah M) should check in about treatment goals."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Previous frequency | White | "Weekly" |
| Current frequency | Amber | "Bi-weekly" |
| Duration | Amber | "4 weeks" |

**Action Button:** "Notify Clinician" or "View Client"

**Configuration:**
- Minimum sessions for established client: (default: 10)
- Frequency drop threshold: (default: 50%)
- Duration threshold: (default: 3 weeks)

---

#### 16. No-Show Spike

**Purpose:** Flag when no-shows are spiking for a clinician or time slot — different from cancellations because they're unrecoverable and often signal deeper engagement issues.

| Element | Specification |
|---------|---------------|
| **Trigger** | No-shows exceed 2x baseline for clinician or time slot |
| **Status** | Warning (Critical if >3x baseline) |
| **Title** | "No-Show Spike" |

**AI Guidance Template (Clinician):**
> "{Clinician} had {count} no-shows this month — that's {multiplier}x their usual rate. No-shows can't be backfilled and often signal client disengagement. Review their caseload for patterns."

**Example (Clinician):**
> "Maria G had 6 no-shows this month — that's 3x their usual rate. No-shows can't be backfilled and often signal client disengagement. Review their caseload for patterns."

**AI Guidance Template (Time Slot):**
> "{time_slot} appointments had {count} no-shows this month — {multiplier}x other time slots. Consider whether this slot works for your client population."

**Example (Time Slot):**
> "Monday 8am appointments had 5 no-shows this month — 4x other time slots. Consider whether this slot works for your client population."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| No-shows | Red | "6 no-shows" |
| Baseline | White | "2 typical" |
| Lost revenue | Red | "~$900" |

**Action Button:** "Review Clients" or "Adjust Schedule"

**Configuration:**
- Spike multiplier for warning: (default: 2x)
- Spike multiplier for critical: (default: 3x)
- Minimum no-shows for signal: (default: 3)

---

### 🟢 OPPORTUNITY CARDS (Good)

---

#### 17. Open Slots This Week

// this is confusing with caseload openings, we need to review the metric definitions and make sure that we have everything clearly aligned.

**Purpose:** Surface available capacity to fill with new clients or waitlist.

| Element | Specification |
|---------|---------------|
| **Trigger** | Open appointment slots exist this week |
| **Status** | Good |
| **Title** | "Open Slots This Week" |

**AI Guidance Template:**
> "You have {count} open slots this week across {clinicians} clinicians. {Top_clinician} has the most availability with {top_count} slots. Great time to activate your waitlist or increase marketing."

**Example:**
> "You have 34 open slots this week across 5 clinicians. Jasmine W has the most availability with 12 slots. Great time to activate your waitlist or increase marketing."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Open slots | Emerald | "34 slots" |
| Clinicians | White | "5 clinicians" |
| Most available | White | "Chen (12)" |

**Action Button:** "Activate Waitlist" or "View Calendar"

---

#### 18. Caseload Openings

// this is confusing with open slots, we need to review the metric definitions and make sure that we have everything clearly aligned.

**Purpose:** Show which clinicians can take on new clients for routing decisions.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinicians have capacity below their client goal |
| **Status** | Good |
| **Title** | "Caseload Openings" |

**AI Guidance Template:**
> "Your team can take on {total} new clients. {Top_clinician} has the most room with {top_openings} openings. Route new consultations to clinicians with capacity."

**Example:**
> "Your team can take on 28 new clients. Jasmine W has the most room with 12 openings. Route new consultations to clinicians with capacity."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Total openings | Emerald | "28 openings" |
| Most room | White | "Johnson (12)" |
| Team capacity | White | "72% filled" |

**Action Button:** "Route New Clients"

---

#### 19. Ahead of Goal

**Purpose:** Celebrate when tracking ahead of monthly targets.

| Element | Specification |
|---------|---------------|
| **Trigger** | Current pace exceeds monthly goal by >5% |
| **Status** | Good |
| **Title** | "Ahead of Goal" |

**AI Guidance Template:**
> "You're {percent}% ahead of your {metric} goal! At this pace, you'll hit ${projected}k by month end — ${surplus}k above target. Keep the momentum going."

**Example:**
> "You're 12% ahead of your revenue goal! At this pace, you'll hit $112k by month end — $12k above target. Keep the momentum going."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Projected | Emerald | "$112k" |
| Goal | White | "$100k goal" |
| Surplus | Emerald | "+$12k" |

**Action Button:** "View Details"

---

#### 20. New Client Momentum

**Purpose:** Highlight strong client acquisition worth celebrating.

| Element | Specification |
|---------|---------------|
| **Trigger** | New clients this month > 1.5x monthly average |
| **Status** | Good |
| **Title** | "Strong Client Acquisition" |

**AI Guidance Template:**
> "You've added {count} new clients this month — your best in {period}! {Top_clinician} brought in {top_count}. Your client base is growing faster than usual."

**Example:**
> "You've added 12 new clients this month — your best in 6 months! Sarah M brought in 4. Your client base is growing faster than usual."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| New clients | Emerald | "12 clients" |
| Typical | White | "7/month avg" |
| Top acquirer | White | "Rodriguez (4)" |

**Action Button:** "View Client Details"

---

#### 21. Top Performer

**Purpose:** Recognize clinicians leading on key metrics.

| Element | Specification |
|---------|---------------|
| **Trigger** | Monthly summary or significant achievement |
| **Status** | Good |
| **Title** | "Top Performer" |

**AI Guidance Template:**
> "{Clinician} led the team in {metric} this month with {value}. That's {percent}% above the team average. Consider recognition or sharing their approach with the team."

**Example:**
> "Sarah M led the team in revenue this month with $32k. That's 28% above the team average. Consider recognition or sharing their approach with the team."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Their performance | Emerald | "$32k" |
| Team average | White | "$25k avg" |
| Above average | Emerald | "+28%" |

**Action Button:** "View Team Rankings"

---

#### 22. Most Improved

**Purpose:** Recognize clinicians showing significant positive momentum.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician improved >20% on key metric vs last period |
| **Status** | Good |
| **Title** | "Most Improved" |

**AI Guidance Template:**
> "{Clinician} improved their {metric} by {percent}% this month — from {previous} to {current}. Great momentum worth acknowledging."

**Example:**
> "Emma T improved their completed sessions by 35% this month — from 48 to 65. Great momentum worth acknowledging."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Improvement | Emerald | "+35%" |
| Now | Emerald | "65 sessions" |
| Was | White | "48 last month" |

**Action Button:** "View Performance"

---

#### 23. Retention Win

**Purpose:** Celebrate exceptional retention performance by a clinician.

| Element | Specification |
|---------|---------------|
| **Trigger** | Clinician has >90% retention rate over 6+ months |
| **Status** | Good |
| **Title** | "Exceptional Retention" |

**AI Guidance Template:**
> "{Clinician} has maintained {percent}% client retention over the last {period} months. Only {churned} of their {total} clients churned. Their approach is worth studying."

**Example:**
> "Sarah M has maintained 94% client retention over the last 6 months. Only 2 of their 32 clients churned. Their approach is worth studying."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Retention rate | Emerald | "94%" |
| Clients retained | Emerald | "30 retained" |
| Churned | White | "2 churned" |

**Action Button:** "View Retention Details"

---

### 📊 PATTERN & TREND CARDS (Insight)

---

#### 24. Churn Pattern

**Purpose:** Show distribution of early vs medium vs late churn to focus intervention efforts.

| Element | Specification |
|---------|---------------|
| **Trigger** | Always show when meaningful churn data exists |
| **Status** | Neutral (Insight) |
| **Title** | "Where Clients Leave" |

**AI Guidance Template:**
> "{early_percent}% of your churn happens in the first 5 sessions — that's {early_count} clients. {interpretation}. Focus your retention efforts on {recommendation}."

**Interpretations:**
- If early >50%: "This suggests onboarding or fit issues."
- If medium >40%: "This suggests treatment plateau or engagement drop."
- If late >40%: "This is healthy — clients are completing treatment."

**Example:**
> "68% of your churn happens in the first 5 sessions — that's 12 clients. This suggests onboarding or fit issues. Focus your retention efforts on the first 3 sessions."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Early (<5) | Red | "68% (12)" |
| Medium (5-15) | Amber | "22% (4)" |
| Late (15+) | Emerald | "10% (2)" |

**Visual:** Simple 3-segment horizontal bar showing distribution

**Action Button:** "View Retention Details"

---

#### 25. Revenue Trend

**Purpose:** Surface multi-month revenue direction.

| Element | Specification |
|---------|---------------|
| **Trigger** | Revenue moved in same direction for 3+ consecutive months |
| **Status** | Good if up, Warning if down |
| **Title** | "Revenue Trending {Up/Down}" |

**AI Guidance Template (Up):**
> "Revenue has increased for {months} consecutive months — from ${start}k to ${current}k. That's {percent}% growth. Your practice is on a strong trajectory."

**AI Guidance Template (Down):**
> "Revenue has declined for {months} consecutive months — from ${start}k to ${current}k. That's a {percent}% drop. Worth investigating the cause."

**Example (Down):**
> "Revenue has declined for 3 consecutive months — from $105k to $88k. That's a 16% drop. Worth investigating the cause."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Current | Amber/Emerald | "$88k" |
| Was | White | "$105k (3mo ago)" |
| Change | Red/Emerald | "↓16%" |

**Action Button:** "View Revenue Details"

---

#### 26. Sessions Trend

**Purpose:** Surface multi-month sessions direction.

| Element | Specification |
|---------|---------------|
| **Trigger** | Sessions moved in same direction for 3+ consecutive months |
| **Status** | Good if up, Warning if down |
| **Title** | "Sessions Trending {Up/Down}" |

**AI Guidance Template:**
> "Completed sessions have {increased/declined} for {months} consecutive months — from {start} to {current}. {interpretation}"

**Example:**
> "Completed sessions have declined for 3 consecutive months — from 520 to 445. This affects both revenue and clinician utilization."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Current | Amber | "445" |
| Was | White | "520 (3mo ago)" |
| Change | Red | "↓14%" |

**Action Button:** "View Sessions Details"

---

#### 27. Client Quality Alert

**Purpose:** Flag when new cohorts are worth less than previous cohorts.

| Element | Specification |
|---------|---------------|
| **Trigger** | Current year client LTV is <80% of prior year at same point |
| **Status** | Warning |
| **Title** | "Client Quality Declining" |

**AI Guidance Template:**
> "Clients acquired this year have generated ${current} on average — that's {percent}% less than last year's clients at this point (${previous}). Your newer clients aren't as engaged or staying as long."

**Example:**
> "Clients acquired this year have generated $1,200 on average — that's 25% less than last year's clients at this point ($1,600). Your newer clients aren't as engaged or staying as long."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| 2025 LTV | Amber | "$1,200" |
| 2024 LTV | White | "$1,600" |
| Gap | Red | "25% lower" |

**Action Button:** "View LTV Analysis"

---

#### 28. Margin Shift

**Purpose:** Alert when net revenue margin changed significantly.

| Element | Specification |
|---------|---------------|
| **Trigger** | Net margin changed >5 percentage points vs 3-month average |
| **Status** | Good if up, Warning if down |
| **Title** | "Margin {Improved/Dropped}" |

**AI Guidance Template (Drop):**
> "Your net margin dropped to {current}% — down from {previous}% average. You're keeping ${kept}k less per $100k in revenue. Review your cost structure."

**Example:**
> "Your net margin dropped to 18% — down from 24% average. You're keeping $6k less per $100k in revenue. Review your cost structure."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Current margin | Amber | "18%" |
| Was | White | "24% avg" |
| Impact | Red | "-$6k per $100k" |

**Action Button:** "View Financials"

---

#### 29. Revenue Concentration

**Purpose:** Warn when too much revenue depends on one clinician.

| Element | Specification |
|---------|---------------|
| **Trigger** | Single clinician generates >40% of practice revenue |
| **Status** | Warning |
| **Title** | "Revenue Concentration Risk" |

**AI Guidance Template:**
> "{Clinician} generated {percent}% of your revenue this month (${amount}k). If they left or reduced hours, you'd lose nearly half your income. Consider diversifying your caseload distribution."

**Example:**
> "Sarah M generated 45% of your revenue this month ($42k). If they left or reduced hours, you'd lose nearly half your income. Consider diversifying your caseload distribution."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Their share | Amber | "45%" |
| Their revenue | White | "$42k" |
| Practice total | White | "$93k" |

**Action Button:** "View Team Distribution"

**Configuration:**
- Concentration threshold: (default: 40%)

---

#### 30. Seasonal Heads-Up

**Purpose:** Proactively warn about historical seasonal patterns.

| Element | Specification |
|---------|---------------|
| **Trigger** | Approaching a month with historically significant deviation from average |
| **Status** | Neutral (Insight) |
| **Title** | "Seasonal Pattern Ahead" |

**AI Guidance Template:**
> "Historically, {month} sees a {percent}% {drop/increase} in {metric}. Last year you had {last_year_value}. Plan your marketing and scheduling accordingly."

**Example:**
> "Historically, January sees a 15% drop in bookings. Last year you had 390 sessions vs your 460 average. Plan your marketing and scheduling accordingly."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Typical change | Amber | "↓15%" |
| Last year | White | "390 sessions" |
| Your average | White | "460/month" |

**Action Button:** "Plan Ahead"

---

#### 31. Slot Demand Pattern

**Purpose:** Surface which time slots fill fastest for scheduling optimization.

| Element | Specification |
|---------|---------------|
| **Trigger** | Significant difference in fill rates by time slot |
| **Status** | Good (Opportunity) |
| **Title** | "Slot Demand Insight" |

**AI Guidance Template:**
> "{High_demand_slot} slots fill {multiplier}x faster than {low_demand_slot} slots. Consider expanding {high_demand_slot} availability or offering incentives for {low_demand_slot} bookings."

**Example:**
> "Evening slots fill 2.5x faster than morning slots. Consider expanding evening availability or offering incentives for morning bookings."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Fastest filling | Emerald | "Evening (2.5x)" |
| Slowest filling | White | "Morning" |
| Open mornings | Amber | "18 slots" |

**Action Button:** "View Calendar"

---

### 📅 PERIODIC SUMMARY CARDS

---

#### 32. Monthly Wrapped

**Purpose:** Spotify-wrapped style monthly summary.

| Element | Specification |
|---------|---------------|
| **Trigger** | End of month or first week of new month |
| **Status** | Neutral |
| **Title** | "{Month} Review" |

**Format:** Opens full-screen slideshow with:
1. Intro
2. Revenue summary
3. Sessions summary
4. Client growth
5. Retention
6. Attendance
7. Top performer
8. Team breakdown
9. Heads up (if any issues)
10. Compliance
11. Looking ahead
12. Closing

**Card Appearance:** Image-based card that opens modal

**Action:** Tap to view slideshow

---

#### 33. Weekly Snapshot

**Purpose:** Beginning-of-week summary of key metrics and priorities.

| Element | Specification |
|---------|---------------|
| **Trigger** | Monday morning |
| **Status** | Neutral |
| **Title** | "Week of {Date}" |

**AI Guidance Template:**
> "This week: {booked_sessions} sessions booked, {open_slots} slots open, {at_risk} clients need rebooking. {Top_priority} is your top priority."

**Example:**
> "This week: 85 sessions booked, 22 slots open, 4 clients need rebooking. Following up on outstanding balances is your top priority."

**Stats Row:**
| Stat | Color | Example |
|------|-------|---------|
| Booked | Emerald | "85 sessions" |
| Open | Amber | "22 slots" |
| At-risk | Red | "4 clients" |

**Action Button:** "View Week"

---

## Card Priority & Display Logic

### How Many Cards to Show?
- **Desktop:** 4-5 visible, horizontal scroll for more
- **Mobile:** 1-2 visible, swipe for more
- **Maximum:** ~8 cards before information overload

### Priority Order
1. **Critical cards always first** — fires need immediate attention
2. **Warning cards second** — things becoming fires
3. **Opportunity cards third** — growth potential
4. **Insight cards last** — nice to know

### Within Each Tier, Sort By:
1. **Recency** — newer issues first
2. **Dollar impact** — bigger money issues first
3. **Specificity** — clinician-specific over practice-wide (more actionable)

### Deduplication Rules
- If "Revenue Behind Pace" and "Revenue Trend Down" both trigger, show only the more urgent one
- If multiple clinicians trigger "Early Engagement Warning," consolidate into one card with count
- If "Churn Spike" and "Churn Pattern" both trigger, show both (different insights)

---

## Configuration Summary

| Setting | Default | Location |
|---------|---------|----------|
| Revenue goal | $100k | Practice settings |
| Sessions goal | 475 | Practice settings |
| Rebook rate goal | 85% | Practice settings |
| Notes overdue threshold | 10% | Practice settings |
| AR alert threshold | 5 days | Practice settings |
| Early engagement return rate | 70% | Card config |
| Caseload overload threshold | 90% | Card config |
| Caseload underutilized threshold | 50% | Card config |
| Spike multiplier | 2x | Card config |
| Trend periods | 3 months | Card config |
| High-value client tenure | 6 months or 12 sessions | Card config |

---

## Implementation Notes

### Data Requirements Per Card

| Card | Data Needed |
|------|-------------|
| Early Engagement Warning | Client start dates, session counts by client, session dates |
| Burnout Signal | Cancellations by clinician, schedule changes, hours |
| Cash at Risk | Client balances, invoice dates |
| Compliance Deadline | Session dates, note completion status, billing deadlines |
| Rebook Needed | Client next appointment dates, last session dates |
| Session 1→2 Drop-off | New client session counts |
| Cancellation Pattern | Cancellations by clinician, by date |
| Revenue Behind Pace | Daily/weekly revenue, goal |
| Sessions Behind Pace | Daily/weekly sessions, goal |
| Caseload Imbalance | Active clients per clinician, capacity per clinician |
| Churn Spike | Churned client counts by period |
| Rebook Rate Dropping | Rebook rate by period |
| Needs Support | Clinician metrics vs team averages |
| High-Value Client Risk | Client tenure, session count, next appointment |
| Session Frequency Dropping | Client session history with dates, session counts |
| No-Show Spike | No-show records by clinician, by date, by time slot |
| Open Slots This Week | Calendar availability |
| Caseload Openings | Clinician capacity vs current clients |
| Ahead of Goal | Current metrics vs goals |
| New Client Momentum | New client counts by period |
| Top Performer | Clinician metrics ranked |
| Most Improved | Clinician metrics period-over-period |
| Retention Win | Clinician retention rates |
| Churn Pattern | Churned clients with session counts |
| Revenue Trend | Monthly revenue history |
| Sessions Trend | Monthly session history |
| Client Quality Alert | Cohort LTV data |
| Margin Shift | Gross and net revenue history |
| Revenue Concentration | Revenue by clinician |
| Seasonal Heads-Up | Historical monthly data (2+ years) |
| Slot Demand Pattern | Appointment booking rates by time slot |
| Monthly Wrapped | All metrics for month |
| Weekly Snapshot | Current week metrics |

---

## Future Considerations

### Deferred Cards (To Build Later)
- **Payer Mix Shift** — when insurance tracking is built
- **Insurance Claim Aging** — requires insurance integration
- **Lead Pipeline** — requires consultation tracking
- **Waitlist Health** — requires waitlist feature

### Potential Enhancements
- **Dismiss/Snooze** — let users hide cards temporarily
- **Smart Thresholds** — learn from user's practice patterns
- **Client-Specific Patterns** — compare to individual client's history, not practice average
- **Push Notifications** — critical cards as mobile alerts
