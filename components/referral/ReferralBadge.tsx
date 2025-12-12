import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';
import { useReferral } from './ReferralContext';

// =============================================================================
// REFERRAL BADGE COMPONENT
// =============================================================================
// A clean, prominent badge positioned below the page title.
// Shows invites remaining and reward amount with excellent readability.
// =============================================================================

interface ReferralBadgeProps {
  onClick: () => void;
}

export const ReferralBadge: React.FC<ReferralBadgeProps> = ({ onClick }) => {
  const { invitesRemaining, rewardPerReferral } = useReferral();

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 2px 16px rgba(251, 191, 36, 0.08)',
      }}
    >
      {/* Gift icon */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%)',
          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.15)',
        }}
      >
        <Gift size={20} className="text-amber-400" strokeWidth={1.75} />
      </div>

      {/* Main content - horizontal layout */}
      <div className="flex items-center gap-4">
        {/* Invites count */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {invitesRemaining}
          </span>
          <span className="text-stone-400 text-sm font-medium">
            invite{invitesRemaining !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Reward amount */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-xl font-bold text-amber-400"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            ${rewardPerReferral}
          </span>
          <span className="text-stone-500 text-sm font-medium">
            each
          </span>
        </div>
      </div>

      {/* Arrow indicator */}
      <ChevronRight
        size={18}
        className="text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all duration-200 ml-1"
      />
    </button>
  );
};

export default ReferralBadge;
