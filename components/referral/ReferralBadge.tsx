import React from 'react';
import { Gift } from 'lucide-react';
import { useReferral } from './ReferralContext';

// =============================================================================
// REFERRAL BADGE COMPONENT
// =============================================================================
// A sophisticated badge for the PageHeader that shows invites remaining
// and reward amount. Clicking opens the referral modal.
// =============================================================================

interface ReferralBadgeProps {
  onClick: () => void;
}

export const ReferralBadge: React.FC<ReferralBadgeProps> = ({ onClick }) => {
  const { invitesRemaining, rewardPerReferral } = useReferral();

  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.25)',
        boxShadow: '0 2px 12px rgba(251, 191, 36, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* Gift icon with container */}
      <div
        className="relative flex items-center justify-center w-10 h-10 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)',
        }}
      >
        <Gift
          size={20}
          className="text-amber-300"
          strokeWidth={2}
        />
      </div>

      {/* Text content */}
      <div className="relative flex flex-col items-start">
        <span
          className="text-amber-200/90 text-[15px] font-semibold tracking-wide leading-none"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          {invitesRemaining} invite{invitesRemaining !== 1 ? 's' : ''} left
        </span>
        <span
          className="text-amber-400/70 text-[12px] font-medium mt-1"
        >
          ${rewardPerReferral} each
        </span>
      </div>

      {/* Animated shine effect */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </button>
  );
};

export default ReferralBadge;
