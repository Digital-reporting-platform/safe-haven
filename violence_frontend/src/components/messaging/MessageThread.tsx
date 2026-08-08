import { useEffect, useRef, useState } from 'react';
import { MessageSquare, AlertCircle, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useAuth } from '@/auth/useAuth';
import { UserRole } from '@/types/user';
import type { CaseMessage } from '@/services/caseMessagingService';

interface MessageThreadProps {
  caseId: string;
  caseTitle?: string;
  messages: CaseMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  emptyStateText?: string;
}

export function MessageThread({
  caseId,
  caseTitle,
  messages,
  onSendMessage,
  isLoading = false,
  error = null,
  emptyStateText = 'No messages yet. Start the conversation!',
}: MessageThreadProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    setIsSending(true);
    try {
      await onSendMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  // Check if message is from current user
  const isCurrentUser = (message: CaseMessage): boolean => {
    if (!user) return false;
    // System messages are never from current user
    if (message.isSystemMessage) return false;
    // Anonymous messages have no author
    if (!message.author) return false;
    return message.author.id === user.id;
  };

  return (
    <Card className="flex h-[600px] flex-col border-0 shadow-none bg-transparent">
      {/* Professional Header */}
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-[var(--role-survivor-primary)]/5 via-[var(--role-survivor-primary)]/10 to-[var(--role-survivor-primary)]/5 rounded-t-2xl pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--role-survivor-primary)] to-[var(--role-survivor-accent)] flex items-center justify-center shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[var(--role-survivor-text)]">
                {caseTitle || 'Secure Messages'}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <Lock className="h-3 w-3" />
                <span>End-to-end encrypted</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-emerald-600 font-medium">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <Badge variant="outline" className="rounded-full border-[var(--role-survivor-primary)]/30 bg-[var(--role-survivor-primary)]/10 text-[var(--role-survivor-primary)] text-xs font-semibold">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0 bg-white/50 rounded-b-2xl">
        {/* Error State */}
        {error && (
          <div className="m-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[var(--role-survivor-primary)]" />
                <span className="text-sm font-medium">Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-8">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium mb-1">No messages yet</p>
              <p className="text-slate-400 text-sm">{emptyStateText}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser(message)}
                  currentUserRole={user?.role as UserRole}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-white p-5 rounded-b-2xl">
          <MessageInput
            onSend={handleSend}
            disabled={isLoading || isSending}
            placeholder="Type your message to your support team..."
            caseId={caseId}
            allowAttachments={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
