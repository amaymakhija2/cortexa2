import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, ChevronRight, Calendar, User } from 'lucide-react';

// =============================================================================
// MILESTONE OPPORTUNITY CARD
// =============================================================================
// Shows clients approaching a key retention milestone (like session 5).
// These are opportunities for proactive intervention to improve retention.
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

export const MilestoneOpportunityCard: React.FC<MilestoneOpportunityCardProps> = ({
  milestone,
  clients,
  successRate,
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

  const previewClients = clients.slice(0, maxPreview);

  // Group by sessions to go
  const oneAway = clients.filter((c) => c.sessionsToGo === 1).length;
  const twoAway = clients.filter((c) => c.sessionsToGo === 2).length;
  const threeAway = clients.filter((c) => c.sessionsToGo >= 3).length;

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
              className="p-3 rounded-xl bg-emerald-50"
              style={{ boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.2)' }}
            >
              <Target size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3
                className="text-xl xl:text-2xl text-stone-900 font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Approaching Session {milestone}
              </h3>
              <p className="text-stone-500 text-sm mt-0.5">
                Key retention milestone opportunity
              </p>
            </div>
          </div>

          {/* Summary stat */}
          <div className="text-right">
            <div
              className="text-3xl xl:text-4xl font-bold text-emerald-600"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {clients.length}
            </div>
            <div className="text-stone-500 text-sm">clients</div>
          </div>
        </div>

        {/* Progress breakdown and success rate */}
        <div className="flex flex-wrap items-center gap-4 mt-5">
          {/* Sessions to go breakdown */}
          <div className="flex items-center gap-2">
            {oneAway > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">
                  {oneAway} next session
                </span>
              </div>
            )}
            {twoAway > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  {twoAway} in 2 sessions
                </span>
              </div>
            )}
            {threeAway > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200">
                <div className="w-2 h-2 rounded-full bg-stone-400" />
                <span className="text-sm font-semibold text-stone-600">
                  {threeAway} in 3+ sessions
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          {successRate !== undefined && (
            <>
              <div className="w-px h-6 bg-stone-200" />

              {/* Success rate indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
                <TrendingUp size={14} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">
                  {successRate}% reach session {milestone}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Client list preview */}
      {previewClients.length > 0 && (
        <div className="divide-y divide-stone-100">
          {previewClients.map((client, index) => {
            const isOneAway = client.sessionsToGo === 1;
            const isTwoAway = client.sessionsToGo === 2;

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
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-0.5">
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
                  className="text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* View all footer */}
      {clients.length > maxPreview && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full px-6 xl:px-8 py-4 flex items-center justify-center gap-2 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors border-t border-stone-100"
        >
          <span>View all {clients.length} clients</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="px-6 xl:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-4">
            <User size={32} className="text-stone-400" />
          </div>
          <h4 className="text-lg font-semibold text-stone-900 mb-1">
            No clients approaching
          </h4>
          <p className="text-stone-500 text-sm">
            No active clients are currently approaching session {milestone}
          </p>
        </div>
      )}
    </div>
  );
};

export default MilestoneOpportunityCard;
