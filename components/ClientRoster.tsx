import React, { useState, useMemo } from 'react';
import { Phone, Calendar, ChevronRight } from 'lucide-react';

// =============================================================================
// CLIENT ROSTER COMPONENT
// =============================================================================
// A client health dashboard showing all clients organized by lifecycle stage.
// Segments: All, Healthy, At-Risk, New Clients, Milestone Approaching, Recently Churned
// Design follows the same patterns as Clinician Overview/Rankings page.
// =============================================================================

// Client lifecycle segment IDs
type ClientSegmentId = 'all' | 'healthy' | 'at-risk' | 'new' | 'milestone' | 'churned';

// Client status for visual indicators
type ClientStatus = 'healthy' | 'at-risk' | 'new' | 'milestone' | 'churned';

// Segment configuration
interface SegmentConfig {
  id: ClientSegmentId;
  label: string;
  description: string;
}

// Client data structure
interface Client {
  id: string;
  name: string;
  initials: string;
  clinician: string;
  clinicianShort: string;
  totalSessions: number;
  lastSeenDays: number;
  nextAppointment: string | null;
  status: ClientStatus;
  milestone?: number; // For milestone segment - which session they're approaching
  churnedDate?: string; // For churned segment
}

const CLIENT_SEGMENTS: SegmentConfig[] = [
  { id: 'all', label: 'All Clients', description: 'Everyone in your practice' },
  { id: 'healthy', label: 'Healthy', description: 'Active with next appointment booked' },
  { id: 'at-risk', label: 'At-Risk', description: 'No upcoming appointment scheduled' },
  { id: 'new', label: 'New Clients', description: 'First 3 sessions, joined recently' },
  { id: 'milestone', label: 'Milestone Approaching', description: 'Approaching session 3, 5, or 12' },
  { id: 'churned', label: 'Recently Churned', description: 'Left in the last 90 days' },
];

