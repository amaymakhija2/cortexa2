import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DrawerHeader } from './DrawerHeader';
import { MetricTabs } from './MetricTabs';
import { MetricExplanation } from './MetricExplanation';
import { ProblemClientList, type ProblemClient, type ClinicianBreakdown } from './ProblemClientList';
import { getMetricGroup, getPrimaryMetric, type MetricDefinition } from './metricConfig';

// =============================================================================
// CLINICIAN DRAWER COMPONENT - Premium Editorial Design
// =============================================================================

export interface ClinicianMetrics {
  [key: string]: number;
}

export interface ClinicianData {
  id: number;
  name: string;
  shortName: string;
  role: string;
  avatar: string;
  metrics: ClinicianMetrics;
}

export interface ClinicianDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clinician: ClinicianData | null;
  allClinicians: ClinicianData[];
  groupId: string;
  initialMetricId?: string;
  onViewDetails?: (clinicianId: number) => void;
  onClinicianClick?: (clinicianId: number) => void;
}

// =============================================================================
// MOCK CLIENT DATA GENERATORS
// =============================================================================

const MOCK_CLIENT_NAMES = [
  'John Smith', 'Jane Doe', 'Mike Brown', 'Sarah Wilson', 'Tom Davis',
  'Emily Chen', 'David Kim', 'Lisa Park', 'James Lee', 'Anna Taylor',
  'Chris Martin', 'Rachel Green', 'Kevin White', 'Maria Garcia', 'Ryan Miller',
];

