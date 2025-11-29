import React from 'react';

// =============================================================================
// GRID SYSTEM
// =============================================================================
// Flexible grid layouts for organizing cards and content.
// Uses Tailwind's responsive grid with consistent gaps.
// =============================================================================

export type GridColumns = 1 | 2 | 3 | 4 | 5;

export interface GridProps {
  /** Number of columns (responsive: always 1 on mobile, specified on lg+) */
  cols?: GridColumns;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Grid items */
  children: React.ReactNode;
}

const GAP_CLASSES = {
  sm: 'gap-4 xl:gap-5',
  md: 'gap-5 xl:gap-6',
  lg: 'gap-6 xl:gap-8',
};

const COLS_CLASSES: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

/**
 * Grid - Responsive grid layout for cards
 *
 * @example
 * // 4-column grid for hero stats
 * <Grid cols={4} gap="md">
 *   <StatCard ... />
 *   <StatCard ... />
 *   <StatCard ... />
 *   <StatCard ... />
 * </Grid>
 *
 * @example
 * // 2-column grid for charts
 * <Grid cols={2} gap="lg">
 *   <ChartCard ... />
 *   <ChartCard ... />
 * </Grid>
 */
export const Grid: React.FC<GridProps> = ({
  cols = 2,
  gap = 'md',
  className = '',
  children,
}) => {
  return (
    <div className={`grid ${COLS_CLASSES[cols]} ${GAP_CLASSES[gap]} ${className}`}>
      {children}
    </div>
  );
};

// =============================================================================
// SECTION COMPONENT
// =============================================================================
// Wrapper for vertical spacing between page sections.
// =============================================================================

export interface SectionProps {
  /** Vertical spacing */
  spacing?: 'sm' | 'md' | 'lg' | 'none';
  /** Additional className */
  className?: string;
  /** Section content */
  children: React.ReactNode;
}

const SPACING_CLASSES = {
  none: '',
  sm: 'mb-4 xl:mb-5',
  md: 'mb-6 xl:mb-8',
  lg: 'mb-8 xl:mb-10',
};

/**
 * Section - Vertical spacing wrapper for page sections
 *
 * @example
 * <Section spacing="md">
 *   <Grid cols={4}>...</Grid>
 * </Section>
 */
export const Section: React.FC<SectionProps> = ({
  spacing = 'md',
  className = '',
  children,
}) => {
  return (
    <div className={`${SPACING_CLASSES[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// =============================================================================
// PAGE CONTENT WRAPPER
// =============================================================================
// Standard padding and spacing for main content area below header.
// =============================================================================

export interface PageContentProps {
  /** Additional className */
  className?: string;
  /** Page content */
  children?: React.ReactNode;
}

/**
 * PageContent - Standard content area wrapper with proper padding
 *
 * @example
 * <PageHeader ... />
 * <PageContent>
 *   <Section>
 *     <Grid cols={4}>...</Grid>
 *   </Section>
 * </PageContent>
 */
export const PageContent: React.FC<PageContentProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 xl:px-10 py-6 xl:py-10 space-y-6 xl:space-y-8 ${className}`}>
      {children}
    </div>
  );
};

export default Grid;
