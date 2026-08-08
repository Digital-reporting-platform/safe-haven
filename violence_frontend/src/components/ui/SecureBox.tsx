import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface SecureBoxProps {
  children: React.ReactNode;
  className?: string;
  showSecurityIndicator?: boolean;
}

export const SecureBox: React.FC<SecureBoxProps> = ({
  children,
  className = '',
  showSecurityIndicator = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-[48px] border-2 border-[#C15B3E]/20 bg-white shadow-xl backdrop-blur-2xl dark:border-[#C15B3E]/30 dark:bg-stone-900/40 ${className} `}
    >
      {/* Inner subtle glow */}
      <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-[#FDFDF5]/50 to-[#C15B3E]/10 dark:from-[#FDFDF5]/5 dark:to-[#C15B3E]/5" />

      {/* Security indicator */}
      {showSecurityIndicator && (
        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-[#C15B3E]/20 bg-[#C15B3E]/10 px-3 py-1.5 dark:border-[#C15B3E]/30 dark:bg-[#C15B3E]/20">
          <Lock className="h-3 w-3 text-[#C15B3E] dark:text-[#C15B3E]" />
          <span className="text-xs font-bold tracking-wider text-[#C15B3E] uppercase dark:text-[#C15B3E]">
            Secure
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
