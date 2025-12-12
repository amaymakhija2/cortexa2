import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Building2,
  UserCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  Award,
  RefreshCw,
  Link2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { PageHeader, PageContent, Grid, AnimatedSection } from './design-system';

// =============================================================================
// PRACTICE CONFIGURATION PAGE
// =============================================================================
// Full-page configuration experience for practice owners.
// Manages locations, team structure, clinician settings, goals, thresholds, and EHR.
// Follows the same structure as Practice Analysis with tabbed navigation.
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
  // Client status definition
  clientDefinitionType: 'status-based' | 'activity-based';
  activityThresholdDays: number;
  // At-risk thresholds
  atRiskLow: number;
  atRiskMedium: number;
  atRiskHigh: number;
  // Churn definition
  churnDays: number;
  // Churn timing (by session count)
  earlyChurnSessions: number;
  lateChurnSessions: number;
  // Late cancel window
  lateCancelHours: number;
  // Note deadline
  noteDeadlineDays: number;
  // Performance thresholds
  revenueHealthy: number;
  revenueCritical: number;
  rebookHealthy: number;
  rebookCritical: number;
}

interface EHRConnection {
  provider: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  nextSyncAvailable: string;
  totalClients: number;
  totalClinicians: number;
}

// Tab types matching URL params
type ConfigTab = 'locations' | 'team' | 'clinicians' | 'goals' | 'thresholds' | 'ehr';

const CONFIG_TABS: { id: ConfigTab; label: string }[] = [
  { id: 'locations', label: 'Locations' },
  { id: 'team', label: 'Team Structure' },
  { id: 'clinicians', label: 'Clinicians' },
  { id: 'goals', label: 'Practice Goals' },
  { id: 'thresholds', label: 'Thresholds' },
  { id: 'ehr', label: 'EHR Connection' },
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
  // Client status definition
  clientDefinitionType: 'status-based',
  activityThresholdDays: 30,
  // At-risk thresholds
  atRiskLow: 7,
  atRiskMedium: 14,
  atRiskHigh: 21,
  // Churn definition
  churnDays: 30,
  // Churn timing (by session count)
  earlyChurnSessions: 5,
  lateChurnSessions: 15,
  // Late cancel window
  lateCancelHours: 24,
  // Note deadline
  noteDeadlineDays: 3,
  // Performance thresholds
  revenueHealthy: 95,
  revenueCritical: 80,
  rebookHealthy: 85,
  rebookCritical: 75,
};

