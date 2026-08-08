import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

interface TrustMicrocopyProps {
  type: 'privacy' | 'security' | 'verification' | 'anonymous';
  text?: string;
  className?: string;
}

const TRUST_MESSAGES = {
  privacy: {
    icon: Shield,
    text: 'Your data stays private',
    color: 'text-[#6B705C]',
  },
  security: {
    icon: Lock,
    text: 'End-to-end encrypted',
    color: 'text-[#C15B3E]',
  },
  verification: {
    icon: CheckCircle,
    text: 'Verified safe provider',
    color: 'text-[#DDA15E]',
  },
  anonymous: {
    icon: Eye,
    text: 'Identity protected',
    color: 'text-[#C15B3E]',
  },
};

export const TrustMicrocopy: React.FC<TrustMicrocopyProps> = ({
  type,
  text,
  className = '',
}) => {
  const config = TRUST_MESSAGES[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {text || config.text}
      </span>
    </div>
  );
};
