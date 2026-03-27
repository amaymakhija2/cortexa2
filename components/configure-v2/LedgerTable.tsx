import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { FONT, INK, EASE } from './shared';

// =============================================================================
// LEDGER TABLE - The Unified Registry
// =============================================================================
// A reusable table component that provides the consistent ledger aesthetic
// across all Configure tabs. Each row feels like an entry in a hand-written
// ledger - elegant typography, subtle animations, and warm ink tones.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface ColumnDef {
  key: string;
  label: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

export interface LedgerTableFooter {
  activeCount: number;
  activeLabel?: string;
  inactiveCount?: number;
  inactiveLabel?: string;
}

// =============================================================================
// DRAWER SECTION - Archive Pages in the Ledger
// =============================================================================
// Like turning to the back pages of a ledger where older entries are kept.
// Collapsed by default, revealing historical or secondary records on demand.
// =============================================================================

export interface DrawerSection<T> {
  id: string;
  label: string;
  /** Description shown after em dash, e.g. "— former team members" */
  description?: string;
  items: T[];
  /** Accent color for the section dot - defaults to 'stone' (neutral) */
  accent?: 'stone' | 'amber' | 'ghost';
}

export interface LedgerTableProps<T> {
  columns: ColumnDef[];
  data: T[];
  keyExtractor: (item: T) => string;
  renderRow: (item: T, index: number, isHovered: boolean) => React.ReactNode[];
  rowOpacity?: (item: T) => number;
  footer?: LedgerTableFooter;
  emptyMessage?: string;
  /** Drawer sections appear below the main table - collapsed by default */
  drawerSections?: DrawerSection<T>[];
}

// =============================================================================
// INTERNAL: RANK COLUMN
// =============================================================================

const RANK_COLUMN: ColumnDef = {
  key: 'rank',
  label: '#',
  width: '44px',
  align: 'center',
};

// =============================================================================
// HEADER ROW
// =============================================================================

interface HeaderRowProps {
  columns: ColumnDef[];
  gridTemplate: string;
}

const HeaderRow: React.FC<HeaderRowProps> = ({ columns, gridTemplate }) => (
  <div
    className="grid items-end pb-3 pt-2"
    style={{
      gridTemplateColumns: gridTemplate,
      borderBottom: `1.5px solid ${INK.dark}`,
    }}
  >
    {columns.map((col, index) => (
      <div
        key={col.key}
        className={index === 1 ? 'pl-3' : ''}
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
// DATA ROW
// =============================================================================

interface DataRowProps<T> {
  item: T;
  index: number;
  columns: ColumnDef[];
  gridTemplate: string;
  renderCells: (item: T, index: number, isHovered: boolean) => React.ReactNode[];
  rowOpacity?: number;
}

function DataRow<T>({
  item,
  index,
  columns,
  gridTemplate,
  renderCells,
  rowOpacity = 1,
}: DataRowProps<T>) {
  const [isHovered, setIsHovered] = useState(false);
  const rank = index + 1;

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: rowOpacity,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.4,
        ease: EASE.out,
      },
    }),
  };

  const cells = renderCells(item, index, isHovered);

  return (
    <motion.div
      className="grid items-center relative"
      style={{
        gridTemplateColumns: gridTemplate,
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
      {/* Rank Cell - Always first */}
      <div
        className="flex items-center justify-center"
        style={{
          fontFamily: FONT.serif,
          fontSize: 18,
          fontWeight: 400,
          color: rank === 1 ? INK.gold : INK.faded,
        }}
      >
        {rank}
      </div>

      {/* User-provided cells */}
      {cells.map((cell, cellIndex) => (
        <div key={columns[cellIndex + 1]?.key || cellIndex}>
          {cell}
        </div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

interface FooterProps {
  footer: LedgerTableFooter;
  rowCount: number;
}

const Footer: React.FC<FooterProps> = ({ footer, rowCount }) => (
  <motion.div
    className="mt-6 pt-4 flex items-center gap-6"
    style={{ borderTop: `1px dashed ${INK.rule}` }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: rowCount * 0.03 + 0.2 }}
  >
    <div
      style={{
        fontFamily: FONT.sans,
        fontSize: 12,
        color: INK.faded,
      }}
    >
      <span style={{ color: INK.muted, fontWeight: 600 }}>{footer.activeCount}</span>{' '}
      {footer.activeLabel || 'active'}
    </div>
    {footer.inactiveCount !== undefined && footer.inactiveCount > 0 && (
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: INK.ghost,
        }}
      >
        <span style={{ fontWeight: 500 }}>{footer.inactiveCount}</span>{' '}
        {footer.inactiveLabel || 'inactive'}
      </div>
    )}
  </motion.div>
);

// =============================================================================
// DRAWER SECTION HEADER - Clean Accordion Style (matches Service Mapping)
// =============================================================================

interface DrawerSectionHeaderProps {
  label: string;
  description?: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  color: string;
}

const DrawerSectionHeader: React.FC<DrawerSectionHeaderProps> = ({
  label,
  description,
  count,
  isExpanded,
  onToggle,
  color,
}) => {
  return (
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-stone-50"
      style={{
        backgroundColor: isExpanded ? INK.cream : 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight size={16} color={INK.faded} />
        </motion.div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center gap-2.5">
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 15,
              fontWeight: 600,
              color: INK.body,
            }}
          >
            {label}
          </span>
          {description && (
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 13,
                color: INK.muted,
              }}
            >
              — {description}
            </span>
          )}
        </div>
      </div>
      <span
        className="px-2.5 py-1 rounded-full"
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          fontWeight: 600,
          color: INK.body,
          backgroundColor: INK.cream,
        }}
      >
        {count}
      </span>
    </button>
  );
};