const MOCK_EHR: EHRConnection = {
  provider: 'SimplePractice',
  status: 'connected',
  lastSync: '2024-12-12T06:00:00Z',
  nextSyncAvailable: '2024-12-13T06:00:00Z',
  totalClients: 156,
  totalClinicians: 5,
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Config Card - elegant card wrapper
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

// Input Field
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

// Slider Input
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

// =============================================================================
// TAB CONTENT COMPONENTS
// =============================================================================

// Locations Tab
const LocationsTab: React.FC<{
  locations: Location[];
  onUpdate: (locations: Location[]) => void;
}> = ({ locations, onUpdate }) => {
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
    <PageContent>
      {/* Section Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Practice Locations
            </h2>
            <p className="text-stone-500 text-lg mt-1">Manage your physical office locations</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Plus size={20} />
            Add Location
          </motion.button>
        </div>
      </AnimatedSection>

      {/* Location Cards */}
      <Grid cols={2}>
        <AnimatePresence mode="popLayout">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <ConfigCard accent={location.isPrimary ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' : undefined}>
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                        ${location.isPrimary ? 'bg-amber-50' : 'bg-stone-50'}
                      `}
                    >
                      <Building2
                        size={28}
                        className={location.isPrimary ? 'text-amber-600' : 'text-stone-400'}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-xl font-bold text-stone-800"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          {location.name}
                        </h3>
                        {location.isPrimary && (
                          <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-base">{location.address}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-5 pt-5 border-t border-stone-100">
                    {!location.isPrimary && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSetPrimary(location.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium"
                      >
                        <Award size={16} />
                        Set Primary
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(location.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium ml-auto"
                    >
                      <Trash2 size={16} />
                      Remove
                    </motion.button>
                  </div>
                </div>
              </ConfigCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-2"
            >
              <ConfigCard accent="linear-gradient(90deg, #10b981 0%, #34d399 100%)">
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-stone-800 mb-6"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Add New Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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
                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-3 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAdd}
                      className="px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Check size={18} />
                      Save Location
                    </motion.button>
                  </div>
                </div>
              </ConfigCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {locations.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-stone-100 flex items-center justify-center">
              <MapPin size={40} className="text-stone-300" />
            </div>
            <h3
              className="text-2xl font-bold text-stone-600 mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              No locations yet
            </h3>
            <p className="text-stone-400 text-lg mb-8">Add your first practice location to get started</p>
          </motion.div>
        )}
      </Grid>
    </PageContent>
  );
};

// Team Structure Tab
const TeamStructureTab: React.FC<{
  clinicians: Clinician[];
  onUpdate: (clinicians: Clinician[]) => void;
}> = ({ clinicians, onUpdate }) => {
  const supervisors = clinicians.filter(c => !c.supervisorId);
  const getSuperviseesOf = (id: string) => clinicians.filter(c => c.supervisorId === id);

  const handleUpdateSupervisor = (clinicianId: string, newSupervisorId: string | null) => {
    onUpdate(clinicians.map(c =>
      c.id === clinicianId ? { ...c, supervisorId: newSupervisorId } : c
    ));
  };

  return (
    <PageContent>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Team Structure
          </h2>
          <p className="text-stone-500 text-lg mt-1">Manage supervisor relationships and clinical hierarchy</p>
        </div>
      </AnimatedSection>

      <div className="space-y-6">
        {supervisors.map((supervisor, sIdx) => (
          <AnimatedSection key={supervisor.id} delay={sIdx * 0.1}>
            <ConfigCard>
              {/* Supervisor Header */}
              <div
                className="p-6 border-b border-stone-100"
                style={{
                  background: `linear-gradient(135deg, ${supervisor.color}08 0%, transparent 100%)`,
                }}
              >
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${supervisor.color} 0%, ${supervisor.color}cc 100%)`,
                      boxShadow: `0 4px 16px ${supervisor.color}40`,
                    }}
                  >
                    {supervisor.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3
                        className="text-2xl font-bold text-stone-800"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {supervisor.name}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${supervisor.color}15`,
                          color: supervisor.color,
                        }}
                      >
                        Supervisor
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1">{supervisor.role} · {supervisor.licenseType}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-4xl font-bold text-stone-800"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {getSuperviseesOf(supervisor.id).length}
                    </p>
                    <p className="text-sm text-stone-400 font-medium uppercase tracking-wide">Supervisees</p>
                  </div>
                </div>
              </div>

              {/* Supervisees */}
              <div className="divide-y divide-stone-50">
                {getSuperviseesOf(supervisor.id).map((supervisee) => (
                  <div
                    key={supervisee.id}
                    className="p-5 pl-10 flex items-center gap-5 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="absolute -left-5 top-1/2 w-4 h-px bg-stone-200" />
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${supervisee.color} 0%, ${supervisee.color}cc 100%)`,
                        }}
                      >
                        {supervisee.initials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-700 text-lg">{supervisee.name}</p>
                      <p className="text-stone-400">{supervisee.role}</p>
                    </div>
                    <select
                      value={supervisee.supervisorId || ''}
                      onChange={(e) => handleUpdateSupervisor(supervisee.id, e.target.value || null)}
                      className="px-4 py-2.5 rounded-xl bg-stone-50 border-0 text-stone-600 font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">No Supervisor</option>
                      {clinicians.filter(c => c.id !== supervisee.id && !c.supervisorId).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {getSuperviseesOf(supervisor.id).length === 0 && (
                  <div className="p-8 text-center text-stone-400">
                    No supervisees assigned
                  </div>
                )}
              </div>
            </ConfigCard>
          </AnimatedSection>
        ))}
      </div>
    </PageContent>
  );
};

