import axios from 'axios';
import type { Semester, CapstoneProposal, CapstoneProposalResponse } from '@/interfaces';

// Lấy base URL từ Vite env (VITE_API_BASE_URL). Nếu không có, fallback về localhost
const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng lên 30 giây vì ngrok có thể chậm
  // Không set default headers để tránh CORS preflight
});

// Request interceptor - thêm headers cần thiết
api.interceptors.request.use(
  (config) => {
    // Thêm header skip ngrok warning cho TẤT CẢ request (giống fetch trong HTML)
    config.headers['ngrok-skip-browser-warning'] = 'any-value';
    
    // Chỉ thêm Content-Type cho POST/PUT/PATCH
    if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Thêm token nếu có (lấy từ accessToken trong localStorage)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ - xóa toàn bộ auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ==================== API FUNCTIONS ====================

// ===== Semester APIs =====
/**
 * Lấy danh sách tất cả các học kỳ
 */
export const getSemesters = async (): Promise<Semester[]> => {
  const response = await api.get<Semester[]>('/api/semester');
  return response.data;
};

/**
 * Lấy chi tiết học kỳ theo ID
 */
export const getSemesterById = async (id: number): Promise<Semester> => {
  const response = await api.get<Semester>(`/api/semester/${id}`);
  return response.data;
};

/**
 * Tạo mới semester
 */
export const createSemester = async (data: {
  name: string;
  semesterCode: string;
  academic_year: number;
  current: boolean;
  startDate: string;
  endDate: string;
}): Promise<Semester> => {
  const response = await api.post<Semester>('/api/semester', {
    id: 0,
    ...data,
  });
  return response.data;
};

/**
 * Cập nhật semester
 */
export const updateSemester = async (
  id: number,
  data: Partial<{
    name: string;
    semesterCode: string;
    academic_year: number;
    current: boolean;
    startDate: string;
    endDate: string;
  }>
): Promise<Semester> => {
  const response = await api.put<Semester>(`/api/semester/${id}`, data);
  return response.data;
};

/**
 * Xóa semester
 */
export const deleteSemester = async (id: number): Promise<void> => {
  await api.delete(`/api/semester/${id}`);
};

// ===== Capstone Proposal APIs =====
/**
 * Lấy danh sách tất cả capstone proposals
 */
export const getAllProposals = async (): Promise<CapstoneProposalResponse[]> => {
  const response = await api.get<CapstoneProposalResponse[]>('/api/capstone-proposal');
  return response.data;
};

/**
 * Lấy chi tiết capstone proposal theo ID
 */
export const getProposalById = async (id: number): Promise<CapstoneProposalResponse> => {
  const response = await api.get<CapstoneProposalResponse>(`/api/capstone-proposal/${id}`);
  return response.data;
};

/**
 * Tạo mới capstone proposal
 */
export const createProposal = async (data: CapstoneProposal): Promise<CapstoneProposalResponse> => {
  const response = await api.post<CapstoneProposalResponse>('/api/capstone-proposal', data);
  return response.data;
};

/**
 * Cập nhật capstone proposal
 */
export const updateProposal = async (
  id: number,
  data: Partial<CapstoneProposal>
): Promise<CapstoneProposalResponse> => {
  const response = await api.put<CapstoneProposalResponse>(`/api/capstone-proposal/${id}`, data);
  return response.data;
};

/**
 * Xóa capstone proposal
 */
export const deleteProposal = async (id: number): Promise<void> => {
  await api.delete(`/api/capstone-proposal/${id}`);
};

/**
 * Lấy lịch sử thay đổi của capstone proposal theo ID
 */
export const getProposalHistory = async (id: number): Promise<any[]> => {
  const response = await api.get(`/api/proposal-history/${id}/history`);
  return response.data;
};

/**
 * Approve hoặc Reject proposal (Admin)
 * @param proposalId - ID của proposal
 * @param isApproved - true = approve, false = reject
 * @param adminId - ID của admin đang duyệt
 * @param reason - Lý do từ chối (chỉ cần khi reject)
 */
export const reviewProposal = async (
  proposalId: number,
  isApproved: boolean,
  adminId: number,
  reason?: string | null
): Promise<void> => {
  await api.put('/api/capstone-proposal', null, {
    params: {
      proposalId,
      isApproved,
      adminId,
      reason: reason || null,
    },
  });
};
