import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// LOGIN PAGE - "The Threshold"
// A theatrical entrance into your practice sanctuary
// ============================================================================

interface LoginPageProps {
  onSwitchToSignUp?: () => void;
}

// Premium easing curves from LP
const easeOutQuint = [0.22, 1, 0.36, 1] as const;
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// Staggered entrance timing
const STAGGER = {
  logo: 100,
  headline: 200,
  subtitle: 300,
  username: 400,
  password: 500,
  submit: 600,
  footer: 700,
  imageReveal: 0,
  imagePan: 600,
};

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();

  // Calculate color progress based on keystrokes
  // Full color achieved at 20 characters total
  const TARGET_CHARS = 20;
  const totalChars = username.length + password.length;
  const linearProgress = Math.min(totalChars / TARGET_CHARS, 1);

  // Ease-out curve: faster start, slower finish (feels more responsive)
  // Using cubic ease-out: 1 - (1 - t)^3
  const colorProgress = 1 - Math.pow(1 - linearProgress, 3);

  // Grayscale is inverse of color progress (100% gray at 0, 0% gray at full)
  const grayscaleAmount = 1 - colorProgress;

  // Saturation boost as color comes in (starts at 0, peaks slightly above 1 for vibrancy)
  const saturationAmount = colorProgress * 1.15;

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-50">
      <style>{`
        /* ============================================
           TYPOGRAPHY
           ============================================ */
        .font-display {
          font-family: 'Tiempos Headline', Georgia, serif;
          font-feature-settings: 'liga' 1, 'kern' 1;
        }

        .font-body {
          font-family: 'Suisse Intl', system-ui, sans-serif;
          font-feature-settings: 'liga' 1, 'kern' 1;
        }

        /* ============================================
           THE THRESHOLD - Warm Light Effects
           ============================================ */

        /* Ambient warmth that breathes */
        @keyframes warmth-breathe {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) translateY(0);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05) translateY(-2%);
          }
        }

        .ambient-warmth {
          animation: warmth-breathe 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Focus beam - light responds to user interaction */
        .focus-beam {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .focus-beam.active {
          opacity: 1;
        }

        /* ============================================
           INPUT STYLING - Refined & Warm
           ============================================ */
        .input-refined {
          background: white;
          border: 1.5px solid rgba(168, 162, 158, 0.3);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.02),
            0 0 0 0px rgba(245, 158, 11, 0),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .input-refined:hover {
          border-color: rgba(168, 162, 158, 0.5);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 0 0px rgba(245, 158, 11, 0),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .input-refined:focus {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow:
            0 4px 16px rgba(245, 158, 11, 0.08),
            0 0 0 4px rgba(245, 158, 11, 0.08),
            inset 0 1px 2px rgba(0, 0, 0, 0.01);
        }

        /* ============================================
           CTA BUTTON - Premium Dark Stone
           ============================================ */
        .cta-threshold {
          background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%);
          background-size: 200% 200%;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.1),
            0 8px 24px -4px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 1px 0 rgba(255, 255, 255, 0.05) inset;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }

        .cta-threshold::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.03) 30%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.03) 70%,
            transparent 100%
          );
          transform: skewX(-20deg);
          transition: left 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cta-threshold:hover::before {
          left: 150%;
        }

        .cta-threshold::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0) 20%,
            rgba(251, 191, 36, 0) 80%,
            transparent
          );
          transform: scaleX(0.3);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cta-threshold:hover::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.6) 20%,
            rgba(251, 191, 36, 0.8) 50%,
            rgba(251, 191, 36, 0.6) 80%,
            transparent
          );
          transform: scaleX(1);
          opacity: 1;
        }

        .cta-threshold:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.15),
            0 16px 40px -8px rgba(0, 0, 0, 0.3),
            0 0 50px -15px rgba(251, 191, 36, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 1px 0 rgba(255, 255, 255, 0.08) inset;
        }

        .cta-threshold:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        .cta-threshold:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Arrow spring animation */
        .cta-threshold .arrow-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cta-threshold:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* ============================================
           GRAIN TEXTURE
           ============================================ */
        .grain-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.02;
          pointer-events: none;
        }

        /* ============================================
           IMAGE PANEL ANIMATIONS
           ============================================ */
        @keyframes image-drift {
          0%, 100% {
            transform: scale(1.05) translateX(0) translateY(0);
          }
          50% {
            transform: scale(1.08) translateX(-1%) translateY(-0.5%);
          }
        }

        .image-drift {
          animation: image-drift 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Cinematic vignette */
        .cinematic-vignette {
          background: radial-gradient(
            ellipse 80% 60% at 50% 50%,
            transparent 40%,
            rgba(28, 25, 23, 0.15) 100%
          );
        }

        /* ============================================
           DECORATIVE ELEMENTS
           ============================================ */
        @keyframes line-draw {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Error shake */
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .error-shake {
          animation: error-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>

      {/* ==========================================
          LEFT PANEL - Japanese Maple Artwork
          Grayscale → Color transition on keystrokes
          ========================================== */}
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
        animate={{
          opacity: 1,
          clipPath: 'inset(0 0% 0 0)',
        }}
        transition={{
          duration: 1.2,
          ease: easeOutExpo,
          delay: STAGGER.imageReveal / 1000
        }}
        className="hidden lg:block lg:w-[52%] relative overflow-hidden"
      >
        {/* The artwork image with dynamic color */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: easeOutQuint,
            delay: STAGGER.imagePan / 1000
          }}
          className="absolute inset-0"
          style={{
            filter: `grayscale(${grayscaleAmount}) saturate(${saturationAmount})`,
            transition: 'filter 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <img
            src="/login-artwork.png"
            alt="Japanese maple in misty mountains"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Subtle warm overlay that intensifies with color */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse 80% 60% at 30% 30%,
              rgba(251, 191, 36, ${0.05 * colorProgress}) 0%,
              transparent 60%
            )`,
            transition: 'background 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

        {/* Grain texture */}
        <div className="absolute inset-0 grain-texture" />
      </motion.div>

      {/* ==========================================
          RIGHT PANEL - Login Form
          ========================================== */}
      <div className="w-full lg:w-[48%] h-full relative flex flex-col">
        {/* Background warmth gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 120% 80% at 30% 20%,
                rgba(251, 191, 36, 0.04) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 80% 100% at 100% 100%,
                rgba(168, 162, 158, 0.05) 0%,
                transparent 50%
              ),
              #fafaf9
            `,
          }}
        />

        {/* Focus beam - responds to input focus */}
        <div
          className={`focus-beam ${focusedField ? 'active' : ''}`}
          style={{
            background: `
              radial-gradient(
                ellipse 60% 40% at 50% 60%,
                rgba(251, 191, 36, 0.06) 0%,
                transparent 70%
              )
            `,
          }}
        />

        {/* Grain texture */}
        <div className="absolute inset-0 grain-texture" />

        {/* Top Right Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -8 }}
          transition={{
            duration: 0.6,
            ease: easeOutQuint,
            delay: STAGGER.logo / 1000
          }}
          className="relative z-10 flex items-center justify-start gap-2 px-8 md:px-10 pt-8"
        >
          <img
            src="/cortexa-mark.png"
            alt="Cortexa"
            className="h-11 w-auto object-contain"
            style={{
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.06)) drop-shadow(0 4px 12px rgba(120, 90, 50, 0.08))'
            }}
          />
          <span
            className="font-body text-[1.75rem] font-medium text-stone-900 leading-none mt-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            Cortexa
          </span>
        </motion.div>

        {/* Form container - centered vertically */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 md:px-10">
          <div className="w-full max-w-[400px]">

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
              transition={{
                duration: 0.7,
                ease: easeOutQuint,
                delay: STAGGER.headline / 1000
              }}
              className="mb-2"
            >
              <h1
                className="font-display text-[2rem] leading-[1.15] text-stone-900"
                style={{ letterSpacing: '-0.01em' }}
              >
                Welcome back
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
              transition={{
                duration: 0.6,
                ease: easeOutQuint,
                delay: STAGGER.subtitle / 1000
              }}
              className="font-body text-stone-500 text-[15px] mb-8"
            >
              Sign in to continue to your dashboard
            </motion.p>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl flex items-center gap-3 error-shake"
                    style={{
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-body text-red-600 text-sm font-medium">
                      {error}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
                transition={{
                  duration: 0.6,
                  ease: easeOutQuint,
                  delay: STAGGER.username / 1000
                }}
              >
                <label className="font-body text-sm font-medium text-stone-600 block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="input-refined font-body w-full px-4 py-3.5 rounded-xl text-stone-900 text-[15px] placeholder-stone-400 outline-none"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
                transition={{
                  duration: 0.6,
                  ease: easeOutQuint,
                  delay: STAGGER.password / 1000
                }}
              >
                <label className="font-body text-sm font-medium text-stone-600 block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="input-refined font-body w-full px-4 py-3.5 pr-12 rounded-xl text-stone-900 text-[15px] placeholder-stone-400 outline-none"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors duration-200 rounded-lg hover:bg-stone-100/50"
                  >
                    {showPassword ? (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
                transition={{
                  duration: 0.6,
                  ease: easeOutQuint,
                  delay: STAGGER.submit / 1000
                }}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cta-threshold font-body relative w-full py-4 px-6 text-white text-[15px] font-semibold rounded-xl"
                >
                  <span className={`flex items-center justify-center gap-2.5 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Sign In
                    <svg
                      className="w-[18px] h-[18px] arrow-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{
                duration: 0.6,
                ease: easeOutQuint,
                delay: STAGGER.footer / 1000
              }}
              className="mt-10 text-center"
            >
              {onSwitchToSignUp && (
                <p className="font-body text-stone-500 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-amber-600 hover:text-amber-700 transition-colors font-medium relative group"
                  >
                    Sign up
                    <span
                      className="absolute left-0 right-0 bottom-0 h-px bg-amber-600/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                    />
                  </button>
                </p>
              )}
            </motion.div>

          </div>
        </div>

        {/* Decorative corner accent */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-30"
          style={{
            background: `
              radial-gradient(
                circle at 100% 100%,
                rgba(251, 191, 36, 0.15) 0%,
                transparent 60%
              )
            `,
          }}
        />
      </div>
    </div>
  );
};