// Clinicians Tab
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
    <PageContent>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Clinician Configuration
          </h2>
          <p className="text-stone-500 text-lg mt-1">Set individual goals, compensation rates, and credentials</p>
        </div>
      </AnimatedSection>

      <div className="space-y-4">
        {clinicians.map((clinician, index) => (
          <AnimatedSection key={clinician.id} delay={index * 0.05}>
            <ConfigCard>
              <AnimatePresence mode="wait">
                {editingId === clinician.id ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: clinician.color }}
                      >
                        {clinician.initials}
                      </div>
                      <div>
                        <h3
                          className="text-xl font-bold text-stone-800"
                          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                        >
                          Editing {clinician.name}
                        </h3>
                        <p className="text-stone-500">{clinician.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                        className="px-5 py-3 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveEdit}
                        className="px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <Check size={18} />
                        Save Changes
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="flex items-center gap-6">
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl
                            ${!clinician.isActive ? 'opacity-50 grayscale' : ''}
                          `}
                          style={{
                            background: `linear-gradient(135deg, ${clinician.color} 0%, ${clinician.color}cc 100%)`,
                            boxShadow: clinician.isActive ? `0 4px 16px ${clinician.color}40` : 'none',
                          }}
                        >
                          {clinician.initials}
                        </div>
                        {!clinician.isActive && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-400 flex items-center justify-center">
                            <X size={14} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-xl font-bold ${clinician.isActive ? 'text-stone-800' : 'text-stone-400'}`}
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.name}
                          </h3>
                          {!clinician.isActive && (
                            <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-400 text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-stone-500">{clinician.role} · {clinician.licenseType}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden lg:flex items-center gap-8">
                        <div className="text-center">
                          <p
                            className="text-2xl font-bold text-stone-800"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.sessionGoal}
                          </p>
                          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Sessions/wk</p>
                        </div>
                        <div className="w-px h-12 bg-stone-100" />
                        <div className="text-center">
                          <p
                            className="text-2xl font-bold text-stone-800"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.clientGoal}
                          </p>
                          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Clients</p>
                        </div>
                        <div className="w-px h-12 bg-stone-100" />
                        <div className="text-center">
                          <p
                            className="text-2xl font-bold text-amber-600"
                            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                          >
                            {clinician.takeRate}%
                          </p>
                          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Take Rate</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleActive(clinician.id)}
                          className={`
                            p-3 rounded-xl transition-colors
                            ${clinician.isActive
                              ? 'bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500'
                              : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}
                          `}
                          title={clinician.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {clinician.isActive ? <X size={20} /> : <Check size={20} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartEdit(clinician)}
                          className="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                        >
                          <Pencil size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ConfigCard>
          </AnimatedSection>
        ))}
      </div>
    </PageContent>
  );
};

