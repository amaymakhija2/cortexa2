import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FallingLinesCanvas } from './FallingLinesCanvas';

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

interface OnboardingWizardProps {
  initialData: {
    name: string;
    email: string;
    practiceName: string;
    phone: string;
    role: string;
  };
  onComplete: () => void;
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

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
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
            ) : (
              step.num
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${currentStep > step.num ? 'bg-amber-500' : 'bg-stone-700'}`} />
          )}
        </React.Fragment>
      ))}
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
}> = ({ selectedEhr, onSelect, onContinue }) => {
  const popularEhrs = EHR_OPTIONS.filter(e => e.popular);
  const otherEhrs = EHR_OPTIONS.filter(e => !e.popular);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-4xl text-white mb-3">Which EHR do you use?</h2>
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
        <h2 className="font-display text-4xl text-white mb-4">Quick legal stuff</h2>
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

      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-4 rounded-2xl font-body text-lg font-medium text-stone-400 hover:text-white transition-colors">
          Back
        </button>
        <motion.button
          onClick={onContinue}
          disabled={!canContinue}
          whileHover={canContinue ? { scale: 1.01 } : {}}
          whileTap={canContinue ? { scale: 0.99 } : {}}
          className={`flex-1 py-4 rounded-2xl font-body text-lg font-semibold transition-all duration-300 ${canContinue ? 'bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}`}
        >
          I Agree & Continue
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================================
// COPY FIELD COMPONENT - Large, readable copy-to-clipboard field
// ============================================================================

const CopyField: React.FC<{
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  highlight?: boolean;
}> = ({ label, value, copied, onCopy, highlight = false }) => (
  <div className="flex items-center gap-4">
    <div className="flex-1">
      <p className="font-body text-sm text-stone-500 uppercase tracking-wider font-medium mb-2">{label}</p>
      <div className={`px-4 py-3 rounded-xl ${highlight ? 'bg-amber-500/10 border-2 border-amber-500/40' : 'bg-stone-800 border border-stone-700'}`}>
        <p className={`font-mono text-lg ${highlight ? 'text-amber-400' : 'text-stone-200'}`}>{value}</p>
      </div>
    </div>
    <motion.button
      onClick={onCopy}
      whileTap={{ scale: 0.95 }}
      className={`
        mt-7 px-5 py-3 rounded-xl font-body text-base font-semibold transition-all duration-200
        ${copied
          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40'
          : 'bg-amber-500 text-stone-900 hover:bg-amber-400'}
      `}
    >
      {copied ? 'Copied!' : 'Copy'}
    </motion.button>
  </div>
);

// ============================================================================
// STEP 3: CONNECT EHR - Clear explanation + guided clipboard flow
// ============================================================================

const StepConnectEhr: React.FC<{
  generatedEmail: string;
  selectedEhr: string;
  connectionStatus: 'pending' | 'waiting' | 'connected';
  onStartWaiting: () => void;
  onBack: () => void;
}> = ({ generatedEmail, selectedEhr, connectionStatus, onStartWaiting, onBack }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasOpenedEhr, setHasOpenedEhr] = useState(false);
  const ehrName = EHR_OPTIONS.find(e => e.id === selectedEhr)?.name || 'your EHR';
  const ehrUrl = EHR_TEAM_MEMBER_URLS[selectedEhr] || '#';

  const copyValues = {
    firstName: 'Cortexa',
    lastName: 'Biller',
    email: generatedEmail,
  };

  const handleCopy = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenEhr = () => {
    window.open(ehrUrl, '_blank');
    setHasOpenedEhr(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with clear explanation */}
      <div>
        <h2 className="font-display text-4xl text-white mb-3">Connect {ehrName}</h2>
        <p className="font-body text-stone-300 text-lg leading-relaxed">
          Create a <span className="text-amber-400 font-medium">Biller account</span> in {ehrName} using these details.
          This gives Cortexa read-only access — we can never modify your data.
        </p>
      </div>

      {/* Copy Fields - Individual copy buttons */}
      <div className="p-5 rounded-2xl bg-stone-800/50 border border-stone-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-stone-500 mb-1">First Name</p>
            <p className="font-body text-xl text-white font-medium">{copyValues.firstName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('firstName', copyValues.firstName)}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all ${
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
            <p className="font-body text-sm text-stone-500 mb-1">Last Name</p>
            <p className="font-body text-xl text-white font-medium">{copyValues.lastName}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('lastName', copyValues.lastName)}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all ${
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
            <p className="font-body text-sm text-stone-500 mb-1">Email</p>
            <p className="font-mono text-lg text-amber-400 font-medium">{copyValues.email}</p>
          </div>
          <motion.button
            onClick={() => handleCopy('email', copyValues.email)}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all ${
              copiedField === 'email'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500 text-stone-900 hover:bg-amber-400'
            }`}
          >
            {copiedField === 'email' ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
      </div>

      {/* Instructions + Trust Signals Combined */}
      <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
        <p className="font-body text-stone-300 text-base leading-relaxed mb-3">
          In {ehrName}: <span className="text-white font-medium">Settings → Team Members → Add New</span>.
          Select <span className="text-white font-medium">"Biller"</span> as the role. <span className="text-stone-400">No permissions required — leave all unchecked.</span>
        </p>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-body text-sm text-stone-400">Read-only</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-body text-sm text-stone-400">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-body text-sm text-stone-400">Encrypted</span>
          </div>
        </div>
      </div>

      {/* Open EHR Button */}
      <motion.button
        onClick={handleOpenEhr}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2
          ${hasOpenedEhr
            ? 'bg-stone-800 text-stone-300 border border-stone-700'
            : 'bg-white text-stone-900 hover:shadow-lg hover:shadow-white/10'}
        `}
      >
        {hasOpenedEhr ? (
          <>
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Open {ehrName} Again
          </>
        ) : (
          <>
            Open {ehrName}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </>
        )}
      </motion.button>

      {/* Status */}
      {connectionStatus === 'waiting' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3"
        >
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-amber-400 text-lg">Checking for connection...</p>
        </motion.div>
      )}

      {/* Bottom Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl font-body text-lg font-medium text-stone-500 hover:text-white transition-colors"
        >
          Back
        </button>
        <motion.button
          onClick={onStartWaiting}
          disabled={connectionStatus === 'waiting'}
          whileHover={connectionStatus !== 'waiting' ? { scale: 1.01 } : {}}
          whileTap={connectionStatus !== 'waiting' ? { scale: 0.99 } : {}}
          className={`
            flex-1 py-4 rounded-xl font-body text-lg font-semibold transition-all duration-300
            ${connectionStatus === 'waiting'
              ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
              : 'bg-amber-500 text-stone-900 hover:bg-amber-400'}
          `}
        >
          {connectionStatus === 'waiting' ? 'Checking...' : "I've Added the Biller"}
        </motion.button>
      </div>

      {/* Help Options */}
      <div className="flex items-center justify-center gap-4">
        <span className="font-body text-stone-400 text-base">Need help?</span>
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
    </div>
  );
};

