import { useEffect, useState } from 'react';
import { getProposalHistory } from '@/services/api';
import type { ProposalHistoryEntry } from '@/interfaces';

interface ProposalHistoryModalProps {
  proposalId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProposalHistoryModal = ({ proposalId, isOpen, onClose }: ProposalHistoryModalProps) => {
  const [history, setHistory] = useState<ProposalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && proposalId) {
      fetchHistory();
    }
  }, [isOpen, proposalId]);

  const fetchHistory = async () => {
    if (!proposalId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProposalHistory(proposalId);
      setHistory(data);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            📜 Lịch sử cập nhật Proposal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch sử</h3>
              <p className="text-gray-600">Proposal này chưa có thay đổi nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline */}
              <div className="relative">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative pb-8">
                    {/* Timeline line */}
                    {index !== history.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-200">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {entry.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                          {entry.reason && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                              ⚠️ {entry.reason}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Bối cảnh:</p>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                              {entry.context}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Mô tả:</p>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                              {entry.description}
                            </p>
                          </div>

                          {/* Functional Requirements */}
                          {entry.func && entry.func.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Yêu cầu chức năng ({entry.func.length}):
                              </p>
                              <ul className="space-y-1 bg-white p-3 rounded-lg">
                                {entry.func.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Non-Functional Requirements */}
                          {entry.nonFunc && entry.nonFunc.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Yêu cầu phi chức năng ({entry.nonFunc.length}):
                              </p>
                              <ul className="space-y-1 bg-white p-3 rounded-lg">
                                {entry.nonFunc.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-blue-500 mr-2">⚡</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Attachment */}
                          {entry.attachmentUrl && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">File đính kèm:</p>
                              <a
                                href={entry.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 bg-white p-2 rounded-lg"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Tải xuống
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalHistoryModal;