// Practice Goals Tab
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
    <PageContent>
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Practice Goals
            </h2>
            <p className="text-stone-500 text-lg mt-1">Set your practice-wide performance targets</p>
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
                className="px-6 py-3.5 rounded-xl font-semibold text-white text-lg flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Check size={20} />
                Save Changes
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </AnimatedSection>

      <Grid cols={2}>
        {/* Revenue Goal */}
        <AnimatedSection delay={0.05}>
          <ConfigCard accent="linear-gradient(90deg, #10b981 0%, #34d399 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={28} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Monthly Revenue</h3>
                  <p className="text-stone-500">Target gross revenue per month</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 text-2xl font-medium">$</span>
                <input
                  type="number"
                  value={localGoals.monthlyRevenue}
                  onChange={(e) => handleChange('monthlyRevenue', Number(e.target.value))}
                  className="w-full pl-12 pr-5 py-5 rounded-xl bg-stone-50 border-2 border-transparent text-4xl font-bold text-stone-800 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                />
              </div>
              <p className="text-stone-400 mt-4">
                That's ${Math.round(localGoals.monthlyRevenue * 12).toLocaleString()}/year
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Sessions Goal */}
        <AnimatedSection delay={0.1}>
          <ConfigCard accent="linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar size={28} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Monthly Sessions</h3>
                  <p className="text-stone-500">Target completed sessions</p>
                </div>
              </div>
              <input
                type="number"
                value={localGoals.monthlySessions}
                onChange={(e) => handleChange('monthlySessions', Number(e.target.value))}
                className="w-full px-5 py-5 rounded-xl bg-stone-50 border-2 border-transparent text-4xl font-bold text-stone-800 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              />
              <p className="text-stone-400 mt-4">
                That's {Math.round(localGoals.monthlySessions / 4)} sessions/week
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Rebook Rate Goal */}
        <AnimatedSection delay={0.15}>
          <ConfigCard accent="linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                  <TrendingUp size={28} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Target Rebook Rate</h3>
                  <p className="text-stone-500">Clients with next appointment scheduled</p>
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
              <p className="text-stone-400 mt-4">Industry average is 85%</p>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Note Deadline */}
        <AnimatedSection delay={0.2}>
          <ConfigCard accent="linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center">
                  <FileText size={28} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Note Deadline</h3>
                  <p className="text-stone-500">Hours after session for completion</p>
                </div>
              </div>
              <div className="flex gap-3">
                {[24, 48, 72, 96].map((hours) => (
                  <motion.button
                    key={hours}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChange('noteDeadlineHours', hours)}
                    className={`
                      flex-1 py-5 rounded-xl font-bold text-2xl transition-all
                      ${localGoals.noteDeadlineHours === hours
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}
                    `}
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      boxShadow: localGoals.noteDeadlineHours === hours ? '0 4px 16px rgba(139, 92, 246, 0.3)' : 'none',
                    }}
                  >
                    {hours}h
                  </motion.button>
                ))}
              </div>
              <p className="text-stone-400 mt-4">
                {localGoals.noteDeadlineHours <= 24 && 'Strict compliance standard'}
                {localGoals.noteDeadlineHours === 48 && 'Standard practice policy'}
                {localGoals.noteDeadlineHours === 72 && 'Common 3-day policy'}
                {localGoals.noteDeadlineHours >= 96 && 'Lenient 4-day policy'}
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>
      </Grid>
    </PageContent>
  );
};

