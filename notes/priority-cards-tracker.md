# Priority Cards Implementation Tracker

> **Last Updated:** 2024-12-08
> **Total Cards:** 33
> **Completed:** 0 | **In Progress:** 32 | **Not Started:** 1

---

## Clinician Names (Use These Consistently)

> **Note:** App has `anonymizeClinicianNames` setting. Use demo names for card examples.
> **Demographics:** ~60% White, ~18% Hispanic, ~12% Black, ~6% Asian (US Census)

| Real Name | Demo Name | Demographic | Use In Examples |
|-----------|-----------|-------------|-----------------|
| Gaya K | Sarah M | White | ✓ Primary |
| Rudhdi K | Emma T | White | ✓ Secondary |
| Alaina M | Rachel K | White | ✓ |
| Aditi R | Lauren C | White | |
| Tamanna A | Katie R | White | |
| Gajan G | Brian H | White | |
| Shivon R | Jennifer L | White | |
| Tanisha S | Maria G | Hispanic | ✓ |
| Mehar A | Sofia M | Hispanic | |
| Deepa S | Carlos R | Hispanic | |
| Rebecca S | Jasmine W | Black | ✓ |
| Apeksha M | Marcus J | Black | |
| Riddhi C | Priya S | Asian | |
| Ranya P | David K | Asian | |
| Vikramjit B | Michael B | White | |
| Paulomi M | Chris P | White | |
| Preeti R | Amanda H | White | |

---

## Client Names (Use These Consistently)

> **Note:** Client names are hashed IDs in the system. Use realistic placeholder names for examples.
> **Demographics:** Mix reflecting US population

| Name | Demographic | Context |
|------|-------------|---------|
| David L | White | Long-term client (high-value) |
| Jennifer M | White | AR/billing issues |
| Marcus T | Black | AR/billing issues |
| Sofia R | Hispanic | New client |
| Emily W | White | At-risk client |
| James K | Asian | Churned client |
| Sarah J | White | High-value, long tenure |
| Anthony B | Black | Rebook needed |

---

## 🔴 URGENT CARDS (Critical)

### 1. Early Engagement Warning
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Early Engagement Warning" |
| **Badge** | CRITICAL (red) |
| **Example Clinician** | Rachel K |
| **Example Stats** | 5 new clients → 3 lost → 60% drop-off |
| **Comparison** | Practice average: 15% |
| **Action Button** | "Review Intake Process" |
| **AI Guidance** | "Rachel K has lost 3 of their last 5 new clients before session 3. That's a 60% early drop-off rate — your practice average is 15%. This pattern suggests intake or early engagement issues worth investigating." |

---

### 2. Burnout Signal
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Burnout Signal" |
| **Badge** | CRITICAL (red) |
| **Example Clinician** | Maria G |
| **Example Stats** | 4x increase → 3 this month → vs 1/month |
| **Comparison** | Baseline: 1 cancellation/month |
| **Action Button** | "Schedule Check-in" |
| **AI Guidance** | "Maria G's patterns have changed significantly this month. Cancellations are up 4x, and she's had 3 same-day schedule changes. These combined signals often indicate burnout. A supportive check-in is recommended." |

---

### 3. Cash at Risk (Outstanding Balances)
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Outstanding Balances" |
| **Badge** | CRITICAL (red) |
| **Example Stats** | $2.4k outstanding → 4 clients → 12 days oldest |
| **Example Client** | Jennifer Martinez |
| **Comparison** | Best practice: <7 days |
| **Action Button** | "Send Reminders" |
| **AI Guidance** | "You have $2,450 in outstanding balances across 4 clients. Jennifer Martinez has the longest outstanding at 12 days ($650). Best practice is to follow up within 7 days." |

---

