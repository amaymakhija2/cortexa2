import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Lock, RotateCcw, Shield, Eye, Users, Crown, ChevronRight, Pencil, Check, Clock } from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
  LedgerCard,
  PrimaryButton,
  InlineSelect,
  TogglePill,
  deriveSuperviseesForUser,
} from './shared';
import type { UserAccess, UserRole, Clinician } from './shared';
import { InviteUserSlideOver } from './InviteUserSlideOver';
import { EditUserSlideOver } from './EditUserSlideOver';
import { GroupAccessModal } from './GroupAccessModal';

// =============================================================================
// USERS & ACCESS TAB - The Registry
// =============================================================================
// Who can log into Cortexa and what can they see?
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
  status: 'active',
  lastActive: new Date().toISOString(), // Owner is always "just now"
};

// Role display config
const ROLE_DISPLAY: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  owner: { label: 'Owner', icon: <Crown size={12} />, color: INK.gold },
  admin: { label: 'Admin', icon: <Shield size={12} />, color: INK.violet },
  supervisor: { label: 'Supervisor', icon: <Users size={12} />, color: INK.emerald },
  selfOnly: { label: 'Self Only', icon: <Eye size={12} />, color: INK.muted },
};

// Role options for dropdown (excluding owner)
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'selfOnly', label: 'Self Only' },
];

// =============================================================================
// COLUMN STRUCTURE - Matching the spec
// =============================================================================

interface ColumnDef {
  key: string;
  label: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'user', label: 'User', width: '1fr', align: 'left' },
  { key: 'email', label: 'Email', width: '180px', align: 'left' },
  { key: 'role', label: 'Role', width: '120px', align: 'center' },
  { key: 'access', label: 'Access', width: '100px', align: 'center' },
  { key: 'lastActive', label: 'Last Active', width: '110px', align: 'center' },
  { key: 'revenue', label: 'Revenue', width: '90px', align: 'center' },
  { key: 'group', label: 'Group', width: '120px', align: 'center' },
  { key: 'actions', label: '', width: '70px', align: 'center' },
];

const gridTemplate = COLUMNS.map((c) => c.width).join(' ');

