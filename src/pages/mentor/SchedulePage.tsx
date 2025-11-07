import { useState } from 'react';

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'presentation';
  description: string;
  location?: string;
  participants?: string[];
}

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'Họp nhóm đồ án',
      date: '2025-11-05',
      time: '14:00',
      type: 'meeting',
      description: 'Thảo luận tiến độ và phân công công việc',
      location: 'Phòng H201',
      participants: ['Nguyễn Văn A', 'Trần Thị B'],
    },
    {
      id: '2',
      title: 'Deadline nộp báo cáo giữa kỳ',
      date: '2025-11-10',
      time: '23:59',
      type: 'deadline',
      description: 'Nộp báo cáo tiến độ giữa kỳ cho mentor',
    },
    {
      id: '3',
      title: 'Presentation đồ án',
      date: '2025-11-15',
      time: '09:00',
      type: 'presentation',
      description: 'Thuyết trình đồ án trước hội đồng',
      location: 'Hội trường A',
      participants: ['Toàn nhóm', 'Hội đồng'],
    },
    {
      id: '4',
      title: 'Review code với mentor',
      date: '2025-11-08',
      time: '15:30',
      type: 'meeting',
      description: 'Mentor review và góp ý code',
      location: 'Online - Google Meet',
    },
  ]);

  const getEventTypeConfig = (type: ScheduleEvent['type']) => {
    const configs = {
      meeting: {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        label: 'Họp',
      },
      deadline: {
        bg: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Deadline',
      },
      presentation: {
        bg: 'bg-purple-100',
        border: 'border-purple-500',
        text: 'text-purple-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        ),
        label: 'Thuyết trình',
      },
    };
    return configs[type];
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
  );

  const upcomingEvents = sortedEvents.filter(event => 
    new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch đồ án
        </h1>
        <p className="text-gray-600">
          Quản lý lịch trình và deadline của nhóm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
                >
                  Hôm nay
                </button>
                <button 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvent = events.some(e => e.date === dateStr);
                const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all ${
                      isToday 
                        ? 'bg-orange-500 text-white font-bold shadow-md' 
                        : hasEvent 
                        ? 'bg-orange-100 text-orange-700 font-medium hover:bg-orange-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <span className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full mt-8"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Event Button */}
          <button className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-lg">
            + Thêm sự kiện mới
          </button>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sự kiện sắp tới
            </h2>
            
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Không có sự kiện nào
                </p>
              ) : (
                upcomingEvents.map((event) => {
                  const config = getEventTypeConfig(event.type);
                  return (
                    <div
                      key={event.id}
                      className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={config.text}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {event.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text} font-medium`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.time}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
