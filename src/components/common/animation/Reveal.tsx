import type { ReactNode, CSSProperties } from 'react';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { cn } from '../../../utils/shadcn';

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

const directionAttr: Record<RevealDirection, string | undefined> = {
  up: undefined,
  left: 'left',
  right: 'right',
  scale: 'scale',
};

/**
 * Scroll-triggered reveal wrapper for individual sections.
 */
export const Reveal = ({
  children,
  className,
  direction = 'up',
  delay,
  style,
}: RevealProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      data-reveal
      data-reveal-direction={directionAttr[direction]}
      data-delay={delay}
      className={cn(isVisible && 'is-revealed', className)}
      style={style}
    >
      {children}
    </div>
  );
};
