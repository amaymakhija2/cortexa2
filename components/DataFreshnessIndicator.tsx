import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

// =============================================================================
// DATA FRESHNESS INDICATOR
// =============================================================================
// A sophisticated, reassuring sync status indicator for the sidebar.
// Designed for practice owners who need clarity without technical jargon.
//
// Design principles:
// - Reassuring: "Your data is fresh" - full, friendly sentences
// - Human-readable: "Updated 2 hours ago" on hover
// - Elegant: Fits the refined dark sidebar aesthetic
// - Non-overwhelming: Subtle but trustworthy
// =============================================================================

interface DataFreshnessIndicatorProps {
  /** Whether the sidebar is collapsed */
  isCollapsed?: boolean;
  /** Last sync timestamp (ISO string or Date) */
  lastSyncTime?: Date | string;
  /** Whether a sync is currently in progress */
  isSyncing?: boolean;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
  /** Minutes until next refresh is available (0 = available now) */
  minutesUntilNextRefresh?: number;
  /** Whether refresh is currently available */
  canRefresh?: boolean;
}

// Format relative time in a friendly, human way
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
};

// Get status based on last sync time
const getDataStatus = (lastSync: Date | null): 'fresh' | 'recent' | 'stale' => {
  if (!lastSync) return 'stale';

  const now = new Date();
  const diffHours = (now.getTime() - lastSync.getTime()) / 3600000;

  if (diffHours < 12) return 'fresh';   // Synced within 12 hours
  if (diffHours < 48) return 'recent';  // Synced within 48 hours
  return 'stale';                        // Older than 48 hours
};

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  isCollapsed = false,
  lastSyncTime,
  isSyncing = false,
  onRefresh,
  minutesUntilNextRefresh = 0,
  canRefresh = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastSync = lastSyncTime
    ? (typeof lastSyncTime === 'string' ? new Date(lastSyncTime) : lastSyncTime)
    : null;

  const status = isSyncing ? 'syncing' : getDataStatus(lastSync);
  const relativeTime = lastSync ? formatRelativeTime(lastSync) : null;

  // Handle tooltip visibility with delay
  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 100);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 150);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Status configuration with user-friendly language
  const statusConfig = {
    syncing: {
      dotColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.4)',
      message: 'Your data is refreshing',
      hoverMessage: 'Fetching latest from your EHR',
    },
    fresh: {
      dotColor: '#34d399',
      glowColor: 'rgba(52, 211, 153, 0.35)',
      message: 'Your data is fresh',
      hoverMessage: relativeTime ? `Updated ${relativeTime}` : 'Up to date',
    },
    recent: {
      dotColor: '#a8a29e',
      glowColor: 'rgba(168, 162, 158, 0.3)',
      message: 'Your data is current',
      hoverMessage: relativeTime ? `Updated ${relativeTime}` : 'Recently synced',
    },
    stale: {
      dotColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      message: 'Refresh available',
      hoverMessage: relativeTime ? `Last updated ${relativeTime}` : 'No recent sync',
    },
  };

  const config = statusConfig[status];

  // ============================================================================
  // COLLAPSED STATE - Elegant dot with tooltip
  // ============================================================================
  if (isCollapsed) {
    return (
      <div
        className="relative flex items-center justify-center cursor-default"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Status dot with glow */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-1.5 rounded-full transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              opacity: showTooltip ? 1 : 0.6,
            }}
          />

          {/* Pulse animation for syncing */}
          {status === 'syncing' && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: config.dotColor,
                opacity: 0.5,
              }}
            />
          )}

          {/* Main dot */}
          <div
            className="relative w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: config.dotColor,
              boxShadow: `0 0 6px ${config.dotColor}`,
            }}
          />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute left-full ml-4 z-[100] pointer-events-none"
            style={{ animation: 'tooltipFadeIn 150ms ease-out forwards' }}
          >
            <div
              className="px-3.5 py-2.5 rounded-xl whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)',
              }}
            >
              <p className="text-[13px] text-stone-200 font-medium">
                {config.message}
              </p>
              <p className="text-[12px] text-stone-500 mt-0.5">
                {config.hoverMessage}
              </p>
            </div>

            {/* Arrow */}
            <div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45"
              style={{
                background: '#292524',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
        )}

        <style>{`
          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translateX(-6px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================================
  // EXPANDED STATE - Full message with hover details
  // ============================================================================
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main indicator - elegant horizontal layout */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-default transition-all duration-300"
        style={{
          background: showTooltip
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: showTooltip
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Status dot with glow */}
        <div className="relative flex-shrink-0">
          {/* Glow */}
          <div
            className="absolute -inset-1 rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* Pulse for syncing */}
          {status === 'syncing' && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: config.dotColor,
                opacity: 0.4,
              }}
            />
          )}

          {/* Dot */}
          <div
            className="relative w-2 h-2 rounded-full"
            style={{
              backgroundColor: config.dotColor,
              boxShadow: `0 0 4px ${config.dotColor}`,
            }}
          />
        </div>

        {/* Message */}
        <span className="text-[14px] text-stone-300 font-medium">
          {config.message}
        </span>
      </div>

      {/* Hover tooltip with more details + refresh option - slides DOWN from indicator */}
      {showTooltip && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-[100]"
          style={{ animation: 'tooltipSlideDown 150ms ease-out forwards' }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow pointing up */}
          <div
            className="absolute left-6 -top-1.5 w-3 h-3 rotate-45"
            style={{
              background: '#292524',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          />

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Time info */}
            <div className="px-4 py-3">
              <p className="text-[14px] text-stone-300 font-medium">
                {config.hoverMessage}
              </p>
              {status === 'syncing' && (
                <p className="text-[13px] text-stone-500 mt-1 flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" />
                  Please wait...
                </p>
              )}
            </div>

            {/* Refresh button - only when not syncing and available */}
            {status !== 'syncing' && canRefresh && minutesUntilNextRefresh === 0 && (
              <div className="px-3 pb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[13px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    color: '#fbbf24',
                  }}
                >
                  <RefreshCw size={14} />
                  Request Data Refresh
                </button>
              </div>
            )}

            {/* Cooldown indicator */}
            {status !== 'syncing' && minutesUntilNextRefresh > 0 && (
              <div className="px-4 pb-3">
                <p className="text-[12px] text-stone-600">
                  Next refresh available in {minutesUntilNextRefresh}m
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tooltipSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DataFreshnessIndicator;
