import type { CapstoneProposalResponse } from '@/interfaces';

interface ProposalDetailModalProps {
  proposal: CapstoneProposalResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadAgain?: (proposal: CapstoneProposalResponse) => void;
}

const ProposalDetailModal = ({ proposal, isOpen, onClose, onUploadAgain }: ProposalDetailModalProps) => {
  if (!isOpen || !proposal) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã nộp', icon: '📄' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã duyệt', icon: '✅' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối', icon: '❌' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xử lý', icon: '⏳' },
      DUPLICATE_REJECTED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Trùng lặp - Từ chối', icon: '⚠️' },
      DUPLICATE_ACCEPTED: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Trùng lặp - Chấp nhận', icon: '✓' },
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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

        {/* Content */}
        <div className="p-6 space-y-6">
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

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(proposal.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(proposal.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Admin 1</p>
              <p className="text-sm font-medium text-gray-900">
                {proposal.admin1 ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Admin 2</p>
              <p className="text-sm font-medium text-gray-900">
                {proposal.admin2 ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
          <div className="flex gap-3">
            {onUploadAgain && (
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
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailModal;
