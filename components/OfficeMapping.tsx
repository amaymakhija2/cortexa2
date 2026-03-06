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
// Two-card layout with improved readability
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

  // Get location for an office
  const getOfficeLocation = (officeId: string) => {
    return locationGroups.find(g => g.ehrOfficeIds.includes(officeId));
  };

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-stone-800"
              style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
            >
              Office Mapping
            </h2>
            <p className="text-stone-400 text-sm mt-0.5">
              Map EHR offices to your practice locations
            </p>
          </div>
          {/* Inline status indicator */}
          {allMapped ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">All mapped</p>
                <p className="text-xs text-emerald-600">
                  {ehrOffices.length} office{ehrOffices.length !== 1 ? 's' : ''} across {locationGroups.length} location{locationGroups.length !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unassignedOffices.length}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {unassignedOffices.length} unassigned
                </p>
                <p className="text-xs text-amber-700">
                  Click an office, then select a location
                </p>
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Two-card layout */}
      <AnimatedSection delay={0.05}>
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
            <div className="px-5 py-4 border-b border-stone-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Wifi size={18} className="text-stone-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-800" style={{ fontFamily: serifFont }}>
                      EHR Offices
                    </h3>
                    <p className="text-sm text-stone-500">Synced from SimplePractice</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                  {ehrOffices.length} total
                </span>
              </div>
            </div>

            {/* Office list */}
            <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
              {/* Unassigned section */}
              {unassignedOffices.length > 0 && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                      Unassigned
                    </span>
                    <span className="text-sm text-amber-600">({unassignedOffices.length})</span>
                  </div>
                  <div className="space-y-2">
                    {unassignedOffices.map((office) => (
                      <motion.button
                        key={office.id}
                        onClick={() => setSelectedOfficeId(selectedOfficeId === office.id ? null : office.id)}
                        className={`
                          w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all
                          ${selectedOfficeId === office.id
                            ? 'bg-amber-100 border-2 border-amber-400 shadow-sm'
                            : 'bg-amber-50/60 border border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          ${office.classification === 'telehealth' ? 'bg-sky-100' : 'bg-stone-100'}
                        `}>
                          {office.classification === 'telehealth' ? (
                            <Video size={18} className="text-sky-600" />
                          ) : (
                            <Building2 size={18} className="text-stone-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {office.rawName}
                          </p>
                          <p className="text-sm text-stone-500">
                            {office.classification === 'telehealth' ? 'Virtual' : 'In-Person'}
                          </p>
                        </div>
                        {selectedOfficeId === office.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1.5 text-amber-700 bg-amber-200 px-3 py-1.5 rounded-lg"
                          >
                            <span className="text-xs font-semibold">Select location</span>
                            <ArrowRight size={14} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned section */}
              {assignedOffices.length > 0 && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                      Assigned
                    </span>
                    <span className="text-sm text-emerald-600">({assignedOffices.length})</span>
                  </div>
                  <div className="space-y-2">
                    {assignedOffices.map((office) => {
                      const location = getOfficeLocation(office.id);
                      return (
                        <div
                          key={office.id}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white border border-stone-150"
                        >
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${office.classification === 'telehealth' ? 'bg-sky-50' : 'bg-stone-50'}
                          `}>
                            {office.classification === 'telehealth' ? (
                              <Video size={18} className="text-sky-500" />
                            ) : (
                              <Building2 size={18} className="text-stone-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-600 truncate">
                              {office.rawName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                            <Check size={14} />
                            <span className="text-sm font-medium truncate max-w-[100px]">
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
                <div className="p-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Wifi size={24} className="text-stone-400" />
                  </div>
                  <p className="text-base font-medium text-stone-600">No offices synced yet</p>
                  <p className="text-sm text-stone-400 mt-1">Connect SimplePractice to import offices</p>
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
            <div className="px-5 py-4 border-b border-stone-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <MapPin size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-800" style={{ fontFamily: serifFont }}>
                      Your Locations
                    </h3>
                    <p className="text-sm text-stone-500">Where you see clients</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreatingLocation(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add Location
                </motion.button>
              </div>
            </div>

            {/* Locations list */}
            <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {locationGroups.map((location) => {
                  const locationOffices = ehrOffices.filter(o => location.ehrOfficeIds.includes(o.id));
                  const isExpanded = expandedGroupId === location.id;
                  const isAssignMode = selectedOfficeId !== null;

                  return (
                    <motion.div
                      key={location.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`
                        rounded-xl overflow-hidden transition-all duration-200
                        ${location.isPrimary
                          ? 'border-2 border-amber-300 bg-amber-50/40'
                          : 'border border-stone-200 bg-white'
                        }
                        ${isAssignMode ? 'hover:border-amber-400 hover:bg-amber-50 cursor-pointer' : ''}
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
                          w-full px-4 py-4 flex items-center gap-4 text-left transition-colors
                          ${isAssignMode ? '' : 'hover:bg-stone-50'}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                          ${location.type === 'telehealth' ? 'bg-sky-100' : 'bg-stone-100'}
                        `}>
                          {location.type === 'telehealth' ? (
                            <Video size={22} className="text-sky-600" />
                          ) : (
                            <Building2 size={22} className="text-stone-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-stone-800" style={{ fontFamily: serifFont }}>
                              {location.name}
                            </span>
                            {location.isPrimary && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200 text-amber-800 text-xs font-semibold">
                                <Star size={10} className="fill-current" />
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-500 mt-0.5">
                            {location.type === 'telehealth' ? 'Telehealth' : 'In-Person'}
                            {location.address && ` · ${location.address}`}
                            {' · '}
                            {locationOffices.length === 0
                              ? 'No offices assigned'
                              : `${locationOffices.length} office${locationOffices.length !== 1 ? 's' : ''}`}
                          </p>
                        </div>

                        {/* Show chevron only in non-assign mode */}
                        {!isAssignMode && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight size={20} className="text-stone-400" />
                          </motion.div>
                        )}

                        {/* Subtle indicator in assign mode */}
                        {isAssignMode && (
                          <Plus size={20} className="text-amber-500" />
                        )}
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && !isAssignMode && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-stone-100">
                              {/* Assigned offices */}
                              {locationOffices.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                  {locationOffices.map(office => (
                                    <div
                                      key={office.id}
                                      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-stone-50 group"
                                    >
                                      <div className="flex items-center gap-3">
                                        {office.classification === 'telehealth' ? (
                                          <Video size={16} className="text-sky-500" />
                                        ) : (
                                          <Building2 size={16} className="text-stone-400" />
                                        )}
                                        <span className="text-sm text-stone-700">{office.rawName}</span>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveFromLocation(office.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-500 transition-all"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-stone-500 py-4 text-center bg-stone-50 rounded-lg mb-4">
                                  Select an office from the left to assign it here
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                                {!location.isPrimary && (
                                  <button
                                    onClick={() => handleSetPrimary(location.id)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-amber-700 hover:bg-amber-50 transition-all"
                                  >
                                    <Star size={14} />
                                    Set as primary
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteLocation(location.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all ml-auto"
                                >
                                  <Trash2 size={14} />
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
                    className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-5"
                  >
                    <h4 className="text-base font-semibold text-stone-800 mb-4" style={{ fontFamily: serifFont }}>
                      New Location
                    </h4>

                    {/* Location Type Toggle - PROMINENT */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Location Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewLocationType('in-person')}
                          className={`
                            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                            ${newLocationType === 'in-person'
                              ? 'bg-stone-800 text-white shadow-md'
                              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                            }
                          `}
                        >
                          <Building2 size={18} />
                          In-Person
                        </button>
                        <button
                          onClick={() => setNewLocationType('telehealth')}
                          className={`
                            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                            ${newLocationType === 'telehealth'
                              ? 'bg-sky-500 text-white shadow-md'
                              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                            }
                          `}
                        >
                          <Video size={18} />
                          Telehealth
                        </button>
                      </div>
                    </div>

                    {/* Location Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Location Name
                      </label>
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
                        className="w-full px-4 py-3 rounded-xl text-base text-stone-800 bg-white border border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                      />
                    </div>

                    {/* Address (only for in-person) */}
                    {newLocationType === 'in-person' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Address <span className="text-stone-400 font-normal">(optional)</span>
                        </label>
                        <input
                          value={newLocationAddress}
                          onChange={(e) => setNewLocationAddress(e.target.value)}
                          placeholder="e.g., 123 Main St, New York, NY 10001"
                          className="w-full px-4 py-3 rounded-xl text-base text-stone-800 bg-white border border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setCreatingLocation(false);
                          setNewLocationName('');
                          setNewLocationAddress('');
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateLocation}
                        disabled={!newLocationName.trim()}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Create Location
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {locationGroups.length === 0 && !creatingLocation && (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-stone-100 flex items-center justify-center">
                    <MapPin size={24} className="text-stone-400" />
                  </div>
                  <p className="text-base font-medium text-stone-700 mb-1" style={{ fontFamily: serifFont }}>
                    No locations yet
                  </p>
                  <p className="text-sm text-stone-500 mb-5">
                    Create a location to start mapping your offices
                  </p>
                  <button
                    onClick={() => setCreatingLocation(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                    Create your first location
                  </button>
                </div>
              )}

              {/* Add location button (when locations exist but not creating) */}
              {locationGroups.length > 0 && !creatingLocation && (
                <button
                  onClick={() => setCreatingLocation(true)}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-500 hover:text-stone-700 flex items-center justify-center gap-2 transition-all text-sm font-medium"
                >
                  <Plus size={18} />
                  Add another location
                </button>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default OfficeMapping;