const generateMockClients = (
  metric: MetricDefinition,
  count: number,
): ProblemClient[] => {
  const clients: ProblemClient[] = [];
  const now = new Date();

  for (let i = 0; i < count && i < MOCK_CLIENT_NAMES.length; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 5;
    const lastSessionDate = new Date(now);
    lastSessionDate.setDate(lastSessionDate.getDate() - daysAgo);

    const client: ProblemClient = {
      id: `client-${i}`,
      name: MOCK_CLIENT_NAMES[i],
    };

    metric.columns.forEach(col => {
      switch (col.key) {
        case 'lastSession':
        case 'firstSession':
        case 'sessionDate':
          client[col.key] = lastSessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'daysSince':
          client[col.key] = daysAgo;
          break;
        case 'sessions':
          client[col.key] = Math.floor(Math.random() * 10) + 1;
          break;
        case 'revenue':
          client[col.key] = `$${(Math.random() * 2000 + 500).toFixed(0)}`;
          break;
        case 'rate':
          client[col.key] = `$${(Math.random() * 50 + 100).toFixed(0)}`;
          break;
        case 'cancelCount':
          client[col.key] = Math.floor(Math.random() * 5) + 1;
          break;
        case 'noshowCount':
          client[col.key] = Math.floor(Math.random() * 3);
          break;
        case 'booked':
          client[col.key] = Math.floor(Math.random() * 15) + 5;
          break;
        case 'cancelRate':
          client[col.key] = `${(Math.random() * 30 + 10).toFixed(0)}%`;
          break;
        case 'status':
          const statuses = ['At Risk', 'Critical', 'Warning', 'Inactive'];
          client[col.key] = statuses[Math.floor(Math.random() * statuses.length)];
          break;
        case 'urgency':
          const urgencies = ['High', 'Medium', 'Low'];
          client[col.key] = urgencies[Math.floor(Math.random() * urgencies.length)];
          break;
        case 'churnType':
          const types = ['Early', 'Mid', 'Late'];
          client[col.key] = types[Math.floor(Math.random() * types.length)];
          break;
        case 'frequency':
          const freqs = ['Weekly', 'Biweekly', 'Monthly', 'Sporadic'];
          client[col.key] = freqs[Math.floor(Math.random() * freqs.length)];
          break;
        case 'dueDate':
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 5) - 2);
          client[col.key] = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'daysOverdue':
          client[col.key] = Math.floor(Math.random() * 10) + 1;
          break;
        case 'hoursLeft':
          client[col.key] = Math.floor(Math.random() * 48);
          break;
        case 'outcome':
          const outcomes = ['Did not convert', 'Cancelled', 'No-show'];
          client[col.key] = outcomes[Math.floor(Math.random() * outcomes.length)];
          break;
        case 'reason':
          const reasons = ['Cost', 'Scheduling', 'Fit', 'Unknown'];
          client[col.key] = reasons[Math.floor(Math.random() * reasons.length)];
          break;
      }
    });

    clients.push(client);
  }

  return clients;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ClinicianDrawer: React.FC<ClinicianDrawerProps> = ({
  isOpen,
  onClose,
  clinician,
  allClinicians,
  groupId,
  initialMetricId,
  onViewDetails,
  onClinicianClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const metricGroup = getMetricGroup(groupId);
  const primaryMetric = getPrimaryMetric(groupId);
  const [selectedMetricId, setSelectedMetricId] = useState(
    initialMetricId || primaryMetric?.id || ''
  );

  useEffect(() => {
    const newInitial = initialMetricId || primaryMetric?.id || '';
    setSelectedMetricId(newInitial);
  }, [groupId, initialMetricId, primaryMetric?.id]);

  // Enhanced animation sequence
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setContentReady(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
          // Stagger content reveal
          setTimeout(() => setContentReady(true), 150);
        });
      });
    } else {
      setIsAnimating(false);
      setContentReady(false);
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentMetric = useMemo(() => {
    return metricGroup?.metrics.find(m => m.id === selectedMetricId) || primaryMetric;
  }, [metricGroup, selectedMetricId, primaryMetric]);

  const { practiceAvg, topPerformer } = useMemo(() => {
    if (!currentMetric || allClinicians.length === 0) {
      return { practiceAvg: 0, topPerformer: 0 };
    }

    const values = allClinicians.map(c => c.metrics[currentMetric.key] ?? 0);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const top = currentMetric.higherIsBetter
      ? Math.max(...values)
      : Math.min(...values);

    return { practiceAvg: avg, topPerformer: top };
  }, [currentMetric, allClinicians]);

  const clinicianValue = useMemo(() => {
    if (!currentMetric) return 0;
    if (clinician) {
      return clinician.metrics[currentMetric.key] ?? 0;
    }
    return practiceAvg;
  }, [currentMetric, clinician, practiceAvg]);

  const { problemClients, clinicianBreakdown, totalCount } = useMemo(() => {
    if (!currentMetric) {
      return { problemClients: [], clinicianBreakdown: [], totalCount: 0 };
    }

    const isTeamAverage = !clinician;

    if (isTeamAverage) {
      const sorted = [...allClinicians].sort((a, b) => {
        const aVal = a.metrics[currentMetric.key] ?? 0;
        const bVal = b.metrics[currentMetric.key] ?? 0;
        return currentMetric.higherIsBetter ? bVal - aVal : aVal - bVal;
      });

      const breakdown: ClinicianBreakdown[] = sorted.map((c, idx) => {
        const value = c.metrics[currentMetric.key] ?? 0;
        const diff = value - practiceAvg;
        const diffStr = diff >= 0
          ? `+${currentMetric.format(diff)}`
          : currentMetric.format(diff);

        return {
          id: c.id.toString(),
          name: c.name,
          value,
          rank: idx + 1,
          vsAvg: diffStr,
        };
      });

      return { problemClients: [], clinicianBreakdown: breakdown, totalCount: breakdown.length };
    }

    let clientCount = 0;
    if (currentMetric.key === 'atRiskClients') {
      clientCount = clinician?.metrics.atRiskClients ?? 3;
    } else if (currentMetric.key === 'clientsChurned') {
      clientCount = clinician?.metrics.clientsChurned ?? 2;
    } else if (currentMetric.key === 'outstandingNotes' || currentMetric.key === 'overdueNotes' || currentMetric.key === 'dueWithin48hNotes') {
      clientCount = clinician?.metrics[currentMetric.key] ?? 5;
    } else {
      const active = clinician?.metrics.activeClients ?? 20;
      clientCount = Math.max(1, Math.round(active * 0.2));
    }

    const clients = generateMockClients(currentMetric, Math.min(clientCount, 10));

    return { problemClients: clients, clinicianBreakdown: [], totalCount: clientCount };
  }, [currentMetric, clinician, allClinicians, practiceAvg]);

  const handleViewDetails = useCallback(() => {
    if (clinician && onViewDetails) {
      onViewDetails(clinician.id);
    }
  }, [clinician, onViewDetails]);

  const handleClinicianClick = useCallback((clinicianId: string) => {
    if (onClinicianClick) {
      onClinicianClick(parseInt(clinicianId, 10));
    }
  }, [onClinicianClick]);

  if (!isVisible || !metricGroup || !currentMetric) return null;

  const isTeamAverage = !clinician;

  return createPortal(
    <>
      {/* Premium Backdrop with depth */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          marginLeft: 'var(--sidebar-width, 72px)',
          backgroundColor: isAnimating ? 'rgba(12, 10, 9, 0.6)' : 'rgba(12, 10, 9, 0)',
          backdropFilter: isAnimating ? 'blur(8px) saturate(180%)' : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? 'blur(8px) saturate(180%)' : 'blur(0px)',
          transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[9999] w-full max-w-[520px] flex flex-col"
        style={{
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
          boxShadow: isAnimating
            ? '-40px 0 100px -20px rgba(0, 0, 0, 0.25), -20px 0 40px -10px rgba(0, 0, 0, 0.1)'
            : 'none',
        }}
      >
        {/* Decorative top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 400ms ease 100ms',
          }}
        />

        {/* Content with staggered reveal */}
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{
            opacity: contentReady ? 1 : 0,
            transform: contentReady ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 300ms ease',
          }}
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0">
            <DrawerHeader
              clinicianName={isTeamAverage ? 'Practice Average' : clinician.name}
              avatar={clinician?.avatar}
              isTeamAverage={isTeamAverage}
              clinicianCount={allClinicians.length}
              onViewDetails={isTeamAverage ? undefined : handleViewDetails}
              onClose={onClose}
            />
          </div>

          {/* Metric Tabs - Fixed */}
          <div className="flex-shrink-0">
            <MetricTabs
              metrics={metricGroup.metrics}
              selectedMetricId={selectedMetricId}
              onSelect={setSelectedMetricId}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Metric Explanation */}
            <div className="border-b border-stone-100">
              <MetricExplanation
                metric={currentMetric}
                value={clinicianValue}
                practiceAvg={practiceAvg}
                topPerformer={topPerformer}
                isTeamAverage={isTeamAverage}
              />
            </div>

            {/* Problem Client List */}
            <ProblemClientList
              metric={currentMetric}
              clients={problemClients}
              totalCount={totalCount}
              isTeamAverage={isTeamAverage}
              clinicianBreakdown={clinicianBreakdown}
              onClinicianClick={handleClinicianClick}
            />
          </div>
        </div>

        {/* Subtle bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(250, 250, 249, 0.9) 0%, transparent 100%)',
          }}
        />
      </div>
    </>,
    document.body
  );
};

export default ClinicianDrawer;
