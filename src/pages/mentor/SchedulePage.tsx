import { useState, useEffect } from 'react';
import { getAllProposals, getSchedules } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CalendarEvent } from '@/interfaces';

const SchedulePage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents();
  }, [user]);

  const fetchAllEvents = async () => {
    if (!user?.lecturerCode || !user?.email) return;
    
    try {
      setLoading(true);
      const [proposals, defenseSchedules] = await Promise.all([
        getAllProposals(),
        getSchedules()
      ]);

      const allEvents: CalendarEvent[] = [];

      // 1. Fetch Review Events
      proposals.forEach((proposal) => {
        const currentLecturerCode = user.lecturerCode;

        const isMyProposal = 
          proposal.lecturerCode1 === currentLecturerCode || 
          proposal.lecturerCode2 === currentLecturerCode;

        if (proposal.review1At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer1Code === currentLecturerCode ||
            proposal.reviewer?.reviewer2Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            allEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 1,
              reviewAt: proposal.review1At,
              lecturerCode: proposal.reviewer?.reviewer1Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
              eventType: 'review',
            });
          }
        }

        if (proposal.review2At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer3Code === currentLecturerCode ||
            proposal.reviewer?.reviewer4Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            allEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 2,
              reviewAt: proposal.review2At,
              lecturerCode: proposal.reviewer?.reviewer3Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
              eventType: 'review',
            });
          }
        }

        if (proposal.review3At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer5Code === currentLecturerCode ||
            proposal.reviewer?.reviewer6Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            allEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 3,
              reviewAt: proposal.review3At,
              lecturerCode: proposal.reviewer?.reviewer5Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
              eventType: 'review',
            });
          }
        }
      });

      // 2. Fetch Defense Events
      const myDefenseSchedules = defenseSchedules.filter((schedule: any) => {
        return schedule.council?.councilMembers?.some(
          (member: any) => member.lecturerEmail === user.email
        );
      });

      myDefenseSchedules.forEach((schedule: any) => {
        const userRole = schedule.council?.councilMembers?.find(
          (member: any) => member.lecturerEmail === user.email
        )?.role || '';

        allEvents.push({
          id: schedule.id,
          proposalTitle: schedule.capstoneProposal?.title || '',
          proposalCode: schedule.capstoneProposal?.code || null,
          defenseDate: schedule.defenseDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          councilName: schedule.council?.name || '',
          councilRole: userRole,
          defenseRound: schedule.defenseRound,
          eventType: 'defense',
        });
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type: 'my-proposal' | 'review-assigned') => {
    if (type === 'my-proposal') {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        label: 'Đồ án của tôi',
      };
    } else {
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-500',
        text: 'text-purple-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
        label: 'Review cho nhóm khác',
      };
    }
  };

  const getDefenseEventConfig = (defenseRound: number | null) => {
    const isRound2 = defenseRound === 2;
    
    if (isRound2) {
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        label: '🔄 Bảo vệ Đợt 2',
        dotColor: 'bg-orange-500',
      };
    } else {
      return {
        bg: 'bg-indigo-100',
        border: 'border-indigo-500',
        text: 'text-indigo-700',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        label: 'Bảo vệ Đợt 1',
        dotColor: 'bg-indigo-500',
      };
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.eventType === 'review' ? new Date(a.reviewAt) : new Date(a.defenseDate);
    const dateB = b.eventType === 'review' ? new Date(b.reviewAt) : new Date(b.defenseDate);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = event.eventType === 'review' ? new Date(event.reviewAt) : new Date(event.defenseDate);
    return eventDate >= new Date(new Date().setHours(0, 0, 0, 0));
  });

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch làm việc
        </h1>
        <p className="text-gray-600">
          Lịch review đồ án và lịch chấm hội đồng bảo vệ
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">Đồ án của tôi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-700">Review cho nhóm khác</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-500 rounded"></div>
          <span className="text-sm text-gray-700">Bảo vệ đợt 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-700">Bảo vệ đợt 2</span>
        </div>
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
                
                const eventsOnDay = events.filter(e => {
                  const eventDate = e.eventType === 'review' 
                    ? new Date(e.reviewAt)
                    : new Date(e.defenseDate);
                  const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
                  return eventDateStr === dateStr;
                });
                
                const hasReview = eventsOnDay.some(e => e.eventType === 'review');
                const hasDefenseRound1 = eventsOnDay.some(e => e.eventType === 'defense' && (!e.defenseRound || e.defenseRound === 1));
                const hasDefenseRound2 = eventsOnDay.some(e => e.eventType === 'defense' && e.defenseRound === 2);
                const hasEvent = eventsOnDay.length > 0;
                const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                
                let bgColor = 'hover:bg-gray-100';
                if (isToday) {
                  bgColor = 'bg-orange-500 text-white font-bold shadow-md';
                } else if (hasEvent) {
                  if ((hasReview && (hasDefenseRound1 || hasDefenseRound2)) || (hasDefenseRound1 && hasDefenseRound2)) {
                    bgColor = 'bg-gradient-to-br from-purple-100 via-indigo-100 to-orange-100 text-gray-800 font-medium';
                  } else if (hasDefenseRound2) {
                    bgColor = 'bg-orange-100 text-orange-700 font-medium hover:bg-orange-200';
                  } else if (hasDefenseRound1) {
                    bgColor = 'bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200';
                  } else if (hasReview) {
                    bgColor = 'bg-purple-100 text-purple-700 font-medium hover:bg-purple-200';
                  }
                }
                
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all relative ${bgColor}`}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {hasReview && (
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        )}
                        {hasDefenseRound1 && (
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                        )}
                        {hasDefenseRound2 && (
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Lịch sắp tới ({upcomingEvents.length})
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Không có lịch nào sắp tới
                </p>
              ) : (
                upcomingEvents.map((event, index) => {
                  if (event.eventType === 'review') {
                    const config = getEventTypeConfig(event.type);
                    return (
                      <div
                        key={`review-${event.id}-${event.reviewTime}-${index}`}
                        className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => setSelectedDate(new Date(event.reviewAt))}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={config.text}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                Review {event.reviewTime}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text} font-medium`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium mb-1">{event.proposalTitle}</p>
                            <div className="flex items-center text-xs text-gray-500 space-x-3">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(event.reviewAt)}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(event.reviewAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    const config = getDefenseEventConfig(event.defenseRound);
                    return (
                      <div
                        key={`defense-${event.id}-${index}`}
                        className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => setSelectedDate(new Date(event.defenseDate))}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={config.text}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {config.label}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text} font-medium`}>
                                {event.councilRole}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {event.proposalCode || `#${event.id}`}
                            </p>
                            <p className="text-sm text-gray-800 font-medium mb-2">{event.proposalTitle}</p>
                            <p className="text-xs text-indigo-600 font-medium mb-2">🏛️ {event.councilName}</p>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(event.defenseDate)}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {event.room}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
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