// =============================================================================
// DRAWER ROW - Clean list item (matches Service Mapping style)
// =============================================================================

interface DrawerRowProps<T> {
  item: T;
  index: number;
  totalItems: number;
  columns: ColumnDef[];
  gridTemplate: string;
  renderCells: (item: T, index: number, isHovered: boolean) => React.ReactNode[];
}

function DrawerRow<T>({
  item,
  index,
  totalItems,
  columns,
  gridTemplate,
  renderCells,
}: DrawerRowProps<T>) {
  const [isHovered, setIsHovered] = useState(false);
  const cells = renderCells(item, index, isHovered);
  const isLast = index === totalItems - 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="grid items-center group"
      style={{
        gridTemplateColumns: gridTemplate,
        borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
        minHeight: 56,
        backgroundColor: isHovered ? INK.cream : 'transparent',
        opacity: 0.75,
        transition: 'background-color 0.15s ease, opacity 0.15s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ opacity: 1 }}
    >
      {/* Empty rank cell - subtle dash */}
      <div
        className="flex items-center justify-center"
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          color: INK.ghost,
        }}
      >
        —
      </div>

      {/* User-provided cells */}
      {cells.map((cell, cellIndex) => (
        <div key={columns[cellIndex + 1]?.key || cellIndex}>
          {cell}
        </div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// DRAWER SECTION CONTAINER - Clean accordion (matches Service Mapping)
// =============================================================================

interface DrawerSectionContainerProps<T> {
  section: DrawerSection<T>;
  columns: ColumnDef[];
  gridTemplate: string;
  keyExtractor: (item: T) => string;
  renderRow: (item: T, index: number, isHovered: boolean) => React.ReactNode[];
  isLast: boolean;
}

function DrawerSectionContainer<T>({
  section,
  columns,
  gridTemplate,
  keyExtractor,
  renderRow,
  isLast,
}: DrawerSectionContainerProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (section.items.length === 0) return null;

  // Map accent to color
  const accentColors: Record<string, string> = {
    stone: INK.faded,
    amber: INK.amber,
    ghost: INK.ghost,
  };
  const color = accentColors[section.accent || 'stone'] || INK.faded;

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${INK.rule}`,
      }}
    >
      <DrawerSectionHeader
        label={section.label}
        description={section.description}
        count={section.items.length}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        color={color}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <AnimatePresence mode="popLayout">
                {section.items.map((item, index) => (
                  <DrawerRow
                    key={keyExtractor(item)}
                    item={item}
                    index={index}
                    totalItems={section.items.length}
                    columns={columns}
                    gridTemplate={gridTemplate}
                    renderCells={renderRow}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LedgerTable<T>({
  columns,
  data,
  keyExtractor,
  renderRow,
  rowOpacity,
  footer,
  emptyMessage = 'No items to display.',
  drawerSections,
}: LedgerTableProps<T>) {
  // Prepend rank column to user columns
  const allColumns = [RANK_COLUMN, ...columns];
  const gridTemplate = allColumns.map((c) => c.width).join(' ');

  // Check if there are any drawer sections with items
  const hasDrawerContent = drawerSections?.some((s) => s.items.length > 0);

  return (
    <div className="w-full">
      {/* Header */}
      <HeaderRow columns={allColumns} gridTemplate={gridTemplate} />

      {/* Main Rows */}
      <div>
        {data.length > 0 ? (
          data.map((item, index) => (
            <DataRow
              key={keyExtractor(item)}
              item={item}
              index={index}
              columns={allColumns}
              gridTemplate={gridTemplate}
              renderCells={renderRow}
              rowOpacity={rowOpacity?.(item)}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="py-12 text-center"
          >
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 14,
                color: INK.faded,
              }}
            >
              {emptyMessage}
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer - only show if we have main data and no drawer sections */}
      {footer && data.length > 0 && !hasDrawerContent && (
        <Footer footer={footer} rowCount={data.length} />
      )}

      {/* Drawer Sections - Clean accordion style */}
      {hasDrawerContent && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: data.length * 0.03 + 0.2, duration: 0.3 }}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${INK.rule}` }}
          >
            {drawerSections?.filter(s => s.items.length > 0).map((section, idx, arr) => (
              <DrawerSectionContainer
                key={section.id}
                section={section}
                columns={allColumns}
                gridTemplate={gridTemplate}
                keyExtractor={keyExtractor}
                renderRow={renderRow}
                isLast={idx === arr.length - 1}
              />
            ))}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="mt-4 flex items-center gap-6"
              style={{ paddingLeft: 4 }}
            >
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  color: INK.faded,
                }}
              >
                <span style={{ color: INK.muted, fontWeight: 600 }}>{footer.activeCount}</span>{' '}
                {footer.activeLabel || 'active'}
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  color: INK.ghost,
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {drawerSections?.reduce((sum, s) => sum + s.items.length, 0) || 0}
                </span>{' '}
                archived
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default LedgerTable;
