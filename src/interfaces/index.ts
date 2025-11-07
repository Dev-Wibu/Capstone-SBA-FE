// Auth interfaces
export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'MENTOR' | 'ADMIN' | 'LECTURER';
  status: boolean;
  lecturerCode?: string;
  createdAt: string;
}

export interface Lecturer {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'MENTOR' | 'ADMIN' | 'LECTURER';
  status: boolean;
  lecturerCode: string;
  createdAt: string;
  updatedAt: string;
  councilMemberships: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ProfileResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'MENTOR' | 'ADMIN' | 'LECTURER';
  status: boolean;
  lecturerCode?: string;
  createdAt: string;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Semester interfaces
export interface Semester {
  id: number;
  name: string;
  semesterCode: string;
  year: number;
  endDate: string;
  current: boolean;
  startDate: string;
}

// Students interface (object with fixed keys, max 6 students)
export interface Students {
  student1Id: string;
  student1Name: string;
  student2Id?: string;
  student2Name?: string;
  student3Id?: string;
  student3Name?: string;
  student4Id?: string;
  student4Name?: string;
  student5Id?: string;
  student5Name?: string;
  student6Id?: string;
  student6Name?: string;
}

// Capstone Proposal interfaces
export interface CapstoneProposal {
  // Unified payload for both CREATE and UPDATE via POST
  // id = null for create, >0 for update
  id: number | null;
  title: string;
  context: string;
  description: string;
  func: string[];
  nonFunc: string[];
  students: Students;
  semester: {
    id: number;
  };
  lecturerCode1: string; // Lecturer hiện tại (từ localStorage)
  lecturerCode2?: string; // Lecturer phụ (optional)
  // Thời gian review (mặc định null khi tạo)
  review1At?: string | null;
  review2At?: string | null;
  review3At?: string | null;
  isAdmin1: boolean;
  isAdmin2: boolean;
  admin1Id?: number | null;
  admin2Id?: number | null;
}

export interface CapstoneProposalResponse {
  id: number| null;
  title: string;
  context: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'DUPLICATE_REJECTED' | 'DUPLICATE_ACCEPTED' | 'REJECT_BY_ADMIN' | 'REVIEW_1' | 'REVIEW_2' | 'REVIEW_3' | 'DEFENSE' | 'SECOND_DEFENSE' | 'COMPLETED' | 'FAILED';
  semester: Semester | null;
  attachmentUrl: string | null;
  nonFunc: string[];
  func: string[];
  students?: Students;
  lecturerCode1?: string;
  lecturerCode2?: string;
  review1At: string | null;
  review2At: string | null;
  review3At: string | null;
  lecturerReview1Code?: string | null;
  lecturerReview2Code?: string | null;
  lecturerReview3Code?: string | null;
  createdAt: string;
  updatedAt: string;
  // Admin approval flags
  isAdmin1: boolean;
  admin1Id: number | null;
  isAdmin2: boolean;
  admin2Id: number | null;
}

// Resource interfaces
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}

// Semester Form interfaces
export interface SemesterFormData {
  name: string;
  semesterCode: string;
  academic_year: number;
  current: boolean;
  startDate: string;
  endDate: string;
}

export interface CreateSemesterPayload {
  id: number;
  name: string;
  semesterCode: string;
  academic_year: number;
  current: boolean;
  startDate: string;
  endDate: string;
}

// Proposal History interfaces
export interface ProposalHistoryEntry {
  id: number;
  capstoneProposal: CapstoneProposalResponse;
  reason: string;
  title: string;
  context: string;
  description: string;
  attachmentUrl: string | null;
  nonFunc: string[];
  func: string[];
  createdAt: string;
}
