import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  menuAlign?: 'left' | 'right';
  size?: 'sm' | 'md';
}

// ─── Component ───────────────────────────────────────────────
export const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  error = false,
  icon,
  className = '',
  menuAlign = 'left',
  size = 'md',
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

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

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[data-option]');
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const enabledOptions = options.filter((o) => !o.disabled);

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightIndex(options.findIndex((o) => o.value === value));
        } else if (highlightIndex >= 0 && !options[highlightIndex]?.disabled) {
          onChange(options[highlightIndex].value);
          setIsOpen(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightIndex(options.findIndex((o) => o.value === value));
        } else {
          setHighlightIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) next++;
            return next < options.length ? next : prev;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && options[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        // Type-ahead: jump to first option starting with pressed key
        if (e.key.length === 1) {
          const idx = enabledOptions.findIndex((o) =>
            o.label.toLowerCase().startsWith(e.key.toLowerCase()),
          );
          if (idx >= 0) {
            const realIdx = options.indexOf(enabledOptions[idx]);
            setHighlightIndex(realIdx);
            if (!isOpen) setIsOpen(true);
          }
        }
    }
  }, [disabled, isOpen, highlightIndex, options, value, onChange]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-2 text-xs'
    : 'px-3 py-2.5 text-sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((p) => !p)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full ${sizeClasses} bg-bg-surface border rounded-xl
          text-left flex items-center gap-2 cursor-pointer
          transition-all duration-200 outline-none
          ${error
            ? 'border-danger/50 focus:border-danger/70 focus:ring-1 focus:ring-danger/20'
            : isOpen
              ? 'border-brand/50 ring-1 ring-brand/20'
              : 'border-border-custom hover:border-text-muted/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {icon && <span className="text-text-muted flex-shrink-0">{icon}</span>}
        <span className={`flex-1 truncate ${selected ? 'text-text-primary' : 'text-text-muted'}`}>
          {selected?.icon && <span className="mr-1.5">{selected.icon}</span>}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute z-50 mt-1.5 w-full min-w-[180px]
            bg-bg-secondary border border-border-custom rounded-xl
            shadow-lg-custom overflow-hidden
            animate-dropdown-enter
            ${menuAlign === 'right' ? 'right-0' : 'left-0'}
          `}
          style={{ maxHeight: '240px', overflowY: 'auto' }}
        >
          <div className="py-1">
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightIndex;

              return (
                <button
                  key={opt.value}
                  type="button"
                  data-option
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  disabled={opt.disabled}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-2 text-sm
                    transition-colors duration-100 border-none cursor-pointer outline-none
                    ${opt.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isHighlighted
                        ? 'bg-brand/10 text-text-primary'
                        : 'text-text-secondary hover:bg-bg-surface'
                    }
                    ${isSelected ? 'text-brand font-medium' : ''}
                  `}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check size={14} className="text-brand flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
