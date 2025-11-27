import { useState, useEffect } from 'react';

interface ChartSizes {
  tick: number;
  label: number;
  value: number;
  title: number;
  tooltipLabel: string;
  tooltipItem: string;
}

export const useResponsiveChartSizes = (): ChartSizes => {
  const [sizes, setSizes] = useState<ChartSizes>({
    tick: 14,
    label: 15,
    value: 16,
    title: 12,
    tooltipLabel: '14px',
    tooltipItem: '16px',
  });

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile
        setSizes({
          tick: 10,
          label: 11,
          value: 12,
          title: 9,
          tooltipLabel: '11px',
          tooltipItem: '12px',
        });
      } else if (width < 768) {
        // Large mobile / small tablet
        setSizes({
          tick: 11,
          label: 12,
          value: 13,
          title: 10,
          tooltipLabel: '12px',
          tooltipItem: '13px',
        });
      } else if (width < 1024) {
        // Tablet
        setSizes({
          tick: 12,
          label: 13,
          value: 14,
          title: 10,
          tooltipLabel: '13px',
          tooltipItem: '14px',
        });
      } else if (width < 1280) {
        // Small laptop
        setSizes({
          tick: 13,
          label: 14,
          value: 15,
          title: 11,
          tooltipLabel: '13px',
          tooltipItem: '15px',
        });
      } else {
        // Desktop (xl+)
        setSizes({
          tick: 14,
          label: 15,
          value: 16,
          title: 12,
          tooltipLabel: '14px',
          tooltipItem: '16px',
        });
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  return sizes;
};
