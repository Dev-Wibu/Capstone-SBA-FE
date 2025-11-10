import { useState, useEffect } from 'react';
import type { CapstoneProposalResponse } from '../../interfaces';
import { getProposalsByAdmin, getAllProposals, reviewProposal } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { exportAllProposalsToZip } from '../../utils/exportDocx';
import RatioSettingModal from '../../components/RatioSettingModal';

const AdminPage = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<CapstoneProposalResponse | null>(null);
  const [projects, setProjects] = useState<CapstoneProposalResponse[]>([]);
  const [allProjects, setAllProjects] = useState<CapstoneProposalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Reject modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingProposalId, setRejectingProposalId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ratio setting modal
  const [showRatioModal, setShowRatioModal] = useState(false);

  // Fetch proposals từ API
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('Không tìm thấy thông tin admin');
        return;
      }
      
      // Always fetch pending proposals
      const pendingData = await getProposalsByAdmin(user.id);
      setProjects(pendingData);
      
      // Fetch all proposals for the "all" filter
      const allData = await getAllProposals();
      setAllProjects(allData);
    } catch (err: any) {
      setError('Không thể tải danh sách đề tài: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: number) => {
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin admin');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reviewProposal(projectId, true, user.id, 'Chấp nhận');
      
      toast.success('Đã duyệt đề tài thành công!', {
        description: 'Đề tài đã được phê duyệt',
        duration: 3000,
      });
      
      setSelectedProject(null);
      await fetchProposals();
    } catch (err: any) {
      toast.error('Lỗi khi duyệt đề tài', {
        description: err.response?.data?.message || err.message || "Có lỗi xảy ra",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (projectId: number) => {
    setRejectingProposalId(projectId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin admin');
      return;
    }

    if (!rejectReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!rejectingProposalId) return;

    try {
      setIsSubmitting(true);
      
      await reviewProposal(rejectingProposalId, false, user.id, rejectReason);
      
      toast.success('Đã từ chối đề tài thành công!', {
        description: rejectReason.substring(0, 60) + (rejectReason.length > 60 ? '...' : ''),
        duration: 3000,
      });
      
      setShowRejectModal(false);
      setRejectingProposalId(null);
      setRejectReason('');
      setSelectedProject(null);
      await fetchProposals();
    } catch (err: any) {
      toast.error('Lỗi khi từ chối đề tài', {
        description: err.response?.data?.message || err.message || "Có lỗi xảy ra",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      const dataToDownload = filterMode === 'pending' ? projects : allProjects;
      await exportAllProposalsToZip(dataToDownload);
      toast.success('Tải xuống thành công!', {
        description: `Đã tải ${dataToDownload.length} đề tài`,
        duration: 3000,
      });
    } catch (err: any) {
      toast.error('Lỗi khi tải xuống', {
        description: err.message || 'Có lỗi xảy ra',
        duration: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper: Lấy danh sách students
  const getStudentsList = (project: CapstoneProposalResponse): string[] => {
    const students: string[] = [];
    if (project.students) {
      if (project.students.student1Name) students.push(project.students.student1Name);
      if (project.students.student2Name) students.push(project.students.student2Name);
      if (project.students.student3Name) students.push(project.students.student3Name);
      if (project.students.student4Name) students.push(project.students.student4Name);
      if (project.students.student5Name) students.push(project.students.student5Name);
      if (project.students.student6Name) students.push(project.students.student6Name);
    }
    return students;
  };

  // Helper: Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản trị hệ thống - Duyệt đề tài
          </h1>
          <button
            onClick={() => setShowRatioModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Cài đặt hệ số</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            <span>✅</span>
            <span>Đã qua kiểm tra trùng lặp</span>
          </span>
          <span>→</span>
          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
            <span>👨‍💼</span>
            <span>Chờ Admin duyệt cuối</span>
          </span>
        </div>
      </div>

      {/* Filter and Download Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterMode === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chờ duyệt ({projects.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterMode === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({allProjects.length})
          </button>
        </div>
        
        <button
          onClick={handleDownloadAll}
          disabled={isDownloading || (filterMode === 'pending' ? projects.length === 0 : allProjects.length === 0)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <span>⬇️</span>
              <span>Tải xuống tất cả</span>
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 max-w-md">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-sm text-orange-100 mb-2">
            {filterMode === 'pending' ? 'Tổng đề tài chờ duyệt' : 'Tổng tất cả đề tài'}
          </p>
          <p className="text-4xl font-bold">
            {filterMode === 'pending' ? projects.length : allProjects.length}
          </p>
          <p className="text-xs text-orange-100 mt-2">
            {filterMode === 'pending' ? 'Đã qua kiểm tra trùng lặp' : 'Trong hệ thống'}
          </p>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(filterMode === 'pending' ? projects : allProjects).map((project) => {
          const students = getStudentsList(project);
          
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-t-4 border-orange-500"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {students[0] || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {students.length} thành viên
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(project.createdAt)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {project.semester ? `${project.semester.name} (${project.semester.semesterCode})` : 'Chưa có học kỳ'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span>✅</span>
                    <span>Chờ duyệt</span>
                  </span>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Chi tiết →
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  {filterMode === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(project.id!)}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✓ Duyệt
                      </button>
                      <button
                        onClick={() => openRejectModal(project.id!)}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✗ Từ chối
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(filterMode === 'pending' ? projects.length === 0 : allProjects.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {filterMode === 'pending' ? 'Không có đề tài nào cần duyệt' : 'Không có đề tài nào trong hệ thống'}
          </p>
          <p className="text-gray-400 text-sm">
            {filterMode === 'pending' ? 'Tất cả đề tài đã được xử lý hoặc chưa có đề tài mới' : 'Vui lòng quay lại sau'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedProject.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span>✅</span>
                      <span>Chờ Admin duyệt</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Context */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📌</span>
                  <span>Bối cảnh</span>
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProject.context}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  <span>Mô tả chi tiết</span>
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProject.description}</p>
              </div>

              {/* Functional Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Yêu cầu chức năng ({selectedProject.func.length})</span>
                </h3>
                <ul className="space-y-2">
                  {selectedProject.func.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Non-Functional Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Yêu cầu phi chức năng ({selectedProject.nonFunc.length})</span>
                </h3>
                <ul className="space-y-2">
                  {selectedProject.nonFunc.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-purple-50 p-2 rounded">
                      <span className="text-purple-600 font-bold mt-0.5">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Students */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>👥</span>
                  <span>Thành viên nhóm</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getStudentsList(selectedProject).map((student, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{student}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semester Info */}
              {selectedProject.semester && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>📅</span>
                    <span>Thông tin học kỳ</span>
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p><span className="font-medium">Tên:</span> {selectedProject.semester.name}</p>
                    <p><span className="font-medium">Mã:</span> {selectedProject.semester.semesterCode}</p>
                    <p><span className="font-medium">Năm học:</span> {selectedProject.semester.year}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(selectedProject.id!)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : '✓ Duyệt đồ án'}
                </button>
                <button
                  onClick={() => openRejectModal(selectedProject.id!)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✗ Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span>Từ chối đề tài</span>
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Vui lòng nhập lý do từ chối đề tài này:
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              
              {rejectReason.trim() && (
                <p className="text-sm text-gray-500">
                  Số ký tự: {rejectReason.length}
                </p>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingProposalId(null);
                  setRejectReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isSubmitting || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ratio Setting Modal */}
      <RatioSettingModal
        isOpen={showRatioModal}
        onClose={() => setShowRatioModal(false)}
      />
    </div>
  );
};

export default AdminPage;
