import React from 'react';
import { ChevronRight, Phone } from 'lucide-react';
import { ActionableClientListCard, Badge, ClientRowProps } from './ActionableClientListCard';

// =============================================================================
// AT-RISK CLIENTS CARD
// =============================================================================
// Shows clients who haven't booked their next appointment and may churn.
// Built on ActionableClientListCard base component.
// =============================================================================

export interface AtRiskClient {
  /** Client ID */
  id: string;
  /** Client name */
  name: string;
  /** Days since last session */
  daysSinceLastSession: number;
  /** Total sessions completed */
  totalSessions: number;
  /** Assigned clinician */
  clinician: string;
  /** Risk level based on days without appointment */
  riskLevel: 'high' | 'medium' | 'low';
}

export interface AtRiskClientsCardProps {
  /** List of at-risk clients */
  clients: AtRiskClient[];
  /** Total active clients (for context) */
  totalActiveClients: number;
  /** Callback when "View All" is clicked */
  onViewAll?: () => void;
  /** Callback when a specific client is clicked */
  onClientClick?: (clientId: string) => void;
  /** Maximum clients to show in preview */
  maxPreview?: number;
  /** Additional className */
  className?: string;
}

const RISK_CONFIG = {
  high: {
    label: 'critical',
    sublabel: '(21+ days)',
    color: 'rose' as const,
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  medium: {
    label: 'warning',
    sublabel: '(14-21 days)',
    color: 'amber' as const,
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  low: {
    label: 'watch',
    sublabel: '(7-14 days)',
    color: 'stone' as const,
    dotColor: 'bg-stone-400',
    textColor: 'text-stone-500',
    bgColor: 'bg-stone-100',
  },
};

// Client row component
const AtRiskClientRow: React.FC<ClientRowProps<AtRiskClient>> = ({
  client,
  index,
  isVisible,
  onClick,
}) => {
  const riskConfig = RISK_CONFIG[client.riskLevel];

  return (
    <button
      onClick={onClick}
      className="w-full px-6 xl:px-8 py-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors text-left group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.3s ease-out',
        transitionDelay: `${(index + 1) * 50}ms`,
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Risk indicator */}
        <div className={`w-2 h-8 rounded-full ${riskConfig.dotColor}`} />

        {/* Client info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 truncate">
              {client.name}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${riskConfig.bgColor} ${riskConfig.textColor} font-medium`}
            >
              {client.daysSinceLastSession}d
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-500 mt-0.5">
            <span>{client.totalSessions} sessions</span>
            <span>·</span>
            <span>{client.clinician}</span>
          </div>
        </div>
      </div>

      {/* Action hint */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Phone size={16} className="text-stone-400" />
        <ChevronRight size={16} className="text-stone-400" />
      </div>
    </button>
  );
};

export const AtRiskClientsCard: React.FC<AtRiskClientsCardProps> = ({
  clients,
  totalActiveClients,
  onViewAll,
  onClientClick,
  maxPreview = 5,
  className = '',
}) => {
  const highRiskCount = clients.filter((c) => c.riskLevel === 'high').length;
  const mediumRiskCount = clients.filter((c) => c.riskLevel === 'medium').length;
  const lowRiskCount = clients.filter((c) => c.riskLevel === 'low').length;
  const atRiskPercentage =
    totalActiveClients > 0
      ? ((clients.length / totalActiveClients) * 100).toFixed(1)
      : '0';

  const badges: Badge[] = [
    {
      count: highRiskCount,
      label: RISK_CONFIG.high.label,
      sublabel: RISK_CONFIG.high.sublabel,
      color: RISK_CONFIG.high.color,
    },
    {
      count: mediumRiskCount,
      label: RISK_CONFIG.medium.label,
      sublabel: RISK_CONFIG.medium.sublabel,
      color: RISK_CONFIG.medium.color,
    },
    {
      count: lowRiskCount,
      label: RISK_CONFIG.low.label,
      sublabel: RISK_CONFIG.low.sublabel,
      color: RISK_CONFIG.low.color,
    },
  ];

  return (
    <ActionableClientListCard
      title="At-Risk Clients"
      subtitle="No upcoming appointment scheduled"
      accentColor="rose"
      summaryValue={clients.length}
      summaryLabel={`${atRiskPercentage}% of active`}
      badges={badges}
      clients={clients}
      renderClientRow={(props) => <AtRiskClientRow {...props} />}
      onViewAll={onViewAll}
      onClientClick={onClientClick}
      maxPreview={maxPreview}
      emptyStateTitle="All clients are healthy"
      emptyStateDescription="Everyone has their next appointment scheduled"
      className={className}
    />
  );
};

export default AtRiskClientsCard;
