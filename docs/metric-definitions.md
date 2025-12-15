# Metric Definitions

## Client Metrics

### Active Client

**Status-Based Mode (SimplePractice)**
A client whose status is set to "Active" in SimplePractice (not discharged or inactive).

**Activity-Based Mode (Time)**
A client who has completed a session in the last 30 days.

*Mode is configurable in Settings → Configure Practice*

### Churned Client

**Status-Based Mode (SimplePractice)**
A client whose status has changed from "Active" to "Discharged" or "Inactive" in SimplePractice.

**Activity-Based Mode (Time)**
A client who was active last month (session 31-60 days ago) but is not active this month (no session in last 30 days).

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

### Churn Rate
The percentage of clients who churned out of clients who were active in the prior period.

**Formula:** Clients Churned ÷ Active Clients (Prior Period) × 100

**Example:** Last month you had 100 active clients. This month, 15 of them have churned → Churn Rate = 15/100 = 15%

### Retention Rate
The percentage of clients who remained active from the prior period. This is the inverse of Churn Rate.

**Formula:** Active Clients (Current) ÷ Active Clients (Prior Period) × 100, or 100% - Churn Rate

**Example:** Last month you had 100 active clients. This month, 85 are still active → Retention Rate = 85/100 = 85%

### At-Risk Clients
Clients without upcoming appointments, categorized by days since their last session:

| Risk Level | Days Since Last Session |
|------------|------------------------|
| **High Risk** | 21+ days |
| **Medium Risk** | 14-21 days |
| **Low Risk** | 7-14 days |

### Churn Timing
Categorizes when clients leave based on how many sessions they completed before churning:

| Category | Sessions Completed | Indicates |
|----------|-------------------|-----------|
| **Early Churn** | <5 sessions | Engagement issues, poor fit, or onboarding problems |
| **Medium Churn** | 5-15 sessions | May indicate treatment plateau or life changes |
| **Late Churn** | >15 sessions | Natural completion or external factors |

---

## Return Rate Metrics

Return Rate measures early client engagement — whether clients come back for subsequent sessions. This is different from Retention Rate, which measures ongoing month-to-month loyalty.

### Session 2 Return Rate
The percentage of new clients who return for their second session.

**Formula:** Clients who completed session 2 ÷ Clients who completed session 1 × 100

**Example:** 10 new clients started this quarter. 7 returned for session 2 → Session 2 Return Rate = 70%

### Session 3 Return Rate
The percentage of new clients who return for their third session. Clients who reach session 3 are significantly more likely to become long-term clients.

**Formula:** Clients who completed session 3 ÷ Clients who completed session 1 × 100

**Example:** 10 new clients started this quarter. 6 reached session 3 → Session 3 Return Rate = 60%

### Session 5 Return Rate
The percentage of new clients who reach their fifth session.

**Formula:** Clients who completed session 5 ÷ Clients who completed session 1 × 100

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
