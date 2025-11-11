import type { CapstoneProposalResponse, Lecturer } from '@/interfaces';
import { useEffect, useState } from 'react';
import { getLecturerByCode, getLecturers, checkDuplicateProposal, getProposalById } from '@/services/api';
import ScheduleReviewModal from '@/components/ScheduleReviewModal';
import ProposalComparisonModal from '@/components/ProposalComparisonModal';
import { exportProposalToDocx } from '@/utils/exportDocx';
import { useAuth } from '@/contexts/AuthContext';

interface ProposalDetailModalProps {
  proposal: CapstoneProposalResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadAgain?: (proposal: CapstoneProposalResponse) => void;
  onRefresh?: () => void;
}

const ProposalDetailModal = ({ proposal, isOpen, onClose, onUploadAgain, onRefresh }: ProposalDetailModalProps) => {
  const { user } = useAuth();
  const [reviewer1Info, setReviewer1Info] = useState<Lecturer | null>(null);
  const [reviewer2Info, setReviewer2Info] = useState<Lecturer | null>(null);
  const [reviewer3Info, setReviewer3Info] = useState<Lecturer | null>(null);
  const [reviewer4Info, setReviewer4Info] = useState<Lecturer | null>(null);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleReviewTime, setScheduleReviewTime] = useState<1 | 2 | 3>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [allLecturers, setAllLecturers] = useState<Lecturer[]>([]);
  
  // Thêm state cho duplicate check
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<{
    distance: number;
    closestId: string;
    duplicate: boolean;
    percentage: number;
  } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [compareProposal, setCompareProposal] = useState<CapstoneProposalResponse | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  
  // Thêm state cho mentor
  const [mentor1Info, setMentor1Info] = useState<Lecturer | null>(null);
  const [mentor2Info, setMentor2Info] = useState<Lecturer | null>(null);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const handleExportDocx = async () => {
    if (!proposal) return;
    try {
      setIsExporting(true);
      await exportProposalToDocx(proposal, allLecturers);
    } catch (error) {
      alert('Có lỗi khi xuất file Word. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!proposal || !proposal.id) return;
    try {
      setIsCheckingDuplicate(true);
      const result = await checkDuplicateProposal(proposal.id);
      
      // Tính % trùng lặp từ L2 distance
      // Công thức: Tương đồng = 1 - (Distance² / 2)
      const cosineSimilarity = 1 - (Math.pow(result.distance, 2) / 2);
      // Chuyển sang % và làm tròn 1 chữ số
      const percentage = Math.max(0, Math.min(100, Math.round(cosineSimilarity * 1000) / 10));
      
      setDuplicateResult({
        ...result,
        percentage
      });
      setShowDuplicateModal(true);
    } catch (error) {
      alert('Có lỗi khi kiểm tra trùng lặp. Vui lòng thử lại.');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleViewComparison = async () => {
    if (!duplicateResult) return;
    try {
      setIsLoadingCompare(true);
      const closestProposal = await getProposalById(Number(duplicateResult.closestId));
      setCompareProposal(closestProposal);
      setShowDuplicateModal(false);
      setShowComparisonModal(true);
    } catch (error) {
      alert('Có lỗi khi tải thông tin đề tài để so sánh.');
    } finally {
      setIsLoadingCompare(false);
    }
  };

  useEffect(() => {
    const fetchReviewers = async () => {
      if (!proposal || !isOpen || !proposal.semester) return;
      setLoadingReviewers(true);
      try {
        const promises: Promise<void>[] = [];
        
        // Fetch 4 reviewers từ semester (hội đồng duyệt)
        if (proposal.semester.reviewerCode1) {
          promises.push(
            getLecturerByCode(proposal.semester.reviewerCode1)
              .then(data => setReviewer1Info(data))
              .catch(() => setReviewer1Info(null))
          );
        } else {
          setReviewer1Info(null);
        }
        
        if (proposal.semester.reviewerCode2) {
          promises.push(
            getLecturerByCode(proposal.semester.reviewerCode2)
              .then(data => setReviewer2Info(data))
              .catch(() => setReviewer2Info(null))
          );
        } else {
          setReviewer2Info(null);
        }
        
        if (proposal.semester.reviewerCode3) {
          promises.push(
            getLecturerByCode(proposal.semester.reviewerCode3)
              .then(data => setReviewer3Info(data))
              .catch(() => setReviewer3Info(null))
          );
        } else {
          setReviewer3Info(null);
        }
        
        if (proposal.semester.reviewerCode4) {
          promises.push(
            getLecturerByCode(proposal.semester.reviewerCode4)
              .then(data => setReviewer4Info(data))
              .catch(() => setReviewer4Info(null))
          );
        } else {
          setReviewer4Info(null);
        }
        
        await Promise.all(promises);
      } finally {
        setLoadingReviewers(false);
      }
    };
    fetchReviewers();
  }, [proposal, isOpen]);

  // Fetch thông tin mentor dựa trên lecturerCode
  useEffect(() => {
    const fetchMentors = async () => {
      if (!proposal || !isOpen) return;
      setLoadingMentors(true);
      try {
        // Lấy tất cả lecturers
        const lecturersList = await getLecturers();
        setAllLecturers(lecturersList);
        
        // Tìm mentor 1 theo lecturerCode1
        if (proposal.lecturerCode1) {
          const mentor1 = lecturersList.find(l => l.lecturerCode === proposal.lecturerCode1);
          setMentor1Info(mentor1 || null);
        } else {
          setMentor1Info(null);
        }
        
        // Tìm mentor 2 theo lecturerCode2
        if (proposal.lecturerCode2) {
          const mentor2 = lecturersList.find(l => l.lecturerCode === proposal.lecturerCode2);
          setMentor2Info(mentor2 || null);
        } else {
          setMentor2Info(null);
        }
      } catch (error) {
        setMentor1Info(null);
        setMentor2Info(null);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, [proposal, isOpen]);

  if (!isOpen || !proposal) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã nộp', icon: '📄' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã duyệt', icon: '✅' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối', icon: '❌' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xử lý', icon: '⏳' },
      DUPLICATE_REJECTED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Trùng lặp - Từ chối', icon: '⚠️' },
      DUPLICATE_ACCEPTED: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Trùng lặp - Chấp nhận', icon: '✓' },
      REJECT_BY_ADMIN: { bg: 'bg-red-100', text: 'text-red-700', label: 'Admin từ chối', icon: '🚫' },
      REVIEW_1: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Review 1', icon: '👤' },
      REVIEW_2: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Review 2', icon: '👥' },
      REVIEW_3: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Review 3', icon: '👥' },
      DEFENSE: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Bảo vệ', icon: '🏛️' },
      SECOND_DEFENSE: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Bảo vệ lần 2', icon: '🏛️' },
      COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoàn thành', icon: '🎉' },
      FAILED: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Thất bại', icon: '💥' },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const config = getStatusConfig(proposal.status);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {proposal.title}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                  {config.icon} {config.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {proposal.semester ? `${proposal.semester.name} - ${proposal.semester.semesterCode}` : 'Chưa có học kỳ'}
                </span>
                <span>ID: #{proposal.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Nút Check Duplicate */}
              <button
                onClick={handleCheckDuplicate}
                disabled={isCheckingDuplicate}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Kiểm tra trùng lặp"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {isCheckingDuplicate ? 'Đang kiểm tra...' : 'Check Duplicate'}
              </button>
              {/* Nút Close */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mentor chính và phụ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mentor chính */}
            {proposal.lecturerCode1 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mentor chính
                </h3>
                {loadingMentors ? (
                  <p className="text-gray-600 text-sm">Đang tải...</p>
                ) : mentor1Info ? (
                  <div>
                    <p className="text-gray-900 font-medium">{mentor1Info.fullName}</p>
                    <p className="text-gray-600 text-sm">Mã: {proposal.lecturerCode1}</p>
                  </div>
                ) : (
                  <p className="text-gray-800">
                    Mã giảng viên: <span className="font-medium">{proposal.lecturerCode1}</span>
                  </p>
                )}
              </div>
            )}
            
            {/* Mentor phụ */}
            {proposal.lecturerCode2 && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A3 3 0 017 17h10a3 3 0 012.879 2.804L20 20H4l1.121-2.196zM15 11a3 3 0 10-6 0 3 3 0 006 0zm6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Mentor phụ
                </h3>
                {loadingMentors ? (
                  <p className="text-gray-600 text-sm">Đang tải...</p>
                ) : mentor2Info ? (
                  <div>
                    <p className="text-gray-900 font-medium">{mentor2Info.fullName}</p>
                    <p className="text-gray-600 text-sm">Mã: {proposal.lecturerCode2}</p>
                  </div>
                ) : (
                  <p className="text-gray-800">
                    Mã giảng viên: <span className="font-medium">{proposal.lecturerCode2}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Lịch review (chỉ hiện nếu có ít nhất một mốc) */}
          {(proposal.review1At || proposal.review2At || proposal.review3At) && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Lịch review
              </h3>
              <div className="space-y-3">
                {proposal.review1At && (
                  <div className="bg-white border border-indigo-100 p-3 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-indigo-700 font-semibold mb-1">Review 1</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(proposal.review1At)}</p>
                      </div>
                    </div>
                    {/* Hiển thị cả 2 reviewer cho Review 1 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proposal.reviewer.reviewer1Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer1Name} ({proposal.reviewer.reviewer1Code})
                        </div>
                      )}
                      {proposal.reviewer.reviewer2Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer2Name} ({proposal.reviewer.reviewer2Code})
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {proposal.review2At && (
                  <div className="bg-white border border-indigo-100 p-3 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-indigo-700 font-semibold mb-1">Review 2</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(proposal.review2At)}</p>
                      </div>
                    </div>
                    {/* Hiển thị cả 2 reviewer cho Review 2 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proposal.reviewer.reviewer3Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer3Name} ({proposal.reviewer.reviewer3Code})
                        </div>
                      )}
                      {proposal.reviewer.reviewer4Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer4Name} ({proposal.reviewer.reviewer4Code})
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {proposal.review3At && (
                  <div className="bg-white border border-indigo-100 p-3 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-indigo-700 font-semibold mb-1">Review 3</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(proposal.review3At)}</p>
                      </div>
                    </div>
                    {/* Hiển thị cả 2 reviewer cho Review 3 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proposal.reviewer.reviewer5Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer5Name} ({proposal.reviewer.reviewer5Code})
                        </div>
                      )}
                      {proposal.reviewer.reviewer6Code && (
                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          Mentor: {proposal.reviewer.reviewer6Name} ({proposal.reviewer.reviewer6Code})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Bối cảnh */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bối cảnh
            </h3>
            <p className="text-gray-700">{proposal.context}</p>
          </div>

          {/* Mô tả giải pháp */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Mô tả giải pháp
            </h3>
            <p className="text-gray-700">{proposal.description}</p>
          </div>

          {/* Sinh viên */}
          {proposal.students && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Sinh viên
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {proposal.students.student1Id && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Sinh viên 1</p>
                    <p className="text-sm font-medium text-gray-900">{proposal.students.student1Name}</p>
                    <p className="text-xs text-gray-600">{proposal.students.student1Id}</p>
                  </div>
                )}
                {proposal.students.student2Id && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Sinh viên 2</p>
                    <p className="text-sm font-medium text-gray-900">{proposal.students.student2Name}</p>
                    <p className="text-xs text-gray-600">{proposal.students.student2Id}</p>
                  </div>
                )}
                {proposal.students.student3Id && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Sinh viên 3</p>
                    <p className="text-sm font-medium text-gray-900">{proposal.students.student3Name}</p>
                    <p className="text-xs text-gray-600">{proposal.students.student3Id}</p>
                  </div>
                )}
                {proposal.students.student4Id && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Sinh viên 4</p>
                    <p className="text-sm font-medium text-gray-900">{proposal.students.student4Name}</p>
                    <p className="text-xs text-gray-600">{proposal.students.student4Id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Yêu cầu chức năng */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Yêu cầu chức năng ({proposal.func.length})
            </h3>
            <ul className="space-y-2">
              {proposal.func.map((item, index) => (
                <li key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Yêu cầu phi chức năng */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Yêu cầu phi chức năng ({proposal.nonFunc.length})
            </h3>
            <ul className="space-y-2">
              {proposal.nonFunc.map((item, index) => (
                <li key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Attachment */}
          {proposal.attachmentUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                File đính kèm
              </h3>
              <a
                href={proposal.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                {proposal.attachmentUrl}
              </a>
            </div>
          )}

          {/* Thông tin hội đồng duyệt (hiển thị người đã duyệt và từ chối) */}
          {proposal.semester && (
            (proposal.isReviewerApprove1 !== null && proposal.semester.reviewerCode1) ||
            (proposal.isReviewerApprove2 !== null && proposal.semester.reviewerCode2) ||
            (proposal.isReviewerApprove3 !== null && proposal.semester.reviewerCode3) ||
            (proposal.isReviewerApprove4 !== null && proposal.semester.reviewerCode4)
          ) && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Hội đồng duyệt</h3>
              <div className="flex flex-wrap gap-2">
                {proposal.isReviewerApprove1 === true && proposal.semester.reviewerCode1 && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                      <span>✅</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer1Info ? (
                        <span>{reviewer1Info.fullName} ({reviewer1Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode1})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove1 === false && proposal.semester.reviewerCode1 && (
                  <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                      <span>❌</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer1Info ? (
                        <span>{reviewer1Info.fullName} ({reviewer1Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode1})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove2 === true && proposal.semester.reviewerCode2 && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                      <span>✅</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer2Info ? (
                        <span>{reviewer2Info.fullName} ({reviewer2Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode2})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove2 === false && proposal.semester.reviewerCode2 && (
                  <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                      <span>❌</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer2Info ? (
                        <span>{reviewer2Info.fullName} ({reviewer2Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode2})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove3 === true && proposal.semester.reviewerCode3 && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                      <span>✅</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer3Info ? (
                        <span>{reviewer3Info.fullName} ({reviewer3Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode3})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove3 === false && proposal.semester.reviewerCode3 && (
                  <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                      <span>❌</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer3Info ? (
                        <span>{reviewer3Info.fullName} ({reviewer3Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode3})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove4 === true && proposal.semester.reviewerCode4 && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                      <span>✅</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer4Info ? (
                        <span>{reviewer4Info.fullName} ({reviewer4Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode4})</span>
                      )}
                    </p>
                  </div>
                )}
                {proposal.isReviewerApprove4 === false && proposal.semester.reviewerCode4 && (
                  <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                      <span>❌</span>
                      {loadingReviewers ? (
                        <span>Đang tải...</span>
                      ) : reviewer4Info ? (
                        <span>{reviewer4Info.fullName} ({reviewer4Info.lecturerCode})</span>
                      ) : (
                        <span>({proposal.semester.reviewerCode4})</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nút xếp lịch nếu đang ở status REVIEW_X mà chưa có reviewXAt (chỉ hiện cho admin) */}
          {user?.role !== 'MENTOR' && (
            <div className="pt-4">
              {proposal.status === 'REVIEW_1' && !proposal.review1At && (
                <button
                  onClick={() => { setScheduleReviewTime(1); setShowScheduleModal(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Xếp lịch Review 1
                </button>
              )}
              {proposal.status === 'REVIEW_2' && !proposal.review2At && (
                <button
                  onClick={() => { setScheduleReviewTime(2); setShowScheduleModal(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Xếp lịch Review 2
                </button>
              )}
              {proposal.status === 'REVIEW_3' && !proposal.review3At && (
                <button
                  onClick={() => { setScheduleReviewTime(3); setShowScheduleModal(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Xếp lịch Review 3
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
          <div className="flex gap-3">
            {onUploadAgain && (proposal.status === 'SUBMITTED' || proposal.status === 'DUPLICATE_REJECTED') && (
              <button
                onClick={() => {
                  onUploadAgain(proposal);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload lại
              </button>
            )}
            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Đang xuất...' : 'Xuất Word'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Modal hiển thị kết quả duplicate */}
      {showDuplicateModal && duplicateResult && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Kết quả kiểm tra trùng lặp
            </h3>
            
            <div className="space-y-4">
              {/* Trạng thái duplicate */}
              <div className={`p-4 rounded-lg border-2 ${duplicateResult.duplicate ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {duplicateResult.duplicate ? (
                    <>
                      <span className="text-2xl">⚠️</span>
                      <span className="font-bold text-red-700">Phát hiện trùng lặp!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">✅</span>
                      <span className="font-bold text-green-700">Không trùng lặp</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {duplicateResult.duplicate 
                    ? 'Đề tài này có nội dung trùng lặp với đề tài khác trong hệ thống.'
                    : 'Đề tài này không trùng lặp với các đề tài khác.'}
                </p>
              </div>

              {/* Thông tin chi tiết */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Độ tương đồng:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          duplicateResult.percentage > 70 ? 'bg-red-500' : 
                          duplicateResult.percentage > 40 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${duplicateResult.percentage}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      {duplicateResult.percentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Đề tài gần nhất:</p>
                  <p className="font-semibold text-gray-900">ID #{duplicateResult.closestId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Distance score:</p>
                  <p className="font-mono text-sm text-gray-700">{duplicateResult.distance.toFixed(4)}</p>
                </div>
              </div>

              {/* Nút xem so sánh */}
              <button
                onClick={handleViewComparison}
                disabled={isLoadingCompare}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingCompare ? 'Đang tải...' : 'Xem so sánh chi tiết'}
              </button>
            </div>

            {/* Nút đóng */}
            <button
              onClick={() => setShowDuplicateModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal so sánh proposal */}
      {proposal && (
        <ProposalComparisonModal
          isOpen={showComparisonModal}
          onClose={() => {
            setShowComparisonModal(false);
            setCompareProposal(null);
          }}
          currentProposal={{
            title: proposal.title,
            context: proposal.context,
            description: proposal.description,
            func: proposal.func,
            nonFunc: proposal.nonFunc,
          }}
          duplicateProposal={compareProposal}
          currentProposalId={proposal.id}
          semanticDistance={duplicateResult?.distance || 0}
          showUploadAgainButton={false}
        />
      )}

      {/* Modal xếp lịch */}
      <ScheduleReviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        proposalId={proposal.id as number}
        reviewTime={scheduleReviewTime}
        excludeCodes={[proposal.lecturerCode1 || '', proposal.lecturerCode2 || ''].filter(Boolean) as string[]}
        reviewer={proposal.reviewer || undefined}
        onSuccess={() => {
          // Sau khi xếp lịch thành công, refresh data và đóng modal
          setShowScheduleModal(false);
          if (onRefresh) {
            onRefresh();
          }
          onClose();
        }}
      />
    </div>
  );
};

export default ProposalDetailModal;
