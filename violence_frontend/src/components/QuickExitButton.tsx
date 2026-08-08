import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

export function QuickExitButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickExit = () => {
    // Attempt to clear some browsing data and redirect
    if (typeof window !== 'undefined') {
      try {
        // Clear local storage items related to the app
        localStorage.removeItem('sh_token');
        localStorage.removeItem('sh_user');
        localStorage.removeItem('just_logged_out');

        // Redirect to a neutral site
        window.location.replace('https://www.google.com/search?q=weather+today');
      } catch {
        window.location.href = 'https://www.google.com';
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-6 left-6 z-[9999]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={handleQuickExit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#f54070] shadow-lg transition-all duration-300 hover:bg-[#e03560] hover:shadow-xl"
        aria-label="Quick Exit - Leave this site immediately"
      >
        {/* Icon container */}
        <div className="flex h-12 w-12 items-center justify-center">
          <LogOut className="h-5 w-5 text-white" />
        </div>

        {/* Expanded text */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap pr-4 text-sm font-bold tracking-wider text-white"
            >
              QUICK EXIT
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full ring-2 ring-[#f54070] ring-opacity-50 animate-ping opacity-0 group-hover:opacity-100" />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, delay: 0.5 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            Click for immediate exit
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