// Status colors for visual indicators
const STATUS_COLORS: Record<ClientStatus, { bg: string; text: string; dot: string }> = {
  'healthy': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'at-risk': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  'new': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'milestone': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'churned': { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
};

// Mock client data
const MOCK_CLIENTS: Client[] = [
  // Healthy clients (128 total, showing representative sample)
  { id: 'h1', name: 'Emma Thompson', initials: 'ET', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 24, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'healthy' },
  { id: 'h2', name: 'Michael Brown', initials: 'MB', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 18, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'healthy' },
  { id: 'h3', name: 'Jessica Davis', initials: 'JD', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 32, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'healthy' },
  { id: 'h4', name: 'David Wilson', initials: 'DW', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 15, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'healthy' },
  { id: 'h5', name: 'Sarah Miller', initials: 'SM', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 28, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'healthy' },
  { id: 'h6', name: 'Christopher Lee', initials: 'CL', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 11, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'healthy' },
  { id: 'h7', name: 'Amanda Garcia', initials: 'AG', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 45, lastSeenDays: 1, nextAppointment: 'Dec 8', status: 'healthy' },
  { id: 'h8', name: 'Daniel Martinez', initials: 'DM', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 22, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'healthy' },
  { id: 'h9', name: 'Jennifer Anderson', initials: 'JA', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 19, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'healthy' },
  { id: 'h10', name: 'Robert Taylor', initials: 'RT', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 37, lastSeenDays: 7, nextAppointment: 'Dec 16', status: 'healthy' },

  // At-risk clients (8)
  { id: 'r1', name: 'Sarah Mitchell', initials: 'SM', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 12, lastSeenDays: 28, nextAppointment: null, status: 'at-risk' },
  { id: 'r2', name: 'James Rodriguez', initials: 'JR', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 8, lastSeenDays: 24, nextAppointment: null, status: 'at-risk' },
  { id: 'r3', name: 'Emily Watson', initials: 'EW', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 15, lastSeenDays: 21, nextAppointment: null, status: 'at-risk' },
  { id: 'r4', name: 'Michael Chen', initials: 'MC', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 6, lastSeenDays: 18, nextAppointment: null, status: 'at-risk' },
  { id: 'r5', name: 'Lisa Thompson', initials: 'LT', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 4, lastSeenDays: 16, nextAppointment: null, status: 'at-risk' },
  { id: 'r6', name: 'David Park', initials: 'DP', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 22, lastSeenDays: 15, nextAppointment: null, status: 'at-risk' },
  { id: 'r7', name: 'Jennifer Lee', initials: 'JL', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 9, lastSeenDays: 12, nextAppointment: null, status: 'at-risk' },
  { id: 'r8', name: 'Robert Garcia', initials: 'RG', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 3, lastSeenDays: 10, nextAppointment: null, status: 'at-risk' },

  // New clients (12) - first 3 sessions
  { id: 'n1', name: 'Amanda Foster', initials: 'AF', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
  { id: 'n2', name: 'Brian Martinez', initials: 'BM', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 1, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'new' },
  { id: 'n3', name: 'Christina Liu', initials: 'CL', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 2, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'new' },
  { id: 'n4', name: 'Daniel Williams', initials: 'DW', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 1, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'new' },
  { id: 'n5', name: 'Elena Petrova', initials: 'EP', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 3, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'new' },
  { id: 'n6', name: 'Frank Nakamura', initials: 'FN', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'new' },
  { id: 'n7', name: 'Grace O\'Brien', initials: 'GO', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 1, lastSeenDays: 1, nextAppointment: 'Dec 8', status: 'new' },
  { id: 'n8', name: 'Henry Kim', initials: 'HK', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
  { id: 'n9', name: 'Isabella Santos', initials: 'IS', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 1, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'new' },
  { id: 'n10', name: 'Jack Thompson', initials: 'JT', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 3, lastSeenDays: 7, nextAppointment: 'Dec 15', status: 'new' },
  { id: 'n11', name: 'Karen White', initials: 'KW', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'new' },
  { id: 'n12', name: 'Leo Hernandez', initials: 'LH', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 1, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'new' },

  // Milestone approaching (5) - about to hit session 3, 5, or 12
  { id: 'm1', name: 'Nicole Adams', initials: 'NA', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'milestone', milestone: 3 },
  { id: 'm2', name: 'Oliver Scott', initials: 'OS', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 4, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'milestone', milestone: 5 },
  { id: 'm3', name: 'Patricia Moore', initials: 'PM', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 4, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'milestone', milestone: 5 },
  { id: 'm4', name: 'Quinn Johnson', initials: 'QJ', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 11, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'milestone', milestone: 12 },
  { id: 'm5', name: 'Rachel Green', initials: 'RG', clinician: 'Dr. Michelle Johnson', clinicianShort: 'M. Johnson', totalSessions: 11, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'milestone', milestone: 12 },

  // Recently churned (3) - left in last 90 days
  { id: 'c1', name: 'Steven Clark', initials: 'SC', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 8, lastSeenDays: 45, nextAppointment: null, status: 'churned', churnedDate: 'Oct 25' },
  { id: 'c2', name: 'Tiffany Wright', initials: 'TW', clinician: 'Dr. Aisha Patel', clinicianShort: 'A. Patel', totalSessions: 3, lastSeenDays: 62, nextAppointment: null, status: 'churned', churnedDate: 'Oct 8' },
  { id: 'c3', name: 'Victor Nguyen', initials: 'VN', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 15, lastSeenDays: 78, nextAppointment: null, status: 'churned', churnedDate: 'Sep 22' },
];

export const ClientRoster: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<ClientSegmentId>('at-risk');

  const selectedConfig = CLIENT_SEGMENTS.find(s => s.id === selectedSegment)!;

  // Filter clients based on selected segment
  const filteredClients = useMemo(() => {
    if (selectedSegment === 'all') return MOCK_CLIENTS;
    if (selectedSegment === 'healthy') return MOCK_CLIENTS.filter(c => c.status === 'healthy');
    if (selectedSegment === 'at-risk') return MOCK_CLIENTS.filter(c => c.status === 'at-risk');
    if (selectedSegment === 'new') return MOCK_CLIENTS.filter(c => c.status === 'new');
    if (selectedSegment === 'milestone') return MOCK_CLIENTS.filter(c => c.status === 'milestone');
    if (selectedSegment === 'churned') return MOCK_CLIENTS.filter(c => c.status === 'churned');
    return MOCK_CLIENTS;
  }, [selectedSegment]);

  // Calculate segment counts from actual data
  const segmentCounts: Record<ClientSegmentId, number> = useMemo(() => ({
    'all': MOCK_CLIENTS.length,
    'healthy': MOCK_CLIENTS.filter(c => c.status === 'healthy').length,
    'at-risk': MOCK_CLIENTS.filter(c => c.status === 'at-risk').length,
    'new': MOCK_CLIENTS.filter(c => c.status === 'new').length,
    'milestone': MOCK_CLIENTS.filter(c => c.status === 'milestone').length,
    'churned': MOCK_CLIENTS.filter(c => c.status === 'churned').length,
  }), []);

  // Get action button config based on status
  const getActionConfig = (client: Client) => {
    switch (client.status) {
      case 'at-risk':
        return { label: 'Call', icon: Phone, color: 'bg-rose-500 hover:bg-rose-600' };
      case 'new':
        return { label: 'Check In', icon: Phone, color: 'bg-cyan-500 hover:bg-cyan-600' };
      case 'milestone':
        return { label: 'Review', icon: ChevronRight, color: 'bg-amber-500 hover:bg-amber-600' };
      case 'churned':
        return { label: 'Win Back', icon: Phone, color: 'bg-stone-500 hover:bg-stone-600' };
      default:
        return { label: 'View', icon: ChevronRight, color: 'bg-stone-400 hover:bg-stone-500' };
    }
  };

  // Format last seen
  const formatLastSeen = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="min-h-full">

        {/* =============================================
            HERO SECTION - SEGMENT SELECTOR
            ============================================= */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
          }}
        >
          {/* Glow container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }}
            />

            {/* Warm glow accent */}
            <div
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
            />
          </div>

          <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-amber-500/80 text-sm font-semibold tracking-widest uppercase mb-2">
                  Client Health
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Client Roster
                </h1>
                <p className="text-stone-400 text-base sm:text-lg mt-2">
                  {segmentCounts['at-risk'] + segmentCounts['new'] + segmentCounts['milestone']} clients need attention
                </p>
              </div>

              {/* Summary stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {segmentCounts['all']}
                  </p>
                  <p className="text-stone-500 text-sm">Active Clients</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {Math.round((segmentCounts['healthy'] / segmentCounts['all']) * 100)}%
                  </p>
                  <p className="text-stone-500 text-sm">Healthy</p>
                </div>
              </div>
            </div>

            {/* Segment selector label */}
            <p className="text-stone-500 text-sm font-medium mb-4 uppercase tracking-wider">
              Select client segment to view
            </p>

            {/* Segment selector buttons - 6 items in 2 rows of 3 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CLIENT_SEGMENTS.map((segment) => {
                const isSelected = selectedSegment === segment.id;
                const count = segmentCounts[segment.id];

                return (
                  <button
                    key={segment.id}
                    onClick={() => setSelectedSegment(segment.id)}
                    className={`relative px-6 py-6 rounded-2xl font-semibold transition-all duration-300 text-left min-h-[100px] ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-xl scale-[1.02]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-[1.01]'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 4px 16px -2px rgba(0, 0, 0, 0.2)'
                        : undefined
                    }}
                  >
                    <span className="block text-xl font-bold leading-tight">
                      {segment.label}
                      <span className={`ml-2 ${isSelected ? 'text-amber-600' : 'text-amber-400'}`}>
                        · {count}
                      </span>
                    </span>
                    <span className={`block text-base mt-2 leading-relaxed ${isSelected ? 'text-stone-500' : 'text-white/70'}`}>
                      {segment.description}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute bottom-0 left-6 right-6 h-1.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =============================================
            CLIENT LIST SECTION
            ============================================= */}
        <div className="px-6 sm:px-8 lg:px-12 py-6 lg:py-8">

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-bold text-stone-900"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                {selectedConfig.label}
              </h2>
              <p className="text-stone-500 text-sm">{selectedConfig.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-stone-500 text-sm">
                {filteredClients.length} clients
              </span>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden lg:grid gap-4 py-4 text-sm font-bold text-stone-700 uppercase tracking-wide border-b-2 border-stone-300 mb-3"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 140px' }}
          >
            <div>Client</div>
            <div>Clinician</div>
            <div className="text-right">Sessions Complete</div>
            <div className="text-right">Last Seen</div>
            <div className="text-right">Action</div>
          </div>

          {/* Client rows */}
          <div className="space-y-2">
            {filteredClients.map((client, idx) => {
              const statusColor = STATUS_COLORS[client.status];
              const action = getActionConfig(client);
              const ActionIcon = action.icon;

              return (
                <div
                  key={client.id}
                  className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  style={{ boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)' }}
                >
                  {/* Accent bar */}
                  <div className={`h-0.5 ${statusColor.dot}`} />

                  <div className="px-4 sm:px-6 py-4 lg:py-5">
                    {/* Mobile layout */}
                    <div className="lg:hidden">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}
                          >
                            {client.initials}
                          </div>
                          {/* Name & clinician */}
                          <div className="min-w-0">
                            <h3 className="text-base text-stone-900 font-bold truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                              {client.name}
                            </h3>
                            <p className="text-stone-500 text-xs truncate">{client.clinicianShort}</p>
                          </div>
                        </div>
                        {/* Sessions badge */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-bold text-stone-900">{client.totalSessions}</span>
                          <p className="text-stone-400 text-xs">sessions</p>
                        </div>
                      </div>
                      {/* Mobile: Last seen & action */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
                          <span className="text-sm text-stone-500">
                            {client.nextAppointment ? `Next: ${client.nextAppointment}` : formatLastSeen(client.lastSeenDays)}
                          </span>
                          {client.milestone && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                              → Session {client.milestone}
                            </span>
                          )}
                        </div>
                        <button className={`px-3 py-1.5 rounded-lg text-white text-sm font-semibold flex items-center gap-1.5 transition-colors ${action.color}`}>
                          <ActionIcon size={14} />
                          {action.label}
                        </button>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid gap-4 items-center"
                      style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 140px' }}
                    >
                      {/* Client */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}
                        >
                          {client.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base text-stone-900 font-bold truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {client.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
                            <span className="text-stone-500 text-xs capitalize">{client.status.replace('-', ' ')}</span>
                            {client.milestone && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                → Session {client.milestone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Clinician */}
                      <div className="text-stone-600 text-sm">
                        {client.clinicianShort}
                      </div>

                      {/* Sessions */}
                      <div className="text-right">
                        <span className="text-lg font-bold text-stone-900" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                          {client.totalSessions}
                        </span>
                      </div>

                      {/* Last Seen */}
                      <div className="text-right">
                        {client.nextAppointment ? (
                          <div>
                            <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                              <Calendar size={14} />
                              <span className="text-sm font-semibold">{client.nextAppointment}</span>
                            </div>
                            <p className="text-stone-400 text-xs">next appt</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm text-stone-600">{formatLastSeen(client.lastSeenDays)}</span>
                            {client.churnedDate && (
                              <p className="text-stone-400 text-xs">Left {client.churnedDate}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <button className={`px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 ml-auto transition-colors ${action.color}`}>
                          <ActionIcon size={16} />
                          {action.label}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-6 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>At-Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span>New clients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Milestone approaching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-400" />
              <span>Recently churned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRoster;
