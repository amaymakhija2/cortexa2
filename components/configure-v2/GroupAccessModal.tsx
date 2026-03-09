import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Eye, DollarSign, BarChart3, ExternalLink } from 'lucide-react';
import { FONT, INK, SHADOW, EASE, deriveSuperviseesForUser } from './shared';
import type { UserAccess, Clinician } from './shared';

// =============================================================================
// GROUP ACCESS MODAL - The Supervision Tree
// =============================================================================
// A visual diagram showing exactly who a supervisor can see.
// Like an organizational chart drawn on fine paper - clear hierarchy,
// elegant connections, instant comprehension.
// =============================================================================

interface GroupAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccess;
  clinicians: Clinician[];
  onNavigateToClinicians?: () => void;
}

export const GroupAccessModal: React.FC<GroupAccessModalProps> = ({
  isOpen,
  onClose,
  user,
  clinicians,
  onNavigateToClinicians,
}) => {
  // Derive supervisees from clinician relationships
  const supervisees = useMemo(() => {
    return deriveSuperviseesForUser(user, clinicians);
  }, [user, clinicians]);

  // Get linked clinician info
  const linkedClinician = useMemo(() => {
    if (!user.clinicianId) return null;
    return clinicians.find(c => c.id === user.clinicianId) || null;
  }, [user.clinicianId, clinicians]);

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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg"
          >
            <div
              style={{
                backgroundColor: INK.paper,
                borderRadius: 20,
                boxShadow: `
                  0 25px 50px -12px rgba(26, 24, 21, 0.25),
                  0 0 0 1px rgba(26, 24, 21, 0.05)
                `,
                overflow: 'hidden',
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
                      background: `linear-gradient(135deg, ${INK.emerald} 0%, #065f46 100%)`,
                      boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
                    }}
                  >
                    {user.name
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
                        fontSize: 20,
                        color: INK.black,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {user.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 13,
                        color: INK.muted,
                        marginTop: 2,
                      }}
                    >
                      Supervisor Access
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

              {/* Tree Diagram */}
              <div className="px-8 py-8">
                {/* Supervisor node at top */}
                <div className="flex flex-col items-center">
                  {/* Supervisor card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative px-6 py-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: INK.emeraldLight,
                      border: `2px solid ${INK.emerald}40`,
                      minWidth: 160,
                    }}
                  >
                    <div
                      className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: INK.emerald }}
                    >
                      <Users size={18} color="white" />
                    </div>
                    <div
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 16,
                        color: INK.black,
                        fontWeight: 500,
                      }}
                    >
                      {user.name.split(' ')[0]}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 11,
                        color: INK.emerald,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      SUPERVISOR
                    </div>
                  </motion.div>

                  {/* Connection lines */}
                  {supervisees.length > 0 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="w-0.5 h-8 origin-top"
                      style={{ backgroundColor: INK.rule }}
                    />
                  )}

                  {/* Horizontal connector */}
                  {supervisees.length > 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="h-0.5 origin-center"
                      style={{
                        backgroundColor: INK.rule,
                        width: `${Math.min(supervisees.length * 120, 360)}px`,
                      }}
                    />
                  )}

                  {/* Supervisee nodes */}
                  <div className="flex items-start gap-4 mt-0 flex-wrap justify-center">
                    {supervisees.map((clinician, index) => (
                      <motion.div
                        key={clinician.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        {/* Vertical line from horizontal connector */}
                        <div
                          className="w-0.5 h-4"
                          style={{ backgroundColor: INK.rule }}
                        />
                        {/* Clinician card */}
                        <div
                          className="px-5 py-3 rounded-xl text-center"
                          style={{
                            backgroundColor: INK.cream,
                            border: `1px solid ${INK.rule}`,
                            minWidth: 100,
                          }}
                        >
                          <div
                            className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{
                              fontFamily: FONT.sans,
                              backgroundColor: clinician.color || INK.muted,
                            }}
                          >
                            {clinician.initials}
                          </div>
                          <div
                            style={{
                              fontFamily: FONT.serif,
                              fontSize: 14,
                              color: INK.black,
                            }}
                          >
                            {clinician.name.split(' ')[0]}
                          </div>
                          <div
                            style={{
                              fontFamily: FONT.mono,
                              fontSize: 10,
                              color: INK.faded,
                              marginTop: 2,
                            }}
                          >
                            {clinician.licenseType}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty state */}
                  {supervisees.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 px-6 py-8 text-center rounded-xl"
                      style={{ backgroundColor: INK.cream }}
                    >
                      <p
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 14,
                          color: INK.faded,
                        }}
                      >
                        No supervisees assigned yet.
                      </p>
                      <p
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 12,
                          color: INK.ghost,
                          marginTop: 4,
                        }}
                      >
                        Assign clinicians in the Clinicians tab.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer - access summary */}
              <div
                className="px-8 py-5"
                style={{
                  backgroundColor: INK.cream,
                  borderTop: `1px solid ${INK.rule}`,
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK.ghost,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Eye size={12} />
                  <span>Also has access to</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} style={{ color: INK.muted }} />
                    <span
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 13,
                        color: INK.body,
                      }}
                    >
                      Practice-level aggregates
                    </span>
                  </div>
                  {user.revenueAccess && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} style={{ color: INK.gold }} />
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          color: INK.body,
                        }}
                      >
                        Revenue data
                      </span>
                    </div>
                  )}
                </div>

                {/* Link to edit supervision */}
                {onNavigateToClinicians && (
                  <motion.button
                    onClick={() => {
                      onNavigateToClinicians();
                      onClose();
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-4 flex items-center gap-2 w-full justify-center py-3 rounded-lg transition-colors"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      fontWeight: 500,
                      color: INK.muted,
                      backgroundColor: 'transparent',
                      border: `1px dashed ${INK.rule}`,
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={14} />
                    Edit supervision in Clinicians tab
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GroupAccessModal;
