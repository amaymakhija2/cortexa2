import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// FALLING LINES ANIMATION COMPONENT (Reused from LoginPage)
// ============================================================================

interface Line {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angleRad: number;
  sinAngle: number;
  thickness: number;
  hasGlow: boolean;
}

const FallingLinesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const animationRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const FRAME_INTERVAL = 1000 / 30;
  const MAX_LINES = 150;

  const createLine = useCallback((width: number, height: number, isInitial: boolean = false): Line => {
    const baseAngle = -15 + Math.random() * 30;
    const angleRad = (baseAngle * Math.PI) / 180;
    return {
      x: Math.random() * width * 1.5 - width * 0.25,
      y: isInitial ? Math.random() * height : -Math.random() * height * 0.5,
      length: 20 + Math.random() * 60,
      speed: 0.8 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.5,
      angleRad,
      sinAngle: Math.sin(angleRad) * 0.3,
      thickness: 1 + Math.random() * 2,
      hasGlow: Math.random() > 0.85,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let bgGradient: CanvasGradient | null = null;
    let glowGradient: CanvasGradient | null = null;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      dimensionsRef.current = { width, height };

      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0a0a0a');
      bgGradient.addColorStop(0.5, '#111111');
      bgGradient.addColorStop(1, '#0d0d0d');

      glowGradient = ctx.createRadialGradient(
        width * 0.4, height * 0.5, 0,
        width * 0.4, height * 0.5, width * 0.6
      );
      glowGradient.addColorStop(0, 'rgba(180, 120, 60, 0.03)');
      glowGradient.addColorStop(1, 'transparent');

      const rawLineCount = Math.floor((width * height) / 12000);
      const lineCount = Math.min(rawLineCount, MAX_LINES);
      linesRef.current = Array.from({ length: lineCount }, () =>
        createLine(width, height, true)
      );
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden && !animationRef.current) {
        lastFrameTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = (currentTime: number) => {
      if (!isVisibleRef.current) {
        animationRef.current = undefined;
        return;
      }

      const elapsed = currentTime - lastFrameTimeRef.current;
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = currentTime - (elapsed % FRAME_INTERVAL);

      const { width, height } = dimensionsRef.current;
      const lines = linesRef.current;

      if (bgGradient) {
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
      }

      if (glowGradient) {
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.lineCap = 'round';

      const opacityGroups: { [key: string]: Line[] } = {};
      const glowLines: Line[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        line.y += line.speed * 2;
        line.x += line.sinAngle * line.speed * 2;

        if (line.y > height + line.length) {
          line.x = Math.random() * width * 1.5 - width * 0.25;
          line.y = -line.length;
        }

        if (line.hasGlow) {
          glowLines.push(line);
        } else {
          const key = `${Math.round(line.opacity * 10)}_${Math.round(line.thickness)}`;
          if (!opacityGroups[key]) opacityGroups[key] = [];
          opacityGroups[key].push(line);
        }
      }

      for (const key in opacityGroups) {
        const group = opacityGroups[key];
        if (group.length === 0) continue;

        const firstLine = group[0];
        ctx.strokeStyle = `rgba(255, 255, 255, ${firstLine.opacity})`;
        ctx.lineWidth = firstLine.thickness;
        ctx.beginPath();

        for (let i = 0; i < group.length; i++) {
          const line = group[i];
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(
            line.x + Math.sin(line.angleRad) * line.length,
            line.y + Math.cos(line.angleRad) * line.length
          );
        }
        ctx.stroke();
      }

      for (let i = 0; i < glowLines.length; i++) {
        const line = glowLines[i];
        const endX = line.x + Math.sin(line.angleRad) * line.length;
        const endY = line.y + Math.cos(line.angleRad) * line.length;

        ctx.strokeStyle = `rgba(245, 158, 11, ${line.opacity * 0.3})`;
        ctx.lineWidth = line.thickness + 4;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = `rgba(245, 180, 100, ${line.opacity * 1.3})`;
        ctx.lineWidth = line.thickness;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createLine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0a0a', willChange: 'transform' }}
    />
  );
};

// ============================================================================
// SIGN UP PAGE COMPONENT
// ============================================================================

interface SignUpData {
  name: string;
  email: string;
  practiceName: string;
  phone: string;
  role: string;
}

interface SignUpPageProps {
  onSwitchToLogin?: () => void;
  onSignUpComplete?: (data: SignUpData) => void;
}

interface FormData {
  name: string;
  email: string;
  practiceName: string;
  phone: string;
  title: string;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin, onSignUpComplete }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    practiceName: '',
    phone: '',
    title: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const titleOptions = [
    { value: '', label: 'Select your role (optional)' },
    { value: 'Practice Owner', label: 'Practice Owner' },
    { value: 'Clinical Director', label: 'Clinical Director' },
    { value: 'Practice Manager', label: 'Practice Manager' },
    { value: 'Office Manager', label: 'Office Manager' },
    { value: 'Other', label: 'Other' },
  ];

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Please enter your name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
    if (!formData.practiceName.trim()) return 'Please enter your practice name';
    if (!formData.phone.trim()) return 'Please enter your phone number';
    if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) return 'Please enter a valid phone number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);

    // If callback provided, transition to onboarding
    if (onSignUpComplete) {
      onSignUpComplete({
        name: formData.name,
        email: formData.email,
        practiceName: formData.practiceName,
        phone: formData.phone,
        role: formData.title,
      });
    } else {
      // Fallback to success state if no callback
      setSuccess(true);
    }
  };

  const inputFields = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', type: 'text', required: true, autoComplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'you@yourpractice.com', type: 'email', required: true, autoComplete: 'email' },
    { key: 'practiceName', label: 'Practice Name', placeholder: 'Enter your practice name', type: 'text', required: true, autoComplete: 'organization' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, autoComplete: 'tel' },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Styles */}
      <style>{`
        .font-display {
          font-family: 'DM Serif Display', Georgia, serif;
        }

        .input-glow:focus {
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3),
                      0 0 20px -5px rgba(245, 158, 11, 0.2);
        }

        .focus-glow {
          box-shadow: 0 0 0px 0px transparent;
          transition: box-shadow 0.3s ease-out;
        }

        .focus-glow:focus {
          box-shadow: 0 0 30px -10px rgba(245, 158, 11, 0.3);
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

        @keyframes checkmark {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }

        .checkmark-animate {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark 0.4s ease-out 0.2s forwards;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
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

      {/* RIGHT SIDE - Sign Up Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 h-full relative flex items-center justify-center bg-stone-900 overflow-hidden">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800/50 to-stone-900" />
        <div
          className="absolute top-0 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(68, 64, 60, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl px-8 md:px-12 py-6"
        >
          <AnimatePresence mode="wait">
            {success ? (
              // Success State
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center float-animation"
                  style={{
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      className="checkmark-animate"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-4xl text-white mb-4"
                >
                  Welcome aboard
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-body text-stone-400 text-lg mb-8"
                >
                  We'll be in touch shortly to set up your account.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 rounded-2xl bg-stone-800/50 border border-stone-700/50 text-left"
                >
                  <p className="font-body text-stone-300 text-sm mb-4">Submitted details:</p>
                  <div className="space-y-2 font-body text-stone-400 text-sm">
                    <p><span className="text-stone-500">Name:</span> {formData.name}</p>
                    <p><span className="text-stone-500">Email:</span> {formData.email}</p>
                    <p><span className="text-stone-500">Phone:</span> {formData.phone}</p>
                    {formData.title && <p><span className="text-stone-500">Role:</span> {formData.title}</p>}
                    {formData.practiceName && <p><span className="text-stone-500">Practice:</span> {formData.practiceName}</p>}
                  </div>
                </motion.div>

                {onSwitchToLogin && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={onSwitchToLogin}
                    className="mt-8 font-body text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Back to sign in
                  </motion.button>
                )}
              </motion.div>
            ) : (
              // Form State
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-6"
                >
                  <h1 className="font-display text-4xl md:text-5xl text-white mb-2 tracking-tight">
                    Get started
                  </h1>
                  <p className="font-body text-stone-400 text-base">
                    Join practices using Cortexa for smarter insights
                  </p>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-6 overflow-hidden"
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {inputFields.map((field, index) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.06, duration: 0.5 }}
                    >
                      <label className="font-body text-sm font-medium text-stone-300 block mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative group">
                        <input
                          type={field.type}
                          value={formData[field.key as keyof FormData]}
                          onChange={handleChange(field.key as keyof FormData)}
                          onFocus={() => setFocusedField(field.key)}
                          onBlur={() => setFocusedField(null)}
                          className={`
                            font-body w-full px-4 py-3
                            bg-stone-800/80
                            border-2 rounded-xl text-white text-base
                            placeholder-stone-500
                            transition-all duration-300 ease-out
                            outline-none input-glow focus-glow
                            ${focusedField === field.key
                              ? 'border-amber-500/50 bg-stone-800/90'
                              : 'border-stone-700/50 hover:border-stone-600/50'}
                          `}
                          placeholder={field.placeholder}
                          required={field.required}
                          autoComplete={field.autoComplete}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Role Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + inputFields.length * 0.06, duration: 0.5 }}
                  >
                    <label className="font-body text-sm font-medium text-stone-300 block mb-1.5">
                      Your Role (Optional)
                    </label>
                    <div className="relative group">
                      <select
                        value={formData.title}
                        onChange={handleChange('title')}
                        onFocus={() => setFocusedField('title')}
                        onBlur={() => setFocusedField(null)}
                        className={`
                          font-body w-full px-4 py-3
                          bg-stone-800/80
                          border-2 rounded-xl text-white text-base
                          transition-all duration-300 ease-out
                          outline-none input-glow focus-glow
                          appearance-none cursor-pointer
                          ${!formData.title ? 'text-stone-500' : 'text-white'}
                          ${focusedField === 'title'
                            ? 'border-amber-500/50 bg-stone-800/90'
                            : 'border-stone-700/50 hover:border-stone-600/50'}
                        `}
                      >
                        {titleOptions.map(option => (
                          <option key={option.value} value={option.value} className="bg-stone-800 text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {/* Dropdown arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="pt-2"
                  >
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        font-body relative w-full py-3.5 px-8
                        bg-white text-stone-900
                        text-base font-semibold
                        rounded-xl
                        transition-all duration-300
                        overflow-hidden
                        disabled:opacity-60 disabled:cursor-not-allowed
                        hover:shadow-lg hover:shadow-white/10
                        ${!isLoading && 'btn-shine'}
                      `}
                    >
                      <span className={`flex items-center justify-center gap-3 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        Create Account
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Footer - Switch to Login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.6 }}
                  className="mt-6 text-center"
                >
                  <p className="font-body text-stone-500 text-sm">
                    Already have an account?{' '}
                    {onSwitchToLogin ? (
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
                      >
                        Sign in
                      </button>
                    ) : (
                      <span className="text-amber-500 font-medium">Sign in</span>
                    )}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent origin-left"
          />
        </motion.div>
      </div>
    </div>
  );
};
