// Test clinician metrics calculation
import { getClinicianMetricsForPeriod } from '../data/metricsCalculator';

console.log('=== Last 12 Months Clinician Metrics ===\n');

const metrics = getClinicianMetricsForPeriod('last-12-months');

// Sort by revenue descending
metrics.sort((a, b) => b.revenue - a.revenue);

metrics.forEach((m, i) => {
  console.log(`${i + 1}. ${m.clinicianName}`);
  console.log(`   Revenue: $${(m.revenue / 1000).toFixed(1)}k | Sessions: ${m.completedSessions}`);
  console.log(`   Avg $/Session: $${m.revenuePerSession.toFixed(0)} | Active Clients: ${m.activeClients}`);
  console.log(`   New Clients: ${m.newClients} | Churned: ${m.clientsChurned} | Churn Rate: ${m.churnRate.toFixed(1)}%`);
  console.log(`   Avg Sessions/Client: ${m.avgSessionsPerClient.toFixed(1)}`);
  console.log('');
});

console.log('\n=== This Month Metrics ===\n');
const thisMonth = getClinicianMetricsForPeriod('this-month');
thisMonth.sort((a, b) => b.revenue - a.revenue);

thisMonth.forEach((m, i) => {
  console.log(`${i + 1}. ${m.clinicianName}: $${(m.revenue / 1000).toFixed(1)}k | ${m.completedSessions} sessions | ${m.activeClients} clients`);
});
