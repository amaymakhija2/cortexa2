import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  RotateCcw,
  Pencil,
  Clock,
} from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
  LedgerCard,
  PrimaryButton,
  TogglePill,
  InlineSelect,
} from './shared';
import type { UserAccess, AccessScope, Clinician } from './shared';
import { LedgerTable, type ColumnDef } from './LedgerTable';
import { InviteUserSlideOver } from './InviteUserSlideOver';
import { EditUserSlideOver } from './EditUserSlideOver';

// =============================================================================
// USERS & ACCESS TAB
// =============================================================================

interface UsersAccessTabProps {
  users: UserAccess[];
  onUpdateUsers: (users: UserAccess[]) => void;
  clinicians: Clinician[];
}

// Default owner
const DEFAULT_OWNER: UserAccess = {
  id: 'owner-1',
  name: 'Practice Owner',
  email: 'owner@practice.com',
  type: 'staff',
  scope: 'fullPractice',
  revenueAccess: true,
  clientDetailsAccess: true,
  isOwner: true,
  status: 'active',
  lastActive: new Date().toISOString(),
};

// Scope options for dropdown
const SCOPE_OPTIONS: { value: AccessScope; label: string }[] = [
  { value: 'fullPractice', label: 'Full Practice' },
  { value: 'theirTeam', label: 'Their Team' },
  { value: 'custom', label: 'Custom' },
  { value: 'selfOnly', label: 'Self Only' },
];

// Column definitions - each value gets its own column
const COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', width: 'minmax(140px, 200px)', align: 'left' },
  { key: 'email', label: 'Email', width: 'minmax(160px, 1fr)', align: 'left' },
  { key: 'role', label: 'Role', width: '120px', align: 'center' },
  { key: 'scope', label: 'Scope', width: '140px', align: 'center' },
  { key: 'revenue', label: 'Revenue', width: '80px', align: 'center' },
  { key: 'clients', label: 'Clients', width: '80px', align: 'center' },
  { key: 'status', label: 'Status', width: '90px', align: 'center' },
  { key: 'actions', label: '', width: '50px', align: 'right' },
];

