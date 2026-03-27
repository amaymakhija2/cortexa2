import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ONBOARDING FLOW - Clean, focused, professional
// ============================================================================

interface OnboardingFlowProps {
  onComplete: () => void;
  onSwitchToLogin?: () => void;
}

type Step = 1 | 2 | 3;

const INK = {
  black: '#1a1815',
  dark: '#2d2a26',
  body: '#3d3a35',
  muted: '#5c5850',
  faded: '#8a8579',
  rule: '#e8e5df',
  cream: '#f7f5f2',
  paper: '#fdfcfa',
  gold: '#c9a227',
  emerald: '#047857',
};

const FONT = {
  serif: "'Tiempos Headline', Georgia, serif",
  sans: "'Suisse Intl', system-ui, sans-serif",
  mono: "'Suisse Intl Mono', 'SF Mono', monospace",
};

const ease = [0.22, 1, 0.36, 1] as const;

const DEMO_EMAIL = 'mindfultherapy@usecortexa.com';
const DEMO_EHR_NAME = 'SimplePractice';
const DEMO_EHR_URL = 'https://secure.simplepractice.com/practice_settings/team_members/new';

// ============================================================================
// STEP 1: Copy Email
// ============================================================================

const StepOne: React.FC<{
  email: string;
  onCopied: () => void;
}> = ({ email, onCopied }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onCopied();
    }, 1000);
  }, [email, onCopied]);

  return (
    <>
      <h1 style={{
        fontFamily: FONT.serif,
        fontSize: 52,
        fontWeight: 400,
        color: INK.black,
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
        marginBottom: 16,
      }}>
        Connect your EHR
      </h1>

      <p style={{
        fontFamily: FONT.sans,
        fontSize: 18,
        color: INK.muted,
        lineHeight: 1.6,
        marginBottom: 48,
      }}>
        We sync through a Practice Biller account. Copy this email to add us as a team member.
      </p>

      {/* Email card */}
      <div style={{
        background: INK.paper,
        border: `1px solid ${INK.rule}`,
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          fontWeight: 600,
          color: INK.faded,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Your biller email
        </div>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          fontWeight: 500,
          color: INK.black,
          letterSpacing: '-0.01em',
        }}>
          {email}
        </div>
      </div>

      <motion.button
        onClick={handleCopy}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: copied ? INK.emerald : INK.black,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontFamily: FONT.sans,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'background 0.2s',
        }}
      >
        {copied ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy email
          </>
        )}
      </motion.button>
    </>
  );
};

// ============================================================================
// STEP 2: Add team member
// ============================================================================

