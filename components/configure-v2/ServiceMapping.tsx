import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { FONT, INK, EASE } from './shared';
import type { ServiceMapping, ServiceBucket, ServiceCategory } from './shared';

// =============================================================================
// SERVICE MAPPING - The Classification Ledger
// =============================================================================
// Categorize EHR appointment types so metrics are calculated correctly.
// Four buckets: Sessions, Cancellations, Other, Excluded.
// Uncategorized services get amber treatment until assigned.
// =============================================================================

// Mock data - in real app, comes from EHR sync
const MOCK_SERVICES: ServiceMapping[] = [
  { id: 's1', name: 'Psychotherapy, 60 min', code: '90837', bucket: 'sessions', category: 'session' },
  { id: 's2', name: 'Psychotherapy, 45 min', code: '90834', bucket: 'sessions', category: 'session' },
  { id: 's3', name: 'Psychotherapy, 30 min', code: '90832', bucket: 'sessions', category: 'session' },
  { id: 's4', name: 'Psychiatric Diagnostic Evaluation', code: '90791', bucket: 'sessions', category: 'intake' },
  { id: 's5', name: 'Family psychotherapy, conjoint', code: '90847', bucket: 'sessions', category: 'session' },
  { id: 's6', name: 'Group psychotherapy', code: '90853', bucket: 'sessions', category: 'group' },
  { id: 's7', name: 'Supervision for LMSW/MHC-LP', code: 'S100', bucket: 'other', category: 'supervision' },
  { id: 's8', name: 'Admin Block', code: 'ADMIN', bucket: 'other', category: 'admin' },
  { id: 's9', name: 'Training Session', code: 'T100', bucket: 'excluded' },
  { id: 's10', name: 'Initial Consultation - No Charge', code: '00000', bucket: 'excluded' },
  { id: 's11', name: 'New Therapy Code', code: '99999', bucket: 'sessions' }, // Uncategorized
];

interface ServiceMappingProps {
  services?: ServiceMapping[];
  onUpdate?: (services: ServiceMapping[]) => void;
}

// Bucket configuration
interface BucketConfig {
  id: ServiceBucket;
  label: string;
  description: string;
  color: string;
  lightColor: string;
}

const BUCKETS: BucketConfig[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    description: 'Counts toward completed sessions and utilization goals',
    color: INK.emerald,
    lightColor: INK.emeraldLight,
  },
  {
    id: 'cancellations',
    label: 'Cancellations',
    description: 'These count toward cancel rate',
    color: INK.rose,
    lightColor: INK.roseLight,
  },
  {
    id: 'other',
    label: 'Other Activities',
    description: "Tracked but don't count toward session goals",
    color: INK.amber,
    lightColor: INK.amberLight,
  },
  {
    id: 'excluded',
    label: 'Excluded',
    description: 'Hidden from all reports',
    color: INK.muted,
    lightColor: INK.cream,
  },
];

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'session', label: 'Session' },
  { value: 'intake', label: 'Intake' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'admin', label: 'Admin' },
  { value: 'group', label: 'Group' },
  { value: 'other', label: 'Other' },
];

// =============================================================================
// STATUS INDICATOR
// =============================================================================

