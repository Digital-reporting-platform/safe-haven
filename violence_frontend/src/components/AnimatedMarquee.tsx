// src/components/AnimatedMarquee.tsx
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface AnimatedMarqueeProps {
  text: string;
  className?: string;
}

const AnimatedMarquee: React.FC<AnimatedMarqueeProps> = ({
  text,
  className = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const duration = 20;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: isPaused ? 0 : ['0%', '-100%'],
        }}
        transition={{
          duration: isPaused ? 0 : duration,
          ease: 'linear',
          repeat: isPaused ? 0 : Infinity,
          repeatType: 'loop',
          repeatDelay: 0,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={`marquee-item-${i}`} className="flex items-center">
            <span
              className={`group relative bg-gradient-to-r from-[var(--colors-terracotta-5)] via-[var(--colors-accent-highlight)] to-[var(--colors-olive-5)] bg-clip-text px-3 py-1 text-lg font-semibold text-transparent md:text-xl`}
            >
              {text}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            {i < 3 && (
              <div className="mx-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[var(--colors-terracotta-5)] to-[var(--colors-olive-5)]" />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedMarquee;