### 4. Compliance Deadline (Notes Due Soon)
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Notes Due Soon" |
| **Badge** | CRITICAL (red) |
| **Example Clinician** | Sarah M |
| **Example Stats** | 8 notes → 3 days → Sarah M (4) |
| **Comparison** | Billing deadline: 7 days |
| **Action Button** | "View Outstanding Notes" |
| **AI Guidance** | "8 session notes are due within 3 days for insurance billing. Sarah M has the most with 4 notes. Late notes delay reimbursement and create audit risk." |

---

## 🟠 ATTENTION CARDS (Warning)

### 5. Rebook Needed
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Clients Need Rebooking" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | 6 clients → 2 high risk → 2 days typical |
| **Comparison** | Your average rebook time: 2 days |
| **Action Button** | "View Clients" |
| **AI Guidance** | "6 clients finished sessions recently with nothing scheduled. 2 are high risk (14+ days). Your average rebook time is 2 days — these clients are overdue." |

---

### 6. Session 1→2 Drop-off
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "First Session Drop-off" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | 28% drop-off → 4 clients → 85% typical |
| **Comparison** | Industry benchmark: 85% return |
| **Action Button** | "Review Intake Process" |
| **AI Guidance** | "28% of new clients this month didn't return after their first session. That's 4 potential long-term clients lost. Industry benchmark is 85% return rate. Review your intake experience." |

---

### 7. Cancellation Pattern
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Cancellation Spike" |
| **Badge** | ATTENTION (amber) |
| **Example Clinician** | Maria G |
| **Example Stats** | 9 cancellations → 2 typical → 4x increase |
| **Comparison** | Practice average: 3/month |
| **Action Button** | "Explore Data" |
| **AI Guidance** | "Maria G had 9 cancellations this month — that's 4x their usual rate of 2. The practice average is 3 cancellations per clinician. Worth a conversation." |

---

### 8. Revenue Behind Pace
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Revenue Behind Pace" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | $62k current → $100k goal → $18k behind |
| **Comparison** | 12 days left in month |
| **Action Button** | "View Revenue Details" |
| **AI Guidance** | "You're $18k behind pace to hit your $100k goal. With 12 days left, you need $1.5k/day to catch up. That's 4 more sessions than your current daily average." |

---

### 9. Sessions Behind Pace
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Sessions Behind Pace" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | 312 sessions → 475 goal → 163 to go |
| **Comparison** | 10 days left in month |
| **Action Button** | "View Sessions Details" |
| **AI Guidance** | "You've completed 312 sessions with 10 days left. To hit your 475 goal, you need 163 more — that's 16/day vs your current pace of 12/day." |

---

### 10. Caseload Imbalance
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Caseload Imbalance" |
| **Badge** | ATTENTION (amber) |
| **Example Clinicians** | Sarah M (95%), Jasmine W (38%) |
| **Example Stats** | Sarah M: 95% → Jasmine W: 38% → 57% gap |
| **Comparison** | Jasmine W has 12 openings |
| **Action Button** | "Rebalance Referrals" |
| **AI Guidance** | "Sarah M is at 95% capacity while Jasmine W is at 38%. Consider rebalancing referrals. Sarah M may be at burnout risk; Jasmine W has room for 12 more clients." |

---

### 11. Churn Spike
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Higher Than Usual Churn" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | 8 clients → 4/month typical → -3 net |
| **Comparison** | 2x your usual churn rate |
| **Action Button** | "View Retention Details" |
| **AI Guidance** | "You lost 8 clients this month — that's 2x your usual rate of 4/month. Net growth is -3. Review the retention tab to understand patterns." |

---

### 12. Rebook Rate Dropping
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Rebook Rate Trending Down" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | 79% current → 88% (3mo ago) → ↓9 points |
| **Comparison** | Goal: 85% rebook rate |
| **Action Button** | "View At-Risk Clients" |
| **AI Guidance** | "Your rebook rate has dropped from 88% to 79% over the last 3 months. That's 9 percentage points. Clients without next appointments are at risk of churning." |

---

