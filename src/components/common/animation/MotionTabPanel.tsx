import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { tabPanelVariants } from './motion.config';

interface MotionTabPanelProps {
  tabKey: string;
  children: ReactNode;
  className?: string;
}

/**
 * Animated tab content with slide + fade transition.
 */
export const MotionTabPanel = ({ tabKey, children, className }: MotionTabPanelProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tabKey}
      className={className}
      variants={tabPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);
