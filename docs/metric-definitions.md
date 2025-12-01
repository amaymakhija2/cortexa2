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

## Caseload Metrics

### Upcoming Bookings
The number of bookings that are on a clinician's calendar for the next three weeks. Intakes are specifically broken out when you click the "i" pop-up.

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
