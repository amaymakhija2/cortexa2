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
  DollarSign,
  UserX,
  Sparkles,
  ExternalLink,
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
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="min-h-full flex flex-col">

          {/* =============================================
              DARK HEADER SECTION - Matches app style
              ============================================= */}
          <PageHeader
            accent="amber"
            label="Account"
            title="Settings"
            subtitle="Manage your account preferences and practice configuration"
          />

          {/* =============================================
              MAIN CONTENT AREA
              ============================================= */}
          <div className="flex-1 px-6 sm:px-8 lg:px-12 py-8 lg:py-10">
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
                        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
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
                        <span>sarah.mitchell@cortexa.io</span>
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
                  icon={UserX}
                  label="Demo Mode"
                  description="Use anonymized clinician names for presentations"
                >
                  <ToggleSwitch
                    enabled={settings.anonymizeClinicianNames}
                    onChange={(enabled) => updateSettings({ anonymizeClinicianNames: enabled })}
                  />
                </SettingRow>
              </SettingsSection>

              {/* Notifications Section */}
              <SettingsSection title="Notifications" delay={0.1}>
                <SettingRow
                  icon={Bell}
                  label="Push Notifications"
                  description="Get alerts for important practice updates"
                >
                  <ToggleSwitch enabled={notifications} onChange={setNotifications} />
                </SettingRow>
                <SettingRow
                  icon={Mail}
                  label="Weekly Digest"
                  description="Receive a summary of practice insights via email"
                >
                  <ToggleSwitch enabled={emailDigest} onChange={setEmailDigest} />
                </SettingRow>
              </SettingsSection>

              {/* Preferences Section */}
              <SettingsSection title="Preferences" delay={0.15}>
                <SettingRow
                  icon={Clock}
                  label="Time Zone"
                  value="EST (UTC-5)"
                  onClick={() => {}}
                />
                <SettingRow
                  icon={Globe}
                  label="Language"
                  value="English (US)"
                  onClick={() => {}}
                />
              </SettingsSection>

              {/* Security Section */}
              <SettingsSection title="Security" delay={0.2}>
                <SettingRow
                  icon={Shield}
                  label="Password"
                  description="Last changed 3 months ago"
                  onClick={() => {}}
                />
                <SettingRow
                  icon={User}
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                  onClick={() => {}}
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
    </>
  );
};
