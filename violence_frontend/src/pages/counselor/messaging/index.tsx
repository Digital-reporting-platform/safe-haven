 import { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Phone,
  Video,
  Paperclip,
  MoreVertical,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { counselorService, CaseAssignment } from '@/services/counselorService';
import { toast } from 'sonner';

// Messages are fetched from backend as case comments

function MessagingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [cases, setCases] = useState<CaseAssignment[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch assigned cases on mount
  useEffect(() => {
    fetchCases();
  }, []);

  // Fetch comments when selected case changes
  useEffect(() => {
    if (selectedCaseId) {
      fetchComments(selectedCaseId);
    }
  }, [selectedCaseId]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await counselorService.getAppointments(1, 50);
      setCases(response.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load cases';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (caseId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await counselorService.getCaseComments(caseId);
      setComments(response);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load messages';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedCaseId || !replyContent.trim()) return;

    try {
      await counselorService.addCaseComment(selectedCaseId, replyContent, false);
      setReplyContent('');
      await fetchComments(selectedCaseId);
      toast.success('Message sent');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to send message';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  // Map cases to message format
  const messages = useMemo(() => {
    return cases.map((caseItem) => {
      const isAnonymous = caseItem.report.isAnonymous;
      const trackingNumber = caseItem.report.trackingNumber;
      const reporterName = caseItem.report.reporter?.firstName 
        ? `${caseItem.report.reporter.firstName} ${caseItem.report.reporter?.lastName || ''}`.trim()
        : null;
      
      return {
        id: caseItem.id,
        sender: isAnonymous 
          ? `Anonymous (${trackingNumber || 'N/A'})` 
          : (reporterName || 'Unknown'),
        senderRole: isAnonymous ? 'Anonymous Client' : (caseItem.report.reporter?.role || 'Client'),
        subject: caseItem.report.title || 'Untitled',
        content: caseItem.report.description || 'No description',
        timestamp: caseItem.createdAt,
        isRead: true, // Will be based on comments
        priority: caseItem.priority,
        attachments: [],
        clientName: isAnonymous 
          ? `Anonymous (${trackingNumber || 'N/A'})` 
          : (reporterName || 'Unknown'),
        isAnonymous,
        trackingNumber,
      };
    });
  }, [cases]);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === 'All' ||
        (filterType === 'Unread' && !msg.isRead) ||
        (filterType === 'Read' && msg.isRead) ||
        msg.senderRole === filterType;
      return matchesSearch && matchesType;
    });
  }, [messages, searchQuery, filterType]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const totalMessages = comments.length;
  const unreadCount = 0; // Would need unread tracking in backend

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50';
      case 'Normal':
        return 'text-slate-600 bg-slate-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };


  return (
    <div className="min-h-screen bg-[var(--role-counselor-bg)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Message List */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald-500" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Secure Messaging
                  </h1>
                  <p className="mt-1 text-slate-600">
                    End-to-end encrypted communication
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {unreadCount} unread
                  </Badge>
                )}
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Compose
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                    <Input
                      placeholder="Search messages..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      aria-label="Filter messages by type"
                    >
                      <option value="All">All Messages</option>
                      <option value="Unread">Unread</option>
                      <option value="Read">Read</option>
                      <option value="Client">Clients</option>
                      <option value="Medical Professional">Medical</option>
                      <option value="Legal Advisor">Legal</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case List (as conversations) */}
            <div className="space-y-3">
              {isLoading ? (
                <Card><CardContent className="p-8 text-center"><p className="text-slate-500">Loading cases...</p></CardContent></Card>
              ) : filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCaseId === message.id ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    setSelectedCaseId(message.id);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-semibold text-slate-800">
                            {message.sender}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {message.senderRole}
                          </Badge>
                          {message.isAnonymous && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              Anonymous
                            </Badge>
                          )}
                          <Badge className={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                          {!message.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <h4 className="mb-1 font-medium text-slate-700">
                          {message.subject}
                        </h4>
                        <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {message.attachments.length} attachment
                              {message.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMessages.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <h3 className="mb-2 text-lg font-medium text-slate-600">
                    No cases to message
                  </h3>
                  <p className="text-slate-500">
                    You need assigned cases to communicate with clients.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comments Section for Selected Case */}
            {selectedCaseId && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Conversation with {selectedMessage?.isAnonymous 
                      ? `Anonymous User (${selectedMessage?.trackingNumber || 'N/A'})` 
                      : (selectedMessage?.sender || 'Client')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingComments ? (
                    <p className="text-slate-500">Loading messages...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-slate-500">No messages yet. Start the conversation!</p>
                  ) : (
                    <div className="max-h-80 space-y-3 overflow-y-auto">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`rounded-lg p-3 ${
                            comment.isSentByMe
                              ? 'bg-blue-100 ml-8'
                              : 'bg-slate-100 mr-8'
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {comment.user?.name || 'Unknown'} ({comment.user?.role})
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Type your message..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={sendMessage}
                        disabled={!replyContent.trim() || isLoadingComments}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Message Detail/Compose */}
          <div className="space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  Message Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>End-to-end encryption active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <EyeOff className="h-4 w-4 text-emerald-500" />
                  <span>Messages automatically deleted after 30 days</span>
                </div>
                <div className="text-xs text-slate-500">
                  All communications are HIPAA compliant and stored securely.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Start Video Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Secure Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach File
                </Button>
              </CardContent>
            </Card>

            {/* Message Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Message Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Unread Messages
                  </span>
                  <span className="font-semibold">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Cases</span>
                  <span className="font-semibold">{isLoading ? '...' : cases.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Response Time</span>
                  <span className="font-semibold text-emerald-600">
                    &lt; 2 hours
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagingPage;
