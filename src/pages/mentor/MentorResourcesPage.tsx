import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Semester, CapstoneProposalResponse } from '@/interfaces';
import { getSemesters, createProposal, getAllProposals, getProposalById } from '@/services/api';
import AddSemesterModal from '@/components/AddSemesterModal';
import ProposalDetailModal from '@/components/ProposalDetailModal';
import AlertModal from '@/components/AlertModal';
import ProposalComparisonModal from '@/components/ProposalComparisonModal';

const MentorResourcesPage = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<CapstoneProposalResponse | null>(null);
  const [duplicateProposal, setDuplicateProposal] = useState<CapstoneProposalResponse | null>(null);
  const [currentProposal, setCurrentProposal] = useState<CapstoneProposalResponse | null>(null);
  const [semanticDistance, setSemanticDistance] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'DUPLICATE_REJECTED' | 'DUPLICATE_ACCEPTED'>('all');
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    showDiffButton?: boolean;
    onShowDiff?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showDiffButton: false,
  });
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [proposals, setProposals] = useState<CapstoneProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [studentCount, setStudentCount] = useState(1); // Số lượng sinh viên hiển thị (1-6)
  const [formData, setFormData] = useState({
    id: null as number | null, // ID proposal để edit (null = create mới)
    title: '',
    context: '',
    description: '',
    func: [''],
    nonFunc: [''],
    students: {
      student1Id: '',
      student1Name: '',
      student2Id: '',
      student2Name: '',
      student3Id: '',
      student3Name: '',
      student4Id: '',
      student4Name: '',
      student5Id: '',
      student5Name: '',
      student6Id: '',
      student6Name: '',
    },
    semesterId: 0,
    isAdmin1: false,
    isAdmin2: false,
  });

  const filteredProposals = proposals.filter(
    (p) => selectedCategory === 'all' || p.status === selectedCategory
  );

  // Fetch data khi component mount
  useEffect(() => {
    fetchSemestersData();
    fetchProposalsData();
  }, []);

  const fetchSemestersData = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
      // Set default semester to current semester
      const currentSemester = data.find((s) => s.current);
      if (currentSemester) {
        setFormData(prev => ({ ...prev, semesterId: currentSemester.id }));
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchProposalsData = async () => {
    setIsLoadingProposals(true);
    try {
      const data = await getAllProposals();
      console.log('📦 Fetched proposals:', data);
      console.log('📦 First proposal students:', data[0]?.students);
      setProposals(data);
    } catch (error: any) {
      console.error('❌ Error fetching proposals:', error);
      setAlertConfig({
        isOpen: true,
        title: 'Lỗi tải dữ liệu',
        message: `Không thể tải danh sách proposals:\n${error.message}`,
        type: 'error',
      });
    } finally {
      setIsLoadingProposals(false);
    }
  };

  const handleSemesterAdded = () => {
    // Refresh danh sách semester sau khi thêm mới
    fetchSemestersData();
  };

  const handleUploadAgain = (proposal: CapstoneProposalResponse) => {
    // Populate form với data từ proposal để edit
    const students = {
      student1Id: proposal.students?.student1Id || '',
      student1Name: proposal.students?.student1Name || '',
      student2Id: proposal.students?.student2Id || '',
      student2Name: proposal.students?.student2Name || '',
      student3Id: proposal.students?.student3Id || '',
      student3Name: proposal.students?.student3Name || '',
      student4Id: proposal.students?.student4Id || '',
      student4Name: proposal.students?.student4Name || '',
      student5Id: proposal.students?.student5Id || '',
      student5Name: proposal.students?.student5Name || '',
      student6Id: proposal.students?.student6Id || '',
      student6Name: proposal.students?.student6Name || '',
    };
    
    // Tính số lượng sinh viên có data
    let count = 1; // Minimum 1
    if (students.student2Id && students.student2Name) count = 2;
    if (students.student3Id && students.student3Name) count = 3;
    if (students.student4Id && students.student4Name) count = 4;
    if (students.student5Id && students.student5Name) count = 5;
    if (students.student6Id && students.student6Name) count = 6;
    
    setFormData({
      id: proposal.id,
      title: proposal.title,
      context: proposal.context,
      description: proposal.description,
      func: proposal.func,
      nonFunc: proposal.nonFunc,
      students,
      semesterId: proposal.semester?.id || 0,
      isAdmin1: proposal.admin1,
      isAdmin2: proposal.admin2,
    });
    setStudentCount(count);
    // Mở upload modal
    setShowUploadModal(true);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🚀 handleUpload triggered');
    console.log('📋 Current formData:', formData);

    try {
      // Chuẩn bị data để gửi
      // Filter ra các trường students không rỗng
      const students: any = {};
      if (formData.students.student1Id.trim() && formData.students.student1Name.trim()) {
        students.student1Id = formData.students.student1Id;
        students.student1Name = formData.students.student1Name;
      }
      if (formData.students.student2Id?.trim() && formData.students.student2Name?.trim()) {
        students.student2Id = formData.students.student2Id;
        students.student2Name = formData.students.student2Name;
      }
      if (formData.students.student3Id?.trim() && formData.students.student3Name?.trim()) {
        students.student3Id = formData.students.student3Id;
        students.student3Name = formData.students.student3Name;
      }
      if (formData.students.student4Id?.trim() && formData.students.student4Name?.trim()) {
        students.student4Id = formData.students.student4Id;
        students.student4Name = formData.students.student4Name;
      }
      if (formData.students.student5Id?.trim() && formData.students.student5Name?.trim()) {
        students.student5Id = formData.students.student5Id;
        students.student5Name = formData.students.student5Name;
      }
      if (formData.students.student6Id?.trim() && formData.students.student6Name?.trim()) {
        students.student6Id = formData.students.student6Id;
        students.student6Name = formData.students.student6Name;
      }

      // Build payload: only include id if it exists (for update)
      const basePayload = {
        title: formData.title,
        context: formData.context,
        description: formData.description,
        func: formData.func.filter(f => f.trim() !== ''),
        nonFunc: formData.nonFunc.filter(nf => nf.trim() !== ''),
        students: students,
        semester: {
          id: formData.semesterId
        },
        isAdmin1: formData.isAdmin1,
        isAdmin2: formData.isAdmin2,
      };
      
      const payload = formData.id ? { ...basePayload, id: formData.id } : { ...basePayload, id: null };

      console.log('='.repeat(60));
      console.log('📤 SUBMITTING PROPOSAL');
      console.log('='.repeat(60));
      console.log('🆔 formData.id:', formData.id);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      console.log('='.repeat(60));

      // Unified POST endpoint for both create (id=null) and update (id>0)
      if (formData.id && formData.id > 0) {
        console.log('🔄 Calling createProposal in UPDATE mode with ID:', formData.id);
      } else {
        console.log('✨ Calling createProposal (CREATE mode with id: null)');
      }
      console.log('🌐 URL: POST /api/capstone-proposal');
      await createProposal(payload);
      
      // Reset form và đóng modal
      setShowUploadModal(false);
      setFormData({
        id: null as number | null,
        title: '',
        context: '',
        description: '',
        func: [''],
        nonFunc: [''],
        students: {
          student1Id: '',
          student1Name: '',
          student2Id: '',
          student2Name: '',
          student3Id: '',
          student3Name: '',
          student4Id: '',
          student4Name: '',
          student5Id: '',
          student5Name: '',
          student6Id: '',
          student6Name: '',
        },
        semesterId: semesters.find(s => s.current)?.id || 0,
        isAdmin1: false,
        isAdmin2: false,
      });

      // Thông báo thành công và refresh danh sách
      setAlertConfig({
        isOpen: true,
        title: 'Thành công',
        message: formData.id && formData.id > 0 ? 'Cập nhật proposal thành công!' : 'Upload proposal thành công!',
        type: 'success',
      });
      fetchProposalsData(); // Refresh danh sách proposals
    } catch (error: any) {
      // Bắt lỗi 409 - Proposal trùng lặp
      if (error.response?.status === 409) {
        console.log('='.repeat(60));
        console.log('⚠️  RECEIVED 409 ERROR');
        console.log('='.repeat(60));
        
        const errorData = error.response.data;
        console.log('📥 Error response:', JSON.stringify(errorData, null, 2));
        const message = errorData.message || 'Proposal bị trùng lặp!';
        
        // Lấy ID của cả 2 proposals (chuẩn hoá key để phòng trường hợp BE đánh máy "currtentId")
        const result = errorData.result || {};
        const duplicateIdRaw = result.closestId ?? result.duplicateId;
        const currentIdRaw = result.currentId ?? result.currtentId ?? result.currentID ?? result.curentId;
        const duplicateId = duplicateIdRaw != null ? parseInt(String(duplicateIdRaw), 10) : NaN;
        const currentId = currentIdRaw != null ? parseInt(String(currentIdRaw), 10) : NaN;
        console.log('🆔 Parsed IDs - currentId:', currentId, ', duplicateId:', duplicateId);

        // Kiểm tra ID hợp lệ -> lấy cả 2 proposals và gắn ngay formData.id
        if (duplicateId > 0 && !isNaN(duplicateId) && currentId > 0 && !isNaN(currentId)) {
          try {
            const [currentProposalData, duplicateProposalData] = await Promise.all([
              getProposalById(currentId),
              getProposalById(duplicateId),
            ]);

            setCurrentProposal(currentProposalData);
            setDuplicateProposal(duplicateProposalData);
            setSemanticDistance(errorData.result.distance);

            console.log('🔗 BEFORE setFormData - formData.id:', formData.id);
            console.log('🔗 Setting formData.id to currentId:', currentId);
            setFormData(prev => {
              const newFormData = { ...prev, id: currentId };
              console.log('🔗 AFTER setFormData - new formData:', newFormData);
              return newFormData;
            });

            const distance = errorData.result.distance;
            const cosineSimilarity = 1 - (Math.pow(distance, 2) / 2);
            const similarityPercent = Math.round(cosineSimilarity * 1000) / 10;

            const customMessage = `Proposal bị trùng lặp!\n\nRất giống với proposal:\n"${duplicateProposalData.title}"\n\nĐộ tương đồng ngữ nghĩa: ${similarityPercent}%\n\nVui lòng chỉnh sửa và bấm "Cập nhật" để upload lại.`;

            setAlertConfig({
              isOpen: true,
              title: 'Proposal trùng lặp',
              message: customMessage,
              type: 'warning',
              showDiffButton: true,
              onShowDiff: () => {
                setShowComparisonModal(true);
              },
            });
          } catch (fetchError: any) {
            setAlertConfig({
              isOpen: true,
              title: 'Proposal trùng lặp',
              message: message,
              type: 'warning',
              showDiffButton: false,
            });
          }
        } else {
          // Fallback: nếu chỉ có closestId thì vẫn hiển thị so sánh
          if (errorData.result?.closestId) {
            const dupId = parseInt(errorData.result.closestId);
            if (dupId > 0 && !isNaN(dupId)) {
              try {
                const duplicateProposalData = await getProposalById(dupId);
                setDuplicateProposal(duplicateProposalData);
                setSemanticDistance(errorData.result.distance || 0);

                const distance = errorData.result.distance || 0;
                const cosineSimilarity = 1 - (Math.pow(distance, 2) / 2);
                const similarityPercent = Math.round(cosineSimilarity * 1000) / 10;

                const customMessage = `Proposal bị trùng lặp!\n\nRất giống với proposal:\n"${duplicateProposalData.title}"\n\nĐộ tương đồng ngữ nghĩa: ${similarityPercent}%`;

                setAlertConfig({
                  isOpen: true,
                  title: 'Proposal trùng lặp',
                  message: customMessage,
                  type: 'warning',
                  showDiffButton: true,
                  onShowDiff: () => {
                    setShowComparisonModal(true);
                  },
                });
                return;
              } catch (fetchError) {
                // bỏ qua, xuống fallback chung
              }
            }
          }

          // Fallback chung: chỉ thông báo
          setAlertConfig({
            isOpen: true,
            title: 'Proposal trùng lặp',
            message: message,
            type: 'warning',
            showDiffButton: false,
          });
        }
      } else {
        // Lỗi khác
        const message = error.response?.data?.message || error.message || 'Upload thất bại. Vui lòng thử lại!';
        setAlertConfig({
          isOpen: true,
          title: 'Lỗi upload',
          message: message,
          type: 'error',
          showDiffButton: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions để thêm/xóa các trường động
  const addField = (field: 'func' | 'nonFunc') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeField = (field: 'func' | 'nonFunc', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field: 'func' | 'nonFunc', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

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
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
              <p className="text-sm text-gray-600 mb-1">Tổng đề tài</p>
              <p className="text-3xl font-bold text-gray-900">{proposals.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã nộp</p>
              <p className="text-3xl font-bold text-blue-600">
                {proposals.filter(p => p.status === 'SUBMITTED').length}
              </p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã duyệt</p>
              <p className="text-3xl font-bold text-green-600">
                {proposals.filter(p => p.status === 'APPROVED').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Từ chối</p>
              <p className="text-3xl font-bold text-red-600">
                {proposals.filter(p => p.status === 'REJECTED').length}
              </p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING', 'DUPLICATE_REJECTED', 'DUPLICATE_ACCEPTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedCategory(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === status
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {status === 'all' && '🗂️ Tất cả'}
              {status === 'SUBMITTED' && '📄 Đã nộp'}
              {status === 'APPROVED' && '✅ Đã duyệt'}
              {status === 'REJECTED' && '❌ Từ chối'}
              {status === 'PENDING' && '⏳ Chờ xử lý'}
              {status === 'DUPLICATE_REJECTED' && '⚠️ Trùng - Từ chối'}
              {status === 'DUPLICATE_ACCEPTED' && '✓ Trùng - Chấp nhận'}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Grid */}
      {isLoadingProposals ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đề tài nào</h3>
          <p className="text-gray-600">Hãy thêm đề tài mới bằng cách click nút "Upload tài liệu"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => {
            const config = getStatusConfig(proposal.status);
            return (
              <div
                key={proposal.id}
                onClick={() => {
                  setSelectedProposal(proposal);
                  setShowDetailModal(true);
                }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-t-4 border-orange-500 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(proposal.createdAt)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    <strong>Bối cảnh:</strong> {proposal.context}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    <strong>Mô tả:</strong> {proposal.description}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {proposal.semester?.name || 'Chưa có học kỳ'}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      {proposal.func.length} yêu cầu chức năng
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">
                      {proposal.nonFunc.length} yêu cầu phi chức năng
                    </span>
                  </div>

                  {proposal.status === 'DUPLICATE_REJECTED' && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click vào card
                          handleUploadAgain(proposal);
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload lại
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click vào card
                          navigate(`/proposal-history/${proposal.id}`);
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lịch sử
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showDiffButton={alertConfig.showDiffButton}
        onShowDiff={alertConfig.onShowDiff}
      />

      {/* Proposal Comparison Modal */}
      <ProposalComparisonModal
        isOpen={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setCurrentProposal(null);
          setDuplicateProposal(null);
          setSemanticDistance(0);
          // Không reset ID ở đây nữa vì có thể user đã bấm "Chỉnh sửa và upload lại"
        }}
        currentProposal={
          currentProposal
            ? {
                title: currentProposal.title,
                context: currentProposal.context,
                description: currentProposal.description,
                func: currentProposal.func,
                nonFunc: currentProposal.nonFunc,
              }
            : {
                title: formData.title,
                context: formData.context,
                description: formData.description,
                func: formData.func,
                nonFunc: formData.nonFunc,
              }
        }
        duplicateProposal={duplicateProposal}
        currentProposalId={currentProposal?.id || undefined}
        semanticDistance={semanticDistance}
        onUploadAgain={(proposalId) => {
          // Set ID và populate data từ currentProposal vào form
          if (proposalId && proposalId > 0 && currentProposal) {
            setFormData({
              id: proposalId,
              title: currentProposal.title,
              context: currentProposal.context,
              description: currentProposal.description,
              func: currentProposal.func,
              nonFunc: currentProposal.nonFunc,
              students: {
                student1Id: currentProposal.students?.student1Id || '',
                student1Name: currentProposal.students?.student1Name || '',
                student2Id: currentProposal.students?.student2Id || '',
                student2Name: currentProposal.students?.student2Name || '',
                student3Id: currentProposal.students?.student3Id || '',
                student3Name: currentProposal.students?.student3Name || '',
                student4Id: currentProposal.students?.student4Id || '',
                student4Name: currentProposal.students?.student4Name || '',
                student5Id: currentProposal.students?.student5Id || '',
                student5Name: currentProposal.students?.student5Name || '',
                student6Id: currentProposal.students?.student6Id || '',
                student6Name: currentProposal.students?.student6Name || '',
              },
              semesterId: currentProposal.semester.id,
              isAdmin1: false,
              isAdmin2: false,
            });
            
            // Mở lại upload modal để user có thể chỉnh sửa
            setShowUploadModal(true);
          }
        }}
      />

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        proposal={selectedProposal}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProposal(null);
        }}
        onUploadAgain={handleUploadAgain}
      />

      {/* Add Semester Modal */}
      <AddSemesterModal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onSuccess={handleSemesterAdded}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.id && formData.id > 0 ? 'Chỉnh sửa đề tài' : 'Upload tài liệu mới'}
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    // Reset form khi đóng modal
                    setFormData({
                      id: null as number | null,
                      title: '',
                      context: '',
                      description: '',
                      func: [''],
                      nonFunc: [''],
                      students: {
                        student1Id: '',
                        student1Name: '',
                        student2Id: '',
                        student2Name: '',
                        student3Id: '',
                        student3Name: '',
                        student4Id: '',
                        student4Name: '',
                        student5Id: '',
                        student5Name: '',
                        student6Id: '',
                        student6Name: '',
                      },
                      semesterId: semesters.find(s => s.current)?.id || 0,
                      isAdmin1: false,
                      isAdmin2: false,
                    });
                    setStudentCount(1); // Reset student count
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề đề tài <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Ví dụ: Virtual Try-On for Fashion"
                />
              </div>

              {/* Context */}
              <div>
                <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                  Bối cảnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="context"
                  required
                  rows={3}
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  placeholder="Mô tả bối cảnh, vấn đề cần giải quyết..."
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả giải pháp <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  placeholder="Mô tả giải pháp đề xuất..."
                />
              </div>

              {/* Functional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu chức năng <span className="text-red-500">*</span>
                </label>
                {formData.func.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateField('func', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      placeholder={`${index + 1}. Yêu cầu chức năng...`}
                      required
                    />
                    {formData.func.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField('func', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField('func')}
                  className="mt-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition"
                >
                  + Thêm yêu cầu
                </button>
              </div>

              {/* Non-Functional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu phi chức năng <span className="text-red-500">*</span>
                </label>
                {formData.nonFunc.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateField('nonFunc', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      placeholder={`${index + 1}. Yêu cầu phi chức năng...`}
                      required
                    />
                    {formData.nonFunc.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField('nonFunc', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField('nonFunc')}
                  className="mt-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition"
                >
                  + Thêm yêu cầu
                </button>
              </div>

              {/* Students */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Danh sách sinh viên (tối đa 6 sinh viên) <span className="text-red-500">*</span>
                  </label>
                  {studentCount < 6 && (
                    <button
                      type="button"
                      onClick={() => setStudentCount(prev => Math.min(prev + 1, 6))}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm sinh viên
                    </button>
                  )}
                </div>
                
                {/* Dynamic student fields */}
                {[...Array(studentCount)].map((_, index) => {
                  const studentNum = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6;
                  const studentIdKey = `student${studentNum}Id` as keyof typeof formData.students;
                  const studentNameKey = `student${studentNum}Name` as keyof typeof formData.students;
                  
                  return (
                    <div key={studentNum} className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">
                        Sinh viên {studentNum} {studentNum === 1 && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.students[studentIdKey] || ''}
                          onChange={(e) => setFormData({ ...formData, students: { ...formData.students, [studentIdKey]: e.target.value }})}
                          className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          placeholder={`Mã SV (SE17${1000 + index * 100})`}
                          required={studentNum === 1}
                        />
                        <input
                          type="text"
                          value={formData.students[studentNameKey] || ''}
                          onChange={(e) => setFormData({ ...formData, students: { ...formData.students, [studentNameKey]: e.target.value }})}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          placeholder="Tên sinh viên"
                          required={studentNum === 1}
                        />
                        {studentNum > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              // Clear current student data
                              setFormData({ 
                                ...formData, 
                                students: { 
                                  ...formData.students, 
                                  [studentIdKey]: '',
                                  [studentNameKey]: ''
                                }
                              });
                              // Decrease count
                              setStudentCount(prev => Math.max(prev - 1, 1));
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Semester */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                    Học kỳ <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSemesterModal(true)}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm học kỳ
                  </button>
                </div>
                <select
                  id="semester"
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                >
                  <option value={0}>Chọn học kỳ</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name} - {semester.semesterCode}
                      {semester.current && ' ⭐'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    // Reset form khi hủy
                    setFormData({
                      id: null as number | null,
                      title: '',
                      context: '',
                      description: '',
                      func: [''],
                      nonFunc: [''],
                      students: {
                        student1Id: '',
                        student1Name: '',
                        student2Id: '',
                        student2Name: '',
                        student3Id: '',
                        student3Name: '',
                        student4Id: '',
                        student4Name: '',
                        student5Id: '',
                        student5Name: '',
                        student6Id: '',
                        student6Name: '',
                      },
                      semesterId: semesters.find(s => s.current)?.id || 0,
                      isAdmin1: false,
                      isAdmin2: false,
                    });
                    setStudentCount(1); // Reset student count
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading || formData.semesterId === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (formData.id && formData.id > 0 ? 'Đang cập nhật...' : 'Đang upload...') : (formData.id && formData.id > 0 ? 'Cập nhật' : 'Upload')}
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
