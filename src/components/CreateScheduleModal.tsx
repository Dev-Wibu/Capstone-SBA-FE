import { useState, useEffect } from 'react';
import { createSchedule, getCouncils, getAllProposals } from '@/services/api';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Council {
  id: number;
  name: string;
  semesterName?: string;
}

interface CapstoneProject {
  id: number;
  title: string;
  studentName?: string;
}

const CreateScheduleModal = ({ isOpen, onClose, onSuccess }: CreateScheduleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  
  const [formData, setFormData] = useState({
    capstoneProjectId: 0,
    councilId: 0,
    defenseDate: '',
    startTime: '',
    endTime: '',
    room: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [councilsData, projectsData] = await Promise.all([
        getCouncils(),
        getAllProposals()
      ]);
      setCouncils(councilsData);
      // Chỉ lấy các đồ án có status là DEFENSE
      const defenseProjects = projectsData
        .filter((p: any) => p.status === 'DEFENSE')
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          studentName: p.studentName
        }));
      setProjects(defenseProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.capstoneProjectId || formData.capstoneProjectId === 0) {
      alert('Vui lòng chọn đồ án');
      return;
    }
    if (!formData.councilId || formData.councilId === 0) {
      alert('Vui lòng chọn hội đồng');
      return;
    }
    if (!formData.defenseDate) {
      alert('Vui lòng chọn ngày bảo vệ');
      return;
    }
    if (!formData.startTime) {
      alert('Vui lòng nhập giờ bắt đầu');
      return;
    }
    if (!formData.endTime) {
      alert('Vui lòng nhập giờ kết thúc');
      return;
    }
    if (!formData.room.trim()) {
      alert('Vui lòng nhập phòng');
      return;
    }

    try {
      setLoading(true);
      await createSchedule(formData);
      alert('Xếp lịch thành công!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xếp lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      capstoneProjectId: 0,
      councilId: 0,
      defenseDate: '',
      startTime: '',
      endTime: '',
      room: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Xếp lịch bảo vệ đồ án</h2>
              <p className="text-indigo-100 mt-1">Tạo lịch bảo vệ mới cho đồ án</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Đồ án */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Đồ án <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.capstoneProjectId}
              onChange={(e) => setFormData({ ...formData, capstoneProjectId: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value={0}>-- Chọn đồ án --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} {project.studentName && `- ${project.studentName}`}
                </option>
              ))}
            </select>
          </div>

          {/* Hội đồng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hội đồng bảo vệ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.councilId}
              onChange={(e) => setFormData({ ...formData, councilId: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value={0}>-- Chọn hội đồng --</option>
              {councils.map((council) => (
                <option key={council.id} value={council.id}>
                  {council.name} {council.semesterName && `(${council.semesterName})`}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày bảo vệ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày bảo vệ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.defenseDate}
              onChange={(e) => setFormData({ ...formData, defenseDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Giờ bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Phòng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Ví dụ: A101, B205..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xếp lịch...' : 'Xếp lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduleModal;
