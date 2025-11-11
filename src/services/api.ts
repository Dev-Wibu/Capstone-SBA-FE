import axios from 'axios';
import type { Semester, CapstoneProposal, CapstoneProposalResponse, Lecturer } from '@/interfaces';

// Lấy base URL từ Vite env (VITE_API_BASE_URL). Nếu không có, fallback về localhost
const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || 'https://66b7b94833d1.ngrok-free.app';

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
    // CHỈ logout nếu:
    // 1. Response status là 401
    // 2. User đang có token (tức là đang login)
    // 3. Không phải đang ở trang login
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem('accessToken');
      const isLoginPage = window.location.pathname === '/login';
      
      if (hasToken && !isLoginPage) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
 * Cập nhật semester và thêm hội đồng duyệt đồ án
 */
export const updateSemesterWithReviewBoard = async (data: {
  id: number;
  name: string;
  semesterCode: string;
  academic_year: number;
  reviewerCode1: string;
  reviewerCode2: string;
  reviewerCode3: string;
  reviewerCode4: string;
  endDate: string;
  current: boolean;
  startDate: string;
}): Promise<Semester> => {
  const response = await api.put<Semester>('/api/semester', data);
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
 * Lấy danh sách proposals cần duyệt bởi admin cụ thể
 * (Proposals có status DUPLICATE_ACCEPTED và admin chưa được assign)
 */
export const getProposalsByAdmin = async (adminId: number): Promise<CapstoneProposalResponse[]> => {
  const response = await api.get<CapstoneProposalResponse[]>(`/api/capstone-proposal/by-admin/${adminId}`);
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
 * Approve hoặc Reject proposal (Admin/Reviewer)
 * @param proposalId - ID của proposal
 * @param isApproved - true = approve, false = reject
 * @param reviewerCode - Mã giảng viên (lecturerCode) của người đang duyệt
 * @param reason - Lý do từ chối (chỉ cần khi reject)
 */
export const reviewProposal = async (
  proposalId: number,
  isApproved: boolean,
  reviewerCode: string,
  reason?: string | null
): Promise<void> => {
  await api.put('/api/capstone-proposal', null, {
    params: {
      proposalId,
      isApproved,
      reviewerCode,
      reason: reason || null,
    },
  });
};

/**
 * Kiểm tra trùng lặp proposal
 * @param proposalId - ID của proposal cần kiểm tra
 */
export const checkDuplicateProposal = async (proposalId: number): Promise<{
  distance: number;
  closestId: string;
  currtentId: number;
  duplicate: boolean;
}> => {
  const response = await api.get(`/api/capstone-proposal/check-duplicate/${proposalId}`);
  return response.data;
};

// ===== Lecturer APIs =====
/**
 * Lấy danh sách tất cả lecturers
 */
export const getLecturers = async (): Promise<Lecturer[]> => {
  const response = await api.get<Lecturer[]>('/api/lecturers');
  return response.data;
};

/**
 * Lấy thông tin lecturer theo ID
 */
export const getLecturerById = async (id: number): Promise<Lecturer> => {
  const response = await api.get<Lecturer>(`/api/lecturers/${id}`);
  return response.data;
};

/**
 * Lấy thông tin lecturer theo code
 */
export const getLecturerByCode = async (code: string): Promise<Lecturer> => {
  const response = await api.get<Lecturer>(`/api/lecturers/by-code/${code}`);
  return response.data;
};

// ===== Review schedule APIs =====
/**
 * Cập nhật lịch review cho proposal
 * @param proposalId ID của proposal
 * @param date Ngày giờ theo định dạng 'YYYY-MM-DDTHH:mm:ss' (không timezone)
 * @param reviewTime 1 | 2 | 3 tương ứng REVIEW_1/2/3
 * @param mentorCode1
 * @param mentorName1 
 * @param mentorCode2 Mã mentor thứ 2 (tất cả review đều có 2 mentor)
 * @param mentorName2 Tên mentor thứ 2 (tất cả review đều có 2 mentor)
 */
export const updateProposalReview = async (
  proposalId: number,
  date: string,
  reviewTime: 1 | 2 | 3,
  mentorCode1?: string,
  mentorName1?: string,
  mentorCode2?: string,
  mentorName2?: string
): Promise<void> => {
  const params: any = { proposalId, date, reviewTime };
  
  if (mentorCode1) params.mentorCode1 = mentorCode1;
  if (mentorName1) params.mentorName1 = mentorName1;
  if (mentorCode2) params.mentorCode2 = mentorCode2;
  if (mentorName2) params.mentorName2 = mentorName2;
  
  await api.put('/api/capstone-proposal/update-review', null, { params });
};

/**
 * Cập nhật quyết định duyệt/từ chối của hội đồng
 * Backend sẽ tự xử lý việc cập nhật isReviewerApprove dựa vào lecturerCode
 * @param proposalId ID của proposal
 */
export const updateReviewBoardDecision = async (proposalId: number): Promise<void> => {
  await api.put('/api/capstone-proposal/update-review', null, {
    params: { proposalId }
  });
};

/**
 * Cập nhật hệ số ratio
 * @param id ID cố định (1)
 * @param ratio Hệ số từ 0.5 đến 1.0
 */
export const updateRatio = async (id: number, ratio: number): Promise<void> => {
  await api.put('/api/capstone-proposal/rate', {
    id,
    ratio,
  });
};

/**
 * Lấy hệ số ratio hiện tại
 */
export const getRatio = async (): Promise<{ id: number; ratio: number }> => {
  const response = await api.get('/api/capstone-proposal/rate');
  return response.data;
};

// ===== Council APIs =====
/**
 * Tạo hội đồng bảo vệ đồ án mới
 */
export const createCouncil = async (data: {
  name: string;
  description: string;
  semesterId: number;
  members: Array<{
    lecturerId: number;
    role: 'PRESIDENT' | 'SECRETARY' | 'REVIEWER' | 'GUEST';
  }>;
}): Promise<any> => {
  const response = await api.post('/api/councils', data);
  return response.data;
};

/**
 * Lấy danh sách tất cả councils
 */
export const getCouncils = async (): Promise<any[]> => {
  const response = await api.get('/api/councils');
  return response.data;
};

/**
 * Lấy thông tin council theo ID
 */
export const getCouncilById = async (id: number): Promise<any> => {
  const response = await api.get(`/api/councils/${id}`);
  return response.data;
};

/**
 * Cập nhật council
 */
export const updateCouncil = async (
  id: number,
  data: {
    name: string;
    description: string;
    semesterId: number;
    members: Array<{
      lecturerId: number;
      role: 'PRESIDENT' | 'SECRETARY' | 'REVIEWER' | 'GUEST';
    }>;
  }
): Promise<any> => {
  const response = await api.put(`/api/councils/${id}`, data);
  return response.data;
};

/**
 * Xóa council
 */
export const deleteCouncil = async (id: number): Promise<void> => {
  await api.delete(`/api/councils/${id}`);
};

// ===== Schedule APIs =====
/**
 * Tạo lịch bảo vệ đồ án
 */
export const createSchedule = async (data: {
  capstoneProjectId: number;
  councilId: number;
  defenseDate: string;
  startTime: string;
  endTime: string;
  room: string;
}): Promise<any> => {
  const response = await api.post('/api/schedules', data);
  return response.data;
};

/**
 * Lấy danh sách lịch bảo vệ
 */
export const getSchedules = async (): Promise<any[]> => {
  const response = await api.get('/api/schedules');
  return response.data;
};
