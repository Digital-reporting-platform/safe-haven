import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { messagingService, Conversation } from '@/services/messagingService';
import { useApp } from '@/components/AppContext';

const Messaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useApp();
  const navigate = useNavigate();

  const handleConversationClick = (conversation: Conversation) => {
    navigate(`/legal/messages/${conversation.caseId}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await messagingService.getProfessionalConversations(user?.id);
        setConversations(data);
      } catch (error: any) {
        console.error('Failed to load legal messaging', error);
        toast.error(error?.message || 'Failed to load messaging');
        setConversations([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Legal Messaging</h1>
        <p className="text-gray-600">Manage your client communications and case discussions.</p>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading conversations...</span>
          </div>
        )}
        
        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600">You don't have any active conversations with clients.</p>
          </div>
        )}
        
        {!isLoading && conversations.length > 0 && (
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <div 
                key={conversation.caseId} 
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {conversation.caseId?.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Case {conversation.caseId}</h3>
                      <p className="text-sm text-gray-600">{conversation.reportId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-800 text-sm mb-2">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage?.createdAt && 
                        new Date(conversation.lastMessage.createdAt).toLocaleString()
                      }
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {conversation.unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
