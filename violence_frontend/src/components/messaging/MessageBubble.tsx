import { UserRole } from '@/types/user';
import { getRoleLabel, formatMessageTime, getSenderDisplayName } from '@/services/caseMessagingService';
import type { CaseMessage } from '@/services/caseMessagingService';
import { User, Stethoscope, Scale, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: CaseMessage;
  isCurrentUser: boolean;
  currentUserRole?: UserRole;
}

const getRoleIcon = (role?: string) => {
  switch (role) {
    case 'MEDICAL_PROFESSIONAL':
      return <Stethoscope className="h-4 w-4" />;
    case 'LEGAL_ADVISOR':
      return <Scale className="h-4 w-4" />;
    case 'SURVIVOR':
      return <User className="h-4 w-4" />;
    default:
      return <Bot className="h-4 w-4" />;
  }
};

const getRoleColor = (isCurrentUser: boolean, role?: string) => {
  if (isCurrentUser) {
    return 'bg-gradient-to-br from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)]';
  }
  switch (role) {
    case 'MEDICAL_PROFESSIONAL':
      return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
    case 'LEGAL_ADVISOR':
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    case 'COUNSELOR':
      return 'bg-gradient-to-br from-purple-500 to-purple-600';
    default:
      return 'bg-gradient-to-br from-slate-400 to-slate-500';
  }
};

const getBubbleColor = (isCurrentUser: boolean, role?: string) => {
  if (isCurrentUser) {
    return 'bg-gradient-to-br from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] text-white shadow-lg';
  }
  switch (role) {
    case 'MEDICAL_PROFESSIONAL':
      return 'bg-white border-l-4 border-emerald-500 text-slate-800 shadow-md';
    case 'LEGAL_ADVISOR':
      return 'bg-white border-l-4 border-blue-500 text-slate-800 shadow-md';
    case 'COUNSELOR':
      return 'bg-white border-l-4 border-purple-500 text-slate-800 shadow-md';
    default:
      return 'bg-white border-l-4 border-slate-400 text-slate-800 shadow-md';
  }
};

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const isSystem = message.isSystemMessage;
  const displayName = getSenderDisplayName(message);
  const roleLabel = getRoleLabel(message);
  const timeFormatted = formatMessageTime(message.createdAt);

  if (isSystem) {
    return (
      <div className="my-4 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-slate-100 to-stone-100 px-5 py-2.5 shadow-sm border border-slate-200">
          <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-slate-700">{message.content}</span>
            <span className="ml-2 text-xs text-slate-400">{timeFormatted}</span>
          </div>
        </div>
      </div>
    );
  }

  const avatarColor = getRoleColor(isCurrentUser, message.senderRole);
  const bubbleStyle = getBubbleColor(isCurrentUser, message.senderRole);

  return (
    <div className={`my-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[85%] gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`shrink-0 h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center shadow-md`}>
          {isCurrentUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            getRoleIcon(message.senderRole)
          )}
        </div>

        {/* Message Bubble */}
        <div className={`relative rounded-2xl px-4 py-3 ${bubbleStyle} ${isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
          {/* Sender Info */}
          <div className={`mb-1.5 flex items-center gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs font-bold ${isCurrentUser ? 'text-white/90' : 'text-slate-700'}`}>
              {displayName}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isCurrentUser ? 'bg-white/20 text-white/80' : 'bg-slate-100 text-slate-500'}`}>
              {roleLabel}
            </span>
          </div>

          {/* Message Content */}
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isCurrentUser ? 'text-white' : 'text-slate-700'}`}>
            {message.content}
          </p>

          {/* Timestamp */}
          <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${isCurrentUser ? 'justify-end text-white/70' : 'justify-start text-slate-400'}`}>
            <span>{timeFormatted}</span>
            {isCurrentUser && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
