import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Shield, Eye, Users, User, Briefcase, ArrowLeft, Check, Search } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, PrimaryButton, deriveSuperviseesForUser } from './shared';
import type { UserRole, UserAccess, Clinician } from './shared';
import { canSupervise } from './shared';

// =============================================================================
// INVITE USER SLIDE-OVER - The Formal Invitation
// =============================================================================
// A two-path flow: invite a clinician (linked to their record) or an
// admin-only user. The design feels like choosing between two elegant
// options on fine stationery - deliberate, refined, decisive.
// =============================================================================

interface InviteUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: Omit<UserAccess, 'id'>) => void;
  clinicians: Clinician[];
  existingUserClinicianIds: string[]; // Clinicians already linked to users
}

type InviteStep = 'choose-type' | 'select-clinician' | 'configure-access';
type UserType = 'clinician' | 'admin-only' | null;

// Role configuration
const ROLE_CONFIG: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  forClinicianOnly?: boolean;
}[] = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full access to all features and settings',
    icon: <Shield size={18} />,
    color: INK.violet,
  },
  {
    value: 'supervisor',
    label: 'Supervisor',
    description: 'See supervisees data and practice aggregates',
    icon: <Users size={18} />,
    color: INK.emerald,
    forClinicianOnly: true,
  },
  {
    value: 'selfOnly',
    label: 'Self Only',
    description: 'Can only view their own data',
    icon: <Eye size={18} />,
    color: INK.muted,
  },
];

