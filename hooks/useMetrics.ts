import { useState, useEffect, useCallback } from 'react';
import { calculateDashboardMetrics } from '../data/metricsCalculator';

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
 * Hook to get dashboard metrics for a specific month
 * Uses local synthetic data
 *
 * @param month - Month (0-11, JavaScript Date format)
 * @param year - Full year (e.g., 2025)
 */
export function useMetrics(month: number, year: number): UseMetricsResult {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const localData = calculateDashboardMetrics(month, year);
      setData(localData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate metrics'));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useMetrics;
