import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLINICIANS } from '../data/clinicians';

// =============================================================================
// SESSION HISTORY PAGE
// =============================================================================
// Full-page view showing a client × month session matrix for a clinician.
// Displays every client on the y-axis and months on the x-axis, with
// session counts in each cell.
// =============================================================================

// Generate mock client names
const CLIENT_FIRST_NAMES = [
  'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery',
  'Ella', 'Scarlett', 'Grace', 'Victoria', 'Riley', 'Aria', 'Lily', 'Aurora',
  'Zoey', 'Nora', 'Camila', 'Hannah', 'Lillian', 'Addison', 'Eleanor',
  'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas',
  'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob',
  'Logan', 'Jackson', 'Sebastian', 'Jack', 'Aiden', 'Owen', 'Samuel', 'Ryan',
  'Nathan', 'Wyatt', 'Matthew', 'Luke', 'Dylan', 'Caleb', 'Isaac',
];

const CLIENT_LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Generate a deterministic client list for a clinician
function generateClientsForClinician(clinicianId: string, count: number): { id: string; name: string; startMonth: number }[] {
  const seed = parseInt(clinicianId) * 1000;
  const clients: { id: string; name: string; startMonth: number }[] = [];

  for (let i = 0; i < count; i++) {
    const firstNameIndex = (seed + i * 7) % CLIENT_FIRST_NAMES.length;
    const lastInitialIndex = (seed + i * 13) % CLIENT_LAST_INITIALS.length;
    // Start month: 0 = earliest month, higher = more recent
    // Mix of long-term and newer clients
    const startMonth = (seed + i * 3) % 18; // 0-17 months ago

    clients.push({
      id: `client-${clinicianId}-${i}`,
      name: `${CLIENT_FIRST_NAMES[firstNameIndex]} ${CLIENT_LAST_INITIALS[lastInitialIndex]}.`,
      startMonth,
    });
  }

  // Sort by start month (longest tenure first)
  return clients.sort((a, b) => a.startMonth - b.startMonth);
}

// Generate session counts for a client across months
function generateSessionData(clientId: string, startMonth: number, totalMonths: number): number[] {
  const seed = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sessions: number[] = [];

  for (let month = 0; month < totalMonths; month++) {
    if (month < startMonth) {
      // Client hadn't started yet
      sessions.push(-1); // -1 indicates not yet a client
    } else {
      // Generate realistic session patterns
      const baseFrequency = ((seed + month) % 5) + 1; // 1-5 base
      const variance = ((seed * month) % 3) - 1; // -1 to +1
      const count = Math.max(0, baseFrequency + variance);

      // Occasionally have 0 sessions (vacation, break, etc.)
      if ((seed + month * 7) % 10 === 0) {
        sessions.push(0);
      } else {
        sessions.push(count);
      }
    }
  }

  return sessions;
}

// Generate month labels going back from current month
function generateMonthLabels(count: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push(label);
  }

  return months;
}

// Get cell background color based on session count
function getCellColor(sessions: number): string {
  if (sessions === -1) return 'bg-stone-100'; // Not yet a client
  if (sessions === 0) return 'bg-stone-200'; // No sessions
  if (sessions === 1) return 'bg-amber-100';
  if (sessions === 2) return 'bg-amber-200';
  if (sessions === 3) return 'bg-amber-300';
  if (sessions === 4) return 'bg-emerald-300';
  return 'bg-emerald-400'; // 5+
}

// Get cell text color based on session count
function getCellTextColor(sessions: number): string {
  if (sessions === -1) return 'text-stone-400';
  if (sessions === 0) return 'text-stone-500';
  if (sessions <= 2) return 'text-amber-800';
  return 'text-emerald-900';
}