export const InviteUserSlideOver: React.FC<InviteUserSlideOverProps> = ({
  isOpen,
  onClose,
  onInvite,
  clinicians,
  existingUserClinicianIds = [],
}) => {
  // Flow state
  const [step, setStep] = useState<InviteStep>('choose-type');
  const [userType, setUserType] = useState<UserType>(null);

  // Selected clinician (if clinician path)
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('selfOnly');
  const [revenueAccess, setRevenueAccess] = useState(false);

  // Reset form
  const resetForm = () => {
    setStep('choose-type');
    setUserType(null);
    setSelectedClinician(null);
    setShowInactive(false);
    setSearchQuery('');
    setName('');
    setEmail('');
    setRole('selfOnly');
    setRevenueAccess(false);
  };

  // Filter clinicians for selection
  const availableClinicians = useMemo(() => {
    let filtered = clinicians.filter(c => {
      // Exclude already-linked clinicians
      if (existingUserClinicianIds.includes(c.id)) return false;
      // Filter by active status
      if (!showInactive && !c.isActive) return false;
      return true;
    });

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.licenseType.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [clinicians, existingUserClinicianIds, showInactive, searchQuery]);

  // Get derived supervisees for selected clinician
  const derivedSupervisees = useMemo(() => {
    if (!selectedClinician) return [];
    // Find clinicians where this person is their supervisor
    return clinicians.filter(c => c.supervisorId === selectedClinician.id && c.isActive);
  }, [selectedClinician, clinicians]);

  // Check if selected clinician can be a supervisor
  const canBeSupervisor = selectedClinician && canSupervise(selectedClinician.role);

  // Auto-suggest role based on clinician's clinical role
  const handleSelectClinician = (clinician: Clinician) => {
    setSelectedClinician(clinician);
    setName(clinician.name);
    setEmail(''); // They'll need to enter email

    // Auto-suggest supervisor role if they supervise people
    if (canSupervise(clinician.role)) {
      setRole('supervisor');
    } else {
      setRole('selfOnly');
    }

    setStep('configure-access');
  };

  const handleChooseType = (type: UserType) => {
    setUserType(type);
    if (type === 'clinician') {
      setStep('select-clinician');
    } else {
      setStep('configure-access');
    }
  };

  const handleBack = () => {
    if (step === 'configure-access') {
      if (userType === 'clinician') {
        setStep('select-clinician');
        setSelectedClinician(null);
      } else {
        setStep('choose-type');
      }
    } else if (step === 'select-clinician') {
      setStep('choose-type');
      setUserType(null);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;

    onInvite({
      name: name.trim(),
      email: email.trim(),
      role,
      revenueAccess,
      clinicianId: selectedClinician?.id,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Check if form is valid
  const isValid = name.trim().length > 0 && email.trim().includes('@');

  // Available roles based on user type
  const availableRoles = userType === 'admin-only'
    ? ROLE_CONFIG.filter(r => !r.forClinicianOnly)
    : ROLE_CONFIG;

  // Step titles
  const stepTitles: Record<InviteStep, string> = {
    'choose-type': 'Invite User',
    'select-clinician': 'Select Clinician',
    'configure-access': selectedClinician ? selectedClinician.name : 'New User',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(26, 24, 21, 0.5)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{
              backgroundColor: INK.paper,
              boxShadow: '-8px 0 32px rgba(26, 24, 21, 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6"
              style={{ borderBottom: `1px solid ${INK.rule}` }}
            >
              <div className="flex items-center gap-3">
                {/* Back button */}
                <AnimatePresence mode="wait">
                  {step !== 'choose-type' && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={handleBack}
                      whileHover={{ scale: 1.05, backgroundColor: INK.cream }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-xl transition-colors"
                      style={{ color: INK.muted, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <ArrowLeft size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 22,
                        color: INK.black,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {stepTitles[step]}
                    </motion.h2>
                  </AnimatePresence>
                  <p
                    className="mt-0.5"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: INK.faded,
                    }}
                  >
                    {step === 'choose-type' && 'Send an invitation to join your practice'}
                    {step === 'select-clinician' && 'Choose from your clinical team'}
                    {step === 'configure-access' && 'Configure their access level'}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.05, backgroundColor: INK.cream }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-colors"
                style={{ color: INK.muted, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content - Step-based */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Step 1: Choose Type */}
                {step === 'choose-type' && (
                  <motion.div
                    key="choose-type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="px-8 py-8"
                  >
                    <p
                      className="mb-6"
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 14,
                        color: INK.body,
                        lineHeight: 1.6,
                      }}
                    >
                      Is this person on your clinical team, or are they an administrator who doesn't see clients?
                    </p>

                    <div className="space-y-4">
                      {/* Clinician Option */}
                      <motion.button
                        onClick={() => handleChooseType('clinician')}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-6 rounded-2xl transition-all"
                        style={{
                          backgroundColor: INK.paper,
                          border: `2px solid ${INK.rule}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(26, 24, 21, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = INK.emerald;
                          e.currentTarget.style.backgroundColor = `${INK.emerald}08`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = INK.rule;
                          e.currentTarget.style.backgroundColor = INK.paper;
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: INK.emeraldLight }}
                          >
                            <User size={22} style={{ color: INK.emerald }} />
                          </div>
                          <div className="flex-1">
                            <div
                              style={{
                                fontFamily: FONT.serif,
                                fontSize: 18,
                                color: INK.black,
                                marginBottom: 4,
                              }}
                            >
                              Someone on my clinical team
                            </div>
                            <p
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                                lineHeight: 1.5,
                              }}
                            >
                              Link them to their clinician profile. Their access will automatically follow their supervision relationships.
                            </p>
                          </div>
                        </div>
                      </motion.button>

                      {/* Admin-Only Option */}
                      <motion.button
                        onClick={() => handleChooseType('admin-only')}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-6 rounded-2xl transition-all"
                        style={{
                          backgroundColor: INK.paper,
                          border: `2px solid ${INK.rule}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(26, 24, 21, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = INK.violet;
                          e.currentTarget.style.backgroundColor = `${INK.violet}08`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = INK.rule;
                          e.currentTarget.style.backgroundColor = INK.paper;
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: INK.violetGlow }}
                          >
                            <Briefcase size={22} style={{ color: INK.violet }} />
                          </div>
                          <div className="flex-1">
                            <div
                              style={{
                                fontFamily: FONT.serif,
                                fontSize: 18,
                                color: INK.black,
                                marginBottom: 4,
                              }}
                            >
                              Administrative staff only
                            </div>
                            <p
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                                lineHeight: 1.5,
                              }}
                            >
                              Practice managers, billing staff, or other non-clinical team members who need access to reports.
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Clinician */}
                {step === 'select-clinician' && (
                  <motion.div
                    key="select-clinician"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="px-8 py-6"
                  >
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search
                        size={16}
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: INK.ghost,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search clinicians..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full transition-all duration-200 outline-none"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 14,
                          color: INK.black,
                          padding: '12px 14px 12px 40px',
                          borderRadius: 12,
                          border: `1.5px solid ${INK.rule}`,
                          backgroundColor: INK.cream,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = INK.gold;
                          e.target.style.backgroundColor = INK.paper;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = INK.rule;
                          e.target.style.backgroundColor = INK.cream;
                        }}
                      />
                    </div>

                    {/* Show inactive toggle */}
                    <label
                      className="flex items-center gap-2 mb-5 cursor-pointer"
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 13,
                        color: INK.muted,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: INK.gold }}
                      />
                      Show inactive clinicians
                    </label>

                    {/* Clinician list */}
                    <div className="space-y-2">
                      {availableClinicians.length > 0 ? (
                        availableClinicians.map((clinician, index) => (
                          <motion.button
                            key={clinician.id}
                            onClick={() => handleSelectClinician(clinician)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.01, backgroundColor: INK.cream }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                            style={{
                              backgroundColor: 'transparent',
                              border: `1px solid ${INK.rule}`,
                              cursor: 'pointer',
                              opacity: clinician.isActive ? 1 : 0.5,
                            }}
                          >
                            {/* Avatar */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 12,
                                backgroundColor: clinician.color,
                              }}
                            >
                              {clinician.initials}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div
                                className="truncate"
                                style={{
                                  fontFamily: FONT.serif,
                                  fontSize: 15,
                                  color: INK.black,
                                }}
                              >
                                {clinician.name}
                              </div>
                              <div
                                className="flex items-center gap-2 mt-0.5"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 12,
                                  color: INK.faded,
                                }}
                              >
                                <span>{clinician.licenseType}</span>
                                <span>·</span>
                                <span>{clinician.role}</span>
                              </div>
                            </div>

                            {/* Inactive badge */}
                            {!clinician.isActive && (
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: INK.ghost,
                                  backgroundColor: INK.cream,
                                }}
                              >
                                Inactive
                              </span>
                            )}
                          </motion.button>
                        ))
                      ) : (
                        <div
                          className="py-12 text-center"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 14,
                            color: INK.faded,
                          }}
                        >
                          {searchQuery
                            ? 'No clinicians match your search'
                            : 'All clinicians already have user accounts'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Configure Access */}
                {step === 'configure-access' && (
                  <motion.div
                    key="configure-access"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="px-8 py-8"
                  >
                    <div className="space-y-7">
                      {/* Linked clinician card (if clinician type) */}
                      {selectedClinician && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-2xl"
                          style={{
                            backgroundColor: INK.emeraldLight,
                            border: `1px solid ${INK.emerald}30`,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                backgroundColor: selectedClinician.color,
                                boxShadow: `0 4px 12px ${selectedClinician.color}40`,
                              }}
                            >
                              {selectedClinician.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    fontFamily: FONT.serif,
                                    fontSize: 17,
                                    color: INK.black,
                                  }}
                                >
                                  {selectedClinician.name}
                                </span>
                                <Check size={14} style={{ color: INK.emerald }} />
                              </div>
                              <div
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 12,
                                  color: INK.muted,
                                  marginTop: 2,
                                }}
                              >
                                {selectedClinician.licenseType} · {selectedClinician.role}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Name (editable for admin-only, read-only for clinician) */}
                      <div>
                        <label
                          className="block mb-2"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 12,
                            fontWeight: 600,
                            color: INK.muted,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {selectedClinician ? 'Name' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={selectedClinician ? '' : 'Jane Smith'}
                          readOnly={!!selectedClinician}
                          className="w-full transition-all duration-200 outline-none"
                          style={{
                            fontFamily: FONT.serif,
                            fontSize: 18,
                            color: INK.black,
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: `1.5px solid ${INK.rule}`,
                            backgroundColor: selectedClinician ? INK.cream : 'transparent',
                            cursor: selectedClinician ? 'default' : 'text',
                          }}
                          onFocus={(e) => {
                            if (!selectedClinician) {
                              e.target.style.borderColor = INK.gold;
                              e.target.style.boxShadow = SHADOW.goldFocus;
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = INK.rule;
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          className="block mb-2"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 12,
                            fontWeight: 600,
                            color: INK.muted,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={selectedClinician ? `${selectedClinician.name.split(' ')[0].toLowerCase()}@practice.com` : 'jane@practice.com'}
                          className="w-full transition-all duration-200 outline-none"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 15,
                            color: INK.black,
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: `1.5px solid ${INK.rule}`,
                            backgroundColor: 'transparent',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = INK.gold;
                            e.target.style.boxShadow = SHADOW.goldFocus;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = INK.rule;
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label
                          className="block mb-3"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 12,
                            fontWeight: 600,
                            color: INK.muted,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Access Level
                        </label>
                        <div className="space-y-3">
                          {availableRoles.map((roleOpt) => {
                            // Disable supervisor role if clinician can't supervise
                            const isDisabled = roleOpt.value === 'supervisor' && selectedClinician && !canBeSupervisor;

                            return (
                              <motion.label
                                key={roleOpt.value}
                                whileHover={!isDisabled ? { scale: 1.01 } : undefined}
                                whileTap={!isDisabled ? { scale: 0.99 } : undefined}
                                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                  border: `2px solid ${role === roleOpt.value ? roleOpt.color : INK.rule}`,
                                  backgroundColor: role === roleOpt.value ? roleOpt.color + '08' : 'transparent',
                                  opacity: isDisabled ? 0.4 : 1,
                                }}
                              >
                                <input
                                  type="radio"
                                  name="role"
                                  value={roleOpt.value}
                                  checked={role === roleOpt.value}
                                  onChange={() => !isDisabled && setRole(roleOpt.value)}
                                  disabled={isDisabled}
                                  className="sr-only"
                                />
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: role === roleOpt.value ? roleOpt.color : INK.cream,
                                    color: role === roleOpt.value ? 'white' : INK.faded,
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {roleOpt.icon}
                                </div>
                                <div className="flex-1">
                                  <div
                                    style={{
                                      fontFamily: FONT.sans,
                                      fontSize: 15,
                                      fontWeight: 600,
                                      color: role === roleOpt.value ? INK.black : INK.body,
                                    }}
                                  >
                                    {roleOpt.label}
                                  </div>
                                  <div
                                    className="mt-0.5"
                                    style={{
                                      fontFamily: FONT.sans,
                                      fontSize: 13,
                                      color: INK.faded,
                                    }}
                                  >
                                    {roleOpt.description}
                                  </div>
                                </div>
                              </motion.label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Derived Supervisees (read-only) */}
                      <AnimatePresence>
                        {selectedClinician && role === 'supervisor' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="p-5 rounded-xl"
                              style={{
                                backgroundColor: INK.cream,
                                border: `1px solid ${INK.rule}`,
                              }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <Users size={14} style={{ color: INK.muted }} />
                                <span
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: INK.muted,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Will see data for
                                </span>
                              </div>

                              {derivedSupervisees.length > 0 ? (
                                <div className="space-y-2">
                                  {derivedSupervisees.map((c) => (
                                    <div
                                      key={c.id}
                                      className="flex items-center gap-3"
                                    >
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                        style={{ backgroundColor: c.color }}
                                      >
                                        {c.initials}
                                      </div>
                                      <span
                                        style={{
                                          fontFamily: FONT.sans,
                                          fontSize: 14,
                                          color: INK.body,
                                        }}
                                      >
                                        {c.name}
                                      </span>
                                      <span
                                        style={{
                                          fontFamily: FONT.mono,
                                          fontSize: 11,
                                          color: INK.ghost,
                                        }}
                                      >
                                        {c.licenseType}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 13,
                                    color: INK.faded,
                                    fontStyle: 'italic',
                                  }}
                                >
                                  No supervisees assigned yet
                                </p>
                              )}

                              <p
                                className="mt-4 pt-3"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 12,
                                  color: INK.ghost,
                                  borderTop: `1px dashed ${INK.rule}`,
                                }}
                              >
                                To change this, edit supervision in the Clinicians tab
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Revenue Access */}
                      <div
                        className="flex items-center justify-between p-5 rounded-xl"
                        style={{
                          backgroundColor: INK.cream,
                          border: `1px solid ${INK.rule}`,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 14,
                              fontWeight: 600,
                              color: INK.body,
                            }}
                          >
                            Revenue Access
                          </div>
                          <div
                            className="mt-0.5"
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 12,
                              color: INK.faded,
                            }}
                          >
                            Can view dollar amounts and financial data
                          </div>
                        </div>
                        <motion.button
                          onClick={() => setRevenueAccess(!revenueAccess)}
                          className="relative w-14 h-8 rounded-full transition-colors"
                          style={{
                            backgroundColor: revenueAccess ? INK.gold : INK.rule,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <motion.div
                            className="absolute top-1 w-6 h-6 rounded-full bg-white"
                            animate={{ left: revenueAccess ? 30 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - only show on configure-access step */}
            <AnimatePresence>
              {step === 'configure-access' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-8 py-6"
                  style={{ borderTop: `1px solid ${INK.rule}` }}
                >
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.01 } : undefined}
                    whileTap={isValid ? { scale: 0.99 } : undefined}
                    className="w-full flex items-center justify-center gap-2 transition-all"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 15,
                      fontWeight: 600,
                      color: isValid ? 'white' : INK.ghost,
                      padding: '14px 24px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: isValid ? 'pointer' : 'not-allowed',
                      background: isValid
                        ? `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`
                        : INK.cream,
                      boxShadow: isValid ? '0 4px 16px rgba(4, 120, 87, 0.3)' : 'none',
                    }}
                  >
                    <Send size={18} />
                    Send Invitation
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteUserSlideOver;
