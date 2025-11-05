interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showDiffButton?: boolean;
  onShowDiff?: () => void;
}

const AlertModal = ({ isOpen, onClose, title, message, type = 'info', showDiffButton = false, onShowDiff }: AlertModalProps) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-900',
          buttonColor: 'bg-green-500 hover:bg-green-600',
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-900',
          buttonColor: 'bg-red-500 hover:bg-red-600',
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-900',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-900',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className={`p-6 border-t-4 ${config.borderColor} rounded-t-2xl`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">{config.icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          {showDiffButton && onShowDiff ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition shadow-md"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onClose();
                  onShowDiff();
                }}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Xem chi tiết khác biệt
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className={`w-full px-6 py-3 text-white rounded-lg font-medium transition shadow-md ${config.buttonColor}`}
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
