import { useState, useEffect } from 'react';
import type { CapstoneProposalResponse, Lecturer } from '../../interfaces';
import { getAllProposals, getLecturers } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { exportAllProposalsToZip } from '../../utils/exportDocx';
import RatioSettingModal from '../../components/RatioSettingModal';
import AddSemesterModal from '../../components/AddSemesterModal';
import ReviewBoardModal from '../../components/ReviewBoardModal';
import ViewReviewBoardModal from '../../components/ViewReviewBoardModal';
import ProposalDetailModal from '../../components/ProposalDetailModal';

const AdminPage = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<CapstoneProposalResponse | null>(null);
  const [projects, setProjects] = useState<CapstoneProposalResponse[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Filter status
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Ratio setting modal
  const [showRatioModal, setShowRatioModal] = useState(false);
  
  // Add semester modal
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  
  // Review board modal
  const [showReviewBoardModal, setShowReviewBoardModal] = useState(false);
  const [newSemesterData, setNewSemesterData] = useState<{
    id: number;
    name: string;
    semesterCode: string;
    academic_year: number;
    startDate: string;
    endDate: string;
    current: boolean;
  } | null>(null);
  
  // View review board modal
  const [showViewReviewBoardModal, setShowViewReviewBoardModal] = useState(false);

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
      
      // Fetch all proposals and lecturers
      const [allData, lecturersData] = await Promise.all([
        getAllProposals(),
        getLecturers()
      ]);
      setProjects(allData);
      setLecturers(lecturersData);
    } catch (err: any) {
      setError('Không thể tải danh sách đề tài: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      await exportAllProposalsToZip(filteredProjects, lecturers);
      toast.success('Tải xuống thành công!', {
        description: `Đã tải ${filteredProjects.length} đề tài`,
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

  // Helper: Lấy tên status tiếng Việt
  const getStatusLabel = (status: CapstoneProposalResponse['status']): string => {
    const statusMap: Record<string, string> = {
      'SUBMITTED': 'Mới nộp',
      'DUPLICATE_REJECTED': 'Bị trùng lặp',
      'REJECT_BY_ADMIN': 'Từ chối bởi Admin',
      'DUPLICATE_ACCEPTED': 'Đã qua kiểm tra trùng',
      'REVIEW_1': 'Review lần 1',
      'REVIEW_2': 'Review lần 2',
      'REVIEW_3': 'Review lần 3',
      'DEFENSE': 'Bảo vệ lần 1',
      'SECOND_DEFENSE': 'Bảo vệ lần 2',
      'FAILED': 'Không đạt',
      'COMPLETED': 'Hoàn thành',
    };
    return statusMap[status] || status;
  };

  // Helper: Lấy màu badge cho status
  const getStatusColor = (status: CapstoneProposalResponse['status']): string => {
    const colorMap: Record<string, string> = {
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'DUPLICATE_REJECTED': 'bg-red-100 text-red-800',
      'REJECT_BY_ADMIN': 'bg-red-100 text-red-800',
      'DUPLICATE_ACCEPTED': 'bg-green-100 text-green-800',
      'REVIEW_1': 'bg-yellow-100 text-yellow-800',
      'REVIEW_2': 'bg-yellow-100 text-yellow-800',
      'REVIEW_3': 'bg-yellow-100 text-yellow-800',
      'DEFENSE': 'bg-purple-100 text-purple-800',
      'SECOND_DEFENSE': 'bg-purple-100 text-purple-800',
      'FAILED': 'bg-gray-100 text-gray-800',
      'COMPLETED': 'bg-emerald-100 text-emerald-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter projects theo status và loại bỏ proposal có id = 1
  const filteredProjects = (filterStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === filterStatus)
  ).filter(p => p.id !== 1);

  // Đếm số lượng theo từng status (không tính proposal có id = 1)
  const statusCounts = projects
    .filter(p => p.id !== 1)
    .reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
            Quản lý tất cả đề tài
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddSemesterModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              <span>📅</span>
              <span>Thêm học kỳ</span>
            </button>
            <button
              onClick={() => setShowViewReviewBoardModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
            >
              <span>👥</span>
              <span>Xem hội đồng duyệt</span>
            </button>
            <button
              onClick={() => setShowRatioModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Cài đặt hệ số</span>
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Xem và quản lý tất cả đề tài trong hệ thống
        </p>
      </div>

      {/* Filter Status Buttons */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({projects.filter(p => p.id !== 1).length})
          </button>
          <button
            onClick={() => setFilterStatus('DUPLICATE_ACCEPTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'DUPLICATE_ACCEPTED'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Qua kiểm tra ({statusCounts['DUPLICATE_ACCEPTED'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REVIEW_1')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'REVIEW_1'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Review 1 ({statusCounts['REVIEW_1'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REVIEW_2')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'REVIEW_2'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Review 2 ({statusCounts['REVIEW_2'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REVIEW_3')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'REVIEW_3'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Review 3 ({statusCounts['REVIEW_3'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('DEFENSE')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'DEFENSE'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Bảo vệ 1 ({statusCounts['DEFENSE'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('SECOND_DEFENSE')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'SECOND_DEFENSE'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Bảo vệ 2 ({statusCounts['SECOND_DEFENSE'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'COMPLETED'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Hoàn thành ({statusCounts['COMPLETED'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('DUPLICATE_REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'DUPLICATE_REJECTED'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Trùng lặp ({statusCounts['DUPLICATE_REJECTED'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REJECT_BY_ADMIN')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'REJECT_BY_ADMIN'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Từ chối ({statusCounts['REJECT_BY_ADMIN'] || 0})
          </button>
          <button
            onClick={() => setFilterStatus('FAILED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'FAILED'
                ? 'bg-gray-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Không đạt ({statusCounts['FAILED'] || 0})
          </button>
        </div>
      </div>

      {/* Download Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleDownloadAll}
          disabled={isDownloading || filteredProjects.length === 0}
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
              <span>Tải xuống</span>
            </>
          )}
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{filteredProjects.map((project) => {
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

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    <span>{getStatusLabel(project.status)}</span>
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
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg font-medium mb-2">Không có đề tài nào</p>
          <p className="text-gray-400 text-sm">Thử chọn filter khác</p>
        </div>
      )}

      {/* Detail Modal */}
      <ProposalDetailModal
        isOpen={selectedProject !== null}
        proposal={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRefresh={fetchProposals}
      />

      {/* Ratio Setting Modal */}
      <RatioSettingModal
        isOpen={showRatioModal}
        onClose={() => setShowRatioModal(false)}
      />

      {/* Add Semester Modal */}
      <AddSemesterModal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onSuccess={() => {
          setShowAddSemesterModal(false);
          toast.success('Thêm học kỳ thành công!');
        }}
        onSemesterCreated={(semesterData) => {
          setNewSemesterData(semesterData);
          setShowAddSemesterModal(false);
          setShowReviewBoardModal(true);
        }}
      />

      {/* Review Board Modal */}
      {newSemesterData && (
        <ReviewBoardModal
          isOpen={showReviewBoardModal}
          onClose={() => {
            setShowReviewBoardModal(false);
            setNewSemesterData(null);
          }}
          onSuccess={() => {
            setShowReviewBoardModal(false);
            setNewSemesterData(null);
            fetchProposals();
          }}
          semesterData={newSemesterData}
        />
      )}

      {/* View Review Board Modal */}
      <ViewReviewBoardModal
        isOpen={showViewReviewBoardModal}
        onClose={() => setShowViewReviewBoardModal(false)}
      />
    </div>
  );
};

export default AdminPage;
