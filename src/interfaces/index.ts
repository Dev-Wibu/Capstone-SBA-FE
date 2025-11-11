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
  reviewerCode1?: string;
  reviewerCode2?: string;
  reviewerCode3?: string;
  reviewerCode4?: string;
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

// Reviewer interface (object with fixed keys for review rounds)
// Review 1: reviewer1 + reviewer2 (2 mentors)
// Review 2: reviewer3 + reviewer4 (2 mentors)  
// Review 3: reviewer5 + reviewer6 (2 mentors)
export interface Reviewer {
  reviewer1Code: string | null;
  reviewer1Name: string | null;
  reviewer2Code: string | null;
  reviewer2Name: string | null;
  reviewer3Code: string | null;
  reviewer3Name: string | null;
  reviewer4Code: string | null;
  reviewer4Name: string | null;
  reviewer5Code: string | null;
  reviewer5Name: string | null;
  reviewer6Code: string | null;
  reviewer6Name: string | null;
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
  // Reviewer approval flags
  isReviewerApprove1?: boolean | null;
  isReviewerApprove2?: boolean | null;
  isReviewerApprove3?: boolean | null;
  isReviewerApprove4?: boolean | null;
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
  reviewer: Reviewer | null;
  createdAt: string;
  updatedAt: string;
  // Reviewer approval flags
  isReviewerApprove1: boolean | null;
  isReviewerApprove2: boolean | null;
  isReviewerApprove3: boolean | null;
  isReviewerApprove4: boolean | null;
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
