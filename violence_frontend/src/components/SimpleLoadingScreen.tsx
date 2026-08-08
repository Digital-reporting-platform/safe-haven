import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function SimpleLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-4 border-primary/20 h-32 w-32 animate-spin rounded-full" />
        </motion.div>

        {/* Logo */}
        <motion.div
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="h-10 w-10 text-primary" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="mt-6 text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
