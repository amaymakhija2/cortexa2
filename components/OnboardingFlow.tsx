import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePictureInPicture } from './PiPCopyWidget';

// Premium easing curves matching LoginPage
const easeOutQuint = [0.22, 1, 0.36, 1] as const;
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// ============================================================================
// CONFIGURATION
// ============================================================================
// Toggle this to switch between two onboarding modes:
// - true:  Password collected in Get Started step (shorter flow, skips Create Account)
// - false: Separate Create Account step after Payment (longer flow, Google OAuth option)
const COLLECT_PASSWORD_IN_SIGNUP = false;

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingData {
  name: string;
  email: string;
  practiceName: string;
  phone: string;
  role: string;
  selectedEhr: string | null;
  agreedToTerms: boolean;
  agreedToBaa: boolean;
  generatedEmail: string;
  connectionStatus: 'pending' | 'waiting' | 'connected';
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  name: string;
  email: string;
  practiceName: string;
  phone: string;
  title: string;
  password: string;
  confirmPassword: string;
}

// ============================================================================
// EHR DATA
// ============================================================================

const EHR_OPTIONS = [
  { id: 'simplepractice', name: 'SimplePractice', popular: true },
  { id: 'therapynotes', name: 'TherapyNotes', popular: true },
  { id: 'jane', name: 'Jane App', popular: true },
  { id: 'theranest', name: 'TheraNest', popular: false },
  { id: 'practicefusion', name: 'Practice Fusion', popular: false },
  { id: 'kareo', name: 'Kareo', popular: false },
  { id: 'drchrono', name: 'DrChrono', popular: false },
  { id: 'athenahealth', name: 'athenahealth', popular: false },
];

