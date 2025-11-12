import { useState } from 'react';
import { gradeDefenseProposal } from '@/services/api';
import type { CapstoneProposalResponse } from '@/interfaces';

interface GradeDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: CapstoneProposalResponse;
  scheduleId: number;
  onSuccess: () => void;
}

const GradeDefenseModal = ({ isOpen, onClose, proposal, scheduleId, onSuccess }: GradeDefenseModalProps) => {
  const [gradeResult, setGradeResult] = useState<'PASS' | 'FAIL' | null>(null);
  const [score, setScore] = useState<string>('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!gradeResult) {
      setError('Vui lòng chọn kết quả chấm điểm');
      return;
    }

    if (!score || parseFloat(score) < 0.1 || parseFloat(score) > 10.0) {
      setError('Vui lòng nhập điểm từ 0.1 đến 10.0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await gradeDefenseProposal(
        scheduleId,
        gradeResult,
        parseFloat(score),
        comments || undefined
      );

      onSuccess();
    } catch (err: any) {
      console.error('Error grading proposal:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Chấm điểm bảo vệ</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Proposal Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                {proposal.code || `#${proposal.id}`}
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                DEFENSE
              </span>
            </div>
            
            <h3 className="text-base font-bold text-gray-900 mb-1">{proposal.title}</h3>
            {proposal.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
            )}
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kết quả <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGradeResult('PASS')}
                className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                  gradeResult === 'PASS'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                }`}
              >
                ✓ ĐẠT
              </button>
              <button
                onClick={() => setGradeResult('FAIL')}
                className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                  gradeResult === 'FAIL'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
                }`}
              >
                ✗ KHÔNG ĐẠT
              </button>
            </div>
          </div>

          {/* Score Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Điểm số (0.1 - 10.0) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.1"
              max="10.0"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Nhập điểm (VD: 8.5)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nhận xét
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Nhập nhận xét (tùy chọn)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !gradeResult || !score}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Xác nhận</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeDefenseModal;
