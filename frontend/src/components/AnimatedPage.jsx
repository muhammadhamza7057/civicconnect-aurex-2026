import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
