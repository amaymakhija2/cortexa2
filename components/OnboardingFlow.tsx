import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FallingLinesCanvas } from './FallingLinesCanvas';
import { usePictureInPicture } from './PiPCopyWidget';

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
  // Generate steps dynamically based on totalSteps
  // When COLLECT_PASSWORD_IN_SIGNUP is true: 6 steps (no Account step)
  // When COLLECT_PASSWORD_IN_SIGNUP is false: 7 steps (includes Account step)
  const stepLabelsShort = totalSteps === 6
    ? ['Start', 'EHR', 'Legal', 'Connect', 'Subscribe', 'Done']
    : ['Start', 'EHR', 'Legal', 'Connect', 'Subscribe', 'Account', 'Done'];

  const steps = stepLabelsShort.map((label, index) => ({ num: index, label }));

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-medium
              transition-all duration-300
              ${currentStep > step.num
                ? 'bg-amber-500 text-stone-900'
                : currentStep === step.num
                  ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500'
                  : 'bg-stone-800 text-stone-500 border border-stone-700'}
            `}
          >
            {currentStep > step.num ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : step.num === 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              step.num
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${currentStep > step.num ? 'bg-amber-500' : 'bg-stone-700'}`} />
          )}
        </React.Fragment>
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
}> = ({ formData, onFormChange, onContinue, onSwitchToLogin, collectPassword = false }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

    // Password validation only if collecting password in this step
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);
    onContinue();
  };

  const inputFields = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', type: 'text', required: true, autoComplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'you@yourpractice.com', type: 'email', required: true, autoComplete: 'email' },
    { key: 'practiceName', label: 'Practice Name', placeholder: 'Enter your practice name', type: 'text', required: true, autoComplete: 'organization' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, autoComplete: 'tel' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3 sm:mb-4">Get started</h2>
        <p className="font-body text-stone-300 text-lg leading-relaxed">
          See what's really happening in your practice —<br />
          <span className="text-stone-400">no spreadsheets, no guesswork.</span>
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/50">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-body text-sm text-stone-400">Takes about 5 minutes</span>
        </div>
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

        {/* Password Fields - Only shown when collectPassword is true */}
        {collectPassword && (
          <>
            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <label className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium block mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`
                    font-body w-full px-4 py-3 pr-12
                    bg-stone-800 border rounded-xl
                    text-white text-lg
                    placeholder-stone-500
                    transition-all duration-200
                    outline-none input-glow
                    ${focusedField === 'password'
                      ? 'border-amber-500/50 bg-stone-800/90'
                      : 'border-stone-700 hover:border-stone-600'}
                  `}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium block mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`
                  font-body w-full px-4 py-3
                  bg-stone-800 border rounded-xl
                  text-white text-lg
                  placeholder-stone-500
                  transition-all duration-200
                  outline-none input-glow
                  ${focusedField === 'confirmPassword'
                    ? 'border-amber-500/50 bg-stone-800/90'
                    : 'border-stone-700 hover:border-stone-600'}
                `}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
            </motion.div>
          </>
        )}

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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Which EHR do you use?</h2>
        <p className="font-body text-stone-400 text-lg">We'll connect to pull your practice data automatically.</p>
        {/* HIPAA + Read-only trust signals */}
        <div className="mt-4 flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/50">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-body text-sm text-stone-400">HIPAA Compliant</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/50">
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-body text-sm text-stone-400">Read-only access</span>
          </div>
        </div>
      </div>

      {/* Popular EHRs */}
      <div className="space-y-3">
        <p className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium">Popular</p>
        <div className="grid grid-cols-1 gap-3">
          {popularEhrs.map((ehr) => (
            <button
              key={ehr.id}
              onClick={() => onSelect(ehr.id)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200
                ${selectedEhr === ehr.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-stone-700/50 bg-stone-800/50 hover:border-stone-600'}
              `}
            >
              <span className={`font-body text-lg font-medium ${selectedEhr === ehr.id ? 'text-white' : 'text-stone-300'}`}>
                {ehr.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Other EHRs */}
      <div className="space-y-3">
        <p className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium">Others</p>
        <div className="grid grid-cols-2 gap-3">
          {otherEhrs.map((ehr) => (
            <button
              key={ehr.id}
              onClick={() => onSelect(ehr.id)}
              className={`
                p-3 rounded-xl border-2 text-left transition-all duration-200
                ${selectedEhr === ehr.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-stone-700/50 bg-stone-800/50 hover:border-stone-600'}
              `}
            >
              <span className={`font-body text-base ${selectedEhr === ehr.id ? 'text-white' : 'text-stone-400'}`}>
                {ehr.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button className="font-body text-stone-500 hover:text-stone-300 text-base transition-colors">
        Don't see yours? Let us know →
      </button>

      {/* Continue Button */}
      <motion.button
        onClick={onContinue}
        disabled={!selectedEhr}
        whileHover={selectedEhr ? { scale: 1.01 } : {}}
        whileTap={selectedEhr ? { scale: 0.99 } : {}}
        className={`
          w-full py-4 rounded-2xl font-body text-lg font-semibold transition-all duration-300
          ${selectedEhr
            ? 'bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10'
            : 'bg-stone-700 text-stone-500 cursor-not-allowed'}
        `}
      >
        Continue
      </motion.button>

      {/* Back Button - Consistent */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3 sm:mb-4">Quick legal stuff</h2>
        <p className="font-body text-stone-400 text-lg">We take your data security seriously.</p>
      </div>

      <div className="space-y-5">
        {/* Terms */}
        <div
          onClick={onToggleTerms}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${agreedToTerms ? 'border-amber-500/50 bg-amber-500/5' : 'border-stone-700/50 bg-stone-800/50 hover:border-stone-600'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreedToTerms ? 'border-amber-500 bg-amber-500' : 'border-stone-600'}`}>
              {agreedToTerms && (
                <svg className="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-body font-semibold text-white text-lg">Terms of Service</h3>
                <button onClick={(e) => e.stopPropagation()} className="font-body text-base text-amber-500 hover:text-amber-400">View</button>
              </div>
              <p className="font-body text-base text-stone-500 mt-1">Standard platform usage terms</p>
            </div>
          </div>
        </div>

        {/* BAA */}
        <div
          onClick={onToggleBaa}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${agreedToBaa ? 'border-amber-500/50 bg-amber-500/5' : 'border-stone-700/50 bg-stone-800/50 hover:border-stone-600'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreedToBaa ? 'border-amber-500 bg-amber-500' : 'border-stone-600'}`}>
              {agreedToBaa && (
                <svg className="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-body font-semibold text-white text-lg">Business Associate Agreement</h3>
                <button onClick={(e) => e.stopPropagation()} className="font-body text-base text-amber-500 hover:text-amber-400">View</button>
              </div>
              <p className="font-body text-base text-stone-500 mt-1">HIPAA-required for handling your data</p>
            </div>
          </div>
        </div>
      </div>

      <p className="font-body text-base text-stone-500">
        By checking above, you confirm you have authority to sign on behalf of your practice.
      </p>

      {/* Continue Button */}
      <motion.button
        onClick={onContinue}
        disabled={!canContinue}
        whileHover={canContinue ? { scale: 1.01 } : {}}
        whileTap={canContinue ? { scale: 0.99 } : {}}
        className={`w-full py-4 rounded-2xl font-body text-lg font-semibold transition-all duration-300 ${canContinue ? 'bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}`}
      >
        I Agree & Continue
      </motion.button>

      {/* Back Button - Consistent */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    <div className="flex items-center justify-center gap-4 pt-2">
      <button
        onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-body text-base font-medium hover:bg-amber-500/20 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Book a call
      </button>
      <button
        onClick={() => window.open('https://www.loom.com/cortexa-setup', '_blank')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-700/50 border border-stone-600/50 text-stone-300 font-body text-base font-medium hover:bg-stone-700 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Working in {ehrName}?</h2>
          <p className="font-body text-stone-400 text-lg">
            Add the biller account, then come back here to confirm.
          </p>
        </div>

        {/* Primary CTA */}
        {connectionStatus === 'waiting' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-amber-400 text-lg">Checking for connection...</p>
          </motion.div>
        ) : (
          <motion.button
            onClick={onStartWaiting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10"
          >
            I've Added the Biller
          </motion.button>
        )}

        {/* Copy Helper Link */}
        <div className="flex items-center justify-center">
          <button
            onClick={openPiP}
            className="font-body text-amber-500 hover:text-amber-400 transition-colors text-base"
          >
            Open copy helper
          </button>
        </div>

        {/* Help section */}
        <HelpSection />

        {/* Back Button - Consistent */}
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">Connect {ehrName}</h2>
        <p className="font-body text-stone-400 text-base">
          Create a <span className="text-amber-400">Biller account</span> using these details.
        </p>
      </div>

      {/* Copy Fields */}
      <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-stone-500 mb-0.5">First Name</p>
            <p className="font-body text-lg text-white font-medium">{copyValues.firstName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('firstName', copyValues.firstName)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-lg font-body text-sm font-semibold transition-all ${
              copiedField === 'firstName'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500 text-stone-900 hover:bg-amber-400'
            }`}
          >
            {copiedField === 'firstName' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <div className="border-t border-stone-700/50" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-stone-500 mb-0.5">Last Name</p>
            <p className="font-body text-lg text-white font-medium">{copyValues.lastName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('lastName', copyValues.lastName)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-lg font-body text-sm font-semibold transition-all ${
              copiedField === 'lastName'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500 text-stone-900 hover:bg-amber-400'
            }`}
          >
            {copiedField === 'lastName' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <div className="border-t border-stone-700/50" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-stone-500 mb-0.5">Email</p>
            <p className="font-mono text-base text-amber-400 font-medium">{copyValues.email}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('email', copyValues.email)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-lg font-body text-sm font-semibold transition-all ${
              copiedField === 'email'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500 text-stone-900 hover:bg-amber-400'
            }`}
          >
            {copiedField === 'email' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/50 space-y-1">
        <p className="font-body text-stone-300 text-base">
          In {ehrName}: <span className="text-white font-medium">Settings → Team Members → Add New</span>
        </p>
        <p className="font-body text-stone-300 text-base">
          Select <span className="text-white font-medium">"Biller"</span> as the role
        </p>
        <p className="font-body text-stone-300 text-base">
          Leave all permissions <span className="text-white font-medium">unchecked</span>
        </p>
      </div>

      {/* Primary CTA */}
      <motion.button
        onClick={handleGoToEhr}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10"
      >
        Go to {ehrName}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </motion.button>

      {/* Copy Helper Link */}
      <div className="flex items-center justify-center">
        <button
          onClick={openPiP}
          className="font-body text-amber-500 hover:text-amber-400 transition-colors text-base"
        >
          Open copy helper
        </button>
      </div>

      {/* Help section */}
      <HelpSection />

      {/* Back Button - Consistent */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    // TODO: Integrate with Stripe Checkout
    // In production: redirect to Stripe or open Stripe Elements modal
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
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.05) 100%)',
            border: '2px solid rgba(52, 211, 153, 0.3)',
          }}
        >
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="font-display text-3xl text-white mb-2">You're connected!</h2>
        <p className="font-body text-stone-400 text-lg">
          {ehrName} is linked to <span className="text-white">{practiceName}</span>
        </p>
      </div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Plan Header */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl text-white">${currentPlan.price}</span>
            <span className="font-body text-stone-400 text-lg">/{currentPlan.period}</span>
          </div>
          <p className="font-body text-stone-500 mt-1">
            Everything you need to understand your practice
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-3">
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
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-body text-stone-300 text-base">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Money-back Guarantee */}
        <div className="mx-6 mb-5">
          <div
            className="px-4 py-3 rounded-xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-body font-semibold text-amber-300 text-sm">30-Day Money-Back Guarantee</p>
              <p className="font-body text-amber-400/70 text-sm">Not what you expected? Full refund, no questions asked.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-6 pb-6">
          <motion.button
            onClick={handleSubscribe}
            disabled={isProcessing}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f4 100%)',
              color: '#1c1917',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
            }}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Subscribe & Continue</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Trust Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-6 pt-2"
      >
        <div className="flex items-center gap-2 text-stone-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-body text-sm">Secure payment</span>
        </div>
        <div className="flex items-center gap-2 text-stone-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="font-body text-sm">Cancel anytime</span>
        </div>
      </motion.div>

      {/* Book a Call - Prominent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="pt-4"
      >
        <button
          onClick={() => window.open('https://calendly.com/cortexa', '_blank')}
          className="w-full py-3 rounded-xl font-body text-base font-medium transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            color: '#fbbf24',
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Questions? Book a quick call
        </button>
      </motion.div>

      {/* Back Button - Consistent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-2"
      >
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    // TODO: Implement actual Google OAuth
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
    // TODO: Implement actual password account creation
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onContinue();
  };

  return (
    <div className="space-y-6">
      {/* Final Step Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-body text-sm font-medium text-emerald-400">Final step</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">You're almost there!</h2>
        <p className="font-body text-stone-400 text-lg">
          Create your login to access your practice dashboard.
        </p>
      </div>

      {/* Email display */}
      <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
        <p className="font-body text-xs text-stone-500 mb-1">Account email</p>
        <p className="font-body text-lg text-white">{email}</p>
      </div>

      {!showPasswordForm ? (
        <>
          {/* Google OAuth - Primary */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-stone-700/50" />
            <span className="font-body text-stone-500 text-sm">or</span>
            <div className="flex-1 h-px bg-stone-700/50" />
          </div>

          {/* Password option */}
          <button
            onClick={() => setShowPasswordForm(true)}
            className="w-full py-4 rounded-xl font-body text-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-stone-800 text-stone-300 border border-stone-700 hover:border-stone-600 hover:text-white"
          >
            Create a password instead
          </button>
        </>
      ) : (
        <>
          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-body text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Password field */}
            <div>
              <label className="font-body text-sm text-stone-500 block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-body w-full px-4 py-3 pr-12 bg-stone-800 border border-stone-700 rounded-xl text-white text-lg placeholder-stone-500 transition-all duration-200 outline-none focus:border-amber-500/50"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div>
              <label className="font-body text-sm text-stone-500 block mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-body w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white text-lg placeholder-stone-500 transition-all duration-200 outline-none focus:border-amber-500/50"
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Back to OAuth options */}
          <button
            onClick={() => setShowPasswordForm(false)}
            className="w-full font-body text-stone-500 hover:text-white text-base transition-colors"
          >
            ← Back to sign in options
          </button>
        </>
      )}

      {/* Back Button - Consistent */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl font-body text-base font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
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
    <div className="space-y-8 text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center"
        style={{ border: '3px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)' }}
      >
        {status === 'ready' ? (
          <svg className="w-14 h-14 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        )}
      </motion.div>

      <div>
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
          {status === 'ready' ? `Welcome, ${practiceName}!` : statusMessages[status]}
        </h2>
        <p className="font-body text-stone-400 text-lg sm:text-xl">
          {status === 'ready' ? 'Your practice dashboard is ready.' : 'This usually takes less than a minute.'}
        </p>
      </div>

      {status !== 'ready' && (
        <div className="max-w-sm mx-auto">
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-12 py-4 rounded-2xl font-body text-xl font-semibold bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10 transition-all"
          >
            Go to Dashboard →
          </motion.button>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 max-w-md mx-auto"
          >
            <div className="p-5 rounded-2xl bg-stone-800/50 border border-stone-700/50">
              <p className="font-body text-stone-300 text-base italic leading-relaxed">
                "I finally know what's happening in my practice without digging through spreadsheets."
              </p>
              <p className="font-body text-stone-500 text-sm mt-3">
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

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep0Complete = () => {
    // Transfer form data to onboarding data
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
    // Simulate connection (in real app: webhook/polling)
    setTimeout(() => {
      setData(prev => ({ ...prev, connectionStatus: 'connected' }));
      setCurrentStep(4); // Go to Payment step
    }, 3000);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  // Get EHR name for display
  const getEhrName = () => {
    const ehr = EHR_OPTIONS.find(e => e.id === data.selectedEhr);
    return ehr?.name || 'your EHR';
  };

  // Step labels change based on whether we collect password in signup
  // When COLLECT_PASSWORD_IN_SIGNUP is true:
  //   Steps: 0=Start, 1=EHR, 2=Legal, 3=Connect, 4=Subscribe, 5=Complete (6 steps)
  // When COLLECT_PASSWORD_IN_SIGNUP is false:
  //   Steps: 0=Start, 1=EHR, 2=Legal, 3=Connect, 4=Subscribe, 5=Account, 6=Complete (7 steps)
  const stepLabels = COLLECT_PASSWORD_IN_SIGNUP
    ? ['Get Started', 'Select EHR', 'Legal', 'Connect EHR', 'Subscribe', 'Complete']
    : ['Get Started', 'Select EHR', 'Legal', 'Connect EHR', 'Subscribe', 'Create Account', 'Complete'];

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
            {stepLabels[currentStep]}
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - Onboarding Content (50% width) */}
      <div className="w-full lg:w-1/2 h-full relative flex flex-col bg-stone-900">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800/50 to-stone-900" />
        <div className="absolute top-0 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)' }} />

        {/* Header - fixed height, doesn't scroll */}
        <header className="relative z-10 px-6 sm:px-10 py-4 sm:py-6 flex items-center justify-between border-b border-stone-800/50 flex-shrink-0">
          <h1 className="font-display text-2xl sm:text-3xl text-white">Cortexa</h1>
          <ProgressIndicator currentStep={currentStep} totalSteps={stepLabels.length} />
        </header>

        {/* Content - scrollable area */}
        <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-lg mx-auto px-6 sm:px-10 py-6 sm:py-8 pb-8 sm:pb-12">
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
        </main>

        {/* Footer - fixed height, doesn't scroll */}
        <footer className="relative z-10 px-6 sm:px-10 py-4 sm:py-5 text-center border-t border-stone-800/50 flex-shrink-0">
          <p className="font-body text-stone-500 text-sm sm:text-base">
            Questions? support@usecortexa.com
          </p>
        </footer>
      </div>
    </div>
  );
};