const EHR_TEAM_MEMBER_URLS: Record<string, string> = {
  simplepractice: 'https://secure.simplepractice.com/practice_settings/team_members/new',
  therapynotes: 'https://www.therapynotes.com/Settings/Staff',
  jane: 'https://jane.app/settings/staff',
  theranest: 'https://app.theranest.com/settings/staff',
  practicefusion: 'https://www.practicefusion.com/settings/users',
  kareo: 'https://app.kareo.com/settings/users',
  drchrono: 'https://app.drchrono.com/settings/staff',
  athenahealth: 'https://athenanet.athenahealth.com/settings/users',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateEmailFromPractice = (practiceName: string): string => {
  const slug = practiceName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 30);
  return `${slug}@usecortexa.com`;
};

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  // Simple dot indicator for compact display
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${currentStep > index
              ? 'bg-amber-500'
              : currentStep === index
                ? 'bg-amber-400 ring-2 ring-amber-200'
                : 'bg-stone-200'}
          `}
        />
      ))}
    </div>
  );
};

// ============================================================================
// STEP 0: GET STARTED (Sign Up Form)
// ============================================================================

const StepGetStarted: React.FC<{
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onContinue: () => void;
  onSwitchToLogin?: () => void;
  collectPassword?: boolean;
  isVisible: boolean;
}> = ({ formData, onFormChange, onContinue, onSwitchToLogin, collectPassword = false, isVisible }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFormChange(field, e.target.value);
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

    if (collectPassword) {
      if (!formData.password) return 'Please create a password';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }

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
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onContinue();
  };

  const inputFields = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', type: 'text', autoComplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'you@yourpractice.com', type: 'email', autoComplete: 'email' },
    { key: 'practiceName', label: 'Practice Name', placeholder: 'Enter your practice name', type: 'text', autoComplete: 'organization' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', autoComplete: 'tel' },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
        transition={{ duration: 0.7, ease: easeOutQuint, delay: 0.1 }}
        className="mb-1"
      >
        <h1 className="font-display text-[1.75rem] leading-[1.15] text-stone-900" style={{ letterSpacing: '-0.01em' }}>
          Get started
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
        transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.2 }}
        className="font-body text-stone-500 text-sm mb-5"
      >
        See what's really happening in your practice
      </motion.p>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-lg flex items-center gap-2 error-shake"
              style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}
            >
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-body text-red-600 text-xs font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputFields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
            transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.25 + index * 0.04 }}
          >
            <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">
              {field.label}
            </label>
            <input
              type={field.type}
              value={formData[field.key as keyof FormData]}
              onChange={handleChange(field.key as keyof FormData)}
              className="input-refined font-body w-full px-3.5 py-3 rounded-xl text-stone-900 text-sm placeholder-stone-400 outline-none"
              placeholder={field.placeholder}
              required
              autoComplete={field.autoComplete}
            />
          </motion.div>
        ))}

        {/* Role Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
          transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.45 }}
        >
          <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">
            Your Role (Optional)
          </label>
          <div className="relative">
            <select
              value={formData.title}
              onChange={handleChange('title')}
              className={`input-refined font-body w-full px-3.5 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer ${!formData.title ? 'text-stone-400' : 'text-stone-900'}`}
            >
              {titleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Password Fields */}
        {collectPassword && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
              transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.5 }}
            >
              <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  className="input-refined font-body w-full px-3.5 py-3 pr-11 rounded-xl text-stone-900 text-sm placeholder-stone-400 outline-none"
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors duration-200 rounded-lg hover:bg-stone-100/50"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
              transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.55 }}
            >
              <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className="input-refined font-body w-full px-3.5 py-3 rounded-xl text-stone-900 text-sm placeholder-stone-400 outline-none"
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
            </motion.div>
          </>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
          transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.55 }}
          className="pt-1"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="cta-threshold font-body relative w-full py-3.5 px-6 text-white text-sm font-semibold rounded-xl"
          >
            <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              Continue
              <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </button>
        </motion.div>
      </form>

      {/* Footer - Switch to Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.6 }}
        className="mt-6 text-center"
      >
        <p className="font-body text-stone-500 text-xs">
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-amber-600 hover:text-amber-700 transition-colors font-medium"
            >
              Sign in
            </button>
          ) : (
            <span className="text-amber-600 font-medium">Sign in</span>
          )}
        </p>
      </motion.div>
    </div>
  );
};

// ============================================================================
// STEP 1: SELECT EHR
// ============================================================================

const StepSelectEhr: React.FC<{
  selectedEhr: string | null;
  onSelect: (ehrId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}> = ({ selectedEhr, onSelect, onContinue, onBack }) => {
  const popularEhrs = EHR_OPTIONS.filter(e => e.popular);
  const otherEhrs = EHR_OPTIONS.filter(e => !e.popular);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          Which EHR do you use?
        </h2>
        <p className="font-body text-stone-500 text-sm">We'll connect to pull your practice data automatically.</p>
        {/* Trust signals */}
        <div className="mt-3 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-body text-xs font-medium text-emerald-700">HIPAA Compliant</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/60">
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-body text-xs font-medium text-stone-600">Read-only</span>
          </div>
        </div>
      </div>

      {/* Popular EHRs */}
      <div className="space-y-2">
        <p className="font-body text-xs text-stone-500 uppercase tracking-wider font-medium">Popular</p>
        <div className="grid grid-cols-1 gap-2">
          {popularEhrs.map((ehr) => (
            <button
              key={ehr.id}
              onClick={() => onSelect(ehr.id)}
              className={`
                p-3 rounded-xl border-[1.5px] text-left transition-all duration-300
                ${selectedEhr === ehr.id
                  ? 'border-amber-400 bg-amber-50/80 shadow-sm shadow-amber-100/50'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'}
              `}
            >
              <span className={`font-body text-sm font-medium ${selectedEhr === ehr.id ? 'text-amber-900' : 'text-stone-700'}`}>
                {ehr.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Other EHRs */}
      <div className="space-y-2">
        <p className="font-body text-xs text-stone-500 uppercase tracking-wider font-medium">Others</p>
        <div className="grid grid-cols-2 gap-2">
          {otherEhrs.map((ehr) => (
            <button
              key={ehr.id}
              onClick={() => onSelect(ehr.id)}
              className={`
                p-2.5 rounded-xl border-[1.5px] text-left transition-all duration-300
                ${selectedEhr === ehr.id
                  ? 'border-amber-400 bg-amber-50/80 shadow-sm shadow-amber-100/50'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'}
              `}
            >
              <span className={`font-body text-xs font-medium ${selectedEhr === ehr.id ? 'text-amber-900' : 'text-stone-600'}`}>
                {ehr.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button className="font-body text-amber-600 hover:text-amber-700 text-xs transition-colors">
        Don't see yours? Let us know →
      </button>

      {/* Continue Button */}
      <div className="pt-1">
        <button
          onClick={onContinue}
          disabled={!selectedEhr}
          className={`cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${!selectedEhr ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ color: 'white' }}
        >
          <span className="flex items-center justify-center gap-2">
            Continue
            <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
};

