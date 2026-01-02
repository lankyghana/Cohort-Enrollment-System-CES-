import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { assignmentsService } from '@/services/assignments';
import type { SubmissionWithFiles } from '@/types';

interface GradeSubmissionModalProps {
  submission: SubmissionWithFiles;
  onGraded: () => void;
}

export function GradeSubmissionModal({ submission, onGraded }: GradeSubmissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedScore = Number(score);
      if (!Number.isFinite(parsedScore)) {
        setError('Score must be a number');
        return;
      }

      await assignmentsService.gradeSubmission(submission.id, { score: parsedScore, feedback });
      onGraded();
      setIsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Grade</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Grade Submission">
        <div className="space-y-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">
              Score
            </label>
            <input
              type="number"
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
              Feedback
            </label>
            <textarea
              id="feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Grade'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
