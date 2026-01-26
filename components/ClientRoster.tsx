import React, { useState, useMemo } from 'react';
import { Calendar, Check } from 'lucide-react';
import { PageHeader } from './design-system';
import { CLINICIANS as MASTER_CLINICIANS } from '../data/clinicians';
import { formatFullName } from '../types/consultations';

// =============================================================================
// CLIENT ROSTER COMPONENT
// =============================================================================
// A client health dashboard showing all clients organized by lifecycle stage.
// Segments: All, Healthy, At-Risk, New Clients, Milestone Approaching, Recently Churned
// Design follows the same patterns as Clinician Overview/Rankings page.
// Uses master clinician list from data/clinicians.ts
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

// Helper to generate healthy clients
const FIRST_NAMES = ['Emma', 'Michael', 'Jessica', 'David', 'Sarah', 'Christopher', 'Amanda', 'Daniel', 'Jennifer', 'Robert', 'Ashley', 'Matthew', 'Emily', 'Andrew', 'Megan', 'Joshua', 'Lauren', 'Brandon', 'Rachel', 'Justin', 'Samantha', 'Ryan', 'Nicole', 'Tyler', 'Stephanie', 'Kevin', 'Heather', 'Jason', 'Michelle', 'Aaron', 'Amber', 'Adam', 'Brittany', 'Nathan', 'Danielle', 'Zachary', 'Rebecca', 'Kyle', 'Laura', 'Jeremy', 'Kayla', 'Eric', 'Christina', 'Brian', 'Melissa', 'Mark', 'Amy', 'Steven', 'Angela', 'Thomas', 'Kimberly', 'Timothy', 'Mary', 'Sean', 'Lisa', 'Patrick', 'Elizabeth', 'Gregory', 'Anna', 'Jonathan', 'Victoria', 'Kenneth', 'Allison', 'Benjamin', 'Julia', 'Scott', 'Katherine', 'Paul', 'Alexandra', 'Peter', 'Catherine', 'Raymond', 'Sophia', 'Douglas', 'Hannah', 'George', 'Natalie', 'Edward', 'Grace', 'Henry', 'Olivia', 'Walter', 'Chloe', 'Arthur', 'Madison', 'Lawrence', 'Abigail', 'Albert', 'Ella', 'Joe', 'Lily', 'Louis', 'Zoe', 'Carl', 'Mia', 'Harry', 'Ava', 'Samuel', 'Charlotte', 'Jack', 'Harper', 'Dennis', 'Aria', 'Jerry', 'Riley', 'Alexander', 'Layla', 'Philip', 'Luna', 'Russell', 'Nora', 'Randy', 'Hazel', 'Howard', 'Violet', 'Eugene', 'Aurora', 'Carlos', 'Savannah', 'Bruce', 'Brooklyn', 'Jordan', 'Leah', 'Wayne', 'Stella', 'Roy', 'Bella', 'Vincent', 'Claire'];
const LAST_NAMES = ['Thompson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Lee', 'Garcia', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Moore', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson', 'Jordan', 'Reynolds', 'Hamilton', 'Graham', 'Kim', 'Gonzalez', 'Alexander', 'Ramos', 'Wallace', 'Griffin', 'West', 'Cole', 'Hayes', 'Chavez', 'Gibson', 'Bryant', 'Ellis', 'Stevens', 'Murray', 'Ford', 'Marshall', 'Owens', 'McDonald', 'Harrison', 'Ruiz', 'Kennedy', 'Wells', 'Alvarez', 'Woods', 'Mendoza', 'Castillo', 'Olson', 'Webb', 'Washington', 'Tucker', 'Freeman', 'Burns', 'Henry', 'Vasquez'];
// Map master clinicians to display format for this component
const CLINICIANS = MASTER_CLINICIANS.map(c => ({
  full: `Dr. ${c.name}`,
  short: `${c.name.split(' ')[0][0]}. ${c.lastName}`,
}));
const APPOINTMENTS = ['Dec 8', 'Dec 9', 'Dec 10', 'Dec 11', 'Dec 12', 'Dec 13', 'Dec 14', 'Dec 15', 'Dec 16', 'Dec 17', 'Dec 18', 'Dec 19', 'Dec 20'];

