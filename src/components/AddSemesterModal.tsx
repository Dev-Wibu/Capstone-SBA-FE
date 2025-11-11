import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SemesterFormData } from '@/interfaces';
import { createSemester } from '@/services/api';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSemesterCreated?: (semesterData: {
    id: number;
    name: string;
    semesterCode: string;
    academic_year: number;
    startDate: string;
    endDate: string;
    current: boolean;
  }) => void;
}

const AddSemesterModal = ({ isOpen, onClose, onSuccess, onSemesterCreated }: AddSemesterModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SemesterFormData>({
    name: '',
    semesterCode: '',
    academic_year: new Date().getFullYear(),
    current: false,
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.semesterCode || !formData.startDate || !formData.endDate) {
        alert('Vui lòng điền đầy đủ thông tin!');
        setIsLoading(false);
        return;
      }

      // Convert date sang ISO format với timezone
      const startDateISO = new Date(formData.startDate).toISOString();
      const endDateISO = new Date(formData.endDate).toISOString();

      const payload = {
        name: formData.name.trim(),
        semesterCode: formData.semesterCode.trim(),
        academic_year: formData.academic_year,
        current: formData.current,
        startDate: startDateISO,
        endDate: endDateISO,
      };

      const createdSemester = await createSemester(payload);

      setFormData({
        name: '',
        semesterCode: '',
        academic_year: new Date().getFullYear(),
        current: false,
        startDate: '',
        endDate: '',
      });
      
      // Call onSemesterCreated callback to open review board modal
      if (onSemesterCreated && createdSemester.id) {
        onSemesterCreated({
          id: createdSemester.id,
          name: createdSemester.name,
          semesterCode: createdSemester.semesterCode,
          academic_year: formData.academic_year,
          startDate: startDateISO,
          endDate: endDateISO,
          current: createdSemester.current,
        });
      } else {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      alert('Thêm học kỳ thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Thêm học kỳ mới
            </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên học kỳ <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="Ví dụ: Học kỳ Fall"
            />
          </div>

          {/* Semester Code */}
          <div>
            <label htmlFor="semesterCode" className="block text-sm font-medium text-gray-700 mb-2">
              Mã học kỳ <span className="text-red-500">*</span>
            </label>
            <input
              id="semesterCode"
              type="text"
              required
              value={formData.semesterCode}
              onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="Ví dụ: FA2024"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 mb-2">
              Năm học <span className="text-red-500">*</span>
            </label>
            <input
              id="academic_year"
              type="number"
              required
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="2024"
              min="2000"
              max="2100"
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* Current */}
          <div className="flex items-center">
            <input
              id="current"
              type="checkbox"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="current" className="ml-2 text-sm text-gray-700">
              Đặt làm học kỳ hiện tại
            </label>
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
              {isLoading ? 'Đang thêm...' : 'Thêm học kỳ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSemesterModal;