### 13. Needs Support
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Clinician Needs Support" |
| **Badge** | ATTENTION (amber) |
| **Example Clinician** | Jasmine W |
| **Example Stats** | 42 sessions → 65 avg → 35% below |
| **Comparison** | Team average: 65 sessions |
| **Action Button** | "Schedule Coaching" |
| **AI Guidance** | "Jasmine W is 35% below team average on completed sessions. Their 42 sessions compares to the team average of 65. Consider a supportive check-in or coaching session." |

---

### 14. High-Value Client Risk
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Long-Term Client at Risk" |
| **Badge** | ATTENTION (amber) |
| **Example Client** | Sarah Johnson |
| **Example Stats** | 14 months → 48 sessions → 18 days no appt |
| **Comparison** | High-value: 12+ sessions |
| **Action Button** | "Reach Out" |
| **AI Guidance** | "Sarah Johnson has been with the practice for 14 months and completed 48 sessions, but hasn't scheduled in 18 days. This is a high-value relationship worth protecting. Reach out personally." |

---

### 15. Session Frequency Dropping
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Session Frequency Dropping" |
| **Badge** | ATTENTION (amber) |
| **Example Client** | David L |
| **Example Clinician** | Sarah M |
| **Example Stats** | Weekly → Bi-weekly → 4 weeks |
| **Comparison** | Established client (10+ sessions) |
| **Action Button** | "Notify Clinician" |
| **AI Guidance** | "David L has gone from weekly sessions to bi-weekly over the last 4 weeks. Frequency drops often precede churn. Their clinician (Sarah M) should check in about treatment goals." |

---

### 16. No-Show Spike
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "No-Show Spike" |
| **Badge** | ATTENTION (amber) / CRITICAL if >3x |
| **Example Clinician** | Maria G |
| **Example Stats** | 6 no-shows → 2 typical → ~$900 lost |
| **Comparison** | 3x baseline rate |
| **Action Button** | "Review Clients" |
| **AI Guidance (Clinician)** | "Maria G had 6 no-shows this month — that's 3x their usual rate. No-shows can't be backfilled and often signal client disengagement. Review their caseload for patterns." |
| **AI Guidance (Time Slot)** | "Monday 8am appointments had 5 no-shows this month — 4x other time slots. Consider whether this slot works for your client population." |

---

## 🟢 OPPORTUNITY CARDS (Good)

### 17. Open Slots This Week
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Open Slots This Week" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Jasmine W |
| **Example Stats** | 34 slots → 5 clinicians → Jasmine W (12) |
| **Comparison** | Utilization: 72% |
| **Action Button** | "Activate Waitlist" |
| **AI Guidance** | "You have 34 open slots this week across 5 clinicians. Jasmine W has the most availability with 12 slots. Great time to activate your waitlist or increase marketing." |

---

### 18. Caseload Openings
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Caseload Openings" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Jasmine W |
| **Example Stats** | 28 openings → Jasmine W (12) → 72% filled |
| **Comparison** | Team capacity: 72% filled |
| **Action Button** | "Route New Clients" |
| **AI Guidance** | "Your team can take on 28 new clients. Jasmine W has the most room with 12 openings. Route new consultations to clinicians with capacity." |

---

### 19. Ahead of Goal
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Ahead of Goal" |
| **Badge** | OPPORTUNITY (green) |
| **Example Stats** | $112k projected → $100k goal → +$12k |
| **Comparison** | 12% ahead of pace |
| **Action Button** | "View Details" |
| **AI Guidance** | "You're 12% ahead of your revenue goal! At this pace, you'll hit $112k by month end — $12k above target. Keep the momentum going." |

---

### 20. New Client Momentum
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Strong Client Acquisition" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Sarah M |
| **Example Stats** | 12 clients → 7/month avg → Sarah M (4) |
| **Comparison** | Best in 6 months |
| **Action Button** | "View Client Details" |
| **AI Guidance** | "You've added 12 new clients this month — your best in 6 months! Sarah M brought in 4. Your client base is growing faster than usual." |

