import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Shield, Eye, Users, Crown } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, PrimaryButton } from './shared';
import type { UserRole, UserAccess, Clinician } from './shared';
import { canSupervise } from './shared';

// =============================================================================
// INVITE USER SLIDE-OVER - The Formal Invitation
// =============================================================================
// Inviting someone to your practice should feel like writing a formal
// invitation on fine stationery. The slide-over drawer pulls out smoothly,
// revealing cream paper with gold accents.
// =============================================================================

interface InviteUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: Omit<UserAccess, 'id'>) => void;
  clinicians: Clinician[];
}

// Role configuration
const ROLE_CONFIG: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
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
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to practice reports',
    icon: <Eye size={18} />,
    color: INK.muted,
  },
];

export const InviteUserSlideOver: React.FC<InviteUserSlideOverProps> = ({
  isOpen,
  onClose,
  onInvite,
  clinicians,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [revenueAccess, setRevenueAccess] = useState(false);
  const [superviseeIds, setSuperviseeIds] = useState<string[]>([]);

  // Reset form
  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('viewer');
    setRevenueAccess(false);
    setSuperviseeIds([]);
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;

    onInvite({
      name: name.trim(),
      email: email.trim(),
      role,
      revenueAccess,
      superviseeIds: role === 'supervisor' ? superviseeIds : [],
      status: 'pending',
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get available supervisees
  const availableSupervisees = clinicians.filter((c) => c.isActive);

  // Check if form is valid
  const isValid = name.trim().length > 0 && email.trim().includes('@');

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
            style={{ backgroundColor: 'rgba(26, 24, 21, 0.4)', backdropFilter: 'blur(4px)' }}
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
            {/* Header - like letterhead */}
            <div
              className="flex items-center justify-between px-8 py-6"
              style={{ borderBottom: `1px solid ${INK.rule}` }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 24,
                    color: INK.black,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Invite User
                </h2>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    color: INK.faded,
                  }}
                >
                  Send an invitation to join your practice
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.05, backgroundColor: INK.cream }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-colors"
                style={{ color: INK.muted }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form - cream paper feel */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="space-y-8">
                {/* Name */}
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Sarah Chen"
                    className="w-full transition-all duration-200 outline-none"
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 18,
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
                    placeholder="sarah@practice.com"
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

                {/* Role - like wax seal selection */}
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
                    {ROLE_CONFIG.map((roleOpt) => (
                      <motion.label
                        key={roleOpt.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          border: `2px solid ${role === roleOpt.value ? roleOpt.color : INK.rule}`,
                          backgroundColor: role === roleOpt.value ? roleOpt.color + '08' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={roleOpt.value}
                          checked={role === roleOpt.value}
                          onChange={() => setRole(roleOpt.value)}
                          className="sr-only"
                        />
                        {/* Seal icon */}
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
                    ))}
                  </div>
                </div>

                {/* Supervisees (if supervisor role) */}
                <AnimatePresence>
                  {role === 'supervisor' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
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
                        Supervises
                      </label>
                      <div
                        className="p-4 rounded-xl max-h-48 overflow-y-auto"
                        style={{
                          backgroundColor: INK.cream,
                          border: `1px solid ${INK.rule}`,
                        }}
                      >
                        {availableSupervisees.length > 0 ? (
                          <div className="space-y-2">
                            {availableSupervisees.map((c) => (
                              <label
                                key={c.id}
                                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white"
                              >
                                <input
                                  type="checkbox"
                                  checked={superviseeIds.includes(c.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSuperviseeIds([...superviseeIds, c.id]);
                                    } else {
                                      setSuperviseeIds(superviseeIds.filter((id) => id !== c.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded"
                                  style={{ accentColor: INK.emerald }}
                                />
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
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 13,
                              color: INK.faded,
                            }}
                          >
                            No active clinicians to supervise
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Revenue Access - gold toggle */}
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
            </div>

            {/* Footer - send the invitation */}
            <div
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteUserSlideOver;
