import React, { useState, useMemo } from 'react';

// =============================================================================
// CLIENT ROSTER CARD COMPONENT
// =============================================================================
// A card component for displaying a filterable list of clients.
// Follows the design system styling conventions.
// =============================================================================

export type ClientStatus = 'healthy' | 'at-risk' | 'new' | 'milestone';

export interface ClientData {
  id: string;
  name: string;
  initials: string;
  totalSessions: number;
  lastSeenDays: number;
  nextAppointment: string | null;
  status: ClientStatus;
  milestone?: number;
}

export interface ClientRosterCardProps {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** List of clients to display */
  clients: ClientData[];
  /** Max number of clients visible at once (scrollable if more). Defaults to 5 */
  maxVisible?: number;
  /** Additional className */
  className?: string;
}

const STATUS_COLORS: Record<ClientStatus, { bg: string; text: string; dot: string }> = {
  'healthy': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'at-risk': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  'new': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'milestone': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const SEGMENT_CONFIG = [
  { id: 'all' as const, label: 'All', color: 'stone' },
  { id: 'healthy' as const, label: 'Healthy', color: 'emerald' },
  { id: 'at-risk' as const, label: 'At-Risk', color: 'rose' },
  { id: 'new' as const, label: 'New', color: 'cyan' },
  { id: 'milestone' as const, label: 'Milestone', color: 'amber' },
] as const;

type SegmentId = typeof SEGMENT_CONFIG[number]['id'];

const SEGMENT_BUTTON_COLORS: Record<string, { selected: string; unselected: string }> = {
  stone: { selected: 'bg-stone-900 text-white', unselected: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
  emerald: { selected: 'bg-emerald-500 text-white', unselected: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  rose: { selected: 'bg-rose-500 text-white', unselected: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
  cyan: { selected: 'bg-cyan-500 text-white', unselected: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
  amber: { selected: 'bg-amber-500 text-white', unselected: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
};

/**
 * Format last seen days into human-readable string
 */
const formatLastSeen = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/**
 * ClientRosterCard - Filterable client list card
 *
 * @example
 * <ClientRosterCard
 *   title="Client Roster"
 *   subtitle="8 active clients"
 *   clients={clientList}
 * />
 */
// Each client row is approximately 76px (py-5 = 40px + content ~36px)
const CLIENT_ROW_HEIGHT = 76;

export const ClientRosterCard: React.FC<ClientRosterCardProps> = ({
  title,
  subtitle,
  clients,
  maxVisible = 4.5,
  className = '',
}) => {
  const [selectedSegment, setSelectedSegment] = useState<SegmentId>('all');

  // Filter clients based on selected segment
  const filteredClients = useMemo(() => {
    if (selectedSegment === 'all') return clients;
    return clients.filter(c => c.status === selectedSegment);
  }, [clients, selectedSegment]);

  // Calculate segment counts
  const segmentCounts = useMemo(() => ({
    all: clients.length,
    healthy: clients.filter(c => c.status === 'healthy').length,
    'at-risk': clients.filter(c => c.status === 'at-risk').length,
    new: clients.filter(c => c.status === 'new').length,
    milestone: clients.filter(c => c.status === 'milestone').length,
  }), [clients]);

  return (
    <div
      className={`rounded-2xl xl:rounded-3xl relative flex flex-col overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #fafaf9 100%)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Header Section */}
      <div className="p-6 sm:p-8 xl:p-10 pb-0 sm:pb-0 xl:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-stone-900 text-2xl sm:text-3xl xl:text-4xl font-bold mb-2 tracking-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-stone-500 text-base sm:text-lg xl:text-xl">{subtitle}</p>
            )}
          </div>

          {/* Count indicator */}
          <div className="flex-shrink-0 text-right">
            <div
              className="text-stone-900 text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {filteredClients.length}
            </div>
            <div className="text-stone-500 text-sm font-medium">
              {selectedSegment === 'all' ? 'total' : selectedSegment.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Segment filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SEGMENT_CONFIG.map((segment) => {
            const isSelected = selectedSegment === segment.id;
            const count = segmentCounts[segment.id];
            const colors = SEGMENT_BUTTON_COLORS[segment.color];

            return (
              <button
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected ? colors.selected : colors.unselected
                }`}
              >
                {segment.label}
                <span className={`ml-2 ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client list - limited to maxVisible rows with scroll */}
      <div
        className="overflow-y-auto border-t border-stone-100"
        style={{ maxHeight: `${maxVisible * CLIENT_ROW_HEIGHT}px` }}
      >
        {filteredClients.length === 0 ? (
          <div className="px-6 sm:px-8 xl:px-10 py-16 text-center">
            <p className="text-stone-400 text-lg">
              No {selectedSegment.replace('-', ' ')} clients
            </p>
          </div>
        ) : (
          filteredClients.map((client, index) => {
            const statusColor = STATUS_COLORS[client.status];
            const isLast = index === filteredClients.length - 1;

            return (
              <div
                key={client.id}
                className={`px-6 sm:px-8 xl:px-10 py-5 hover:bg-stone-50 transition-colors ${
                  !isLast ? 'border-b border-stone-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold ${statusColor.bg} ${statusColor.text}`}
                    >
                      {client.initials}
                    </div>
                    {/* Name & status */}
                    <div>
                      <h4
                        className="text-lg font-semibold text-stone-900"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {client.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${statusColor.dot}`}></div>
                        <span className="text-sm text-stone-500 capitalize">
                          {client.status.replace('-', ' ')}
                        </span>
                        {client.milestone && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusColor.bg} ${statusColor.text}`}
                          >
                            → Session {client.milestone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sessions & last seen */}
                  <div className="text-right">
                    <div>
                      <span
                        className="text-xl font-bold text-stone-900"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {client.totalSessions}
                      </span>
                      <span className="text-sm text-stone-500 ml-1.5">sessions</span>
                    </div>
                    <p className="text-sm text-stone-400 mt-1">
                      {client.nextAppointment ? (
                        <span className="text-emerald-600 font-medium">
                          Next: {client.nextAppointment}
                        </span>
                      ) : (
                        formatLastSeen(client.lastSeenDays)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientRosterCard;
