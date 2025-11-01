import { useState } from 'react';
import type { FormEvent } from 'react';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  members: string;
  file: File | null;
}

const SubmitPage = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: 'web',
    members: '',
    file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: API call to submit project
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        title: '',
        description: '',
        category: 'web',
        members: '',
        file: null,
      });
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nộp đề tài mới
        </h1>
        <p className="text-gray-600">
          Điền thông tin và tải lên file đồ án của bạn
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                Đề tài đã được nộp thành công! Mentor sẽ xem xét và phản hồi sớm.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">1</span>
            Thông tin đề tài
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đề tài <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Ví dụ: Hệ thống quản lý thư viện trực tuyến"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              >
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="ai">AI/Machine Learning</option>
                <option value="data">Data Science</option>
                <option value="iot">IoT</option>
                <option value="game">Game Development</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-2">
                Thành viên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                id="members"
                type="text"
                required
                value={formData.members}
                onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Nguyễn Văn A, Trần Thị B, Lê Văn C"
              />
              <p className="mt-1 text-sm text-gray-500">Ngăn cách các thành viên bằng dấu phấy</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả đề tài <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                placeholder="Mô tả chi tiết về đề tài của bạn..."
              />
            </div>
          </div>
        </div>

        {/* File Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">2</span>
            Tải lên file đồ án
          </h2>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.zip,.rar"
            />
            
            {formData.file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, file: null })}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa file
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-4 text-sm text-gray-600">
                  <label htmlFor="file-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                    Chọn file
                  </label>
                  {' '}hoặc kéo thả file vào đây
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Hỗ trợ: PDF, DOC, DOCX, ZIP, RAR (Tối đa 50MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !formData.file}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang nộp...
              </span>
            ) : 'Nộp đề tài'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitPage;