// Format relative time
function formatLastActive(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =============================================================================
// ROW RENDERER
// =============================================================================

interface RenderUserCellsProps {
  user: UserAccess;
  onScopeChange: (scope: AccessScope) => void;
  onRevenueToggle: (enabled: boolean) => void;
  onClientsToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onResend?: () => void;
  isHovered: boolean;
}

function renderUserCells({
  user,
  onScopeChange,
  onRevenueToggle,
  onClientsToggle,
  onEdit,
  onResend,
  isHovered,
}: RenderUserCellsProps): React.ReactNode[] {
  const isPending = user.status === 'pending';
  const isOwner = user.isOwner;

  return [
    // Name
    <div key="name" className="pl-3 min-w-0">
      <span
        className="truncate block"
        style={{
          fontFamily: FONT.serif,
          fontSize: 16,
          color: INK.black,
        }}
      >
        {user.name}
      </span>
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

    // Role/Type
    <div key="role" className="flex justify-center">
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: isOwner ? INK.gold : INK.faded,
          fontWeight: isOwner ? 500 : 400,
        }}
      >
        {isOwner ? 'Owner' : user.type === 'clinician' ? 'Clinician' : user.staffRole || 'Staff'}
      </span>
    </div>,

    // Scope
    <div key="scope" className="flex justify-center">
      {isOwner ? (
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.gold,
            fontWeight: 500,
          }}
        >
          Full Access
        </span>
      ) : (
        <InlineSelect
          value={user.scope}
          options={SCOPE_OPTIONS}
          onChange={onScopeChange}
          width={125}
        />
      )}
    </div>,

    // Revenue Access
    <div key="revenue" className="flex justify-center">
      {isOwner ? (
        <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.ghost }}>—</span>
      ) : (
        <TogglePill
          active={user.revenueAccess}
          onChange={onRevenueToggle}
          activeLabel="Yes"
          inactiveLabel="No"
        />
      )}
    </div>,

    // Client Details Access
    <div key="clients" className="flex justify-center">
      {isOwner ? (
        <span style={{ fontFamily: FONT.sans, fontSize: 11, color: INK.ghost }}>—</span>
      ) : (
        <TogglePill
          active={user.clientDetailsAccess}
          onChange={onClientsToggle}
          activeLabel="Yes"
          inactiveLabel="No"
        />
      )}
    </div>,

    // Status
    <div key="status" className="flex justify-center">
      {isPending ? (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
          style={{ backgroundColor: INK.amberLight }}
        >
          <Clock size={10} style={{ color: INK.amber }} />
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 10,
              fontWeight: 600,
              color: INK.amber,
            }}
          >
            Pending
          </span>
        </span>
      ) : (
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 11,
            color: INK.faded,
          }}
        >
          {formatLastActive(user.lastActive)}
        </span>
      )}
    </div>,

    // Actions
    <div key="actions" className="flex justify-end pr-2">
      <AnimatePresence>
        {isHovered && !isOwner && (
          <>
            {isPending && onResend && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => { e.stopPropagation(); onResend(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg"
                style={{
                  color: INK.gold,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Resend"
              >
                <RotateCcw size={14} />
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg"
              style={{
                color: INK.muted,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Pencil size={14} />
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>,
  ];
}

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

  // Sort: owner first, then active, then pending
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.isOwner) return -1;
      if (b.isOwner) return 1;
      if (a.status === 'active' && b.status === 'pending') return -1;
      if (a.status === 'pending' && b.status === 'active') return 1;
      return 0;
    });
  }, [users]);

  // Clinician IDs with accounts
  const existingUserClinicianIds = useMemo(() => {
    return users
      .filter((u) => u.clinicianId)
      .map((u) => u.clinicianId) as string[];
  }, [users]);

  // Stats
  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === 'active').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    return { active, pending };
  }, [users]);

  // Update a single user
  const updateUser = useCallback(
    (id: string, updates: Partial<UserAccess>) => {
      const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
      onUpdateUsers(updated);
    },
    [users, onUpdateUsers]
  );

  // Handlers
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
  };

  // Render row for LedgerTable
  const renderRow = useCallback(
    (user: UserAccess, _index: number, isHovered: boolean): React.ReactNode[] => {
      return renderUserCells({
        user,
        onScopeChange: (scope) => updateUser(user.id, { scope }),
        onRevenueToggle: (enabled) => updateUser(user.id, { revenueAccess: enabled }),
        onClientsToggle: (enabled) => updateUser(user.id, { clientDetailsAccess: enabled }),
        onEdit: () => setEditingUser(user),
        onResend: user.status === 'pending' ? () => handleResend(user.id) : undefined,
        isHovered,
      });
    },
    [updateUser]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE.out }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
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
              Control who can access Cortexa and what data they can see
            </p>
          </div>

          <PrimaryButton
            onClick={() => setShowInvite(true)}
            icon={<Plus size={16} />}
            variant="emerald"
          >
            Invite User
          </PrimaryButton>
        </div>
      </motion.div>

      {/* User Registry */}
      <LedgerCard>
        <div className="p-8">
          <LedgerTable
            columns={COLUMNS}
            data={sortedUsers}
            keyExtractor={(user) => user.id}
            renderRow={renderRow}
            rowOpacity={(user) => (user.status === 'pending' ? 0.6 : 1)}
            footer={{
              activeCount: stats.active,
              activeLabel: 'active',
              inactiveCount: stats.pending,
              inactiveLabel: 'pending',
            }}
            emptyMessage="No users yet. Invite your team to get started."
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
        onDelete={editingUser && !editingUser.isOwner ? handleDelete : undefined}
        user={editingUser}
        clinicians={clinicians}
      />
    </motion.div>
  );
};

export default UsersAccessTab;