// Thresholds Tab
const ThresholdsTab: React.FC<{
  thresholds: MetricThresholds;
  onUpdate: (thresholds: MetricThresholds) => void;
}> = ({ thresholds, onUpdate }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof MetricThresholds>(key: K, value: MetricThresholds[K]) => {
    setLocalThresholds(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localThresholds);
    setHasChanges(false);
  };

  return (
    <PageContent>
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Metric Definitions
            </h2>
            <p className="text-stone-500 text-lg mt-1">Customize how metrics are calculated and displayed</p>
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
                className="px-6 py-3.5 rounded-xl font-semibold text-white text-lg flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Check size={20} />
                Save Changes
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </AnimatedSection>

      <div className="space-y-6">
        {/* Active & Churned Client Definition */}
        <AnimatedSection delay={0.05}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <UserCircle size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Active & Churned Clients</h3>
                  <p className="text-stone-500">How to determine if a client is active or has churned</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status-based option */}
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => handleChange('clientDefinitionType', 'status-based')}
                  className={`w-full p-5 rounded-xl text-left border-2 transition-all ${
                    localThresholds.clientDefinitionType === 'status-based'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      localThresholds.clientDefinitionType === 'status-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                    }`}>
                      {localThresholds.clientDefinitionType === 'status-based' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-lg">SimplePractice Status</p>
                      <p className="text-sm text-stone-500 mt-1">
                        <span className="font-medium text-emerald-600">Active</span> = status is "Active" in SimplePractice
                      </p>
                      <p className="text-sm text-stone-500">
                        <span className="font-medium text-rose-600">Churned</span> = status is "Inactive" with no future appointments
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Activity-based option */}
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => handleChange('clientDefinitionType', 'activity-based')}
                  className={`w-full p-5 rounded-xl text-left border-2 transition-all ${
                    localThresholds.clientDefinitionType === 'activity-based'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      localThresholds.clientDefinitionType === 'activity-based' ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                    }`}>
                      {localThresholds.clientDefinitionType === 'activity-based' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-lg">Activity-Based</p>
                      <p className="text-sm text-stone-500 mt-1">
                        <span className="font-medium text-emerald-600">Active</span> = had an appointment within the threshold below
                      </p>
                      <p className="text-sm text-stone-500">
                        <span className="font-medium text-rose-600">Churned</span> = no appointment within threshold AND none scheduled
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Activity threshold input */}
                {localThresholds.clientDefinitionType === 'activity-based' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between pl-10 pt-2"
                  >
                    <span className="text-stone-600 font-medium">Activity threshold</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={localThresholds.activityThresholdDays}
                        onChange={(e) => handleChange('activityThresholdDays', Math.max(7, Math.min(90, Number(e.target.value))))}
                        className="w-20 px-3 py-2.5 rounded-xl bg-stone-50 border-2 border-transparent text-center text-lg font-bold text-stone-800 focus:outline-none focus:border-amber-300 focus:bg-white transition-all"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      />
                      <span className="text-stone-500 font-medium">days</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* At-Risk Thresholds */}
        <AnimatedSection delay={0.1}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">At-Risk Client Thresholds</h3>
                  <p className="text-stone-500">Days since last session for clients without upcoming appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100">
                  <p className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wide">Low Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskLow}
                      onChange={(e) => handleChange('atRiskLow', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-emerald-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-emerald-600 font-medium">days</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-100">
                  <p className="text-sm font-bold text-amber-700 mb-3 uppercase tracking-wide">Medium Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskMedium}
                      onChange={(e) => handleChange('atRiskMedium', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-amber-700 border-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-amber-600 font-medium">days</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-100">
                  <p className="text-sm font-bold text-rose-700 mb-3 uppercase tracking-wide">High Risk</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={localThresholds.atRiskHigh}
                      onChange={(e) => handleChange('atRiskHigh', Number(e.target.value))}
                      className="w-20 bg-white rounded-xl px-4 py-3 text-3xl font-bold text-rose-700 border-0 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-rose-600 font-medium">days</span>
                  </div>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Churn Timing Categories */}
        <AnimatedSection delay={0.15}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Churn Timing Categories</h3>
                  <p className="text-stone-500">Categorize churned clients by sessions completed before leaving</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-100">
                  <p className="text-sm font-bold text-rose-700 mb-1 uppercase tracking-wide">Early Churn</p>
                  <p className="text-xs text-rose-500 mb-3">Engagement issues</p>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">&lt;</span>
                    <input
                      type="number"
                      value={localThresholds.earlyChurnSessions}
                      onChange={(e) => handleChange('earlyChurnSessions', Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-rose-700 border-0 focus:outline-none focus:ring-2 focus:ring-rose-300 text-center"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-rose-500 text-sm">sessions</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-100">
                  <p className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wide">Medium Churn</p>
                  <p className="text-xs text-amber-500 mb-3">Treatment plateau</p>
                  <p className="text-xl font-bold text-amber-700" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    {localThresholds.earlyChurnSessions} – {localThresholds.lateChurnSessions}
                  </p>
                  <span className="text-amber-500 text-sm">sessions</span>
                </div>

                <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-100">
                  <p className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wide">Late Churn</p>
                  <p className="text-xs text-emerald-500 mb-3">Natural completion</p>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">&gt;</span>
                    <input
                      type="number"
                      value={localThresholds.lateChurnSessions}
                      onChange={(e) => handleChange('lateChurnSessions', Math.max(localThresholds.earlyChurnSessions + 1, Number(e.target.value)))}
                      className="w-16 bg-white rounded-lg px-3 py-2 text-xl font-bold text-emerald-700 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-center"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    />
                    <span className="text-emerald-500 text-sm">sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Other Settings - Late Cancel & Note Deadline */}
        <Grid cols={2}>
          <AnimatedSection delay={0.2}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <X size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800">Late Cancel Window</h3>
                    <p className="text-stone-500">Hours before appointment to count as late</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={localThresholds.lateCancelHours}
                    onChange={(e) => handleChange('lateCancelHours', Math.max(1, Math.min(72, Number(e.target.value))))}
                    className="w-24 bg-stone-50 rounded-xl px-4 py-4 text-3xl font-bold text-stone-800 border-2 border-transparent focus:outline-none focus:border-amber-300 focus:bg-white transition-all text-center"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  />
                  <span className="text-stone-500 font-medium text-lg">hours before</span>
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800">Note Deadline</h3>
                    <p className="text-stone-500">Days after session for note completion</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={localThresholds.noteDeadlineDays}
                    onChange={(e) => handleChange('noteDeadlineDays', Math.max(1, Math.min(14, Number(e.target.value))))}
                    className="w-24 bg-stone-50 rounded-xl px-4 py-4 text-3xl font-bold text-stone-800 border-2 border-transparent focus:outline-none focus:border-amber-300 focus:bg-white transition-all text-center"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  />
                  <span className="text-stone-500 font-medium text-lg">days after session</span>
                </div>
              </div>
            </ConfigCard>
          </AnimatedSection>
        </Grid>

        {/* Revenue & Rebook Thresholds */}
        <Grid cols={2}>
          <AnimatedSection delay={0.3}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <DollarSign size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Revenue Status</h3>
                </div>
                <div className="space-y-6">
                  <SliderInput
                    label="Healthy above"
                    value={localThresholds.revenueHealthy}
                    onChange={(v) => handleChange('revenueHealthy', v)}
                    min={50}
                    max={100}
                    suffix="% of goal"
                    colorStart="#10b981"
                    colorEnd="#10b981"
                  />
                  <SliderInput
                    label="Critical below"
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
            </ConfigCard>
          </AnimatedSection>

          <AnimatedSection delay={0.35}>
            <ConfigCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Rebook Rate Status</h3>
                </div>
                <div className="space-y-6">
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
              </div>
            </ConfigCard>
          </AnimatedSection>
        </Grid>
      </div>
    </PageContent>
  );
};

// EHR Connection Tab
const EHRConnectionTab: React.FC<{
  ehr: EHRConnection;
  onRefresh: () => void;
}> = ({ ehr, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onRefresh();
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeUntilNextSync = () => {
    const now = new Date();
    const next = new Date(ehr.nextSyncAvailable);
    const diff = next.getTime() - now.getTime();
    if (diff <= 0) return 'Available now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <PageContent>
      <AnimatedSection delay={0}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            EHR Connection
          </h2>
          <p className="text-stone-500 text-lg mt-1">Manage your data sync with your practice management system</p>
        </div>
      </AnimatedSection>

      <Grid cols={2}>
        {/* Connection Status Card */}
        <AnimatedSection delay={0.05} className="col-span-2">
          <ConfigCard accent={ehr.status === 'connected' ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'}>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Provider Logo */}
                  <div
                    className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center
                      ${ehr.status === 'connected' ? 'bg-emerald-50' : 'bg-rose-50'}
                    `}
                  >
                    {ehr.status === 'connected' ? (
                      <Wifi size={36} className="text-emerald-600" />
                    ) : (
                      <WifiOff size={36} className="text-rose-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-4">
                      <h3
                        className="text-2xl font-bold text-stone-800"
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                      >
                        {ehr.provider}
                      </h3>
                      <span
                        className={`
                          px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide
                          ${ehr.status === 'connected'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ehr.status === 'syncing'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'}
                        `}
                      >
                        {ehr.status === 'syncing' ? 'Syncing...' : ehr.status}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1">
                      Last synced: {formatDate(ehr.lastSync)}
                    </p>
                  </div>
                </div>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`
                    flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-lg
                    ${isRefreshing
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-800 text-white hover:bg-stone-700'}
                    transition-colors
                  `}
                >
                  <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Syncing...' : 'Refresh Now'}
                </motion.button>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Sync Stats */}
        <AnimatedSection delay={0.1}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Synced Data</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-stone-50 text-center">
                  <p
                    className="text-4xl font-bold text-stone-800"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {ehr.totalClients}
                  </p>
                  <p className="text-stone-500 mt-1">Active Clients</p>
                </div>
                <div className="p-5 rounded-xl bg-stone-50 text-center">
                  <p
                    className="text-4xl font-bold text-stone-800"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {ehr.totalClinicians}
                  </p>
                  <p className="text-stone-500 mt-1">Clinicians</p>
                </div>
              </div>
            </div>
          </ConfigCard>
        </AnimatedSection>

        {/* Next Sync */}
        <AnimatedSection delay={0.15}>
          <ConfigCard>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Next Automatic Sync</h3>
              </div>

              <div className="p-5 rounded-xl bg-amber-50 text-center">
                <p
                  className="text-4xl font-bold text-amber-700"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {getTimeUntilNextSync()}
                </p>
                <p className="text-amber-600 mt-1">
                  {new Date(ehr.nextSyncAvailable) <= new Date()
                    ? 'Manual refresh available'
                    : formatDate(ehr.nextSyncAvailable)}
                </p>
              </div>

              <p className="text-stone-400 text-sm mt-4 text-center">
                Data syncs automatically once per day. Manual refresh available when countdown reaches zero.
              </p>
            </div>
          </ConfigCard>
        </AnimatedSection>
      </Grid>
    </PageContent>
  );
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export const PracticeConfigurationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ConfigTab) || 'locations';

  // State
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [clinicians, setClinicians] = useState<Clinician[]>(MOCK_CLINICIANS);
  const [practiceGoals, setPracticeGoals] = useState<PracticeGoals>(MOCK_PRACTICE_GOALS);
  const [thresholds, setThresholds] = useState<MetricThresholds>(MOCK_THRESHOLDS);
  const [ehr, setEHR] = useState<EHRConnection>(MOCK_EHR);

  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  const handleEHRRefresh = () => {
    setEHR(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
      nextSyncAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Page Header with Tabs */}
      <PageHeader
        accent="amber"
        label="Settings"
        title="Configure"
        subtitle="Set up your practice structure, goals, and metrics"
        tabs={CONFIG_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'locations' && (
          <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LocationsTab locations={locations} onUpdate={setLocations} />
          </motion.div>
        )}
        {activeTab === 'team' && (
          <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TeamStructureTab clinicians={clinicians} onUpdate={setClinicians} />
          </motion.div>
        )}
        {activeTab === 'clinicians' && (
          <motion.div key="clinicians" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CliniciansTab clinicians={clinicians} onUpdate={setClinicians} />
          </motion.div>
        )}
        {activeTab === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PracticeGoalsTab goals={practiceGoals} onUpdate={setPracticeGoals} />
          </motion.div>
        )}
        {activeTab === 'thresholds' && (
          <motion.div key="thresholds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ThresholdsTab thresholds={thresholds} onUpdate={setThresholds} />
          </motion.div>
        )}
        {activeTab === 'ehr' && (
          <motion.div key="ehr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EHRConnectionTab ehr={ehr} onRefresh={handleEHRRefresh} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeConfigurationPage;
