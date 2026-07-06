import type { Variants, Transition } from 'framer-motion';

export const easeTransition: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
};

export const pageTransition: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeTransition },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const tabPanelVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: easeTransition },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: easeTransition },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.99 },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: easeTransition },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15 } },
};

export const canvasPageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const canvasShellTransition: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};
