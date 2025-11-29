import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, ChevronRight, Phone } from 'lucide-react';

// =============================================================================
// AT-RISK CLIENTS CARD
// =============================================================================
// Shows clients who haven't booked their next appointment and may churn.
// Designed for immediate actionability - practice owners can take action.
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
    label: '21+ days',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  medium: {
    label: '14-21 days',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: '7-14 days',
    color: 'text-stone-500',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-200',
    dotColor: 'bg-stone-400',
  },
};

export const AtRiskClientsCard: React.FC<AtRiskClientsCardProps> = ({
  clients,
  totalActiveClients,
  onViewAll,
  onClientClick,
  maxPreview = 5,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const highRiskCount = clients.filter((c) => c.riskLevel === 'high').length;
  const mediumRiskCount = clients.filter((c) => c.riskLevel === 'medium').length;
  const lowRiskCount = clients.filter((c) => c.riskLevel === 'low').length;
  const previewClients = clients.slice(0, maxPreview);
  const atRiskPercentage = totalActiveClients > 0
    ? ((clients.length / totalActiveClients) * 100).toFixed(1)
    : '0';

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.4s ease-out',
      }}
    >
      {/* Header */}
      <div className="p-6 xl:p-8 border-b border-stone-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl bg-rose-50"
              style={{ boxShadow: '0 2px 8px -2px rgba(244, 63, 94, 0.2)' }}
            >
              <AlertTriangle size={24} className="text-rose-600" />
            </div>
            <div>
              <h3
                className="text-xl xl:text-2xl text-stone-900 font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                At-Risk Clients
              </h3>
              <p className="text-stone-500 text-sm mt-0.5">
                No upcoming appointment scheduled
              </p>
            </div>
          </div>

          {/* Summary stat */}
          <div className="text-right">
            <div
              className="text-3xl xl:text-4xl font-bold text-rose-600"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {clients.length}
            </div>
            <div className="text-stone-500 text-sm">
              {atRiskPercentage}% of active
            </div>
          </div>
        </div>

        {/* Risk breakdown pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {highRiskCount > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${RISK_CONFIG.high.bgColor} border ${RISK_CONFIG.high.borderColor}`}>
              <div className={`w-2 h-2 rounded-full ${RISK_CONFIG.high.dotColor}`} />
              <span className={`text-sm font-semibold ${RISK_CONFIG.high.color}`}>
                {highRiskCount} critical
              </span>
              <span className="text-xs text-rose-400">({RISK_CONFIG.high.label})</span>
            </div>
          )}
          {mediumRiskCount > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${RISK_CONFIG.medium.bgColor} border ${RISK_CONFIG.medium.borderColor}`}>
              <div className={`w-2 h-2 rounded-full ${RISK_CONFIG.medium.dotColor}`} />
              <span className={`text-sm font-semibold ${RISK_CONFIG.medium.color}`}>
                {mediumRiskCount} warning
              </span>
              <span className="text-xs text-amber-400">({RISK_CONFIG.medium.label})</span>
            </div>
          )}
          {lowRiskCount > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${RISK_CONFIG.low.bgColor} border ${RISK_CONFIG.low.borderColor}`}>
              <div className={`w-2 h-2 rounded-full ${RISK_CONFIG.low.dotColor}`} />
              <span className={`text-sm font-semibold ${RISK_CONFIG.low.color}`}>
                {lowRiskCount} watch
              </span>
              <span className="text-xs text-stone-400">({RISK_CONFIG.low.label})</span>
            </div>
          )}
        </div>
      </div>

      {/* Client list preview */}
      {previewClients.length > 0 && (
        <div className="divide-y divide-stone-100">
          {previewClients.map((client, index) => {
            const riskConfig = RISK_CONFIG[client.riskLevel];

            return (
              <button
                key={client.id}
                onClick={() => onClientClick?.(client.id)}
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${riskConfig.bgColor} ${riskConfig.color} font-medium`}>
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
          })}
        </div>
      )}

      {/* View all footer */}
      {clients.length > maxPreview && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full px-6 xl:px-8 py-4 flex items-center justify-center gap-2 text-amber-600 font-semibold hover:bg-amber-50 transition-colors border-t border-stone-100"
        >
          <span>View all {clients.length} at-risk clients</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="px-6 xl:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-4">
            <User size={32} className="text-emerald-600" />
          </div>
          <h4 className="text-lg font-semibold text-stone-900 mb-1">
            All clients are healthy
          </h4>
          <p className="text-stone-500 text-sm">
            Everyone has their next appointment scheduled
          </p>
        </div>
      )}
    </div>
  );
};

export default AtRiskClientsCard;
