'use client';

import { motion } from 'framer-motion';
import React from 'react';

export function AnimatedCTA() {
  return (
    <section className="w-full flex justify-center py-20 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <radialGradient id="cta-gradient" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-gradient)" />
        </svg>
      </motion.div>
      <div className="text-center z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Ready to Revolutionize Your Communication Strategy?</h2>
        <p className="text-lg text-indigo-100 mb-8">Get started with Inexra today and unlock the power of your digital communications.</p>
        <motion.a
          href="#get-started"
          className="inline-block px-12 py-5 bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 hover:shadow-indigo-400/40 transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-400 animate-pulse"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.a>
      </div>
    </section>
  );
} 