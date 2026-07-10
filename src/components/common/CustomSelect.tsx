import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

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
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  menuAlign?: 'left' | 'right';
  size?: 'sm' | 'md';
  searchable?: boolean;
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
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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

  const handleSelect = useCallback((optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const enabledOptions = filteredOptions.filter((o) => !o.disabled);

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightIndex(filteredOptions.findIndex((o) => o.value === value));
        } else if (highlightIndex >= 0 && !filteredOptions[highlightIndex]?.disabled) {
          handleSelect(filteredOptions[highlightIndex].value);
        }
        break;
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
          setHighlightIndex(filteredOptions.findIndex((o) => o.value === value));
        } else if (!searchable && highlightIndex >= 0 && !filteredOptions[highlightIndex]?.disabled) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightIndex].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightIndex(filteredOptions.findIndex((o) => o.value === value));
        } else {
          setHighlightIndex((prev) => {
            let next = prev + 1;
            while (next < filteredOptions.length && filteredOptions[next].disabled) next++;
            return next < filteredOptions.length ? next : prev;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        // Type-ahead: jump to first option starting with pressed key
        if (!searchable && e.key.length === 1) {
          const idx = enabledOptions.findIndex((o) =>
            o.label.toLowerCase().startsWith(e.key.toLowerCase()),
          );
          if (idx >= 0) {
            const realIdx = filteredOptions.indexOf(enabledOptions[idx]);
            setHighlightIndex(realIdx);
            if (!isOpen) setIsOpen(true);
          }
        }
    }
  }, [disabled, isOpen, highlightIndex, filteredOptions, value, searchable, handleSelect]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      // Small timeout to ensure menu is rendered before focus
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-2 text-xs'
    : 'px-3 py-2.5 text-sm';

  const triggerIcon = selected?.icon ?? icon;

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
        {triggerIcon && <span className="text-text-muted flex-shrink-0">{triggerIcon}</span>}
        <span className={`flex-1 truncate ${selected ? 'text-text-primary' : 'text-text-muted'}`}>
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
            shadow-lg-custom overflow-hidden flex flex-col
            animate-dropdown-enter
            ${menuAlign === 'right' ? 'right-0' : 'left-0'}
          `}
          style={{ maxHeight: '260px' }}
        >
          {searchable && (
            <div className="p-2 border-b border-border-custom sticky top-0 bg-bg-secondary z-10">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    // Let ArrowUp/Down and Enter bubble up to parent's onKeyDown
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-bg-surface border border-border-custom rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-all"
                />
              </div>
            </div>
          )}
          <div className="py-1 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-text-muted">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
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
            })
          )}
          </div>
        </div>
      )}
    </div>
  );
};
