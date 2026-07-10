import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  min?: string; // Format: 'YYYY-MM-DD'
  error?: boolean;
  className?: string;
  placeholder?: string;
}

const POPOVER_WIDTH = 256;
const VIEWPORT_PADDING = 8;

export const CustomDatePicker = ({
  value,
  onChange,
  min,
  error = false,
  className = '',
  placeholder = 'dd/mm/yyyy',
}: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePopoverPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const popoverHeight = popover?.offsetHeight ?? 280;
    const gap = 6;

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUp = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    let top = openUp ? rect.top - popoverHeight - gap : rect.bottom + gap;
    let left = rect.right - POPOVER_WIDTH;

    left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, window.innerHeight - popoverHeight - VIEWPORT_PADDING));

    setPopoverStyle({
      position: 'fixed',
      top,
      left,
      width: POPOVER_WIDTH,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();
    const raf = requestAnimationFrame(updatePopoverPosition);

    window.addEventListener('scroll', updatePopoverPosition, true);
    window.addEventListener('resize', updatePopoverPosition);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', updatePopoverPosition, true);
      window.removeEventListener('resize', updatePopoverPosition);
    };
  }, [isOpen, updatePopoverPosition, viewDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) setViewDate(initialViewDate);
    setIsOpen((prev) => !prev);
  };

  const minDate = min ? new Date(min) : null;
  if (minDate) minDate.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value) : null;
  if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
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

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }, [value]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  const calendarPopover = isOpen ? (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="p-3 bg-bg-secondary border border-border-custom rounded-xl shadow-lg-custom animate-dropdown-enter"
    >
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

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-text-muted">
            {day}
          </div>
        ))}
      </div>

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
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
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

      {calendarPopover && createPortal(calendarPopover, document.body)}
    </div>
  );
};