export const SessionHistoryPage: React.FC = () => {
  const { clinicianId } = useParams<{ clinicianId: string }>();
  const navigate = useNavigate();

  // Find the clinician
  const clinician = CLINICIANS.find(c => c.id === clinicianId);

  // Generate data
  const totalMonths = 18; // 18 months of history
  const monthLabels = useMemo(() => generateMonthLabels(totalMonths), []);

  const clientData = useMemo(() => {
    if (!clinicianId) return [];

    // Different client counts per clinician
    const clientCounts: Record<string, number> = {
      '1': 28, // Sarah Chen - Clinical Director
      '2': 24, // Maria Rodriguez
      '3': 20, // Priya Patel
      '4': 18, // James Kim
      '5': 15, // Michael Johnson
    };

    const count = clientCounts[clinicianId] || 20;
    const clients = generateClientsForClinician(clinicianId, count);

    return clients.map(client => ({
      ...client,
      sessions: generateSessionData(client.id, client.startMonth, totalMonths),
    }));
  }, [clinicianId]);

  if (!clinician) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50 items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 text-lg mb-4">Clinician not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/clinician-overview?tab=details&clinician=${clinicianId}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 transition-all duration-200 font-medium"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Clinician avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: clinician.color }}
              >
                {clinician.initials}
              </div>

              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-stone-900"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Session History
                </h1>
                <p className="text-stone-500 text-sm sm:text-base">
                  {clinician.name} &middot; {clientData.length} clients &middot; {totalMonths} months
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 sm:px-8 lg:px-12 py-4 bg-white border-b border-stone-100">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-stone-500 font-medium">Sessions per month:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-stone-200 flex items-center justify-center text-xs text-stone-500 font-medium">0</div>
              <span className="text-stone-500">None</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs text-amber-800 font-medium">1</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-amber-200 flex items-center justify-center text-xs text-amber-800 font-medium">2</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-amber-300 flex items-center justify-center text-xs text-amber-800 font-medium">3</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-emerald-300 flex items-center justify-center text-xs text-emerald-900 font-medium">4</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-emerald-400 flex items-center justify-center text-xs text-emerald-900 font-medium">5+</div>
            </div>
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-stone-200">
              <div className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-xs text-stone-400 font-medium">—</div>
              <span className="text-stone-500">Not yet a client</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  {/* Sticky client name column header */}
                  <th
                    className="sticky left-0 z-10 bg-stone-50 px-4 py-3 text-left text-sm font-semibold text-stone-700 border-b border-r border-stone-200"
                    style={{ minWidth: '160px' }}
                  >
                    Client
                  </th>
                  {/* Month headers */}
                  {monthLabels.map((month, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-3 text-center text-xs font-semibold text-stone-500 border-b border-stone-200 whitespace-nowrap"
                      style={{ minWidth: '52px' }}
                    >
                      {month}
                    </th>
                  ))}
                  {/* Total column */}
                  <th
                    className="px-3 py-3 text-center text-sm font-semibold text-stone-700 border-b border-l border-stone-200 bg-stone-100"
                    style={{ minWidth: '60px' }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientData.map((client, clientIdx) => {
                  const totalSessions = client.sessions.reduce((sum, s) => sum + (s > 0 ? s : 0), 0);

                  return (
                    <tr
                      key={client.id}
                      className={clientIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}
                    >
                      {/* Sticky client name column */}
                      <td
                        className={`sticky left-0 z-10 px-4 py-2.5 text-sm font-medium text-stone-800 border-r border-stone-200 ${
                          clientIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                        }`}
                      >
                        {client.name}
                      </td>

                      {/* Session cells */}
                      {client.sessions.map((sessions, monthIdx) => (
                        <td
                          key={monthIdx}
                          className="px-1 py-1.5 text-center"
                        >
                          <div
                            className={`
                              w-10 h-8 mx-auto rounded flex items-center justify-center
                              text-sm font-semibold transition-colors
                              ${getCellColor(sessions)}
                              ${getCellTextColor(sessions)}
                            `}
                          >
                            {sessions === -1 ? '—' : sessions}
                          </div>
                        </td>
                      ))}

                      {/* Total column */}
                      <td className="px-3 py-2.5 text-center border-l border-stone-200 bg-stone-100/50">
                        <span className="text-sm font-bold text-stone-800">
                          {totalSessions}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer with monthly totals */}
              <tfoot>
                <tr className="bg-stone-100 border-t-2 border-stone-300">
                  <td className="sticky left-0 z-10 bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 border-r border-stone-200">
                    Monthly Total
                  </td>
                  {monthLabels.map((_, monthIdx) => {
                    const monthTotal = clientData.reduce((sum, client) => {
                      const sessions = client.sessions[monthIdx];
                      return sum + (sessions > 0 ? sessions : 0);
                    }, 0);

                    return (
                      <td key={monthIdx} className="px-2 py-3 text-center">
                        <span className="text-sm font-bold text-stone-700">
                          {monthTotal}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center border-l border-stone-200 bg-stone-200/50">
                    <span className="text-sm font-bold text-stone-800">
                      {clientData.reduce((sum, client) =>
                        sum + client.sessions.reduce((s, sessions) => s + (sessions > 0 ? sessions : 0), 0)
                      , 0)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryPage;
