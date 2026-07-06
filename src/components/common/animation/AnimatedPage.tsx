import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition } from './motion.config';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Framer Motion page transition on route change.
 */
export const AnimatedPage = ({ children, className = '' }: AnimatedPageProps) => {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};
