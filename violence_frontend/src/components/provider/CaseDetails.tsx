import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadFile } from '@/services/uploadService';
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

interface CaseData {
  case: {
    id: string;
    trackingNumber: string;
    category: string;
    severity: string;
    description: string;
    priority: string;
    status: string;
    assignedAt: string;
    caseType: string;
    notes?: string;
  };
  survivor: {
    isAnonymous: boolean;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    trackingNumber?: string;
  };
  evidence: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    fileUrl: string;
    description?: string;
    uploadedAt: string;
  }>;
  mlSuggestions: {
    classificationLabel?: string;
    classificationScore?: number;
    suggestedCaseType?: string;
    suggestedPriority?: string;
  };
  riskScore?: number;
}

interface CaseDetailsProps {
  role: 'MEDICAL_PROFESSIONAL' | 'LEGAL_ADVISOR';
  fetchCaseDetails: (caseId: string) => Promise<CaseData>;
  updateStatus: (caseId: string, status: string) => Promise<void>;
  addNotes: (caseId: string, notes: any) => Promise<void>;
  requestMeeting: (caseId: string, data: any) => Promise<void>;
  fetchComments: (caseId: string) => Promise<any[]>;
  addComment: (caseId: string, content: string) => Promise<void>;
}

export default function CaseDetails({
  role,
  fetchCaseDetails,
  updateStatus,
  addNotes,
  requestMeeting,
  fetchComments,
  addComment,
}: CaseDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showMeetingRequest, setShowMeetingRequest] = useState(false);
  const [meetingData, setMeetingData] = useState({
    proposedDateTime: '',
    message: '',
    requestedToId: '',
  });

  useEffect(() => {
    if (id) {
      loadCaseDetails();
      loadComments();
    }
  }, [id]);

  const loadCaseDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchCaseDetails(id);
      console.log('[CaseDetails] Received data:', data);
      console.log('[CaseDetails] Survivor:', data.survivor);
      setCaseData(data);
    } catch (error) {
      console.error('Failed to load case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(id!);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus(id!, newStatus);
      loadCaseDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddNotes = async (notes: any) => {
    try {
      await addNotes(id!, notes);
      loadCaseDetails();
    } catch (error) {
      console.error('Failed to add notes:', error);
    }
  };

  const handleMeetingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestMeeting(id!, meetingData);
      setShowMeetingRequest(false);
      setMeetingData({ proposedDateTime: '', message: '', requestedToId: '' });
    } catch (error) {
      console.error('Failed to request meeting:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && selectedFiles.length === 0) return;

    try {
      setUploading(true);
      let messageContent = newComment;

      // Upload files if selected
      if (selectedFiles.length > 0) {
        const uploadedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            const result = await uploadFile(file, 'case-uploads', `cases/${id}/${Date.now()}-${file.name}`);
            return { name: file.name, url: result.url, type: file.type };
          })
        );

        // Append file info to message
        const fileLinks = uploadedFiles.map(f => `[${f.name}](${f.url})`).join('\n');
        messageContent = messageContent
          ? `${messageContent}\n\n**Attachments:**\n${fileLinks}`
          : `**Attachments:**\n${fileLinks}`;
      }

      await addComment(id!, messageContent);
      setNewComment('');
      setSelectedFiles([]);
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return {
          bg: 'bg-[rgba(193, 91, 62, 0.1)]',
          text: 'text-[#C15B3E]',
          border: 'border-[#C15B3E]',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-[rgba(221, 161, 94, 0.1)]',
          text: 'text-[#DDA15E]',
          border: 'border-[#DDA15E]',
        };
      case 'LOW':
        return {
          bg: 'bg-[rgba(107, 112, 92, 0.1)]',
          text: 'text-[#6B705C]',
          border: 'border-[#6B705C]',
        };
      default:
        return {
          bg: 'bg-[rgba(107, 112, 92, 0.05)]',
          text: 'text-[#6B705C]',
          border: 'border-[#6B705C]',
        };
    }
  };

  const isMedical = role === 'MEDICAL_PROFESSIONAL';

  if (loading || !caseData) {
    return (
      <div className="min-h-screen bg-[#FDFDF5] p-6 md:p-8">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B705C] border-t-transparent"></div>
          <p className="mt-4 text-[#6B705C]">Loading case details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDF5] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('..')}
            className="text-[#C15B3E] hover:text-[#A54B34] mb-4 inline-block font-medium transition-colors"
          >
            ← Back to Cases
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#4A4D42] mb-2">
            Case {caseData.case.trackingNumber}
          </h1>
          <p className="text-[#3D4035] text-lg">{caseData.case.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Info */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Category</label>
                  <p className="font-medium text-[#3D4035]">{caseData.case.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Severity</label>
                  <p className="font-medium text-[#3D4035]">{caseData.case.severity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Priority</label>
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getPriorityStyle(
                      caseData.case.priority
                    ).bg} ${getPriorityStyle(caseData.case.priority).text} ${getPriorityStyle(caseData.case.priority).border}`}
                  >
                    {caseData.case.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Status</label>
                  <p className="font-medium text-[#3D4035]">{caseData.case.status.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Assigned Date</label>
                  <p className="font-medium text-[#3D4035]">{new Date(caseData.case.assignedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B705C] mb-1 block">Risk Score</label>
                  <p className="font-medium text-[#3D4035]">{caseData.riskScore?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>

              {/* ML Suggestions */}
              {caseData.mlSuggestions && (
                <div className="mt-6 p-4 bg-[rgba(221, 161, 94, 0.1)] border border-[#DDA15E] rounded-xl">
                  <h3 className="font-semibold text-sm text-[#4A4D42] mb-3">ML Suggestions</h3>
                  <div className="text-sm text-[#3D4035] space-y-2">
                    {caseData.mlSuggestions.classificationLabel && (
                      <p><span className="font-medium">Classification:</span> {caseData.mlSuggestions.classificationLabel}</p>
                    )}
                    {caseData.mlSuggestions.suggestedCaseType && (
                      <p><span className="font-medium">Case Type:</span> {caseData.mlSuggestions.suggestedCaseType}</p>
                    )}
                    {caseData.mlSuggestions.suggestedPriority && (
                      <p><span className="font-medium">Priority:</span> {caseData.mlSuggestions.suggestedPriority}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Survivor Info */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Survivor Information</h2>
              {caseData.survivor.isAnonymous ? (
                <div className="text-[#6B705C]">
                  <p className="font-medium text-[#3D4035]">This case is anonymous</p>
                  <p className="text-sm mt-1">Tracking Number: {caseData.survivor.trackingNumber}</p>
                </div>
              ) : !caseData.survivor.firstName && !caseData.survivor.lastName ? (
                <div className="text-[#6B705C]">
                  <p className="font-medium text-[#3D4035]">Reporter information unavailable</p>
                  <p className="text-sm mt-1">Tracking Number: {caseData.survivor.trackingNumber || caseData.case.trackingNumber}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-[#6B705C] mb-1 block">Name</label>
                    <p className="font-medium text-[#3D4035]">
                      {caseData.survivor.firstName} {caseData.survivor.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B705C] mb-1 block">Email</label>
                    <p className="font-medium text-[#3D4035]">{caseData.survivor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B705C] mb-1 block">Phone</label>
                    <p className="font-medium text-[#3D4035]">{caseData.survivor.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Evidence</h2>
              {caseData.evidence.length === 0 ? (
                <p className="text-[#6B705C]">No evidence uploaded</p>
              ) : (
                <div className="space-y-3">
                  {caseData.evidence.map((evidence) => (
                    <div key={evidence.id} className="flex items-center justify-between p-4 bg-[#F7F3E6] rounded-xl border border-[#E8E7E0]">
                      <div>
                        <p className="font-medium text-[#3D4035]">{evidence.fileName}</p>
                        <p className="text-sm text-[#6B705C]">{evidence.fileType}</p>
                      </div>
                      <a
                        href={evidence.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C15B3E] hover:text-[#A54B34] font-medium transition-colors"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messaging */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Messages</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-[#6B705C]">No messages yet</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex ${
                        comment.senderRole === role ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-xl max-w-[80%] ${
                          comment.senderRole === role
                            ? 'bg-[rgba(107, 112, 92, 0.1)] border border-[#6B705C]'
                            : 'bg-[#F7F3E6] border border-[#E8E7E0]'
                        }`}
                      >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-[#4A4D42]">
                          {comment.isSystemMessage
                            ? 'System'
                            : (comment.author?.name || 'Anonymous')}
                        </span>
                        <span className="text-xs text-[#6B705C]">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#3D4035]">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} className="space-y-3">
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F3E6] rounded-lg border border-[#E8E7E0]"
                      >
                        {getFileIcon(file.type)}
                        <span className="text-sm text-[#3D4035] truncate max-w-[150px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-0.5 hover:bg-[#E8E7E0] rounded transition-colors"
                          aria-label={`Remove file ${file.name}`}
                        >
                          <X className="h-3.5 w-3.5 text-[#6B705C]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  {/* File Input */}
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Attach files to message"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center px-4 py-3 bg-[#F7F3E6] text-[#6B705C] rounded-xl hover:bg-[#E8E7E0] cursor-pointer transition-colors"
                    title="Attach files"
                  >
                    <Paperclip className="h-5 w-5" />
                  </label>

                  {/* Message Input */}
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Type a message..."}
                    className="flex-1 px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={uploading || (!newComment.trim() && selectedFiles.length === 0)}
                    className="px-6 py-3 bg-[#C15B3E] text-white rounded-xl hover:bg-[#A54B34] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Role Specific Actions */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Update Status</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  className="w-full px-4 py-3 bg-[#DDA15E] text-white rounded-xl hover:bg-[#C58F54] font-medium transition-colors"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate('RESOLVED')}
                  className="w-full px-4 py-3 bg-[#6B705C] text-white rounded-xl hover:bg-[#5D624F] font-medium transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Role-Specific Notes */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">
                {isMedical ? 'Medical Notes' : 'Legal Notes'}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const notes: any = {};
                  if (isMedical) {
                    notes.diagnosis = formData.get('diagnosis');
                    notes.treatment = formData.get('treatment');
                    notes.recommendations = formData.get('recommendations');
                    notes.generalNotes = formData.get('generalNotes');
                  } else {
                    notes.legalAdvice = formData.get('legalAdvice');
                    notes.suggestedSteps = formData.get('suggestedSteps');
                    notes.actionTaken = formData.get('actionTaken');
                    notes.generalNotes = formData.get('generalNotes');
                  }
                  handleAddNotes(notes);
                }}
                className="space-y-4"
              >
                {isMedical ? (
                  <>
                    <textarea
                      name="diagnosis"
                      placeholder="Diagnosis"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                    <textarea
                      name="treatment"
                      placeholder="Treatment Plan"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                    <textarea
                      name="recommendations"
                      placeholder="Recommendations"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                  </>
                ) : (
                  <>
                    <textarea
                      name="legalAdvice"
                      placeholder="Legal Advice"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                    <textarea
                      name="suggestedSteps"
                      placeholder="Suggested Legal Steps"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                    <textarea
                      name="actionTaken"
                      placeholder="Action Taken"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                  </>
                )}
                <textarea
                  name="generalNotes"
                  placeholder="General Notes"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-[#C15B3E] text-white rounded-xl hover:bg-[#A54B34] font-medium transition-colors"
                >
                  Save Notes
                </button>
              </form>
            </div>

            {/* Meeting Request */}
            <div className="bg-white rounded-2xl border border-[#E8E7E0] shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#4A4D42] mb-6">Request Meeting</h2>
              {!showMeetingRequest ? (
                <button
                  onClick={() => setShowMeetingRequest(true)}
                  className="w-full px-4 py-3 bg-[#6B705C] text-white rounded-xl hover:bg-[#5D624F] font-medium transition-colors"
                >
                  Request Meeting
                </button>
              ) : (
                <form onSubmit={handleMeetingRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D42] mb-2">
                      Proposed Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={meetingData.proposedDateTime}
                      onChange={(e) =>
                        setMeetingData({ ...meetingData, proposedDateTime: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D42] mb-2">
                      Message
                    </label>
                    <textarea
                      placeholder="Message"
                      value={meetingData.message}
                      onChange={(e) => setMeetingData({ ...meetingData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D42] mb-2">
                      Request To (User ID)
                    </label>
                    <input
                      type="text"
                      placeholder="Request To (User ID)"
                      value={meetingData.requestedToId}
                      onChange={(e) =>
                        setMeetingData({ ...meetingData, requestedToId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-[#E8E7E0] rounded-xl focus:ring-2 focus:ring-[#6B705C] focus:border-transparent text-[#3D4035] transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-[#C15B3E] text-white rounded-xl hover:bg-[#A54B34] font-medium transition-colors"
                    >
                      Send Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMeetingRequest(false)}
                      className="px-4 py-3 bg-[#E8E7E0] text-[#3D4035] rounded-xl hover:bg-[#DAD8CE] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
