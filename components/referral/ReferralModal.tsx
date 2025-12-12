import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Mail, DollarSign, Send } from 'lucide-react';
import { useReferral } from './ReferralContext';

// =============================================================================
// REFERRAL MODAL COMPONENT
// =============================================================================
// A sophisticated, minimal two-tab modal for the referral experience.
// Tab 1: Invite - focused on sharing
// Tab 2: Earnings - focused on rewards
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

  const [activeTab, setActiveTab] = useState<'invite' | 'earnings'>('invite');
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('invite');
      setCopied(false);
    }
  }, [isOpen]);

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
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-md overflow-hidden"
              style={{
                background: '#0c0a09',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-400 hover:bg-white/5 transition-all duration-200"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* Tab Navigation */}
              <div className="relative px-6 pt-6">
                <div
                  className="flex p-1 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                    style={{
                      background: activeTab === 'invite'
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                        : 'transparent',
                      color: activeTab === 'invite' ? '#fcd34d' : '#78716c',
                    }}
                  >
                    <Send size={16} />
                    Invite
                  </button>
                  <button
                    onClick={() => setActiveTab('earnings')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                    style={{
                      background: activeTab === 'earnings'
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                        : 'transparent',
                      color: activeTab === 'earnings' ? '#fcd34d' : '#78716c',
                    }}
                  >
                    <DollarSign size={16} />
                    Earnings
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="relative px-6 pb-8 pt-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'invite' ? (
                    <motion.div
                      key="invite"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Invites Remaining - Hero Display */}
                      <div className="text-center mb-8">
                        <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-3">
                          Invites Remaining
                        </p>

                        {/* Visual invite indicators */}
                        <div className="flex justify-center gap-2 mb-4">
                          {Array.from({ length: totalInvites }).map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-10 rounded-full transition-all duration-500"
                              style={{
                                background: i < usedInvites
                                  ? 'rgba(120, 113, 108, 0.2)'
                                  : 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                                boxShadow: i >= usedInvites
                                  ? '0 0 16px rgba(251, 191, 36, 0.5)'
                                  : 'none',
                              }}
                            />
                          ))}
                        </div>

                        <div className="flex items-baseline justify-center gap-2">
                          <span
                            className="text-5xl font-bold text-white"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {invitesRemaining}
                          </span>
                          <span className="text-stone-500 text-lg">left</span>
                        </div>

                        <p className="text-amber-500/80 text-sm font-medium mt-2">
                          ${rewardPerReferral} for each referral
                        </p>
                      </div>

                      {/* Referral Code */}
                      <div className="mb-6">
                        <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-3 text-center">
                          Your Code
                        </p>
                        <div
                          className="flex items-center justify-between rounded-2xl px-5 py-4"
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <span
                            className="text-2xl text-white font-mono tracking-[0.15em]"
                          >
                            {referralCode}
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                            style={{
                              background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            {copied ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-stone-400" />
                            )}
                            <span className={`text-sm font-medium ${copied ? 'text-green-400' : 'text-stone-400'}`}>
                              {copied ? 'Copied' : 'Copy'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Primary Action */}
                      <button
                        onClick={handleEmailShare}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                          color: '#1c1917',
                          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.25)',
                        }}
                      >
                        <Mail size={20} />
                        Share via Email
                      </button>

                      {/* Footer note */}
                      <p className="text-center text-stone-600 text-xs mt-6">
                        Earn ${rewardPerReferral} when they complete their first month
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="earnings"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Earnings Summary */}
                      <div className="text-center mb-8">
                        <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-3">
                          Total Earned
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-stone-500 text-2xl">$</span>
                          <span
                            className="text-5xl font-bold text-white"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {confirmedEarnings}
                          </span>
                        </div>
                        {pendingEarnings > 0 && (
                          <p className="text-amber-500/70 text-sm mt-2">
                            + ${pendingEarnings} pending
                          </p>
                        )}
                      </div>

                      {/* Referral List */}
                      {referrals.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          <p className="text-stone-500 text-xs font-medium tracking-widest uppercase">
                            Referrals
                          </p>
                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                          >
                            {referrals.map((referral, index) => (
                              <div
                                key={referral.id}
                                className="flex items-center justify-between px-4 py-3"
                                style={{
                                  borderTop: index > 0 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                                    style={{
                                      background: referral.status === 'confirmed'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                      color: referral.status === 'confirmed' ? '#86efac' : '#a8a29e',
                                    }}
                                  >
                                    {referral.email.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-stone-300 text-sm truncate max-w-[140px]">
                                    {referral.email}
                                  </span>
                                </div>
                                <span
                                  className="text-sm font-semibold"
                                  style={{
                                    color: referral.status === 'confirmed' ? '#86efac' : '#fcd34d',
                                  }}
                                >
                                  {referral.status === 'confirmed' ? `+$${rewardPerReferral}` : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-center py-8 mb-6 rounded-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <p className="text-stone-500 text-sm">
                            No referrals yet
                          </p>
                          <p className="text-stone-600 text-xs mt-1">
                            Share your code to start earning
                          </p>
                        </div>
                      )}

                      {/* Payout CTA */}
                      {confirmedEarnings >= rewardPerReferral && !isPayoutSetup ? (
                        <button
                          onClick={() => setPayoutSetup(true)}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#86efac',
                          }}
                        >
                          Set Up Payout
                        </button>
                      ) : isPayoutSetup ? (
                        <div
                          className="text-center py-3 rounded-xl"
                          style={{
                            background: 'rgba(34, 197, 94, 0.08)',
                          }}
                        >
                          <p className="text-green-400/80 text-sm">
                            Payout connected
                          </p>
                        </div>
                      ) : (
                        <p className="text-center text-stone-600 text-xs">
                          Earn ${rewardPerReferral} to unlock payouts
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;
