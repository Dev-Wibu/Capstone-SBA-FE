import { useEffect, useState } from 'react';
import { updateProposalReview, getLecturers } from '@/services/api';
import type { Lecturer, Reviewer } from '@/interfaces';

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: number;
  reviewTime: 1 | 2 | 3;
  onSuccess?: () => void;
  excludeCodes?: string[]; // lecturerCode1, lecturerCode2 để loại khỏi dropdown
  reviewer?: Reviewer; // Thông tin reviewer hiện tại để filter
}

const ScheduleReviewModal = ({ isOpen, onClose, proposalId, reviewTime, onSuccess, excludeCodes = [], reviewer }: ScheduleReviewModalProps) => {
  const [dateTime, setDateTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Lecturer[]>([]);
  const [selectedMentor1, setSelectedMentor1] = useState<string>(''); // lecturerCode mentor 1
  const [selectedMentor2, setSelectedMentor2] = useState<string>(''); // lecturerCode mentor 2 (chỉ cho review 1)
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Fetch mentors (hook must come before any early return)
  useEffect(() => {
    if (!isOpen) return; // still safe: doesn't break hook order
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        const data = await getLecturers();
        
        // Build exclude list based on reviewTime
        let excludeList = [...excludeCodes];
        
        if (reviewer) {
          // Review 1: Loại trừ lecturerCode1, lecturerCode2
          // Review 2: Loại trừ lecturerCode1, lecturerCode2, reviewer1Code, reviewer2Code
          // Review 3: Loại trừ lecturerCode1, lecturerCode2, reviewer1Code, reviewer2Code, reviewer3Code, reviewer4Code
          if (reviewTime === 2) {
            if (reviewer.reviewer1Code) excludeList.push(reviewer.reviewer1Code);
            if (reviewer.reviewer2Code) excludeList.push(reviewer.reviewer2Code);
          } else if (reviewTime === 3) {
            if (reviewer.reviewer1Code) excludeList.push(reviewer.reviewer1Code);
            if (reviewer.reviewer2Code) excludeList.push(reviewer.reviewer2Code);
            if (reviewer.reviewer3Code) excludeList.push(reviewer.reviewer3Code);
            if (reviewer.reviewer4Code) excludeList.push(reviewer.reviewer4Code);
          }
        }
        
        const filtered = data.filter(m => m.role === 'MENTOR' && !excludeList.includes(m.lecturerCode));
        setMentors(filtered);
      } catch (e) {
        setError('Không thể tải danh sách mentor');
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, [isOpen, excludeCodes, reviewTime, reviewer]);

  if (!isOpen) return null; // move return after hooks

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!dateTime) {
      setError('Vui lòng chọn ngày giờ');
      return;
    }
    
    // Kiểm tra mentor 1 (bắt buộc cho tất cả review)
    if (!selectedMentor1) {
      setError('Vui lòng chọn mentor 1');
      return;
    }
    
    // Kiểm tra mentor 2 (bắt buộc cho tất cả review)
    if (!selectedMentor2) {
      setError(`Review ${reviewTime} yêu cầu chọn 2 mentor`);
      return;
    }
    
    // Kiểm tra không được chọn trùng mentor
    if (selectedMentor1 === selectedMentor2) {
      setError('Không được chọn trùng mentor');
      return;
    }
    
    // Ensure seconds present (YYYY-MM-DDTHH:mm:ss)
    const normalized = dateTime.length === 16 ? `${dateTime}:00` : dateTime;
    
    // Tìm thông tin mentor được chọn
    const lecturer1 = mentors.find(m => m.lecturerCode === selectedMentor1);
    if (!lecturer1) {
      setError('Không tìm thấy thông tin mentor 1');
      return;
    }
    
    let lecturer2: Lecturer | undefined;
    if (selectedMentor2) {
      lecturer2 = mentors.find(m => m.lecturerCode === selectedMentor2);
      if (!lecturer2) {
        setError('Không tìm thấy thông tin mentor 2');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      // Đảm bảo proposalId là number (int)
      const proposalIdAsNumber = Number(proposalId);
      
      // Gọi API với mentorCode1, mentorName1, mentorCode2, mentorName2
      await updateProposalReview(
        proposalIdAsNumber, 
        normalized, 
        reviewTime, 
        selectedMentor1, 
        lecturer1.fullName,
        lecturer2?.lecturerCode,
        lecturer2?.fullName
      );
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn mentor 1 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMentor1}
              onChange={(e) => setSelectedMentor1(e.target.value)}
              disabled={loadingMentors}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">-- Chọn mentor 1 --</option>
              {mentors.map(m => (
                <option key={m.id} value={m.lecturerCode}>{m.fullName} ({m.lecturerCode})</option>
              ))}
            </select>
            {loadingMentors && <p className="text-xs text-gray-500 mt-1">Đang tải mentor...</p>}
            {mentors.length === 0 && !loadingMentors && (
              <p className="text-xs text-amber-600 mt-1">Không có mentor khả dụng cho review này</p>
            )}
          </div>
          
          {/* Hiển thị mentor 2 cho tất cả review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn mentor 2 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMentor2}
              onChange={(e) => setSelectedMentor2(e.target.value)}
              disabled={loadingMentors || !selectedMentor1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">-- Chọn mentor 2 --</option>
              {mentors
                .filter(m => m.lecturerCode !== selectedMentor1) // Loại trừ mentor 1 đã chọn
                .map(m => (
                  <option key={m.id} value={m.lecturerCode}>{m.fullName} ({m.lecturerCode})</option>
                ))
              }
            </select>
            <p className="text-xs text-gray-500 mt-1">Tất cả review yêu cầu 2 mentor</p>
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
