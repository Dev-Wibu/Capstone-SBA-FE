// src/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
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
  isAdmin1: boolean;
  isAdmin2: boolean;
}

export interface CapstoneProposalResponse {
  id: number| null;
  title: string;
  context: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'DUPLICATE_REJECTED' | 'DUPLICATE_ACCEPTED';
  semester: Semester;
  attachmentUrl: string;
  nonFunc: string[];
  func: string[];
  students?: Students;
  createdAt: string;
  updatedAt: string;
  admin1: boolean;
  admin2: boolean;
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
