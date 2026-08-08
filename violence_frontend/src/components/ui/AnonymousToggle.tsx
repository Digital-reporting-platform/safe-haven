import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, Eye, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  onChange: (anonymous: boolean) => void;
  className?: string;
}

export const AnonymousToggle: React.FC<AnonymousToggleProps> = ({
  isAnonymous,
  onChange,
  className = '',
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`rounded-lg border border-stone-200/50 bg-white/80 p-6 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50">
            <Shield className="h-5 w-5 text-[#C15B3E]" />
          </div>
          <div>
            <h3 className="font-bold text-stone-800">{t('anonymousToggle.title')}</h3>
            <p className="text-sm text-stone-600">
              {t('anonymousToggle.description')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(!isAnonymous)}
          className={`relative h-8 w-16 rounded-full transition-all duration-300 focus:ring-4 focus:ring-[#C15B3E]/20 focus:outline-none ${isAnonymous ? 'bg-[#C15B3E]' : 'bg-stone-300'} `}
        >
          <motion.div
            className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg"
            animate={{ x: isAnonymous ? 36 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {isAnonymous ? (
              <EyeOff className="h-3 w-3 text-[#C15B3E]" />
            ) : (
              <Eye className="h-3 w-3 text-stone-500" />
            )}
          </motion.div>
        </button>
      </div>

      {isAnonymous && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 rounded-lg bg-stone-50 p-3"
        >
          <p className="text-xs font-medium text-stone-600">
            {t('anonymousToggle.features')}
          </p>
        </motion.div>
      )}
    </div>
  );
};
