import { useEffect, useState } from 'react';
import { updateProposalReview, getLecturers } from '@/services/api';
import type { Lecturer } from '@/interfaces';

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: number;
  reviewTime: 1 | 2 | 3;
  onSuccess?: () => void;
  excludeCodes?: string[]; // lecturerCode1, lecturerCode2 để loại khỏi dropdown
}

const ScheduleReviewModal = ({ isOpen, onClose, proposalId, reviewTime, onSuccess, excludeCodes = [] }: ScheduleReviewModalProps) => {
  const [dateTime, setDateTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Lecturer[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>(''); // lecturerCode
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Fetch mentors (hook must come before any early return)
  useEffect(() => {
    if (!isOpen) return; // still safe: doesn't break hook order
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        const data = await getLecturers();
  const filtered = data.filter(m => m.role === 'MENTOR' && !excludeCodes.includes(m.lecturerCode));
        setMentors(filtered);
      } catch (e) {
        setError('Không thể tải danh sách mentor');
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, [isOpen, excludeCodes]);

  if (!isOpen) return null; // move return after hooks

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!dateTime) {
      setError('Vui lòng chọn ngày giờ');
      return;
    }
    // Ensure seconds present (YYYY-MM-DDTHH:mm:ss)
    const normalized = dateTime.length === 16 ? `${dateTime}:00` : dateTime;
    try {
      setIsSubmitting(true);
      await updateProposalReview(proposalId, normalized, reviewTime, selectedMentor || undefined);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật lịch review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = reviewTime === 1 ? 'Review 1' : reviewTime === 2 ? 'Review 2' : 'Review 3';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Xếp lịch {label}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày giờ</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn mentor phụ trách review (tùy chọn)</label>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              disabled={loadingMentors}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Không chọn --</option>
              {mentors.map(m => (
                <option key={m.id} value={m.lecturerCode}>{m.fullName} ({m.lecturerCode})</option>
              ))}
            </select>
            {loadingMentors && <p className="text-xs text-gray-500 mt-1">Đang tải mentor...</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-white ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleReviewModal;
