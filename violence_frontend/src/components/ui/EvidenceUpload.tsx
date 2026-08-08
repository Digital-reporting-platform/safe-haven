import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, EyeOff, Shield, X, Image } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from 'react-i18next';

interface EvidenceUploadProps {
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  onFilesChange,
  className = '',
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [previewBlurred, setPreviewBlurred] = useState(true);
  const [autoRedactFaces, setAutoRedactFaces] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-stone-300 p-8 text-center transition-colors hover:border-[#C15B3E]"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-stone-50">
          <Upload className="h-8 w-8 text-[#C15B3E]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-stone-800">
          {t('evidenceUpload.title')}
        </h3>
        <p className="mb-4 text-sm text-stone-600">
          {t('evidenceUpload.description')}
        </p>
        <Button type="button" variant="outline" size="sm">
          {t('evidenceUpload.chooseFiles')}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Privacy Controls */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 rounded-lg bg-stone-50 p-6"
        >
          <h4 className="flex items-center gap-2 font-bold text-stone-800">
            <Shield className="h-4 w-4 text-[#C15B3E]" />
            {t('evidenceUpload.privacyControls')}
          </h4>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={previewBlurred}
                onChange={(e) => setPreviewBlurred(e.target.checked)}
                className="h-4 w-4 rounded text-[#C15B3E]"
              />
              <span className="text-sm font-medium text-stone-700">
                {t('evidenceUpload.blurPreview')}
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={autoRedactFaces}
                onChange={(e) => setAutoRedactFaces(e.target.checked)}
                className="h-4 w-4 rounded text-[#C15B3E]"
              />
              <span className="text-sm font-medium text-stone-700">
                {t('evidenceUpload.autoRedactFaces')}
              </span>
            </label>
          </div>
        </motion.div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-800">
              {t('evidenceUpload.uploadedFiles')} ({files.length})
            </h4>
            <button
              type="button"
              onClick={() => setPreviewBlurred(!previewBlurred)}
              className="flex items-center gap-2 text-sm text-[#C15B3E] hover:text-[#A84D33]"
            >
              {previewBlurred ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {previewBlurred ? t('evidenceUpload.show') : t('evidenceUpload.hide')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <div
                  className={`aspect-square overflow-hidden rounded-lg border-2 border-stone-200 bg-stone-100 ${previewBlurred ? 'blur-sm' : ''} `}
                >
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={t('evidenceUpload.evidencePreview')}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Image className="h-8 w-8 text-stone-400" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C15B3E] text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>

                <p className="mt-2 truncate text-xs text-stone-600">
                  {file.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
