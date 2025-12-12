import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Target,
  Sliders,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronRight,
  Building2,
  UserCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  Award,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

// =============================================================================
// PRACTICE CONFIGURATION COMPONENT
// =============================================================================
// A comprehensive, elegantly designed configuration panel for practice owners.
// Manages locations, team structure, clinician settings, goals, and thresholds.
// =============================================================================

// Types
interface Location {
  id: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

interface Clinician {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  licenseType: string;
  supervisorId: string | null;
  isActive: boolean;
  startDate: string;
  sessionGoal: number;
  clientGoal: number;
  takeRate: number;
}

interface PracticeGoals {
  monthlyRevenue: number;
  monthlySessions: number;
  targetRebookRate: number;
  noteDeadlineHours: number;
}

interface MetricThresholds {
  revenueHealthy: number;
  revenueCritical: number;
  rebookHealthy: number;
  rebookCritical: number;
  notesHealthy: number;
  notesCritical: number;
  atRiskLow: number;
  atRiskMedium: number;
  atRiskHigh: number;
  churnDays: number;
}

// Configuration tabs
type ConfigTab = 'locations' | 'team' | 'clinicians' | 'goals' | 'thresholds';

const CONFIG_TABS: { id: ConfigTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'locations', label: 'Locations', icon: MapPin, description: 'Practice locations' },
  { id: 'team', label: 'Team Structure', icon: Users, description: 'Supervisors & hierarchy' },
  { id: 'clinicians', label: 'Clinicians', icon: UserCircle, description: 'Goals & compensation' },
  { id: 'goals', label: 'Practice Goals', icon: Target, description: 'Revenue & session targets' },
  { id: 'thresholds', label: 'Thresholds', icon: Sliders, description: 'Health indicators' },
];

// Mock data
const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: 'Main Office', address: '123 Wellness Way, Durham, NC 27701', isPrimary: true },
  { id: '2', name: 'Chapel Hill', address: '456 Therapy Lane, Chapel Hill, NC 27514', isPrimary: false },
];

const MOCK_CLINICIANS: Clinician[] = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', color: '#a855f7', role: 'Clinical Director', licenseType: 'PhD, Licensed Psychologist', supervisorId: null, isActive: true, startDate: '2021-03-15', sessionGoal: 40, clientGoal: 30, takeRate: 45 },
  { id: '2', name: 'Maria Rodriguez', initials: 'MR', color: '#06b6d4', role: 'Senior Therapist', licenseType: 'LCSW', supervisorId: '1', isActive: true, startDate: '2022-01-10', sessionGoal: 35, clientGoal: 28, takeRate: 55 },
  { id: '3', name: 'Priya Patel', initials: 'PP', color: '#f59e0b', role: 'Therapist', licenseType: 'LPC', supervisorId: '1', isActive: true, startDate: '2023-02-20', sessionGoal: 32, clientGoal: 25, takeRate: 50 },
  { id: '4', name: 'James Kim', initials: 'JK', color: '#ec4899', role: 'Associate Therapist', licenseType: 'LMFT', supervisorId: '2', isActive: true, startDate: '2024-01-08', sessionGoal: 28, clientGoal: 22, takeRate: 45 },
  { id: '5', name: 'Michael Johnson', initials: 'MJ', color: '#10b981', role: 'Associate Therapist', licenseType: 'APC', supervisorId: '3', isActive: true, startDate: '2024-05-01', sessionGoal: 25, clientGoal: 20, takeRate: 40 },
];

const MOCK_PRACTICE_GOALS: PracticeGoals = {
  monthlyRevenue: 150000,
  monthlySessions: 700,
  targetRebookRate: 85,
  noteDeadlineHours: 72,
};

