import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CapstoneProposalResponse } from '../../interfaces';
import { getAllProposals, getProposalHistory } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AllProposalsPage = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<CapstoneProposalResponse | null>(null);
  const [projects, setProjects] = useState<CapstoneProposalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectedProposalIds, setRejectedProposalIds] = useState<number[]>([]); // IDs của proposals bị reject bởi admin hiện tại
  const navigate = useNavigate();

  // Fetch proposals từ API
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📥 [ALL_PROPOSALS] Fetching all proposals...');
        console.log('📥 [ALL_PROPOSALS] Current admin ID:', user?.id);
        const data = await getAllProposals();
        console.log('📥 [ALL_PROPOSALS] Received proposals:', data.length);
        
        setProjects(data);
        
        // Fetch history cho các proposal có status REJECT_BY_ADMIN
        const rejectByAdminProposals = data.filter(p => p.status === 'REJECT_BY_ADMIN');
        console.log('📥 [ALL_PROPOSALS] REJECT_BY_ADMIN proposals:', rejectByAdminProposals.length);
        
        if (rejectByAdminProposals.length > 0) {
          const rejectedByCurrentAdmin: number[] = [];
          
          for (const proposal of rejectByAdminProposals) {
            try {
              if (!proposal.id) continue; // Skip nếu proposal không có id
              
              const history = await getProposalHistory(proposal.id);
              console.log(`📜 [HISTORY] Proposal ${proposal.id} history:`, history);
              
              // Tìm history entry có adminRejectId = user.id
              const rejectedByMe = history.find((h: any) => h.adminRejectId === user?.id);
              if (rejectedByMe) {
                rejectedByCurrentAdmin.push(proposal.id);
                console.log(`✅ [REJECTED] Proposal ${proposal.id} rejected by current admin`);
              }
            } catch (err) {
              console.error(`❌ [HISTORY] Error fetching history for proposal ${proposal.id}:`, err);
            }
          }
          
          setRejectedProposalIds(rejectedByCurrentAdmin);
          console.log('📊 [REJECTED] Total rejected by me:', rejectedByCurrentAdmin.length);
        }
      } catch (err: any) {
        console.error('❌ [ALL_PROPOSALS] Error fetching proposals:', err);
        console.error('❌ [ALL_PROPOSALS] Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Không thể tải danh sách đề tài: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user?.id]);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (selectedStatus === 'approved') {
      // Đã duyệt: Admin hiện tại đã approve (isAdmin = true và adminId = user.id)
      return (p.isAdmin1 && p.admin1Id === user?.id) || (p.isAdmin2 && p.admin2Id === user?.id);
    }
    
    if (selectedStatus === 'rejected') {
      // Đã từ chối: Proposals có status REJECT_BY_ADMIN và adminRejectId = user.id
      return p.id !== null && rejectedProposalIds.includes(p.id);
    }
    
    return false;
  });

  // Count proposals approved by current admin
  const approvedByMeCount = projects.filter(p => 
    (p.isAdmin1 && p.admin1Id === user?.id) || (p.isAdmin2 && p.admin2Id === user?.id)
  ).length;

  // Count proposals rejected by current admin
  const rejectedByMeCount = rejectedProposalIds.length;

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

  // Helper: Get status badge
  const getStatusBadge = (status: CapstoneProposalResponse['status']) => {
    const statusConfig: Record<CapstoneProposalResponse['status'], { bg: string; text: string; label: string; icon: string }> = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã nộp', icon: '📝' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý', icon: '⏳' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt', icon: '✅' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối', icon: '❌' },
      DUPLICATE_ACCEPTED: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Trùng - Chấp nhận', icon: '✓' },
      DUPLICATE_REJECTED: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Trùng - Từ chối', icon: '⚠' },
      REJECT_BY_ADMIN: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin từ chối', icon: '🚫' },
      REVIEW_1: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review 1', icon: '👤' },
      REVIEW_2: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review 2', icon: '👥' },
      REVIEW_3: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review 3', icon: '👥' },
      DEFENSE: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Bảo vệ', icon: '🏛️' },
      SECOND_DEFENSE: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Bảo vệ lần 2', icon: '🏛️' },
      COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Hoàn thành', icon: '🎉' },
      FAILED: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Thất bại', icon: '�' },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tất cả đề tài trong hệ thống
        </h1>
        <p className="text-gray-600">
          Xem danh sách toàn bộ đề tài và lịch sử thay đổi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-md text-white">
          <p className="text-xs text-orange-100 mb-1">Tổng</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 mb-1">Đã nộp</p>
          <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'SUBMITTED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
          <p className="text-xs text-gray-500 mb-1">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'APPROVED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
          <p className="text-xs text-gray-500 mb-1">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">{projects.filter(p => p.status === 'REJECTED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-teal-500">
          <p className="text-xs text-gray-500 mb-1">Trùng - OK</p>
          <p className="text-2xl font-bold text-teal-600">{projects.filter(p => p.status === 'DUPLICATE_ACCEPTED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-orange-500">
          <p className="text-xs text-gray-500 mb-1">Trùng - Từ chối</p>
          <p className="text-2xl font-bold text-orange-600">{projects.filter(p => p.status === 'DUPLICATE_REJECTED').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500 mb-1">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">{projects.filter(p => p.status === 'PENDING').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {(['approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {status === 'approved' && `Đã duyệt bởi tôi (${approvedByMeCount})`}
              {status === 'rejected' && `Đã từ chối bởi tôi (${rejectedByMeCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {project.title}
                      </h3>
                    </div>
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

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                  {getStatusBadge(project.status)}
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Chi tiết →
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/proposal-history/${project.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Xem lịch sử
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
          <p className="text-gray-500 text-lg font-medium mb-2">Không tìm thấy đề tài nào</p>
          <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc để xem thêm</p>
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
                    {getStatusBadge(selectedProject.status)}
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

              {/* View History Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    navigate(`/proposal-history/${selectedProject.id}`);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Xem lịch sử thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProposalsPage;
