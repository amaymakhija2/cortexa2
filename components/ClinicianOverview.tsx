import React, { useState } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, Award, Target, Activity } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

// Clinician data with comprehensive metrics
const CLINICIANS_DATA = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    shortName: 'Chen',
    role: 'Clinical Director',
    specialty: 'CBT, Trauma-Focused',
    avatar: 'SC',
    status: 'active',
    metrics: {
      activeClients: 34,
      capacity: 38,
      clientUtil: 89,
      sessionUtil: 92,
      openSlots: 6,
      avgSessionsPerClient: 4.2,
      revenue: 33000,
      retention: 94,
      showRate: 96,
      newClients: 8,
      dischargedClients: 3,
      sessionsThisMonth: 142,
      telehealthRatio: 45
    },
    trend: 'up',
    trendValue: 3.2
  },
  {
    id: 2,
    name: 'Dr. Maria Rodriguez',
    shortName: 'Rodriguez',
    role: 'Senior Therapist',
    specialty: 'Family Systems, DBT',
    avatar: 'MR',
    status: 'active',
    metrics: {
      activeClients: 32,
      capacity: 36,
      clientUtil: 89,
      sessionUtil: 89,
      openSlots: 8,
      avgSessionsPerClient: 3.9,
      revenue: 30500,
      retention: 91,
      showRate: 94,
      newClients: 6,
      dischargedClients: 4,
      sessionsThisMonth: 130,
      telehealthRatio: 52
    },
    trend: 'up',
    trendValue: 1.8
  },
  {
    id: 3,
    name: 'Dr. Anil Patel',
    shortName: 'Patel',
    role: 'Therapist',
    specialty: 'Anxiety, Depression',
    avatar: 'AP',
    status: 'active',
    metrics: {
      activeClients: 30,
      capacity: 36,
      clientUtil: 83,
      sessionUtil: 85,
      openSlots: 11,
      avgSessionsPerClient: 3.6,
      revenue: 27000,
      retention: 88,
      showRate: 91,
      newClients: 5,
      dischargedClients: 6,
      sessionsThisMonth: 115,
      telehealthRatio: 60
    },
    trend: 'down',
    trendValue: 2.1
  },
  {
    id: 4,
    name: 'Dr. Jennifer Kim',
    shortName: 'Kim',
    role: 'Therapist',
    specialty: 'Couples, EMDR',
    avatar: 'JK',
    status: 'active',
    metrics: {
      activeClients: 31,
      capacity: 35,
      clientUtil: 89,
      sessionUtil: 88,
      openSlots: 9,
      avgSessionsPerClient: 4.0,
      revenue: 24000,
      retention: 90,
      showRate: 93,
      newClients: 7,
      dischargedClients: 5,
      sessionsThisMonth: 125,
      telehealthRatio: 48
    },
    trend: 'up',
    trendValue: 2.5
  },
  {
    id: 5,
    name: 'Dr. Michael Johnson',
    shortName: 'Johnson',
    role: 'Associate Therapist',
    specialty: 'Adolescents, ADHD',
    avatar: 'MJ',
    status: 'active',
    metrics: {
      activeClients: 29,
      capacity: 35,
      clientUtil: 83,
      sessionUtil: 83,
      openSlots: 12,
      avgSessionsPerClient: 3.4,
      revenue: 23500,
      retention: 86,
      showRate: 89,
      newClients: 4,
      dischargedClients: 7,
      sessionsThisMonth: 108,
      telehealthRatio: 55
    },
    trend: 'down',
    trendValue: 1.5
  }
];

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'clients' | 'utilization' | 'revenue' | 'retention';

