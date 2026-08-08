import React, { useState } from 'react';
import { UnderReviewInspector } from './UnderReviewInspector';

// Example usage component for the Under Review Inspector
export const UnderReviewInspectorExample = ({
  isDark,
}: {
  isDark: boolean;
}) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Mock case data for under review
  const mockUnderReviewCase = {
    id: '2024-0892',
    pseudonym: 'Anon-Wolf-3K',
    type: 'Harassment Report',
    timeInReview: '2h 14m',
    specialists: {
      legal: {
        name: 'Ato Bekele',
        status: 'waiting' as const,
        message: 'Waiting for document upload',
      },
      medical: {
        name: 'Dr. Amina',
        status: 'completed' as const,
        message: 'Completed forensic exam',
      },
      shelter: {
        name: 'Safe Haven Center',
        status: 'in-progress' as const,
        message: 'Preparing accommodation',
      },
    },
    tasks: [
      { id: '1', text: 'Legal consultation scheduled', completed: false },
      { id: '2', text: 'Medical evidence collected', completed: false },
      {
        id: '3',
        text: 'Safety plan communicated to survivor',
        completed: false,
      },
      { id: '4', text: 'Initial risk assessment completed', completed: true },
    ],
    chatHistory: [
      {
        id: '1',
        sender: 'survivor' as const,
        message:
          'Thank you for taking my case. I have the additional documents you requested.',
        timestamp: '14:30',
      },
      {
        id: '2',
        sender: 'manager' as const,
        message:
          'Thank you for providing those. Dr. Amina has completed the medical examination. We are now coordinating with legal counsel.',
        timestamp: '15:45',
      },
      {
        id: '3',
        sender: 'survivor' as const,
        message: 'When will I hear back about the legal consultation?',
        timestamp: '16:20',
      },
      {
        id: '4',
        sender: 'manager' as const,
        message:
          'Ato Bekele will contact you within 24 hours. In the meantime, please review the safety resources I sent.',
        timestamp: '16:25',
      },
    ],
    survivorLastActive: '15m ago',
    evidence: [
      {
        id: '1',
        type: 'image' as const,
        name: 'incident_photo_1.jpg',
        annotations: 'Shows clear evidence of harassment incident at workplace',
      },
      {
        id: '2',
        type: 'document' as const,
        name: 'witness_statement.pdf',
      },
      {
        id: '3',
        type: 'video' as const,
        name: 'security_footage.mp4',
        annotations: 'Timestamp 14:32 shows perpetrator approaching victim',
      },
    ],
    timeline: [
      {
        id: '1',
        action: 'Case moved to Under Review',
        timestamp: '12:00',
        actor: 'You',
      },
      {
        id: '2',
        action: 'Legal specialist assigned (Ato Bekele)',
        timestamp: '12:15',
        actor: 'You',
      },
      {
        id: '3',
        action: 'Medical specialist assigned (Dr. Amina)',
        timestamp: '12:16',
        actor: 'You',
      },
      {
        id: '4',
        action: 'Survivor uploaded additional evidence',
        timestamp: '14:30',
        actor: 'Anon-Wolf-3K',
      },
      {
        id: '5',
        action: 'Medical examination completed',
        timestamp: '15:45',
        actor: 'Dr. Amina',
      },
      {
        id: '6',
        action: 'Shelter accommodation arranged',
        timestamp: '16:00',
        actor: 'Safe Haven Center',
      },
    ],
  };

  const handleMarkResolved = () => {
    console.log('Case marked as resolved');
    setIsInspectorOpen(false);
  };

  const handleEscalate = () => {
    console.log('Case escalated to higher authority');
    setIsInspectorOpen(false);
  };

  const handleTransfer = () => {
    console.log('Case transferred to colleague');
    setIsInspectorOpen(false);
  };

  const handleMoveToAssigned = () => {
    console.log('Case moved to Assigned status');
    setIsInspectorOpen(false);
  };

  return (
    <div className="p-6">
      {/* Example case card that would trigger the inspector */}
      <div
        className={`cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
          isDark
            ? 'border-slate-600 hover:border-slate-500'
            : 'border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => setIsInspectorOpen(true)}
      >
        <div className="mb-2 flex items-center justify-between">
          <code className="font-mono font-bold">CASE #2024-0892</code>
          <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
            Under Review
          </span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Harassment Report • Anon-Wolf-3K
        </div>
        <div className="mt-1 text-xs text-slate-500">
          In review for 2h 14m • 3 specialists assigned
        </div>
      </div>

      {/* Under Review Inspector */}
      <UnderReviewInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        caseData={mockUnderReviewCase}
        onMarkResolved={handleMarkResolved}
        onEscalate={handleEscalate}
        onTransfer={handleTransfer}
        onMoveToAssigned={handleMoveToAssigned}
        isDark={isDark}
      />
    </div>
  );
};
