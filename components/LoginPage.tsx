import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// FALLING LINES ANIMATION COMPONENT
// ============================================================================

interface Line {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  thickness: number;
  glowIntensity: number;
  delay: number;
}

const FallingLinesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const createLine = useCallback((canvasWidth: number, canvasHeight: number, id: number, isInitial: boolean = false): Line => {
    const baseAngle = -15 + Math.random() * 30; // Slight angle variation
    return {
      id,
      x: Math.random() * canvasWidth * 1.5 - canvasWidth * 0.25,
      // If initial render, spread lines across the screen; otherwise start from top
      y: isInitial ? Math.random() * canvasHeight : -Math.random() * canvasHeight * 0.5,
      length: 20 + Math.random() * 60,
      speed: 2 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.5,
      angle: baseAngle,
      thickness: 1 + Math.random() * 2,
      glowIntensity: Math.random(),
      delay: 0, // No delay - start immediately
    };
  }, []);

  const initLines = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const lineCount = Math.floor((canvas.width * canvas.height) / 8000);
    linesRef.current = Array.from({ length: lineCount }, (_, i) =>
      createLine(canvas.width, canvas.height, i, true) // true = initial render, spread across screen
    );
  }, [createLine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      initLines();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;
      const rect = canvas.getBoundingClientRect();

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#111111');
      gradient.addColorStop(1, '#0d0d0d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Subtle radial glow in center
      const centerGlow = ctx.createRadialGradient(
        rect.width * 0.4, rect.height * 0.5, 0,
        rect.width * 0.4, rect.height * 0.5, rect.width * 0.6
      );
      centerGlow.addColorStop(0, 'rgba(180, 120, 60, 0.03)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, rect.width, rect.height);

      linesRef.current.forEach((line) => {
        if (timestamp < line.delay) return;

        // Update position
        const angleRad = (line.angle * Math.PI) / 180;
        line.y += line.speed;
        line.x += Math.sin(angleRad) * line.speed * 0.3;

        // Subtle mouse influence
        const dx = mouseRef.current.x - line.x;
        const dy = mouseRef.current.y - line.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 200) * 0.5;
        const pushX = influence * (dx > 0 ? -1 : 1) * 2;

        // Pulsing glow effect
        const glowPulse = Math.sin(timestamp / 1000 + line.glowIntensity * 10) * 0.5 + 0.5;
        const hasGlow = line.glowIntensity > 0.7 && glowPulse > 0.8;

        // Draw line
        ctx.save();
        ctx.translate(line.x + pushX, line.y);
        ctx.rotate(angleRad);

        // Glow effect for some lines
        if (hasGlow) {
          ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = `rgba(245, 180, 100, ${line.opacity * 1.5})`;
        } else {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
          ctx.shadowBlur = 3;
          ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`;
        }

        ctx.lineWidth = line.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, line.length);
        ctx.stroke();
        ctx.restore();

        // Reset line when it goes off screen
        if (line.y > rect.height + line.length) {
          Object.assign(line, createLine(rect.width, rect.height, line.id));
          line.y = -line.length;
          line.delay = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initLines, createLine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0a0a' }}
    />
  );
};

// ============================================================================
// MAIN LOGIN PAGE COMPONENT
// ============================================================================

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Fonts - using DM Serif Display + DM Sans to match app */}
      <style>{`
        .font-display {
          font-family: 'DM Serif Display', Georgia, serif;
        }

        .input-glow:focus {
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3),
                      0 0 20px -5px rgba(245, 158, 11, 0.2);
        }

        .btn-shine {
          background-size: 200% auto;
          background-image: linear-gradient(
            135deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
          0%, 100% { background-position: -200% center; }
          50% { background-position: 200% center; }
        }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }
      `}</style>

      {/* LEFT SIDE - Falling Lines Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block lg:w-1/2 xl:w-3/5 relative overflow-hidden"
      >
        <FallingLinesCanvas />

        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        {/* Brand watermark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-12 left-12 z-10"
        >
          <p className="font-body text-white/30 text-sm tracking-widest uppercase">
            Practice Intelligence
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 h-full relative flex items-center justify-center bg-stone-900">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800/50 to-stone-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-700/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl px-8 md:px-16 py-12"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-14"
          >
            <h1 className="font-display text-6xl md:text-7xl text-white mb-4 tracking-tight">
              Cortexa
            </h1>
            <p className="font-body text-stone-400 text-xl">
              Sign in to your account
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-body text-red-400 text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label className="font-body text-lg font-medium text-stone-300 block mb-3">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className={`
                    font-body w-full px-6 py-5
                    bg-stone-800/60 backdrop-blur-sm
                    border-2 rounded-2xl text-white text-lg
                    placeholder-stone-500
                    transition-all duration-300 ease-out
                    outline-none input-glow
                    ${focusedField === 'username'
                      ? 'border-amber-500/50 bg-stone-800/80'
                      : 'border-stone-700/50 hover:border-stone-600/50'}
                  `}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: focusedField === 'username'
                      ? '0 0 30px -10px rgba(245, 158, 11, 0.3)'
                      : '0 0 0px 0px transparent'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="font-body text-lg font-medium text-stone-300 block mb-3">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`
                    font-body w-full px-6 py-5 pr-16
                    bg-stone-800/60 backdrop-blur-sm
                    border-2 rounded-2xl text-white text-lg
                    placeholder-stone-500
                    transition-all duration-300 ease-out
                    outline-none input-glow
                    ${focusedField === 'password'
                      ? 'border-amber-500/50 bg-stone-800/80'
                      : 'border-stone-700/50 hover:border-stone-600/50'}
                  `}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                {/* Password visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{
                    boxShadow: focusedField === 'password'
                      ? '0 0 30px -10px rgba(245, 158, 11, 0.3)'
                      : '0 0 0px 0px transparent'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-6"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  font-body relative w-full py-5 px-8
                  bg-white text-stone-900
                  text-lg font-semibold
                  rounded-2xl
                  transition-all duration-300
                  overflow-hidden
                  disabled:opacity-60 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-white/10
                  ${!isLoading && 'btn-shine'}
                `}
              >
                <span className={`flex items-center justify-center gap-3 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Sign In
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>

                {/* Loading spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-stone-900" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-14 text-center"
          >
            <p className="font-body text-stone-500 text-base">
              Secure access to your practice analytics
            </p>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent origin-left"
          />
        </motion.div>
      </div>
    </div>
  );
};
