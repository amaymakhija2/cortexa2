import { useState, useEffect, useCallback } from 'react';
import { fetchAllMetrics, MonthlyMetrics, AuthenticationError } from '../lib/apiClient';

// Only use fallback in development (tree-shaken in production build)
const isDev = import.meta.env.DEV;

export interface DataDateRange {
  earliest: Date;
  latest: Date;
}

export interface UseDataDateRangeResult {
  data: DataDateRange | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get the date range of available data
 * Replaces: getDataDateRange()
 */
export function useDataDateRange(): UseDataDateRangeResult {
  const [data, setData] = useState<DataDateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllMetrics();
      const availableMonths = response.availableMonths || Object.keys(response.metrics as Record<string, MonthlyMetrics>);

      if (availableMonths.length === 0) {
        setData({ earliest: new Date(), latest: new Date() });
        return;
      }

      // Sort months chronologically
      const sortedMonths = [...availableMonths].sort();

      // Parse first and last month
      const [earliestYear, earliestMonth] = sortedMonths[0].split('-').map(Number);
      const [latestYear, latestMonth] = sortedMonths[sortedMonths.length - 1].split('-').map(Number);

      setData({
        earliest: new Date(earliestYear, earliestMonth - 1, 1),
        latest: new Date(latestYear, latestMonth - 1, 1),
      });
    } catch (err) {
      if (err instanceof AuthenticationError) {
        setError(err);
      } else if (isDev) {
        // API not available (dev mode only) - fall back to local calculation
        console.warn('API unavailable, using local data fallback for date range');
        try {
          const { getDataDateRange } = await import('../data/metricsCalculator');
          const localData = getDataDateRange();
          setData(localData);
        } catch (localErr) {
          setError(err instanceof Error ? err : new Error('Failed to fetch data range'));
        }
      } else {
        // Production - no fallback, show error
        setError(err instanceof Error ? err : new Error('Failed to fetch data range'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useDataDateRange;
