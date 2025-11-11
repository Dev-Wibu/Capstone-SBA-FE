import { useState, useEffect } from 'react';
import { getSchedules, getAllProposals, getCouncils, createSchedule, getLecturerByCode } from '@/services/api';
import { toast } from 'sonner';

interface Schedule {
  id: number;
  capstoneProposal: {
    id: number;
    title: string;
    students?: {
      student1Name?: string;
    };
    lecturerCode1?: string;
    lecturerCode2?: string;
  };
  council: {
    id: number;
    name: string;
  };
  defenseDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: string;
  mentorNames?: {
    lecturerName1?: string;
    lecturerName2?: string;
  };
}

interface DefenseProject {
  id: number;
  title: string;
  studentName?: string;
  lecturerCode1?: string;
  lecturerCode2?: string;
  lecturerId1?: number;
  lecturerId2?: number;
  lecturerName1?: string;
  lecturerName2?: string;
}

interface Council {
  id: number;
  name: string;
  semesterName?: string;
  members?: Array<{
    memberId: number;
    lecturerId: number;
    lecturerName?: string;
    lecturerEmail?: string;
    role: string;
  }>;
}

interface DraggedProject {
  project: DefenseProject;
  date: string;
  time: string;
}

const DefenseSchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [defenseProjects, setDefenseProjects] = useState<DefenseProject[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(today.setDate(diff));
  });
  const [draggedProject, setDraggedProject] = useState<DraggedProject | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    capstoneProjectId: 0,
    councilId: 0,
    defenseDate: '',
    startTime: '',
    endTime: '',
    room: ''
  });

  // Time slots: 7:00 - 17:00, each slot is 1.5 hours
  const timeSlots = [
    { start: '07:00', end: '08:30' },
    { start: '08:30', end: '10:00' },
    { start: '10:00', end: '11:30' },
    { start: '11:30', end: '13:00' },
    { start: '13:00', end: '14:30' },
    { start: '14:30', end: '16:00' },
    { start: '16:00', end: '17:30' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, proposalsData, councilsData] = await Promise.all([
        getSchedules(),
        getAllProposals(),
        getCouncils()
      ]);
      
      // Councils đã có đầy đủ thông tin members với lecturerName từ API
      setCouncils(councilsData);
      
      // Enrich schedules với mentor names từ lecturerCode trong capstoneProposal
      const enrichedSchedules = await Promise.all(
        schedulesData.map(async (schedule: any) => {
          let lecturerName1: string | undefined;
          let lecturerName2: string | undefined;
          
          try {
            if (schedule.capstoneProposal.lecturerCode1) {
              const lecturer1 = await getLecturerByCode(schedule.capstoneProposal.lecturerCode1);
              lecturerName1 = lecturer1.fullName;
            }
          } catch (error) {
            console.error(`Error fetching lecturer1 ${schedule.capstoneProposal.lecturerCode1}:`, error);
          }
          
          try {
            if (schedule.capstoneProposal.lecturerCode2) {
              const lecturer2 = await getLecturerByCode(schedule.capstoneProposal.lecturerCode2);
              lecturerName2 = lecturer2.fullName;
            }
          } catch (error) {
            console.error(`Error fetching lecturer2 ${schedule.capstoneProposal.lecturerCode2}:`, error);
          }
          
          return {
            ...schedule,
            mentorNames: {
              lecturerName1,
              lecturerName2
            }
          };
        })
      );
      setSchedules(enrichedSchedules);
      
      // Lọc các đồ án có status DEFENSE và chưa được xếp lịch
      const scheduledProjectIds = new Set(schedulesData.map((s: any) => s.capstoneProposal.id));
      const defenseProposals = proposalsData.filter((p: any) => p.status === 'DEFENSE' && !scheduledProjectIds.has(p.id));
      
      // Fetch lecturer IDs và names từ codes
      const defenseProjs = await Promise.all(
        defenseProposals.map(async (p: any) => {
          let lecturerId1: number | undefined;
          let lecturerId2: number | undefined;
          let lecturerName1: string | undefined;
          let lecturerName2: string | undefined;
          
          try {
            if (p.lecturerCode1) {
              const lecturer1 = await getLecturerByCode(p.lecturerCode1);
              lecturerId1 = lecturer1.id;
              lecturerName1 = lecturer1.fullName;
            }
          } catch (error) {
            console.error(`Error fetching lecturer1 ${p.lecturerCode1}:`, error);
          }
          
          try {
            if (p.lecturerCode2) {
              const lecturer2 = await getLecturerByCode(p.lecturerCode2);
              lecturerId2 = lecturer2.id;
              lecturerName2 = lecturer2.fullName;
            }
          } catch (error) {
            console.error(`Error fetching lecturer2 ${p.lecturerCode2}:`, error);
          }
          
          return {
            id: p.id,
            title: p.title,
            studentName: p.students?.student1Name,
            lecturerCode1: p.lecturerCode1,
            lecturerCode2: p.lecturerCode2,
            lecturerId1,
            lecturerId2,
            lecturerName1,
            lecturerName2
          };
        })
      );
      
      setDefenseProjects(defenseProjs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Normalize time format: "10:00:00" -> "10:00"
  const normalizeTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Lấy 5 ký tự đầu (HH:MM)
  };

  // Drag handlers
  const handleDragStart = (project: DefenseProject) => {
    setDraggedProject({ project, date: '', time: '' });
  };

  const handleDrop = (date: string, startTime: string, endTime: string) => {
    if (draggedProject) {
      setScheduleForm({
        capstoneProjectId: draggedProject.project.id,
        councilId: 0,
        defenseDate: date,
        startTime: startTime,
        endTime: endTime,
        room: ''
      });
      setShowScheduleForm(true);
      setDraggedProject(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleForm.councilId) {
      toast.error('Vui lòng chọn hội đồng');
      return;
    }
    if (!scheduleForm.endTime) {
      toast.error('Vui lòng nhập giờ kết thúc');
      return;
    }
    if (!scheduleForm.room.trim()) {
      toast.error('Vui lòng nhập phòng');
      return;
    }

    try {
      await createSchedule(scheduleForm);
      toast.success('Xếp lịch bảo vệ thành công!', {
        description: `Đồ án đã được xếp lịch vào ${scheduleForm.defenseDate} lúc ${scheduleForm.startTime}`
      });
      setShowScheduleForm(false);
      setScheduleForm({
        capstoneProjectId: 0,
        councilId: 0,
        defenseDate: '',
        startTime: '',
        endTime: '',
        room: ''
      });
      await fetchData();
    } catch (error: any) {
      console.error('❌ LỖI KHI XẾP LỊCH:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      toast.error('Có lỗi xảy ra khi xếp lịch', {
        description: error.response?.data?.message || 'Vui lòng thử lại sau'
      });
    }
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

  const selectedProject = defenseProjects.find(p => p.id === scheduleForm.capstoneProjectId);

  // Lọc các hội đồng không chứa mentor của đồ án
  const availableCouncils = councils.filter(council => {
    if (!selectedProject || !council.members) return true;
    
    // Lấy lecturer IDs của mentor
    const mentorIds = [selectedProject.lecturerId1, selectedProject.lecturerId2].filter(Boolean) as number[];
    if (mentorIds.length === 0) return true;
    
    // Kiểm tra xem có mentor nào nằm trong hội đồng không (so sánh bằng lecturerId)
    const hasMentorInCouncil = council.members.some(member => 
      mentorIds.includes(member.lecturerId)
    );
    
    return !hasMentorInCouncil;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xếp lịch hội đồng bảo vệ đồ án</h1>
        <p className="text-gray-600 mt-1">Kéo thả đồ án vào lịch để xếp lịch bảo vệ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule - Left side (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Tuần {weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={goToCurrentWeek}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
                >
                  Tuần này
                </button>
                <button 
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header - Days of week */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="p-2 text-center font-semibold text-gray-600 text-sm">
                    Giờ
                  </div>
                  {weekDays.map((day, index) => {
                    const isToday = new Date().toDateString() === day.toDateString();
                    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()];
                    return (
                      <div 
                        key={index} 
                        className={`p-2 text-center rounded-lg ${isToday ? 'bg-indigo-500 text-white font-bold' : 'bg-gray-50 text-gray-700'}`}
                      >
                        <div className="text-xs">{dayName}</div>
                        <div className="text-sm font-semibold">{day.getDate()}/{day.getMonth() + 1}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Time Slots */}
                {timeSlots.map((slot, slotIndex) => {
                  return (
                    <div key={slotIndex} className="grid grid-cols-8 gap-1 mb-1">
                      {/* Time label */}
                      <div className="p-2 text-xs text-gray-600 font-medium text-center bg-gray-50 rounded-lg flex items-center justify-center">
                        {slot.start}<br/>-<br/>{slot.end}
                      </div>
                      
                      {/* Day cells */}
                      {weekDays.map((day, dayIndex) => {
                        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                        const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
                        
                        // Check if there's a schedule in this slot
                        const scheduleInSlot = schedules.find(s => {
                          const sDate = s.defenseDate;
                          const sStart = normalizeTime(s.startTime);
                          const sEnd = normalizeTime(s.endTime);
                          
                          return sDate === dateStr && sStart === slot.start && sEnd === slot.end;
                        });
                        
                        return (
                          <div
                            key={dayIndex}
                            onDrop={() => !isPast && handleDrop(dateStr, slot.start, slot.end)}
                            onDragOver={handleDragOver}
                            onClick={() => scheduleInSlot && setSelectedSchedule(scheduleInSlot)}
                            className={`
                              min-h-[80px] p-2 rounded-lg border-2 transition-all
                              ${isPast ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-200 hover:border-indigo-300 cursor-pointer'}
                              ${scheduleInSlot ? 'bg-indigo-100 border-indigo-400 hover:bg-indigo-200 cursor-pointer' : 'bg-white'}
                              ${!isPast && draggedProject ? 'hover:bg-indigo-50 hover:shadow-md' : ''}
                            `}
                          >
                            {scheduleInSlot && (
                              <div className="text-xs">
                                <p className="font-semibold text-indigo-900 truncate mb-1" title={scheduleInSlot.capstoneProposal.title}>
                                  {scheduleInSlot.capstoneProposal.title.length > 20 
                                    ? scheduleInSlot.capstoneProposal.title.substring(0, 20) + '...'
                                    : scheduleInSlot.capstoneProposal.title
                                  }
                                </p>
                                <p className="text-indigo-700">📍 {scheduleInSlot.room}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-400 rounded"></div>
                <span className="text-gray-600">Đã xếp lịch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
                <span className="text-gray-600">Đã qua</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
                <span className="text-gray-600">Trống</span>
              </div>
            </div>
          </div>
        </div>

        {/* Defense Projects - Right side (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Đồ án cần xếp lịch
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Kéo đồ án vào ngày trên lịch để xếp lịch bảo vệ
            </p>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {defenseProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Không có đồ án nào cần xếp lịch</p>
                </div>
              ) : (
                defenseProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={() => handleDragStart(project)}
                    className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-lg p-4 cursor-move hover:shadow-md transition-all hover:scale-105"
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {project.title}
                        </h3>
                        {project.studentName && (
                          <p className="text-xs text-gray-600 mt-1">
                            SV: {project.studentName}
                          </p>
                        )}
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          ID: {project.id}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && selectedProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Hoàn tất xếp lịch</h2>
              <p className="text-indigo-100 mt-1">Chọn hội đồng và phòng cho đồ án</p>
            </div>

            <form onSubmit={handleSubmitSchedule} className="p-6 space-y-6">
              {/* Thông tin đồ án */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Đồ án:</p>
                <p className="font-bold text-gray-900">{selectedProject.title}</p>
                {selectedProject.studentName && (
                  <p className="text-sm text-gray-600 mt-1">Sinh viên: {selectedProject.studentName}</p>
                )}
              </div>

              {/* Ngày và giờ */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày bảo vệ
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.defenseDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, defenseDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Hội đồng */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hội đồng bảo vệ <span className="text-red-500">*</span>
                </label>
                <select
                  value={scheduleForm.councilId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, councilId: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value={0}>-- Chọn hội đồng --</option>
                  {availableCouncils.length === 0 ? (
                    <option disabled>Không có hội đồng phù hợp (mentor trong hội đồng)</option>
                  ) : (
                    availableCouncils.map((council) => (
                      <option key={council.id} value={council.id}>
                        {council.name} {council.semesterName && `(${council.semesterName})`}
                      </option>
                    ))
                  )}
                </select>
                {availableCouncils.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Tất cả hội đồng đều chứa mentor của đồ án này
                  </p>
                )}
                {selectedProject && (selectedProject.lecturerCode1 || selectedProject.lecturerCode2) && (
                  <p className="text-xs text-gray-500 mt-1">
                    📌 Mentor: {[selectedProject.lecturerCode1, selectedProject.lecturerCode2].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* Phòng */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleForm.room}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                  placeholder="Ví dụ: A101, B205..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setScheduleForm({
                      capstoneProjectId: 0,
                      councilId: 0,
                      defenseDate: '',
                      startTime: '',
                      endTime: '',
                      room: ''
                    });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition"
                >
                  Xác nhận xếp lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Chi tiết lịch bảo vệ</h2>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Thông tin đề tài</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-lg font-semibold text-gray-900 mb-2">{selectedSchedule.capstoneProposal.title}</p>
                  
                  <div className="space-y-1 text-sm text-gray-700">
                    {selectedSchedule.mentorNames && (selectedSchedule.mentorNames.lecturerName1 || selectedSchedule.mentorNames.lecturerName2) && (
                      <p>
                        <span className="font-medium">Giảng viên hướng dẫn:</span>{' '}
                        {[
                          selectedSchedule.mentorNames.lecturerName1,
                          selectedSchedule.mentorNames.lecturerName2
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Council Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Hội đồng bảo vệ</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-lg font-semibold text-gray-900 mb-3">{selectedSchedule.council.name}</p>
                  
                  {(() => {
                    const fullCouncil = councils.find(c => c.id === selectedSchedule.council.id);
                    
                    if (fullCouncil?.members && fullCouncil.members.length > 0) {
                      return (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Thành viên hội đồng:</p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {fullCouncil.members.map((member: any, index: number) => (
                              <li key={index} className="pl-4">
                                • {member.lecturerName || member.fullName || member.lecturerCode || 'N/A'} {member.role && <span className="text-gray-500">- {member.role}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return <p className="text-sm text-gray-500">Không có thông tin thành viên</p>;
                  })()}
                </div>
              </div>

              {/* Schedule Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Thời gian & địa điểm</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Ngày bảo vệ:</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedSchedule.defenseDate).toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Thời gian:</p>
                      <p className="font-semibold text-gray-900">
                        {normalizeTime(selectedSchedule.startTime)} - {normalizeTime(selectedSchedule.endTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Phòng:</p>
                      <p className="font-semibold text-gray-900">{selectedSchedule.room}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Trạng thái:</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        {selectedSchedule.status === 'SCHEDULED' ? 'Đã xếp lịch' : selectedSchedule.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefenseSchedulePage;
