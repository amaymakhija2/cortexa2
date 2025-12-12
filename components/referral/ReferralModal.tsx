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
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
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
              className="relative w-full max-w-xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1c1917 0%, #292524 100%)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 60%)',
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              {/* Tab Navigation */}
              <div className="relative px-8 pt-8">
                <div
                  className="flex p-1.5 rounded-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                    style={{
                      background: activeTab === 'invite'
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'transparent',
                      color: activeTab === 'invite' ? '#1c1917' : '#a8a29e',
                      boxShadow: activeTab === 'invite' ? '0 4px 20px rgba(251, 191, 36, 0.3)' : 'none',
                    }}
                  >
                    <Send size={18} />
                    Invite
                  </button>
                  <button
                    onClick={() => setActiveTab('earnings')}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                    style={{
                      background: activeTab === 'earnings'
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'transparent',
                      color: activeTab === 'earnings' ? '#1c1917' : '#a8a29e',
                      boxShadow: activeTab === 'earnings' ? '0 4px 20px rgba(251, 191, 36, 0.3)' : 'none',
                    }}
                  >
                    <DollarSign size={18} />
                    Earnings
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="relative px-8 pb-10 pt-8">
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
                      <div className="text-center mb-10">
                        <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase mb-4">
                          Invites Remaining
                        </p>

                        {/* Visual invite indicators */}
                        <div className="flex justify-center gap-3 mb-5">
                          {Array.from({ length: totalInvites }).map((_, i) => (
                            <div
                              key={i}
                              className="w-4 h-14 rounded-full transition-all duration-500"
                              style={{
                                background: i < usedInvites
                                  ? 'rgba(168, 162, 158, 0.2)'
                                  : 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                                boxShadow: i >= usedInvites
                                  ? '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)'
                                  : 'none',
                              }}
                            />
                          ))}
                        </div>

                        <div className="flex items-baseline justify-center gap-3">
                          <span
                            className="text-7xl font-bold text-white"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {invitesRemaining}
                          </span>
                          <span className="text-stone-400 text-xl font-medium">left</span>
                        </div>

                        {/* Big reward callout */}
                        <div
                          className="inline-flex items-center gap-3 mt-5 px-6 py-3 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.25)',
                          }}
                        >
                          <span
                            className="text-4xl font-bold text-amber-400"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            ${rewardPerReferral}
                          </span>
                          <span className="text-amber-300/80 text-lg font-medium">
                            per referral
                          </span>
                        </div>
                      </div>

                      {/* Referral Code */}
                      <div className="mb-8">
                        <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase mb-4 text-center">
                          Your Code
                        </p>
                        <div
                          className="flex items-center justify-between rounded-2xl px-6 py-5"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <span
                            className="text-3xl text-white font-bold tracking-[0.2em]"
                            style={{ fontFamily: "'DM Mono', 'SF Mono', monospace" }}
                          >
                            {referralCode}
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold transition-all duration-200"
                            style={{
                              background: copied
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(255, 255, 255, 0.1)',
                              border: copied
                                ? '1px solid rgba(34, 197, 94, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {copied ? (
                              <Check size={18} className="text-green-400" />
                            ) : (
                              <Copy size={18} className="text-white" />
                            )}
                            <span className={`text-base ${copied ? 'text-green-400' : 'text-white'}`}>
                              {copied ? 'Copied!' : 'Copy'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Primary Action */}
                      <button
                        onClick={handleEmailShare}
                        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                          color: '#1c1917',
                          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.35)',
                        }}
                      >
                        <Mail size={22} />
                        Share via Email
                      </button>

                      {/* Footer note */}
                      <p className="text-center text-stone-500 text-sm mt-6">
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
                      <div className="text-center mb-10">
                        <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase mb-4">
                          Total Earned
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-stone-400 text-3xl font-medium">$</span>
                          <span
                            className="text-7xl font-bold text-white"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {confirmedEarnings}
                          </span>
                        </div>
                        {pendingEarnings > 0 && (
                          <p className="text-amber-400 text-lg font-semibold mt-3">
                            + ${pendingEarnings} pending
                          </p>
                        )}
                      </div>

                      {/* Referral List */}
                      {referrals.length > 0 ? (
                        <div className="mb-8">
                          <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase mb-4">
                            Referrals
                          </p>
                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            {referrals.map((referral, index) => (
                              <div
                                key={referral.id}
                                className="flex items-center justify-between px-5 py-4"
                                style={{
                                  borderTop: index > 0 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{
                                      background: referral.status === 'confirmed'
                                        ? 'rgba(34, 197, 94, 0.2)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                      color: referral.status === 'confirmed' ? '#86efac' : '#e7e5e4',
                                    }}
                                  >
                                    {referral.email.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-stone-200 text-base font-medium truncate max-w-[180px]">
                                    {referral.email}
                                  </span>
                                </div>
                                <span
                                  className="text-base font-bold"
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
                          className="text-center py-10 mb-8 rounded-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <p className="text-stone-300 text-lg font-medium">
                            No referrals yet
                          </p>
                          <p className="text-stone-500 text-base mt-2">
                            Share your code to start earning
                          </p>
                        </div>
                      )}

                      {/* Payout CTA */}
                      {confirmedEarnings >= rewardPerReferral && !isPayoutSetup ? (
                        <button
                          onClick={() => setPayoutSetup(true)}
                          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#86efac',
                          }}
                        >
                          Set Up Payout
                        </button>
                      ) : isPayoutSetup ? (
                        <div
                          className="text-center py-4 rounded-2xl"
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                          }}
                        >
                          <p className="text-green-400 text-base font-semibold">
                            Payout connected
                          </p>
                        </div>
                      ) : (
                        <p className="text-center text-stone-500 text-base">
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
