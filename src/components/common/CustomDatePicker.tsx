import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  min?: string; // Format: 'YYYY-MM-DD'
  error?: boolean;
  className?: string;
  placeholder?: string;
}

export const CustomDatePicker = ({
  value,
  onChange,
  min,
  error = false,
  className = '',
  placeholder = 'dd/mm/yyyy',
}: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse initial viewDate from value, or default to tomorrow if no value
  const initialViewDate = useMemo(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(initialViewDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update viewDate when popover opens so it shows the selected month
  useEffect(() => {
    if (isOpen) {
      setViewDate(initialViewDate);
    }
  }, [isOpen, initialViewDate]);

  const minDate = min ? new Date(min) : null;
  if (minDate) minDate.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value) : null;
  if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

  // Generate calendar grid
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  // Adjust to make Monday the first day of the week (0 = Mon, 6 = Sun)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && d < minDate) return;

    // Format to YYYY-MM-DD (local timezone)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Format display value: DD/MM/YYYY
  const displayValue = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }, [value]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`
          w-full px-3 py-2.5 bg-bg-surface border rounded-xl
          text-left flex items-center justify-between cursor-pointer
          transition-all duration-200 outline-none text-sm
          ${error
            ? 'border-danger/50 focus:border-danger/70 focus:ring-1 focus:ring-danger/20'
            : isOpen
              ? 'border-brand/50 ring-1 ring-brand/20'
              : 'border-border-custom hover:border-text-muted/30'
          }
        `}
      >
        <span className={`${displayValue ? 'text-text-primary' : 'text-text-muted'}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={14} className="text-text-muted" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-64 p-3 bg-bg-secondary border border-border-custom rounded-xl shadow-lg-custom animate-dropdown-enter right-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer border-none"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-semibold text-text-primary">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer border-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-text-muted">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-7 h-7" />;
              }

              const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              currentDate.setHours(0, 0, 0, 0);
              
              const isSelected = selectedDate?.getTime() === currentDate.getTime();
              const isDisabled = minDate ? currentDate < minDate : false;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-colors cursor-pointer border-none outline-none
                    ${isDisabled 
                      ? 'text-text-muted/30 cursor-not-allowed bg-transparent' 
                      : isSelected
                        ? 'bg-brand text-white font-medium shadow-brand'
                        : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary bg-transparent'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
