import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, DollarSign, Send, ArrowRight } from 'lucide-react';
import { useReferral } from './ReferralContext';

// =============================================================================
// REFERRAL MODAL COMPONENT
// =============================================================================
// A sophisticated, minimal two-tab modal for the referral experience.
// Tab 1: Invite - enter email, send introduction (CC's founder)
// Tab 2: Earnings - track your rewards
// =============================================================================

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const {
    invitesRemaining,
    totalInvites,
    pendingEarnings,
    confirmedEarnings,
    rewardPerReferral,
    isPayoutSetup,
    setPayoutSetup,
    referrals,
    useInvite,
  } = useReferral();

  const [activeTab, setActiveTab] = useState<'invite' | 'earnings'>('invite');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('invite');
      setEmail('');
      setSending(false);
      setJustSent(false);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset justSent after showing success
  useEffect(() => {
    if (justSent) {
      const timer = setTimeout(() => {
        setJustSent(false);
        setEmail('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [justSent]);

  const isValidEmail = email.includes('@') && email.includes('.');
  const canSend = email.trim() && isValidEmail && invitesRemaining > 0 && !sending;

  const handleSendInvite = async () => {
    if (!canSend) return;

    setSending(true);

    // Brief pause for feel
    await new Promise(r => setTimeout(r, 600));

    // Build mailto with CC to founder
    const founderEmail = 'amay@cortexa.com';
    const recipientName = email.split('@')[0]; // Use email prefix as fallback name
    const subject = encodeURIComponent(`You're invited to Cortexa`);
    const body = encodeURIComponent(
      `Hi,\n\n` +
      `I've been using Cortexa to manage my practice and thought you'd find it valuable.\n\n` +
      `I've CC'd Amay (the founder) on this email—he can set up a personalized walkthrough for you if you're interested.\n\n` +
      `Best`
    );

    window.open(`mailto:${email}?cc=${founderEmail}&subject=${subject}&body=${body}`);

    useInvite(email);
    setSending(false);
    setJustSent(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSend) {
      handleSendInvite();
    }
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
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* Tab Navigation */}
              <div className="relative px-8 pt-14">
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
                <div className="grid">
                  {/* Invite Tab */}
                  <div
                    className={`col-start-1 row-start-1 transition-opacity duration-200 ${activeTab === 'invite' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
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
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                        >
                          ${rewardPerReferral}
                        </span>
                        <span className="text-amber-300/80 text-lg font-medium">
                          per referral
                        </span>
                      </div>
                    </div>

                    {/* Email Input + Send */}
                    <div className="mb-6">
                      <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase mb-3 text-center">
                        Send Invite
                      </p>
                      <div
                        className="flex items-center gap-3 rounded-2xl px-5 py-2 transition-all duration-200"
                        style={{
                          background: email ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                          border: `1px solid ${email && isValidEmail ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                        }}
                      >
                        <input
                          ref={inputRef}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter their email address"
                          disabled={invitesRemaining <= 0}
                          className="flex-1 bg-transparent text-white text-lg py-3 placeholder:text-stone-400 focus:outline-none disabled:opacity-50"
                          style={{ fontFamily: "'Suisse Intl', sans-serif" }}
                        />
                        <button
                          onClick={handleSendInvite}
                          disabled={!canSend}
                          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                          style={{
                            background: canSend
                              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                              : 'rgba(255, 255, 255, 0.08)',
                            boxShadow: canSend ? '0 4px 16px rgba(251, 191, 36, 0.4)' : 'none',
                            opacity: canSend ? 1 : 0.5,
                          }}
                        >
                          {sending ? (
                            <motion.div
                              className="w-5 h-5 border-2 border-stone-800/30 border-t-stone-800 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                          ) : justSent ? (
                            <Check size={20} className="text-stone-900" />
                          ) : (
                            <ArrowRight size={20} className={canSend ? 'text-stone-900' : 'text-stone-400'} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Success message or helper text */}
                    <AnimatePresence mode="wait">
                      {justSent ? (
                        <motion.p
                          key="success"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="text-center text-green-400 text-sm font-medium"
                        >
                          Invite sent! We'll let you know when they join.
                        </motion.p>
                      ) : (
                        <motion.p
                          key="helper"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="text-center text-stone-500 text-sm"
                        >
                          Earn ${rewardPerReferral} when they complete their first month
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Earnings Tab */}
                  <div
                    className={`col-start-1 row-start-1 transition-opacity duration-200 flex flex-col ${activeTab === 'earnings' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
                          style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
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
                          Invite someone to start earning
                        </p>
                      </div>
                    )}

                    {/* Spacer to push payout button to bottom */}
                    <div className="flex-grow" />

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
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;
