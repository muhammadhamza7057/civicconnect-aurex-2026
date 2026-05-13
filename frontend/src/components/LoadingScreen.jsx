import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import aiProcessing from '../animations/ai-processing.json';

export function LoadingScreen({ message = 'Loading CivicConnect' }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="cc-card max-w-md p-8 text-center">
        <div className="mx-auto h-40 w-40">
          <Lottie animationData={aiProcessing} loop />
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-text">{message}</h3>
        <p className="mt-2 text-sm text-muted">Preparing secure dashboards, realtime sockets, and AI workflows.</p>
      </motion.div>
    </div>
  );
}
