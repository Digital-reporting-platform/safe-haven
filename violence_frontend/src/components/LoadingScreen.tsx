import { Shield, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-midnight-blue via-electric-teal/10 to-bright-coral/10 dark:from-charcoal dark:via-electric-teal/5 dark:to-bright-coral/5 overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-electric-teal/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Animated Rings with Custom Colors */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-4 border-electric-teal/20 h-40 w-40 animate-spin rounded-full" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-4 border-bright-coral/30 h-28 w-28 animate-pulse rounded-full" />
        </motion.div>

        {/* Logo with Enhanced Animation */}
        <motion.div
          className="from-electric-teal via-bright-coral to-golden-amber shadow-electric-teal/30 relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="h-12 w-12 text-midnight-blue drop-shadow-lg" />
          </motion.div>
        </motion.div>

        {/* Floating Icons with Custom Colors */}
        <motion.div
          className="absolute -top-8 left-8"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Heart className="h-6 w-6 text-bright-coral" />
        </motion.div>

        <motion.div
          className="absolute -bottom-8 right-8"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          <Sparkles className="h-6 w-6 text-golden-amber" />
        </motion.div>

        {/* Brand Name with Typing Effect */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.h1
            className="from-electric-teal via-bright-coral to-golden-amber bg-gradient-to-r bg-clip-text text-3xl font-black tracking-tight text-transparent"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            SafeHaven
          </motion.h1>
          <motion.p
            className="mt-2 text-sm font-bold tracking-widest text-warm-brown uppercase dark:text-electric-teal/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Empowering Survivors
          </motion.p>
        </motion.div>

        {/* Enhanced Progress Bar with Custom Colors */}
        <motion.div
          className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-midnight-blue/20 dark:bg-charcoal/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="from-electric-teal via-bright-coral to-golden-amber h-full rounded-full bg-gradient-to-r"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 2.2, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading Text with Custom Colors */}
        <motion.p
          className="mt-4 text-xs text-warm-brown dark:text-electric-teal/60"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading your safe space...
        </motion.p>
      </div>
    </div>
  );
}
