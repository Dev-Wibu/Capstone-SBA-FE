import api from './api';
import type { Semester, CapstoneProposal, CapstoneProposalResponse } from '@/interfaces';

/**
 * Service để xử lý các API liên quan đến Capstone Proposal
 */
class CapstoneService {
  /**
   * Lấy danh sách tất cả các học kỳ
   */
  async getSemesters(): Promise<Semester[]> {
    const response = await api.get<Semester[]>('/api/semester');
    return response.data;
  }

  /**
   * Tạo mới capstone proposal
   * @param data - Dữ liệu capstone proposal cần tạo
   */
  async createProposal(data: CapstoneProposal): Promise<CapstoneProposalResponse> {
    const response = await api.post<CapstoneProposalResponse>('/api/capstone-proposal', data);
    return response.data;
  }

  /**
   * Lấy chi tiết capstone proposal theo ID
   * @param id - ID của capstone proposal
   */
  async getProposalById(id: number): Promise<CapstoneProposalResponse> {
    const response = await api.get<CapstoneProposalResponse>(`/api/capstone-proposal/${id}`);
    return response.data;
  }

  /**
   * Lấy danh sách tất cả capstone proposals
   */
  async getAllProposals(): Promise<CapstoneProposalResponse[]> {
    const response = await api.get<CapstoneProposalResponse[]>('/api/capstone-proposal');
    return response.data;
  }

  /**
   * Cập nhật capstone proposal
   * @param id - ID của capstone proposal
   * @param data - Dữ liệu cần cập nhật
   */
  async updateProposal(id: number, data: Partial<CapstoneProposal>): Promise<CapstoneProposalResponse> {
    const response = await api.put<CapstoneProposalResponse>(`/api/capstone-proposal/${id}`, data);
    return response.data;
  }

  /**
   * Xóa capstone proposal
   * @param id - ID của capstone proposal
   */
  async deleteProposal(id: number): Promise<void> {
    await api.delete(`/api/capstone-proposal/${id}`);
  }
}

// Export singleton instance
export const capstoneService = new CapstoneService();
export default capstoneService;
