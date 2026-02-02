import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, Users, ChevronRight } from 'lucide-react';
import type { MetricDefinition } from './metricConfig';

// =============================================================================
// PROBLEM CLIENT LIST COMPONENT - Premium Table Design
// =============================================================================

export interface ProblemClient {
  id: string;
  name: string;
  [key: string]: string | number | undefined;
}

export interface ClinicianBreakdown {
  id: string;
  name: string;
  value: number;
  rank: number;
  vsAvg: string;
  color?: string;
}

export interface ProblemClientListProps {
  metric: MetricDefinition;
  clients: ProblemClient[];
  totalCount: number;
  isTeamAverage?: boolean;
  clinicianBreakdown?: ClinicianBreakdown[];
  onClinicianClick?: (clinicianId: string) => void;
}

export const ProblemClientList: React.FC<ProblemClientListProps> = ({
  metric,
  clients,
  totalCount,
  isTeamAverage = false,
  clinicianBreakdown = [],
  onClinicianClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(client => client.name.toLowerCase().includes(query));
  }, [clients, searchQuery]);

  const filteredClinicians = useMemo(() => {
    if (!searchQuery.trim()) return clinicianBreakdown;
    const query = searchQuery.toLowerCase();
    return clinicianBreakdown.filter(c => c.name.toLowerCase().includes(query));
  }, [clinicianBreakdown, searchQuery]);

  const getStatusStyle = (status: string | undefined) => {
    if (!status) return { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' };
    const s = status.toLowerCase();
    if (s.includes('critical') || s.includes('overdue') || s.includes('high'))
      return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
    if (s.includes('risk') || s.includes('warning') || s.includes('medium'))
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    if (s.includes('active') || s.includes('good') || s.includes('low'))
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    return { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' };
  };

  // No problem clients state
  if (metric.noProblemClients) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'linear-gradient(145deg, #f5f5f4 0%, #e7e5e4 100%)',
          }}
        >
          <AlertCircle className="w-7 h-7 text-stone-400" />
        </div>
        <h4
          className="text-lg font-bold text-stone-700 mb-2"
          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
        >
          No breakdown available
        </h4>
        <p className="text-sm text-stone-500 max-w-[240px] leading-relaxed">
          This is a practice-defined setting, not calculated from client data.
        </p>
      </div>
    );
  }

  // Team Average - Clinician Leaderboard
  if (isTeamAverage) {
    return (
      <div className="bg-white">
        {/* Section Header */}
        <div className="px-8 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, #292524 0%, #1c1917 100%)' }}
            >
              <Users size={14} className="text-white" />
            </div>
            <h4
              className="text-sm font-bold text-stone-800 uppercase tracking-wider"
              style={{ letterSpacing: '0.08em' }}
            >
              Team Leaderboard
            </h4>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search clinicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-11 pr-4 py-3 rounded-xl
                bg-stone-50 border-0
                text-sm text-stone-700 placeholder-stone-400
                focus:outline-none focus:ring-2 focus:ring-stone-900/10
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Clinician List */}
        <div className="px-4 pb-28">
          {filteredClinicians.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">No clinicians found</div>
          ) : (
            <div className="space-y-2">
              {filteredClinicians.map((clinician, idx) => (
                <button
                  key={clinician.id}
                  onClick={() => onClinicianClick?.(clinician.id)}
                  className="w-full group"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                  }}
                >
                  <div
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-stone-50"
                    style={{
                      background: clinician.rank === 1
                        ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                        : 'transparent',
                      border: clinician.rank === 1
                        ? '1px solid rgba(245, 158, 11, 0.2)'
                        : '1px solid transparent',
                    }}
                  >
                    {/* Rank */}
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                        ${clinician.rank === 1
                          ? 'bg-amber-500 text-white'
                          : clinician.rank === 2
                            ? 'bg-stone-300 text-stone-700'
                            : clinician.rank === 3
                              ? 'bg-amber-700/20 text-amber-800'
                              : 'bg-stone-100 text-stone-500'
                        }
                      `}
                    >
                      {clinician.rank}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-sm font-semibold text-stone-800 group-hover:text-stone-900">
                        {clinician.name}
                      </span>
                    </div>

                    {/* Value */}
                    <span
                      className="text-base font-bold text-stone-800"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      {metric.format(clinician.value)}
                    </span>

                    {/* vs Avg Badge */}
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded-md
                      ${clinician.vsAvg.startsWith('+')
                        ? metric.higherIsBetter
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                        : metric.higherIsBetter
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }
                    `}>
                      {clinician.vsAvg}
                    </span>

                    {/* Arrow */}
                    <ChevronRight
                      size={16}
                      className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular Client List
  return (
    <div className="bg-white">
      {/* Section Header */}
      <div className="px-8 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <h4
            className="text-sm font-bold text-stone-800 uppercase tracking-wider"
            style={{ letterSpacing: '0.08em' }}
          >
            {metric.problemListTitle}
          </h4>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #292524 0%, #1c1917 100%)',
              color: '#fff',
            }}
          >
            {totalCount}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-11 pr-4 py-3 rounded-xl
              bg-stone-50 border-0
              text-sm text-stone-700 placeholder-stone-400
              focus:outline-none focus:ring-2 focus:ring-stone-900/10
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Table Header */}
      {metric.columns.length > 0 && (
        <div className="px-8 py-2">
          <div
            className="grid gap-4 px-4 py-2 rounded-lg"
            style={{
              gridTemplateColumns: metric.columns.map(col =>
                col.align === 'right' ? 'minmax(50px, auto)' : '1fr'
              ).join(' '),
              background: 'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)',
            }}
          >
            {metric.columns.map((col) => (
              <div
                key={col.key}
                className={`text-[10px] font-bold text-stone-500 uppercase tracking-widest ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ letterSpacing: '0.1em' }}
              >
                {col.header}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Rows */}
      <div className="px-8 pb-28">
        {filteredClients.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-stone-400">
              {clients.length === 0 ? 'No clients to show' : 'No matches found'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredClients.map((client, idx) => (
              <div
                key={client.id}
                className="grid gap-4 px-4 py-3 rounded-xl hover:bg-stone-50/80 transition-colors"
                style={{
                  gridTemplateColumns: metric.columns.map(col =>
                    col.align === 'right' ? 'minmax(50px, auto)' : '1fr'
                  ).join(' '),
                  animationDelay: `${idx * 20}ms`,
                }}
              >
                {metric.columns.map((col) => {
                  const value = client[col.key];
                  const isStatus = col.key === 'status' || col.key === 'urgency' || col.key === 'churnType';
                  const statusStyle = isStatus ? getStatusStyle(value as string) : null;

                  return (
                    <div
                      key={col.key}
                      className={`text-sm ${col.align === 'right' ? 'text-right' : 'text-left'} flex items-center ${col.align === 'right' ? 'justify-end' : ''}`}
                    >
                      {isStatus && statusStyle ? (
                        <span className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${statusStyle.bg} ${statusStyle.text}
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {value}
                        </span>
                      ) : (
                        <span className={`
                          ${col.key === 'name'
                            ? 'font-semibold text-stone-800'
                            : 'text-stone-600 tabular-nums'
                          }
                        `}>
                          {col.format ? col.format(value) : value?.toString() ?? '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemClientList;
