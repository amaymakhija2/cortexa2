import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  User,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
  Mail,
  Building2,
  Clock,
  Globe,
  Camera,
  Sparkles,
  Calculator,
  DollarSign,
} from 'lucide-react';

// ============================================================================
// TOGGLE SWITCH COMPONENT
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
        shadow-inner
        ${enabled
          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
          : 'bg-stone-300'}
      `}
    >
      <motion.div
        layout
        className={`
          w-6 h-6 absolute top-1
          bg-white rounded-full
          shadow-lg shadow-black/20
          flex items-center justify-center
        `}
        animate={{ x: enabled ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
// SETTING ROW COMPONENT
// ============================================================================

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon: Icon,
  label,
  description,
  children,
  onClick,
  danger = false
}) => {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={{
        backgroundColor: danger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 0, 0, 0.02)',
        x: isClickable ? 4 : 0
      }}
      whileTap={isClickable ? { scale: 0.995 } : undefined}
      onClick={onClick}
      className={`
        flex items-center justify-between py-5 px-6
        border-b border-stone-200/60 last:border-0
        transition-colors duration-200
        ${isClickable ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-11 h-11 rounded-2xl flex items-center justify-center
          ${danger
            ? 'bg-gradient-to-br from-red-100 to-red-50 text-red-600'
            : 'bg-gradient-to-br from-stone-100 to-stone-50 text-stone-600'}
          shadow-sm
        `}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div>
          <p className={`font-semibold text-base ${danger ? 'text-red-700' : 'text-stone-800'}`}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-stone-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {isClickable && !children && (
          <ChevronRight size={20} className="text-stone-400" />
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// SETTINGS CARD COMPONENT
// ============================================================================

interface SettingsCardProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl shadow-stone-900/5 overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-amber-600" />}
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    <div>{children}</div>
  </motion.div>
);

// ============================================================================
// LOGOUT MODAL COMPONENT
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
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-100">
            {/* Warning header */}
            <div className="relative h-32 bg-gradient-to-br from-red-500 via-red-600 to-orange-600 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                >
                  <LogOut size={36} className="text-white" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                Sign out?
              </h2>
              <p className="text-stone-500 mb-8">
                You'll need to sign in again to access your practice analytics.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
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
// MAIN SETTINGS PAGE COMPONENT
// ============================================================================

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      {/* Fonts - using DM Serif Display + DM Sans to match app */}
      <style>{`
        .font-display {
          font-family: 'DM Serif Display', Georgia, serif;
        }
      `}</style>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-stone-800 mb-2">
              Settings
            </h1>
            <p className="text-stone-500 text-lg">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-stone-900/5 p-6 sm:p-8 mb-8 relative overflow-hidden"
          >
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-300/10 to-transparent rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="relative group"
              >
                <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-amber-100 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
                {/* Hover edit overlay */}
                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-stone-800">
                    Dr. Sarah Chen
                  </h2>
                  <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/50">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <Sparkles size={10} /> PRO
                    </span>
                  </div>
                </div>
                <p className="text-amber-600 font-semibold mb-4">Practice Administrator</p>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center">
                      <Mail size={12} className="text-stone-500" />
                    </div>
                    <span>sarah.chen@cortexa.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center">
                      <Building2 size={12} className="text-stone-500" />
                    </div>
                    <span>Harmony Wellness Center</span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-2xl bg-stone-800 text-white text-sm font-semibold hover:bg-stone-900 transition-colors shadow-lg shadow-stone-900/20"
              >
                Edit Profile
              </motion.button>
            </div>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Metric Definitions - Most important, first */}
            <SettingsCard title="Data & Metrics" icon={Calculator} delay={0.2}>
              <SettingRow
                icon={Calculator}
                label="Metric Definitions"
                description="Customize how metrics are calculated"
                onClick={() => navigate('/settings/metric-definitions')}
              />
              <SettingRow
                icon={DollarSign}
                label="Show Net Revenue Data"
                description="Display net revenue, margins, and cost breakdowns"
              >
                <ToggleSwitch
                  enabled={settings.showNetRevenueData}
                  onChange={(enabled) => updateSettings({ showNetRevenueData: enabled })}
                />
              </SettingRow>
            </SettingsCard>

            {/* Notifications */}
            <SettingsCard title="Notifications" icon={Bell} delay={0.3}>
              <SettingRow
                icon={Bell}
                label="Push Notifications"
                description="Get alerts for important updates"
              >
                <ToggleSwitch enabled={notifications} onChange={setNotifications} />
              </SettingRow>
              <SettingRow
                icon={Mail}
                label="Email Digest"
                description="Weekly summary of practice insights"
              >
                <ToggleSwitch enabled={emailDigest} onChange={setEmailDigest} />
              </SettingRow>
            </SettingsCard>

            {/* Preferences */}
            <SettingsCard title="Preferences" icon={Globe} delay={0.4}>
              <SettingRow
                icon={Clock}
                label="Time Zone"
                description="America/New_York (EST)"
                onClick={() => {}}
              />
              <SettingRow
                icon={Globe}
                label="Language"
                description="English (US)"
                onClick={() => {}}
              />
            </SettingsCard>

            {/* Security */}
            <SettingsCard title="Security" icon={Shield} delay={0.5}>
              <SettingRow
                icon={Shield}
                label="Change Password"
                description="Update your security credentials"
                onClick={() => {}}
              />
              <SettingRow
                icon={User}
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
                onClick={() => {}}
              />
            </SettingsCard>

            {/* Help */}
            <SettingsCard title="Support" icon={HelpCircle} delay={0.6}>
              <SettingRow
                icon={HelpCircle}
                label="Help Center"
                description="Get answers to common questions"
                onClick={() => {}}
              />
            </SettingsCard>

            {/* Sign Out - Standalone danger card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border border-red-100 shadow-xl shadow-red-900/5 overflow-hidden"
            >
              <SettingRow
                icon={LogOut}
                label="Sign Out"
                description="End your current session"
                onClick={() => setShowLogoutModal(true)}
                danger
              />
            </motion.div>
          </div>

          {/* Version info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-16 text-center"
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

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};