const MOCK_THRESHOLDS: MetricThresholds = {
  revenueHealthy: 95,
  revenueCritical: 80,
  rebookHealthy: 85,
  rebookCritical: 75,
  notesHealthy: 10,
  notesCritical: 20,
  atRiskLow: 7,
  atRiskMedium: 14,
  atRiskHigh: 21,
  churnDays: 30,
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Elegant Input Field
const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', prefix, suffix, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-stone-600">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-stone-50 border-2 border-transparent
          text-stone-800 font-medium
          placeholder:text-stone-300
          focus:outline-none focus:border-amber-300 focus:bg-white
          transition-all duration-200
          ${prefix ? 'pl-8' : ''}
          ${suffix ? 'pr-12' : ''}
        `}
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// Slider Input with visual feedback
const SliderInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix?: string;
  colorStart?: string;
  colorEnd?: string;
}> = ({ label, value, onChange, min, max, suffix = '%', colorStart = '#10b981', colorEnd = '#ef4444' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-600">{label}</label>
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            color: `color-mix(in srgb, ${colorStart} ${100 - percentage}%, ${colorEnd})`,
          }}
        >
          {value}{suffix}
        </span>
      </div>
      <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colorStart} 0%, ${colorEnd} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-stone-200"
          style={{ left: `calc(${percentage}% - 10px)` }}
          whileHover={{ scale: 1.2 }}
        />
      </div>
    </div>
  );
};

// Card wrapper with elegant styling
const ConfigCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  accent?: string;
}> = ({ children, className = '', accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative bg-white rounded-2xl overflow-hidden ${className}`}
    style={{
      boxShadow: `
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 4px 12px rgba(0, 0, 0, 0.03),
        0 0 0 1px rgba(0, 0, 0, 0.03)
      `,
    }}
  >
    {accent && (
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: accent }}
      />
    )}
    {children}
  </motion.div>
);

