import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CreditCard, AlertTriangle, Sparkles } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, LedgerCard, PrimaryButton } from './shared';

// =============================================================================
// CORTEXA BILLING - The Financial Statement
// =============================================================================
// Refined minimalism. Every element earns its place.
// Like a beautifully typeset invoice — authoritative, clear, trustworthy.
// =============================================================================

type PracticeTier = 'solo' | 'small' | 'large';

const TIER_PRICING = {
  solo: { analytics: 30, full: 30 },
  small: { analytics: 200, full: 250 },
  large: { analytics: 350, full: 500 },
} as const;

function getTier(clinicianCount: number): PracticeTier {
  if (clinicianCount <= 1) return 'solo';
  if (clinicianCount <= 24) return 'small';
  return 'large';
}

function getNextTierPrice(currentTier: PracticeTier, hasConsultations: boolean): number | null {
  if (currentTier === 'small') {
    return hasConsultations ? TIER_PRICING.large.full : TIER_PRICING.large.analytics;
  }
  return null;
}

interface BillingTabProps {
  clinicianCount: number;
  hasConsultations?: boolean;
  nextBillingDate?: string;
  paymentMethod?: { brand: string; last4: string };
}

export const BillingTab: React.FC<BillingTabProps> = ({
  clinicianCount,
  hasConsultations = false,
  nextBillingDate = 'April 12, 2026',
  paymentMethod = { brand: 'Visa', last4: '4242' },
}) => {
  const tier = getTier(clinicianCount);
  const currentPrice = hasConsultations ? TIER_PRICING[tier].full : TIER_PRICING[tier].analytics;
  const planName = hasConsultations ? 'Analytics + Consultations' : 'Analytics';

  // Upsell pricing
  const consultationsAddonPrice = TIER_PRICING[tier].full - TIER_PRICING[tier].analytics;

  // Tier boundary warning (only show if approaching limit)
  const showTierWarning = tier === 'small' && clinicianCount >= 20;
  const nextTierPrice = getNextTierPrice(tier, hasConsultations);

  const handleManageBilling = () => {
    // In production: create Stripe portal session and redirect
    console.log('Opening Stripe Customer Portal...');
  };

  const handleUpgrade = () => {
    // In production: redirect to upgrade flow or Stripe checkout
    console.log('Opening upgrade flow...');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE.out }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: 24,
                fontWeight: 400,
                color: INK.black,
                letterSpacing: '-0.01em',
              }}
            >
              Cortexa Billing
            </h2>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
                marginTop: 4,
              }}
            >
              Your subscription and payment details
            </p>
          </div>

          <PrimaryButton
            onClick={handleManageBilling}
            icon={<ExternalLink size={16} />}
            variant="emerald"
          >
            Manage Billing
          </PrimaryButton>
        </div>
      </motion.div>

      {/* Main Billing Card */}
      <LedgerCard>
        <div className="p-6">
          {/* Ledger table layout */}
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <tbody>
              {/* Plan row */}
              <tr style={{ borderBottom: `1px solid ${INK.rule}` }}>
                <td className="py-3 pr-8" style={{ width: 140 }}>
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      color: INK.faded,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Plan
                  </span>
                </td>
                <td className="py-3">
                  <span
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 17,
                      fontWeight: 400,
                      color: INK.black,
                    }}
                  >
                    {planName}
                  </span>
                </td>
              </tr>

              {/* Price row */}
              <tr style={{ borderBottom: `1px solid ${INK.rule}` }}>
                <td className="py-3 pr-8">
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      color: INK.faded,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Monthly Price
                  </span>
                </td>
                <td className="py-3">
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 22,
                      fontWeight: 700,
                      color: INK.gold,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ${currentPrice}
                  </span>
                </td>
              </tr>

              {/* Next billing row */}
              <tr style={{ borderBottom: `1px solid ${INK.rule}` }}>
                <td className="py-3 pr-8">
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      color: INK.faded,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Next Billing
                  </span>
                </td>
                <td className="py-3">
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 15,
                      fontWeight: 500,
                      color: INK.body,
                    }}
                  >
                    {nextBillingDate}
                  </span>
                </td>
              </tr>

              {/* Payment method row */}
              <tr>
                <td className="py-3 pr-8">
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      color: INK.faded,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Payment
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} color={INK.muted} />
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 15,
                        fontWeight: 500,
                        color: INK.body,
                      }}
                    >
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tier Warning - only shows when approaching limit */}
          {showTierWarning && nextTierPrice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 rounded-lg flex items-start gap-3"
              style={{
                backgroundColor: INK.amberLight,
                border: `1px solid ${INK.amber}20`,
              }}
            >
              <AlertTriangle size={18} color={INK.amber} className="flex-shrink-0 mt-0.5" />
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: INK.body,
                  lineHeight: 1.5,
                }}
              >
                You have{' '}
                <span style={{ fontFamily: FONT.mono, fontWeight: 600, color: INK.amber }}>
                  {clinicianCount} clinicians
                </span>
                . At 25, your plan adjusts to{' '}
                <span style={{ fontFamily: FONT.mono, fontWeight: 600 }}>
                  ${nextTierPrice}/mo
                </span>
                .
              </p>
            </motion.div>
          )}
        </div>
      </LedgerCard>

      {/* Upsell Card - only show if not on full plan */}
      {!hasConsultations && tier !== 'solo' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-6"
        >
          <LedgerCard accent="gold" hover>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  {/* Sparkle accent */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${INK.gold}15 0%, ${INK.gold}08 100%)`,
                      border: `1px solid ${INK.gold}20`,
                    }}
                  >
                    <Sparkles size={18} color={INK.gold} />
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4
                        style={{
                          fontFamily: FONT.serif,
                          fontSize: 18,
                          fontWeight: 400,
                          color: INK.black,
                        }}
                      >
                        Add Consultations
                      </h4>
                      <span
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 14,
                          fontWeight: 600,
                          color: INK.gold,
                        }}
                      >
                        +${consultationsAddonPrice}/mo
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 13,
                        color: INK.muted,
                        marginTop: 4,
                      }}
                    >
                      Track your referral pipeline and measure intake conversion rates
                    </p>
                  </div>
                </div>

                <PrimaryButton onClick={handleUpgrade} variant="gold">
                  Upgrade
                </PrimaryButton>
              </div>
            </div>
          </LedgerCard>
        </motion.div>
      )}

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: INK.ghost,
        }}
      >
        30-day money-back guarantee · Cancel anytime
      </motion.p>
    </motion.div>
  );
};

export default BillingTab;
