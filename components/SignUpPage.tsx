import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FallingLinesCanvas } from './FallingLinesCanvas';

// ============================================================================
// TYPES
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

// ============================================================================
// PROGRESS INDICATOR - Shows "Get Started" as step 0 before onboarding steps
// ============================================================================

const ProgressIndicator: React.FC = () => {
  const steps = [
    { num: 0, label: 'Start' },
    { num: 1, label: 'EHR' },
    { num: 2, label: 'Legal' },
    { num: 3, label: 'Connect' },
    { num: 4, label: 'Done' },
  ];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-medium
              transition-all duration-300
              ${step.num === 0
                ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500'
                : 'bg-stone-800 text-stone-500 border border-stone-700'}
            `}
          >
            {step.num === 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              step.num
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="w-6 h-0.5 rounded-full bg-stone-700 transition-colors duration-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ============================================================================
// SIGN UP PAGE COMPONENT
// ============================================================================

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
        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }

        .input-glow:focus {
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3),
                      0 0 20px -5px rgba(245, 158, 11, 0.2);
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
      `}</style>

      {/* LEFT SIDE - Falling Lines Animation (50% width) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
      >
        <FallingLinesCanvas />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        {/* Step indicator on left panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-12 left-12 z-10"
        >
          <p className="font-body text-white/40 text-lg tracking-widest uppercase">
            Get Started
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - Sign Up Form (50% width) */}
      <div className="w-full lg:w-1/2 h-full relative flex flex-col bg-stone-900 overflow-hidden">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800/50 to-stone-900" />
        <div className="absolute top-0 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)' }} />

        {/* Header with Progress Indicator */}
        <header className="relative z-10 px-10 py-6 flex items-center justify-between border-b border-stone-800/50">
          <h1 className="font-display text-3xl text-white">Cortexa</h1>
          <ProgressIndicator />
        </header>

        {/* Content - Scrollable */}
        <main className="relative z-10 flex-1 overflow-y-auto px-10 py-10">
          <div className="w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              {success ? (
                // Success State
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center"
                    style={{
                      border: '3px solid rgba(245, 158, 11, 0.3)',
                      boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <svg className="w-14 h-14 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path className="checkmark-animate" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                    className="font-body text-stone-400 text-xl mb-8"
                  >
                    We'll be in touch shortly to set up your account.
                  </motion.p>

                  {onSwitchToLogin && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={onSwitchToLogin}
                      className="font-body text-lg text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Back to sign in
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                // Form State
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Header */}
                  <div className="mb-10">
                    <h2 className="font-display text-4xl text-white mb-4">Get started</h2>
                    <p className="font-body text-stone-400 text-lg">
                      Tell us about yourself and your practice to begin.
                    </p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 flex items-center gap-3">
                          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-body text-red-400 text-base">{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {inputFields.map((field, index) => (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                      >
                        <label className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium block mb-2">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={formData[field.key as keyof FormData]}
                          onChange={handleChange(field.key as keyof FormData)}
                          onFocus={() => setFocusedField(field.key)}
                          onBlur={() => setFocusedField(null)}
                          className={`
                            font-body w-full px-4 py-3
                            bg-stone-800 border rounded-xl
                            text-white text-lg
                            placeholder-stone-500
                            transition-all duration-200
                            outline-none input-glow
                            ${focusedField === field.key
                              ? 'border-amber-500/50 bg-stone-800/90'
                              : 'border-stone-700 hover:border-stone-600'}
                          `}
                          placeholder={field.placeholder}
                          required={field.required}
                          autoComplete={field.autoComplete}
                        />
                      </motion.div>
                    ))}

                    {/* Role Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + inputFields.length * 0.05, duration: 0.4 }}
                    >
                      <label className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium block mb-2">
                        Your Role (Optional)
                      </label>
                      <div className="relative">
                        <select
                          value={formData.title}
                          onChange={handleChange('title')}
                          onFocus={() => setFocusedField('title')}
                          onBlur={() => setFocusedField(null)}
                          className={`
                            font-body w-full px-4 py-3
                            bg-stone-800 border rounded-xl
                            text-lg
                            transition-all duration-200
                            outline-none input-glow
                            appearance-none cursor-pointer
                            ${!formData.title ? 'text-stone-500' : 'text-white'}
                            ${focusedField === 'title'
                              ? 'border-amber-500/50 bg-stone-800/90'
                              : 'border-stone-700 hover:border-stone-600'}
                          `}
                        >
                          {titleOptions.map(option => (
                            <option key={option.value} value={option.value} className="bg-stone-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
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
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="pt-6"
                    >
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`
                          font-body relative w-full py-4
                          bg-white text-stone-900
                          text-lg font-semibold
                          rounded-2xl
                          transition-all duration-300
                          disabled:opacity-60 disabled:cursor-not-allowed
                          hover:shadow-lg hover:shadow-white/10
                        `}
                      >
                        <span className={`flex items-center justify-center gap-3 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                          Continue
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>

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
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-8 text-center"
                  >
                    <p className="font-body text-stone-500 text-base">
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
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 px-10 py-5 text-center border-t border-stone-800/50">
          <p className="font-body text-stone-500 text-base">
            Questions? support@usecortexa.com
          </p>
        </footer>
      </div>
    </div>
  );
};
