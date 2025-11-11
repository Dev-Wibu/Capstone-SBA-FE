import { useState, useEffect } from 'react';
import type { Lecturer } from '@/interfaces';
import { getLecturers, updateSemesterWithReviewBoard } from '@/services/api';
import { toast } from 'sonner';

interface ReviewBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  semesterData: {
    id: number;
    name: string;
    semesterCode: string;
    academic_year: number;
    startDate: string;
    endDate: string;
    current: boolean;
  };
}

const ReviewBoardModal = ({ isOpen, onClose, onSuccess, semesterData }: ReviewBoardModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState({
    reviewerCode1: '',
    reviewerCode2: '',
    reviewerCode3: '',
    reviewerCode4: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchLecturers();
    }
  }, [isOpen]);

  const fetchLecturers = async () => {
    try {
      const data = await getLecturers();
      // Chỉ lấy những người có role là MENTOR
      const mentors = data.filter(l => l.role === 'MENTOR');
      setLecturers(mentors);
    } catch (error) {
      toast.error('Không thể tải danh sách giảng viên');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: must select 4 different reviewers
    const reviewerCodes = Object.values(selectedReviewers);
    if (reviewerCodes.some(code => !code)) {
      toast.error('Vui lòng chọn đủ 4 giảng viên duyệt đồ án');
      return;
    }

    const uniqueCodes = new Set(reviewerCodes);
    if (uniqueCodes.size !== 4) {
      toast.error('Vui lòng chọn 4 giảng viên khác nhau');
      return;
    }

    setIsLoading(true);

    try {
      await updateSemesterWithReviewBoard({
        id: semesterData.id,
        name: semesterData.name,
        semesterCode: semesterData.semesterCode,
        academic_year: semesterData.academic_year,
        startDate: semesterData.startDate,
        endDate: semesterData.endDate,
        current: semesterData.current,
        ...selectedReviewers,
      });

      toast.success('Thiết lập hội đồng duyệt thành công!');
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedReviewers({
        reviewerCode1: '',
        reviewerCode2: '',
        reviewerCode3: '',
        reviewerCode4: '',
      });
    } catch (error: any) {
      toast.error('Thiết lập hội đồng thất bại', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Thiết lập hội đồng duyệt đồ án
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {semesterData.name} ({semesterData.semesterCode})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Lưu ý quan trọng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Chọn 4 giảng viên khác nhau làm hội đồng duyệt đồ án</li>
                  <li>• Giảng viên trong hội đồng sẽ không được phép làm giảng viên hướng dẫn phụ</li>
                  <li>• Các giảng viên này sẽ chịu trách nhiệm duyệt tất cả đồ án trong học kỳ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reviewer 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên duyệt 1 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedReviewers.reviewerCode1}
              onChange={(e) => setSelectedReviewers({ ...selectedReviewers, reviewerCode1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option 
                  key={lecturer.id} 
                  value={lecturer.lecturerCode}
                  disabled={
                    lecturer.lecturerCode === selectedReviewers.reviewerCode2 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode3 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode4
                  }
                >
                  {lecturer.fullName} ({lecturer.lecturerCode})
                </option>
              ))}
            </select>
          </div>

          {/* Reviewer 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên duyệt 2 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedReviewers.reviewerCode2}
              onChange={(e) => setSelectedReviewers({ ...selectedReviewers, reviewerCode2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option 
                  key={lecturer.id} 
                  value={lecturer.lecturerCode}
                  disabled={
                    lecturer.lecturerCode === selectedReviewers.reviewerCode1 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode3 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode4
                  }
                >
                  {lecturer.fullName} ({lecturer.lecturerCode})
                </option>
              ))}
            </select>
          </div>

          {/* Reviewer 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên duyệt 3 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedReviewers.reviewerCode3}
              onChange={(e) => setSelectedReviewers({ ...selectedReviewers, reviewerCode3: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option 
                  key={lecturer.id} 
                  value={lecturer.lecturerCode}
                  disabled={
                    lecturer.lecturerCode === selectedReviewers.reviewerCode1 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode2 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode4
                  }
                >
                  {lecturer.fullName} ({lecturer.lecturerCode})
                </option>
              ))}
            </select>
          </div>

          {/* Reviewer 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảng viên duyệt 4 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedReviewers.reviewerCode4}
              onChange={(e) => setSelectedReviewers({ ...selectedReviewers, reviewerCode4: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option 
                  key={lecturer.id} 
                  value={lecturer.lecturerCode}
                  disabled={
                    lecturer.lecturerCode === selectedReviewers.reviewerCode1 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode2 ||
                    lecturer.lecturerCode === selectedReviewers.reviewerCode3
                  }
                >
                  {lecturer.fullName} ({lecturer.lecturerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Đang thiết lập...' : 'Thiết lập hội đồng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewBoardModal;
