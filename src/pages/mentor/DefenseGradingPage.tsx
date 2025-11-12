import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCouncils, getDefenseProposalsByCouncil, getAllDefenseResults } from '@/services/api';
import GradeDefenseModal from '@/components/GradeDefenseModal';

interface CouncilMember {
  id: number;
  lecturerId?: number;
  lecturerName?: string;
  lecturerEmail?: string;
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

const DefenseGradingPage = () => {
  const { user } = useAuth();
  const [councils, setCouncils] = useState<Council[]>([]);
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const [defenseSchedules, setDefenseSchedules] = useState<any[]>([]); // Lưu schedules thay vì proposals
  const [loading, setLoading] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Fetch councils where user is PRESIDENT (by email)
  useEffect(() => {
    const fetchPresidentCouncils = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const allCouncils = await getCouncils();
        
        const presidentCouncils = allCouncils.filter((council: Council) => {
          const presidentMember = council.members?.find(
            (member: any) => member.role === 'PRESIDENT' && member.lecturerEmail === user.email
          );
          return presidentMember != null;
        });
        
        setCouncils(presidentCouncils);
      } catch (error) {
        console.error('Error fetching president councils:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresidentCouncils();
  }, [user?.email]);

  // Fetch defense proposals when council is selected
  const handleSelectCouncil = async (council: Council) => {
    setSelectedCouncil(council);
    setLoadingProposals(true);
    
    try {
      // Lấy schedules của council
      const schedules = await getDefenseProposalsByCouncil(council.id);
      
      // Lấy tất cả defense results
      const allResults = await getAllDefenseResults();
      
      // Tạo Set các scheduleId đã có kết quả
      const gradedScheduleIds = new Set(
        allResults.map((result: any) => result.schedule?.id).filter(Boolean)
      );
      
      // Lọc ra những schedule chưa được chấm điểm
      const ungradedSchedules = schedules.filter(
        (schedule: any) => !gradedScheduleIds.has(schedule.id)
      );
      
      setDefenseSchedules(ungradedSchedules);
    } catch (error) {
      console.error('Error fetching defense schedules:', error);
      setDefenseSchedules([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleGradeClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setShowGradeModal(true);
  };

  const handleGradeSuccess = () => {
    // Refresh schedules after grading
    if (selectedCouncil) {
      handleSelectCouncil(selectedCouncil);
    }
    setShowGradeModal(false);
    setSelectedSchedule(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chấm điểm bảo vệ đồ án</h1>
        <p className="text-gray-600">Chấm điểm Pass/Failed cho các đồ án đang bảo vệ</p>
      </div>

      {/* No councils found */}
      {councils.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg mb-2">Bạn không phải chủ tịch hội đồng nào</p>
          <p className="text-gray-500">Chỉ chủ tịch hội đồng mới có thể chấm điểm bảo vệ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Council List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hội đồng của bạn</h2>
            <div className="space-y-3">
              {councils.map((council) => (
                <button
                  key={council.id}
                  onClick={() => handleSelectCouncil(council)}
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    selectedCouncil?.id === council.id
                      ? 'bg-indigo-50 border-indigo-300 shadow-md'
                      : 'bg-white border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{council.name}</h3>
                  <p className="text-sm text-gray-600">{council.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {council.semesterName || `Học kỳ ${council.semesterId}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Defense Proposals */}
          <div className="lg:col-span-2">
            {!selectedCouncil ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Chọn hội đồng để xem danh sách đồ án cần chấm</p>
              </div>
            ) : loadingProposals ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : defenseSchedules.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-1">Chưa có đồ án nào cần chấm</p>
                  <p className="text-gray-500 text-sm">Đồ án phải có status DEFENSE mới hiển thị ở đây</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Đồ án cần chấm ({defenseSchedules.length})
                </h2>
                <div className="space-y-4">
                  {defenseSchedules.map((schedule) => {
                    const proposal = schedule.capstoneProposal;
                    if (!proposal) return null;
                    
                    return (
                      <div
                        key={schedule.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg">
                              {proposal.code || `#${proposal.id}`}
                            </span>
                            {proposal.status === 'SECOND_DEFENSE' ? (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-lg">
                                🔄 ĐỢT 2 - BẢO VỆ LẠI
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                                ĐỢT 1 - BẢO VỆ LẦN ĐẦU
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {proposal.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {proposal.description}
                        </p>

                        {/* Schedule Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{schedule.defenseDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{schedule.startTime.slice(0,5)} - {schedule.endTime.slice(0,5)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{schedule.room}</span>
                          </div>
                        </div>

                        {/* Students */}
                        {proposal.students && (
                          <div className="mb-4 pb-4 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 mb-2">SINH VIÊN:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(proposal.students)
                                .filter(([key, value]) => key.includes('Name') && value)
                                .map(([key, value], idx) => {
                                  const idKey = key.replace('Name', 'Id');
                                  const studentId = proposal.students?.[idKey as keyof typeof proposal.students];
                                  return (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {String(value)} ({studentId})
                                    </span>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Mentors */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <span className="font-semibold">GVHD:</span>
                          <span>
                            {proposal.lecturerCode1}
                            {proposal.lecturerCode2 && ` • ${proposal.lecturerCode2}`}
                          </span>
                        </div>

                        {/* Grade button */}
                        <button
                          onClick={() => handleGradeClick(schedule)}
                          className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                        >
                          Chấm điểm
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedSchedule && selectedSchedule.capstoneProposal && (
        <GradeDefenseModal
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedSchedule(null);
          }}
          proposal={selectedSchedule.capstoneProposal}
          scheduleId={selectedSchedule.id}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  );
};

export default DefenseGradingPage;
