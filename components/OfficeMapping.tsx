import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Building2,
  Video,
  ChevronRight,
  Star,
  ArrowRight,
} from 'lucide-react';
import { FONT, INK, SHADOW } from './configure-v2/shared';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RawEHROffice {
  id: string;
  rawName: string;
  classification: 'in-person' | 'telehealth';
}

export interface LocationGroup {
  id: string;
  name: string;
  type: 'in-person' | 'telehealth';
  address: string;
  isPrimary: boolean;
  ehrOfficeIds: string[];
}

interface OfficeMappingProps {
  ehrOffices: RawEHROffice[];
  locationGroups: LocationGroup[];
  onUpdateGroups: (groups: LocationGroup[]) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION MAPPING COMPONENT
// Two-panel ledger layout with improved spacing and readability
// ─────────────────────────────────────────────────────────────────────────────

export const OfficeMapping: React.FC<OfficeMappingProps> = ({
  ehrOffices,
  locationGroups,
  onUpdateGroups,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(
    locationGroups.length > 0 ? locationGroups[0].id : null
  );
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newLocationType, setNewLocationType] = useState<'in-person' | 'telehealth'>('in-person');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  // Computed
  const assignedOfficeIds = new Set(locationGroups.flatMap(g => g.ehrOfficeIds));
  const unassignedOffices = ehrOffices.filter(o => !assignedOfficeIds.has(o.id));
  const assignedOffices = ehrOffices.filter(o => assignedOfficeIds.has(o.id));

  // Handlers
  const handleAssignToLocation = (officeId: string, locationId: string) => {
    onUpdateGroups(locationGroups.map(g => ({
      ...g,
      ehrOfficeIds: g.id === locationId
        ? [...g.ehrOfficeIds.filter(id => id !== officeId), officeId]
        : g.ehrOfficeIds.filter(id => id !== officeId),
    })));
    setSelectedOfficeId(null);
  };

  const handleRemoveFromLocation = (officeId: string) => {
    onUpdateGroups(locationGroups.map(g => ({
      ...g,
      ehrOfficeIds: g.ehrOfficeIds.filter(id => id !== officeId),
    })));
  };

  const handleCreateLocation = () => {
    if (!newLocationName.trim()) return;
    const newGroup: LocationGroup = {
      id: `loc-${Date.now()}`,
      name: newLocationName.trim(),
      type: newLocationType,
      address: newLocationAddress.trim(),
      isPrimary: locationGroups.length === 0,
      ehrOfficeIds: [],
    };
    onUpdateGroups([...locationGroups, newGroup]);
    setNewLocationName('');
    setNewLocationAddress('');
    setNewLocationType('in-person');
    setCreatingLocation(false);
    setExpandedGroupId(newGroup.id);
  };

  const handleDeleteLocation = (locationId: string) => {
    const remaining = locationGroups.filter(g => g.id !== locationId);
    if (remaining.length > 0 && locationGroups.find(g => g.id === locationId)?.isPrimary) {
      remaining[0].isPrimary = true;
    }
    onUpdateGroups(remaining);
    if (expandedGroupId === locationId) {
      setExpandedGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSetPrimary = (locationId: string) => {
    onUpdateGroups(locationGroups.map(g => ({ ...g, isPrimary: g.id === locationId })));
  };

  const getOfficeLocation = (officeId: string) => {
    return locationGroups.find(g => g.ehrOfficeIds.includes(officeId));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2
            style={{
              fontFamily: FONT.serif,
              fontSize: 24,
              fontWeight: 400,
              color: INK.black,
              letterSpacing: '-0.01em',
            }}
          >
            Location Mapping
          </h2>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 14,
              color: INK.muted,
              marginTop: 6,
            }}
          >
            Map EHR offices to your practice locations
          </p>
        </div>
        {/* Status counts */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: unassignedOffices.length > 0 ? INK.rose : INK.ghost }}
            />
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 13,
                color: unassignedOffices.length > 0 ? INK.rose : INK.muted,
                fontWeight: unassignedOffices.length > 0 ? 600 : 500,
              }}
            >
              {unassignedOffices.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: INK.emerald }}
            />
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 13,
                color: INK.muted,
                fontWeight: 500,
              }}
            >
              {assignedOffices.length}
            </span>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL — EHR Offices
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${INK.rule}` }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${INK.rule}`, backgroundColor: INK.cream }}
          >
            <div className="flex items-center gap-2.5">
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.body,
                  letterSpacing: '0.02em',
                }}
              >
                EHR Offices
              </span>
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: INK.muted,
                }}
              >
                — synced from SimplePractice
              </span>
            </div>
            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                fontFamily: FONT.mono,
                fontSize: 12,
                fontWeight: 600,
                color: INK.body,
                backgroundColor: INK.paper,
              }}
            >
              {ehrOffices.length}
            </span>
          </div>

          {/* Office list */}
          <div>
            {/* Unassigned section */}
            {unassignedOffices.length > 0 && (
              <div style={{ backgroundColor: `${INK.rose}06` }}>
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderBottom: `1px solid ${INK.rule}` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INK.rose }} />
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 12,
                      fontWeight: 700,
                      color: INK.rose,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Unassigned
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: INK.rose,
                    }}
                  >
                    {unassignedOffices.length}
                  </span>
                </div>
                {unassignedOffices.map((office, idx) => (
                  <motion.button
                    key={office.id}
                    onClick={() => setSelectedOfficeId(selectedOfficeId === office.id ? null : office.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors"
                    style={{
                      borderBottom: idx < unassignedOffices.length - 1 ? `1px solid ${INK.rule}` : 'none',
                      backgroundColor: selectedOfficeId === office.id ? `${INK.gold}15` : 'transparent',
                    }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: office.classification === 'telehealth' ? '#e0f2fe' : INK.cream,
                        }}
                      >
                        {office.classification === 'telehealth' ? (
                          <Video size={16} color="#0284c7" />
                        ) : (
                          <Building2 size={16} color={INK.muted} />
                        )}
                      </div>
                      <div>
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 14,
                            color: INK.body,
                            display: 'block',
                          }}
                        >
                          {office.rawName}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 12,
                            color: INK.muted,
                          }}
                        >
                          {office.classification === 'telehealth' ? 'Virtual' : 'In-Person'}
                        </span>
                      </div>
                    </div>
                    {selectedOfficeId === office.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
                        style={{
                          color: INK.gold,
                          backgroundColor: INK.goldGlow,
                        }}
                      >
                        <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600 }}>
                          Select location
                        </span>
                        <ArrowRight size={14} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Assigned section */}
            {assignedOffices.length > 0 && (
              <div>
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{
                    borderBottom: `1px solid ${INK.rule}`,
                    borderTop: unassignedOffices.length > 0 ? `1px solid ${INK.rule}` : 'none',
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INK.emerald }} />
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 12,
                      fontWeight: 700,
                      color: INK.emerald,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Assigned
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      fontWeight: 600,
                      color: INK.emerald,
                      backgroundColor: INK.emeraldLight,
                    }}
                  >
                    {assignedOffices.length}
                  </span>
                </div>
                {assignedOffices.map((office, idx) => {
                  const location = getOfficeLocation(office.id);
                  return (
                    <div
                      key={office.id}
                      className="px-5 py-3.5 flex items-center justify-between"
                      style={{
                        borderBottom: idx < assignedOffices.length - 1 ? `1px solid ${INK.rule}` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: office.classification === 'telehealth' ? '#f0f9ff' : `${INK.cream}80`,
                          }}
                        >
                          {office.classification === 'telehealth' ? (
                            <Video size={16} color={INK.ghost} />
                          ) : (
                            <Building2 size={16} color={INK.ghost} />
                          )}
                        </div>
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 14,
                            color: INK.muted,
                          }}
                        >
                          {office.rawName}
                        </span>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-md"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 12,
                          fontWeight: 500,
                          color: INK.emerald,
                          backgroundColor: INK.emeraldLight,
                        }}
                      >
                        {location?.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {ehrOffices.length === 0 && (
              <div className="py-16 text-center">
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    color: INK.muted,
                  }}
                >
                  No offices synced yet
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL — Your Locations
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${INK.rule}` }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${INK.rule}`, backgroundColor: INK.cream }}
          >
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                fontWeight: 600,
                color: INK.body,
                letterSpacing: '0.02em',
              }}
            >
              Your Locations
            </span>
            <button
              onClick={() => setCreatingLocation(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
              style={{
                fontFamily: FONT.sans,
                fontSize: 12,
                fontWeight: 600,
                color: INK.gold,
                backgroundColor: INK.goldGlow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${INK.gold}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = INK.goldGlow;
              }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Locations list */}
          <div>
            <AnimatePresence mode="popLayout">
              {locationGroups.map((location, idx) => {
                const locationOffices = ehrOffices.filter(o => location.ehrOfficeIds.includes(o.id));
                const isExpanded = expandedGroupId === location.id;
                const isAssignMode = selectedOfficeId !== null;
                const isLast = idx === locationGroups.length - 1 && !creatingLocation;

                return (
                  <motion.div
                    key={location.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
                      backgroundColor: isAssignMode ? `${INK.gold}08` : 'transparent',
                    }}
                  >
                    {/* Location header */}
                    <button
                      onClick={() => {
                        if (selectedOfficeId) {
                          handleAssignToLocation(selectedOfficeId, location.id);
                        } else {
                          setExpandedGroupId(isExpanded ? null : location.id);
                        }
                      }}
                      className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-stone-50"
                      style={{
                        backgroundColor: isExpanded && !isAssignMode ? INK.cream : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {!isAssignMode && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ChevronRight size={16} color={INK.faded} />
                          </motion.div>
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: location.isPrimary ? INK.gold : INK.emerald }}
                        />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: location.type === 'telehealth' ? '#e0f2fe' : INK.cream,
                          }}
                        >
                          {location.type === 'telehealth' ? (
                            <Video size={16} color="#0284c7" />
                          ) : (
                            <Building2 size={16} color={INK.muted} />
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 15,
                              fontWeight: 600,
                              color: INK.body,
                            }}
                          >
                            {location.name}
                          </span>
                          {location.isPrimary && (
                            <span
                              className="flex items-center gap-1 px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: INK.goldGlow,
                                color: INK.gold,
                              }}
                            >
                              <Star size={10} style={{ fill: INK.gold }} />
                              <span style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                                PRIMARY
                              </span>
                            </span>
                          )}
                          {location.address && (
                            <span
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 13,
                                color: INK.muted,
                              }}
                            >
                              — {location.address}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAssignMode && (
                          <span
                            className="px-2.5 py-1 rounded-md"
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 12,
                              fontWeight: 600,
                              color: INK.gold,
                              backgroundColor: INK.goldGlow,
                            }}
                          >
                            Click to assign
                          </span>
                        )}
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: FONT.mono,
                            fontSize: 12,
                            fontWeight: 600,
                            color: INK.body,
                            backgroundColor: INK.paper,
                          }}
                        >
                          {locationOffices.length}
                        </span>
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && !isAssignMode && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4">
                            {locationOffices.length > 0 ? (
                              locationOffices.map((office, officeIdx) => (
                                <div
                                  key={office.id}
                                  className="flex items-center justify-between py-3 group"
                                  style={{
                                    borderBottom: officeIdx < locationOffices.length - 1 ? `1px solid ${INK.rule}` : 'none',
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    {office.classification === 'telehealth' ? (
                                      <Video size={14} color={INK.muted} />
                                    ) : (
                                      <Building2 size={14} color={INK.muted} />
                                    )}
                                    <span
                                      style={{
                                        fontFamily: FONT.sans,
                                        fontSize: 14,
                                        color: INK.muted,
                                      }}
                                    >
                                      {office.rawName}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFromLocation(office.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all"
                                    style={{ color: INK.ghost }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = INK.rose;
                                      e.currentTarget.style.backgroundColor = `${INK.rose}15`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = INK.ghost;
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div
                                className="py-8 text-center rounded-lg"
                                style={{ backgroundColor: INK.cream }}
                              >
                                <span
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 13,
                                    color: INK.muted,
                                  }}
                                >
                                  Select an office from the left to assign
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div
                              className="flex items-center gap-3 mt-4 pt-4"
                              style={{ borderTop: `1px dashed ${INK.rule}` }}
                            >
                              {!location.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimary(location.id)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all"
                                  style={{
                                    fontFamily: FONT.sans,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: INK.muted,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = INK.gold;
                                    e.currentTarget.style.backgroundColor = INK.goldGlow;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = INK.muted;
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Star size={12} />
                                  Set primary
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteLocation(location.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ml-auto"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: INK.ghost,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = INK.rose;
                                  e.currentTarget.style.backgroundColor = `${INK.rose}15`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = INK.ghost;
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Create new location form */}
            <AnimatePresence>
              {creatingLocation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-5"
                    style={{
                      borderTop: locationGroups.length > 0 ? `1px solid ${INK.rule}` : 'none',
                      backgroundColor: `${INK.gold}08`,
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: INK.goldGlow }}
                      >
                        <Plus size={16} color={INK.gold} />
                      </div>
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 15,
                          fontWeight: 600,
                          color: INK.body,
                        }}
                      >
                        New Location
                      </span>
                    </div>

                    {/* Type toggle */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setNewLocationType('in-person')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: newLocationType === 'in-person' ? 'white' : INK.muted,
                          backgroundColor: newLocationType === 'in-person' ? INK.dark : INK.paper,
                          border: `1.5px solid ${newLocationType === 'in-person' ? INK.dark : INK.rule}`,
                        }}
                      >
                        <Building2 size={16} />
                        In-Person
                      </button>
                      <button
                        onClick={() => setNewLocationType('telehealth')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: newLocationType === 'telehealth' ? 'white' : INK.muted,
                          backgroundColor: newLocationType === 'telehealth' ? '#0891b2' : INK.paper,
                          border: `1.5px solid ${newLocationType === 'telehealth' ? '#0891b2' : INK.rule}`,
                        }}
                      >
                        <Video size={16} />
                        Telehealth
                      </button>
                    </div>

                    {/* Name input */}
                    <input
                      autoFocus
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newLocationName.trim()) handleCreateLocation();
                        if (e.key === 'Escape') {
                          setCreatingLocation(false);
                          setNewLocationName('');
                          setNewLocationAddress('');
                        }
                      }}
                      placeholder={newLocationType === 'telehealth' ? 'e.g., Virtual Office' : 'e.g., Main Office'}
                      className="w-full px-4 py-3 rounded-lg mb-3 outline-none transition-all"
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 14,
                        color: INK.body,
                        backgroundColor: INK.paper,
                        border: `1.5px solid ${INK.rule}`,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = INK.gold;
                        e.currentTarget.style.boxShadow = SHADOW.goldFocus;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = INK.rule;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />

                    {/* Address input */}
                    {newLocationType === 'in-person' && (
                      <input
                        value={newLocationAddress}
                        onChange={(e) => setNewLocationAddress(e.target.value)}
                        placeholder="Address (optional)"
                        className="w-full px-4 py-3 rounded-lg mb-4 outline-none transition-all"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 14,
                          color: INK.body,
                          backgroundColor: INK.paper,
                          border: `1.5px solid ${INK.rule}`,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = INK.gold;
                          e.currentTarget.style.boxShadow = SHADOW.goldFocus;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = INK.rule;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setCreatingLocation(false);
                          setNewLocationName('');
                          setNewLocationAddress('');
                        }}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 500,
                          color: INK.muted,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = INK.cream}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateLocation}
                        disabled={!newLocationName.trim()}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: newLocationName.trim() ? 'white' : INK.ghost,
                          backgroundColor: newLocationName.trim() ? INK.gold : INK.cream,
                          cursor: newLocationName.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Create Location
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {locationGroups.length === 0 && !creatingLocation && (
              <div className="py-16 text-center">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: INK.cream }}
                >
                  <MapPin size={24} color={INK.ghost} />
                </div>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 14,
                    color: INK.muted,
                    marginBottom: 12,
                  }}
                >
                  No locations yet
                </p>
                <button
                  onClick={() => setCreatingLocation(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: INK.gold,
                  }}
                >
                  <Plus size={16} />
                  Create your first location
                </button>
              </div>
            )}

            {/* Add location button */}
            {locationGroups.length > 0 && !creatingLocation && (
              <button
                onClick={() => setCreatingLocation(true)}
                className="w-full px-5 py-4 flex items-center justify-center gap-2.5 transition-colors"
                style={{
                  borderTop: `1px dashed ${INK.rule}`,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = INK.cream}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={16} color={INK.gold} />
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: INK.gold,
                  }}
                >
                  Add location
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeMapping;