// ============================================================================
// STEP 4: CONNECTED
// ============================================================================

const StepConnected: React.FC<{
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
        <h2 className="font-display text-4xl text-white mb-3">
          {status === 'ready' ? `Welcome, ${practiceName}!` : statusMessages[status]}
        </h2>
        <p className="font-body text-stone-400 text-xl">
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

          {/* Social proof - reinforces they made the right choice */}
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
// MAIN WIZARD COMPONENT
// ============================================================================

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ initialData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    ...initialData,
    selectedEhr: null,
    agreedToTerms: false,
    agreedToBaa: false,
    generatedEmail: generateEmailFromPractice(initialData.practiceName),
    connectionStatus: 'pending',
  });

  const handleSelectEhr = (ehrId: string) => setData(prev => ({ ...prev, selectedEhr: ehrId }));
  const handleToggleTerms = () => setData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }));
  const handleToggleBaa = () => setData(prev => ({ ...prev, agreedToBaa: !prev.agreedToBaa }));

  const handleStartWaiting = () => {
    setData(prev => ({ ...prev, connectionStatus: 'waiting' }));
    // Simulate connection (in real app: webhook/polling)
    setTimeout(() => {
      setData(prev => ({ ...prev, connectionStatus: 'connected' }));
      setCurrentStep(4);
    }, 3000);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Styles */}
      <style>{`
        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
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
            Step {currentStep} of 4
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - Onboarding Content (50% width) */}
      <div className="w-full lg:w-1/2 h-full relative flex flex-col bg-stone-900 overflow-hidden">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800/50 to-stone-900" />
        <div className="absolute top-0 right-0 w-96 h-96 -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)' }} />

        {/* Header */}
        <header className="relative z-10 px-10 py-6 flex items-center justify-between border-b border-stone-800/50">
          <h1 className="font-display text-3xl text-white">Cortexa</h1>
          <ProgressIndicator currentStep={currentStep} />
        </header>

        {/* Content - No scrolling, everything must fit */}
        <main className="relative z-10 flex-1 flex items-center px-10 py-6 overflow-hidden">
          <div className="w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentStep === 1 && (
                  <StepSelectEhr
                    selectedEhr={data.selectedEhr}
                    onSelect={handleSelectEhr}
                    onContinue={() => goToStep(2)}
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
                  <StepConnected
                    practiceName={data.practiceName}
                    onComplete={onComplete}
                  />
                )}
              </motion.div>
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
