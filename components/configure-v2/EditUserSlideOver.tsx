import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Trash2,
  Link2,
  Crown,
  Lock,
  Globe,
  Users,
  UserCheck,
  User,
  Check,
} from 'lucide-react';
import { FONT, INK, TogglePill, canSupervise } from './shared';
import type { UserAccess, AccessScope, Clinician } from './shared';

// =============================================================================
// EDIT USER SLIDE-OVER
// =============================================================================

interface EditUserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UserAccess>) => void;
  onDelete?: () => void;
  user: UserAccess | null;
  clinicians: Clinician[];
}

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

export const EditUserSlideOver: React.FC<EditUserSlideOverProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  user,
  clinicians,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState<AccessScope>('fullPractice');
  const [revenueAccess, setRevenueAccess] = useState(false);
  const [clientDetailsAccess, setClientDetailsAccess] = useState(true);
  const [customClinicianIds, setCustomClinicianIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const linkedClinician = useMemo(() => {
    if (!user?.clinicianId) return null;
    return clinicians.find((c) => c.id === user.clinicianId) || null;
  }, [user?.clinicianId, clinicians]);

  const canUserSupervise = linkedClinician && canSupervise(linkedClinician.role);

  const supervisees = useMemo(() => {
    if (!user?.clinicianId) return [];
    return clinicians.filter((c) => c.supervisorId === user.clinicianId && c.isActive);
  }, [user?.clinicianId, clinicians]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setScope(user.scope);
      setRevenueAccess(user.revenueAccess);
      setClientDetailsAccess(user.clientDetailsAccess);
      setCustomClinicianIds(user.customClinicianIds || []);
      setShowDeleteConfirm(false);
    }
  }, [user]);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({
      name: name.trim(),
      email: email.trim(),
      scope,
      revenueAccess,
      clientDetailsAccess,
      customClinicianIds: scope === 'custom' ? customClinicianIds : undefined,
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

  const isValid = name.trim().length > 0 && email.includes('@');
  const isOwner = user?.isOwner;
  const isClinician = user?.type === 'clinician';

  const hasChanges =
    user &&
    (name !== user.name ||
      email !== user.email ||
      scope !== user.scope ||
      revenueAccess !== user.revenueAccess ||
      clientDetailsAccess !== user.clientDetailsAccess);

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
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(26, 24, 21, 0.5)' }}
            onClick={onClose}
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
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 24,
                    color: INK.black,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Edit Access
                </h2>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    color: INK.muted,
                    marginTop: 2,
                  }}
                >
                  {user.status === 'pending' ? 'Invitation pending' : 'Active user'}
                </p>
              </div>
              <motion.button
                onClick={onClose}
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
              <div className="space-y-8">
                {/* User summary */}
                <div
                  className="p-5 rounded-xl"
                  style={{ backgroundColor: INK.cream }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 20,
                        color: INK.black,
                      }}
                    >
                      {user.name}
                    </span>
                    {isOwner && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: INK.goldGlow }}
                      >
                        <Crown size={12} style={{ color: INK.gold }} />
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 11,
                            fontWeight: 600,
                            color: INK.gold,
                          }}
                        >
                          Owner
                        </span>
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 14,
                      color: INK.muted,
                      marginTop: 4,
                    }}
                  >
                    {user.email}
                    {user.staffRole && ` · ${user.staffRole}`}
                  </div>
                </div>

                {/* Linked clinician badge */}
                {linkedClinician && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      backgroundColor: INK.emeraldLight,
                      border: `1px solid ${INK.emerald}30`,
                    }}
                  >
                    <Link2 size={18} style={{ color: INK.emerald }} />
                    <span
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 14,
                        color: INK.emerald,
                      }}
                    >
                      Linked to <strong>{linkedClinician.name}</strong> · {linkedClinician.licenseType}
                    </span>
                  </div>
                )}

                {/* Owner notice */}
                {isOwner && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      backgroundColor: INK.goldGlow,
                      border: `1px solid ${INK.gold}30`,
                    }}
                  >
                    <Lock size={18} style={{ color: INK.gold }} />
                    <span
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 14,
                        color: INK.gold,
                      }}
                    >
                      Practice owner has full access to everything
                    </span>
                  </div>
                )}

                {/* Email (editable for staff) */}
                {!linkedClinician && !isOwner && (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                )}

                {/* Scope (not for owner) */}
                {!isOwner && (
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
                      Who can they see?
                    </h4>
                    <div className="space-y-3">
                      {SCOPE_CONFIG.map((config) => {
                        const isDisabled =
                          (config.clinicianOnly && !isClinician) ||
                          (config.value === 'theirTeam' && !canUserSupervise);

                        return (
                          <motion.button
                            key={config.value}
                            onClick={isDisabled ? undefined : () => setScope(config.value)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl text-left"
                            style={{
                              backgroundColor: scope === config.value ? INK.goldGlow : 'transparent',
                              border: `1.5px solid ${scope === config.value ? INK.gold : INK.rule}`,
                              opacity: isDisabled ? 0.4 : 1,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                            }}
                            whileHover={isDisabled ? {} : { backgroundColor: scope === config.value ? INK.goldGlow : INK.cream }}
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
                        );
                      })}
                    </div>

                    {/* Custom clinician selection */}
                    <AnimatePresence>
                      {scope === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div
                            className="space-y-2 max-h-48 overflow-y-auto p-4 rounded-xl"
                            style={{ backgroundColor: INK.cream }}
                          >
                            {clinicians.filter((c) => c.isActive).map((c) => {
                              const isSelected = customClinicianIds.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setCustomClinicianIds((prev) =>
                                      isSelected ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                                    );
                                  }}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
                                  style={{
                                    backgroundColor: isSelected ? INK.goldGlow : 'transparent',
                                    border: `1.5px solid ${isSelected ? INK.gold : 'transparent'}`,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: FONT.sans,
                                      fontSize: 15,
                                      color: INK.body,
                                      flex: 1,
                                    }}
                                  >
                                    {c.name}
                                  </span>
                                  {isSelected && <Check size={16} style={{ color: INK.gold }} />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Their Team info */}
                    <AnimatePresence>
                      {scope === 'theirTeam' && supervisees.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: INK.emeraldLight }}
                          >
                            <p
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                fontWeight: 600,
                                color: INK.emerald,
                                marginBottom: 8,
                              }}
                            >
                              Supervises {supervisees.length} clinician{supervisees.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {supervisees.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-3 py-1.5 rounded-lg"
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 13,
                                    color: INK.emerald,
                                    backgroundColor: 'white',
                                  }}
                                >
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Permissions (not for owner) */}
                {!isOwner && (
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
                )}

                {/* Delete */}
                {!isOwner && onDelete && (
                  <div className="pt-6" style={{ borderTop: `1px solid ${INK.rule}` }}>
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
                            border: `1px solid ${INK.rose}30`,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 15,
                              color: INK.rose,
                              marginBottom: 16,
                            }}
                          >
                            Remove <strong>{user.name}</strong> from Cortexa?
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleDelete}
                              className="px-4 py-2.5 rounded-xl"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor: INK.rose,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Yes, remove
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-4 py-2.5 rounded-xl"
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                color: INK.body,
                                backgroundColor: 'white',
                                border: `1px solid ${INK.rule}`,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full flex items-center justify-center gap-2.5 p-4 rounded-xl"
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 14,
                            color: INK.rose,
                            backgroundColor: 'transparent',
                            border: `1.5px solid ${INK.rose}40`,
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
            {!isOwner && (
              <div
                className="px-8 py-5"
                style={{ borderTop: `1px solid ${INK.rule}` }}
              >
                <motion.button
                  onClick={handleSubmit}
                  disabled={!isValid || !hasChanges}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: isValid && hasChanges ? 'white' : INK.ghost,
                    background: isValid && hasChanges
                      ? `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`
                      : INK.cream,
                    border: 'none',
                    cursor: isValid && hasChanges ? 'pointer' : 'not-allowed',
                    boxShadow: isValid && hasChanges ? '0 4px 16px rgba(4, 120, 87, 0.35)' : 'none',
                  }}
                  whileHover={isValid && hasChanges ? { scale: 1.01 } : {}}
                  whileTap={isValid && hasChanges ? { scale: 0.99 } : {}}
                >
                  <Save size={18} />
                  Save Changes
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditUserSlideOver;
