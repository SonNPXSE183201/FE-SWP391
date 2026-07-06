import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { listItemVariants } from './motion.config';

interface MotionListItemProps {
  children: ReactNode;
  className?: string;
  layout?: boolean;
}

export const MotionListItem = ({ children, className, layout = true }: MotionListItemProps) => (
  <motion.div
    className={className}
    variants={listItemVariants}
    layout={layout}
    whileHover={{ y: -1 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
);
