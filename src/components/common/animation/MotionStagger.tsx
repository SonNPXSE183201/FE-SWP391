import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/shadcn';
import { containerVariants, itemVariants } from './motion.config';

interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
}

export const MotionStagger = ({ children, className }: MotionStaggerProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    {children}
  </motion.div>
);

interface MotionItemProps {
  children: ReactNode;
  className?: string;
}

export const MotionItem = ({ children, className }: MotionItemProps) => (
  <motion.div
    className={cn(className)}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
  >
    {children}
  </motion.div>
);
