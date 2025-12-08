# Metric Definitions

## Client Metrics

### Active Client
A client whose status is active in SimplePractice (not discharged).

### Discharged Client
A client that has been discharged in SimplePractice.

### Client Openings
The number of client openings that clinicians can take on — i.e., capacity for new clients.

---

## Session Metrics

### Completed Sessions
The number of counted sessions completed for the time frame selected. Note, days and weeks are based on your preferred calendar configuration set in onboarding.

### Caseload Capacity
The percentage of a clinician's client capacity that is currently filled. This measures how close a clinician is to their maximum caseload.

**Formula:** Active Clients ÷ Client Goal × 100

**Example:** A clinician has a goal of 25 clients and currently has 10 active clients → Caseload Capacity = 10/25 = 40%

### Session Goal %
The percentage of completed sessions out of the clinician's session goal for that time frame. This measures how much of their session capacity a clinician is achieving.

**Formula:** Completed Sessions ÷ Session Goal × 100

**Example:** A clinician has a monthly goal of 90 sessions and completes 60 → Session Goal % = 60/90 = 66.7%

### Average Weekly Sessions
The total counted sessions in that time frame divided by the total number of weeks in that time frame. Note, weeks are based on your preferred calendar configuration set in onboarding.

### Clients Seen
The number of clients that have had a counted session during this time frame.

---

## Attendance Metrics

### Rebook Rate
Of the active clients, this is the percentage that have their next appointment scheduled. This is a leading indicator of retention—clients without upcoming appointments are at risk of churning.

### Show Rate
The percentage of sessions that were completed out of total booked sessions.

### Client Cancel Rate
The percentage of booked sessions that were canceled by the client.

### Clinician Cancel Rate
The percentage of booked sessions that were canceled by the clinician.

### Non-Billable Cancel Rate
Client cancellations + clinician cancellations as a percentage of all bookings.

### Late Cancel
A cancellation made within the defined late cancellation window (based on practice policy).

### No-Show
Client did not attend the session without canceling.

---

## Retention Metrics

### Churned Client
A client with no appointment in the last 30+ days AND no future appointment scheduled.

### Retained Client
A client who is active or has an appointment scheduled within the next 30 days.

### Churn Rate
The percentage of clients who churned out of total clients in a cohort.

**Formula:** Clients Churned ÷ Clients Acquired × 100

### At-Risk Clients
Clients without upcoming appointments, categorized by days since their last session:

| Risk Level | Days Since Last Session |
|------------|------------------------|
| **High Risk** | 21+ days |
| **Medium Risk** | 14-21 days |
| **Low Risk** | 7-14 days |

### Clients Acquired
The total number of clients who started (had their first session) during a specific cohort period.

### Clients Churned
The number of clients from a cohort who have churned (no appointment in 30+ days and none scheduled).

### Avg Sessions Completed
The average number of sessions across ALL clients in a cohort. This measures overall client engagement depth.

**Note:** This includes both active and churned clients to provide an accurate view of typical client journey length.

### Churn Timing
Categorizes when clients leave based on how many sessions they completed before churning:

| Category | Sessions Completed | Indicates |
|----------|-------------------|-----------|
| **Early Churn** | <5 sessions | Engagement issues, poor fit, or onboarding problems |
| **Medium Churn** | 5-15 sessions | May indicate treatment plateau or life changes |
| **Late Churn** | >15 sessions | Natural completion or external factors |

### Session 1→2 Drop-off
The percentage of clients who don't return after their first session. This is often the steepest cliff in client retention and a critical metric to monitor.

**Formula:** (Clients with 1 session only ÷ Total clients who started) × 100

### Session 2 Return Rate
The percentage of new clients who return for their second session. This is the inverse of Session 1→2 Drop-off and provides a positive framing for early engagement tracking. Can be calculated at the practice level or per clinician.

**Formula:** (Clients who completed session 2 ÷ Clients who completed session 1) × 100

**Example:** A clinician had 10 new clients start this quarter. 7 of them returned for session 2 → Session 2 Return Rate = 7/10 = 70%

### Session 3 Return Rate
The percentage of new clients who return for their third session. This is a deeper signal of early engagement — clients who reach session 3 are significantly more likely to become long-term clients.

**Formula:** (Clients who completed session 3 ÷ Clients who completed session 1) × 100

**Example:** A clinician had 10 new clients start this quarter. 6 of them reached session 3 → Session 3 Return Rate = 6/10 = 60%

### Retention Rate
The percentage of clients from a cohort who are still active (not churned). This is the positive framing of Churn Rate.

**Formula:** 100% - Churn Rate, or (Clients Retained ÷ Clients Acquired) × 100

**Example:** A cohort of 50 clients had 8 churn → Retention Rate = 42/50 = 84%

### Retention by Sessions
A funnel showing what percentage of clients reach key session milestones:
- Started (100%)
- Session 5
- Session 12
- Session 24

### Retention by Time
A funnel showing what percentage of clients stay with the practice for key time milestones:
- Started (100%)
- 1 Month
- 3 Months
- 6 Months

---

## Compliance Metrics

### Outstanding Notes (Total)
The total number of sessions that have overdue notes, dating back to the earliest data available. You have the option to see overdue notes from a more specific or recent timeframe in the "Key Metrics" section.

### Outstanding Notes (Time Period)
The total number of sessions that have overdue notes for a specific time period based on the note completion deadline defined by your practice. Visit Settings to check your notes deadline.

---

## Caseload & Capacity Metrics

### Upcoming Bookings
The number of bookings that are on a clinician's calendar for the next three weeks. Intakes are specifically broken out when you click the "i" pop-up.

### Slot Fill Rate
The percentage of available appointment slots that get booked within a given time period. This measures demand for your practice's availability.

**Formula:** (Booked Slots ÷ Total Available Slots) × 100

**Example:** A clinician has 40 available slots this week and 32 are booked → Slot Fill Rate = 32/40 = 80%

**Note:** Can be segmented by time of day (morning, afternoon, evening) to identify demand patterns.

---

## Financial Metrics

### Net Revenue Margin
The percentage of gross revenue retained after deducting clinician costs, supervisor costs, and credit card fees. This measures practice profitability.

**Formula:** (Net Revenue ÷ Gross Revenue) × 100

**Example:** Gross revenue is $100k, net revenue after costs is $22k → Net Revenue Margin = 22%

### Client Lifetime Value (LTV)
The total revenue generated by a client from their first session to their last session (or present, if still active). This measures the economic value of acquiring and retaining a client.

**Formula:** Sum of all session revenue for a client

**Cohort LTV:** Average LTV across all clients in a cohort. Used to compare client quality across time periods (e.g., "Are 2025 clients as valuable as 2024 clients?").

**Example:** A client completed 24 sessions at $150/session → Client LTV = $3,600

---

## Cohort Analysis Terms

### Cohort
A group of clients who started (had their first session) during a specific time period. Cohorts allow you to track how groups of clients behave over time.

### Cohort Maturity
Indicates whether enough time has passed for the cohort data to be meaningful:

| Maturity | Meaning |
|----------|---------|
| **Mature** | Sufficient time has passed; data is reliable |
| **Partial** | Some data available but cohort still developing |
| **Immature** | Too early; not enough time for meaningful retention data |
