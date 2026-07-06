import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from './motion.config';

export interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes applied to the animated content panel */
  panelClassName?: string;
  /** Classes on the fixed outer container */
  containerClassName?: string;
  /** Backdrop overlay classes */
  backdropClassName?: string;
  zIndex?: number;
  closeOnBackdrop?: boolean;
  /** Lock body scroll while open */
  lockScroll?: boolean;
}

const zIndexClass = (z: number) => {
  if (z === 50) return 'z-50';
  if (z === 60) return 'z-[60]';
  if (z === 100) return 'z-[100]';
  return `z-[${z}]`;
};

export const AnimatedModal = ({
  open,
  onClose,
  children,
  panelClassName = 'relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-xl',
  containerClassName = 'flex items-center justify-center p-4',
  backdropClassName = 'absolute inset-0 bg-black/60 backdrop-blur-sm',
  zIndex = 50,
  closeOnBackdrop = true,
  lockScroll = true,
}: AnimatedModalProps) => {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const backdropMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        variants: modalBackdropVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
        exit: 'exit' as const,
      };

  const contentMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        variants: modalContentVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
        exit: 'exit' as const,
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 ${zIndexClass(zIndex)} ${containerClassName}`}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className={backdropClassName}
            {...backdropMotion}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            className={panelClassName}
            {...contentMotion}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
