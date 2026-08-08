import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/components/AppContext';
import { toast } from 'sonner';
import {
  getCaseMessages,
  sendMessage,
  markMessagesAsRead,
} from '@/services/caseMessagingService';
import { patientService } from '@/services/patientService';
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  User,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Conversation = {
  reportId: string;
  patientId: string;
  patientName: string;
  assignedByML: boolean;
  caseType: string;
  assignedProviders?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderName: string | null;
};

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  isSystemMessage?: boolean;
};

export function Messages() {
  const { t } = useTranslation();
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const filteredConversations = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return conversations;
    return conversations.filter(
      (item) =>
        item.patientName.toLowerCase().includes(key) ||
        item.caseType.toLowerCase().includes(key) ||
        (item.lastMessage || '').toLowerCase().includes(key),
    );
  }, [conversations, search]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.reportId === selectedReportId) || null,
    [conversations, selectedReportId],
  );

  const loadConversations = async () => {
    try {
      const data = await patientService.getChatConversations();
      setConversations(data);
      if (!selectedReportId && data.length > 0) {
        setSelectedReportId(data[0].reportId);
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
      toast.error(t('survivor.messages.failedToLoadConversations'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (patientId: string, reportId: string) => {
    if (!patientId || !reportId) return;
    try {
      const thread = await patientService.getPatientChat(patientId, reportId);
      setMessages(thread.messages);
    } catch (error) {
      console.error('Failed to load messages', error);
      toast.error(t('survivor.messages.failedToLoadMessages'));
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.patientId, selectedConversation.reportId);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !selectedConversation) return;

    try {
      setSending(true);
      await patientService.sendPatientChat(
        selectedConversation.patientId,
        content,
        selectedConversation.reportId,
      );
      setDraft('');
      await loadMessages(
        selectedConversation.patientId,
        selectedConversation.reportId,
      );
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error(t('survivor.messages.failedToSendMessage'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="hero-minimal-calm container mx-auto px-4 py-6 relative">
      {/* Animated floating Moroccan elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-[var(--color-secondary)]/5 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-[var(--color-accent)]/5 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>
      <div className="grid h-[calc(100vh-120px)] grid-cols-12 gap-4 relative">
        <Card className="col-span-12 lg:col-span-4 bg-white/10 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('survivor.messages.assignedSupportChats')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="relative">
              {/* Subtle animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-secondary)]/5 rounded-2xl opacity-50" />
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-300"
                placeholder={t('survivor.messages.searchPlaceholder')}
              />
            </div>
            <div className="max-h-[65vh] space-y-2 overflow-y-auto relative">
              {/* Conversation list background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-[var(--color-surface)] to-transparent opacity-30" />
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 rounded-full bg-[var(--color-primary)]/10 px-6 py-3 backdrop-blur-sm">
                      <div className="h-5 w-5 bg-[var(--color-primary)] rounded-full animate-spin" />
                      <span className="text-sm text-[var(--color-primary)] font-medium">{t('survivor.messages.loading')}</span>
                    </div>
                  </div>
                </div>
              )}
              {!isLoading && filteredConversations.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  {t('survivor.messages.noAssignedSupportChat')}
                </div>
              )}
              {filteredConversations.map((item) => (
                <button
                  key={item.reportId}
                  type="button"
                  onClick={() => setSelectedReportId(item.reportId)}
                  className={`w-full rounded-md border p-3 text-left ${
                    selectedReportId === item.reportId ? 'bg-muted' : ''
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-medium">{item.patientName}</div>
                  </div>
                  <div className="text-muted-foreground mb-1 text-xs">{item.caseType}</div>
                  <div className="text-sm text-slate-600">{item.lastMessage || t('survivor.messages.noMessagesYet')}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 flex flex-col lg:col-span-8">
          <CardHeader>
            <CardTitle>
              {selectedConversation
                ? t('survivor.messages.chatWith', { name: selectedConversation.patientName })
                : t('survivor.messages.selectConversation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
              {selectedConversation && messages.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  {t('survivor.messages.noMessagesYet')}. {t('survivor.messages.sendFirstMessage')}
                </div>
              )}
              {!selectedConversation && (
                <div className="text-muted-foreground text-sm">
                  {t('survivor.messages.pickConversation')}
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                const isSystem = msg.isSystemMessage || msg.senderRole === 'SYSTEM';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="my-4 flex justify-center">
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-background)] px-4 py-2 shadow-lg border border-[var(--color-border)] backdrop-blur-md hover:shadow-xl transition-all duration-300">
                        <div className="h-5 w-5 rounded-full bg-[var(--color-text-muted)]/80 flex items-center justify-center backdrop-blur-sm">
                          <svg className="h-3 w-3 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{msg.content}</span>
                          <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-md border border-[var(--color-border)] p-3 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                      isMine ? 'ml-auto bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20' : 'mr-auto bg-white/80 hover:bg-[var(--color-surface)]/50'
                    }`}
                  >
                    <div className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">{msg.senderName}</div>
                    <p className="text-sm text-[var(--color-text-primary)]">{msg.content}</p>
                    <div className="text-[var(--color-text-muted)] mt-1 text-xs">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="bg-white/50 backdrop-blur-sm border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-300 resize-none"
                placeholder={t('survivor.messages.typeYourMessage')}
                disabled={!selectedConversation || sending}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSend} 
                  disabled={!selectedConversation || sending}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? t('survivor.messages.sending') : t('survivor.messages.send')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
