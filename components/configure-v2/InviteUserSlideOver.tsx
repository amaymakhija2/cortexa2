import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ArrowLeft,
  Check,
  Stethoscope,
  Briefcase,
  Globe,
  Users,
  UserCheck,
  User,
  ChevronRight,
} from 'lucide-react';
import { FONT, INK, TogglePill } from './shared';
import { ClinicianPicker } from './ClinicianPicker';
import { CustomAccessModal } from './CustomAccessModal';
import type { UserAccess, UserType, AccessScope, Clinician } from './shared';

// =============================================================================
// INVITE USER SLIDE-OVER
// =============================================================================

interface InviteUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: Omit<UserAccess, 'id'>) => void;
  clinicians: Clinician[];
  existingUserClinicianIds: string[];
}

type Step = 'choose-type' | 'clinician-select' | 'staff-details' | 'configure-access';

const STAFF_ROLES = [
  'Office Manager',
  'Practice Administrator',
  'Billing Coordinator',
  'Front Desk',
  'Operations',
  'Other',
];

const SCOPE_CONFIG: {
  value: AccessScope;
  label: string;
  description: string;
  icon: React.ReactNode;
  clinicianOnly?: boolean;
}[] = [
  {
    value: 'fullPractice',
    label: 'Full Practice',
    description: 'See all clinicians and practice-level dashboards',
    icon: <Globe size={20} />,
  },
  {
    value: 'theirTeam',
    label: 'Their Team',
    description: 'See themselves and anyone they supervise',
    icon: <Users size={20} />,
    clinicianOnly: true,
  },
  {
    value: 'custom',
    label: 'Custom Selection',
    description: 'Choose specific clinicians they can view',
    icon: <UserCheck size={20} />,
  },
  {
    value: 'selfOnly',
    label: 'Self Only',
    description: 'Only see their own performance data',
    icon: <User size={20} />,
    clinicianOnly: true,
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const InviteUserSlideOver: React.FC<InviteUserSlideOverProps> = ({
  isOpen,
  onClose,
  onInvite,
  clinicians,
  existingUserClinicianIds,
}) => {
  const [step, setStep] = useState<Step>('choose-type');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [scope, setScope] = useState<AccessScope>('selfOnly');
  const [revenueAccess, setRevenueAccess] = useState(false);
  const [clientDetailsAccess, setClientDetailsAccess] = useState(true);
  const [customClinicianIds, setCustomClinicianIds] = useState<string[]>([]);
  const [customGroupIds, setCustomGroupIds] = useState<string[]>([]);
  const [showCustomAccessModal, setShowCustomAccessModal] = useState(false);

  const selectedClinician = useMemo(() => {
    if (!selectedClinicianId) return null;
    return clinicians.find((c) => c.id === selectedClinicianId) || null;
  }, [selectedClinicianId, clinicians]);

  const handleClose = () => {
    setStep('choose-type');
    setUserType(null);
    setSelectedClinicianId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('');
    setScope('selfOnly');
    setRevenueAccess(false);
    setClientDetailsAccess(true);
    setCustomClinicianIds([]);
    setCustomGroupIds([]);
    setShowCustomAccessModal(false);
    onClose();
  };

  const handleTypeSelect = (type: UserType) => {
    setUserType(type);
    setScope(type === 'clinician' ? 'selfOnly' : 'fullPractice');
  };

  const handleContinue = () => {
    if (step === 'choose-type') {
      setStep(userType === 'clinician' ? 'clinician-select' : 'staff-details');
    } else if (step === 'clinician-select' || step === 'staff-details') {
      setStep('configure-access');
    }
  };

  const handleBack = () => {
    if (step === 'clinician-select' || step === 'staff-details') {
      setStep('choose-type');
    } else if (step === 'configure-access') {
      setStep(userType === 'clinician' ? 'clinician-select' : 'staff-details');
    }
  };

  const handleSubmit = () => {
    const baseUser: Omit<UserAccess, 'id'> = {
      name: userType === 'clinician' ? selectedClinician?.name || '' : staffName,
      email: userType === 'clinician' ? selectedClinician?.email || '' : staffEmail,
      type: userType!,
      scope,
      revenueAccess,
      clientDetailsAccess,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      ...(userType === 'clinician' && { clinicianId: selectedClinicianId! }),
      ...(userType === 'staff' && staffRole && { staffRole }),
      ...(scope === 'custom' && { customClinicianIds, customGroupIds }),
    };
    onInvite(baseUser);
    handleClose();
  };

  const canContinue = useMemo(() => {
    if (step === 'choose-type') return userType !== null;
    if (step === 'clinician-select') return selectedClinicianId !== null;
    if (step === 'staff-details') return staffName.trim() && staffEmail.includes('@');
    return true;
  }, [step, userType, selectedClinicianId, staffName, staffEmail]);

  const canSubmit = useMemo(() => {
    if (scope === 'custom' && customClinicianIds.length === 0 && customGroupIds.length === 0) return false;
    return true;
  }, [scope, customClinicianIds, customGroupIds]);

  const availableScopes = useMemo(() => {
    if (userType === 'staff') {
      return SCOPE_CONFIG.filter((s) => !s.clinicianOnly);
    }
    return SCOPE_CONFIG;
  }, [userType]);

  const stepNumber = step === 'choose-type' ? 1 : step === 'configure-access' ? 3 : 2;

  const stepContent = useMemo(() => {
    switch (step) {
      case 'choose-type':
        return { title: 'Invite User', subtitle: 'Who are you inviting?' };
      case 'clinician-select':
        return { title: 'Select Clinician', subtitle: 'Link to a clinical profile' };
      case 'staff-details':
        return { title: 'Staff Details', subtitle: 'Enter their information' };
      case 'configure-access':
        const name = selectedClinician?.name || staffName;
        return { title: 'Configure Access', subtitle: name ? `For ${name}` : 'Set their permissions' };
      default:
        return { title: 'Invite User', subtitle: '' };
    }
  }, [step, selectedClinician, staffName]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(26, 24, 21, 0.5)' }}
          />

          {/* Panel - wider for better readability */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 flex flex-col"
            style={{
              backgroundColor: INK.paper,
              boxShadow: '-12px 0 48px rgba(26, 24, 21, 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6"
              style={{ borderBottom: `1px solid ${INK.rule}` }}
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={step !== 'choose-type' ? handleBack : undefined}
                  className="p-2 -ml-2 rounded-xl"
                  style={{
                    color: INK.muted,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: step !== 'choose-type' ? 'pointer' : 'default',
                    opacity: step !== 'choose-type' ? 1 : 0,
                    pointerEvents: step !== 'choose-type' ? 'auto' : 'none',
                  }}
                  whileHover={step !== 'choose-type' ? { backgroundColor: INK.cream } : {}}
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div>
                  <h2
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 24,
                      color: INK.black,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {stepContent.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 14,
                      color: INK.muted,
                      marginTop: 2,
                    }}
                  >
                    {stepContent.subtitle}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleClose}
                className="p-2.5 rounded-xl"
                style={{
                  color: INK.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ backgroundColor: INK.cream }}
              >
                <X size={22} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Choose Type */}
                {step === 'choose-type' && (
                  <motion.div
                    key="choose-type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="space-y-4">
                      {/* Clinician option */}
                      <motion.button
                        onClick={() => handleTypeSelect('clinician')}
                        className="w-full flex items-start gap-5 p-6 rounded-2xl text-left"
                        style={{
                          backgroundColor: userType === 'clinician' ? INK.goldGlow : 'transparent',
                          border: `2px solid ${userType === 'clinician' ? INK.gold : INK.rule}`,
                          cursor: 'pointer',
                        }}
                        whileHover={{ backgroundColor: userType === 'clinician' ? INK.goldGlow : INK.cream }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: userType === 'clinician' ? INK.gold : INK.cream,
                            color: userType === 'clinician' ? 'white' : INK.muted,
                          }}
                        >
                          <Stethoscope size={26} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div
                            style={{
                              fontFamily: FONT.serif,
                              fontSize: 19,
                              color: INK.black,
                              marginBottom: 4,
                            }}
                          >
                            Clinician
                          </div>
                          <div
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 14,
                              color: INK.muted,
                              lineHeight: 1.5,
                            }}
                          >
                            Link to an existing clinician profile. They'll see their own performance data and goals.
                          </div>
                        </div>
                        {userType === 'clinician' && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: INK.gold }}
                          >
                            <Check size={16} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </motion.button>

                      {/* Staff option */}
                      <motion.button
                        onClick={() => handleTypeSelect('staff')}
                        className="w-full flex items-start gap-5 p-6 rounded-2xl text-left"
                        style={{
                          backgroundColor: userType === 'staff' ? INK.goldGlow : 'transparent',
                          border: `2px solid ${userType === 'staff' ? INK.gold : INK.rule}`,
                          cursor: 'pointer',
                        }}
                        whileHover={{ backgroundColor: userType === 'staff' ? INK.goldGlow : INK.cream }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: userType === 'staff' ? INK.gold : INK.cream,
                            color: userType === 'staff' ? 'white' : INK.muted,
                          }}
                        >
                          <Briefcase size={26} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div
                            style={{
                              fontFamily: FONT.serif,
                              fontSize: 19,
                              color: INK.black,
                              marginBottom: 4,
                            }}
                          >
                            Staff Member
                          </div>
                          <div
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 14,
                              color: INK.muted,
                              lineHeight: 1.5,
                            }}
                          >
                            Office managers, billers, or admins who need practice oversight without a clinical profile.
                          </div>
                        </div>
                        {userType === 'staff' && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: INK.gold }}
                          >
                            <Check size={16} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2a: Clinician Select */}
                {step === 'clinician-select' && (
                  <motion.div
                    key="clinician-select"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ClinicianPicker
                      clinicians={clinicians}
                      selectedId={selectedClinicianId}
                      onSelect={setSelectedClinicianId}
                      excludeIds={existingUserClinicianIds}
                      emptyMessage="All clinicians have accounts"
                    />
                  </motion.div>
                )}

                {/* Step 2b: Staff Details */}
                {step === 'staff-details' && (
                  <motion.div
                    key="staff-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="space-y-6">
                      <div>
                        <label
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 13,
                            fontWeight: 600,
                            color: INK.muted,
                            display: 'block',
                            marginBottom: 8,
                          }}
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          placeholder="Jane Smith"
                          className="w-full px-4 py-3.5 rounded-xl outline-none"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 16,
                            color: INK.body,
                            backgroundColor: 'transparent',
                            border: `1.5px solid ${INK.rule}`,
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 13,
                            fontWeight: 600,
                            color: INK.muted,
                            display: 'block',
                            marginBottom: 8,
                          }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          placeholder="jane@practice.com"
                          className="w-full px-4 py-3.5 rounded-xl outline-none"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 16,
                            color: INK.body,
                            backgroundColor: 'transparent',
                            border: `1.5px solid ${INK.rule}`,
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 13,
                            fontWeight: 600,
                            color: INK.muted,
                            display: 'block',
                            marginBottom: 10,
                          }}
                        >
                          Role (optional)
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {STAFF_ROLES.map((r) => (
                            <button
                              key={r}
                              onClick={() => setStaffRole(r === staffRole ? '' : r)}
                              className="px-4 py-2.5 rounded-full"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                color: staffRole === r ? INK.gold : INK.muted,
                                backgroundColor: staffRole === r ? INK.goldGlow : INK.cream,
                                border: `1.5px solid ${staffRole === r ? INK.gold : 'transparent'}`,
                                cursor: 'pointer',
                              }}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
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
                  >
                    {/* Scope */}
                    <div className="mb-8">
                      <h4
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: INK.muted,
                          marginBottom: 12,
                        }}
                      >
                        Who can they see?
                      </h4>
                      <div className="space-y-3">
                        {availableScopes.map((config) => (
                          <motion.button
                            key={config.value}
                            onClick={() => {
                              setScope(config.value);
                              if (config.value === 'custom') {
                                setShowCustomAccessModal(true);
                              }
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl text-left"
                            style={{
                              backgroundColor: scope === config.value ? INK.goldGlow : 'transparent',
                              border: `1.5px solid ${scope === config.value ? INK.gold : INK.rule}`,
                              cursor: 'pointer',
                            }}
                            whileHover={{ backgroundColor: scope === config.value ? INK.goldGlow : INK.cream }}
                          >
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: scope === config.value ? INK.gold : INK.cream,
                                color: scope === config.value ? 'white' : INK.muted,
                              }}
                            >
                              {config.icon}
                            </div>
                            <div className="flex-1">
                              <div
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 15,
                                  fontWeight: 500,
                                  color: INK.black,
                                }}
                              >
                                {config.label}
                              </div>
                              <div
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 13,
                                  color: INK.muted,
                                  marginTop: 2,
                                }}
                              >
                                {config.description}
                              </div>
                            </div>
                            {scope === config.value && (
                              <Check size={18} style={{ color: INK.gold, flexShrink: 0 }} />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Custom access summary */}
                    {scope === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                      >
                        <button
                          onClick={() => setShowCustomAccessModal(true)}
                          className="w-full flex items-center justify-between p-5 rounded-xl text-left"
                          style={{
                            backgroundColor: INK.cream,
                            border: `1px dashed ${INK.rule}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 15,
                                fontWeight: 500,
                                color: INK.black,
                                marginBottom: 4,
                              }}
                            >
                              {customGroupIds.length === 0 && customClinicianIds.length === 0
                                ? 'No selections yet'
                                : [
                                    customGroupIds.length > 0 &&
                                      `${customGroupIds.length} ${customGroupIds.length === 1 ? 'team' : 'teams'}`,
                                    customClinicianIds.length > 0 &&
                                      `${customClinicianIds.length} ${customClinicianIds.length === 1 ? 'individual' : 'individuals'}`,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                              }}
                            >
                              {customGroupIds.length === 0 && customClinicianIds.length === 0
                                ? 'Tap to select teams or individuals'
                                : 'Tap to edit selection'}
                            </div>
                          </div>
                          <ChevronRight size={20} style={{ color: INK.muted }} />
                        </button>
                      </motion.div>
                    )}

                    {/* Permissions */}
                    <div>
                      <h4
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: INK.muted,
                          marginBottom: 12,
                        }}
                      >
                        Data Permissions
                      </h4>
                      <div className="space-y-4">
                        <div
                          className="flex items-center justify-between p-5 rounded-xl"
                          style={{ backgroundColor: INK.cream }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 15,
                                fontWeight: 500,
                                color: INK.black,
                              }}
                            >
                              Revenue Access
                            </div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                                marginTop: 2,
                              }}
                            >
                              Can see dollar amounts and financial data
                            </div>
                          </div>
                          <TogglePill
                            active={revenueAccess}
                            onChange={setRevenueAccess}
                            activeLabel="Yes"
                            inactiveLabel="No"
                          />
                        </div>
                        <div
                          className="flex items-center justify-between p-5 rounded-xl"
                          style={{ backgroundColor: INK.cream }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 15,
                                fontWeight: 500,
                                color: INK.black,
                              }}
                            >
                              Client Details
                            </div>
                            <div
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                                marginTop: 2,
                              }}
                            >
                              Can see client names and PHI
                            </div>
                          </div>
                          <TogglePill
                            active={clientDetailsAccess}
                            onChange={setClientDetailsAccess}
                            activeLabel="Yes"
                            inactiveLabel="No"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-5 flex items-center justify-between"
              style={{ borderTop: `1px solid ${INK.rule}` }}
            >
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 15,
                  color: INK.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {step === 'configure-access' ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'white',
                    background: canSubmit
                      ? `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`
                      : INK.ghost,
                    border: 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 4px 16px rgba(4, 120, 87, 0.35)' : 'none',
                  }}
                  whileHover={canSubmit ? { scale: 1.02 } : {}}
                  whileTap={canSubmit ? { scale: 0.98 } : {}}
                >
                  <Send size={18} />
                  Send Invitation
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'white',
                    background: canContinue
                      ? `linear-gradient(135deg, ${INK.gold} 0%, #a78419 100%)`
                      : INK.ghost,
                    border: 'none',
                    cursor: canContinue ? 'pointer' : 'not-allowed',
                    boxShadow: canContinue ? '0 4px 16px rgba(201, 162, 39, 0.35)' : 'none',
                  }}
                  whileHover={canContinue ? { scale: 1.02 } : {}}
                  whileTap={canContinue ? { scale: 0.98 } : {}}
                >
                  Continue
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Custom Access Modal */}
          <CustomAccessModal
            isOpen={showCustomAccessModal}
            onClose={() => setShowCustomAccessModal(false)}
            onApply={(groupIds, clinicianIds) => {
              setCustomGroupIds(groupIds);
              setCustomClinicianIds(clinicianIds);
            }}
            clinicians={clinicians}
            initialGroupIds={customGroupIds}
            initialClinicianIds={customClinicianIds}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteUserSlideOver;