const StepTwo: React.FC<{
  ehrName: string;
  ehrUrl: string;
  email: string;
  onNext: () => void;
}> = ({ ehrName, ehrUrl, email, onNext }) => {
  const handleOpen = async () => {
    await navigator.clipboard.writeText(email);
    window.open(ehrUrl, '_blank');
  };

  return (
    <>
      <h1 style={{
        fontFamily: FONT.serif,
        fontSize: 52,
        fontWeight: 400,
        color: INK.black,
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
        marginBottom: 16,
      }}>
        Add a team member
      </h1>

      <p style={{
        fontFamily: FONT.sans,
        fontSize: 18,
        color: INK.muted,
        lineHeight: 1.6,
        marginBottom: 48,
      }}>
        In {ehrName}, create a new team member using the email you just copied.
      </p>

      {/* Simple instructions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          'Enter any name',
          'Paste the email you copied',
          { text: 'Set role to ', bold: 'Practice Biller' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: INK.cream,
              border: `1.5px solid ${INK.rule}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.mono,
              fontSize: 13,
              fontWeight: 600,
              color: INK.muted,
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{
              fontFamily: FONT.sans,
              fontSize: 16,
              color: INK.body,
            }}>
              {typeof item === 'string' ? item : (
                <>{item.text}<strong style={{ color: INK.black }}>{item.bold}</strong></>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Two prominent CTAs */}
      <div style={{
        display: 'flex',
        gap: 12,
      }}>
        <motion.button
          onClick={handleOpen}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '20px 24px',
            background: INK.black,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontFamily: FONT.sans,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          Open {ehrName}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </motion.button>

        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '20px 24px',
            background: INK.emerald,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontFamily: FONT.sans,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          I've done this
        </motion.button>
      </div>

      {/* Need help */}
      <button
        onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
        style={{
          width: '100%',
          marginTop: 16,
          padding: '16px 24px',
          background: INK.cream,
          color: INK.body,
          border: `1px solid ${INK.rule}`,
          borderRadius: 10,
          fontFamily: FONT.sans,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK.muted} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <path strokeLinecap="round" d="M12 17h.01" />
        </svg>
        Need help?
      </button>
    </>
  );
};

// ============================================================================
// STEP 3: Confirm
// ============================================================================

const StepThree: React.FC<{
  onComplete: () => void;
  onNeedHelp: () => void;
}> = ({ onComplete, onNeedHelp }) => (
  <>
    <h1 style={{
      fontFamily: FONT.serif,
      fontSize: 52,
      fontWeight: 400,
      color: INK.black,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      marginBottom: 16,
    }}>
      All set?
    </h1>

    <p style={{
      fontFamily: FONT.sans,
      fontSize: 18,
      color: INK.muted,
      lineHeight: 1.6,
      marginBottom: 48,
    }}>
      Once you've added the team member, we'll verify the connection and you're ready to go.
    </p>

    <motion.button
      onClick={onComplete}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '20px 24px',
        background: INK.emerald,
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        fontFamily: FONT.sans,
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      I've added the team member
    </motion.button>

    <button
      onClick={onNeedHelp}
      style={{
        width: '100%',
        padding: '18px',
        background: INK.cream,
        border: `1px solid ${INK.rule}`,
        borderRadius: 12,
        fontFamily: FONT.sans,
        fontSize: 15,
        color: INK.body,
        cursor: 'pointer',
      }}
    >
      I need help
    </button>
  </>
);

// ============================================================================
// MAIN
// ============================================================================

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSwitchToLogin }) => {
  const [step, setStep] = useState<Step>(1);
  const [ready, setReady] = useState(false);

  // Always start at step 1 when flow mounts - user needs to copy email fresh
  useEffect(() => {
    setStep(1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      background: INK.paper,
    }}>
      {/* Left: Artwork (desktop only) */}
      <div style={{
        display: 'none',
        width: '50%',
        position: 'relative',
        overflow: 'hidden',
      }} className="artwork-panel">
        <img
          src="/login-artwork.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.1) 100%)',
        }} />
      </div>

      {/* Right: Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header - logo + step indicator */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          style={{
            padding: '28px 40px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/cortexa-mark.png" alt="" style={{ height: 40 }} />
            <span style={{
              fontFamily: FONT.sans,
              fontSize: 20,
              fontWeight: 600,
              color: INK.black,
            }}>
              Cortexa
            </span>
          </div>
          <div style={{
            fontFamily: FONT.sans,
            fontSize: 14,
            fontWeight: 600,
            color: INK.muted,
          }}>
            Step {step} of 3
          </div>
        </motion.header>

        {/* Main content */}
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '16px 40px 40px',
        }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease }}
              >
                {step === 1 && (
                  <StepOne
                    email={DEMO_EMAIL}
                    onCopied={() => setStep(2)}
                  />
                )}
                {step === 2 && (
                  <StepTwo
                    ehrName={DEMO_EHR_NAME}
                    ehrUrl={DEMO_EHR_URL}
                    email={DEMO_EMAIL}
                    onNext={() => setStep(3)}
                  />
                )}
                {step === 3 && (
                  <StepThree
                    onComplete={onComplete}
                    onNeedHelp={() => window.open('https://calendly.com/cortexa', '_blank')}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Sign in link - only on step 1 */}
            {onSwitchToLogin && step === 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: ready ? 1 : 0 }}
                style={{
                  marginTop: 40,
                  fontFamily: FONT.sans,
                  fontSize: 15,
                  color: INK.muted,
                  textAlign: 'center',
                }}
              >
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: INK.gold,
                    cursor: 'pointer',
                  }}
                >
                  Sign in
                </button>
              </motion.p>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .artwork-panel { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;
