import { useState } from 'react';

interface Project {
  id: string;
  studentName: string;
  studentEmail: string;
  title: string;
  description: string;
  category: string;
  members: string[];
  submittedAt: string;
  status: 'pending' | 'checking' | 'need_review' | 'approved' | 'rejected';
  similarityScore?: number;
  autoCheckCompleted?: boolean;
  autoCheckResult?: 'pass' | 'warning' | 'fail';
}

const ReviewPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'checking' | 'need_review' | 'approved' | 'rejected'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects] = useState<Project[]>([
    {
      id: '1',
      studentName: 'Nguyễn Văn A',
      studentEmail: 'nguyenvana@student.com',
      title: 'Hệ thống quản lý thư viện',
      description: 'Xây dựng hệ thống quản lý thư viện sử dụng React và Node.js với đầy đủ các tính năng mượn, trả sách, quản lý độc giả.',
      category: 'Web Development',
      members: ['Nguyễn Văn A', 'Trần Văn B'],
      submittedAt: '2025-10-28',
      status: 'pending',
      autoCheckCompleted: false
    },
    {
      id: '2',
      studentName: 'Trần Thị B',
      studentEmail: 'tranthib@student.com',
      title: 'Website thương mại điện tử',
      description: 'Phát triển website bán hàng online với đầy đủ tính năng giỏ hàng, thanh toán',
      category: 'Web Development',
      members: ['Trần Thị B', 'Lê Thị C', 'Phạm Văn D'],
      submittedAt: '2025-10-29',
      status: 'checking',
      autoCheckCompleted: false
    },
    {
      id: '3',
      studentName: 'Lê Văn C',
      studentEmail: 'levanc@student.com',
      title: 'Ứng dụng chat realtime',
      description: 'Xây dựng ứng dụng chat realtime sử dụng WebSocket',
      category: 'Web Development',
      members: ['Lê Văn C'],
      submittedAt: '2025-10-30',
      status: 'need_review',
      similarityScore: 85,
      autoCheckCompleted: true,
      autoCheckResult: 'fail'
    },
    {
      id: '4',
      studentName: 'Phạm Thị D',
      studentEmail: 'phamthid@student.com',
      title: 'Ứng dụng quản lý công việc',
      description: 'Todo app với AI gợi ý ưu tiên công việc',
      category: 'AI/Machine Learning',
      members: ['Phạm Thị D', 'Hoàng Văn E'],
      submittedAt: '2025-10-31',
      status: 'need_review',
      similarityScore: 45,
      autoCheckCompleted: true,
      autoCheckResult: 'warning'
    },
    {
      id: '5',
      studentName: 'Võ Văn F',
      studentEmail: 'vovanf@student.com',
      title: 'App đặt lịch khám bệnh',
      description: 'Ứng dụng mobile giúp bệnh nhân đặt lịch khám bệnh trực tuyến',
      category: 'Mobile Development',
      members: ['Võ Văn F', 'Đặng Thị G'],
      submittedAt: '2025-10-27',
      status: 'need_review',
      similarityScore: 12,
      autoCheckCompleted: true,
      autoCheckResult: 'pass'
    },
    {
      id: '6',
      studentName: 'Hoàng Văn E',
      studentEmail: 'hoangvane@student.com',
      title: 'Website tin tức công nghệ',
      description: 'Portal tin tức với tính năng tìm kiếm, bình luận và đề xuất bài viết thông minh',
      category: 'Web Development',
      members: ['Hoàng Văn E'],
      submittedAt: '2025-10-26',
      status: 'approved',
      similarityScore: 8,
      autoCheckCompleted: true,
      autoCheckResult: 'pass'
    },
  ]);

  const filteredProjects = projects.filter(
    (p) => selectedStatus === 'all' || p.status === selectedStatus
  );

  const handleApprove = (projectId: string) => {
    console.log('Approved:', projectId);
    setSelectedProject(null);
  };

  const handleReject = (projectId: string) => {
    console.log('Rejected:', projectId);
    setSelectedProject(null);
  };

  const handleRunAutoCheck = (projectId: string) => {
    console.log('Running auto check for:', projectId);
  };

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Mới nộp', icon: '📝' },
      checking: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang check máy', icon: '⏳' },
      need_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ GV duyệt', icon: '👨‍🏫' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt', icon: '✅' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối', icon: '❌' },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getAutoCheckBadge = (result?: 'pass' | 'warning' | 'fail') => {
    if (!result) return null;
    
    const resultConfig = {
      pass: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đạt', icon: '✓' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cảnh báo', icon: '⚠' },
      fail: { bg: 'bg-red-100', text: 'text-red-800', label: 'Không đạt', icon: '✗' },
    };

    const config = resultConfig[result];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>Máy: {config.label}</span>
      </span>
    );
  };

  const getSimilarityColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score > 70) return 'text-red-600';
    if (score > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Duyệt đồ án - Hệ thống 2 bước
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            <span>⚙️</span>
            <span>Bước 1: Máy check tự động</span>
          </span>
          <span>→</span>
          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
            <span>👨‍🏫</span>
            <span>Bước 2: Giảng viên duyệt</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-gray-500">
          <p className="text-xs text-gray-500 mb-1">Mới nộp</p>
          <p className="text-2xl font-bold text-gray-600">{projects.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 mb-1">Check máy</p>
          <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'checking').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500 mb-1">Chờ GV</p>
          <p className="text-2xl font-bold text-yellow-600">{projects.filter(p => p.status === 'need_review').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
          <p className="text-xs text-gray-500 mb-1">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
          <p className="text-xs text-gray-500 mb-1">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">{projects.filter(p => p.status === 'rejected').length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-md text-white">
          <p className="text-xs text-orange-100 mb-1">Tổng</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'checking', 'need_review', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {status === 'all' && `Tất cả (${projects.length})`}
              {status === 'pending' && `Mới nộp (${projects.filter(p => p.status === 'pending').length})`}
              {status === 'checking' && `Đang check (${projects.filter(p => p.status === 'checking').length})`}
              {status === 'need_review' && `Chờ GV (${projects.filter(p => p.status === 'need_review').length})`}
              {status === 'approved' && `Đã duyệt (${projects.filter(p => p.status === 'approved').length})`}
              {status === 'rejected' && `Từ chối (${projects.filter(p => p.status === 'rejected').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
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
                {project.similarityScore !== undefined && (
                  <div className={`ml-4 flex flex-col items-center ${getSimilarityColor(project.similarityScore)}`}>
                    <div className="text-2xl font-bold">{project.similarityScore}%</div>
                    <div className="text-xs">Độ trùng</div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {project.studentName}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {project.members.length} thành viên
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {project.submittedAt}
                </div>
              </div>

              {/* Auto Check Status */}
              {project.status === 'checking' && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Đang kiểm tra tự động...</p>
                      <p className="text-xs text-blue-700">Phân tích độ trùng lặp và yêu cầu kỹ thuật</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto Check Result */}
              {project.autoCheckCompleted && project.autoCheckResult && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  project.autoCheckResult === 'pass' ? 'bg-green-50 border-green-200' :
                  project.autoCheckResult === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {project.autoCheckResult === 'pass' && '✅'}
                      {project.autoCheckResult === 'warning' && '⚠️'}
                      {project.autoCheckResult === 'fail' && '❌'}
                    </span>
                    <span className={`font-semibold text-sm ${
                      project.autoCheckResult === 'pass' ? 'text-green-900' :
                      project.autoCheckResult === 'warning' ? 'text-yellow-900' :
                      'text-red-900'
                    }`}>
                      Kết quả máy check: {
                        project.autoCheckResult === 'pass' ? 'Đạt yêu cầu' :
                        project.autoCheckResult === 'warning' ? 'Cảnh báo' :
                        'Không đạt'
                      }
                    </span>
                  </div>
                  <p className={`text-xs ${
                    project.autoCheckResult === 'pass' ? 'text-green-800' :
                    project.autoCheckResult === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {project.autoCheckResult === 'pass' && `Độ trùng ${project.similarityScore}% - An toàn, có thể duyệt`}
                    {project.autoCheckResult === 'warning' && `Độ trùng ${project.similarityScore}% - Cần giảng viên xem xét kỹ`}
                    {project.autoCheckResult === 'fail' && `Độ trùng ${project.similarityScore}% - Quá cao, khuyến nghị từ chối`}
                  </p>
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {getStatusBadge(project.status)}
                  {project.autoCheckCompleted && getAutoCheckBadge(project.autoCheckResult)}
                </div>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  Chi tiết →
                </button>
              </div>

              {/* Action Buttons */}
              {project.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRunAutoCheck(project.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <span>⚙️</span>
                    <span>Chạy kiểm tra tự động</span>
                  </button>
                </div>
              )}

              {project.status === 'need_review' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(project.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(project.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không có đồ án nào</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedProject.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(selectedProject.status)}
                    {selectedProject.autoCheckCompleted && getAutoCheckBadge(selectedProject.autoCheckResult)}
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
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-700">{selectedProject.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thành viên</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.members.map((member, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProject.autoCheckCompleted && selectedProject.similarityScore !== undefined && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Kết quả kiểm tra tự động</h3>
                  <div className={`p-4 rounded-lg ${
                    selectedProject.autoCheckResult === 'pass' ? 'bg-green-50' :
                    selectedProject.autoCheckResult === 'warning' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Độ trùng lặp</span>
                      <span className={`text-2xl font-bold ${getSimilarityColor(selectedProject.similarityScore)}`}>
                        {selectedProject.similarityScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedProject.similarityScore > 70 ? 'bg-red-500' :
                          selectedProject.similarityScore > 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${selectedProject.similarityScore}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedProject.autoCheckResult === 'pass' && '✅ Độ trùng thấp, đề tài an toàn'}
                      {selectedProject.autoCheckResult === 'warning' && '⚠️ Độ trùng trung bình, cần xem xét thêm'}
                      {selectedProject.autoCheckResult === 'fail' && '❌ Độ trùng cao, có dấu hiệu đạo văn'}
                    </p>
                  </div>
                </div>
              )}

              {selectedProject.status === 'need_review' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedProject.id)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Duyệt đồ án
                  </button>
                  <button
                    onClick={() => handleReject(selectedProject.id)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