// =============================================================================
// LOCATIONS TAB
// =============================================================================
const LocationsTab: React.FC<{
  locations: Location[];
  onUpdate: (locations: Location[]) => void;
}> = ({ locations, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });

  const handleAdd = () => {
    if (newLocation.name && newLocation.address) {
      const newLoc: Location = {
        id: Date.now().toString(),
        name: newLocation.name,
        address: newLocation.address,
        isPrimary: locations.length === 0,
      };
      onUpdate([...locations, newLoc]);
      setNewLocation({ name: '', address: '' });
      setShowAddForm(false);
    }
  };

  const handleSetPrimary = (id: string) => {
    onUpdate(locations.map(loc => ({ ...loc, isPrimary: loc.id === id })));
  };

  const handleDelete = (id: string) => {
    const remaining = locations.filter(loc => loc.id !== id);
    if (remaining.length > 0 && locations.find(l => l.id === id)?.isPrimary) {
      remaining[0].isPrimary = true;
    }
    onUpdate(remaining);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Practice Locations
          </h3>
          <p className="text-stone-500 mt-1">Manage your physical office locations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Plus size={18} />
          Add Location
        </motion.button>
      </div>

      {/* Location Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <ConfigCard accent={location.isPrimary ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' : undefined}>
                <div className="p-5 flex items-center gap-5">
                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      ${location.isPrimary ? 'bg-amber-50' : 'bg-stone-50'}
                    `}
                  >
                    <Building2
                      size={24}
                      className={location.isPrimary ? 'text-amber-600' : 'text-stone-400'}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4
                        className="text-lg font-bold text-stone-800"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {location.name}
                      </h4>
                      {location.isPrimary && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-stone-500 text-sm mt-1 truncate">{location.address}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!location.isPrimary && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSetPrimary(location.id)}
                        className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Set as primary"
                      >
                        <Award size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingId(location.id)}
                      className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                    >
                      <Pencil size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(location.id)}
                      className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </ConfigCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {locations.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-stone-100 flex items-center justify-center">
              <MapPin size={32} className="text-stone-300" />
            </div>
            <h4
              className="text-xl font-bold text-stone-600 mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              No locations yet
            </h4>
            <p className="text-stone-400 mb-6">Add your first practice location to get started</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-xl font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              Add Location
            </motion.button>
          </motion.div>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ConfigCard accent="linear-gradient(90deg, #10b981 0%, #34d399 100%)">
                <div className="p-6 space-y-5">
                  <h4
                    className="text-lg font-bold text-stone-800"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Add New Location
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Location Name"
                      value={newLocation.name}
                      onChange={(v) => setNewLocation(prev => ({ ...prev, name: v }))}
                      placeholder="e.g., Main Office"
                    />
                    <InputField
                      label="Address"
                      value={newLocation.address}
                      onChange={(v) => setNewLocation(prev => ({ ...prev, address: v }))}
                      placeholder="123 Main St, City, State ZIP"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAdd}
                      className="px-5 py-2.5 rounded-xl font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Check size={18} />
                        Save Location
                      </span>
                    </motion.button>
                  </div>
                </div>
              </ConfigCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =============================================================================
// TEAM STRUCTURE TAB
// =============================================================================
const TeamStructureTab: React.FC<{
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}> = ({ clinicians, onUpdate }) => {
  // Build hierarchy
  const supervisors = clinicians.filter(c => !c.supervisorId);
  const getSuperviseesOf = (id: string) => clinicians.filter(c => c.supervisorId === id);

  const handleUpdateSupervisor = (clinicianId: string, newSupervisorId: string | null) => {
    onUpdate(clinicians.map(c =>
      c.id === clinicianId ? { ...c, supervisorId: newSupervisorId } : c
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3
          className="text-2xl font-bold text-stone-800"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Team Structure
        </h3>
        <p className="text-stone-500 mt-1">Manage supervisor relationships and clinical hierarchy</p>
      </div>

      {/* Hierarchy Visualization */}
      <div className="space-y-6">
        {supervisors.map((supervisor, sIdx) => (
          <motion.div
            key={supervisor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.1 }}
          >
            <ConfigCard>
              {/* Supervisor Header */}
              <div
                className="p-5 border-b border-stone-100"
                style={{
                  background: `linear-gradient(135deg, ${supervisor.color}08 0%, transparent 100%)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${supervisor.color} 0%, ${supervisor.color}cc 100%)`,
                      boxShadow: `0 4px 12px ${supervisor.color}40`,
                    }}
                  >
                    {supervisor.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4
                        className="text-lg font-bold text-stone-800"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {supervisor.name}
                      </h4>
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${supervisor.color}15`,
                          color: supervisor.color,
                        }}
                      >
                        Supervisor
                      </span>
                    </div>
                    <p className="text-stone-500 text-sm mt-0.5">{supervisor.role} · {supervisor.licenseType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      {getSuperviseesOf(supervisor.id).length}
                    </p>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Supervisees</p>
                  </div>
                </div>
              </div>

              {/* Supervisees */}
              <div className="divide-y divide-stone-50">
                {getSuperviseesOf(supervisor.id).map((supervisee, idx) => (
                  <motion.div
                    key={supervisee.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sIdx * 0.1 + idx * 0.05 }}
                    className="p-4 pl-8 flex items-center gap-4 hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Connection line visual */}
                    <div className="relative">
                      <div className="absolute -left-4 top-1/2 w-3 h-px bg-stone-200" />
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${supervisee.color} 0%, ${supervisee.color}cc 100%)`,
                        }}
                      >
                        {supervisee.initials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-700">{supervisee.name}</p>
                      <p className="text-sm text-stone-400">{supervisee.role}</p>
                    </div>

                    {/* Reassign dropdown */}
                    <select
                      value={supervisee.supervisorId || ''}
                      onChange={(e) => handleUpdateSupervisor(supervisee.id, e.target.value || null)}
                      className="px-3 py-2 rounded-lg bg-stone-50 border-0 text-sm text-stone-600 font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">No Supervisor</option>
                      {clinicians.filter(c => c.id !== supervisee.id && !c.supervisorId).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </motion.div>
                ))}

                {getSuperviseesOf(supervisor.id).length === 0 && (
                  <div className="p-6 text-center text-stone-400 text-sm">
                    No supervisees assigned
                  </div>
                )}
              </div>
            </ConfigCard>
          </motion.div>
        ))}

        {/* Unassigned Clinicians */}
        {clinicians.filter(c => c.supervisorId && !supervisors.find(s => s.id === c.supervisorId)).length > 0 && (
          <ConfigCard accent="linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} className="text-amber-500" />
                <h4 className="font-bold text-stone-700">Unassigned Clinicians</h4>
              </div>
              <p className="text-sm text-stone-500">
                These clinicians need to be assigned to a supervisor.
              </p>
            </div>
          </ConfigCard>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// CLINICIANS TAB
// =============================================================================
const CliniciansTab: React.FC<{
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}> = ({ clinicians, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Clinician>>({});

  const handleStartEdit = (clinician: Clinician) => {
    setEditingId(clinician.id);
    setEditForm(clinician);
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      onUpdate(clinicians.map(c => c.id === editingId ? { ...c, ...editForm } : c));
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleToggleActive = (id: string) => {
    onUpdate(clinicians.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3
          className="text-2xl font-bold text-stone-800"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Clinician Configuration
        </h3>
        <p className="text-stone-500 mt-1">Set individual goals, compensation rates, and credentials</p>
      </div>

      {/* Clinician Cards */}
      <div className="grid gap-4">
        {clinicians.map((clinician, index) => (
          <motion.div
            key={clinician.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ConfigCard>
              <AnimatePresence mode="wait">
                {editingId === clinician.id ? (
                  // Edit Mode
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: clinician.color }}
                      >
                        {clinician.initials}
                      </div>
                      <div>
                        <h4
                          className="text-lg font-bold text-stone-800"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          Editing {clinician.name}
                        </h4>
                        <p className="text-sm text-stone-500">{clinician.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                      <InputField
                        label="Weekly Session Goal"
                        type="number"
                        value={editForm.sessionGoal || 0}
                        onChange={(v) => setEditForm(prev => ({ ...prev, sessionGoal: Number(v) }))}
                        suffix="sessions"
                      />
                      <InputField
                        label="Client Goal"
                        type="number"
                        value={editForm.clientGoal || 0}
                        onChange={(v) => setEditForm(prev => ({ ...prev, clientGoal: Number(v) }))}
                        suffix="clients"
                      />
                      <InputField
                        label="Take Rate"
                        type="number"
                        value={editForm.takeRate || 0}
                        onChange={(v) => setEditForm(prev => ({ ...prev, takeRate: Number(v) }))}
                        suffix="%"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <InputField
                        label="Role"
                        value={editForm.role || ''}
                        onChange={(v) => setEditForm(prev => ({ ...prev, role: v }))}
                        placeholder="e.g., Senior Therapist"
                      />
                      <InputField
                        label="License Type"
                        value={editForm.licenseType || ''}
                        onChange={(v) => setEditForm(prev => ({ ...prev, licenseType: v }))}
                        placeholder="e.g., LCSW, LPC, PhD"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="px-5 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveEdit}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Check size={18} />
                          Save Changes
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  // View Mode
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    <div className="flex items-center gap-5">
                      {/* Avatar & Status */}
                      <div className="relative">
                        <div
                          className={`
                            w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg
                            ${!clinician.isActive ? 'opacity-50 grayscale' : ''}
                          `}
                          style={{
                            background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}cc 100%)`,
                            boxShadow: clinician.isActive ? `0 4px 12px ${clinician.color}40` : 'none',
                          }}
                        >
                          {clinician.initials}
                        </div>
                        {!clinician.isActive && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-400 flex items-center justify-center">
                            <X size={12} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4
                            className={`text-lg font-bold ${clinician.isActive ? 'text-stone-800' : 'text-stone-400'}`}
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.name}
                          </h4>
                          {!clinician.isActive && (
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-400 text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-stone-500 text-sm">{clinician.role} · {clinician.licenseType}</p>
                      </div>

                      {/* Quick Stats */}
                      <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.sessionGoal}
                          </p>
                          <p className="text-xs text-stone-400 font-medium">Sessions/wk</p>
                        </div>
                        <div className="w-px h-10 bg-stone-100" />
                        <div className="text-center">
                          <p className="text-xl font-bold text-stone-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.clientGoal}
                          </p>
                          <p className="text-xs text-stone-400 font-medium">Clients</p>
                        </div>
                        <div className="w-px h-10 bg-stone-100" />
                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-600" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            {clinician.takeRate}%
                          </p>
                          <p className="text-xs text-stone-400 font-medium">Take Rate</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleActive(clinician.id)}
                          className={`
                            p-2.5 rounded-xl transition-colors
                            ${clinician.isActive
                              ? 'bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500'
                              : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}
                          `}
                          title={clinician.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {clinician.isActive ? <X size={18} /> : <Check size={18} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartEdit(clinician)}
                          className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                        >
                          <Pencil size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ConfigCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// PRACTICE GOALS TAB
// =============================================================================
const PracticeGoalsTab: React.FC<{
  goals: PracticeGoals;
  onUpdate: (goals: PracticeGoals) => void;
}> = ({ goals, onUpdate }) => {
  const [localGoals, setLocalGoals] = useState(goals);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof PracticeGoals, value: number) => {
    setLocalGoals(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localGoals);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Practice Goals
          </h3>
          <p className="text-stone-500 mt-1">Set your practice-wide performance targets</p>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-5 py-3 rounded-xl font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="flex items-center gap-2">
                <Check size={18} />
                Save Changes
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <ConfigCard accent="linear-gradient(90deg, #10b981 0%, #34d399 100%)">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Monthly Revenue</h4>
                  <p className="text-sm text-stone-500">Target gross revenue per month</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xl font-medium">$</span>
                <input
                  type="number"
                  value={localGoals.monthlyRevenue}
                  onChange={(e) => handleChange('monthlyRevenue', Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-4 rounded-xl bg-stone-50 border-2 border-transparent text-3xl font-bold text-stone-800 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                />
              </div>
              <p className="text-sm text-stone-400 mt-3">
                That's ${Math.round(localGoals.monthlyRevenue / 4).toLocaleString()}/week or ${Math.round(localGoals.monthlyRevenue / 12).toLocaleString()}/year
              </p>
            </div>
          </ConfigCard>
        </motion.div>

        {/* Sessions Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ConfigCard accent="linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Monthly Sessions</h4>
                  <p className="text-sm text-stone-500">Target completed sessions</p>
                </div>
              </div>
              <input
                type="number"
                value={localGoals.monthlySessions}
                onChange={(e) => handleChange('monthlySessions', Number(e.target.value))}
                className="w-full px-4 py-4 rounded-xl bg-stone-50 border-2 border-transparent text-3xl font-bold text-stone-800 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              />
              <p className="text-sm text-stone-400 mt-3">
                That's {Math.round(localGoals.monthlySessions / 4)} sessions/week
              </p>
            </div>
          </ConfigCard>
        </motion.div>

        {/* Rebook Rate Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConfigCard accent="linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <TrendingUp size={24} className="text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Target Rebook Rate</h4>
                  <p className="text-sm text-stone-500">Clients with next appointment scheduled</p>
                </div>
              </div>
              <SliderInput
                label=""
                value={localGoals.targetRebookRate}
                onChange={(v) => handleChange('targetRebookRate', v)}
                min={50}
                max={100}
                colorStart="#f59e0b"
                colorEnd="#10b981"
              />
              <p className="text-sm text-stone-400 mt-3">
                Industry average is 85%
              </p>
            </div>
          </ConfigCard>
        </motion.div>

        {/* Note Deadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ConfigCard accent="linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <FileText size={24} className="text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Note Deadline</h4>
                  <p className="text-sm text-stone-500">Hours after session for note completion</p>
                </div>
              </div>
              <div className="flex gap-3">
                {[24, 48, 72, 96].map((hours) => (
                  <motion.button
                    key={hours}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChange('noteDeadlineHours', hours)}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg transition-all
                      ${localGoals.noteDeadlineHours === hours
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}
                    `}
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      boxShadow: localGoals.noteDeadlineHours === hours ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                    }}
                  >
                    {hours}h
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-stone-400 mt-3">
                {localGoals.noteDeadlineHours === 24 && 'Strict compliance standard'}
                {localGoals.noteDeadlineHours === 48 && 'Standard practice policy'}
                {localGoals.noteDeadlineHours === 72 && 'Common 3-day policy'}
                {localGoals.noteDeadlineHours === 96 && 'Lenient 4-day policy'}
              </p>
            </div>
          </ConfigCard>
        </motion.div>
      </div>
    </div>
  );
};

// =============================================================================
// METRIC THRESHOLDS TAB
// =============================================================================
const MetricThresholdsTab: React.FC<{
  thresholds: MetricThresholds;
  onUpdate: (thresholds: MetricThresholds) => void;
}> = ({ thresholds, onUpdate }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof MetricThresholds, value: number) => {
    setLocalThresholds(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localThresholds);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Metric Thresholds
          </h3>
          <p className="text-stone-500 mt-1">Define when metrics show as healthy, attention, or critical</p>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-5 py-3 rounded-xl font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="flex items-center gap-2">
                <Check size={18} />
                Save Changes
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Thresholds Sections */}
      <div className="space-y-6">
        {/* Revenue Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ConfigCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <h4 className="font-bold text-stone-800">Revenue Status</h4>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 w-32">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-stone-600">Healthy</span>
                  </div>
                  <div className="flex-1">
                    <SliderInput
                      label=""
                      value={localThresholds.revenueHealthy}
                      onChange={(v) => handleChange('revenueHealthy', v)}
                      min={50}
                      max={100}
                      suffix="% of goal"
                      colorStart="#10b981"
                      colorEnd="#10b981"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 w-32">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm font-medium text-stone-600">Critical</span>
                  </div>
                  <div className="flex-1">
                    <SliderInput
                      label=""
                      value={localThresholds.revenueCritical}
                      onChange={(v) => handleChange('revenueCritical', v)}
                      min={50}
                      max={100}
                      suffix="% of goal"
                      colorStart="#ef4444"
                      colorEnd="#ef4444"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="mt-6 p-4 rounded-xl bg-stone-50">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Preview</p>
                <div className="flex items-center gap-2 h-4 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${localThresholds.revenueCritical}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${localThresholds.revenueHealthy - localThresholds.revenueCritical}%` }} />
                  <div className="h-full bg-emerald-500 flex-1" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-stone-400">
                  <span>0%</span>
                  <span>{localThresholds.revenueCritical}%</span>
                  <span>{localThresholds.revenueHealthy}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </ConfigCard>
        </motion.div>

        {/* At-Risk Client Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ConfigCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">At-Risk Client Definitions</h4>
                  <p className="text-sm text-stone-500">Days since last session without upcoming appointment</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Low Risk</p>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      value={localThresholds.atRiskLow}
                      onChange={(e) => handleChange('atRiskLow', Number(e.target.value))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-emerald-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-emerald-600 text-sm">days</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-100">
                  <p className="text-sm font-semibold text-amber-700 mb-2">Medium Risk</p>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      value={localThresholds.atRiskMedium}
                      onChange={(e) => handleChange('atRiskMedium', Number(e.target.value))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-amber-700 border-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-amber-600 text-sm">days</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-100">
                  <p className="text-sm font-semibold text-rose-700 mb-2">High Risk</p>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      value={localThresholds.atRiskHigh}
                      onChange={(e) => handleChange('atRiskHigh', Number(e.target.value))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-rose-700 border-0 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-rose-600 text-sm">days</span>
                  </div>
                </div>
              </div>
            </div>
          </ConfigCard>
        </motion.div>

        {/* Churn Definition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConfigCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-rose-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Churn Definition</h4>
                  <p className="text-sm text-stone-500">When to consider a client as churned</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-stone-600">Client is churned after</p>
                <input
                  type="number"
                  value={localThresholds.churnDays}
                  onChange={(e) => handleChange('churnDays', Number(e.target.value))}
                  className="w-20 bg-stone-50 rounded-xl px-4 py-3 text-2xl font-bold text-stone-800 border-2 border-transparent focus:outline-none focus:border-amber-300 focus:bg-white transition-all text-center"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                />
                <p className="text-stone-600">days without an appointment and none scheduled</p>
              </div>
            </div>
          </ConfigCard>
        </motion.div>

        {/* Rebook & Notes Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ConfigCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Sliders size={20} className="text-blue-600" />
                </div>
                <h4 className="font-bold text-stone-800">Additional Thresholds</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-stone-600">Rebook Rate</p>
                  <SliderInput
                    label="Healthy above"
                    value={localThresholds.rebookHealthy}
                    onChange={(v) => handleChange('rebookHealthy', v)}
                    min={50}
                    max={100}
                    colorStart="#10b981"
                    colorEnd="#10b981"
                  />
                  <SliderInput
                    label="Critical below"
                    value={localThresholds.rebookCritical}
                    onChange={(v) => handleChange('rebookCritical', v)}
                    min={50}
                    max={100}
                    colorStart="#ef4444"
                    colorEnd="#ef4444"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-stone-600">Notes Overdue</p>
                  <SliderInput
                    label="Healthy below"
                    value={localThresholds.notesHealthy}
                    onChange={(v) => handleChange('notesHealthy', v)}
                    min={0}
                    max={50}
                    suffix=" notes"
                    colorStart="#10b981"
                    colorEnd="#10b981"
                  />
                  <SliderInput
                    label="Critical above"
                    value={localThresholds.notesCritical}
                    onChange={(v) => handleChange('notesCritical', v)}
                    min={0}
                    max={50}
                    suffix=" notes"
                    colorStart="#ef4444"
                    colorEnd="#ef4444"
                  />
                </div>
              </div>
            </div>
          </ConfigCard>
        </motion.div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const PracticeConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('locations');
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [clinicians, setClinicians] = useState<Clinician[]>(MOCK_CLINICIANS);
  const [practiceGoals, setPracticeGoals] = useState<PracticeGoals>(MOCK_PRACTICE_GOALS);
  const [thresholds, setThresholds] = useState<MetricThresholds>(MOCK_THRESHOLDS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: `
          0 1px 2px rgba(0, 0, 0, 0.04),
          0 2px 4px rgba(0, 0, 0, 0.03),
          0 4px 8px rgba(0, 0, 0, 0.02),
          0 0 0 1px rgba(0, 0, 0, 0.04)
        `,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 border-b border-stone-100"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Building2 size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Practice Configuration
            </h3>
            <p className="text-sm text-stone-500 mt-0.5">
              Customize your practice structure, goals, and metrics
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'}
                `}
                style={{
                  boxShadow: isActive
                    ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                    : 'none',
                }}
              >
                <Icon size={16} className={isActive ? 'text-amber-500' : ''} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'locations' && (
            <motion.div
              key="locations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <LocationsTab locations={locations} onUpdate={setLocations} />
            </motion.div>
          )}
          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TeamStructureTab clinicians={clinicians} onUpdate={setClinicians} />
            </motion.div>
          )}
          {activeTab === 'clinicians' && (
            <motion.div
              key="clinicians"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CliniciansTab clinicians={clinicians} onUpdate={setClinicians} />
            </motion.div>
          )}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PracticeGoalsTab goals={practiceGoals} onUpdate={setPracticeGoals} />
            </motion.div>
          )}
          {activeTab === 'thresholds' && (
            <motion.div
              key="thresholds"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <MetricThresholdsTab thresholds={thresholds} onUpdate={setThresholds} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PracticeConfiguration;
