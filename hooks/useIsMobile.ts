import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport is below a breakpoint.
 * Default breakpoint is 1024px (lg: in Tailwind).
 *
 * @param breakpoint - Width in pixels below which is considered "mobile"
 * @returns boolean - true if viewport width < breakpoint
 */
export const useIsMobile = (breakpoint: number = 1024): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    handleResize();

    // Add debounced resize listener
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
