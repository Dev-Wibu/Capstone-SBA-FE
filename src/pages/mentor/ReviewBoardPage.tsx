import { useState, useEffect } from 'react';
import type { CapstoneProposalResponse, Semester } from '@/interfaces';
import { getAllProposals, getSemesters } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ReviewBoardPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<CapstoneProposalResponse[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<CapstoneProposalResponse | null>(null);
  const [isReviewerMember, setIsReviewerMember] = useState(false);
  const [reviewerPosition, setReviewerPosition] = useState<1 | 2 | 3 | 4 | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch semester và proposals
      const [semestersData, proposalsData] = await Promise.all([
        getSemesters(),
        getAllProposals()
      ]);

      // Tìm semester hiện tại
      const current = semestersData.find(s => s.current === true);
      setCurrentSemester(current || null);

      // Kiểm tra xem user có trong hội đồng không
      if (current && user?.lecturerCode) {
        const lecturerCode = user.lecturerCode;
        let position: 1 | 2 | 3 | 4 | null = null;
        
        if (current.reviewerCode1 === lecturerCode) position = 1;
        else if (current.reviewerCode2 === lecturerCode) position = 2;
        else if (current.reviewerCode3 === lecturerCode) position = 3;
        else if (current.reviewerCode4 === lecturerCode) position = 4;

        setIsReviewerMember(position !== null);
        setReviewerPosition(position);

        // Nếu là reviewer, filter proposals thuộc semester hiện tại
        if (position !== null) {
          const filtered = proposalsData.filter(p => 
            p.semester?.id === current.id && 
            p.status === 'DUPLICATE_ACCEPTED' // Chỉ hiển thị proposals đã qua kiểm tra trùng
          );
          setProposals(filtered);
        }
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: number) => {
    if (!reviewerPosition) return;
    
    try {
      // TODO: Call API to approve proposal
      // API endpoint: PUT /api/capstone-proposal/review/approve
      // Body: { proposalId, reviewerPosition }
      console.log('Approving proposal:', proposalId, 'as reviewer', reviewerPosition);
      toast.success('Duyệt đề tài thành công!');
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error('Lỗi khi duyệt đề tài', {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleReject = async (proposalId: number, reason: string) => {
    if (!reviewerPosition) return;
    
    try {
      // TODO: Call API to reject proposal
      // API endpoint: PUT /api/capstone-proposal/review/reject
      // Body: { proposalId, reviewerPosition, reason }
      console.log('Rejecting proposal:', proposalId, 'as reviewer', reviewerPosition, 'reason:', reason);
      toast.success('Từ chối đề tài thành công!');
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error('Lỗi khi từ chối đề tài', {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  // Helper: Get students list
  const getStudentsList = (proposal: CapstoneProposalResponse): string[] => {
    const students: string[] = [];
    if (proposal.students) {
      if (proposal.students.student1Name) students.push(proposal.students.student1Name);
      if (proposal.students.student2Name) students.push(proposal.students.student2Name);
      if (proposal.students.student3Name) students.push(proposal.students.student3Name);
      if (proposal.students.student4Name) students.push(proposal.students.student4Name);
      if (proposal.students.student5Name) students.push(proposal.students.student5Name);
      if (proposal.students.student6Name) students.push(proposal.students.student6Name);
    }
    return students;
  };

  // Helper: Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Helper: Check if already approved/rejected by current reviewer
  const getReviewStatus = (proposal: CapstoneProposalResponse) => {
    if (!reviewerPosition) return null;
    
    switch (reviewerPosition) {
      case 1:
        return proposal.isReviewerApprove1;
      case 2:
        return proposal.isReviewerApprove2;
      case 3:
        return proposal.isReviewerApprove3;
      case 4:
        return proposal.isReviewerApprove4;
      default:
        return null;
    }
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

  if (!isReviewerMember) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600">
            Bạn không thuộc hội đồng duyệt đồ án của học kỳ hiện tại.
          </p>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hội đồng duyệt đồ án
            </h1>
            <p className="text-gray-600 mt-1">
              Bạn là thành viên {reviewerPosition} của hội đồng
            </p>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg">
            <div className="text-sm">Học kỳ hiện tại</div>
            <div className="font-bold">{currentSemester?.name}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-sm text-blue-100 mb-2">Tổng đề tài</p>
          <p className="text-4xl font-bold">{proposals.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-sm text-green-100 mb-2">Đã duyệt</p>
          <p className="text-4xl font-bold">
            {proposals.filter(p => getReviewStatus(p) === true).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-sm text-red-100 mb-2">Đã từ chối</p>
          <p className="text-4xl font-bold">
            {proposals.filter(p => getReviewStatus(p) === false).length}
          </p>
        </div>
      </div>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg font-medium mb-2">Chưa có đề tài nào</p>
          <p className="text-gray-400 text-sm">Các đề tài sẽ xuất hiện sau khi qua kiểm tra trùng lặp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposals.map((proposal) => {
            const students = getStudentsList(proposal);
            const reviewStatus = getReviewStatus(proposal);

            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-t-4 ${
                  reviewStatus === true ? 'border-green-500' :
                  reviewStatus === false ? 'border-red-500' :
                  'border-orange-500'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {proposal.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {proposal.description}
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
                      {formatDate(proposal.createdAt)}
                    </div>
                  </div>

                  {/* Review Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                    {reviewStatus === null ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span>⏳</span>
                        <span>Chờ duyệt</span>
                      </span>
                    ) : reviewStatus === true ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span>✅</span>
                        <span>Đã duyệt</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span>❌</span>
                        <span>Đã từ chối</span>
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Chi tiết →
                    </button>
                  </div>

                  {/* Action Buttons - Only show if not reviewed yet */}
                  {reviewStatus === null && (
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(proposal.id!)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Duyệt</span>
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Lý do từ chối:');
                          if (reason) handleReject(proposal.id!, reason);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <span>✕</span>
                        <span>Từ chối</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedProposal.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProposal(null)}
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
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProposal.context}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  <span>Mô tả chi tiết</span>
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProposal.description}</p>
              </div>

              {/* Functional Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Yêu cầu chức năng ({selectedProposal.func.length})</span>
                </h3>
                <ul className="space-y-2">
                  {selectedProposal.func.map((item, idx) => (
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
                  <span>Yêu cầu phi chức năng ({selectedProposal.nonFunc.length})</span>
                </h3>
                <ul className="space-y-2">
                  {selectedProposal.nonFunc.map((item, idx) => (
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
                  {getStudentsList(selectedProposal).map((student, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{student}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewBoardPage;
