import type { ReactNode } from 'react';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { cn } from '../../../utils/shadcn';

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reveals direct children with staggered delays when scrolled into view.
 */
export const StaggerChildren = ({
  children,
  className,
}: StaggerChildrenProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08 });

  return (
    <div
      ref={ref}
      data-stagger
      className={cn(isVisible && 'is-revealed', className)}
    >
      {children}
    </div>
  );
};
