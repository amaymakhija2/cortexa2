import { useState, useEffect, useCallback } from 'react';
import { fetchAllMetrics, MonthlyMetrics, AuthenticationError } from '../lib/apiClient';

// Only use fallback in development (tree-shaken in production build)
const isDev = import.meta.env.DEV;

export interface MonthlyDataPoint {
  month: string;
  year: number;
  monthNum: number;
  revenue: number;
  sessions: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
}

export interface UseMonthlyDataResult {
  data: MonthlyDataPoint[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Hook to fetch monthly data for charts and comparisons
 * Replaces: getMonthlyData(numMonths)
 *
 * @param numMonths - Number of recent months to return (default: 12)
 */
export function useMonthlyData(numMonths: number = 12): UseMonthlyDataResult {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllMetrics();
      const allMetrics = response.metrics as Record<string, MonthlyMetrics>;
      const availableMonths = response.availableMonths || Object.keys(allMetrics).sort();

      // Get most recent numMonths
      const recentMonths = availableMonths.slice(-numMonths);

      const monthlyData: MonthlyDataPoint[] = recentMonths.map(monthKey => {
        const [yearStr, monthStr] = monthKey.split('-');
        const year = parseInt(yearStr);
        const monthNum = parseInt(monthStr) - 1; // Convert to 0-indexed
        const metrics = allMetrics[monthKey];

        return {
          month: MONTH_NAMES[monthNum],
          year,
          monthNum,
          revenue: metrics.revenue,
          sessions: metrics.sessions,
          activeClients: metrics.activeClients,
          newClients: metrics.newClients,
          churnedClients: metrics.churnedClients,
        };
      });

      setData(monthlyData);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        setError(err);
      } else if (isDev) {
        // API not available (dev mode only) - fall back to local calculation
        console.warn('API unavailable, using local data fallback for monthly data');
        try {
          const { getMonthlyData } = await import('../data/metricsCalculator');
          const localData = getMonthlyData(numMonths);
          setData(localData);
        } catch (localErr) {
          setError(err instanceof Error ? err : new Error('Failed to fetch monthly data'));
        }
      } else {
        // Production - no fallback, show error
        setError(err instanceof Error ? err : new Error('Failed to fetch monthly data'));
      }
    } finally {
      setLoading(false);
    }
  }, [numMonths]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useMonthlyData;
