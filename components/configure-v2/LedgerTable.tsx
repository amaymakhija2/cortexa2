import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

export interface LedgerTableProps<T> {
  columns: ColumnDef[];
  data: T[];
  keyExtractor: (item: T) => string;
  renderRow: (item: T, index: number, isHovered: boolean) => React.ReactNode[];
  rowOpacity?: (item: T) => number;
  footer?: LedgerTableFooter;
  emptyMessage?: string;
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
    className="grid items-end pb-4"
    style={{
      gridTemplateColumns: gridTemplate,
      borderBottom: `2px solid ${INK.dark}`,
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
}: LedgerTableProps<T>) {
  // Prepend rank column to user columns
  const allColumns = [RANK_COLUMN, ...columns];
  const gridTemplate = allColumns.map((c) => c.width).join(' ');

  return (
    <div className="w-full">
      {/* Header */}
      <HeaderRow columns={allColumns} gridTemplate={gridTemplate} />

      {/* Rows */}
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

      {/* Footer */}
      {footer && data.length > 0 && <Footer footer={footer} rowCount={data.length} />}
    </div>
  );
}

export default LedgerTable;
