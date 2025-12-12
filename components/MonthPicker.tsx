import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerProps {
  selectedMonth: number; // 0-11
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
  minYear?: number;
  maxYear?: number;
  autoOpen?: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonth,
  selectedYear,
  onSelect,
  minYear = 2020,
  maxYear = new Date().getFullYear(),
  autoOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [viewYear, setViewYear] = useState(selectedYear);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAutoOpened = useRef(false);

  // Auto-open on mount if autoOpen is true
  useEffect(() => {
    if (autoOpen && !hasAutoOpened.current) {
      setIsOpen(true);
      hasAutoOpened.current = true;
    }
  }, [autoOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset view year when opening
  useEffect(() => {
    if (isOpen) {
      setViewYear(selectedYear);
    }
  }, [isOpen, selectedYear]);

  const handleMonthSelect = (month: number) => {
    onSelect(month, viewYear);
    setIsOpen(false);
  };

  const handlePrevYear = () => {
    if (viewYear > minYear) {
      setViewYear(viewYear - 1);
    }
  };

  const handleNextYear = () => {
    if (viewYear < maxYear) {
      setViewYear(viewYear + 1);
    }
  };

  const isCurrentMonth = (month: number) => {
    const now = new Date();
    return month === now.getMonth() && viewYear === now.getFullYear();
  };

  const isSelected = (month: number) => {
    return month === selectedMonth && viewYear === selectedYear;
  };

  const isFutureMonth = (month: number) => {
    const now = new Date();
    if (viewYear > now.getFullYear()) return true;
    if (viewYear === now.getFullYear() && month > now.getMonth()) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-stone-100 border border-stone-200/60 hover:border-stone-300 hover:bg-stone-50 transition-all duration-300"
      >
        <Calendar
          size={16}
          className="text-stone-400 group-hover:text-stone-600 transition-colors"
        />
        <span className="text-sm font-medium text-stone-700">
          {FULL_MONTHS[selectedMonth]} {selectedYear}
        </span>
        <ChevronRight
          size={14}
          className={`text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Header with Year Navigation */}
            <div className="px-5 py-4 bg-gradient-to-b from-stone-50 to-white border-b border-stone-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevYear}
                  disabled={viewYear <= minYear}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft size={18} />
                </button>

                <span
                  className="text-lg font-semibold text-stone-800 tabular-nums tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {viewYear}
                </span>

                <button
                  onClick={handleNextYear}
                  disabled={viewYear >= maxYear}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Month Grid */}
            <div className="p-5 pt-4">
              <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((month, index) => {
                  const selected = isSelected(index);
                  const current = isCurrentMonth(index);
                  const future = isFutureMonth(index);

                  return (
                    <button
                      key={month}
                      onClick={() => !future && handleMonthSelect(index)}
                      disabled={future}
                      className={`
                        w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-center
                        ${selected
                          ? 'bg-stone-900 text-white shadow-md'
                          : future
                            ? 'text-stone-300 cursor-not-allowed bg-stone-50'
                            : current
                              ? 'text-amber-700 bg-amber-50 border-2 border-amber-400'
                              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                        }
                      `}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="px-5 pb-5 pt-2 border-t border-stone-100">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const now = new Date();
                    onSelect(now.getMonth(), now.getFullYear());
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold text-stone-500 bg-stone-50 hover:bg-stone-100 hover:text-stone-700 transition-all duration-200"
                >
                  Current Month
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                    onSelect(prevMonth, prevYear);
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold text-stone-500 bg-stone-50 hover:bg-stone-100 hover:text-stone-700 transition-all duration-200"
                >
                  Last Month
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