interface StatusIndicatorProps {
  categorized: number;
  total: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ categorized, total }) => {
  const isComplete = categorized === total;
  const progress = total > 0 ? categorized / total : 1;

  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
      style={{
        backgroundColor: isComplete ? INK.emeraldLight : INK.amberLight,
        border: `1px solid ${isComplete ? INK.emerald + '30' : INK.amber + '30'}`,
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: isComplete ? INK.emerald : INK.amber,
        }}
      >
        {isComplete ? (
          <Check size={11} color="white" strokeWidth={3} />
        ) : (
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {total - categorized}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          fontWeight: 600,
          color: isComplete ? INK.emerald : INK.amber,
        }}
      >
        {isComplete ? 'All categorized' : `${total - categorized} uncategorized`}
      </span>
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: isComplete ? INK.emerald + '80' : INK.amber + '80',
        }}
      >
        {categorized}/{total}
      </span>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ServiceMappingComponent: React.FC<ServiceMappingProps> = ({
  services: propServices,
  onUpdate,
}) => {
  const [services, setServices] = useState<ServiceMapping[]>(propServices || MOCK_SERVICES);
  const [expandedBuckets, setExpandedBuckets] = useState<Set<ServiceBucket>>(new Set(['sessions']));

  // Find uncategorized services (in sessions/other but no category)
  const uncategorized = services.filter(
    (s) => (s.bucket === 'sessions' || s.bucket === 'other') && !s.category
  );

  // Group services by bucket
  const servicesByBucket = BUCKETS.reduce((acc, bucket) => {
    acc[bucket.id] = services.filter((s) => s.bucket === bucket.id);
    return acc;
  }, {} as Record<ServiceBucket, ServiceMapping[]>);

  // Update service
  const updateService = (id: string, updates: Partial<ServiceMapping>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setServices(updated);
    onUpdate?.(updated);
  };

  // Quick assign for uncategorized
  const quickAssign = (id: string, bucket: ServiceBucket, category?: ServiceCategory) => {
    updateService(id, { bucket, category });
  };

  // Toggle bucket expansion
  const toggleBucket = (bucket: ServiceBucket) => {
    setExpandedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) {
        next.delete(bucket);
      } else {
        next.add(bucket);
      }
      return next;
    });
  };

  // Compute status
  const categorizedCount = services.filter(
    (s) => s.bucket === 'excluded' || s.bucket === 'cancellations' || s.category
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            style={{
              fontFamily: FONT.serif,
              fontSize: 20,
              color: INK.black,
            }}
          >
            Service Mapping
          </h3>
          <p
            className="mt-1"
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: INK.muted,
            }}
          >
            Categorize your EHR appointment types so metrics are calculated correctly
          </p>
        </div>
        <StatusIndicator categorized={categorizedCount} total={services.length} />
      </div>

      {/* Uncategorized Section */}
      <AnimatePresence>
        {uncategorized.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-5 rounded-xl overflow-hidden"
            style={{
              backgroundColor: INK.amberLight,
              border: `1px solid ${INK.amber}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle size={16} color={INK.amber} />
              </motion.div>
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: INK.amber,
                }}
              >
                Uncategorized ({uncategorized.length})
              </span>
            </div>
            <div className="space-y-2">
              {uncategorized.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white"
                  style={{ border: `1px solid ${INK.amber}20` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 14,
                        color: INK.black,
                      }}
                    >
                      {service.name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 11,
                        backgroundColor: INK.cream,
                        color: INK.faded,
                      }}
                    >
                      {service.code}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => quickAssign(service.id, 'sessions', 'session')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        fontFamily: FONT.sans,
                        backgroundColor: INK.emeraldLight,
                        color: INK.emerald,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Sessions
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => quickAssign(service.id, 'other', 'other')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        fontFamily: FONT.sans,
                        backgroundColor: INK.amberLight,
                        color: INK.amber,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Other
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => quickAssign(service.id, 'excluded')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        fontFamily: FONT.sans,
                        backgroundColor: INK.cream,
                        color: INK.muted,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Exclude
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buckets */}
      <div className="space-y-3">
        {BUCKETS.map((bucket) => {
          const bucketServices = servicesByBucket[bucket.id];
          const isExpanded = expandedBuckets.has(bucket.id);

          return (
            <div
              key={bucket.id}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: INK.paper,
                border: `1px solid ${INK.rule}`,
              }}
            >
              {/* Bucket Header */}
              <motion.button
                onClick={() => toggleBucket(bucket.id)}
                className="w-full flex items-center justify-between p-4 transition-colors"
                style={{ border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                whileHover={{ backgroundColor: INK.cream }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight size={14} color={INK.faded} />
                  </motion.div>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 14,
                      fontWeight: 600,
                      color: INK.black,
                    }}
                  >
                    {bucket.label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      color: INK.ghost,
                    }}
                  >
                    ({bucketServices.length})
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: INK.faded,
                  }}
                >
                  {bucket.description}
                </span>
              </motion.button>

              {/* Bucket Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2, ease: EASE.out }}
                    className="overflow-hidden"
                  >
                    {bucketServices.length > 0 ? (
                      <div style={{ borderTop: `1px solid ${INK.rule}` }}>
                        {/* Table Header */}
                        <div
                          className="grid px-5 py-2"
                          style={{
                            gridTemplateColumns: '1fr 100px 130px',
                            backgroundColor: INK.cream,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 10,
                              fontWeight: 700,
                              color: INK.ghost,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Service
                          </span>
                          <span
                            style={{
                              fontFamily: FONT.sans,
                              fontSize: 10,
                              fontWeight: 700,
                              color: INK.ghost,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Code
                          </span>
                          {(bucket.id === 'sessions' || bucket.id === 'other') && (
                            <span
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 10,
                                fontWeight: 700,
                                color: INK.ghost,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                              }}
                            >
                              Category
                            </span>
                          )}
                        </div>

                        {/* Services */}
                        {bucketServices.map((service) => (
                          <div
                            key={service.id}
                            className="grid items-center px-5 py-3 transition-colors hover:bg-stone-50/50"
                            style={{
                              gridTemplateColumns: '1fr 100px 130px',
                              borderTop: `1px solid ${INK.rule}`,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: FONT.sans,
                                fontSize: 14,
                                color: INK.body,
                              }}
                            >
                              {service.name}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded w-fit"
                              style={{
                                fontFamily: FONT.mono,
                                fontSize: 11,
                                backgroundColor: INK.cream,
                                color: INK.faded,
                              }}
                            >
                              {service.code}
                            </span>
                            {(bucket.id === 'sessions' || bucket.id === 'other') && (
                              <select
                                value={service.category || ''}
                                onChange={(e) =>
                                  updateService(service.id, {
                                    category: (e.target.value as ServiceCategory) || undefined,
                                  })
                                }
                                className="px-2 py-1 rounded-lg border bg-white cursor-pointer outline-none transition-all"
                                style={{
                                  fontFamily: FONT.sans,
                                  fontSize: 12,
                                  color: service.category ? INK.body : INK.faded,
                                  borderColor: INK.rule,
                                }}
                                onFocus={(e) => (e.target.style.borderColor = INK.gold)}
                                onBlur={(e) => (e.target.style.borderColor = INK.rule)}
                              >
                                <option value="">Select...</option>
                                {CATEGORY_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="px-5 py-8 text-center"
                        style={{ borderTop: `1px solid ${INK.rule}` }}
                      >
                        <span
                          style={{
                            fontFamily: FONT.sans,
                            fontSize: 13,
                            color: INK.ghost,
                          }}
                        >
                          No services in this category
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceMappingComponent;
