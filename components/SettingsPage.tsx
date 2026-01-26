import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  User,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
  Mail,
  Building2,
  Clock,
  DollarSign,
  UserX,
  Sparkles,
  ExternalLink,
  CreditCard,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Palette,
  Inbox,
} from 'lucide-react';
import { PageHeader } from './design-system';

// ============================================================================
// TOGGLE SWITCH COMPONENT - Refined for dark/light contexts
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        w-14 h-8 rounded-full relative
        transition-all duration-300 ease-out
        ${enabled
          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
          : 'bg-stone-200'}
      `}
      style={{
        boxShadow: enabled
          ? '0 2px 8px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
          : 'inset 0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <motion.div
        layout
        className="w-6 h-6 absolute top-1 bg-white rounded-full flex items-center justify-center"
        animate={{ x: enabled ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {enabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-amber-500"
          />
        )}
      </motion.div>
    </button>
  );
};

// ============================================================================
// SETTING ROW COMPONENT - Refined with better visual hierarchy
// ============================================================================

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  value?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon: Icon,
  label,
  description,
  value,
  children,
  onClick,
  danger = false
}) => {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={{
        backgroundColor: danger ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0, 0, 0, 0.015)',
      }}
      whileTap={isClickable ? { scale: 0.998 } : undefined}
      onClick={onClick}
      className={`
        flex items-center justify-between py-5 px-5
        border-b border-stone-100 last:border-0
        transition-colors duration-200
        ${isClickable ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${danger
            ? 'bg-red-50 text-red-500'
            : 'bg-stone-100 text-stone-500'}
        `}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div>
          <p className={`font-semibold text-[15px] ${danger ? 'text-red-600' : 'text-stone-800'}`}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-stone-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {value && (
          <span className="text-sm text-stone-500 font-medium">{value}</span>
        )}
        {children}
        {isClickable && !children && !value && (
          <ChevronRight size={18} className="text-stone-300" />
        )}
        {isClickable && value && (
          <ChevronRight size={18} className="text-stone-300" />
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// SETTINGS SECTION COMPONENT - Matches app card style
// ============================================================================

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
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
    <div className="px-5 py-3.5 border-b border-stone-100">
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    <div>{children}</div>
  </motion.div>
);

// ============================================================================
// LOGOUT MODAL COMPONENT - Refined modal design
// ============================================================================

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header with gradient */}
            <div
              className="relative h-28 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                >
                  <LogOut size={28} className="text-white" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <h2
                className="text-2xl font-semibold text-stone-800 mb-2"
                style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
              >
                Sign out?
              </h2>
              <p className="text-stone-500 mb-6 text-[15px]">
                You'll need to sign in again to access your practice analytics.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 py-3.5 px-5 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ============================================================================
// PASSWORD CHANGE MODAL - Refined aesthetic
// ============================================================================

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(false);
    }, 1500);
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    onClose();
  };

  // Password input component for consistency
  const PasswordInput = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
    hint,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
    hint?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-stone-200
                     focus:border-stone-800 focus:ring-0 outline-none transition-colors
                     text-stone-800 placeholder:text-stone-300 pr-10"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-400
                     hover:text-stone-600 transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-stone-800
                        group-focus-within:w-full transition-all duration-300" />
      </div>
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed z-50 flex items-center justify-center p-4"
            style={{
              left: '320px', // Sidebar width
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden relative"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(0, 0, 0, 0.03),
                  0 2px 4px rgba(0, 0, 0, 0.02),
                  0 12px 24px rgba(0, 0, 0, 0.06),
                  0 32px 64px rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100
                           transition-colors z-10"
              >
                <X size={18} className="text-stone-400" />
              </button>

              {/* Content */}
              <div className="p-8">
                {success ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                      className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5"
                      style={{ boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}
                    >
                      <Check size={28} className="text-white" strokeWidth={3} />
                    </motion.div>
                    <h3
                      className="text-2xl font-semibold text-stone-800 mb-2"
                      style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                    >
                      Password Updated
                    </h3>
                    <p className="text-stone-500">Your password has been changed successfully.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="mb-8">
                      <h2
                        className="text-2xl font-semibold text-stone-800 mb-1"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        Change Password
                      </h2>
                      <p className="text-stone-500 text-sm">
                        Enter your current password and choose a new one
                      </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6"
                        >
                          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                            <span className="text-red-600 text-sm">{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form */}
                    <div className="space-y-6">
                      <PasswordInput
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        show={showCurrentPassword}
                        onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                        placeholder="Enter current password"
                      />

                      <div className="pt-2 border-t border-stone-100" />

                      <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                        placeholder="Enter new password"
                        hint="Must be at least 8 characters"
                      />

                      <PasswordInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="Confirm new password"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        className="flex-1 py-3.5 px-5 rounded-xl text-stone-600 font-medium
                                   border border-stone-200 hover:border-stone-300 hover:bg-stone-50
                                   transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="flex-1 py-3.5 px-5 rounded-xl font-semibold text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        Update Password
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// TIME ZONE MODAL - Refined aesthetic
// ============================================================================

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern', abbr: 'ET', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central', abbr: 'CT', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain', abbr: 'MT', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific', abbr: 'PT', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska', abbr: 'AKT', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii', abbr: 'HT', offset: 'UTC-10' },
];

interface TimeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimezone: string;
  onSelect: (timezone: string) => void;
}

const TimeZoneModal: React.FC<TimeZoneModalProps> = ({ isOpen, onClose, currentTimezone, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed z-50 flex items-center justify-center p-4"
            style={{
              left: '320px', // Sidebar width
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden relative"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(0, 0, 0, 0.03),
                  0 2px 4px rgba(0, 0, 0, 0.02),
                  0 12px 24px rgba(0, 0, 0, 0.06),
                  0 32px 64px rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100
                           transition-colors z-10"
              >
                <X size={18} className="text-stone-400" />
              </button>

              {/* Content */}
              <div className="p-8 pb-4">
                {/* Header */}
                <div className="mb-6">
                  <h2
                    className="text-2xl font-semibold text-stone-800"
                    style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                  >
                    Time Zone
                  </h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Select your local time zone
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-1">
                  {TIMEZONES.map((tz, index) => {
                    const isSelected = currentTimezone === tz.value;
                    return (
                      <motion.button
                        key={tz.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onSelect(tz.value);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl
                                    transition-all group ${
                                      isSelected
                                        ? 'bg-stone-900'
                                        : 'hover:bg-stone-50'
                                    }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs font-bold tracking-wider w-8 ${
                              isSelected ? 'text-stone-400' : 'text-stone-400'
                            }`}
                          >
                            {tz.abbr}
                          </span>
                          <span
                            className={`font-medium ${
                              isSelected ? 'text-white' : 'text-stone-800'
                            }`}
                          >
                            {tz.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm ${
                              isSelected ? 'text-stone-400' : 'text-stone-400'
                            }`}
                          >
                            {tz.offset}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            >
                              <Check size={12} className="text-stone-900" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer hint */}
              <div className="px-8 py-4 border-t border-stone-100 bg-stone-50/50">
                <p className="text-xs text-stone-400 text-center">
                  Times throughout the app will display in your selected zone
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN SETTINGS PAGE COMPONENT
// ============================================================================

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');


  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="min-h-full flex flex-col">

          {/* =============================================
              DARK HEADER SECTION - Matches app style
              ============================================= */}
          <PageHeader
            accent="violet"
            title="Settings"
            subtitle="Manage your account preferences and practice configuration"
          />

          {/* =============================================
              MAIN CONTENT AREA
              ============================================= */}
          <div className="flex-1 px-6 sm:px-8 lg:pl-[100px] lg:pr-12 py-8 lg:py-10">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Profile Card - Hero style */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 relative overflow-hidden"
                style={{
                  boxShadow: `
                    0 1px 2px rgba(0, 0, 0, 0.04),
                    0 2px 4px rgba(0, 0, 0, 0.03),
                    0 4px 8px rgba(0, 0, 0, 0.02),
                    0 0 0 1px rgba(0, 0, 0, 0.04)
                  `,
                }}
              >
                {/* Subtle accent gradient */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                  }}
                />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative group">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden"
                      style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 0 0 2px rgba(251, 191, 36, 0.2)',
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Status indicator */}
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h2
                        className="text-2xl font-semibold text-stone-800 truncate"
                        style={{ fontFamily: "'Tiempos Headline', Georgia, serif" }}
                      >
                        Sarah Mitchell
                      </h2>
                      <div
                        className="px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        }}
                      >
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <Sparkles size={10} /> PRO
                        </span>
                      </div>
                    </div>
                    <p className="text-amber-600 font-medium text-sm mb-3">Practice Administrator</p>

                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-stone-400" />
                        <span>sarah@harmonywellness.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-stone-400" />
                        <span>Harmony Wellness Center</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    Edit Profile
                  </motion.button>
                </div>
              </motion.div>

              {/* Display Options Section */}
              <SettingsSection title="Display Options" delay={0.05}>
                <SettingRow
                  icon={DollarSign}
                  label="Net Revenue Data"
                  description="Show net revenue, margins, and cost breakdowns"
                >
                  <ToggleSwitch
                    enabled={settings.showNetRevenueData}
                    onChange={(enabled) => updateSettings({ showNetRevenueData: enabled })}
                  />
                </SettingRow>
                <SettingRow
                  icon={Sparkles}
                  label="AI Insight Summaries"
                  description="Show AI-generated executive summaries on analysis tabs"
                >
                  <ToggleSwitch
                    enabled={!settings.hideAIInsights}
                    onChange={(enabled) => updateSettings({ hideAIInsights: !enabled })}
                  />
                </SettingRow>
                <SettingRow
                  icon={UserX}
                  label="Demo Mode"
                  description="Use anonymized clinician names for presentations"
                >
                  <ToggleSwitch
                    enabled={settings.anonymizeClinicianNames}
                    onChange={(enabled) => updateSettings({ anonymizeClinicianNames: enabled })}
                  />
                </SettingRow>
                <SettingRow
                  icon={User}
                  label="Consultation Metrics"
                  description="Show consults booked and conversion rate on Overview"
                >
                  <ToggleSwitch
                    enabled={settings.showConsultationMetrics}
                    onChange={(enabled) => updateSettings({ showConsultationMetrics: enabled })}
                  />
                </SettingRow>
                <SettingRow
                  icon={Palette}
                  label="Illustrated Icons"
                  description="Use illustrated icons in sidebar (vs. minimal line icons)"
                >
                  <ToggleSwitch
                    enabled={settings.iconStyle === 'illustrated'}
                    onChange={(enabled) => updateSettings({ iconStyle: enabled ? 'illustrated' : 'phosphor' })}
                  />
                </SettingRow>
                <SettingRow
                  icon={Inbox}
                  label="Priority Tasks Empty State"
                  description="Preview empty state when no priority tasks exist"
                >
                  <ToggleSwitch
                    enabled={settings.showPriorityTasksEmptyState}
                    onChange={(enabled) => updateSettings({ showPriorityTasksEmptyState: enabled })}
                  />
                </SettingRow>
              </SettingsSection>


              {/* Billing Section */}
              <SettingsSection title="Billing" delay={0.12}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                        }}
                      >
                        <CreditCard size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-stone-800">Cortexa Pro</h4>
                          <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-700 text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-stone-500">$199/month • Unlimited seats</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-stone-800">$199</p>
                      <p className="text-xs text-stone-400">per month</p>
                    </div>
                  </div>

                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      // This would redirect to Stripe Customer Portal
                      window.open('https://billing.stripe.com/p/login/test', '_blank');
                    }}
                  >
                    <ExternalLink size={16} />
                    Manage Billing in Stripe
                  </motion.a>

                  <p className="text-xs text-stone-400 text-center mt-3">
                    Update payment method, view invoices, or cancel subscription
                  </p>
                </div>
              </SettingsSection>

              {/* Preferences Section */}
              <SettingsSection title="Preferences" delay={0.15}>
                <SettingRow
                  icon={Clock}
                  label="Time Zone"
                  value={(() => {
                    const tz = TIMEZONES.find(t => t.value === timezone);
                    return tz ? `${tz.label} (${tz.abbr})` : 'Eastern (ET)';
                  })()}
                  onClick={() => setShowTimeZoneModal(true)}
                />
              </SettingsSection>

              {/* Security Section */}
              <SettingsSection title="Security" delay={0.2}>
                <SettingRow
                  icon={Shield}
                  label="Password"
                  description="Last changed 3 months ago"
                  onClick={() => setShowPasswordModal(true)}
                />
              </SettingsSection>

              {/* Support Section */}
              <SettingsSection title="Support" delay={0.25}>
                <SettingRow
                  icon={HelpCircle}
                  label="Help Center"
                  description="Browse guides and frequently asked questions"
                  onClick={() => {}}
                />
                <SettingRow
                  icon={ExternalLink}
                  label="Contact Support"
                  description="Get help from our team"
                  onClick={() => {}}
                />
              </SettingsSection>

              {/* Sign Out - Standalone danger section */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl overflow-hidden"
                style={{
                  boxShadow: `
                    0 1px 2px rgba(0, 0, 0, 0.04),
                    0 2px 4px rgba(0, 0, 0, 0.03),
                    0 4px 8px rgba(0, 0, 0, 0.02),
                    0 0 0 1px rgba(239, 68, 68, 0.1)
                  `,
                }}
              >
                <SettingRow
                  icon={LogOut}
                  label="Sign Out"
                  description="End your current session"
                  onClick={() => setShowLogoutModal(true)}
                  danger
                />
              </motion.div>

              {/* Version footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-8 pb-4 text-center"
              >
                <p className="text-stone-400 text-sm font-medium">
                  Cortexa v2.4.1
                </p>
                <p className="text-stone-300 text-xs mt-1">
                  Practice Intelligence Platform
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Password Change Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Time Zone Modal */}
      <TimeZoneModal
        isOpen={showTimeZoneModal}
        onClose={() => setShowTimeZoneModal(false)}
        currentTimezone={timezone}
        onSelect={setTimezone}
      />
    </>
  );
};