// Generate 128 healthy clients
const generateHealthyClients = (): Client[] => {
  const clients: Client[] = [];
  for (let i = 0; i < 128; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const clinician = CLINICIANS[i % CLINICIANS.length];
    clients.push({
      id: `h${i + 1}`,
      name: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`,
      clinician: clinician.full,
      clinicianShort: clinician.short,
      totalSessions: 8 + (i % 40), // 8-47 sessions
      lastSeenDays: 1 + (i % 7), // 1-7 days ago
      nextAppointment: APPOINTMENTS[i % APPOINTMENTS.length],
      status: 'healthy' as const,
    });
  }
  return clients;
};

// Mock client data
const MOCK_CLIENTS: Client[] = [
  // Healthy clients (128 total)
  ...generateHealthyClients(),

  // At-risk clients (8)
  { id: 'r1', name: 'Sarah Mitchell', initials: 'SM', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 12, lastSeenDays: 28, nextAppointment: null, status: 'at-risk' },
  { id: 'r2', name: 'James Rodriguez', initials: 'JR', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 8, lastSeenDays: 24, nextAppointment: null, status: 'at-risk' },
  { id: 'r3', name: 'Emily Watson', initials: 'EW', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 15, lastSeenDays: 21, nextAppointment: null, status: 'at-risk' },
  { id: 'r4', name: 'Michael Chen', initials: 'MC', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 6, lastSeenDays: 18, nextAppointment: null, status: 'at-risk' },
  { id: 'r5', name: 'Lisa Thompson', initials: 'LT', clinician: 'Dr. Michael Johnson', clinicianShort: 'M. Johnson', totalSessions: 4, lastSeenDays: 16, nextAppointment: null, status: 'at-risk' },
  { id: 'r6', name: 'David Park', initials: 'DP', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 22, lastSeenDays: 15, nextAppointment: null, status: 'at-risk' },
  { id: 'r7', name: 'Jennifer Lee', initials: 'JL', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 9, lastSeenDays: 12, nextAppointment: null, status: 'at-risk' },
  { id: 'r8', name: 'Robert Garcia', initials: 'RG', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 3, lastSeenDays: 10, nextAppointment: null, status: 'at-risk' },

  // New clients (12) - first 3 sessions
  { id: 'n1', name: 'Amanda Foster', initials: 'AF', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
  { id: 'n2', name: 'Brian Martinez', initials: 'BM', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 1, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'new' },
  { id: 'n3', name: 'Christina Liu', initials: 'CL', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 2, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'new' },
  { id: 'n4', name: 'Daniel Williams', initials: 'DW', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 1, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'new' },
  { id: 'n5', name: 'Elena Petrova', initials: 'EP', clinician: 'Dr. Michael Johnson', clinicianShort: 'M. Johnson', totalSessions: 3, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'new' },
  { id: 'n6', name: 'Frank Nakamura', initials: 'FN', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'new' },
  { id: 'n7', name: 'Grace O\'Brien', initials: 'GO', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 1, lastSeenDays: 1, nextAppointment: 'Dec 8', status: 'new' },
  { id: 'n8', name: 'Henry Kim', initials: 'HK', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'new' },
  { id: 'n9', name: 'Isabella Santos', initials: 'IS', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 1, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'new' },
  { id: 'n10', name: 'Jack Thompson', initials: 'JT', clinician: 'Dr. Michael Johnson', clinicianShort: 'M. Johnson', totalSessions: 3, lastSeenDays: 7, nextAppointment: 'Dec 15', status: 'new' },
  { id: 'n11', name: 'Karen White', initials: 'KW', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'new' },
  { id: 'n12', name: 'Leo Hernandez', initials: 'LH', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 1, lastSeenDays: 2, nextAppointment: 'Dec 9', status: 'new' },

  // Milestone approaching (5) - about to hit session 3, 5, or 12
  { id: 'm1', name: 'Nicole Adams', initials: 'NA', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 2, lastSeenDays: 5, nextAppointment: 'Dec 12', status: 'milestone', milestone: 3 },
  { id: 'm2', name: 'Oliver Scott', initials: 'OS', clinician: 'Dr. Maria Rodriguez', clinicianShort: 'M. Rodriguez', totalSessions: 4, lastSeenDays: 3, nextAppointment: 'Dec 10', status: 'milestone', milestone: 5 },
  { id: 'm3', name: 'Patricia Moore', initials: 'PM', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 4, lastSeenDays: 6, nextAppointment: 'Dec 13', status: 'milestone', milestone: 5 },
  { id: 'm4', name: 'Quinn Johnson', initials: 'QJ', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 11, lastSeenDays: 4, nextAppointment: 'Dec 11', status: 'milestone', milestone: 12 },
  { id: 'm5', name: 'Rachel Green', initials: 'RG', clinician: 'Dr. Michael Johnson', clinicianShort: 'M. Johnson', totalSessions: 11, lastSeenDays: 7, nextAppointment: 'Dec 14', status: 'milestone', milestone: 12 },

  // Recently churned (3) - left in last 90 days
  { id: 'c1', name: 'Steven Clark', initials: 'SC', clinician: 'Dr. Sarah Chen', clinicianShort: 'S. Chen', totalSessions: 8, lastSeenDays: 45, nextAppointment: null, status: 'churned', churnedDate: 'Oct 25' },
  { id: 'c2', name: 'Tiffany Wright', initials: 'TW', clinician: 'Dr. Priya Patel', clinicianShort: 'P. Patel', totalSessions: 3, lastSeenDays: 62, nextAppointment: null, status: 'churned', churnedDate: 'Oct 8' },
  { id: 'c3', name: 'Victor Nguyen', initials: 'VN', clinician: 'Dr. James Kim', clinicianShort: 'J. Kim', totalSessions: 15, lastSeenDays: 78, nextAppointment: null, status: 'churned', churnedDate: 'Sep 22' },
];

export const ClientRoster: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<ClientSegmentId>('at-risk');

  // Track which clients have been contacted (email sent)
  const [contactedClients, setContactedClients] = useState<Set<string>>(new Set());

  const selectedConfig = CLIENT_SEGMENTS.find(s => s.id === selectedSegment)!;

  // Toggle contacted status for a client
  const toggleContacted = (clientId: string) => {
    setContactedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  // Filter clients based on selected segment (no reordering on contact status change)
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
        <PageHeader
          accent="amber"
          title="Client Roster"
          showGridPattern
          actions={
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                  {segmentCounts['all']}
                </p>
                <p className="text-stone-500 text-sm">Active Clients</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                  {Math.round((segmentCounts['healthy'] / segmentCounts['all']) * 100)}%
                </p>
                <p className="text-stone-500 text-sm">Healthy</p>
              </div>
            </div>
          }
        >
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
        </PageHeader>

        {/* =============================================
            CLIENT LIST SECTION
            ============================================= */}
        <div className="px-6 sm:px-8 lg:px-12 py-6 lg:py-8">

          {/* Column headers */}
          <div className="hidden lg:grid gap-4 py-4 px-8 text-base font-bold text-stone-700 uppercase tracking-wide border-b-2 border-stone-300 mb-3"
            style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 160px' }}
          >
            <div>Client</div>
            <div>Clinician</div>
            <div className="text-right">Sessions</div>
            <div className="text-right">Last Seen</div>
            <div className="text-right">Action</div>
          </div>

          {/* Client rows */}
          <div className="space-y-2">
            {filteredClients.map((client) => {
              const statusColor = STATUS_COLORS[client.status];
              const isContacted = contactedClients.has(client.id);

              return (
                <div
                  key={client.id}
                  className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                  style={{ boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.08)' }}
                >
                  {/* Accent bar */}
                  <div className={`h-1 ${statusColor.dot}`} />

                  <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
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
                            <h3 className="text-base text-stone-900 font-bold truncate" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                              {formatFullName(client.name)}
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
                        <button
                          onClick={() => toggleContacted(client.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                            isContacted
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                          }`}
                        >
                          {isContacted ? (
                            <>
                              <Check size={14} />
                              Done
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid gap-4 items-center"
                      style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 160px' }}
                    >
                      {/* Client */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}
                        >
                          {client.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg text-stone-900 font-bold truncate" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                            {formatFullName(client.name)}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusColor.dot}`} />
                            <span className="text-stone-500 text-sm capitalize">{client.status.replace('-', ' ')}</span>
                            {client.milestone && (
                              <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${statusColor.bg} ${statusColor.text}`}>
                                → Session {client.milestone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Clinician */}
                      <div className="text-stone-900 text-lg font-bold" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                        {client.clinicianShort}
                      </div>

                      {/* Sessions */}
                      <div className="text-right">
                        <span className="text-xl font-bold text-stone-900" style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}>
                          {client.totalSessions}
                        </span>
                      </div>

                      {/* Last Seen */}
                      <div className="text-right">
                        {client.nextAppointment ? (
                          <div>
                            <div className="flex items-center justify-end gap-2 text-emerald-600">
                              <Calendar size={16} />
                              <span className="text-base font-semibold">{client.nextAppointment}</span>
                            </div>
                            <p className="text-stone-400 text-sm mt-0.5">next appt</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-base text-stone-600">{formatLastSeen(client.lastSeenDays)}</span>
                            {client.churnedDate && (
                              <p className="text-stone-400 text-sm mt-0.5">Left {client.churnedDate}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <button
                          onClick={() => toggleContacted(client.id)}
                          className={`px-5 py-2.5 rounded-xl text-base font-semibold flex items-center gap-2 ml-auto transition-all duration-300 ${
                            isContacted
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                          }`}
                        >
                          {isContacted ? (
                            <>
                              <Check size={18} />
                              Done
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-8 text-base text-stone-600">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <span className="font-medium">Healthy</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span className="font-medium">At-Risk</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-500" />
              <span className="font-medium">New clients</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span className="font-medium">Milestone approaching</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-400" />
              <span className="font-medium">Recently churned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRoster;
