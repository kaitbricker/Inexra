'use client';

import { motion } from 'framer-motion';
import React from 'react';

export function FeatureHighlights({ features }: { features: { title: string; desc: string; icon: React.ReactNode }[] }) {
  return (
    <section id="features" className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-2xl shadow-xl p-8 border border-indigo-700/30 flex flex-col items-center gap-4 hover:scale-105 hover:shadow-2xl transition group"
          whileHover={{ scale: 1.05 }}
        >
          <div className="mb-2">{f.icon}</div>
          <div className="font-bold text-xl text-indigo-200 group-hover:text-indigo-400 transition bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{f.title}</div>
          <div className="text-gray-300 text-center">{f.desc}</div>
        </motion.div>
      ))}
    </section>
  );
} 