import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Mail, Gift, Clock, CircleCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useReferral } from './ReferralContext';

// =============================================================================
// REFERRAL MODAL COMPONENT
// =============================================================================
// A sophisticated, exclusive-feeling modal for the referral experience.
// Shows remaining invites prominently, referral code, share options, and earnings.
// =============================================================================

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const {
    invitesRemaining,
    totalInvites,
    referralCode,
    pendingEarnings,
    confirmedEarnings,
    rewardPerReferral,
    isPayoutSetup,
    setPayoutSetup,
    referrals,
  } = useReferral();

  const [copied, setCopied] = useState(false);
  const [showPayoutSetup, setShowPayoutSetup] = useState(false);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
  };

  const handleCopyLink = () => {
    const link = `https://cortexa.com/join?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("You're invited to Cortexa");
    const body = encodeURIComponent(
      `I've been using Cortexa to manage my practice and thought you might find it valuable.\n\n` +
      `Use my invite code: ${referralCode}\n\n` +
      `Or join directly: https://cortexa.com/join?ref=${referralCode}\n\n` +
      `– Sent from Cortexa`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const usedInvites = totalInvites - invitesRemaining;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99998]"
            style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-lg overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1c1917 0%, #0c0a09 100%)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top gradient glow */}
                <div
                  className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 opacity-40"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
                  }}
                />
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              {/* Content */}
              <div className="relative px-8 py-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-semibold tracking-wide uppercase">
                      Exclusive Access
                    </span>
                  </div>
                  <h2
                    className="text-3xl text-white mb-2"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Invite Colleagues
                  </h2>
                  <p className="text-stone-400 text-sm">
                    Share Cortexa with practice owners you trust
                  </p>
                </div>

                {/* Invites Remaining - The Hero Section */}
                <div
                  className="relative rounded-2xl p-6 mb-6 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.15)',
                  }}
                >
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-amber-500/20 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-amber-500/20 rounded-br-2xl" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-500 text-xs font-semibold tracking-wider uppercase mb-2">
                        Invites Remaining
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span
                          className="text-6xl font-bold text-white"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {invitesRemaining}
                        </span>
                        <span className="text-stone-500 text-lg">
                          of {totalInvites}
                        </span>
                      </div>
                    </div>

                    {/* Visual representation of invites */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalInvites }).map((_, i) => (
                        <div
                          key={i}
                          className="relative w-3 h-12 rounded-full overflow-hidden transition-all duration-500"
                          style={{
                            background: i < usedInvites
                              ? 'rgba(120, 113, 108, 0.3)'
                              : 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                            boxShadow: i >= usedInvites
                              ? '0 0 12px rgba(251, 191, 36, 0.4)'
                              : 'none',
                          }}
                        >
                          {i >= usedInvites && (
                            <div
                              className="absolute inset-0 opacity-60"
                              style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reward callout */}
                  <div
                    className="mt-5 pt-5 flex items-center justify-center gap-2"
                    style={{ borderTop: '1px solid rgba(251, 191, 36, 0.1)' }}
                  >
                    <Gift size={16} className="text-amber-500" />
                    <span className="text-amber-400 font-semibold">
                      ${rewardPerReferral}
                    </span>
                    <span className="text-stone-500">
                      for each colleague who subscribes
                    </span>
                  </div>
                </div>

                {/* Referral Code Section */}
                <div className="mb-6">
                  <p className="text-stone-500 text-xs font-semibold tracking-wider uppercase mb-3">
                    Your Invite Code
                  </p>
                  <div
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span
                      className="text-2xl text-white font-mono tracking-[0.2em]"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {referralCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                      style={{
                        background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        border: copied ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="text-stone-400" />
                          <span className="text-stone-300 text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Actions */}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e7e5e4',
                    }}
                  >
                    <Copy size={18} />
                    Copy Link
                  </button>
                  <button
                    onClick={handleEmailShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                      color: '#1c1917',
                      boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    <Mail size={18} />
                    Share via Email
                  </button>
                </div>

                {/* Earnings Section */}
                {(confirmedEarnings > 0 || pendingEarnings > 0) && (
                  <div
                    className="rounded-xl p-5 mb-6"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-stone-500 text-xs font-semibold tracking-wider uppercase">
                        Your Earnings
                      </p>
                      {confirmedEarnings >= rewardPerReferral && !isPayoutSetup && (
                        <button
                          onClick={() => setShowPayoutSetup(true)}
                          className="flex items-center gap-1 text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors"
                        >
                          Set up payout
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-stone-500" />
                          <span className="text-stone-500 text-xs">Pending</span>
                        </div>
                        <span className="text-xl font-bold text-stone-400">
                          ${pendingEarnings}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CircleCheck size={14} className="text-green-500" />
                          <span className="text-stone-500 text-xs">Confirmed</span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          ${confirmedEarnings}
                        </span>
                      </div>
                    </div>

                    {/* Referral list */}
                    {referrals.length > 0 && (
                      <div className="mt-5 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {referrals.map((referral) => (
                          <div
                            key={referral.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  background: referral.status === 'confirmed'
                                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  color: referral.status === 'confirmed' ? '#86efac' : '#a8a29e',
                                }}
                              >
                                {referral.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-stone-300 text-sm font-medium">
                                  {referral.email}
                                </p>
                                <p className="text-stone-600 text-xs">
                                  Invited {referral.invitedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div
                              className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: referral.status === 'confirmed'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : 'rgba(251, 191, 36, 0.1)',
                                color: referral.status === 'confirmed' ? '#86efac' : '#fcd34d',
                              }}
                            >
                              {referral.status === 'confirmed' ? '+$200' : 'Pending'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payout Setup CTA */}
                {confirmedEarnings >= rewardPerReferral && !isPayoutSetup && (
                  <button
                    onClick={() => {
                      // In production, this would redirect to Stripe Connect
                      setPayoutSetup(true);
                    }}
                    className="w-full py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      color: '#86efac',
                    }}
                  >
                    Set Up Payout to Claim ${confirmedEarnings}
                  </button>
                )}

                {/* Footer note */}
                <p className="text-center text-stone-600 text-xs mt-6">
                  Rewards are paid when your referral completes their first month.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;
