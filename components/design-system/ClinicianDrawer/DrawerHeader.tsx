import React from 'react';
import { X, ArrowUpRight, Users } from 'lucide-react';

// =============================================================================
// DRAWER HEADER COMPONENT - Premium Editorial Design
// =============================================================================

export interface DrawerHeaderProps {
  clinicianName: string;
  avatar?: string;
  isTeamAverage?: boolean;
  clinicianCount?: number;
  onViewDetails?: () => void;
  onClose: () => void;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  clinicianName,
  avatar,
  isTeamAverage = false,
  clinicianCount,
  onViewDetails,
  onClose,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: isTeamAverage
            ? 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)'
            : 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
        }}
      />

      {/* Decorative accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%)',
          opacity: 0.6,
        }}
      />

      <div className={`relative px-8 py-7 ${isTeamAverage ? '' : 'text-white'}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            {/* Avatar */}
            {isTeamAverage ? (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{
                  background: 'linear-gradient(145deg, #e7e5e4 0%, #d6d3d1 100%)',
                }}
              >
                <Users className="w-6 h-6 text-stone-600" />
              </div>
            ) : avatar ? (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white flex-shrink-0 shadow-lg"
                style={{
                  background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 8px 24px -4px rgba(245, 158, 11, 0.4)',
                }}
              >
                {avatar}
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              {/* Name */}
              <h2
                className="text-2xl font-bold tracking-tight truncate"
                style={{
                  fontFamily: "'Tiempos Headline', Georgia, serif",
                  color: isTeamAverage ? '#1c1917' : '#ffffff',
                }}
              >
                {clinicianName}
              </h2>

              {/* Subtitle */}
              {isTeamAverage ? (
                <p className="text-sm text-stone-500 mt-1 font-medium">
                  Aggregate of {clinicianCount} clinicians
                </p>
              ) : onViewDetails ? (
                <button
                  onClick={onViewDetails}
                  className="flex items-center gap-2 mt-1.5 text-sm font-medium transition-all duration-200 group"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <span className="group-hover:text-amber-400 transition-colors">
                    View full profile
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </button>
              ) : null}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-200 hover:scale-105 active:scale-95
              ${isTeamAverage
                ? 'bg-stone-200/80 hover:bg-stone-300 text-stone-600'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }
            `}
            title="Close (Esc)"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawerHeader;