// ============================================================================
// STEP 2: LEGAL AGREEMENTS
// ============================================================================

const StepLegalAgreements: React.FC<{
  agreedToTerms: boolean;
  agreedToBaa: boolean;
  onToggleTerms: () => void;
  onToggleBaa: () => void;
  onContinue: () => void;
  onBack: () => void;
}> = ({ agreedToTerms, agreedToBaa, onToggleTerms, onToggleBaa, onContinue, onBack }) => {
  const canContinue = agreedToTerms && agreedToBaa;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          Quick legal stuff
        </h2>
        <p className="font-body text-stone-500 text-sm">We take your data security seriously.</p>
      </div>

      <div className="space-y-3">
        {/* Terms */}
        <div
          onClick={onToggleTerms}
          className={`p-3.5 rounded-xl border-[1.5px] cursor-pointer transition-all duration-300 ${
            agreedToTerms
              ? 'border-amber-400 bg-amber-50/80 shadow-sm shadow-amber-100/50'
              : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
              agreedToTerms ? 'border-amber-500 bg-amber-500' : 'border-stone-300 bg-white'
            }`}>
              {agreedToTerms && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`font-body font-semibold text-sm ${agreedToTerms ? 'text-amber-900' : 'text-stone-800'}`}>
                  Terms of Service
                </h3>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="font-body text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  View
                </button>
              </div>
              <p className="font-body text-xs text-stone-500 mt-0.5">Standard platform usage terms</p>
            </div>
          </div>
        </div>

        {/* BAA */}
        <div
          onClick={onToggleBaa}
          className={`p-3.5 rounded-xl border-[1.5px] cursor-pointer transition-all duration-300 ${
            agreedToBaa
              ? 'border-amber-400 bg-amber-50/80 shadow-sm shadow-amber-100/50'
              : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
              agreedToBaa ? 'border-amber-500 bg-amber-500' : 'border-stone-300 bg-white'
            }`}>
              {agreedToBaa && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`font-body font-semibold text-sm ${agreedToBaa ? 'text-amber-900' : 'text-stone-800'}`}>
                  Business Associate Agreement
                </h3>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="font-body text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  View
                </button>
              </div>
              <p className="font-body text-xs text-stone-500 mt-0.5">HIPAA-required for handling your data</p>
            </div>
          </div>
        </div>
      </div>

      <p className="font-body text-xs text-stone-500">
        By checking above, you confirm you have authority to sign on behalf of your practice.
      </p>

      {/* Continue Button */}
      <div className="pt-1">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${!canContinue ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ color: 'white' }}
        >
          <span className="flex items-center justify-center gap-2">
            I Agree & Continue
            <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
};

// ============================================================================
// STEP 3: CONNECT EHR
// ============================================================================

