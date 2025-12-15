import React from 'react';

// =============================================================================
// ANIMATED SECTION COMPONENT
// =============================================================================
// Provides consistent entrance animations with staggered reveals.
// CSS-only animations for performance - no library dependencies.
// =============================================================================

export interface AnimatedSectionProps {
  /** Animation delay in milliseconds (for staggering multiple sections) */
  delay?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Whether to animate (useful for disabling on reduced motion) */
  animate?: boolean;
  /** Additional className */
  className?: string;
  /** Content to animate */
  children: React.ReactNode;
}

/**
 * AnimatedSection - Entrance animation wrapper
 *
 * Provides a subtle fade-in + slide-up animation on mount.
 * Use the `delay` prop to create staggered reveals across multiple sections.
 *
 * @example
 * // Single section
 * <AnimatedSection>
 *   <Grid cols={4}>...</Grid>
 * </AnimatedSection>
 *
 * @example
 * // Staggered sections
 * <AnimatedSection delay={0}>
 *   <Grid cols={4}>...</Grid>
 * </AnimatedSection>
 * <AnimatedSection delay={100}>
 *   <ChartCard>...</ChartCard>
 * </AnimatedSection>
 * <AnimatedSection delay={200}>
 *   <DataTableCard>...</DataTableCard>
 * </AnimatedSection>
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  delay = 0,
  duration = 500,
  animate = true,
  className = '',
  children,
}) => {
  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`animate-section-enter ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}

      {/* CSS Keyframes - injected once via style tag */}
      <style>{`
        @keyframes sectionEnter {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-section-enter {
          animation: sectionEnter ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// ANIMATED GRID - Grid with staggered child animations
// =============================================================================

export interface AnimatedGridProps {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4 | 5;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Base delay before first item animates */
  baseDelay?: number;
  /** Delay between each item */
  staggerDelay?: number;
  /** Animation duration per item */
  duration?: number;
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

const COLS_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

/**
 * AnimatedGrid - Grid with staggered entrance animations for each child
 *
 * Each child automatically gets a staggered animation delay.
 *
 * @example
 * <AnimatedGrid cols={4} staggerDelay={50}>
 *   <StatCard ... />
 *   <StatCard ... />
 *   <StatCard ... />
 *   <StatCard ... />
 * </AnimatedGrid>
 */
export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  cols = 2,
  gap = 'md',
  baseDelay = 0,
  staggerDelay = 60,
  duration = 450,
  className = '',
  children,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={`grid ${COLS_CLASSES[cols]} ${GAP_CLASSES[gap]} items-stretch ${className}`}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className="animate-grid-item h-full [&>*]:h-full"
          style={{
            animationDelay: `${baseDelay + index * staggerDelay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}

      {/* CSS Keyframes */}
      <style>{`
        @keyframes gridItemEnter {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-grid-item {
          animation: gridItemEnter ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

// =============================================================================
// PAGE CONTENT WITH ANIMATIONS
// =============================================================================

export interface AnimatedPageContentProps {
  /** Base delay for the content area */
  baseDelay?: number;
  /** Additional className */
  className?: string;
  /** Content */
  children?: React.ReactNode;
}

/**
 * AnimatedPageContent - Page content wrapper with entrance animation
 *
 * Wraps content in a fade-in animation that triggers on mount.
 * Use with AnimatedSection or AnimatedGrid for staggered child animations.
 */
export const AnimatedPageContent: React.FC<AnimatedPageContentProps> = ({
  baseDelay = 50,
  className = '',
  children,
}) => {
  return (
    <div
      className={`px-4 sm:px-6 lg:px-8 xl:px-10 py-6 xl:py-10 space-y-6 xl:space-y-8 animate-page-content ${className}`}
      style={{
        animationDelay: `${baseDelay}ms`,
      }}
    >
      {children}

      {/* CSS Keyframes */}
      <style>{`
        @keyframes pageContentEnter {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-page-content {
          animation: pageContentEnter 300ms ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AnimatedSection;
