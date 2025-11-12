import { useState, useEffect } from 'react';
import type { CapstoneProposalResponse, Semester } from '@/interfaces';
import { getAllProposals, getSemesters, reviewProposal } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProposalDetailModal from '@/components/ProposalDetailModal';

const ReviewBoardPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<CapstoneProposalResponse[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<CapstoneProposalResponse[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<CapstoneProposalResponse | null>(null);
  const [isReviewerMember, setIsReviewerMember] = useState(false);
  const [reviewerPosition, setReviewerPosition] = useState<1 | 2 | 3 | 4 | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  
  // State cho reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectProposalId, setRejectProposalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

        if (position !== null) {
          const filtered = proposalsData.filter(p => {
            if (p.semester?.id !== current.id) {
              return false;
            }
            
            const validStatuses = ['DUPLICATE_ACCEPTED', 'REVIEW_1', 'REVIEW_2', 'REVIEW_3', 'DEFENSE', 'SECOND_DEFENSE', 'COMPLETED'];
            if (!validStatuses.includes(p.status)) {
              return false;
            }
            
            return true;
          });
          
          setProposals(filtered);
        }
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter proposals based on status
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredProposals(proposals);
    } else if (filterStatus === 'pending') {
      setFilteredProposals(proposals.filter(p => getReviewStatus(p) === null));
    } else if (filterStatus === 'approved') {
      // Chỉ hiển thị những proposal mà user đã approve (true), không hiển thị từ chối (false)
      setFilteredProposals(proposals.filter(p => getReviewStatus(p) === true));
    }
  }, [proposals, filterStatus, reviewerPosition]);

  const handleApprove = async (proposalId: number) => {
    if (!reviewerPosition || !user?.lecturerCode) return;
    
    try {
      await reviewProposal(proposalId, true, user.lecturerCode, 'accepted');
      toast.success('Đã gửi quyết định duyệt đề tài!');
      // Đợi 500ms rồi mới refresh để backend kịp cập nhật
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (err: any) {
      toast.error('Lỗi khi duyệt đề tài', {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleReject = (proposalId: number) => {
    setRejectProposalId(proposalId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectProposalId || !reviewerPosition || !user?.lecturerCode) return;
    
    if (!rejectReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      await reviewProposal(rejectProposalId, false, user.lecturerCode, rejectReason);
      toast.success('Đã gửi quyết định từ chối đề tài!');
      setShowRejectModal(false);
      setRejectProposalId(null);
      setRejectReason('');
      // Đợi 500ms rồi mới refresh để backend kịp cập nhật
      setTimeout(() => {
        fetchData();
      }, 500);
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
    
    // Check approval status based on reviewer position in the council
    if (reviewerPosition === 1) return proposal.isReviewerApprove1;
    if (reviewerPosition === 2) return proposal.isReviewerApprove2;
    if (reviewerPosition === 3) return proposal.isReviewerApprove3;
    if (reviewerPosition === 4) return proposal.isReviewerApprove4;
    
    return null;
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

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả ({proposals.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chờ duyệt ({proposals.filter(p => getReviewStatus(p) === null).length})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đã duyệt ({proposals.filter(p => getReviewStatus(p) === true).length})
        </button>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {filterStatus === 'all' ? 'Chưa có đề tài nào' : 
             filterStatus === 'pending' ? 'Không có đề tài chờ duyệt' :
             'Chưa có đề tài đã duyệt'}
          </p>
          <p className="text-gray-400 text-sm">
            {filterStatus === 'all' && 'Các đề tài sẽ xuất hiện sau khi qua kiểm tra trùng lặp'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProposals.map((proposal) => {
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
                      {proposal.code && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-mono font-semibold mb-2 inline-block">
                          {proposal.code}
                        </span>
                      )}
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

                  {/* Action Buttons - Only show if not reviewed yet AND less than 2 reviewers */}
                  {(() => {
                    // Đếm số người đã review (khác null)
                    const reviewCount = [
                      proposal.isReviewerApprove1,
                      proposal.isReviewerApprove2,
                      proposal.isReviewerApprove3,
                      proposal.isReviewerApprove4
                    ].filter(status => status !== null).length;
                    
                    // Chỉ hiển thị nút nếu: chưa review VÀ chưa đủ 2 người review
                    return reviewStatus === null && reviewCount < 2 && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApprove(proposal.id!)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(proposal.id!)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          Từ chối
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ProposalDetailModal */}
      <ProposalDetailModal
        proposal={selectedProposal}
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        onRefresh={fetchData}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối đề tài</h3>
            <p className="text-gray-600 mb-4">Vui lòng nhập lý do từ chối đề tài này:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              autoFocus
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectProposalId(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewBoardPage;
