import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Lock, Mail, RotateCcw, Shield, Eye, Users, Crown } from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
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
  const [isHovered, setIsHovered] = useState(false);

  // Get supervisee names
  const superviseeNames = user.superviseeIds
    .map((id) => clinicians.find((c) => c.id === id)?.name.split(' ')[0])
    .filter(Boolean)
    .join(', ');

  // Row animation variants - matches EditableRosterTable
  const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: isPending ? 0.6 : 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.4,
        ease: EASE.out,
      },
    }),
  };

  return (
    <motion.div
      className="grid items-center relative"
      style={{
        gridTemplateColumns: '1fr 200px 130px 100px 1fr',
        borderBottom: `1px solid ${INK.rule}`,
        minHeight: 64,
        backgroundColor: isHovered ? INK.cream : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={rowVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User */}
      <div className="flex items-center gap-3 pl-3 min-w-0">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
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
        <div className="min-w-0">
          <div
            className="flex items-center gap-2 truncate"
            style={{
              fontFamily: FONT.serif,
              fontSize: 17,
              color: INK.black,
              lineHeight: 1.3,
            }}
          >
            {user.name}
          </div>
          {isPending && (
            <span
              className="mt-0.5 inline-block"
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                fontWeight: 600,
                color: INK.amber,
                letterSpacing: '0.02em',
              }}
            >
              Invite pending
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Mail size={12} style={{ color: INK.ghost, flexShrink: 0 }} />
        <span
          className="truncate"
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.muted,
          }}
        >
          {user.email}
        </span>
      </div>

      {/* Role */}
      <div className="flex justify-center">
        {isOwner ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: INK.goldGlow,
              border: `1px solid ${INK.gold}30`,
            }}
          >
            <Lock size={10} style={{ color: INK.gold }} />
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
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
            width={100}
          />
        )}
      </div>

      {/* Revenue Access */}
      <div className="flex justify-center">
        {isOwner ? (
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
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
      <div className="flex items-center justify-between pr-2">
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
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
            whileHover={{ scale: 1.02, backgroundColor: INK.goldGlow }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 600,
              color: INK.gold,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <RotateCcw size={11} />
            Resend
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// SUMMARY BAR - Team Access Overview
// =============================================================================
// Compact header matching CliniciansTab style with key stats at a glance.

interface UserSummaryBarProps {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  onInviteClick: () => void;
}

const UserSummaryBar: React.FC<UserSummaryBarProps> = ({
  totalUsers,
  activeUsers,
  pendingUsers,
  onInviteClick,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE.out }}
    className="mb-6"
  >
    {/* Header row */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2
          style={{
            fontFamily: FONT.serif,
            fontSize: 20,
            fontWeight: 400,
            color: INK.black,
            marginBottom: 2,
          }}
        >
          Users & Access
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
          }}
        >
          Control who can access Cortexa and what they see
        </p>
      </div>

      {/* Right: Stats + Invite button */}
      <div className="flex items-center gap-3">
        {/* Status pills */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
            style={{ backgroundColor: INK.cream }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 14,
                fontWeight: 600,
                color: INK.black,
              }}
            >
              {activeUsers}
            </span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                color: INK.muted,
              }}
            >
              active
            </span>
          </div>
          {pendingUsers > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: INK.amberLight,
                border: `1px solid ${INK.amber}30`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: INK.amber,
                }}
              >
                {pendingUsers}
              </span>
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 11,
                  color: INK.amber,
                }}
              >
                pending
              </span>
            </div>
          )}
        </div>

        <PrimaryButton
          onClick={onInviteClick}
          icon={<Plus size={16} />}
          variant="stone"
        >
          Invite User
        </PrimaryButton>
      </div>
    </div>
  </motion.div>
);

// =============================================================================
// COLUMN STRUCTURE
// =============================================================================

interface ColumnDef {
  key: string;
  label: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'user', label: 'User', width: '1fr', align: 'left' },
  { key: 'email', label: 'Email', width: '200px', align: 'left' },
  { key: 'role', label: 'Role', width: '130px', align: 'center' },
  { key: 'revenue', label: 'Revenue', width: '100px', align: 'center' },
  { key: 'group', label: 'Group', width: '1fr', align: 'left' },
];

const gridTemplate = COLUMNS.map((c) => c.width).join(' ');

// =============================================================================
// HEADER ROW
// =============================================================================

const HeaderRow: React.FC = () => (
  <div
    className="grid items-end pb-4"
    style={{
      gridTemplateColumns: gridTemplate,
      borderBottom: `2px solid ${INK.dark}`,
    }}
  >
    {COLUMNS.map((col) => (
      <div
        key={col.key}
        className={col.key === 'user' ? 'pl-3' : ''}
        style={{
          fontFamily: FONT.sans,
          fontSize: 10,
          fontWeight: 700,
          color: INK.faded,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: col.align,
        }}
      >
        {col.label}
      </div>
    ))}
  </div>
);

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

  // Compute user stats
  const userStats = useMemo(() => {
    const active = users.filter((u) => u.status === 'active').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    return { total: users.length, active, pending };
  }, [users]);

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
      {/* Summary Bar - matches CliniciansTab style */}
      <UserSummaryBar
        totalUsers={userStats.total}
        activeUsers={userStats.active}
        pendingUsers={userStats.pending}
        onInviteClick={() => setShowInvite(true)}
      />

      {/* Users Table */}
      <LedgerCard>
        <div className="p-8">
          {/* Table Header */}
          <HeaderRow />

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

          {/* Footer summary - matches EditableRosterTable style */}
          {users.length > 1 && (
            <motion.div
              className="mt-6 pt-4 flex items-center gap-6"
              style={{ borderTop: `1px dashed ${INK.rule}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: users.length * 0.03 + 0.2 }}
            >
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  color: INK.faded,
                }}
              >
                <span style={{ color: INK.muted, fontWeight: 600 }}>{userStats.active}</span> active
              </div>
              {userStats.pending > 0 && (
                <div
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: INK.amber,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{userStats.pending}</span> pending
                </div>
              )}
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
