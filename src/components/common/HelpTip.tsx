import { useState, useRef, useEffect, useLayoutEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

export type HelpTipPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

interface HelpTipProps {
  /** Nội dung hiển thị trong popover */
  content: ReactNode;
  /** Tiêu đề popover (mặc định: Hướng dẫn) */
  title?: string;
  ariaLabel?: string;
  placement?: HelpTipPlacement;
  /** Chiều rộng popover, mặc định 18rem */
  width?: number | string;
  size?: 'sm' | 'md';
  /** Tự đóng sau N ms (0 = không tự đóng). Mặc định 5000 */
  autoCloseMs?: number;
  className?: string;
}

const SIZE_CLASSES = {
  sm: { button: 'w-5 h-5', icon: 12 },
  md: { button: 'w-6 h-6', icon: 13 },
} as const;

const GAP = 8;
const VIEWPORT_PAD = 8;

const parseWidthPx = (width: number | string): number => {
  if (typeof width === 'number') return width;
  const rem = width.match(/^([\d.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * 16;
  const px = width.match(/^([\d.]+)px$/);
  if (px) return parseFloat(px[1]);
  return 288;
};

export const HelpTip = ({
  content,
  title = 'Hướng dẫn',
  ariaLabel = 'Xem hướng dẫn',
  placement = 'bottom-start',
  width = '18rem',
  size = 'md',
  autoCloseMs = 5000,
  className = '',
}: HelpTipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ width: '18rem', visibility: 'hidden' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sizeConfig = SIZE_CLASSES[size];
  const widthValue = typeof width === 'number' ? `${width}px` : width;

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const popover = popoverRef.current;
    if (!button || !popover) return;

    const rect = button.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const popoverW = popoverRect.width || parseWidthPx(width);
    const popoverH = popoverRect.height || 0;

    let top: number;
    let left: number;

    switch (placement) {
      case 'bottom-end':
        top = rect.bottom + GAP;
        left = rect.right - popoverW;
        break;
      case 'top-start':
        top = rect.top - GAP - popoverH;
        left = rect.left;
        break;
      case 'top-end':
        top = rect.top - GAP - popoverH;
        left = rect.right - popoverW;
        break;
      case 'bottom-start':
      default:
        top = rect.bottom + GAP;
        left = rect.left;
        break;
    }

    const maxLeft = window.innerWidth - popoverW - VIEWPORT_PAD;
    left = Math.max(VIEWPORT_PAD, Math.min(left, maxLeft));

    if (placement.startsWith('bottom') && top + popoverH > window.innerHeight - VIEWPORT_PAD) {
      top = rect.top - GAP - popoverH;
    } else if (placement.startsWith('top') && top < VIEWPORT_PAD) {
      top = rect.bottom + GAP;
    }

    top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - popoverH - VIEWPORT_PAD));

    setPopoverStyle({ top, left, width: widthValue, visibility: 'visible' });
  }, [placement, width, widthValue]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition, content, title]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onReposition = () => updatePosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || autoCloseMs <= 0) return undefined;
    const timer = window.setTimeout(close, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, autoCloseMs, close]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      <div className={`inline-flex shrink-0 ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          className={`${sizeConfig.button} rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
            isOpen
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : 'bg-bg-surface border-border-custom text-text-muted hover:text-amber-400 hover:border-amber-500/30'
          }`}
        >
          <CircleHelp size={sizeConfig.icon} />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            role="tooltip"
            className="fixed z-[9999] p-3 rounded-xl bg-bg-primary border border-amber-500/25 shadow-xl text-[11px] text-text-secondary leading-relaxed animate-fade-in"
            style={popoverStyle}
          >
            {title && <p className="text-amber-300 font-medium mb-1">{title}</p>}
            <div>{content}</div>
          </div>,
          document.body,
        )}
    </>
  );
};
