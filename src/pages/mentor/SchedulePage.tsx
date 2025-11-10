import { useState, useEffect } from 'react';
import { getAllProposals } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewEvent {
  id: number;
  proposalTitle: string;
  reviewTime: 1 | 2 | 3;
  reviewAt: string;
  lecturerCode: string;
  type: 'my-proposal' | 'review-assigned';
  status: string;
}

const SchedulePage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewEvents();
  }, [user]);

  const fetchReviewEvents = async () => {
    if (!user?.lecturerCode) return;
    
    try {
      setLoading(true);
      const proposals = await getAllProposals();
      const reviewEvents: ReviewEvent[] = [];

      proposals.forEach((proposal) => {
        const currentLecturerCode = user.lecturerCode;

        // Check if this is user's proposal (lecturerCode1 or lecturerCode2)
        const isMyProposal = 
          proposal.lecturerCode1 === currentLecturerCode || 
          proposal.lecturerCode2 === currentLecturerCode;

        // Review 1 (có 2 reviewer: reviewer1 và reviewer2)
        if (proposal.review1At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer1Code === currentLecturerCode ||
            proposal.reviewer?.reviewer2Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            reviewEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 1,
              reviewAt: proposal.review1At,
              lecturerCode: proposal.reviewer?.reviewer1Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
            });
          }
        }

        // Review 2 (có 2 reviewer: reviewer3 và reviewer4)
        if (proposal.review2At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer3Code === currentLecturerCode ||
            proposal.reviewer?.reviewer4Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            reviewEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 2,
              reviewAt: proposal.review2At,
              lecturerCode: proposal.reviewer?.reviewer3Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
            });
          }
        }

        // Review 3 (có 2 reviewer: reviewer5 và reviewer6)
        if (proposal.review3At) {
          const isReviewAssigned = 
            proposal.reviewer?.reviewer5Code === currentLecturerCode ||
            proposal.reviewer?.reviewer6Code === currentLecturerCode;
          
          if (isMyProposal || isReviewAssigned) {
            reviewEvents.push({
              id: proposal.id || 0,
              proposalTitle: proposal.title,
              reviewTime: 3,
              reviewAt: proposal.review3At,
              lecturerCode: proposal.reviewer?.reviewer5Code || '',
              type: isMyProposal ? 'my-proposal' : 'review-assigned',
              status: proposal.status,
            });
          }
        }
      });

      setEvents(reviewEvents);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type: ReviewEvent['type']) => {
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

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.reviewAt).getTime() - new Date(b.reviewAt).getTime()
  );

  const upcomingEvents = sortedEvents.filter(event => 
    new Date(event.reviewAt) >= new Date(new Date().setHours(0, 0, 0, 0))
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
          Lịch Review Đồ Án
        </h1>
        <p className="text-gray-600">
          Quản lý lịch review của các đồ án bạn hướng dẫn và được phân công review
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
                
                // Check events for this day
                const eventsOnDay = events.filter(e => {
                  const eventDate = new Date(e.reviewAt);
                  const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
                  return eventDateStr === dateStr;
                });
                
                const hasMyProposal = eventsOnDay.some(e => e.type === 'my-proposal');
                const hasReviewAssigned = eventsOnDay.some(e => e.type === 'review-assigned');
                const hasEvent = eventsOnDay.length > 0;
                const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                
                // Determine background color based on event type
                let bgColor = 'hover:bg-gray-100';
                let textColor = '';
                if (isToday) {
                  bgColor = 'bg-orange-500 text-white font-bold shadow-md';
                } else if (hasMyProposal && hasReviewAssigned) {
                  // Both types - gradient or mixed color
                  bgColor = 'bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800 font-medium hover:from-blue-200 hover:to-purple-200';
                } else if (hasMyProposal) {
                  bgColor = 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-200';
                } else if (hasReviewAssigned) {
                  bgColor = 'bg-purple-100 text-purple-700 font-medium hover:bg-purple-200';
                }
                
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all relative ${bgColor} ${textColor}`}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {hasMyProposal && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                        {hasReviewAssigned && (
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
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
              Review sắp tới
            </h2>
            
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Không có review nào sắp tới
                </p>
              ) : (
                upcomingEvents.map((event, index) => {
                  const config = getEventTypeConfig(event.type);
                  return (
                    <div
                      key={`${event.id}-${event.reviewTime}-${index}`}
                      className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={config.text}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              Review {event.reviewTime}: {event.proposalTitle}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text} font-medium`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Đồ án #{event.id}
                          </p>
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
                          {event.lecturerCode && event.type === 'review-assigned' && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Phân công review: {event.lecturerCode}
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
