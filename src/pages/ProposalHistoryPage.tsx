import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProposalHistory, getProposalById } from '@/services/api';
import type { ProposalHistoryEntry, CapstoneProposalResponse } from '@/interfaces';
import ProposalComparisonModal from '@/components/ProposalComparisonModal';

const ProposalHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ProposalHistoryEntry[]>([]);
  const [currentProposal, setCurrentProposal] = useState<CapstoneProposalResponse | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ProposalHistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    current: ProposalHistoryEntry | null;
    duplicate: CapstoneProposalResponse | null;
    distance: number;
  }>({ current: null, duplicate: null, distance: 0 });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const proposalId = parseInt(id, 10);
      const [historyData, proposalData] = await Promise.all([
        getProposalHistory(proposalId),
        getProposalById(proposalId),
      ]);
      
      setHistory(historyData);
      setCurrentProposal(proposalData);
      
      // Tự động chọn version đầu tiên (mới nhất)
      if (historyData.length > 0) {
        setSelectedVersion(historyData[0]);
      }
    } catch (err: any) {
      console.error('Error fetching proposal history:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Parse duplicate ID từ reason field
  const parseDuplicateInfo = (reason: string) => {
    // Format: "Proposal bị trùng lặp với proposal ID: 3"
    const match = reason.match(/ID:\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Handle so sánh proposal
  const handleCompare = async (entry: ProposalHistoryEntry) => {
    if (!entry.reason) return;
    
    const duplicateId = parseDuplicateInfo(entry.reason);
    if (!duplicateId) return;

    try {
      const duplicateProposal = await getProposalById(duplicateId);
      setComparisonData({
        current: entry,
        duplicate: duplicateProposal,
        distance: 0, // Sẽ tính từ reason nếu có
      });
      setShowComparisonModal(true);
    } catch (error) {
      console.error('Error fetching duplicate proposal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/resources')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Quay lại trang chính
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/resources')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">📜 Lịch sử cập nhật Proposal</h1>
                {currentProposal && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{currentProposal.title}</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {history.length} version{history.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex h-[calc(100vh-144px)]">
          {/* Sidebar - Version List */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Danh sách phiên bản
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm">Chưa có lịch sử nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedVersion(entry)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedVersion?.id === entry.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedVersion?.id === entry.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm mb-1 truncate ${
                          selectedVersion?.id === entry.id ? 'text-orange-900' : 'text-gray-900'
                        }`}>
                          Version {index + 1}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatDateShort(entry.createdAt)}
                        </p>
                        {entry.reason && parseDuplicateInfo(entry.reason) && (
                          <div className="space-y-2 mt-2">
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              <span>⚠️</span>
                              <span>Trùng lặp</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompare(entry);
                              }}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>So sánh</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {selectedVersion?.id === entry.id && (
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Version Detail */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedVersion ? (
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Version Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-bold">
                      Version {history.findIndex(h => h.id === selectedVersion.id) + 1}
                    </h2>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                      {formatDate(selectedVersion.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{selectedVersion.title}</h3>
                  {selectedVersion.reason && (
                    <div className="mt-4 p-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-200">⚠️</span>
                        <div>
                          <p className="font-semibold text-yellow-100 text-sm">Lý do thay đổi:</p>
                          <p className="text-white/90 text-sm mt-1">{selectedVersion.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Version Content */}
                <div className="p-6 space-y-6">
                  {/* Context */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📋</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Bối cảnh</h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{selectedVersion.context}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📝</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Mô tả giải pháp</h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{selectedVersion.description}</p>
                    </div>
                  </div>

                  {/* Functional Requirements */}
                  {selectedVersion.func && selectedVersion.func.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">⚙️</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Yêu cầu chức năng ({selectedVersion.func.length})
                        </h4>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ul className="space-y-2">
                          {selectedVersion.func.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-gray-700 flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Non-Functional Requirements */}
                  {selectedVersion.nonFunc && selectedVersion.nonFunc.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">⚡</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Yêu cầu phi chức năng ({selectedVersion.nonFunc.length})
                        </h4>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ul className="space-y-2">
                          {selectedVersion.nonFunc.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-gray-700 flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Attachment */}
                  {selectedVersion.attachmentUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📎</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">File đính kèm</h4>
                      </div>
                      <a
                        href={selectedVersion.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700 font-medium">Tải xuống file đính kèm</span>
                      </a>
                    </div>
                  )}

                  {/* Current Proposal Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900 mb-1">Thông tin Proposal hiện tại</h5>
                          <div className="text-sm text-blue-700 space-y-1">
                            <p><strong>Trạng thái:</strong> {selectedVersion.capstoneProposal.status}</p>
                            <p><strong>Học kỳ:</strong> {selectedVersion.capstoneProposal.semester.name} ({selectedVersion.capstoneProposal.semester.semesterCode})</p>
                            <p><strong>Cập nhật lần cuối:</strong> {formatDate(selectedVersion.capstoneProposal.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-500 text-lg">Chọn một version để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Proposal Comparison Modal */}
      <ProposalComparisonModal
        isOpen={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setComparisonData({ current: null, duplicate: null, distance: 0 });
        }}
        currentProposal={
          comparisonData.current
            ? {
                title: comparisonData.current.title,
                context: comparisonData.current.context,
                description: comparisonData.current.description,
                func: comparisonData.current.func,
                nonFunc: comparisonData.current.nonFunc,
              }
            : {
                title: '',
                context: '',
                description: '',
                func: [],
                nonFunc: [],
              }
        }
        duplicateProposal={comparisonData.duplicate}
        currentProposalId={comparisonData.current?.capstoneProposal?.id ?? undefined}
        semanticDistance={comparisonData.distance}
        showUploadAgainButton={false}
      />
    </div>
  );
};

export default ProposalHistoryPage;