const StepConnectEhr: React.FC<{
  generatedEmail: string;
  selectedEhr: string;
  connectionStatus: 'pending' | 'waiting' | 'connected';
  onStartWaiting: () => void;
  onBack: () => void;
}> = ({ generatedEmail, selectedEhr, connectionStatus, onStartWaiting, onBack }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasVisitedEhr, setHasVisitedEhr] = useState(false);
  const ehrName = EHR_OPTIONS.find(e => e.id === selectedEhr)?.name || 'your EHR';
  const ehrUrl = EHR_TEAM_MEMBER_URLS[selectedEhr] || '#';

  const copyValues = {
    firstName: 'Cortexa',
    lastName: 'Biller',
    email: generatedEmail,
  };

  // Picture-in-Picture hook
  const { openPiP } = usePictureInPicture({
    firstName: copyValues.firstName,
    lastName: copyValues.lastName,
    email: copyValues.email,
    ehrName,
    ehrUrl,
    onComplete: onStartWaiting,
  });

  const handleCopy = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGoToEhr = () => {
    window.open(ehrUrl, '_blank');
    setHasVisitedEhr(true);
  };

  // Shared Help Section component
  const HelpSection = () => (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700 font-body text-xs font-medium hover:bg-amber-100/80 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Book a call
      </button>
      <button
        onClick={() => window.open('https://www.loom.com/cortexa-setup', '_blank')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200/60 text-stone-600 font-body text-xs font-medium hover:bg-stone-200/60 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Watch video
      </button>
    </div>
  );

  // STATE 2: After user has visited EHR
  if (hasVisitedEhr) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-1">
          <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
            Working in {ehrName}?
          </h2>
          <p className="font-body text-stone-500 text-sm">
            Add the biller account, then come back here to confirm.
          </p>
        </div>

        {/* Primary CTA */}
        {connectionStatus === 'waiting' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-amber-700 text-sm font-medium">Checking for connection...</p>
          </motion.div>
        ) : (
          <button
            onClick={onStartWaiting}
            className="cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl"
            style={{ color: 'white' }}
          >
            <span className="flex items-center justify-center gap-2">
              I've Added the Biller
              <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </button>
        )}

        {/* Copy Helper Link */}
        <div className="flex items-center justify-center">
          <button
            onClick={openPiP}
            className="font-body text-amber-600 hover:text-amber-700 transition-colors text-xs font-medium"
          >
            Open copy helper
          </button>
        </div>

        {/* Help section */}
        <HelpSection />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  // STATE 1: Copy phase (initial)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          Connect {ehrName}
        </h2>
        <p className="font-body text-stone-500 text-sm">
          Create a <span className="text-amber-600 font-medium">Biller account</span> using these details.
        </p>
      </div>

      {/* Copy Fields */}
      <div className="p-3 rounded-xl bg-white border-[1.5px] border-stone-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-[10px] text-stone-400 uppercase tracking-wider">First Name</p>
            <p className="font-body text-sm text-stone-900 font-medium">{copyValues.firstName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('firstName', copyValues.firstName)}
            whileTap={{ scale: 0.95 }}
            className={`px-2.5 py-1 rounded-lg font-body text-xs font-semibold transition-all ${
              copiedField === 'firstName'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {copiedField === 'firstName' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <div className="border-t border-stone-100" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-[10px] text-stone-400 uppercase tracking-wider">Last Name</p>
            <p className="font-body text-sm text-stone-900 font-medium">{copyValues.lastName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('lastName', copyValues.lastName)}
            whileTap={{ scale: 0.95 }}
            className={`px-2.5 py-1 rounded-lg font-body text-xs font-semibold transition-all ${
              copiedField === 'lastName'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {copiedField === 'lastName' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <div className="border-t border-stone-100" />
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="font-body text-[10px] text-stone-400 uppercase tracking-wider">Email</p>
            <p className="font-mono text-xs text-amber-600 font-medium truncate">{copyValues.email}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('email', copyValues.email)}
            whileTap={{ scale: 0.95 }}
            className={`px-2.5 py-1 rounded-lg font-body text-xs font-semibold transition-all flex-shrink-0 ${
              copiedField === 'email'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {copiedField === 'email' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-0.5">
        <p className="font-body text-stone-600 text-xs">
          In {ehrName}: <span className="text-stone-900 font-medium">Settings → Team Members → Add New</span>
        </p>
        <p className="font-body text-stone-600 text-xs">
          Select <span className="text-stone-900 font-medium">"Biller"</span> as the role
        </p>
        <p className="font-body text-stone-600 text-xs">
          Leave all permissions <span className="text-stone-900 font-medium">unchecked</span>
        </p>
      </div>

      {/* Primary CTA */}
      <button
        onClick={handleGoToEhr}
        className="cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl"
        style={{ color: 'white' }}
      >
        <span className="flex items-center justify-center gap-2">
          Go to {ehrName}
          <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </button>

      {/* Copy Helper Link */}
      <div className="flex items-center justify-center">
        <button
          onClick={openPiP}
          className="font-body text-amber-600 hover:text-amber-700 transition-colors text-xs font-medium"
        >
          Open copy helper
        </button>
      </div>

      {/* Help section */}
      <HelpSection />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
};

// ============================================================================
// STEP 4: PAYMENT
// ============================================================================

const StepPayment: React.FC<{
  practiceName: string;
  ehrName: string;
  onContinue: () => void;
  onBack: () => void;
}> = ({ practiceName, ehrName, onContinue, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onContinue();
  };

  const plans = {
    monthly: { price: 199, period: 'month', savings: null },
    annual: { price: 149, period: 'month', savings: 'Save $600/year' },
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="space-y-4">
      {/* Success Header */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-emerald-50 border-2 border-emerald-200"
        >
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="font-display text-[1.5rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          You're connected!
        </h2>
        <p className="font-body text-stone-500 text-sm">
          {ehrName} is linked to <span className="text-stone-900 font-medium">{practiceName}</span>
        </p>
      </div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden bg-white border-[1.5px] border-stone-200 shadow-sm"
      >
        {/* Plan Header */}
        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl text-stone-900">${currentPlan.price}</span>
            <span className="font-body text-stone-500 text-sm">/{currentPlan.period}</span>
          </div>
          <p className="font-body text-stone-500 text-xs mt-0.5">
            Everything you need to understand your practice
          </p>
        </div>

        {/* Features */}
        <div className="px-4 py-3 space-y-1.5">
          {[
            'Full dashboard access',
            'All clinician analytics',
            'Client retention tracking',
            'Revenue & session insights',
            'Daily data refresh from ' + ehrName,
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-body text-stone-600 text-xs">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Money-back Guarantee */}
        <div className="mx-4 mb-3">
          <div className="px-3 py-2 rounded-lg flex items-center gap-2 bg-amber-50 border border-amber-200/60">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-body font-semibold text-amber-800 text-xs">30-Day Money-Back Guarantee</p>
              <p className="font-body text-amber-700/70 text-[10px]">Full refund, no questions asked.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className={`cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{ color: 'white' }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Subscribe & Continue
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Trust Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1.5 text-stone-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-body text-xs">Secure payment</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="font-body text-xs">Cancel anytime</span>
        </div>
      </motion.div>

      {/* Book a Call */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <button
          onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
          className="w-full py-2 rounded-lg font-body text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 hover:bg-amber-100/80"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Questions? Book a quick call
        </button>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </motion.div>
    </div>
  );
};

// ============================================================================
// STEP 5: CREATE ACCOUNT
// ============================================================================

const StepCreateAccount: React.FC<{
  email: string;
  onContinue: () => void;
  onBack: () => void;
}> = ({ email, onContinue, onBack }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onContinue();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onContinue();
  };

  return (
    <div className="space-y-4">
      {/* Final Step Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-body text-xs font-medium text-emerald-700">Final step</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          You're almost there!
        </h2>
        <p className="font-body text-stone-500 text-sm">
          Create your login to access your practice dashboard.
        </p>
      </div>

      {/* Email display */}
      <div className="p-3 rounded-xl bg-white border-[1.5px] border-stone-200 shadow-sm">
        <p className="font-body text-[10px] text-stone-400 uppercase tracking-wider">Account email</p>
        <p className="font-body text-sm text-stone-900 font-medium">{email}</p>
      </div>

      {!showPasswordForm ? (
        <>
          {/* Google OAuth - Primary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-body text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 bg-white border-[1.5px] border-stone-200 text-stone-700 hover:border-stone-300 hover:shadow-sm ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="font-body text-stone-400 text-xs">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Password option */}
          <button
            onClick={() => setShowPasswordForm(true)}
            className="w-full py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-800"
          >
            Create a password instead
          </button>
        </>
      ) : (
        <>
          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-red-50 border border-red-200/60 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-body text-red-600 text-xs">{error}</span>
              </motion.div>
            )}

            {/* Password field */}
            <div>
              <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-refined font-body w-full px-3.5 py-3 pr-10 rounded-xl text-stone-900 text-sm placeholder-stone-400 outline-none"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div>
              <label className="font-body text-xs font-medium text-stone-600 block mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-refined font-body w-full px-3.5 py-3 rounded-xl text-stone-900 text-sm placeholder-stone-400 outline-none"
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Submit button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className={`cta-threshold font-body relative w-full py-3 px-6 text-sm font-semibold rounded-xl ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ color: 'white' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Back to OAuth options */}
          <button
            onClick={() => setShowPasswordForm(false)}
            className="w-full font-body text-amber-600 hover:text-amber-700 text-xs font-medium transition-colors"
          >
            ← Back to sign in options
          </button>
        </>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
};

// ============================================================================
// STEP 6: COMPLETE
// ============================================================================

const StepComplete: React.FC<{
  practiceName: string;
  onComplete: () => void;
}> = ({ practiceName, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'connecting' | 'syncing' | 'ready'>('connecting');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('ready');
          return 100;
        }
        if (prev >= 60) setStatus('syncing');
        return prev + Math.random() * 15;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const statusMessages = {
    connecting: 'Connecting to your EHR...',
    syncing: 'Syncing practice data...',
    ready: 'All set!'
  };

  return (
    <div className="space-y-5 text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.25)',
          boxShadow: '0 0 40px rgba(251, 191, 36, 0.1)',
        }}
      >
        {status === 'ready' ? (
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        )}
      </motion.div>

      <div>
        <h2 className="font-display text-[1.75rem] leading-[1.15] text-stone-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          {status === 'ready' ? `Welcome, ${practiceName}!` : statusMessages[status]}
        </h2>
        <p className="font-body text-stone-500 text-sm">
          {status === 'ready' ? 'Your practice dashboard is ready.' : 'This usually takes less than a minute.'}
        </p>
      </div>

      {status !== 'ready' && (
        <div className="max-w-xs mx-auto">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={onComplete}
              className="cta-threshold font-body px-10 py-3 rounded-xl text-sm font-semibold"
              style={{ color: 'white' }}
            >
              <span className="flex items-center justify-center gap-2">
                Go to Dashboard
                <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 max-w-sm mx-auto"
          >
            <div className="p-4 rounded-xl bg-white border-[1.5px] border-stone-200 shadow-sm">
              <p className="font-body text-stone-600 text-xs italic leading-relaxed">
                "I finally know what's happening in my practice without digging through spreadsheets."
              </p>
              <p className="font-body text-stone-400 text-[10px] mt-2">
                — Practice Owner, Brooklyn
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// MAIN ONBOARDING FLOW COMPONENT
// ============================================================================

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    practiceName: '',
    phone: '',
    title: '',
    password: '',
    confirmPassword: '',
  });
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    practiceName: '',
    phone: '',
    role: '',
    selectedEhr: null,
    agreedToTerms: false,
    agreedToBaa: false,
    generatedEmail: '',
    connectionStatus: 'pending',
  });

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Calculate color progress based on all form fields
  const totalChars = useMemo(() => {
    return formData.name.length + formData.email.length + formData.practiceName.length + formData.phone.length;
  }, [formData.name, formData.email, formData.practiceName, formData.phone]);

  const TARGET_CHARS = 40; // More fields = higher target
  const linearProgress = Math.min(totalChars / TARGET_CHARS, 1);
  const colorProgress = 1 - Math.pow(1 - linearProgress, 3);
  const grayscaleAmount = 1 - colorProgress;
  const saturationAmount = colorProgress * 1.15;

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep0Complete = () => {
    setData(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      practiceName: formData.practiceName,
      phone: formData.phone,
      role: formData.title,
      generatedEmail: generateEmailFromPractice(formData.practiceName),
    }));
    setCurrentStep(1);
  };

  const handleSelectEhr = (ehrId: string) => setData(prev => ({ ...prev, selectedEhr: ehrId }));
  const handleToggleTerms = () => setData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }));
  const handleToggleBaa = () => setData(prev => ({ ...prev, agreedToBaa: !prev.agreedToBaa }));

  const handleStartWaiting = () => {
    setData(prev => ({ ...prev, connectionStatus: 'waiting' }));
    setTimeout(() => {
      setData(prev => ({ ...prev, connectionStatus: 'connected' }));
      setCurrentStep(4);
    }, 3000);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  const getEhrName = () => {
    const ehr = EHR_OPTIONS.find(e => e.id === data.selectedEhr);
    return ehr?.name || 'your EHR';
  };

  const stepLabels = COLLECT_PASSWORD_IN_SIGNUP
    ? ['Get Started', 'Select EHR', 'Legal', 'Connect EHR', 'Subscribe', 'Complete']
    : ['Get Started', 'Select EHR', 'Legal', 'Connect EHR', 'Subscribe', 'Create Account', 'Complete'];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-50">
      {/* Styles - matching LoginPage */}
      <style>{`
        .font-display {
          font-family: 'Tiempos Headline', Georgia, serif;
          font-feature-settings: 'liga' 1, 'kern' 1;
        }

        .font-body {
          font-family: 'Suisse Intl', system-ui, sans-serif;
          font-feature-settings: 'liga' 1, 'kern' 1;
        }

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
        }

        .input-refined:focus {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow:
            0 4px 16px rgba(245, 158, 11, 0.08),
            0 0 0 4px rgba(245, 158, 11, 0.08),
            inset 0 1px 2px rgba(0, 0, 0, 0.01);
        }

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
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 30%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.03) 70%, transparent 100%);
          transform: skewX(-20deg);
          transition: left 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cta-threshold:hover::before {
          left: 150%;
        }

        .cta-threshold:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.15),
            0 16px 40px -8px rgba(0, 0, 0, 0.3),
            0 0 50px -15px rgba(251, 191, 36, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }

        .cta-threshold:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .cta-threshold .arrow-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cta-threshold:hover .arrow-icon {
          transform: translateX(4px);
        }

        .grain-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.02;
          pointer-events: none;
        }

        .cinematic-vignette {
          background: radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(28, 25, 23, 0.15) 100%);
        }

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
        animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 1.2, ease: easeOutExpo }}
        className="hidden lg:block lg:w-[52%] relative overflow-hidden"
      >
        {/* The artwork image with dynamic color */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: easeOutQuint, delay: 0.6 }}
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
            background: `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(251, 191, 36, ${0.05 * colorProgress}) 0%, transparent 60%)`,
            transition: 'background 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

        {/* Grain texture */}
        <div className="absolute inset-0 grain-texture" />
      </motion.div>

      {/* ==========================================
          RIGHT PANEL - Onboarding Content
          ========================================== */}
      <div className="w-full lg:w-[48%] h-full relative flex flex-col">
        {/* Background warmth gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 30% 20%, rgba(251, 191, 36, 0.04) 0%, transparent 50%),
              radial-gradient(ellipse 80% 100% at 100% 100%, rgba(168, 162, 158, 0.05) 0%, transparent 50%),
              #fafaf9
            `,
          }}
        />

        {/* Grain texture */}
        <div className="absolute inset-0 grain-texture" />

        {/* Top Left Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -8 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.1 }}
          className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <img
              src="/cortexa-mark.png"
              alt="Cortexa"
              className="h-9 w-auto object-contain"
              style={{
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.06)) drop-shadow(0 4px 12px rgba(120, 90, 50, 0.08))'
              }}
            />
            <span
              className="font-body text-[1.5rem] font-medium text-stone-900 leading-none mt-0.5"
              style={{ letterSpacing: '-0.02em' }}
            >
              Cortexa
            </span>
          </div>
          <ProgressIndicator currentStep={currentStep} totalSteps={stepLabels.length} />
        </motion.div>

        {/* Form container - scrollable */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-6 md:px-10">
          <div className="w-full max-w-[400px] mx-auto py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentStep === 0 && (
                  <StepGetStarted
                    formData={formData}
                    onFormChange={handleFormChange}
                    onContinue={handleStep0Complete}
                    onSwitchToLogin={onSwitchToLogin}
                    collectPassword={COLLECT_PASSWORD_IN_SIGNUP}
                    isVisible={isVisible}
                  />
                )}
                {currentStep === 1 && (
                  <StepSelectEhr
                    selectedEhr={data.selectedEhr}
                    onSelect={handleSelectEhr}
                    onContinue={() => goToStep(2)}
                    onBack={() => goToStep(0)}
                  />
                )}
                {currentStep === 2 && (
                  <StepLegalAgreements
                    agreedToTerms={data.agreedToTerms}
                    agreedToBaa={data.agreedToBaa}
                    onToggleTerms={handleToggleTerms}
                    onToggleBaa={handleToggleBaa}
                    onContinue={() => goToStep(3)}
                    onBack={() => goToStep(1)}
                  />
                )}
                {currentStep === 3 && data.selectedEhr && (
                  <StepConnectEhr
                    generatedEmail={data.generatedEmail}
                    selectedEhr={data.selectedEhr}
                    connectionStatus={data.connectionStatus}
                    onStartWaiting={handleStartWaiting}
                    onBack={() => goToStep(2)}
                  />
                )}
                {currentStep === 4 && (
                  <StepPayment
                    practiceName={data.practiceName}
                    ehrName={getEhrName()}
                    onContinue={() => goToStep(COLLECT_PASSWORD_IN_SIGNUP ? 5 : 5)}
                    onBack={() => goToStep(3)}
                  />
                )}
                {/* Create Account step - only shown when NOT collecting password in signup */}
                {!COLLECT_PASSWORD_IN_SIGNUP && currentStep === 5 && (
                  <StepCreateAccount
                    email={data.email}
                    onContinue={() => goToStep(6)}
                    onBack={() => goToStep(4)}
                  />
                )}
                {/* Complete step - step 5 when collecting password in signup, step 6 otherwise */}
                {((COLLECT_PASSWORD_IN_SIGNUP && currentStep === 5) || (!COLLECT_PASSWORD_IN_SIGNUP && currentStep === 6)) && (
                  <StepComplete
                    practiceName={data.practiceName}
                    onComplete={onComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle at 100% 100%, rgba(251, 191, 36, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};