// Format relative time for last active
function formatLastActive(dateStr?: string): string {
  if (!dateStr) return '—';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
// USER ROW COMPONENT
// =============================================================================

interface UserRowProps {
  user: UserAccess;
  index: number;
  clinicians: Clinician[];
  onUpdate: (updates: Partial<UserAccess>) => void;
  onEdit: () => void;
  onResend?: () => void;
  onGroupClick?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  index,
  clinicians,
  onUpdate,
  onEdit,
  onResend,
  onGroupClick,
}) => {
  const roleInfo = ROLE_DISPLAY[user.role];
  const isPending = user.status === 'pending';
  const isOwner = user.role === 'owner';
  const [isHovered, setIsHovered] = useState(false);

  // Derive supervisees from clinician relationships
  const derivedSupervisees = useMemo(() => {
    return deriveSuperviseesForUser(user, clinicians);
  }, [user, clinicians]);

  // Get linked clinician info
  const linkedClinician = useMemo(() => {
    if (!user.clinicianId) return null;
    return clinicians.find(c => c.id === user.clinicianId) || null;
  }, [user.clinicianId, clinicians]);

  // Supervisee label
  const superviseeCount = derivedSupervisees.length;
  const superviseeLabel = superviseeCount > 0
    ? `${superviseeCount} clinician${superviseeCount > 1 ? 's' : ''}`
    : user.role === 'supervisor'
      ? 'None assigned'
      : user.role === 'owner' || user.role === 'admin'
        ? 'All data'
        : '—';

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: isPending ? 0.7 : 1,
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
        gridTemplateColumns: gridTemplate,
        borderBottom: `1px solid ${INK.rule}`,
        minHeight: 72,
        backgroundColor: isHovered ? INK.cream : isPending ? `${INK.amber}08` : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={rowVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User - Avatar + Name */}
      <div className="flex items-center gap-3 pl-3 min-w-0">
        {/* Avatar - use clinician color if linked */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            backgroundColor: isPending
              ? INK.ghost
              : linkedClinician
                ? linkedClinician.color
                : roleInfo.color,
            boxShadow: isPending
              ? 'none'
              : `0 2px 8px ${linkedClinician ? linkedClinician.color : roleInfo.color}30`,
          }}
        >
          {linkedClinician
            ? linkedClinician.initials
            : user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
        </div>
        <div className="min-w-0">
          <div
            className="truncate"
            style={{
              fontFamily: FONT.serif,
              fontSize: 16,
              color: INK.black,
              lineHeight: 1.3,
            }}
          >
            {user.name}
          </div>
          {/* Show linked clinician badge */}
          {linkedClinician && (
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: INK.ghost,
              }}
            >
              {linkedClinician.licenseType}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="min-w-0">
        <span
          className="truncate block"
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

      {/* Access Status */}
      <div className="flex justify-center">
        {isPending ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: INK.amberLight,
              border: `1px solid ${INK.amber}30`,
            }}
          >
            <Clock size={10} style={{ color: INK.amber }} />
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                fontWeight: 600,
                color: INK.amber,
              }}
            >
              Pending
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: INK.emeraldLight,
              border: `1px solid ${INK.emerald}30`,
            }}
          >
            <Check size={10} style={{ color: INK.emerald }} />
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                fontWeight: 600,
                color: INK.emerald,
              }}
            >
              Accepted
            </span>
          </div>
        )}
      </div>

      {/* Last Active */}
      <div className="flex justify-center">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: isPending ? INK.ghost : user.lastActive ? INK.muted : INK.ghost,
          }}
        >
          {isPending ? '—' : formatLastActive(user.lastActive)}
        </span>
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

      {/* Group - Clickable for supervisors */}
      <div className="flex justify-center">
        {user.role === 'supervisor' ? (
          <motion.button
            onClick={onGroupClick}
            whileHover={{ scale: 1.02, backgroundColor: INK.emeraldLight }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: INK.emerald,
              backgroundColor: `${INK.emerald}10`,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Users size={12} />
            <span>{superviseeLabel}</span>
            <ChevronRight size={12} style={{ opacity: 0.6 }} />
          </motion.button>
        ) : (
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: INK.faded,
            }}
          >
            {superviseeLabel}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        {isPending && onResend ? (
          <motion.button
            onClick={onResend}
            whileHover={{ scale: 1.05, backgroundColor: INK.goldGlow }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 600,
              color: INK.gold,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
            Resend
          </motion.button>
        ) : (
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.05, backgroundColor: INK.cream }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg"
            style={{
              color: isHovered ? INK.muted : INK.ghost,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
          >
            <Pencil size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// SUMMARY BAR
// =============================================================================

interface UserSummaryBarProps {
  activeUsers: number;
  pendingUsers: number;
  onInviteClick: () => void;
}

const UserSummaryBar: React.FC<UserSummaryBarProps> = ({
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
    <div className="flex items-center justify-between mb-3">
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
          Users & Access
        </h2>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 13,
            color: INK.muted,
            marginTop: 4,
          }}
        >
          Control who can access Cortexa and what they see
        </p>
      </div>

      <div className="flex items-center gap-3">
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
          variant="emerald"
        >
          Invite User
        </PrimaryButton>
      </div>
    </div>
  </motion.div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const UsersAccessTab: React.FC<UsersAccessTabProps> = ({
  users: propUsers,
  onUpdateUsers,
  clinicians,
}) => {
  const users = propUsers.length > 0 ? propUsers : [DEFAULT_OWNER];
  const [showInvite, setShowInvite] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccess | null>(null);
  const [groupViewUser, setGroupViewUser] = useState<UserAccess | null>(null);

  const userStats = useMemo(() => {
    const active = users.filter((u) => u.status === 'active').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    return { total: users.length, active, pending };
  }, [users]);

  // Sort users: owner first, then active, then pending
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === 'owner') return -1;
      if (b.role === 'owner') return 1;
      if (a.status === 'active' && b.status === 'pending') return -1;
      if (a.status === 'pending' && b.status === 'active') return 1;
      return 0;
    });
  }, [users]);

  // Get clinician IDs that already have user accounts
  const existingUserClinicianIds = useMemo(() => {
    return users
      .filter(u => u.clinicianId)
      .map(u => u.clinicianId as string);
  }, [users]);

  const updateUser = (id: string, updates: Partial<UserAccess>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    onUpdateUsers(updated);
  };

  const handleInvite = (newUser: Omit<UserAccess, 'id'>) => {
    const user: UserAccess = {
      ...newUser,
      id: `user-${Date.now()}`,
    };
    onUpdateUsers([...users, user]);
  };

  const handleEditSave = (updates: Partial<UserAccess>) => {
    if (editingUser) {
      updateUser(editingUser.id, updates);
    }
  };

  const handleDelete = () => {
    if (editingUser) {
      const updated = users.filter((u) => u.id !== editingUser.id);
      onUpdateUsers(updated);
      setEditingUser(null);
    }
  };

  const handleResend = (userId: string) => {
    console.log('Resending invitation to user:', userId);
    // In real app, this would trigger an email resend
  };

  const footerContent = users.length > 1 && (
    <>
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
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <UserSummaryBar
        activeUsers={userStats.active}
        pendingUsers={userStats.pending}
        onInviteClick={() => setShowInvite(true)}
      />

      <LedgerCard>
        <div className="p-8">
          {/* Table Header */}
          <HeaderRow />

          {/* Table Rows */}
          <div>
            {sortedUsers.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                index={index}
                clinicians={clinicians}
                onUpdate={(updates) => updateUser(user.id, updates)}
                onEdit={() => setEditingUser(user)}
                onResend={user.status === 'pending' ? () => handleResend(user.id) : undefined}
                onGroupClick={user.role === 'supervisor' ? () => setGroupViewUser(user) : undefined}
              />
            ))}
          </div>

          {/* Empty state */}
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

          {/* Footer summary */}
          {footerContent && (
            <motion.div
              className="mt-6 pt-4 flex items-center gap-6"
              style={{ borderTop: `1px dashed ${INK.rule}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: users.length * 0.03 + 0.2 }}
            >
              {footerContent}
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
        existingUserClinicianIds={existingUserClinicianIds}
      />

      {/* Edit Slide Over */}
      <EditUserSlideOver
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditSave}
        onDelete={editingUser?.role !== 'owner' ? handleDelete : undefined}
        user={editingUser}
        clinicians={clinicians}
      />

      {/* Group Access Modal */}
      {groupViewUser && (
        <GroupAccessModal
          isOpen={!!groupViewUser}
          onClose={() => setGroupViewUser(null)}
          user={groupViewUser}
          clinicians={clinicians}
        />
      )}
    </motion.div>
  );
};

export default UsersAccessTab;
