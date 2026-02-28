import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  X,
  Building2,
  Video,
  ChevronDown,
  ChevronRight,
  Star,
  ArrowRight,
  Wifi,
} from 'lucide-react';
import { AnimatedSection } from './design-system';

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
// OFFICE MAPPING COMPONENT
// Two-card layout matching the style of other configuration tabs
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
  const [newLocationType, setNewLocationType] = useState<'in-person' | 'telehealth'>('in-person');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  // Computed
  const assignedOfficeIds = new Set(locationGroups.flatMap(g => g.ehrOfficeIds));
  const unassignedOffices = ehrOffices.filter(o => !assignedOfficeIds.has(o.id));
  const assignedOffices = ehrOffices.filter(o => assignedOfficeIds.has(o.id));
  const allMapped = unassignedOffices.length === 0;

  // Font
  const serifFont = "'Instrument Serif', Georgia, serif";

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
      address: '',
      isPrimary: locationGroups.length === 0,
      ehrOfficeIds: [],
    };
    onUpdateGroups([...locationGroups, newGroup]);
    setNewLocationName('');
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

  // Get location for an office
  const getOfficeLocation = (officeId: string) => {
    return locationGroups.find(g => g.ehrOfficeIds.includes(officeId));
  };

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-semibold text-stone-900 tracking-tight"
            style={{ fontFamily: serifFont }}
          >
            Office Mapping
          </h2>
          <p className="text-stone-500 mt-2 text-base">
            Match your EHR offices to your practice locations
          </p>
        </div>
      </AnimatedSection>

      {/* Progress indicator */}
      <AnimatedSection delay={0.05}>
        <div className="mb-8">
          {allMapped ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200/60"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-semibold text-emerald-800">All offices mapped</span>
                <span className="text-sm text-emerald-600 ml-2">
                  {ehrOffices.length} office{ehrOffices.length !== 1 ? 's' : ''} across {locationGroups.length} location{locationGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60">
              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unassignedOffices.length}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-amber-800">
                  {unassignedOffices.length} office{unassignedOffices.length !== 1 ? 's' : ''} need{unassignedOffices.length === 1 ? 's' : ''} assignment
                </span>
                <span className="text-sm text-amber-600 ml-2">
                  Select an office, then choose a location
                </span>
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Two-card layout */}
      <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-2 gap-6">
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT CARD — EHR Offices from SimplePractice
          ═══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-2xl border border-stone-200 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
              boxShadow: '0 1px 3px rgba(28, 25, 23, 0.04), 0 6px 16px rgba(28, 25, 23, 0.04)',
            }}
          >
            {/* Card header */}
            <div className="px-5 py-4 border-b border-stone-100 bg-white/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Wifi size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800" style={{ fontFamily: serifFont }}>
                      EHR Offices
                    </h3>
                    <p className="text-xs text-stone-400">from SimplePractice</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                  {ehrOffices.length} synced
                </span>
              </div>
            </div>

            {/* Office list */}
            <div className="divide-y divide-stone-100">
              {/* Unassigned section */}
              {unassignedOffices.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Unassigned
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {unassignedOffices.map((office) => (
                      <motion.button
                        key={office.id}
                        onClick={() => setSelectedOfficeId(selectedOfficeId === office.id ? null : office.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                          ${selectedOfficeId === office.id
                            ? 'bg-amber-100 border-2 border-amber-400 shadow-sm'
                            : 'bg-amber-50/50 border border-amber-200/60 hover:bg-amber-50 hover:border-amber-300'
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${office.classification === 'telehealth' ? 'bg-sky-100' : 'bg-stone-100'}
                        `}>
                          {office.classification === 'telehealth' ? (
                            <Video size={14} className="text-sky-600" />
                          ) : (
                            <Building2 size={14} className="text-stone-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-stone-700 block truncate">
                            {office.rawName}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wide">
                            {office.classification === 'telehealth' ? 'Virtual' : 'In-Person'}
                          </span>
                        </div>
                        {selectedOfficeId === office.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-amber-600"
                          >
                            <span className="text-[10px] font-semibold">Select location</span>
                            <ArrowRight size={12} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned section */}
              {assignedOffices.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Assigned
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {assignedOffices.map((office) => {
                      const location = getOfficeLocation(office.id);
                      return (
                        <div
                          key={office.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-stone-100"
                        >
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                            ${office.classification === 'telehealth' ? 'bg-sky-50' : 'bg-stone-50'}
                          `}>
                            {office.classification === 'telehealth' ? (
                              <Video size={14} className="text-sky-500" />
                            ) : (
                              <Building2 size={14} className="text-stone-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-stone-500 block truncate">
                              {office.rawName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Check size={12} />
                            <span className="text-xs font-medium truncate max-w-[80px]">
                              {location?.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {ehrOffices.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Wifi size={20} className="text-stone-400" />
                  </div>
                  <p className="text-sm text-stone-500">No offices synced yet</p>
                  <p className="text-xs text-stone-400 mt-1">Connect SimplePractice to import offices</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT CARD — Your Locations
          ═══════════════════════════════════════════════════════════════════ */}
          <div
            className="rounded-2xl border border-stone-200 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
              boxShadow: '0 1px 3px rgba(28, 25, 23, 0.04), 0 6px 16px rgba(28, 25, 23, 0.04)',
            }}
          >
            {/* Card header */}
            <div className="px-5 py-4 border-b border-stone-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <MapPin size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800" style={{ fontFamily: serifFont }}>
                      Your Locations
                    </h3>
                    <p className="text-xs text-stone-400">where you see clients</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreatingLocation(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  <Plus size={12} />
                  Add
                </motion.button>
              </div>
            </div>

            {/* Locations list */}
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {locationGroups.map((location) => {
                  const locationOffices = ehrOffices.filter(o => location.ehrOfficeIds.includes(o.id));
                  const isExpanded = expandedGroupId === location.id;
                  const isReceivingAssignment = selectedOfficeId !== null;

                  return (
                    <motion.div
                      key={location.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`
                        rounded-xl border overflow-hidden transition-all
                        ${location.isPrimary ? 'border-amber-300 bg-amber-50/30' : 'border-stone-200 bg-white'}
                        ${isReceivingAssignment ? 'ring-2 ring-amber-300 ring-offset-2' : ''}
                      `}
                    >
                      {/* Location header - clickable */}
                      <button
                        onClick={() => {
                          if (selectedOfficeId) {
                            handleAssignToLocation(selectedOfficeId, location.id);
                          } else {
                            setExpandedGroupId(isExpanded ? null : location.id);
                          }
                        }}
                        className={`
                          w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                          ${isReceivingAssignment ? 'hover:bg-amber-100' : 'hover:bg-stone-50'}
                        `}
                      >
                        <div className={`
                          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                          ${location.type === 'telehealth' ? 'bg-sky-100' : 'bg-stone-100'}
                        `}>
                          {location.type === 'telehealth' ? (
                            <Video size={16} className="text-sky-600" />
                          ) : (
                            <Building2 size={16} className="text-stone-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-800 truncate" style={{ fontFamily: serifFont }}>
                              {location.name}
                            </span>
                            {location.isPrimary && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-700 text-[9px] font-bold uppercase">
                                <Star size={8} className="fill-current" />
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400">
                            {locationOffices.length === 0
                              ? 'No offices yet'
                              : `${locationOffices.length} office${locationOffices.length !== 1 ? 's' : ''}`}
                          </span>
                        </div>

                        {isReceivingAssignment ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold"
                          >
                            Assign here
                          </motion.div>
                        ) : (
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight size={16} className="text-stone-400" />
                          </motion.div>
                        )}
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && !isReceivingAssignment && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-stone-100">
                              {/* Assigned offices */}
                              {locationOffices.length > 0 ? (
                                <div className="space-y-1 mb-3">
                                  {locationOffices.map(office => (
                                    <div
                                      key={office.id}
                                      className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-stone-50 group"
                                    >
                                      <div className="flex items-center gap-2">
                                        {office.classification === 'telehealth' ? (
                                          <Video size={12} className="text-sky-500" />
                                        ) : (
                                          <Building2 size={12} className="text-stone-400" />
                                        )}
                                        <span className="text-xs text-stone-600">{office.rawName}</span>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveFromLocation(office.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500 transition-all"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-stone-400 py-3 text-center bg-stone-50 rounded-lg mb-3">
                                  Select an office from the left to assign it here
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                                {!location.isPrimary && (
                                  <button
                                    onClick={() => handleSetPrimary(location.id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                  >
                                    <Star size={10} />
                                    Set primary
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteLocation(location.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all ml-auto"
                                >
                                  <Trash2 size={10} />
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setNewLocationType(newLocationType === 'in-person' ? 'telehealth' : 'in-person')}
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                          ${newLocationType === 'telehealth' ? 'bg-sky-100' : 'bg-stone-100'}
                        `}
                        title="Click to toggle type"
                      >
                        {newLocationType === 'telehealth' ? (
                          <Video size={16} className="text-sky-600" />
                        ) : (
                          <Building2 size={16} className="text-stone-500" />
                        )}
                      </button>

                      <div className="flex-1">
                        <input
                          autoFocus
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newLocationName.trim()) handleCreateLocation();
                            if (e.key === 'Escape') {
                              setCreatingLocation(false);
                              setNewLocationName('');
                            }
                          }}
                          placeholder="Location name..."
                          className="w-full text-sm font-medium text-stone-800 bg-transparent outline-none placeholder:text-stone-400"
                          style={{ fontFamily: serifFont }}
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          {newLocationType === 'in-person' ? 'In-person location' : 'Telehealth'} · Click icon to change
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setCreatingLocation(false);
                          setNewLocationName('');
                        }}
                        className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateLocation}
                        disabled={!newLocationName.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Create
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {locationGroups.length === 0 && !creatingLocation && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-stone-100 flex items-center justify-center">
                    <MapPin size={20} className="text-stone-400" />
                  </div>
                  <p className="text-sm font-medium text-stone-600 mb-1" style={{ fontFamily: serifFont }}>
                    No locations yet
                  </p>
                  <p className="text-xs text-stone-400 mb-4">
                    Create a location to start mapping offices
                  </p>
                  <button
                    onClick={() => setCreatingLocation(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                  >
                    <Plus size={12} />
                    Create your first location
                  </button>
                </div>
              )}

              {/* Add location button (when locations exist but not creating) */}
              {locationGroups.length > 0 && !creatingLocation && (
                <button
                  onClick={() => setCreatingLocation(true)}
                  className="w-full py-3 rounded-xl border border-dashed border-stone-200 hover:border-stone-300 text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1.5 transition-colors text-xs font-medium"
                >
                  <Plus size={14} />
                  Add another location
                </button>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Help text at bottom */}
      <AnimatedSection delay={0.15}>
        <div className="mt-6 px-4 py-3 rounded-xl bg-stone-50 border border-stone-100">
          <p className="text-xs text-stone-500 text-center">
            <strong className="text-stone-600">How it works:</strong> Select an office on the left, then click a location on the right to assign it.
            Offices can only belong to one location at a time.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default OfficeMapping;
