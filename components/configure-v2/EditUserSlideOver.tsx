import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertTriangle, Shield, Eye, Users, Crown, Lock, Trash2, Link2, ExternalLink } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, deriveSuperviseesForUser, canSupervise } from './shared';
import type { UserRole, UserAccess, Clinician } from './shared';

// =============================================================================
// EDIT USER SLIDE-OVER - The Amendment
// =============================================================================
// Editing a user's access is like amending a formal document.
// Changes should feel deliberate, with clear warnings for
// potentially destructive actions (like removing supervisor access).
// Supervision is derived from clinician relationships - read-only here.
// =============================================================================

interface EditUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UserAccess>) => void;
  onDelete?: () => void;
  user: UserAccess | null;
  clinicians: Clinician[];
  onNavigateToClinicians?: () => void;
}

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
    value: 'owner',
    label: 'Owner',
    description: 'Full access to everything (cannot be changed)',
    icon: <Crown size={18} />,
    color: INK.gold,
  },
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

export const EditUserSlideOver: React.FC<EditUserSlideOverProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  user,
  clinicians,
  onNavigateToClinicians,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('selfOnly');
  const [revenueAccess, setRevenueAccess] = useState(false);
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Derive linked clinician and supervisees
  const linkedClinician = useMemo(() => {
    if (!user?.clinicianId) return null;
    return clinicians.find(c => c.id === user.clinicianId) || null;
  }, [user?.clinicianId, clinicians]);

  const derivedSupervisees = useMemo(() => {
    if (!user) return [];
    return deriveSuperviseesForUser(user, clinicians);
  }, [user, clinicians]);

  // Check if linked clinician can supervise
  const canBeSupervisor = linkedClinician && canSupervise(linkedClinician.role);

  // Sync form state with user prop
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setRevenueAccess(user.revenueAccess);
      setShowRoleWarning(false);
      setPendingRole(null);
      setShowDeleteConfirm(false);
    }
  }, [user]);

  const handleRoleChange = (newRole: UserRole) => {
    // If changing FROM supervisor to something else, show warning if they have supervisees
    if (role === 'supervisor' && newRole !== 'supervisor' && derivedSupervisees.length > 0) {
      setPendingRole(newRole);
      setShowRoleWarning(true);
    } else {
      setRole(newRole);
    }
  };

  const confirmRoleChange = () => {
    if (pendingRole) {
      setRole(pendingRole);
      setShowRoleWarning(false);
      setPendingRole(null);
    }
  };

  const cancelRoleChange = () => {
    setShowRoleWarning(false);
    setPendingRole(null);
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;

    onSave({
      name: name.trim(),
      email: email.trim(),
      role,
      revenueAccess,
    });

    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Check if form is valid
  const isValid = name.trim().length > 0 && email.trim().includes('@');
  const isOwner = user?.role === 'owner';
  const isLinkedToClinician = !!linkedClinician;

  // Check if anything changed
  const hasChanges = user && (
    name !== user.name ||
    email !== user.email ||
    role !== user.role ||
    revenueAccess !== user.revenueAccess
  );

  // Available roles based on whether user is linked to clinician
  const availableRoles = isLinkedToClinician
    ? ROLE_CONFIG
    : ROLE_CONFIG.filter(r => !r.forClinicianOnly);

  if (!user) return null;

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
            onClick={onClose}
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
              <div className="flex items-center gap-4">
                {/* User avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    backgroundColor: linkedClinician
                      ? linkedClinician.color
                      : isOwner
                        ? INK.gold
                        : ROLE_CONFIG.find(r => r.value === user.role)?.color || INK.muted,
                  }}
                >
                  {linkedClinician
                    ? linkedClinician.initials
                    : user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 22,
                      color: INK.black,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Edit User
                  </h2>
                  <p
                    className="mt-0.5"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: INK.faded,
                    }}
                  >
                    {user.status === 'pending' ? 'Invitation pending' : 'Active user'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05, backgroundColor: INK.cream }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-colors"
                style={{ color: INK.muted, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="space-y-7">
                {/* Linked clinician card */}
                {linkedClinician && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl"
                    style={{
                      backgroundColor: INK.emeraldLight,
                      border: `1px solid ${INK.emerald}30`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 size={14} style={{ color: INK.emerald }} />
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          color: INK.emerald,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Linked to clinician
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 12,
                          backgroundColor: linkedClinician.color,
                        }}
                      >
                        {linkedClinician.initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: FONT.serif,
                            fontSize: 15,
                            color: INK.black,
                          }}
                        >
                          {linkedClinician.name}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT.mono,
                            fontSize: 11,
                            color: INK.muted,
                          }}
                        >
                          {linkedClinician.licenseType} · {linkedClinician.role}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

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
                    readOnly={isLinkedToClinician}
                    className="w-full transition-all duration-200 outline-none"
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 18,
                      color: INK.black,
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${INK.rule}`,
                      backgroundColor: isLinkedToClinician ? INK.cream : 'transparent',
                      cursor: isLinkedToClinician ? 'default' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!isLinkedToClinician) {
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

                {/* Role */}
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
                      const isCurrentOwner = isOwner && roleOpt.value === 'owner';
                      const isOwnerOption = roleOpt.value === 'owner';
                      const isDisabled = isOwner ? roleOpt.value !== 'owner' : isOwnerOption;
                      // Disable supervisor if clinician can't supervise
                      const isSupervisorDisabled = roleOpt.value === 'supervisor' && isLinkedToClinician && !canBeSupervisor;

                      return (
                        <motion.label
                          key={roleOpt.value}
                          whileHover={!isDisabled && !isSupervisorDisabled ? { scale: 1.01 } : undefined}
                          whileTap={!isDisabled && !isSupervisorDisabled ? { scale: 0.99 } : undefined}
                          className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${
                            isDisabled || isSupervisorDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          style={{
                            border: `2px solid ${role === roleOpt.value ? roleOpt.color : INK.rule}`,
                            backgroundColor: role === roleOpt.value ? roleOpt.color + '08' : 'transparent',
                            opacity: (isDisabled && !isCurrentOwner) || isSupervisorDisabled ? 0.4 : 1,
                          }}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={roleOpt.value}
                            checked={role === roleOpt.value}
                            onChange={() => !isDisabled && !isSupervisorDisabled && handleRoleChange(roleOpt.value)}
                            disabled={isDisabled || isSupervisorDisabled}
                            className="sr-only"
                          />
                          {/* Role icon */}
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
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: role === roleOpt.value ? INK.black : INK.body,
                                }}
                              >
                                {roleOpt.label}
                              </span>
                              {isCurrentOwner && (
                                <Lock size={12} style={{ color: INK.gold }} />
                              )}
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

                {/* Role change warning */}
                <AnimatePresence>
                  {showRoleWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-5 rounded-xl"
                        style={{
                          backgroundColor: INK.amberLight,
                          border: `2px solid ${INK.amber}40`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} style={{ color: INK.amber, flexShrink: 0, marginTop: 2 }} />
                          <div className="flex-1">
                            <h4
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                fontWeight: 600,
                                color: INK.amber,
                              }}
                            >
                              Remove supervisor access?
                            </h4>
                            <p
                              className="mt-1"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.body,
                                lineHeight: 1.5,
                              }}
                            >
                              {user.name} will lose access to individual data for {derivedSupervisees.length} supervisee{derivedSupervisees.length > 1 ? 's' : ''}.
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                              <motion.button
                                onClick={confirmRoleChange}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2 rounded-lg"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: 'white',
                                  backgroundColor: INK.amber,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Yes, remove access
                              </motion.button>
                              <motion.button
                                onClick={cancelRoleChange}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2 rounded-lg"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: INK.body,
                                  backgroundColor: 'transparent',
                                  border: `1px solid ${INK.rule}`,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Derived Supervisees (read-only) - only show for supervisor role */}
                <AnimatePresence>
                  {role === 'supervisor' && isLinkedToClinician && (
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
                            Can see data for
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

                        {/* Link to edit supervision */}
                        {onNavigateToClinicians && (
                          <motion.button
                            onClick={() => {
                              onNavigateToClinicians();
                              onClose();
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="mt-4 flex items-center gap-2 w-full justify-center py-2.5 rounded-lg transition-colors"
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 12,
                              fontWeight: 500,
                              color: INK.muted,
                              backgroundColor: 'transparent',
                              border: `1px dashed ${INK.rule}`,
                              cursor: 'pointer',
                            }}
                          >
                            <ExternalLink size={12} />
                            Edit supervision in Clinicians tab
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Revenue Access */}
                {!isOwner && (
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
                )}

                {/* Owner always has revenue access */}
                {isOwner && (
                  <div
                    className="flex items-center justify-between p-5 rounded-xl"
                    style={{
                      backgroundColor: INK.goldGlow,
                      border: `1px solid ${INK.gold}30`,
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
                        Owner always has full revenue access
                      </div>
                    </div>
                    <Lock size={18} style={{ color: INK.gold }} />
                  </div>
                )}

                {/* Delete user (not for owner) */}
                {!isOwner && onDelete && (
                  <div className="pt-4 border-t" style={{ borderColor: INK.rule }}>
                    <AnimatePresence mode="wait">
                      {showDeleteConfirm ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-5 rounded-xl"
                          style={{
                            backgroundColor: INK.roseLight,
                            border: `2px solid ${INK.rose}40`,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 14,
                              color: INK.rose,
                              fontWeight: 500,
                            }}
                          >
                            Are you sure? This will revoke all access for {user.name}.
                          </p>
                          <div className="flex items-center gap-3 mt-4">
                            <motion.button
                              onClick={handleDelete}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 rounded-lg"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor: INK.rose,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Yes, remove user
                            </motion.button>
                            <motion.button
                              onClick={() => setShowDeleteConfirm(false)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 rounded-lg"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                fontWeight: 600,
                                color: INK.body,
                                backgroundColor: 'transparent',
                                border: `1px solid ${INK.rule}`,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowDeleteConfirm(true)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 14,
                            fontWeight: 500,
                            color: INK.rose,
                            backgroundColor: 'transparent',
                            border: `1px solid ${INK.rose}40`,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={16} />
                          Remove User
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-6"
              style={{ borderTop: `1px solid ${INK.rule}` }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={!isValid || !hasChanges}
                whileHover={isValid && hasChanges ? { scale: 1.01 } : undefined}
                whileTap={isValid && hasChanges ? { scale: 0.99 } : undefined}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 15,
                  fontWeight: 600,
                  color: isValid && hasChanges ? 'white' : INK.ghost,
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: isValid && hasChanges ? 'pointer' : 'not-allowed',
                  background: isValid && hasChanges
                    ? `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`
                    : INK.cream,
                  boxShadow: isValid && hasChanges ? '0 4px 16px rgba(4, 120, 87, 0.3)' : 'none',
                }}
              >
                <Save size={18} />
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditUserSlideOver;
