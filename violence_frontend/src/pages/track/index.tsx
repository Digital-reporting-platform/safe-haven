import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Shield, ArrowLeft, AlertCircle, Loader2, Clock, User, Calendar, Hash, CheckCircle2, MessageCircle, ArrowRight, Sparkles, ShieldCheck, FileText, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageThread } from '@/components/messaging/MessageThread';
import { toast } from 'sonner';
import {
  getMessagesByTrackingNumber,
  sendAnonymousMessage,
  type CaseMessage,
  type AnonymousThreadResponse,
} from '@/services/caseMessagingService';

export default function AnonymousTrackingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTrackingNumber = searchParams.get('ref') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<AnonymousThreadResponse | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);

  // Auto-load case when ref parameter is present in URL
  useEffect(() => {
    if (initialTrackingNumber && !isLoading && !threadData) {
      performSearch(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  const performSearch = async (searchValue: string) => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setError('Please enter a tracking number');
      return;
    }

    // Basic format check (e.g., REF-XXX or similar alphanumeric)
    const trackingRegex = /^[A-Z0-9-]+$/i;
    if (!trackingRegex.test(trimmed)) {
      setError('Invalid tracking number format. Use letters, numbers, and dashes.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMessagesByTrackingNumber(searchValue.trim().toUpperCase());
      setThreadData(data);
      setMessages(data.messages);
    } catch (err: any) {
      const message = err?.message || 'Failed to find case. Please check your tracking number.';
      setError(message);
      setThreadData(null);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await performSearch(trackingNumber);
    // Update URL with tracking number
    if (trackingNumber.trim()) {
      setSearchParams({ ref: trackingNumber.trim().toUpperCase() });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!threadData) return;

    try {
      const newMessage = await sendAnonymousMessage(threadData.report.trackingNumber, content);
      setMessages((prev: CaseMessage[]) => [...prev, newMessage]);
      toast.success('Message sent successfully');
    } catch (err: any) {
      const message = err?.message || 'Failed to send message';
      toast.error(message);
      throw err;
    }
  };

  // Status configurations with project's earthy color theme
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return { 
          gradient: 'from-[#6B705C] to-[#8B906C]',
          bg: 'bg-[#6B705C]/10',
          text: 'text-[#6B705C]',
          border: 'border-[#6B705C]/30',
          glow: 'shadow-[#6B705C]/20'
        };
      case 'ASSIGNED':
      case 'IN_SUPPORT':
        return { 
          gradient: 'from-[#DDA15E] to-[#C6924D]',
          bg: 'bg-[#DDA15E]/10',
          text: 'text-[#AD7D4A]',
          border: 'border-[#DDA15E]/30',
          glow: 'shadow-[#DDA15E]/20'
        };
      case 'PENDING_REVIEW':
      case 'RECEIVED':
        return { 
          gradient: 'from-[#C15B3E] to-[#A54B34]',
          bg: 'bg-[#C15B3E]/10',
          text: 'text-[#C15B3E]',
          border: 'border-[#C15B3E]/30',
          glow: 'shadow-[#C15B3E]/20'
        };
      default:
        return { 
          gradient: 'from-[#6B705C] to-[#4A4D42]',
          bg: 'bg-[#F5F4F0]',
          text: 'text-[#4A4D42]',
          border: 'border-[#E8E7E0]',
          glow: 'shadow-[#6B705C]/10'
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle2 className="h-5 w-5 text-[#6B705C]" />;
      case 'ASSIGNED':
      case 'IN_SUPPORT':
        return <User className="h-5 w-5 text-[#AD7D4A]" />;
      case 'PENDING_REVIEW':
      case 'RECEIVED':
        return <Clock className="h-5 w-5 text-[#C15B3E]" />;
      default:
        return <Shield className="h-5 w-5 text-[#6B705C]" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Progress steps data
  const progressSteps = [
    { key: 'RECEIVED', label: 'Received', icon: FileText },
    { key: 'PENDING_REVIEW', label: 'Review', icon: Search },
    { key: 'ASSIGNED', label: 'Assigned', icon: User },
    { key: 'IN_SUPPORT', label: 'Support', icon: Users },
    { key: 'RESOLVED', label: 'Resolved', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDF5]">
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden">
        {/* Background decorations - earthy tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B705C]/5 via-[#DDA15E]/5 to-[#C15B3E]/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6B705C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#DDA15E]/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-24">
          {/* Animated Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8E7E0] shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-[#6B705C]" />
              <span className="text-sm font-medium text-[#4A4D42]">Secure & Anonymous</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A4D42] mb-6">
              Track Your Case
            </h1>
            <p className="text-lg text-[#6B705C] max-w-2xl mx-auto leading-relaxed">
              Enter your tracking number to view real-time case status and communicate securely with your support team
            </p>
          </div>

          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6B705C] to-[#C15B3E] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-white rounded-xl shadow-2xl shadow-[#6B705C]/10 overflow-hidden border border-[#E8E7E0]">
                <div className="pl-6 pr-4">
                  <Search className="h-6 w-6 text-[#6B705C]/60" />
                </div>
                <Input
                  placeholder="Enter tracking number (e.g., REF-ABC123)"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`flex-1 border-0 text-lg uppercase tracking-wider text-[#4A4D42] placeholder:text-[#6B705C]/40 focus-visible:ring-0 focus-visible:ring-offset-0 py-6 ${
                    error ? 'text-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !trackingNumber.trim()}
                  className="m-2 bg-[#C15B3E] hover:bg-[#A54B34] text-white px-8 py-6 text-base font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#C15B3E]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Track
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C15B3E]/10 border border-[#C15B3E]/20 text-[#C15B3E] animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {threadData && (
        <div className="relative -mt-8 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Case Status Header - Floating Card */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6B705C]/20 via-[#DDA15E]/20 to-[#C15B3E]/20 rounded-3xl blur opacity-50" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-[#6B705C]/5 border border-[#E8E7E0] overflow-hidden">
                {/* Top Status Bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${getStatusConfig(threadData.report.status).gradient}`} />
                
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left: Case Info */}
                    <div className="flex items-start gap-5">
                      <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getStatusConfig(threadData.report.status).gradient} flex items-center justify-center shadow-lg ${getStatusConfig(threadData.report.status).glow}`}>
                        <Hash className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-medium text-[#6B705C] uppercase tracking-wide">Tracking Number</span>
                          <Badge className={`${getStatusConfig(threadData.report.status).bg} ${getStatusConfig(threadData.report.status).text} ${getStatusConfig(threadData.report.status).border} border px-3 py-1 text-xs font-semibold flex items-center gap-1.5`}>
                            {getStatusIcon(threadData.report.status)}
                            {formatStatus(threadData.report.status)}
                          </Badge>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-mono font-bold text-[#4A4D42] tracking-tight">
                          {threadData.report.trackingNumber}
                        </h2>
                        <h3 className="text-lg text-[#6B705C] mt-2 font-medium">{threadData.report.title}</h3>
                      </div>
                    </div>

                    {/* Right: Date */}
                    <div className="flex items-center gap-3 text-[#6B705C] bg-[#F5F4F0] rounded-xl px-4 py-3">
                      <Calendar className="h-5 w-5 text-[#6B705C]/60" />
                      <span className="text-sm">
                        Submitted {new Date(threadData.report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline - Modern Horizontal */}
            <div className="mb-10">
              <div className="relative">
                {/* Connecting Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E8E7E0] rounded-full -translate-y-1/2" />
                {/* Active Progress Line */}
                <div 
                  className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r ${getStatusConfig(threadData.report.status).gradient} rounded-full -translate-y-1/2 transition-all duration-1000`}
                  style={{ 
                    width: `${Math.max(0, progressSteps.findIndex(s => s.key === threadData.report.status || (s.key === 'IN_SUPPORT' && threadData.report.status === 'IN_SUPPORT')) / (progressSteps.length - 1) * 100)}%` 
                  }}
                />
                
                {/* Steps */}
                <div className="relative flex justify-between">
                  {progressSteps.map((step, index) => {
                    const currentIndex = progressSteps.findIndex(s => 
                      s.key === threadData.report.status || 
                      (s.key === 'IN_SUPPORT' && threadData.report.status === 'IN_SUPPORT')
                    );
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCompleted
                              ? `bg-gradient-to-br ${getStatusConfig(threadData.report.status).gradient} text-white shadow-lg ${getStatusConfig(threadData.report.status).glow} scale-110`
                              : isActive
                                ? `bg-white border-2 border-[#6B705C] text-[#6B705C] shadow-lg shadow-[#6B705C]/20 scale-110`
                                : 'bg-white border-2 border-[#E8E7E0] text-[#6B705C]/40'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        <span className={`mt-3 text-sm font-medium ${
                          isActive ? 'text-[#4A4D42]' : isCompleted ? 'text-[#6B705C]' : 'text-[#6B705C]/40'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Two Column Layout: Team & Messages */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Support Team */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Assigned Team Card */}
                  {threadData.assignedProfessionals.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#6B705C]/5 border border-[#E8E7E0] p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B705C] to-[#8B906C] flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#4A4D42]">Support Team</h3>
                          <p className="text-sm text-[#6B705C]">Assigned to your case</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {threadData.assignedProfessionals.map((professional) => (
                          <div 
                            key={professional.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F4F0]/80 hover:bg-[#F5F4F0] transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B705C] to-[#8B906C] flex items-center justify-center text-white font-semibold text-sm">
                              {professional.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#4A4D42] truncate">{professional.name}</p>
                              <p className="text-xs text-[#6B705C] capitalize">
                                {professional.type.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Info Card */}
                  <div className="bg-gradient-to-br from-[#6B705C] to-[#4A4D42] rounded-2xl shadow-lg shadow-[#6B705C]/20 p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Lock className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Secure Communication</h3>
                    </div>
                    <p className="text-sm text-[#F7F3E6] leading-relaxed">
                      All messages are end-to-end encrypted and only visible to you and your assigned support team.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-[#DDA15E]">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Bank-grade encryption</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Messages */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#6B705C]/5 border border-[#E8E7E0] overflow-hidden">
                  {/* Messages Header */}
                  <div className="flex items-center justify-between p-6 border-b border-[#E8E7E0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B705C] to-[#8B906C] flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4A4D42]">Secure Messages</h3>
                        <p className="text-sm text-[#6B705C]">
                          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="p-6">
                    <MessageThread
                      caseId={threadData.report.id}
                      caseTitle=""
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isLoading={false}
                      error={null}
                      emptyStateText="No messages yet. Your support team will respond shortly."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-12 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-[#6B705C] hover:text-[#4A4D42] hover:bg-[#F5F4F0] px-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
