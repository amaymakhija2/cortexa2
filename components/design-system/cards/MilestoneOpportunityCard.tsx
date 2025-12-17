import React from 'react';
import { TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import { ActionableClientListCard, Badge, ClientRowProps } from './ActionableClientListCard';

// =============================================================================
// MILESTONE OPPORTUNITY CARD
// =============================================================================
// Shows clients approaching a key retention milestone (like session 5).
// Built on ActionableClientListCard base component.
// =============================================================================

export interface ApproachingClient {
  /** Client ID */
  id: string;
  /** Client name */
  name: string;
  /** Current session count */
  currentSessions: number;
  /** Target milestone */
  targetMilestone: number;
  /** Sessions until milestone */
  sessionsToGo: number;
  /** Next appointment date (if scheduled) */
  nextAppointment?: string;
  /** Assigned clinician */
  clinician: string;
}

export interface MilestoneOpportunityCardProps {
  /** The milestone being tracked (e.g., 5 for "Session 5") */
  milestone: number;
  /** Clients approaching this milestone */
  clients: ApproachingClient[];
  /** Historical success rate at this milestone */
  successRate?: number;
  /** Callback when "View All" is clicked */
  onViewAll?: () => void;
  /** Callback when a specific client is clicked */
  onClientClick?: (clientId: string) => void;
  /** Maximum clients to show in preview */
  maxPreview?: number;
  /** Additional className */
  className?: string;
}

// Client row component
const MilestoneClientRow: React.FC<ClientRowProps<ApproachingClient> & { milestone: number }> = ({
  client,
  index,
  isVisible,
  onClick,
  milestone,
}) => {
  const isOneAway = client.sessionsToGo === 1;
  const isTwoAway = client.sessionsToGo === 2;

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
        {/* Progress indicator */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
            isOneAway
              ? 'bg-emerald-100 text-emerald-700'
              : isTwoAway
                ? 'bg-amber-50 text-amber-700'
                : 'bg-stone-100 text-stone-600'
          }`}
        >
          {client.currentSessions}/{milestone}
        </div>

        {/* Client info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 truncate">
              {client.name}
            </span>
            {isOneAway && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                1 to go!
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600 mt-0.5">
            <span>{client.clinician}</span>
            {client.nextAppointment && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {client.nextAppointment}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action hint */}
      <ChevronRight
        size={16}
        className="text-stone-400 group-hover:text-stone-600 transition-colors flex-shrink-0"
      />
    </button>
  );
};

export const MilestoneOpportunityCard: React.FC<MilestoneOpportunityCardProps> = ({
  milestone,
  clients,
  successRate,
  onViewAll,
  onClientClick,
  maxPreview = 5,
  className = '',
}) => {
  // Group by sessions to go
  const oneAway = clients.filter((c) => c.sessionsToGo === 1).length;
  const twoAway = clients.filter((c) => c.sessionsToGo === 2).length;
  const threeAway = clients.filter((c) => c.sessionsToGo >= 3).length;

  const badges: Badge[] = [
    { count: oneAway, label: 'next session', color: 'emerald' },
    { count: twoAway, label: 'in 2 sessions', color: 'amber' },
    { count: threeAway, label: 'in 3+ sessions', color: 'stone' },
  ];

  // Add success rate as a special badge if provided
  if (successRate !== undefined) {
    badges.push({
      count: successRate,
      label: `% reach session ${milestone}`,
      color: 'indigo',
    });
  }

  return (
    <ActionableClientListCard
      title={`Approaching Session ${milestone}`}
      subtitle="Key retention milestone opportunity"
      accentColor="emerald"
      summaryValue={clients.length}
      summaryLabel="clients"
      badges={badges}
      clients={clients}
      renderClientRow={(props) => (
        <MilestoneClientRow {...props} milestone={milestone} />
      )}
      onViewAll={onViewAll}
      onClientClick={onClientClick}
      maxPreview={maxPreview}
      emptyStateTitle="No clients approaching"
      emptyStateDescription={`No active clients are currently approaching session ${milestone}`}
      className={className}
    />
  );
};

export default MilestoneOpportunityCard;
