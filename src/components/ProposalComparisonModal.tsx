import { useEffect, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import type { CapstoneProposalResponse } from '@/interfaces';

interface ProposalComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProposal: {
    title: string;
    context: string;
    description: string;
    func: string[];
    nonFunc: string[];
  };
  duplicateProposal: CapstoneProposalResponse | null;
  currentProposalId?: number; // ID của proposal vừa upload (để edit)
  semanticDistance?: number; // L2 distance từ backend
  onUploadAgain?: (proposalId?: number) => void; // Callback khi user muốn upload lại, truyền ID để edit
  showUploadAgainButton?: boolean; // Hiển thị nút "Upload lại" hay không (mặc định true)
}

const ProposalComparisonModal = ({
  isOpen,
  onClose,
  currentProposal,
  duplicateProposal,
  currentProposalId,
  semanticDistance = 0,
  onUploadAgain,
  showUploadAgainButton = true,
}: ProposalComparisonModalProps) => {
  const [diffResults, setDiffResults] = useState<{
    title: any[];
    context: any[];
    description: any[];
    func: any[];
    nonFunc: any[];
  }>({
    title: [],
    context: [],
    description: [],
    func: [],
    nonFunc: [],
  });

  useEffect(() => {
    if (isOpen && duplicateProposal) {
      const dmp = new DiffMatchPatch();

      // So sánh từng field
      const titleDiff = dmp.diff_main(currentProposal.title, duplicateProposal.title);
      dmp.diff_cleanupSemantic(titleDiff);

      const contextDiff = dmp.diff_main(currentProposal.context, duplicateProposal.context);
      dmp.diff_cleanupSemantic(contextDiff);

      const descriptionDiff = dmp.diff_main(
        currentProposal.description,
        duplicateProposal.description
      );
      dmp.diff_cleanupSemantic(descriptionDiff);

      const funcDiff = dmp.diff_main(
        currentProposal.func.join('\n'),
        duplicateProposal.func.join('\n')
      );
      dmp.diff_cleanupSemantic(funcDiff);

      const nonFuncDiff = dmp.diff_main(
        currentProposal.nonFunc.join('\n'),
        duplicateProposal.nonFunc.join('\n')
      );
      dmp.diff_cleanupSemantic(nonFuncDiff);

      const results = {
        title: titleDiff,
        context: contextDiff,
        description: descriptionDiff,
        func: funcDiff,
        nonFunc: nonFuncDiff,
      };
      
      setDiffResults(results);
    }
  }, [isOpen, duplicateProposal, currentProposal]);

  if (!isOpen || !duplicateProposal) {
    return null;
  }

  // Tính similarity percentage từ L2 distance (semantic similarity)
  const getSimilarityPercentage = (l2Distance: number): number => {
    // Công thức: Tương đồng = 1 - (Distance² / 2)
    const cosineSimilarity = 1 - (Math.pow(l2Distance, 2) / 2);
    
    // Chuyển sang % và làm tròn 1 chữ số thập phân
    const percentage = Math.round(cosineSimilarity * 1000) / 10;
    
    return percentage;
  };

  const semanticSimilarity = getSimilarityPercentage(semanticDistance);

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (similarity >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (similarity >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 80) return 'Rất giống nhau';
    if (similarity >= 60) return 'Khá giống nhau';
    if (similarity >= 40) return 'Tương đối khác nhau';
    return 'Rất khác nhau';
  };

  const getSimilarityIcon = (similarity: number): string => {
    if (similarity >= 80) return '🟢';
    if (similarity >= 60) return '🟡';
    if (similarity >= 40) return '🟠';
    return '🔴';
  };

  const renderDiff = (diff: any[], label: string) => {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Bài mới (current) */}
          <div className="border border-red-200 rounded-lg bg-red-50/50">
            <div className="bg-red-100 px-4 py-2 border-b border-red-200">
              <span className="text-sm font-medium text-red-900">📝 Bài đang upload</span>
            </div>
            <div className="p-4">
              <div className="text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
                {diff.map((part, index) => {
                  const [operation, text] = part;
                  if (operation === -1) {
                    // Text bị xóa (có trong bài cũ, không có trong bài mới)
                    return null;
                  } else if (operation === 1) {
                    // Text mới thêm (có trong bài mới, không có trong bài cũ)
                    return (
                      <span key={index} className="bg-green-200 text-green-900">
                        {text}
                      </span>
                    );
                  } else {
                    // Text giống nhau
                    return (
                      <span key={index} className="text-gray-700">
                        {text}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Bài cũ (duplicate) */}
          <div className="border border-blue-200 rounded-lg bg-blue-50/50">
            <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
              <span className="text-sm font-medium text-blue-900">
                🔍 Bài trùng lặp (ID: {duplicateProposal.id})
              </span>
            </div>
            <div className="p-4">
              <div className="text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
                {diff.map((part, index) => {
                  const [operation, text] = part;
                  if (operation === -1) {
                    // Text bị xóa (có trong bài cũ, không có trong bài mới)
                    return (
                      <span key={index} className="bg-red-200 text-red-900 line-through">
                        {text}
                      </span>
                    );
                  } else if (operation === 1) {
                    // Text mới thêm
                    return null;
                  } else {
                    // Text giống nhau
                    return (
                      <span key={index} className="text-gray-700">
                        {text}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const colorClass = getSimilarityColor(semanticSimilarity);
  const similarityLabel = getSimilarityLabel(semanticSimilarity);
  const similarityIcon = getSimilarityIcon(semanticSimilarity);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                ⚠️ Phát hiện đề tài trùng lặp
              </h2>
              <p className="text-orange-100 mb-3">
                So sánh chi tiết giữa đề tài đang upload và đề tài trùng lặp trong hệ thống
              </p>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-2xl">{similarityIcon}</span>
                  <span className="font-semibold">Độ tương đồng ngữ nghĩa:</span>
                  <span className="text-2xl font-bold">{semanticSimilarity}%</span>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold border ${colorClass}`}>
                  {similarityLabel}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Legend */}
          <div className="mb-6 flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-200 text-green-900 rounded text-xs font-medium">
                Văn bản
              </span>
              <span className="text-sm text-gray-600">Khác biệt (chỉ có trong bài mới)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-200 text-red-900 rounded text-xs font-medium line-through">
                Văn bản
              </span>
              <span className="text-sm text-gray-600">Khác biệt (chỉ có trong bài cũ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium">
                Văn bản
              </span>
              <span className="text-sm text-gray-600">Giống nhau</span>
            </div>
          </div>

          {/* Comparisons */}
          {renderDiff(diffResults.title, '📌 Tiêu đề')}
          {renderDiff(diffResults.context, '📝 Bối cảnh')}
          {renderDiff(diffResults.description, '💡 Mô tả giải pháp')}
          {renderDiff(diffResults.func, '⚙️ Yêu cầu chức năng')}
          {renderDiff(diffResults.nonFunc, '🔒 Yêu cầu phi chức năng')}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`${showUploadAgainButton ? 'flex-1' : 'w-full'} px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition`}
            >
              Đóng
            </button>
            {showUploadAgainButton && (
              <button
                onClick={() => {
                  // Gọi callback để mở form upload modal với ID đã set
                  if (onUploadAgain && currentProposalId) {
                    onUploadAgain(currentProposalId);
                  }
                  // Đóng modal comparison
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Chỉnh sửa và upload lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalComparisonModal;
