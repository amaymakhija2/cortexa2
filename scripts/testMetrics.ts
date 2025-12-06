// Quick test of metrics calculation
import {
  calculateDashboardMetrics,
  getMonthlyData,
  getAvailableMonths,
  getDataDateRange
} from '../data/metricsCalculator';

const range = getDataDateRange();
console.log('Data date range:', range.earliest.toLocaleDateString(), '-', range.latest.toLocaleDateString());

const months = getAvailableMonths();
console.log('\nAvailable months:', months.length);

// Test November 2025 metrics
console.log('\n=== November 2025 Metrics ===');
const nov2025 = calculateDashboardMetrics(10, 2025); // month is 0-indexed
console.log('Revenue:', nov2025.revenue.formatted);
console.log('Sessions:', nov2025.sessions.completed);
console.log('Active clients:', nov2025.clients.active);
console.log('New clients:', nov2025.clients.new);
console.log('Churned clients:', nov2025.clients.churned);

// Test current month (December 2025)
console.log('\n=== December 2025 Metrics ===');
const dec2025 = calculateDashboardMetrics(11, 2025);
console.log('Revenue:', dec2025.revenue.formatted);
console.log('Sessions:', dec2025.sessions.completed);
console.log('Active clients:', dec2025.clients.active);
console.log('New clients:', dec2025.clients.new);

// Last 12 months
console.log('\n=== Last 12 Months ===');
const monthlyData = getMonthlyData(12);
monthlyData.forEach(m => {
  console.log(`${m.month} ${m.year}: $${(m.revenue/1000).toFixed(1)}k | ${m.sessions} sessions | ${m.activeClients} clients`);
});
