import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { messagingService } from '@/services/messagingService';
import { useApp } from '@/components/AppContext';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import type { CaseMessage } from '@/services/caseMessagingService';
import { UserRole } from '@/types/user';

const MessageThread = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await messagingService.getCaseMessages(caseId!);
        // Backend returns 'sender' field with user details (mapped from 'user' in comments endpoint)
        const formattedMessages: CaseMessage[] = data.map((msg: any) => ({
          id: msg.id,
          reportId: msg.caseId || caseId!,
          content: msg.content,
          senderRole: msg.senderRole || msg.sender?.role || UserRole.SURVIVOR,
          isSystemMessage: msg.isSystemMessage || false,
          isPublic: msg.isPublic !== false,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt || msg.createdAt,
          author: msg.sender ? {
            id: msg.sender.id,
            firstName: msg.sender.firstName,
            lastName: msg.sender.lastName,
            role: msg.sender.role,
          } : null,
        }));
        setMessages(formattedMessages);
        // Mark all messages as read when viewing the conversation
        const messageIds = formattedMessages.map((m) => m.id);
        messagingService.markCaseAsRead(caseId!, messageIds);
      } catch (error: any) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
        // Mock data - showing conversation between client and legal advisor
        const currentUserId = user?.id || 'legal-advisor-1';
        setMessages([
          {
            id: '1',
            content: 'Hello, I need legal assistance with my case.',
            senderId: 'client-1',
            senderRole: 'SURVIVOR',
            isSystemMessage: false,
            isPublic: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            author: {
              id: 'client-1',
              firstName: 'John',
              lastName: 'Doe',
              role: 'SURVIVOR',
            },
          },
          {
            id: '2',
            content: 'I understand your situation. Let me review your case details and provide guidance.',
            senderId: currentUserId,
            senderRole: 'LEGAL_ADVISOR',
            isSystemMessage: false,
            isPublic: true,
            createdAt: new Date(Date.now() - 3000000).toISOString(),
            updatedAt: new Date(Date.now() - 3000000).toISOString(),
            author: {
              id: currentUserId,
              firstName: 'Legal',
              lastName: 'Advisor',
              role: 'LEGAL_ADVISOR',
            },
          },
          {
            id: '3',
            content: 'Thank you. What documents do you need from me?',
            senderId: 'client-1',
            senderRole: 'SURVIVOR',
            isSystemMessage: false,
            isPublic: true,
            createdAt: new Date(Date.now() - 2400000).toISOString(),
            updatedAt: new Date(Date.now() - 2400000).toISOString(),
            author: {
              id: 'client-1',
              firstName: 'John',
              lastName: 'Doe',
              role: 'SURVIVOR',
            },
          },
          {
            id: '4',
            content: 'Please bring your ID, any police reports, and medical records if available.',
            senderId: currentUserId,
            senderRole: 'LEGAL_ADVISOR',
            isSystemMessage: false,
            isPublic: true,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString(),
            author: {
              id: currentUserId,
              firstName: 'Legal',
              lastName: 'Advisor',
              role: 'LEGAL_ADVISOR',
            },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (caseId) {
      loadMessages();
    }
  }, [caseId, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      await messagingService.sendMessage(caseId!, newMessage);
      // Add message locally
      const currentUserId = user?.id || 'legal-advisor-1';
      const newMsg: CaseMessage = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: currentUserId,
        senderRole: 'LEGAL_ADVISOR',
        isSystemMessage: false,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: currentUserId,
          firstName: user?.firstName || 'Legal',
          lastName: user?.lastName || 'Advisor',
          role: 'LEGAL_ADVISOR',
        },
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    navigate('/legal/messages');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FDFDF5]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-4 h-96 w-96 rounded-full bg-gradient-to-br from-[#6B705C]/10 to-[#C15B3E]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-4 h-96 w-96 rounded-full bg-gradient-to-tr from-[#4A4D42]/10 to-[#DDA15E]/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-[#E8E7E0] px-6 py-4 flex items-center gap-4 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2 hover:bg-[#F5F4F0] rounded-lg transition-all duration-200 text-[#4A4D42]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-[#4A4D42]">
              Case {caseId?.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-[#6B705C]">Legal Consultation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#C15B3E] rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#6B705C] to-[#4A4D42] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {caseId?.slice(-4).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FDFDF5]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E8E7E0] border-t-[#C15B3E]"></div>
                <p className="text-sm text-[#6B705C] animate-pulse">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F5F4F0] to-[#E8E7E0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MessageSquare className="h-10 w-10 text-[#6B705C]/40" />
              </div>
              <h3 className="text-lg font-semibold text-[#4A4D42] mb-2">No Messages Yet</h3>
              <p className="text-sm text-[#6B705C]">Start the conversation with your client</p>
            </div>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#E8E7E0]">
                  <div className="w-2 h-2 bg-[#DAD8CE] rounded-full"></div>
                  <span className="text-xs font-medium text-[#6B705C]">Today</span>
                  <div className="w-2 h-2 bg-[#DAD8CE] rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.author?.id === user?.id}
                    currentUserRole={UserRole.LEGAL_ADVISOR}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-[#E8E7E0] p-4 shadow-lg">
          <div className="px-6">
            <div className="flex items-end gap-3 bg-[#F5F4F0] rounded-2xl p-3 border border-[#E8E7E0] focus-within:border-[#C15B3E]/50 focus-within:shadow-md transition-all duration-200">
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 rounded-xl text-[#6B705C] hover:text-[#4A4D42]"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none text-[#3D4035]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="p-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#6B705C] to-[#C15B3E] text-white border-0"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <p className="text-xs text-[#6B705C]">Press Enter to send, Shift+Enter for new line</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#C15B3E] rounded-full animate-pulse"></div>
                <span className="text-xs text-[#6B705C]">Secure messaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
