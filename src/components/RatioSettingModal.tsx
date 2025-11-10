import { useState, useEffect } from 'react';
import { updateRatio, getRatio } from '../services/api';
import { toast } from 'sonner';

interface RatioOption {
  value: number;
  label: string;
}

const ratioOptions: RatioOption[] = [
  { value: 0.5, label: '75%' },
  { value: 0.6, label: '70%' },
  { value: 0.7, label: '65%' },
  { value: 0.8, label: '60%' },
  { value: 0.9, label: '55%' },
  { value: 1.0, label: '50%' },
];

interface RatioSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRatio?: number;
}

const RatioSettingModal = ({ isOpen, onClose, currentRatio = 1.0 }: RatioSettingModalProps) => {
  const [selectedRatio, setSelectedRatio] = useState<number>(currentRatio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentRatio();
    }
  }, [isOpen]);

  const fetchCurrentRatio = async () => {
    try {
      setIsLoading(true);
      const data = await getRatio();
      setSelectedRatio(data.ratio);
    } catch (err) {
      setSelectedRatio(1.0);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await updateRatio(1, selectedRatio);
      
      toast.success('Cập nhật hệ số thành công!', {
        description: `Hệ số mới: ${ratioOptions.find(r => r.value === selectedRatio)?.label}`,
        duration: 3000,
      });
      
      onClose();
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật hệ số', {
        description: err.response?.data?.message || err.message || 'Có lỗi xảy ra',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Cài đặt hệ số</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn hệ số trùng lặp
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Đề tài được phép trùng ở mức hệ số đã chọn
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {ratioOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedRatio(option.value)}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      selectedRatio === option.value
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRatio === option.value
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedRatio === option.value && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-left">
                        <div className={`text-lg font-bold ${
                          selectedRatio === option.value ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ratio: {option.value}
                        </div>
                      </div>
                    </div>
                    {selectedRatio === option.value && (
                      <span className="text-orange-600 font-medium text-sm">✓ Đã chọn</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatioSettingModal;
