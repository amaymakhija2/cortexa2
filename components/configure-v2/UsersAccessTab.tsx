import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Lock, Mail, RotateCcw, Shield, Eye, Users, Crown } from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
  SectionHeader,
  LedgerCard,
  PrimaryButton,
  InlineSelect,
  TogglePill,
} from './shared';
import type { UserAccess, UserRole, Clinician } from './shared';
import { InviteUserSlideOver } from './InviteUserSlideOver';

// =============================================================================
// USERS & ACCESS TAB - The Registry
// =============================================================================
// Who can access your practice data and what can they see?
// Each user is an entry in the registry. Roles are like titles of nobility.
// The owner wears the crown and cannot be dethroned.
// =============================================================================

interface UsersAccessTabProps {
  users: UserAccess[];
  onUpdateUsers: (users: UserAccess[]) => void;
  clinicians: Clinician[];
}

// Default owner (always present)
const DEFAULT_OWNER: UserAccess = {
  id: 'owner-1',
  name: 'Practice Owner',
  email: 'owner@practice.com',
  role: 'owner',
  revenueAccess: true,
  superviseeIds: [],
  status: 'active',
};

// Role display config
const ROLE_DISPLAY: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  owner: { label: 'Owner', icon: <Crown size={12} />, color: INK.gold },
  admin: { label: 'Admin', icon: <Shield size={12} />, color: INK.violet },
  supervisor: { label: 'Supervisor', icon: <Users size={12} />, color: INK.emerald },
  viewer: { label: 'Viewer', icon: <Eye size={12} />, color: INK.muted },
};

// Role options for dropdown (excluding owner)
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'viewer', label: 'Viewer' },
];

// =============================================================================
// USER ROW COMPONENT
// =============================================================================

interface UserRowProps {
  user: UserAccess;
  index: number;
  clinicians: Clinician[];
  onUpdate: (updates: Partial<UserAccess>) => void;
  onResend?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, index, clinicians, onUpdate, onResend }) => {
  const roleInfo = ROLE_DISPLAY[user.role];
  const isPending = user.status === 'pending';
  const isOwner = user.role === 'owner';

  // Get supervisee names
  const superviseeNames = user.superviseeIds
    .map((id) => clinicians.find((c) => c.id === id)?.name.split(' ')[0])
    .filter(Boolean)
    .join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isPending ? 0.7 : 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: EASE.out }}
      className="grid items-center py-5"
      style={{
        gridTemplateColumns: '1fr 200px 130px 100px 1fr',
        borderBottom: `1px solid ${INK.rule}`,
      }}
    >
      {/* User */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{
            fontFamily: FONT.sans,
            backgroundColor: isPending ? INK.ghost : roleInfo.color,
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
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: FONT.serif,
              fontSize: 16,
              color: INK.black,
            }}
          >
            {user.name}
            {isPending && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  fontFamily: FONT.sans,
                  backgroundColor: INK.amberLight,
                  color: INK.amber,
                }}
              >
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2">
        <Mail size={14} style={{ color: INK.ghost }} />
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
          }}
        >
          {user.email}
        </span>
      </div>

      {/* Role */}
      <div className="flex items-center">
        {isOwner ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: INK.goldGlow,
              border: `1px solid ${INK.gold}30`,
            }}
          >
            <Lock size={11} style={{ color: INK.gold }} />
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 12,
                fontWeight: 600,
                color: INK.gold,
              }}
            >
              Owner
            </span>
          </div>
        ) : (
          <InlineSelect
            value={user.role}
            options={ROLE_OPTIONS}
            onChange={(value) => onUpdate({ role: value })}
            width={110}
          />
        )}
      </div>

      {/* Revenue Access */}
      <div>
        {isOwner ? (
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: INK.faded,
            }}
          >
            Always
          </span>
        ) : (
          <TogglePill
            active={user.revenueAccess}
            onChange={(active) => onUpdate({ revenueAccess: active })}
            activeLabel="Yes"
            inactiveLabel="No"
          />
        )}
      </div>

      {/* Group / Actions */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.faded,
          }}
        >
          {user.role === 'supervisor' && superviseeNames
            ? superviseeNames
            : user.role === 'owner' || user.role === 'admin'
            ? 'All data'
            : '—'}
        </span>

        {isPending && onResend && (
          <motion.button
            onClick={onResend}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 600,
              color: INK.gold,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = INK.goldGlow)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <RotateCcw size={12} />
            Resend
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const UsersAccessTab: React.FC<UsersAccessTabProps> = ({
  users: propUsers,
  onUpdateUsers,
  clinicians,
}) => {
  // Ensure owner is always present
  const users = propUsers.length > 0 ? propUsers : [DEFAULT_OWNER];
  const [showInvite, setShowInvite] = useState(false);

  // Update a single user
  const updateUser = (id: string, updates: Partial<UserAccess>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    onUpdateUsers(updated);
  };

  // Add new user from invite
  const handleInvite = (newUser: Omit<UserAccess, 'id'>) => {
    const user: UserAccess = {
      ...newUser,
      id: `user-${Date.now()}`,
    };
    onUpdateUsers([...users, user]);
  };

  // Resend invitation (mock)
  const handleResend = (userId: string) => {
    // In real app, this would trigger an email resend
    console.log('Resending invitation to user:', userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <SectionHeader
        title="Users & Access"
        subtitle="Control who can access Cortexa and what they see"
        actions={
          <PrimaryButton
            onClick={() => setShowInvite(true)}
            icon={<Plus size={18} />}
            variant="emerald"
          >
            Invite User
          </PrimaryButton>
        }
      />

      {/* Users Table */}
      <LedgerCard accent="violet">
        <div className="px-8 pt-6 pb-2">
          {/* Table Header */}
          <div
            className="grid items-end pb-4"
            style={{
              gridTemplateColumns: '1fr 200px 130px 100px 1fr',
              borderBottom: `2px solid ${INK.dark}`,
            }}
          >
            {['User', 'Email', 'Role', 'Revenue', 'Group'].map((label) => (
              <div
                key={label}
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  color: INK.faded,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Table Rows */}
          <div>
            {users.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                index={index}
                clinicians={clinicians}
                onUpdate={(updates) => updateUser(user.id, updates)}
                onResend={user.status === 'pending' ? () => handleResend(user.id) : undefined}
              />
            ))}
          </div>

          {/* Empty state hint */}
          {users.length === 1 && users[0].role === 'owner' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="py-8 text-center"
            >
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  color: INK.faded,
                }}
              >
                Invite team members to give them access to practice data.
              </p>
            </motion.div>
          )}
        </div>
      </LedgerCard>

      {/* Invite Slide Over */}
      <InviteUserSlideOver
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
        clinicians={clinicians}
      />
    </motion.div>
  );
};

export default UsersAccessTab;
