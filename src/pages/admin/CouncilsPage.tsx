import { useState, useEffect } from 'react';
import { getCouncils, getLecturerById } from '@/services/api';
import CreateCouncilModal from '@/components/CreateCouncilModal';

interface CouncilMember {
  id: number;
  lecturerId: number;
  lecturerName?: string;
  lecturerCode?: string;
  role: 'PRESIDENT' | 'SECRETARY' | 'REVIEWER' | 'GUEST';
}

interface Council {
  id: number;
  name: string;
  description: string;
  semesterId: number;
  semesterName?: string;
  members: CouncilMember[];
  createdAt: string;
}

const CouncilsPage = () => {
  const [councils, setCouncils] = useState<Council[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCouncilId, setExpandedCouncilId] = useState<number | null>(null);

  const fetchCouncils = async () => {
    try {
      setLoading(true);
      const data = await getCouncils();
      
      // Fetch lecturer code for each member
      const councilsWithLecturerCodes = await Promise.all(
        data.map(async (council) => {
          const membersWithCodes = await Promise.all(
            council.members.map(async (member: CouncilMember) => {
              try {
                const lecturerDetail = await getLecturerById(member.lecturerId);
                return {
                  ...member,
                  lecturerCode: lecturerDetail.lecturerCode,
                  lecturerName: lecturerDetail.fullName || member.lecturerName
                };
              } catch (error) {
                console.error(`Error fetching lecturer ${member.lecturerId}:`, error);
                return member;
              }
            })
          );
          return {
            ...council,
            members: membersWithCodes
          };
        })
      );
      
      setCouncils(councilsWithLecturerCodes);
    } catch (error) {
      console.error('Error fetching councils:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouncils();
  }, []);

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      PRESIDENT: 'Chủ tích',
      SECRETARY: 'Thư ký',
      REVIEWER: 'Giám khảo',
      GUEST: 'Khách mời'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      PRESIDENT: 'bg-purple-100 text-purple-800 border-purple-200',
      SECRETARY: 'bg-blue-100 text-blue-800 border-blue-200',
      REVIEWER: 'bg-green-100 text-green-800 border-green-200',
      GUEST: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hội đồng bảo vệ</h1>
            <p className="text-gray-600 mt-1">Quản lý các hội đồng bảo vệ đồ án tốt nghiệp</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition shadow-lg"
          >
            Tạo hội đồng mới
          </button>
        </div>
      </div>

      {/* Councils List */}
      {councils.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg mb-2">Chưa có hội đồng nào</p>
          <p className="text-gray-500 mb-4">Tạo hội đồng bảo vệ đầu tiên của bạn</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
          >
            Tạo hội đồng mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {councils.map((council) => {
            const isExpanded = expandedCouncilId === council.id;
            const presidentMember = council.members.find(m => m.role === 'PRESIDENT');
            const secretaryMember = council.members.find(m => m.role === 'SECRETARY');
            
            return (
              <div
                key={council.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {council.name}
                      </h3>
                      {council.description && (
                        <p className="text-gray-600 text-sm mb-3">{council.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-600">
                          {council.semesterName || `Học kỳ ${council.semesterId}`}
                        </span>
                        <span className="text-gray-600">
                          {council.members.length} thành viên
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedCouncilId(isExpanded ? null : council.id)}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition text-sm ml-4"
                    >
                      {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                  </div>

                  {/* Quick info */}
                  <div className="flex flex-wrap gap-3">
                    {presidentMember && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <p className="text-xs text-purple-600 font-semibold">Chủ tích</p>
                          <p className="text-sm text-purple-900 font-medium">
                            {presidentMember.lecturerName} {presidentMember.lecturerCode && `(${presidentMember.lecturerCode})`}
                          </p>
                        </div>
                      </div>
                    )}
                    {secretaryMember && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">Thư ký</p>
                          <p className="text-sm text-blue-900 font-medium">
                            {secretaryMember.lecturerName} {secretaryMember.lecturerCode && `(${secretaryMember.lecturerCode})`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Danh sách thành viên đầy đủ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {council.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {member.lecturerName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Mã GV: {member.lecturerCode || 'Không có'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Council Modal */}
      <CreateCouncilModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCouncils}
      />
    </div>
  );
};

export default CouncilsPage;