---

### 21. Top Performer
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Top Performer" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Sarah M |
| **Example Stats** | $32k → $25k avg → +28% |
| **Comparison** | 28% above team average |
| **Action Button** | "View Team Rankings" |
| **AI Guidance** | "Sarah M led the team in revenue this month with $32k. That's 28% above the team average. Consider recognition or sharing their approach with the team." |

---

### 22. Most Improved
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Most Improved" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Emma T |
| **Example Stats** | +35% → 65 sessions → 48 last month |
| **Comparison** | Month-over-month improvement |
| **Action Button** | "View Performance" |
| **AI Guidance** | "Emma T improved their completed sessions by 35% this month — from 48 to 65. Great momentum worth acknowledging." |

---

### 23. Retention Win
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Exceptional Retention" |
| **Badge** | OPPORTUNITY (green) |
| **Example Clinician** | Sarah M |
| **Example Stats** | 94% → 30 retained → 2 churned |
| **Comparison** | Over last 6 months |
| **Action Button** | "View Retention Details" |
| **AI Guidance** | "Sarah M has maintained 94% client retention over the last 6 months. Only 2 of their 32 clients churned. Their approach is worth studying." |

---

## 📊 INSIGHT CARDS (Neutral/Blue)

### 24. Churn Pattern
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Where Clients Leave" |
| **Badge** | INSIGHT (blue) |
| **Example Stats** | 68% Early (<5) → 22% Medium (5-15) → 10% Late (15+) |
| **Comparison** | Focus on first 3 sessions |
| **Action Button** | "View Retention Details" |
| **AI Guidance** | "68% of your churn happens in the first 5 sessions — that's 12 clients. This suggests onboarding or fit issues. Focus your retention efforts on the first 3 sessions." |

---

### 25. Revenue Trend
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Revenue Trending Down" |
| **Badge** | INSIGHT (blue) or ATTENTION if down |
| **Example Stats** | $88k current → $105k (3mo ago) → ↓16% |
| **Comparison** | 3 consecutive months |
| **Action Button** | "View Revenue Details" |
| **AI Guidance** | "Revenue has declined for 3 consecutive months — from $105k to $88k. That's a 16% drop. Worth investigating the cause." |

---

### 26. Sessions Trend
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Sessions Trending Down" |
| **Badge** | INSIGHT (blue) or ATTENTION if down |
| **Example Stats** | 445 current → 520 (3mo ago) → ↓14% |
| **Comparison** | 3 consecutive months |
| **Action Button** | "View Sessions Details" |
| **AI Guidance** | "Completed sessions have declined for 3 consecutive months — from 520 to 445. This affects both revenue and clinician utilization." |

---

### 27. Client Quality Alert
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Client Quality Declining" |
| **Badge** | ATTENTION (amber) |
| **Example Stats** | $1,200 (2025 LTV) → $1,600 (2024 LTV) → 25% lower |
| **Comparison** | Same point in prior year |
| **Action Button** | "View LTV Analysis" |
| **AI Guidance** | "Clients acquired this year have generated $1,200 on average — that's 25% less than last year's clients at this point ($1,600). Your newer clients aren't as engaged or staying as long." |

---

### 28. Margin Shift
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Margin Dropped" |
| **Badge** | ATTENTION (amber) if down |
| **Example Stats** | 18% current → 24% avg → -$6k per $100k |
| **Comparison** | vs 3-month average |
| **Action Button** | "View Financials" |
| **AI Guidance** | "Your net margin dropped to 18% — down from 24% average. You're keeping $6k less per $100k in revenue. Review your cost structure." |

---

### 29. Revenue Concentration
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Revenue Concentration Risk" |
| **Badge** | ATTENTION (amber) |
| **Example Clinician** | Sarah M |
| **Example Stats** | 45% share → $42k → $93k total |
| **Comparison** | Threshold: 40% |
| **Action Button** | "View Team Distribution" |
| **AI Guidance** | "Sarah M generated 45% of your revenue this month ($42k). If they left or reduced hours, you'd lose nearly half your income. Consider diversifying your caseload distribution." |

