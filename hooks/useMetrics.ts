import { useState, useEffect, useCallback } from 'react';
import { useDemoData } from '../context/DemoContext';
import { calculateDashboardMetrics, formatCurrency } from '../data/metricsCalculator';
import type { DemoData } from '../data/generators/types';

// DashboardMetrics interface - matches what components expect
export interface DashboardMetrics {
  revenue: {
    value: number;
    formatted: string;
  };
  sessions: {
    completed: number;
  };
  clients: {
    active: number;
    new: number;
    churned: number;
    openings: number;
  };
  attendance: {
    showRate: number;
    clientCancelRate: number;
    lateCancelRate: number;
    clinicianCancelRate: number;
    rebookRate: number;
  };
  notes: {
    outstandingPercent: number;
  };
}

export interface UseMetricsResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Extract metrics from demo data for a specific month
 */
function extractDemoMetrics(demoData: DemoData, month: number, year: number): DashboardMetrics {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthKey = `${monthNames[month]} ${year}`;

  // Find monthly data for the requested month
  let revenueData = demoData.monthlyData.revenue.find(d => d.month === monthKey);
  let sessionsData = demoData.monthlyData.sessions.find(d => d.month === monthKey);
  let clientGrowthData = demoData.monthlyData.clientGrowth.find(d => d.month === monthKey);
  let churnData = demoData.monthlyData.churn.find(d => d.month === monthKey);
  let notesData = demoData.monthlyData.notesStatus.find(d => d.month === monthKey);

  // If requested month not found, use the most recent month's data
  if (!revenueData && demoData.monthlyData.revenue.length > 0) {
    revenueData = demoData.monthlyData.revenue[demoData.monthlyData.revenue.length - 1];
  }
  if (!sessionsData && demoData.monthlyData.sessions.length > 0) {
    sessionsData = demoData.monthlyData.sessions[demoData.monthlyData.sessions.length - 1];
  }
  if (!clientGrowthData && demoData.monthlyData.clientGrowth.length > 0) {
    clientGrowthData = demoData.monthlyData.clientGrowth[demoData.monthlyData.clientGrowth.length - 1];
  }
  if (!churnData && demoData.monthlyData.churn.length > 0) {
    churnData = demoData.monthlyData.churn[demoData.monthlyData.churn.length - 1];
  }
  if (!notesData && demoData.monthlyData.notesStatus.length > 0) {
    notesData = demoData.monthlyData.notesStatus[demoData.monthlyData.notesStatus.length - 1];
  }

  // Get performance metrics from config
  const perfMetrics = demoData.config.performance.metrics;

  // Calculate revenue
  const revenue = revenueData?.value ?? 0;

  // Calculate sessions
  const sessions = sessionsData?.completed ?? 0;

  // Calculate client metrics
  const activeClients = clientGrowthData?.activeClients ?? 0;
  const newClients = clientGrowthData?.new ?? 0;
  const churnedClients = churnData?.count ?? 0;

  // Calculate capacity/openings
  const totalCapacity = demoData.config.clinicians.reduce(
    (sum, c) => sum + c.caseload.targetClients,
    0
  );
  const openings = Math.max(0, totalCapacity - activeClients);

  // Attendance metrics from performance config
  const showRate = perfMetrics.showRate;
  const cancelRate = perfMetrics.cancelRate;
  const noShowRate = perfMetrics.noShowRate;

  // Split cancel rate into components (approximation)
  const clientCancelRate = cancelRate * 0.7;
  const lateCancelRate = cancelRate * 0.1;
  const clinicianCancelRate = cancelRate * 0.2;

  // Notes metrics
  const outstandingPercent = notesData
    ? (notesData.overdue / Math.max(1, notesData.total)) * 100
    : perfMetrics.notesOverdueRate * 100;

  return {
    revenue: {
      value: revenue,
      formatted: formatCurrency(revenue),
    },
    sessions: {
      completed: sessions,
    },
    clients: {
      active: activeClients,
      new: newClients,
      churned: churnedClients,
      openings,
    },
    attendance: {
      showRate,
      clientCancelRate,
      lateCancelRate,
      clinicianCancelRate,
      rebookRate: perfMetrics.rebookRate,
    },
    notes: {
      outstandingPercent,
    },
  };
}

/**
 * Hook to get dashboard metrics for a specific month
 * Uses demo data when available, falls back to local synthetic data
 *
 * @param month - Month (0-11, JavaScript Date format)
 * @param year - Full year (e.g., 2025)
 */
export function useMetrics(month: number, year: number): UseMetricsResult {
  const demoData = useDemoData();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Use demo data if available, otherwise fall back to static data
      if (demoData) {
        const metrics = extractDemoMetrics(demoData, month, year);
        setData(metrics);
      } else {
        const localData = calculateDashboardMetrics(month, year);
        setData(localData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate metrics'));
    } finally {
      setLoading(false);
    }
  }, [month, year, demoData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useMetrics;
