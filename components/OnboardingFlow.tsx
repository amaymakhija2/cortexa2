import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePictureInPicture } from './PiPCopyWidget';

// Premium easing curves matching LP
const easeOutQuint = [0.22, 1, 0.36, 1] as const;
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// ============================================================================
// CONFIGURATION
// ============================================================================
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
// PROGRESS INDICATOR - Refined
// ============================================================================

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`
            h-1.5 rounded-full transition-all duration-500
            ${currentStep > index
              ? 'w-1.5 bg-amber-500'
              : currentStep === index
                ? 'w-5 bg-amber-400'
                : 'w-1.5 bg-stone-200'}
          `}
        />
      ))}
    </div>
  );
};

// ============================================================================
// STEP 0: GET STARTED - Single Column, Compact for 720px
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8 flex-shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.1 }}
          className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight"
        >
          Get started
        </motion.h1>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="p-3 rounded-xl flex items-center gap-2.5 error-shake"
              style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-body text-red-600 text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4">
          {inputFields.map((field, index) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
              transition={{ duration: 0.4, ease: easeOutQuint, delay: 0.2 + index * 0.04 }}
            >
              <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.key as keyof FormData]}
                onChange={handleChange(field.key as keyof FormData)}
                className="input-refined font-body w-full px-4 py-3 rounded-xl text-stone-900 text-base placeholder-stone-400 outline-none"
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
            transition={{ duration: 0.4, ease: easeOutQuint, delay: 0.36 }}
          >
            <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">
              Your Role
              <span className="text-stone-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={formData.title}
                onChange={handleChange('title')}
                className={`input-refined font-body w-full px-4 py-3 rounded-xl text-base outline-none appearance-none cursor-pointer ${!formData.title ? 'text-stone-400' : 'text-stone-900'}`}
              >
                {titleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
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
                transition={{ duration: 0.4, ease: easeOutQuint, delay: 0.4 }}
              >
                <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="input-refined font-body w-full px-4 py-3 pr-12 rounded-xl text-stone-900 text-base placeholder-stone-400 outline-none"
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors duration-200 rounded-lg hover:bg-stone-100/50"
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
                transition={{ duration: 0.4, ease: easeOutQuint, delay: 0.44 }}
              >
                <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className="input-refined font-body w-full px-4 py-3 rounded-xl text-stone-900 text-base placeholder-stone-400 outline-none"
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Footer - Pinned to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
          transition={{ duration: 0.4, ease: easeOutQuint, delay: 0.45 }}
          className="flex-shrink-0 pt-6 mt-auto"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="cta-threshold font-body relative w-full py-4 px-6 text-white text-base font-semibold rounded-xl"
          >
            <span className={`flex items-center justify-center gap-2.5 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              Continue
              <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

          {/* Switch to Login */}
          <p className="font-body text-stone-500 text-sm text-center mt-4">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-amber-600 hover:text-amber-700 transition-colors font-semibold"
              >
                Sign in
              </button>
            ) : (
              <span className="text-amber-600 font-semibold">Sign in</span>
            )}
          </p>
        </motion.div>
      </form>
    </div>
  );
};

// ============================================================================
// STEP 1: SELECT EHR - Horizontal Grid Layout
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
    <div className="flex flex-col h-full">
      {/* Header - Matches Get Started */}
      <div className="mb-8 flex-shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint }}
          className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight"
        >
          Select your EHR
        </motion.h1>
      </div>

      {/* Main Selection Area - Full Width Cards */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Popular EHRs - Large Full-Width Cards */}
        {popularEhrs.map((ehr, index) => (
          <motion.button
            key={ehr.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.1 + index * 0.05 }}
            onClick={() => onSelect(ehr.id)}
            className={`
              w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-400
              ${selectedEhr === ehr.id
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg shadow-amber-100/50'
                : 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Selection Indicator */}
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${selectedEhr === ehr.id
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-stone-300'}
                `}>
                  {selectedEhr === ehr.id && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>

                {/* EHR Info */}
                <span className={`
                  font-body text-lg font-semibold transition-colors duration-300
                  ${selectedEhr === ehr.id ? 'text-amber-900' : 'text-stone-900'}
                `}>
                  {ehr.name}
                </span>
              </div>

            </div>
          </motion.button>
        ))}

        {/* Other EHRs - Compact Pill Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap gap-2 pt-3"
        >
          {otherEhrs.map((ehr) => (
            <button
              key={ehr.id}
              onClick={() => onSelect(ehr.id)}
              className={`
                px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all duration-300
                ${selectedEhr === ehr.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-200/50'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'}
              `}
            >
              {ehr.name}
            </button>
          ))}
          <button
            className="px-4 py-2.5 rounded-xl font-body text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all duration-300"
          >
            Other →
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 pt-2"
        >
          <div className="flex items-center gap-1.5 text-stone-400">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-body text-sm">HIPAA compliant</span>
          </div>
          <span className="text-stone-300">·</span>
          <div className="flex items-center gap-1.5 text-stone-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-body text-sm">Read-only access</span>
          </div>
        </motion.div>
      </div>

      {/* Footer Actions - Pinned to bottom */}
      <div className="flex-shrink-0 pt-6 space-y-2 mt-auto">
        <button
          onClick={onContinue}
          disabled={!selectedEhr}
          className={`cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl transition-all duration-300 ${!selectedEhr ? 'opacity-40 cursor-not-allowed' : ''}`}
          style={{ color: 'white' }}
        >
          <span className="flex items-center justify-center gap-2.5">
            Continue
            <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: LEGAL AGREEMENTS - Side by Side Cards
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

  const agreements = [
    {
      id: 'terms',
      title: 'Terms of Service',
      agreed: agreedToTerms,
      onToggle: onToggleTerms,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: 'baa',
      title: 'Business Associate Agreement',
      agreed: agreedToBaa,
      onToggle: onToggleBaa,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header - Matches other screens */}
      <div className="mb-8 flex-shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint }}
          className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight"
        >
          Review & agree
        </motion.h1>
      </div>

      {/* Agreement Cards - Full Width, Stacked */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {agreements.map((agreement, index) => (
          <motion.button
            key={agreement.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.1 + index * 0.05 }}
            onClick={agreement.onToggle}
            className={`
              w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-400
              ${agreement.agreed
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg shadow-amber-100/50'
                : 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${agreement.agreed
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-stone-300'}
                `}>
                  {agreement.agreed && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>

                {/* Title */}
                <span className={`
                  font-body text-lg font-semibold transition-colors duration-300
                  ${agreement.agreed ? 'text-amber-900' : 'text-stone-900'}
                `}>
                  {agreement.title}
                </span>
              </div>

              {/* View Link */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  // Open document
                }}
                className="font-body text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-300 hover:underline underline-offset-2"
              >
                View
              </span>
            </div>
          </motion.button>
        ))}

      </div>

      {/* Footer Actions - Pinned to bottom */}
      <div className="flex-shrink-0 pt-6 space-y-2 mt-auto">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl transition-all duration-300 ${!canContinue ? 'opacity-40 cursor-not-allowed' : ''}`}
          style={{ color: 'white' }}
        >
          <span className="flex items-center justify-center gap-2.5">
            Continue
            <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 3: CONNECT EHR - Horizontal Copy Fields
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

  // After user has visited EHR
  if (hasVisitedEhr) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight mb-2">
            Working in {ehrName}?
          </h2>
          <p className="font-body text-base text-stone-500">
            Add the biller account, then come back here.
          </p>
        </div>

        <div className="space-y-4">
          {connectionStatus === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center gap-2.5"
            >
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-body text-amber-700 text-base font-medium">Checking for connection...</p>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={openPiP}
              className="font-body text-amber-600 hover:text-amber-700 transition-colors text-sm font-semibold"
            >
              Open copy helper
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
              className="font-body text-stone-500 hover:text-stone-700 transition-colors text-sm font-medium"
            >
              Need help?
            </button>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="flex-shrink-0 pt-6 space-y-2 mt-auto">
          {connectionStatus !== 'waiting' && (
            <button
              onClick={onStartWaiting}
              className="cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl"
              style={{ color: 'white' }}
            >
              <span className="flex items-center justify-center gap-2.5">
                I've Added the Biller
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Initial copy phase - Horizontal layout
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight mb-2">
          Connect {ehrName}
        </h2>
        <p className="font-body text-base text-stone-500">
          Create a <span className="text-amber-600 font-semibold">Biller account</span> using these details.
        </p>
      </div>

      <div className="space-y-4">
        {/* Horizontal Copy Fields - 3 Column Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* First Name */}
          <div className="p-3 rounded-xl bg-white border-2 border-stone-200">
            <p className="font-body text-xs text-stone-400 uppercase tracking-wider font-semibold">First Name</p>
            <p className="font-body text-base text-stone-900 font-semibold mt-0.5 truncate">{copyValues.firstName}</p>
            <motion.button
              onClick={() => handleCopy('firstName', copyValues.firstName)}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-2 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                copiedField === 'firstName'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {copiedField === 'firstName' ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          {/* Last Name */}
          <div className="p-3 rounded-xl bg-white border-2 border-stone-200">
            <p className="font-body text-xs text-stone-400 uppercase tracking-wider font-semibold">Last Name</p>
            <p className="font-body text-base text-stone-900 font-semibold mt-0.5 truncate">{copyValues.lastName}</p>
            <motion.button
              onClick={() => handleCopy('lastName', copyValues.lastName)}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-2 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                copiedField === 'lastName'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {copiedField === 'lastName' ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          {/* Email */}
          <div className="p-3 rounded-xl bg-white border-2 border-stone-200">
            <p className="font-body text-xs text-stone-400 uppercase tracking-wider font-semibold">Email</p>
            <p className="font-mono text-sm text-amber-600 font-medium mt-0.5 truncate">{copyValues.email}</p>
            <motion.button
              onClick={() => handleCopy('email', copyValues.email)}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-2 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                copiedField === 'email'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {copiedField === 'email' ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>
        </div>

        {/* Compact Instructions */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-body text-xs font-bold text-amber-700">?</span>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-body text-stone-600">
                <span className="text-stone-900 font-semibold">Settings → Team Members → Add New</span>
              </p>
              <p className="font-body text-stone-600">
                Role: <span className="text-stone-900 font-semibold">Biller</span> · Leave permissions <span className="text-stone-900 font-semibold">unchecked</span>
              </p>
            </div>
          </div>
        </div>

        {/* Help links inline */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
            className="flex items-center gap-1.5 font-body text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Book a call
          </button>
          <button
            onClick={() => window.open('https://www.loom.com/cortexa-setup', '_blank')}
            className="flex items-center gap-1.5 font-body text-sm text-stone-500 hover:text-stone-700 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch video
          </button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex-shrink-0 pt-6 space-y-2 mt-auto">
        <button
          onClick={handleGoToEhr}
          className="cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl"
          style={{ color: 'white' }}
        >
          <span className="flex items-center justify-center gap-2.5">
            Go to {ehrName}
            <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </button>

        <div className="flex items-center justify-center">
          <button
            onClick={openPiP}
            className="font-body text-amber-600 hover:text-amber-700 transition-colors text-sm font-semibold"
          >
            Open copy helper instead
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 4: PAYMENT - Ultra-Compact Horizontal Layout
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

  const features = [
    'Full dashboard access',
    'All clinician analytics',
    'Client retention tracking',
    'Revenue & session insights',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Success Header - Compact inline */}
      <div className="flex items-center gap-3 mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 border-2 border-emerald-200 flex-shrink-0"
        >
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <div>
          <h2 className="font-display text-2xl leading-tight text-stone-900 tracking-tight">
            You're connected!
          </h2>
          <p className="font-body text-sm text-stone-500">
            {ehrName} linked to <span className="text-stone-900 font-medium">{practiceName}</span>
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div>
      {/* Pricing Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl overflow-hidden bg-white border-2 border-stone-200 shadow-lg"
      >
        {/* Price Header */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl text-stone-900">${currentPlan.price}</span>
            <span className="font-body text-stone-500 text-base">/{currentPlan.period}</span>
          </div>
          <span className="font-body text-stone-400 text-sm">Everything included</span>
        </div>

        {/* Features - 2 Column Grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.04 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-body text-stone-700 text-sm">{feature}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.36 }}
            className="flex items-center gap-2 col-span-2"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-body text-stone-700 text-sm">Daily data refresh from {ehrName}</span>
          </motion.div>
        </div>

        {/* Guarantee */}
        <div className="px-4 pb-4">
          <div className="px-3 py-2 rounded-lg flex items-center gap-2.5 bg-amber-50 border border-amber-200/60">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-body font-medium text-amber-800 text-sm">30-day money-back guarantee</span>
          </div>
        </div>
      </motion.div>

      {/* Trust + Help - Inline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pt-3 flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-4 text-stone-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Cancel anytime
          </span>
        </div>
        <button
          onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
          className="font-body text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          Questions?
        </button>
      </motion.div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="flex-shrink-0 pt-6 space-y-2 mt-auto">
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className={`cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ color: 'white' }}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Subscribe & Continue
            </span>
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 5: CREATE ACCOUNT - Streamlined
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
    <div className="flex flex-col h-full">
      {/* Header with Badge */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-3">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-body text-xs font-semibold text-emerald-700">Final step</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight mb-2">
          You're almost there!
        </h2>
        <p className="font-body text-base text-stone-500">
          Create your login to access your dashboard.
        </p>
      </div>

      <div>
        {/* Email display */}
        <div className="p-3 rounded-xl bg-white border-2 border-stone-200 mb-4">
          <p className="font-body text-xs text-stone-400 uppercase tracking-wider font-semibold">Account email</p>
          <p className="font-body text-base text-stone-900 font-semibold mt-0.5">{email}</p>
        </div>

        {!showPasswordForm ? (
          <div className="space-y-3">
            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-body text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 bg-white border-2 border-stone-200 text-stone-700 hover:border-stone-300 hover:shadow-md ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              <span className="font-body text-stone-400 text-sm">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Password option */}
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full py-4 rounded-xl font-body text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-800"
            >
              Create a password instead
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200/60 flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-body text-red-600 text-sm">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-refined font-body w-full px-4 py-3 pr-12 rounded-xl text-stone-900 text-base placeholder-stone-400 outline-none"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
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

            <div>
              <label className="font-body text-sm font-medium text-stone-700 block mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-refined font-body w-full px-4 py-3 rounded-xl text-stone-900 text-base placeholder-stone-400 outline-none"
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`cta-threshold font-body relative w-full py-4 px-6 text-base font-semibold rounded-xl ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ color: 'white' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  Create Account
                  <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordForm(false)}
              className="w-full font-body text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors"
            >
              ← Back to sign in options
            </button>
          </form>
        )}
      </div>

      {/* Sticky Back Button */}
      <div className="flex-shrink-0 pt-6 mt-auto">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 6: COMPLETE - Compact Celebration
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
    <div className="flex flex-col items-center justify-center text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
          border: '3px solid rgba(251, 191, 36, 0.25)',
          boxShadow: '0 0 40px rgba(251, 191, 36, 0.15)',
        }}
      >
        {status === 'ready' ? (
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        )}
      </motion.div>

      <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-stone-900 tracking-tight mb-2">
        {status === 'ready' ? `Welcome, ${practiceName}!` : statusMessages[status]}
      </h2>
      <p className="font-body text-base text-stone-500 mb-5">
        {status === 'ready' ? 'Your practice dashboard is ready.' : 'This usually takes less than a minute.'}
      </p>

      {status !== 'ready' && (
        <div className="w-full max-w-xs mb-5">
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
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onComplete}
            className="cta-threshold font-body px-10 py-4 rounded-xl text-base font-semibold mb-5"
            style={{ color: 'white' }}
          >
            <span className="flex items-center justify-center gap-2.5">
              Go to Dashboard
              <svg className="w-4 h-4 arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-sm"
          >
            <div className="p-4 rounded-xl bg-white border-2 border-stone-200">
              <p className="font-body text-stone-600 text-sm italic leading-relaxed">
                "I finally know what's happening in my practice without digging through spreadsheets."
              </p>
              <p className="font-body text-stone-400 text-xs mt-2">
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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const totalChars = useMemo(() => {
    return formData.name.length + formData.email.length + formData.practiceName.length + formData.phone.length;
  }, [formData.name, formData.email, formData.practiceName, formData.phone]);

  const TARGET_CHARS = 40;
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
      {/* Styles */}
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
          border: 2px solid rgba(168, 162, 158, 0.25);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.02),
            0 0 0 0px rgba(245, 158, 11, 0),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .input-refined:hover {
          border-color: rgba(168, 162, 158, 0.4);
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.03),
            0 0 0 0px rgba(245, 158, 11, 0),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .input-refined:focus {
          border-color: rgba(245, 158, 11, 0.6);
          box-shadow:
            0 4px 16px rgba(245, 158, 11, 0.1),
            0 0 0 3px rgba(245, 158, 11, 0.1),
            inset 0 1px 2px rgba(0, 0, 0, 0.01);
        }

        .cta-threshold {
          background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%);
          background-size: 200% 200%;
          box-shadow:
            0 4px 10px rgba(0, 0, 0, 0.12),
            0 10px 28px -4px rgba(0, 0, 0, 0.2),
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

        .cta-threshold::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0) 20%, rgba(251, 191, 36, 0) 80%, transparent);
          transform: scaleX(0.3);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cta-threshold:hover::after {
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6) 20%, rgba(251, 191, 36, 0.8) 50%, rgba(251, 191, 36, 0.6) 80%, transparent);
          transform: scaleX(1);
          opacity: 1;
        }

        .cta-threshold:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.15),
            0 20px 48px -8px rgba(0, 0, 0, 0.3),
            0 0 50px -15px rgba(251, 191, 36, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 1px 0 rgba(255, 255, 255, 0.08) inset;
        }

        .cta-threshold:active {
          transform: translateY(-1px);
          transition-duration: 0.1s;
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
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .error-shake {
          animation: error-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        /* Custom scrollbar for form panel */
        .form-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .form-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .form-scroll::-webkit-scrollbar-thumb {
          background: rgba(168, 162, 158, 0.25);
          border-radius: 2px;
        }

        .form-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 162, 158, 0.4);
        }
      `}</style>

      {/* LEFT PANEL - Japanese Maple Artwork */}
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 1.2, ease: easeOutExpo }}
        className="hidden lg:block lg:w-[52%] relative overflow-hidden"
      >
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

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(251, 191, 36, ${0.05 * colorProgress}) 0%, transparent 60%)`,
            transition: 'background 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        <div className="absolute inset-0 cinematic-vignette pointer-events-none" />
        <div className="absolute inset-0 grain-texture" />
      </motion.div>

      {/* RIGHT PANEL - Onboarding Content */}
      <div className="w-full lg:w-[48%] h-full relative flex flex-col">
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

        <div className="absolute inset-0 grain-texture" />

        {/* Header with Logo & Progress */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -8 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.1 }}
          className="relative z-10 flex items-center justify-between px-6 md:px-8 pt-5 flex-shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/cortexa-mark.png"
              alt="Cortexa"
              className="h-9 w-auto object-contain"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05)) drop-shadow(0 3px 8px rgba(120, 90, 50, 0.06))'
              }}
            />
            <span
              className="font-body text-xl font-semibold text-stone-900 leading-none"
              style={{ letterSpacing: '-0.02em' }}
            >
              Cortexa
            </span>
          </div>
          <ProgressIndicator currentStep={currentStep} totalSteps={stepLabels.length} />
        </motion.div>

        {/* Form container - fills remaining height, scrollable when needed */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto form-scroll px-6 md:px-8 py-5">
          <div className="w-full max-w-[420px] mx-auto flex flex-col min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col"
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
                    onContinue={() => {
                      if (COLLECT_PASSWORD_IN_SIGNUP) {
                        goToStep(5);
                      } else {
                        goToStep(5);
                      }
                    }}
                    onBack={() => goToStep(3)}
                  />
                )}
                {currentStep === 5 && !COLLECT_PASSWORD_IN_SIGNUP && (
                  <StepCreateAccount
                    email={data.email}
                    onContinue={() => goToStep(6)}
                    onBack={() => goToStep(4)}
                  />
                )}
                {((currentStep === 5 && COLLECT_PASSWORD_IN_SIGNUP) || (currentStep === 6 && !COLLECT_PASSWORD_IN_SIGNUP)) && (
                  <StepComplete
                    practiceName={data.practiceName}
                    onComplete={onComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
