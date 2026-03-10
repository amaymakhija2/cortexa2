import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Lock, RotateCcw, Users, ChevronRight, Pencil, Check, Clock } from 'lucide-react';
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
import { LedgerTable, ColumnDef, LedgerTableFooter } from './LedgerTable';

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
  lastActive: new Date().toISOString(),
  joinedAt: '2021-01-15', // Practice founding date
};

// Role options for dropdown (excluding owner)
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'selfOnly', label: 'Self Only' },
];

// =============================================================================
// COLUMN STRUCTURE - For LedgerTable
// =============================================================================

const USER_COLUMNS: ColumnDef[] = [
  { key: 'user', label: 'User', width: 'minmax(140px, 180px)', align: 'left' },
  { key: 'email', label: 'Email', width: 'minmax(150px, 220px)', align: 'left' },
  { key: 'role', label: 'Role', width: '1fr', align: 'center' },
  { key: 'access', label: 'Access', width: '1fr', align: 'center' },
  { key: 'lastActive', label: 'Last Active', width: '1fr', align: 'center' },
  { key: 'revenue', label: 'Revenue', width: '100px', align: 'center' },
  { key: 'group', label: 'Group', width: '1fr', align: 'center' },
  { key: 'actions', label: '', width: '70px', align: 'center' },
];

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

  // Footer for LedgerTable
  const tableFooter: LedgerTableFooter | undefined = users.length > 1
    ? {
        activeCount: userStats.active,
        activeLabel: 'active',
        inactiveCount: userStats.pending,
        inactiveLabel: 'pending',
      }
    : undefined;

  // Row opacity handler for pending users
  const getRowOpacity = (user: UserAccess): number => {
    return user.status === 'pending' ? 0.7 : 1;
  };

  // Render row cells for LedgerTable
  const renderUserRow = (user: UserAccess, index: number, isHovered: boolean): React.ReactNode[] => {
    const isPending = user.status === 'pending';
    const isOwner = user.role === 'owner';

    // Derive supervisees from clinician relationships
    const derivedSupervisees = deriveSuperviseesForUser(user, clinicians);
    const linkedClinician = user.clinicianId
      ? clinicians.find(c => c.id === user.clinicianId) || null
      : null;

    // Supervisee label
    const superviseeCount = derivedSupervisees.length;
    const superviseeLabel = superviseeCount > 0
      ? `${superviseeCount} clinician${superviseeCount > 1 ? 's' : ''}`
      : user.role === 'supervisor'
        ? 'None assigned'
        : user.role === 'owner' || user.role === 'admin'
          ? 'All data'
          : '—';

    // Format date for subtitle (like clinician view)
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Subtitle: "Since [date]" for all users
    const subtitle = linkedClinician
      ? `Since ${formatDate(linkedClinician.startDate)}`
      : isPending && user.invitedAt
        ? `Invited ${formatDate(user.invitedAt)}`
        : user.joinedAt
          ? `Since ${formatDate(user.joinedAt)}`
          : null;

    return [
      // User - Name + optional subtitle
      <div key="user" className="min-w-0 pl-3">
        <div
          className="truncate"
          style={{
            fontFamily: FONT.serif,
            fontSize: 17,
            color: INK.black,
            lineHeight: 1.3,
          }}
        >
          {user.name}
        </div>
        {subtitle && (
          <div
            className="truncate mt-0.5"
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              color: INK.ghost,
              letterSpacing: '0.02em',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>,

      // Email
      <div key="email" className="min-w-0">
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
      </div>,

      // Role
      <div key="role" className="flex justify-center">
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
            onChange={(value) => updateUser(user.id, { role: value })}
            width={100}
          />
        )}
      </div>,

      // Access Status
      <div key="access" className="flex justify-center">
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
      </div>,

      // Last Active
      <div key="lastActive" className="flex justify-center">
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: isPending ? INK.ghost : user.lastActive ? INK.muted : INK.ghost,
          }}
        >
          {isPending ? '—' : formatLastActive(user.lastActive)}
        </span>
      </div>,

      // Revenue Access
      <div key="revenue" className="flex justify-center">
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
            onChange={(active) => updateUser(user.id, { revenueAccess: active })}
            activeLabel="Yes"
            inactiveLabel="No"
          />
        )}
      </div>,

      // Group - Clickable for supervisors
      <div key="group" className="flex justify-center">
        {user.role === 'supervisor' ? (
          <motion.button
            onClick={() => setGroupViewUser(user)}
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
      </div>,

      // Actions
      <div key="actions" className="flex items-center justify-center gap-2">
        {isPending ? (
          <motion.button
            onClick={() => handleResend(user.id)}
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
            onClick={() => setEditingUser(user)}
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
      </div>,
    ];
  };

  // Empty message for users table
  const emptyMessage = users.length === 1 && users[0].role === 'owner'
    ? 'Invite team members to give them access to practice data.'
    : 'No users to display.';

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
          <LedgerTable
            columns={USER_COLUMNS}
            data={sortedUsers}
            keyExtractor={(user) => user.id}
            renderRow={renderUserRow}
            rowOpacity={getRowOpacity}
            footer={tableFooter}
            emptyMessage={emptyMessage}
          />
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
