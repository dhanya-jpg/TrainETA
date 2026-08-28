import React from 'react';
import { motion } from 'motion/react';

export const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Background canvas */}
      <div className="absolute inset-0 bg-bg transition-colors duration-700" />
      
      {/* Subtle Grid - Adapts to Light/Dark */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)'
        }}
      />

      {/* Dynamic Glowing Orbs matching theme accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 dark:opacity-35">
        <motion.div 
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-accent/20 blur-[100px] dark:blur-[140px]"
        />
        <motion.div 
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 80, -50, 0],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-accent/15 blur-[120px] dark:blur-[160px]"
        />
      </div>
    </div>
  );
};

