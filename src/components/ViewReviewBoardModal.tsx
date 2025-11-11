import { useState, useEffect } from 'react';
import type { Semester, Lecturer } from '@/interfaces';
import { getSemesters, getLecturers } from '@/services/api';
import { toast } from 'sonner';

interface ViewReviewBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewReviewBoardModal = ({ isOpen, onClose }: ViewReviewBoardModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [semestersData, lecturersData] = await Promise.all([
        getSemesters(),
        getLecturers()
      ]);
      
      // Lọc chỉ các học kỳ đã có hội đồng (có ít nhất 1 reviewerCode)
      const semestersWithReviewBoard = semestersData.filter(s => 
        s.reviewerCode1 || s.reviewerCode2 || s.reviewerCode3 || s.reviewerCode4
      );
      
      setSemesters(semestersWithReviewBoard);
      setLecturers(lecturersData);
      
      // Tự động chọn học kỳ hiện tại nếu có
      const currentSemester = semestersWithReviewBoard.find(s => s.current);
      if (currentSemester) {
        setSelectedSemester(currentSemester);
      } else if (semestersWithReviewBoard.length > 0) {
        setSelectedSemester(semestersWithReviewBoard[0]);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const getLecturerInfo = (lecturerCode: string | undefined) => {
    if (!lecturerCode) return null;
    return lecturers.find(l => l.lecturerCode === lecturerCode);
  };

  const getReviewBoardMembers = () => {
    if (!selectedSemester) return [];
    
    const members = [
      { code: selectedSemester.reviewerCode1, position: 1 },
      { code: selectedSemester.reviewerCode2, position: 2 },
      { code: selectedSemester.reviewerCode3, position: 3 },
      { code: selectedSemester.reviewerCode4, position: 4 },
    ];
    
    return members
      .filter(m => m.code)
      .map(m => ({
        ...m,
        lecturer: getLecturerInfo(m.code)
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Danh sách hội đồng duyệt đồ án
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Xem thông tin các giảng viên trong hội đồng
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : semesters.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium mb-2">Chưa có hội đồng nào</p>
              <p className="text-gray-400 text-sm">Vui lòng thêm học kỳ và thiết lập hội đồng duyệt</p>
            </div>
          ) : (
            <>
              {/* Chọn học kỳ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn học kỳ
                </label>
                <select
                  value={selectedSemester?.id || ''}
                  onChange={(e) => {
                    const semester = semesters.find(s => s.id === Number(e.target.value));
                    setSelectedSemester(semester || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                >
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name} ({semester.semesterCode}) {semester.current ? '- Hiện tại' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thông tin học kỳ */}
              {selectedSemester && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📅</span>
                    <span>Thông tin học kỳ</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Tên học kỳ:</span>
                      <p className="font-medium text-gray-900">{selectedSemester.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Mã học kỳ:</span>
                      <p className="font-medium text-gray-900">{selectedSemester.semesterCode}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Năm học:</span>
                      <p className="font-medium text-gray-900">{selectedSemester.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <p className="font-medium text-gray-900">
                        {selectedSemester.current ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                            <span>✓</span>
                            <span>Đang diễn ra</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Đã kết thúc</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách hội đồng */}
              {selectedSemester && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>👥</span>
                    <span>Thành viên hội đồng ({getReviewBoardMembers().length} người)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getReviewBoardMembers().map((member, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {member.position}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {member.lecturer?.fullName || 'N/A'}
                              </h4>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                <span>📋</span>
                                <span>{member.code}</span>
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{member.lecturer?.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{member.lecturer?.phoneNumber || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getReviewBoardMembers().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Học kỳ này chưa có thành viên hội đồng</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewBoardModal;
