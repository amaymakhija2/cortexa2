import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Wifi, Users } from 'lucide-react';
import {
  FONT,
  INK,
  EASE,
  SectionHeader,
  LedgerCard,
  PrimaryButton,
} from './shared';
import type { EHRConnection, Clinician } from './shared';
import { MOCK_EHR } from './shared';
import { ClinicianMapping } from '../ClinicianMapping';

// =============================================================================
// CONNECTIONS TAB - The Data Pipeline
// =============================================================================
// How Cortexa gets its data and how that data is interpreted.
// EHR connection -> Location mapping -> Clinician mapping -> Service mapping.
// Each section shows its completion status.
// =============================================================================

interface ConnectionsTabProps {
  ehr?: EHRConnection;
  clinicians: Clinician[];
  onUpdateClinicians: (clinicians: Clinician[]) => void;
  onRefreshEHR?: () => void;
}

// =============================================================================
// STATUS PILL (compact version for section headers)
// =============================================================================

interface StatusPillProps {
  assigned: number;
  total: number;
}

const StatusPill: React.FC<StatusPillProps> = ({ assigned, total }) => {
  const isComplete = assigned === total;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        backgroundColor: isComplete ? INK.emeraldLight : INK.amberLight,
      }}
    >
      {isComplete ? (
        <Check size={12} color={INK.emerald} strokeWidth={3} />
      ) : (
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            color: INK.amber,
          }}
        >
          {total - assigned}
        </span>
      )}
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          fontWeight: 600,
          color: isComplete ? INK.emerald : INK.amber,
        }}
      >
        {isComplete ? 'All mapped' : 'unassigned'}
      </span>
    </div>
  );
};

// =============================================================================
// EHR CONNECTION CARD
// =============================================================================

interface EHRCardProps {
  ehr: EHRConnection;
  onRefresh?: () => void;
}

const EHRCard: React.FC<EHRCardProps> = ({ ehr, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-6"
    >
      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${INK.violet} 0%, #5b21b6 100%)`,
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
          }}
        >
          <Wifi size={24} color="white" />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: FONT.serif,
                fontSize: 20,
                color: INK.black,
              }}
            >
              {ehr.provider}
            </span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: INK.emeraldLight,
                border: `1px solid ${INK.emerald}30`,
              }}
            >
              <Check size={11} color={INK.emerald} strokeWidth={3} />
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 11,
                  fontWeight: 600,
                  color: INK.emerald,
                }}
              >
                Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-1.5">
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              Last sync: {formatDate(ehr.lastSync)}
            </span>
            <span style={{ color: INK.ghost }}>·</span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              {ehr.totalClients} clients
            </span>
            <span style={{ color: INK.ghost }}>·</span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              {ehr.totalClinicians} clinicians
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <PrimaryButton
        onClick={handleRefresh}
        icon={
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={16} />
          </motion.div>
        }
        variant="stone"
      >
        {isRefreshing ? 'Syncing...' : 'Refresh Now'}
      </PrimaryButton>
    </motion.div>
  );
};

// =============================================================================
// SECTION HEADER (for sub-sections)
// =============================================================================

interface SubSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status?: React.ReactNode;
  action?: React.ReactNode;
}

const SubSectionHeader: React.FC<SubSectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  status,
  action,
}) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: INK.goldGlow,
          color: INK.gold,
        }}
      >
        {icon}
      </div>
      <div>
        <h4
          style={{
            fontFamily: FONT.sans,
            fontSize: 15,
            fontWeight: 600,
            color: INK.black,
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: INK.faded,
            marginTop: 2,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {status}
      {action}
    </div>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  ehr = MOCK_EHR,
  clinicians,
  onUpdateClinicians,
  onRefreshEHR,
}) => {
  const [showClinicianMapping, setShowClinicianMapping] = useState(false);

  // Compute clinician mapping status
  const clinicianStatus = useMemo(() => {
    const mapped = clinicians.filter((c) => c.ehrClinicianIds.length > 0).length;
    return { assigned: mapped, total: clinicians.length };
  }, [clinicians]);

  // If showing clinician mapping detail view
  if (showClinicianMapping) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SectionHeader
          title="Clinician Mapping"
          subtitle="Map EHR clinician records to your team members"
          actions={
            <button
              onClick={() => setShowClinicianMapping(false)}
              className="transition-colors"
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                fontWeight: 600,
                color: INK.gold,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK.black)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK.gold)}
            >
              ← Back to Connections
            </button>
          }
        />
        <LedgerCard>
          <div className="p-6">
            <ClinicianMapping
              ehrClinicians={[]}
              clinicians={clinicians}
              onUpdateClinicians={onUpdateClinicians}
              onBack={() => setShowClinicianMapping(false)}
            />
          </div>
        </LedgerCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader
        title="Connections"
        subtitle="EHR sync and clinician mapping"
      />

      {/* Section 1: EHR Connection */}
      <LedgerCard accent="violet" className="mb-8">
        <EHRCard ehr={ehr} onRefresh={onRefreshEHR} />
      </LedgerCard>

      {/* Section 2: Clinician Mapping */}
      <LedgerCard>
        <div className="p-6">
          <SubSectionHeader
            icon={<Users size={18} />}
            title="Clinician Mapping"
            subtitle="Map EHR clinician records to team members"
            status={<StatusPill {...clinicianStatus} />}
            action={
              <button
                onClick={() => setShowClinicianMapping(true)}
                className="transition-colors"
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.gold,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = INK.black)}
                onMouseLeave={(e) => (e.currentTarget.style.color = INK.gold)}
              >
                Manage Mapping →
              </button>
            }
          />
          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: INK.cream }}
          >
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              {clinicianStatus.assigned === clinicianStatus.total
                ? `All ${clinicianStatus.total} clinicians are mapped to EHR records.`
                : `${clinicianStatus.assigned} of ${clinicianStatus.total} clinicians mapped. Click "Manage Mapping" to assign the rest.`}
            </p>
          </div>
        </div>
      </LedgerCard>
    </motion.div>
  );
};

export default ConnectionsTab;
