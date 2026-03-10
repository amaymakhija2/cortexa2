import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { FONT, INK } from './shared';
import type { Clinician } from './shared';

// =============================================================================
// CLINICIAN PICKER
// A clean ledger-style list for selecting a clinician
// =============================================================================

interface ClinicianPickerProps {
  clinicians: Clinician[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Filter out clinicians by ID (e.g., already invited) */
  excludeIds?: string[];
  /** Only show active clinicians (default: true) */
  activeOnly?: boolean;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Empty state message when no clinicians available */
  emptyMessage?: string;
  /** Empty state message when search has no results */
  noResultsMessage?: string;
}

export const ClinicianPicker: React.FC<ClinicianPickerProps> = ({
  clinicians,
  selectedId,
  onSelect,
  excludeIds = [],
  activeOnly = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No clinicians available',
  noResultsMessage = 'No matches',
}) => {
  const [search, setSearch] = useState('');

  const filteredClinicians = useMemo(() => {
    return clinicians
      .filter((c) => (activeOnly ? c.isActive : true))
      .filter((c) => !excludeIds.includes(c.id))
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.licenseType?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      );
  }, [clinicians, excludeIds, activeOnly, search]);

  const hasSearch = search.length > 0;

  return (
    <div>
      {/* Search field */}
      <div className="relative mb-8">
        <Search
          size={18}
          className="absolute left-0 top-1/2 -translate-y-1/2"
          style={{ color: INK.faded }}
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-0 py-3 outline-none bg-transparent"
          style={{
            fontFamily: FONT.sans,
            fontSize: 16,
            color: INK.body,
            borderBottom: `1px solid ${INK.rule}`,
          }}
          onFocus={(e) => {
            e.target.style.borderBottomColor = INK.gold;
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = INK.rule;
          }}
        />
      </div>

      {/* Clinician list */}
      <div>
        {filteredClinicians.length > 0 ? (
          filteredClinicians.map((c, index) => {
            const isSelected = selectedId === c.id;

            return (
              <motion.button
                key={c.id}
                onClick={() => onSelect(c.id)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="w-full flex items-center justify-between py-5 text-left"
                style={{
                  borderBottom: `1px solid ${INK.rule}`,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                {/* Name with credential and role */}
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    className="truncate"
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 18,
                      color: isSelected ? INK.gold : INK.black,
                      transition: 'color 0.2s',
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="flex-shrink-0"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: INK.faded,
                    }}
                  >
                    {[c.licenseType, c.role].filter(Boolean).join(' · ')}
                  </span>
                </div>

                {/* Radio indicator */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: isSelected ? 'none' : `1.5px solid ${INK.rule}`,
                    backgroundColor: isSelected ? INK.gold : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check size={12} color="white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 15,
                color: INK.faded,
              }}
            >
              {hasSearch ? noResultsMessage : emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicianPicker;
