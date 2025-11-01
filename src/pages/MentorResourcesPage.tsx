import { useState } from 'react';
import type { FormEvent } from 'react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}

const MentorResourcesPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'template' | 'guide' | 'example' | 'document'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'template',
    file: null as File | null,
  });

  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Template Báo cáo Đồ án',
      description: 'Mẫu báo cáo chuẩn theo quy định của trường, bao gồm các phần: tóm tắt, giới thiệu, phân tích, thiết kế, kết quả.',
      category: 'template',
      fileUrl: '/files/template-bao-cao.docx',
      uploadedBy: 'TS. Nguyễn Văn A',
      uploadedAt: '2025-10-15',
      downloads: 156,
    },
    {
      id: '2',
      title: 'Hướng dẫn viết tài liệu kỹ thuật',
      description: 'Tài liệu chi tiết về cách viết báo cáo kỹ thuật, cấu trúc, ngôn ngữ sử dụng.',
      category: 'guide',
      fileUrl: '/files/huong-dan-viet-tai-lieu.pdf',
      uploadedBy: 'TS. Trần Thị B',
      uploadedAt: '2025-10-20',
      downloads: 89,
    },
    {
      id: '3',
      title: 'Đồ án mẫu - Hệ thống quản lý',
      description: 'Đồ án hoàn chỉnh về hệ thống quản lý, có thể tham khảo về cấu trúc, code, tài liệu.',
      category: 'example',
      fileUrl: '/files/do-an-mau-qlns.zip',
      uploadedBy: 'TS. Lê Văn C',
      uploadedAt: '2025-09-25',
      downloads: 234,
    },
    {
      id: '4',
      title: 'Checklist đánh giá đồ án',
      description: 'Danh sách các tiêu chí đánh giá đồ án, giúp sinh viên tự kiểm tra trước khi nộp.',
      category: 'document',
      fileUrl: '/files/checklist-danh-gia.pdf',
      uploadedBy: 'TS. Nguyễn Văn A',
      uploadedAt: '2025-10-28',
      downloads: 145,
    },
    {
      id: '5',
      title: 'Slide Template Thuyết trình',
      description: 'Mẫu slide PowerPoint chuẩn cho buổi thuyết trình đồ án.',
      category: 'template',
      fileUrl: '/files/slide-template.pptx',
      uploadedBy: 'TS. Phạm Thị D',
      uploadedAt: '2025-10-22',
      downloads: 98,
    },
  ]);

  const filteredResources = resources.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    // TODO: API call to upload resource
    console.log('Uploading:', formData);
    setShowUploadModal(false);
    setFormData({
      title: '',
      description: '',
      category: 'template',
      file: null,
    });
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      template: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Template', icon: '📄' },
      guide: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hướng dẫn', icon: '📚' },
      example: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đồ án mẫu', icon: '💼' },
      document: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Tài liệu', icon: '📋' },
    };
    return configs[category as keyof typeof configs] || configs.document;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tài nguyên & Đồ án mẫu
          </h1>
          <p className="text-gray-600">
            Tài liệu tham khảo, template và đồ án mẫu từ các mentor
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition shadow-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload tài liệu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng tài liệu</p>
              <p className="text-3xl font-bold text-gray-900">{resources.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Templates</p>
              <p className="text-3xl font-bold text-blue-600">
                {resources.filter(r => r.category === 'template').length}
              </p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đồ án mẫu</p>
              <p className="text-3xl font-bold text-purple-600">
                {resources.filter(r => r.category === 'example').length}
              </p>
            </div>
            <div className="text-4xl">💼</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng lượt tải</p>
              <p className="text-3xl font-bold text-green-600">
                {resources.reduce((sum, r) => sum + r.downloads, 0)}
              </p>
            </div>
            <div className="text-4xl">⬇️</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'template', 'guide', 'example', 'document'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {cat === 'all' && '🗂️ Tất cả'}
              {cat === 'template' && '📄 Templates'}
              {cat === 'guide' && '📚 Hướng dẫn'}
              {cat === 'example' && '💼 Đồ án mẫu'}
              {cat === 'document' && '📋 Tài liệu'}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const config = getCategoryConfig(resource.category);
          return (
            <div
              key={resource.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-t-4 border-orange-500"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="text-xs text-gray-500">{resource.uploadedAt}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {resource.uploadedBy}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {resource.downloads} lượt tải
                  </div>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium">
                    Tải xuống
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Upload tài liệu mới
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Ví dụ: Template Báo cáo Đồ án"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại tài liệu <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                >
                  <option value="template">📄 Template</option>
                  <option value="guide">📚 Hướng dẫn</option>
                  <option value="example">💼 Đồ án mẫu</option>
                  <option value="document">📋 Tài liệu</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  placeholder="Mô tả chi tiết về tài liệu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File tài liệu <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition">
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="file-upload-modal"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                  />
                  {formData.file ? (
                    <div>
                      <p className="font-medium text-gray-900">{formData.file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, file: null })}
                        className="text-sm text-red-600 hover:text-red-700 mt-2"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload-modal" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        Click để chọn file hoặc kéo thả vào đây
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, PPT, ZIP (Tối đa 50MB)
                      </p>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!formData.file}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorResourcesPage;