---

### 30. Seasonal Heads-Up
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Seasonal Pattern Ahead" |
| **Badge** | INSIGHT (blue) |
| **Example Stats** | ↓15% typical → 390 sessions → 460/month avg |
| **Comparison** | January historically |
| **Action Button** | "Plan Ahead" |
| **AI Guidance** | "Historically, January sees a 15% drop in bookings. Last year you had 390 sessions vs your 460 average. Plan your marketing and scheduling accordingly." |

---

### 31. Slot Demand Pattern
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Slot Demand Insight" |
| **Badge** | OPPORTUNITY (green) |
| **Example Stats** | Evening (2.5x) → Morning → 18 slots |
| **Comparison** | Fill rate comparison |
| **Action Button** | "View Calendar" |
| **AI Guidance** | "Evening slots fill 2.5x faster than morning slots. Consider expanding evening availability or offering incentives for morning bookings." |

---

## 📅 PERIODIC SUMMARY CARDS

### 32. Monthly Wrapped
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "{Month} Review" |
| **Badge** | None (special card) |
| **Format** | Full-screen slideshow |
| **Slides** | Intro, Revenue, Sessions, Client Growth, Retention, Attendance, Top Performer, Team Breakdown, Heads Up, Compliance, Looking Ahead, Closing |
| **Action** | Tap to view slideshow |
| **Notes** | Already partially implemented as MonthlyReviewCard |

---

### 33. Weekly Snapshot
| Field | Value |
|-------|-------|
| **Status** | 🔄 In Progress |
| **Title** | "Week of {Date}" |
| **Badge** | INSIGHT (blue) |
| **Example Stats** | 85 sessions → 22 slots → 4 clients |
| **Comparison** | Top priority for the week |
| **Action Button** | "View Week" |
| **AI Guidance** | "This week: 85 sessions booked, 22 slots open, 4 clients need rebooking. Following up on outstanding balances is your top priority." |

---

## Implementation Progress

| Category | Total | Complete | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| 🔴 Urgent | 4 | 0 | 4 | 0 |
| 🟠 Attention | 12 | 0 | 12 | 0 |
| 🟢 Opportunity | 7 | 0 | 7 | 0 |
| 📊 Insight | 8 | 0 | 8 | 0 |
| 📅 Periodic | 2 | 0 | 1 | 1 |
| **Total** | **33** | **0** | **32** | **1** |

> **Note:** All cards have static demo data in `data/priorityCardsData.ts`. Monthly Review card (#32) uses its own component. Weekly Snapshot (#33) pending real data integration.

---

## Implementation Notes

### Component Structure
- Base component: `SimpleAlertCard.tsx`
- Statuses: `critical`, `warning`, `good`, `insight`
- Colors: red, amber, emerald, white, blue

### Data File
- Location: `data/priorityCardsData.ts`
- Export: Array of card configurations
- Dynamic data should come from hooks/API

### Next Steps
1. ~~Add `insight` status to SimpleAlertCard~~ ✅
2. ~~Create `priorityCardsData.ts` with all 33 configurations~~ ✅
3. ~~Update Dashboard to dynamically render cards~~ ✅
4. Connect to real data via hooks

---

## Change Log

| Date | Change |
|------|--------|
| 2024-12-08 | Initial tracker created with all 33 cards |
| 2024-12-08 | Added `insight` status to SimpleAlertCard (blue color scheme) |
| 2024-12-08 | Created `data/priorityCardsData.ts` with all 32 card configurations |
| 2024-12-08 | Updated Dashboard to dynamically render cards from data file |
| 2024-12-08 | Fixed clinician names to use short format (Sarah M, not Sarah Mitchell) |
| 2024-12-08 | Dashboard now displays all 32 cards (was 5 demo cards) |
