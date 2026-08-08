import { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, HeadphonesIcon, Users, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  caseId: string;
  caseTitle: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Fetch messages from API
    const mockMessages: Message[] = [
      {
        id: '1',
        caseId: 'case-1',
        caseTitle: 'Domestic Violence Case #1234',
        sender: 'Dr. Sarah Johnson',
        senderRole: 'Medical Professional',
        content: 'Patient examination completed. Report attached.',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        caseId: 'case-2',
        caseTitle: 'Legal Assistance Case #5678',
        sender: 'Attorney Michael Brown',
        senderRole: 'Legal Advisor',
        content: 'Court date scheduled for next week.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
    ];
    setMessages(mockMessages);
  }, []);

  const groupedMessages = messages.reduce(
    (acc, msg) => {
      if (!acc[msg.caseId]) {
        acc[msg.caseId] = {
          caseTitle: msg.caseTitle,
          messages: [],
        };
      }
      acc[msg.caseId].messages.push(msg);
      return acc;
    },
    {} as Record<string, { caseTitle: string; messages: Message[] }>
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Send message via API
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--role-counselor-bg)]">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--role-counselor-primary)]/20 to-[var(--role-counselor-accent)]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[var(--role-counselor-text)]/20 to-[var(--role-counselor-secondary)]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] p-3 shadow-lg">
              <HeadphonesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-[var(--role-counselor-text)] to-[var(--role-counselor-primary)] bg-clip-text text-4xl font-bold text-transparent">
                Messages
              </h1>
              <p className="font-medium text-[var(--role-counselor-text)]">
                Case-based communication with professionals
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-primary)]/20 p-2">
                    <MessageSquare className="h-5 w-5 text-[var(--role-counselor-primary)]" />
                  </div>
                  Conversations
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--role-counselor-text)]/40" />
                  <Input
                    placeholder="Search conversations..."
                    className="border-[var(--role-counselor-secondary)]/30 bg-white/50 pl-10 text-[var(--role-counselor-text)] placeholder-[var(--role-counselor-text)]/40 focus:border-[var(--role-counselor-primary)] focus:ring-[var(--role-counselor-primary)]/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {Object.entries(groupedMessages).map(([caseId, data], idx) => (
                  <motion.button
                    key={caseId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedConversation(caseId)}
                    className={`w-full rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedConversation === caseId
                        ? 'border-[var(--role-counselor-primary)] bg-gradient-to-r from-[var(--role-counselor-primary)]/10 to-[var(--role-counselor-accent)]/10'
                        : 'border-[var(--role-counselor-secondary)]/30 bg-white/50 hover:bg-[var(--role-counselor-secondary)]/20'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-[var(--role-counselor-text)]">{data.caseTitle}</h4>
                      {data.messages.some((m) => !m.isRead) && (
                        <Badge className="bg-gradient-to-r from-[var(--role-counselor-accent)] to-[var(--role-counselor-accent)]/80 text-white border-0">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--role-counselor-text)]/60">
                      <Users className="h-3 w-3" />
                      {data.messages.length} message{data.messages.length !== 1 ? 's' : ''}
                    </div>
                  </motion.button>
                ))}
                {Object.keys(groupedMessages).length === 0 && (
                  <div className="py-8 text-center text-[var(--role-counselor-text)]/60">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 text-[var(--role-counselor-text)]/40" />
                    No conversations yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Message Thread */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-[var(--role-counselor-text)]">
                  <div className="rounded-lg bg-[var(--role-counselor-accent)]/20 p-2">
                    <MessageSquare className="h-5 w-5 text-[var(--role-counselor-accent)]" />
                  </div>
                  {selectedConversation
                    ? groupedMessages[selectedConversation]?.caseTitle
                    : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedConversation ? (
                  <div className="space-y-6">
                    {/* Messages */}
                    <div className="max-h-96 space-y-4 overflow-y-auto">
                      {groupedMessages[selectedConversation]?.messages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`rounded-xl border p-4 ${
                            !msg.isRead 
                              ? 'border-[var(--role-counselor-accent)]/30 bg-gradient-to-r from-[var(--role-counselor-accent)]/10 to-transparent' 
                              : 'border-[var(--role-counselor-secondary)]/30 bg-[var(--role-counselor-secondary)]/10'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-[var(--role-counselor-primary)]/20 p-1">
                                <Users className="h-3 w-3 text-[var(--role-counselor-primary)]" />
                              </div>
                              <span className="font-semibold text-[var(--role-counselor-text)]">{msg.sender}</span>
                              <span className="text-xs text-[var(--role-counselor-text)]/60 bg-[var(--role-counselor-secondary)]/20 px-2 py-1 rounded">
                                {msg.senderRole}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[var(--role-counselor-text)]/60">
                              <Clock className="h-3 w-3" />
                              {new Date(msg.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-[var(--role-counselor-text)]/80">{msg.content}</p>
                          {!msg.isRead && (
                            <div className="mt-2">
                              <Badge className="bg-[var(--role-counselor-accent)]/10 text-[var(--role-counselor-accent)] border-[var(--role-counselor-accent)]/20 text-xs">
                                Unread
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4 border-t border-[var(--role-counselor-secondary)]/20 pt-6"
                    >
                      <Textarea
                        placeholder="Type your message... (Internal notes not visible to survivor)"
                        className="border-[var(--role-counselor-secondary)]/30 bg-white/50 text-[var(--role-counselor-text)] placeholder-[var(--role-counselor-text)]/40 focus:border-[var(--role-counselor-primary)] focus:ring-[var(--role-counselor-primary)]/20 resize-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="w-full bg-gradient-to-r from-[var(--role-counselor-primary)] to-[var(--role-counselor-accent)] border-0 hover:shadow-lg transition-all duration-300"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center text-[var(--role-counselor-text)]/60">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-4 h-12 w-12 text-[var(--role-counselor-text)]/40" />
                      <p>Select a conversation to view messages</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
