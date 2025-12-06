import { useState, useEffect, useCallback } from 'react';
import { fetchMonthMetrics, MonthlyMetrics, PracticeSettings, AuthenticationError } from '../lib/apiClient';

// Only import fallback in development (tree-shaken in production build)
const isDev = import.meta.env.DEV;

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

// Format currency helper
function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

// Transform API response to DashboardMetrics format
function transformToMetrics(
  monthData: MonthlyMetrics,
  settings: PracticeSettings
): DashboardMetrics {
  return {
    revenue: {
      value: monthData.revenue,
      formatted: formatCurrency(monthData.revenue),
    },
    sessions: {
      completed: monthData.sessions,
    },
    clients: {
      active: monthData.activeClients,
      new: monthData.newClients,
      churned: monthData.churnedClients,
      openings: settings.currentOpenings,
    },
    attendance: {
      showRate: settings.attendance.showRate,
      clientCancelRate: settings.attendance.clientCancelled,
      lateCancelRate: settings.attendance.lateCancelled,
      clinicianCancelRate: settings.attendance.clinicianCancelled,
      rebookRate: settings.attendance.rebookRate,
    },
    notes: {
      outstandingPercent: settings.outstandingNotesPercent,
    },
  };
}

/**
 * Hook to fetch dashboard metrics for a specific month
 * Replaces: calculateDashboardMetrics(month, year)
 *
 * @param month - Month (0-11, JavaScript Date format)
 * @param year - Full year (e.g., 2025)
 */
export function useMetrics(month: number, year: number): UseMetricsResult {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Convert to API format: "YYYY-MM"
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMonthMetrics(monthStr);

      // API returns single month data when month param is provided
      const monthData = response.metrics as MonthlyMetrics;
      const transformed = transformToMetrics(monthData, response.settings);

      setData(transformed);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        // Auth error - will trigger re-login via apiClient
        setError(err);
      } else if (isDev) {
        // API not available (dev mode only) - fall back to local calculation
        console.warn('API unavailable, using local data fallback');
        try {
          const { calculateDashboardMetrics } = await import('../data/metricsCalculator');
          const localData = calculateDashboardMetrics(month, year);
          setData(localData);
        } catch (localErr) {
          setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
        }
      } else {
        // Production - no fallback, show error
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      }
    } finally {
      setLoading(false);
    }
  }, [monthStr, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useMetrics;
