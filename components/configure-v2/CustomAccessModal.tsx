import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, User } from 'lucide-react';
import { FONT, INK } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// CUSTOM ACCESS MODAL
// Select supervisor groups and/or individual clinicians
// =============================================================================

interface CustomAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (groupIds: string[], clinicianIds: string[]) => void;
  clinicians: Clinician[];
  initialGroupIds?: string[];
  initialClinicianIds?: string[];
}

export const CustomAccessModal: React.FC<CustomAccessModalProps> = ({
  isOpen,
  onClose,
  onApply,
  clinicians,
  initialGroupIds = [],
  initialClinicianIds = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'teams' | 'clinicians'>('teams');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(initialGroupIds);
  const [selectedClinicianIds, setSelectedClinicianIds] = useState<string[]>(initialClinicianIds);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Placeholder teams for now
  const teams = useMemo(() => {
    return [
      { id: 'team-1', name: 'Sarah Chen', memberCount: 3 },
      { id: 'team-2', name: 'Maria Rodriguez', memberCount: 2 },
      { id: 'team-3', name: 'James Kim', memberCount: 4 },
    ];
  }, []);

  // Active clinicians list
  const activeClinicians = useMemo(() => {
    return clinicians.filter((c) => c.isActive);
  }, [clinicians]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleClinician = (id: string) => {
    setSelectedClinicianIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply(selectedGroupIds, selectedClinicianIds);
    onClose();
  };

  const totalSelected = selectedGroupIds.length + selectedClinicianIds.length;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('teams');
      setSelectedGroupIds(initialGroupIds);
      setSelectedClinicianIds(initialClinicianIds);
    }
  }, [isOpen, initialGroupIds, initialClinicianIds]);

  // Don't render on server or before mount
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(26, 24, 21, 0.6)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 672,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: INK.paper,
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(26, 24, 21, 0.25), 0 0 0 1px rgba(26, 24, 21, 0.05)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                borderBottom: `1px solid ${INK.rule}`,
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 24,
                    color: INK.black,
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  Custom Access
                </h2>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    color: INK.muted,
                    marginTop: 2,
                    margin: 0,
                  }}
                >
                  Select teams or individuals
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  color: INK.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: `1px solid ${INK.rule}`,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setActiveTab('teams')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: activeTab === 'teams' ? INK.gold : INK.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'teams' ? `2px solid ${INK.gold}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: -1,
                }}
              >
                <Users size={18} />
                Teams
                {selectedGroupIds.length > 0 && (
                  <span
                    style={{
                      backgroundColor: INK.gold,
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      lineHeight: '16px',
                    }}
                  >
                    {selectedGroupIds.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('clinicians')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: activeTab === 'clinicians' ? INK.gold : INK.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'clinicians' ? `2px solid ${INK.gold}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: -1,
                }}
              >
                <User size={18} />
                Clinicians
                {selectedClinicianIds.length > 0 && (
                  <span
                    style={{
                      backgroundColor: INK.gold,
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      lineHeight: '16px',
                    }}
                  >
                    {selectedClinicianIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px',
              }}
            >
              {/* Teams Tab */}
              {activeTab === 'teams' && (
                <div>
                  {teams.map((team) => {
                    const isSelected = selectedGroupIds.includes(team.id);

                    return (
                      <button
                        key={team.id}
                        onClick={() => toggleGroup(team.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '20px 0',
                          textAlign: 'left',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottomWidth: 1,
                          borderBottomStyle: 'solid',
                          borderBottomColor: INK.rule,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                          <span
                            style={{
                              fontFamily: FONT.serif,
                              fontSize: 18,
                              color: isSelected ? INK.gold : INK.black,
                              transition: 'color 0.2s',
                            }}
                          >
                            {team.name}'s Team
                          </span>
                          <span
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 13,
                              color: INK.faded,
                            }}
                          >
                            {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>

                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: isSelected ? 'none' : `1.5px solid ${INK.rule}`,
                            backgroundColor: isSelected ? INK.gold : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Clinicians Tab */}
              {activeTab === 'clinicians' && (
                <div>
                  {activeClinicians.length > 0 ? (
                    activeClinicians.map((c) => {
                      const isSelected = selectedClinicianIds.includes(c.id);

                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleClinician(c.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottomWidth: 1,
                            borderBottomStyle: 'solid',
                            borderBottomColor: INK.rule,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 8,
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: FONT.serif,
                                fontSize: 18,
                                color: isSelected ? INK.gold : INK.black,
                                transition: 'color 0.2s',
                              }}
                            >
                              {c.name}
                            </span>
                            <span
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.faded,
                                flexShrink: 0,
                              }}
                            >
                              {[c.licenseType, c.role].filter(Boolean).join(' · ')}
                            </span>
                          </div>

                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: isSelected ? 'none' : `1.5px solid ${INK.rule}`,
                              backgroundColor: isSelected ? INK.gold : 'transparent',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                      <User size={32} style={{ color: INK.faded, marginBottom: 12 }} />
                      <p
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 15,
                          color: INK.faded,
                          margin: 0,
                        }}
                      >
                        No clinicians available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '20px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${INK.rule}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  color: INK.muted,
                }}
              >
                {totalSelected === 0 ? (
                  'No selections'
                ) : (
                  <>
                    {selectedGroupIds.length > 0 && (
                      <span>
                        {selectedGroupIds.length} {selectedGroupIds.length === 1 ? 'team' : 'teams'}
                      </span>
                    )}
                    {selectedGroupIds.length > 0 && selectedClinicianIds.length > 0 && ', '}
                    {selectedClinicianIds.length > 0 && (
                      <span>
                        {selectedClinicianIds.length}{' '}
                        {selectedClinicianIds.length === 1 ? 'individual' : 'individuals'}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
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
                <button
                  onClick={handleApply}
                  disabled={totalSelected === 0}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 12,
                    fontFamily: FONT.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'white',
                    background:
                      totalSelected > 0
                        ? `linear-gradient(135deg, ${INK.gold} 0%, #a78419 100%)`
                        : INK.ghost,
                    border: 'none',
                    cursor: totalSelected > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: totalSelected > 0 ? '0 4px 16px rgba(201, 162, 39, 0.35)' : 'none',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CustomAccessModal;
