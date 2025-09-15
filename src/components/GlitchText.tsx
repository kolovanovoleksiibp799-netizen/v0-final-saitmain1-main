"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { useBuggyEffect } from '@/contexts/BuggyEffectContext';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // 0 to 1, how often and how strong the glitch
}

const GlitchText: React.FC<GlitchTextProps> = ({ children, className, intensity = 0.5 }) => {
  const { isBuggyMode } = useBuggyEffect();

  if (!isBuggyMode) {
    return <span className={className}>{children}</span>;
  }

  const glitchVariants = {
    initial: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      filter: 'hue-rotate(0deg) saturate(100%)',
    },
    glitch: {
      x: [0, Math.random() * 5 * intensity, -Math.random() * 5 * intensity, 0],
      y: [0, Math.random() * 5 * intensity, -Math.random() * 5 * intensity, 0],
      rotate: [0, Math.random() * 2 * intensity, -Math.random() * 2 * intensity, 0],
      scale: [1, 1 + Math.random() * 0.05 * intensity, 1 - Math.random() * 0.05 * intensity, 1],
      opacity: [1, 0.8, 1.2, 1],
      filter: [
        'hue-rotate(0deg) saturate(100%)',
        `hue-rotate(${Math.random() * 360 * intensity}deg) saturate(${100 + Math.random() * 50 * intensity}%)`,
        `hue-rotate(${Math.random() * 360 * intensity}deg) saturate(${100 + Math.random() * 50 * intensity}%)`,
        'hue-rotate(0deg) saturate(100%)',
      ],
      transition: {
        duration: 0.1 + Math.random() * 0.3 * intensity,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: Math.random() * 2,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block relative ${className}`}
      variants={glitchVariants}
      initial="initial"
      animate="glitch"
    >
      {children}
    </motion.span>
  );
};

export default GlitchText;