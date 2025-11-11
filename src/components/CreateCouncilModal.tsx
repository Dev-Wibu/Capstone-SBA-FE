import { useState, useEffect } from 'react';
import { getLecturers, getSemesters, createCouncil } from '@/services/api';
import type { Lecturer, Semester } from '@/interfaces';

interface CreateCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CouncilRole = 'PRESIDENT' | 'SECRETARY' | 'REVIEWER' | 'GUEST';

interface CouncilMember {
  lecturerId: number;
  role: CouncilRole;
}

const CreateCouncilModal = ({ isOpen, onClose, onSuccess }: CreateCouncilModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [members, setMembers] = useState<CouncilMember[]>([]);
  
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturersList, semestersList] = await Promise.all([
          getLecturers(),
          getSemesters()
        ]);
        // Lọc bỏ lecturer có role là ADMIN
        const filteredLecturers = lecturersList.filter(l => l.role !== 'ADMIN');
        setLecturers(filteredLecturers);
        setSemesters(semestersList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const getRoleLabel = (role: CouncilRole): string => {
    const labels: Record<CouncilRole, string> = {
      PRESIDENT: 'Chủ tích',
      SECRETARY: 'Thư ký',
      REVIEWER: 'Giám khảo',
      GUEST: 'Khách mời'
    };
    return labels[role];
  };

  const getRoleCount = (role: CouncilRole): number => {
    return members.filter(m => m.role === role).length;
  };

  const canAddRole = (role: CouncilRole): boolean => {
    const count = getRoleCount(role);
    if (role === 'PRESIDENT' || role === 'SECRETARY') return count < 1;
    if (role === 'REVIEWER') return count < 3;
    if (role === 'GUEST') return count < 1;
    return false;
  };

  const addMember = (role: CouncilRole) => {
    if (!canAddRole(role)) return;
    setMembers([...members, { lecturerId: 0, role }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMemberLecturer = (index: number, lecturerId: number) => {
    const updated = [...members];
    updated[index].lecturerId = lecturerId;
    setMembers(updated);
  };

  const getAvailableLecturers = (currentIndex: number): Lecturer[] => {
    const selectedIds = members
      .map((m, i) => i !== currentIndex ? m.lecturerId : 0)
      .filter(id => id > 0);
    return lecturers.filter(l => !selectedIds.includes(l.id!));
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên hội đồng');
      return false;
    }
    if (!semesterId) {
      setError('Vui lòng chọn học kỳ');
      return false;
    }
    
    // Validate số lượng thành viên theo role
    const presidentCount = getRoleCount('PRESIDENT');
    const secretaryCount = getRoleCount('SECRETARY');
    const reviewerCount = getRoleCount('REVIEWER');
    
    if (presidentCount !== 1) {
      setError('Phải có đúng 1 Chủ tích');
      return false;
    }
    if (secretaryCount !== 1) {
      setError('Phải có đúng 1 Thư ký');
      return false;
    }
    if (reviewerCount !== 3) {
      setError('Phải có đúng 3 Giám khảo');
      return false;
    }
    
    // Validate tất cả members đã chọn lecturer
    if (members.some(m => m.lecturerId === 0)) {
      setError('Vui lòng chọn giảng viên cho tất cả vị trí');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await createCouncil({
        name,
        description,
        semesterId: semesterId as number,
        members
      });
      
      // Reset form
      setName('');
      setDescription('');
      setSemesterId('');
      setMembers([]);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hội đồng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tạo hội đồng bảo vệ đồ án</h2>
              <p className="text-indigo-100">Thiết lập thành viên hội đồng bảo vệ</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên hội đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="VD: Hội đồng KTPM - Đợt 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mô tả về hội đồng..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Học kỳ <span className="text-red-500">*</span>
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Chọn học kỳ --</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name} ({semester.semesterCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thành viên hội đồng */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành viên hội đồng</h3>
            
            {/* Add buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => addMember('PRESIDENT')}
                disabled={!canAddRole('PRESIDENT')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                + Chủ tích ({getRoleCount('PRESIDENT')}/1)
              </button>
              <button
                onClick={() => addMember('SECRETARY')}
                disabled={!canAddRole('SECRETARY')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                + Thư ký ({getRoleCount('SECRETARY')}/1)
              </button>
              <button
                onClick={() => addMember('REVIEWER')}
                disabled={!canAddRole('REVIEWER')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                + Giám khảo ({getRoleCount('REVIEWER')}/3)
              </button>
              <button
                onClick={() => addMember('GUEST')}
                disabled={!canAddRole('GUEST')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                + Khách mời ({getRoleCount('GUEST')}/1) (Tùy chọn)
              </button>
            </div>

            {/* Members list */}
            {members.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500">Chưa có thành viên nào. Nhấn nút bên trên để thêm.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => {
                  const availableLecturers = getAvailableLecturers(index);
                  const roleColors = {
                    PRESIDENT: 'bg-purple-100 text-purple-800 border-purple-200',
                    SECRETARY: 'bg-blue-100 text-blue-800 border-blue-200',
                    REVIEWER: 'bg-green-100 text-green-800 border-green-200',
                    GUEST: 'bg-orange-100 text-orange-800 border-orange-200'
                  };
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${roleColors[member.role]}`}>
                        {getRoleLabel(member.role)}
                      </span>
                      <select
                        value={member.lecturerId}
                        onChange={(e) => updateMemberLecturer(index, Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={0}>-- Chọn giảng viên --</option>
                        {availableLecturers.map((lecturer) => (
                          <option key={lecturer.id} value={lecturer.id}>
                            {lecturer.fullName} ({lecturer.lecturerCode})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Validation info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Yêu cầu:</strong> 1 Chủ tích + 1 Thư ký + 3 Giám khảo (+ Khách mời tùy chọn)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo hội đồng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCouncilModal;
