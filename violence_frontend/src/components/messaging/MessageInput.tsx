import { useState } from 'react';
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { uploadFile } from '@/services/uploadService';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  allowAttachments?: boolean;
  caseId?: string;
}

export function MessageInput({
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  maxLength = 5000,
  allowAttachments = true,
  caseId,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSend = async () => {
    if ((!content.trim() && selectedFiles.length === 0) || isSending) return;

    setIsSending(true);
    try {
      let messageContent = content.trim();

      // Upload files if selected
      if (selectedFiles.length > 0 && caseId) {
        const uploadedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            const result = await uploadFile(file, 'case-uploads', `cases/${caseId}/${Date.now()}-${file.name}`);
            return { name: file.name, url: result.url, type: file.type };
          })
        );

        // Append file info to message
        const fileLinks = uploadedFiles.map(f => `[${f.name}](${f.url})`).join('\n');
        messageContent = messageContent
          ? `${messageContent}\n\n**Attachments:**\n${fileLinks}`
          : `**Attachments:**\n${fileLinks}`;
      }

      await onSend(messageContent);
      setContent('');
      setSelectedFiles([]);
    } catch (error) {
      // Error handling is done by parent
    } finally {
      setIsSending(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="space-y-2">
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200"
            >
              {getFileIcon(file.type)}
              <span className="text-sm text-slate-700 truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                aria-label={`Remove file ${file.name}`}
              >
                <X className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          className={`min-h-[80px] resize-none pr-12 ${
            isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          maxLength={maxLength}
        />
        <div className="absolute bottom-2 right-2 text-xs text-slate-400">
          {charCount}/{maxLength}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allowAttachments && (
            <>
              <input
                type="file"
                id="message-file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Attach files to message"
              />
              <label
                htmlFor="message-file-upload"
                className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors text-sm"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach
              </label>
            </>
          )}
          <div className="text-xs text-slate-500">
            Press Enter to send
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && selectedFiles.length === 0) || isSending || isOverLimit || disabled}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>

      {isOverLimit && (
        <p className="text-xs text-red-500">
          Message exceeds maximum length of {maxLength} characters
        </p>
      )}
    </div>
  );
}