export const ClinicianOverview: React.FC = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('utilization');
  const [selectedClinician, setSelectedClinician] = useState<number | null>(null);

  // Sort clinicians based on selected criteria
  const sortedClinicians = [...CLINICIANS_DATA].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'clients':
        return b.metrics.activeClients - a.metrics.activeClients;
      case 'utilization':
        return b.metrics.sessionUtil - a.metrics.sessionUtil;
      case 'revenue':
        return b.metrics.revenue - a.metrics.revenue;
      case 'retention':
        return b.metrics.retention - a.metrics.retention;
      default:
        return 0;
    }
  });

  // Get rank for each clinician
  const getRank = (clinicianId: number) => {
    return sortedClinicians.findIndex(c => c.id === clinicianId) + 1;
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="p-4 sm:p-6 xl:p-8 max-w-[1800px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 xl:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p
                className="text-stone-400 text-sm sm:text-base font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Team Management
              </p>
              <h1
                className="text-stone-900 text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Clinician Overview
              </h1>
              <p className="text-stone-500 text-lg sm:text-xl mt-3 max-w-2xl">
                Individual performance metrics and capacity management for your clinical team
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-sm font-medium">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 transition-all duration-300 cursor-pointer appearance-none pr-10"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378716c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="utilization">Utilization</option>
                  <option value="clients">Active Clients</option>
                  <option value="revenue">Revenue</option>
                  <option value="retention">Retention</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* View Toggle */}
              <div
                className="flex items-center gap-1 p-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    background: viewMode === 'grid'
                      ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                      : 'transparent',
                    boxShadow: viewMode === 'grid'
                      ? '0 4px 12px -2px rgba(30, 27, 75, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : 'none'
                  }}
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-300 ${viewMode === 'grid' ? 'text-indigo-300' : 'text-stone-500'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className={`text-sm font-semibold transition-colors duration-300 ${viewMode === 'grid' ? 'text-white' : 'text-stone-600'}`}>
                    Grid
                  </span>
                  {viewMode === 'grid' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  )}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    background: viewMode === 'list'
                      ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                      : 'transparent',
                    boxShadow: viewMode === 'list'
                      ? '0 4px 12px -2px rgba(30, 27, 75, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : 'none'
                  }}
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-300 ${viewMode === 'list' ? 'text-indigo-300' : 'text-stone-500'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className={`text-sm font-semibold transition-colors duration-300 ${viewMode === 'list' ? 'text-white' : 'text-stone-600'}`}>
                    List
                  </span>
                  {viewMode === 'list' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-8 xl:mb-12">
          {[
            { label: 'Total Clinicians', value: '5', icon: Users, color: 'indigo' },
            { label: 'Avg Utilization', value: '87%', icon: Target, color: 'emerald' },
            { label: 'Monthly Revenue', value: '$138K', icon: DollarSign, color: 'amber' },
            { label: 'Avg Retention', value: '90%', icon: Award, color: 'rose' }
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: '#ffffff',
                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div
                className="h-1"
                style={{
                  background: stat.color === 'indigo'
                    ? 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)'
                    : stat.color === 'emerald'
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)'
                      : stat.color === 'amber'
                        ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)'
                        : 'linear-gradient(90deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)'
                }}
              />
              <div className="p-4 sm:p-5 xl:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: stat.color === 'indigo'
                        ? 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)'
                        : stat.color === 'emerald'
                          ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                          : stat.color === 'amber'
                            ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                            : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
                    }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{
                        color: stat.color === 'indigo' ? '#6366f1'
                          : stat.color === 'emerald' ? '#10b981'
                            : stat.color === 'amber' ? '#f59e0b' : '#f43f5e'
                      }}
                    />
                  </div>
                  <span className="text-stone-500 text-sm font-medium">{stat.label}</span>
                </div>
                <p
                  className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Clinician Cards Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xl:gap-6">
            {sortedClinicians.map((clinician, idx) => {
              const isTop = idx === 0;
              const isBottom = idx === sortedClinicians.length - 1;
              const rank = idx + 1;

              return (
                <div
                  key={clinician.id}
                  className="rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer group"
                  style={{
                    background: '#ffffff',
                    boxShadow: isTop
                      ? '0 20px 40px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                      : isBottom
                        ? '0 20px 40px -12px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)'
                        : '0 8px 32px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={() => setSelectedClinician(selectedClinician === clinician.id ? null : clinician.id)}
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1.5"
                    style={{
                      background: isTop
                        ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)'
                        : isBottom
                          ? 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)'
                          : 'linear-gradient(90deg, #d6d3d1 0%, #e7e5e4 50%, #f5f5f4 100%)'
                    }}
                  />

                  <div className="p-5 sm:p-6 xl:p-8">
                    {/* Header: Rank + Avatar + Name + Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0"
                          style={{
                            background: isTop
                              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                              : isBottom
                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                : 'linear-gradient(135deg, #44403c 0%, #78716c 100%)'
                          }}
                        >
                          {clinician.avatar}
                        </div>
                        <div>
                          <span className="text-stone-300 text-base sm:text-lg font-black tracking-tight">
                            {String(rank).padStart(2, '0')}
                          </span>
                          <h4
                            className="text-stone-800 text-xl sm:text-2xl xl:text-3xl font-bold -mt-1 leading-tight"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.shortName}
                          </h4>
                          <p className="text-stone-500 text-sm mt-0.5">{clinician.role}</p>
                        </div>
                      </div>
                      {isTop && (
                        <span
                          className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          Top
                        </span>
                      )}
                      {isBottom && (
                        <span
                          className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                            color: '#dc2626',
                            border: '1px solid #fecaca'
                          }}
                        >
                          Low
                        </span>
                      )}
                    </div>

                    {/* HERO: Primary Metric Based on Sort */}
                    <div className="mb-6">
                      <p className="text-stone-400 text-sm sm:text-base font-semibold uppercase tracking-widest mb-2">
                        {sortBy === 'utilization' ? 'Session Utilization'
                          : sortBy === 'clients' ? 'Active Clients'
                            : sortBy === 'revenue' ? 'Monthly Revenue'
                              : sortBy === 'retention' ? 'Client Retention'
                                : 'Session Utilization'}
                      </p>
                      <div className="flex items-baseline">
                        <span
                          className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-none"
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            color: isTop ? '#059669' : isBottom ? '#dc2626' : '#292524'
                          }}
                        >
                          {sortBy === 'utilization' ? clinician.metrics.sessionUtil
                            : sortBy === 'clients' ? clinician.metrics.activeClients
                              : sortBy === 'revenue' ? `$${(clinician.metrics.revenue / 1000).toFixed(0)}K`
                                : sortBy === 'retention' ? clinician.metrics.retention
                                  : clinician.metrics.sessionUtil}
                        </span>
                        {(sortBy === 'utilization' || sortBy === 'retention') && (
                          <span
                            className="text-2xl sm:text-3xl xl:text-4xl font-bold ml-1"
                            style={{ color: isTop ? '#10b981' : isBottom ? '#ef4444' : '#a8a29e' }}
                          >
                            %
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {clinician.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                        <span className={`text-sm font-medium ${clinician.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {clinician.trend === 'up' ? '+' : '-'}{clinician.trendValue}% vs last month
                        </span>
                      </div>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)'
                        }}
                      >
                        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Clients</p>
                        <p className="text-stone-800 text-lg sm:text-xl font-bold">
                          {clinician.metrics.activeClients}
                          <span className="text-stone-400 text-sm font-normal">/{clinician.metrics.capacity}</span>
                        </p>
                      </div>
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)'
                        }}
                      >
                        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Show Rate</p>
                        <p className="text-stone-800 text-lg sm:text-xl font-bold">{clinician.metrics.showRate}%</p>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <div className="flex items-center justify-center mt-4 pt-4 border-t border-stone-100 group-hover:border-stone-200 transition-colors">
                      <span className="text-stone-400 text-sm font-medium group-hover:text-stone-600 transition-colors">
                        View Details
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {sortedClinicians.map((clinician, idx) => {
              const isTop = idx === 0;
              const isBottom = idx === sortedClinicians.length - 1;
              const rank = idx + 1;

              return (
                <div
                  key={clinician.id}
                  className="rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.005] cursor-pointer"
                  style={{
                    background: '#ffffff',
                    boxShadow: isTop
                      ? '0 20px 40px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                      : isBottom
                        ? '0 20px 40px -12px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)'
                        : '0 8px 32px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={() => setSelectedClinician(selectedClinician === clinician.id ? null : clinician.id)}
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1"
                    style={{
                      background: isTop
                        ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)'
                        : isBottom
                          ? 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)'
                          : 'linear-gradient(90deg, #d6d3d1 0%, #e7e5e4 50%, #f5f5f4 100%)'
                    }}
                  />

                  <div className="p-4 sm:p-6 xl:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      {/* Left: Avatar + Name */}
                      <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                        <span className="text-stone-300 text-xl sm:text-2xl font-black tracking-tight w-8">
                          {String(rank).padStart(2, '0')}
                        </span>
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0"
                          style={{
                            background: isTop
                              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                              : isBottom
                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                : 'linear-gradient(135deg, #44403c 0%, #78716c 100%)'
                          }}
                        >
                          {clinician.avatar}
                        </div>
                        <div>
                          <h4
                            className="text-stone-800 text-xl sm:text-2xl font-bold"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.shortName}
                          </h4>
                          <p className="text-stone-500 text-sm">{clinician.role}</p>
                        </div>
                        {isTop && (
                          <span
                            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ml-auto lg:ml-0"
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                              color: '#059669',
                              border: '1px solid #a7f3d0'
                            }}
                          >
                            Top
                          </span>
                        )}
                        {isBottom && (
                          <span
                            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ml-auto lg:ml-0"
                            style={{
                              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                              color: '#dc2626',
                              border: '1px solid #fecaca'
                            }}
                          >
                            Low
                          </span>
                        )}
                      </div>

                      {/* Metrics Row */}
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                        <div>
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Utilization</p>
                          <p
                            className="text-2xl sm:text-3xl font-bold"
                            style={{
                              fontFamily: "'DM Serif Display', Georgia, serif",
                              color: isTop ? '#059669' : isBottom ? '#dc2626' : '#292524'
                            }}
                          >
                            {clinician.metrics.sessionUtil}%
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Clients</p>
                          <p className="text-2xl sm:text-3xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.metrics.activeClients}
                            <span className="text-stone-400 text-lg font-normal">/{clinician.metrics.capacity}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Revenue</p>
                          <p className="text-2xl sm:text-3xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            ${(clinician.metrics.revenue / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Retention</p>
                          <p className="text-2xl sm:text-3xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.metrics.retention}%
                          </p>
                        </div>
                        <div className="hidden lg:block">
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Show Rate</p>
                          <p className="text-2xl sm:text-3xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.metrics.showRate}%
                          </p>
                        </div>
                        <div className="hidden lg:block">
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Open Slots</p>
                          <p className="text-2xl sm:text-3xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.metrics.openSlots}
                          </p>
                        </div>
                      </div>

                      {/* Trend + Arrow */}
                      <div className="flex items-center gap-4 lg:w-40 flex-shrink-0 justify-end">
                        <div className="flex items-center gap-2">
                          {clinician.trend === 'up' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                          )}
                          <span className={`text-sm font-semibold ${clinician.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {clinician.trend === 'up' ? '+' : '-'}{clinician.trendValue}%
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-400" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
