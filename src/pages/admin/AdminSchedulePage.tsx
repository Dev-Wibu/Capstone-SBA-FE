import { useState, useEffect } from 'react';
import { getAllProposals } from '@/services/api';
import type { CapstoneProposalResponse } from '@/interfaces';

interface ReviewEvent {
  id: number;
  proposalTitle: string;
  reviewTime: 1 | 2 | 3;
  reviewAt: string;
  lecturerCode1: string;
  lecturerCode2?: string;
  reviewerCodes: string[];
  reviewerNames: string[];
  status: string;
}

const AdminSchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewEvents();
  }, []);

  const fetchReviewEvents = async () => {
    try {
      setLoading(true);
      const proposals = await getAllProposals();
      const reviewEvents: ReviewEvent[] = [];

      proposals.forEach((proposal: CapstoneProposalResponse) => {
        // Review 1
        if (proposal.review1At) {
          const reviewerCodes: string[] = [];
          const reviewerNames: string[] = [];
          
          if (proposal.reviewer?.reviewer1Code) {
            reviewerCodes.push(proposal.reviewer.reviewer1Code);
            reviewerNames.push(proposal.reviewer.reviewer1Name || '');
          }
          if (proposal.reviewer?.reviewer2Code) {
            reviewerCodes.push(proposal.reviewer.reviewer2Code);
            reviewerNames.push(proposal.reviewer.reviewer2Name || '');
          }

          reviewEvents.push({
            id: proposal.id || 0,
            proposalTitle: proposal.title,
            reviewTime: 1,
            reviewAt: proposal.review1At,
            lecturerCode1: proposal.lecturerCode1 || '',
            lecturerCode2: proposal.lecturerCode2,
            reviewerCodes,
            reviewerNames,
            status: proposal.status,
          });
        }

        // Review 2
        if (proposal.review2At) {
          const reviewerCodes: string[] = [];
          const reviewerNames: string[] = [];
          
          if (proposal.reviewer?.reviewer3Code) {
            reviewerCodes.push(proposal.reviewer.reviewer3Code);
            reviewerNames.push(proposal.reviewer.reviewer3Name || '');
          }
          if (proposal.reviewer?.reviewer4Code) {
            reviewerCodes.push(proposal.reviewer.reviewer4Code);
            reviewerNames.push(proposal.reviewer.reviewer4Name || '');
          }

          reviewEvents.push({
            id: proposal.id || 0,
            proposalTitle: proposal.title,
            reviewTime: 2,
            reviewAt: proposal.review2At,
            lecturerCode1: proposal.lecturerCode1 || '',
            lecturerCode2: proposal.lecturerCode2,
            reviewerCodes,
            reviewerNames,
            status: proposal.status,
          });
        }

        // Review 3
        if (proposal.review3At) {
          const reviewerCodes: string[] = [];
          const reviewerNames: string[] = [];
          
          if (proposal.reviewer?.reviewer5Code) {
            reviewerCodes.push(proposal.reviewer.reviewer5Code);
            reviewerNames.push(proposal.reviewer.reviewer5Name || '');
          }
          if (proposal.reviewer?.reviewer6Code) {
            reviewerCodes.push(proposal.reviewer.reviewer6Code);
            reviewerNames.push(proposal.reviewer.reviewer6Name || '');
          }

          reviewEvents.push({
            id: proposal.id || 0,
            proposalTitle: proposal.title,
            reviewTime: 3,
            reviewAt: proposal.review3At,
            lecturerCode1: proposal.lecturerCode1 || '',
            lecturerCode2: proposal.lecturerCode2,
            reviewerCodes,
            reviewerNames,
            status: proposal.status,
          });
        }
      });

      setEvents(reviewEvents);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getReviewTimeColor = (reviewTime: number) => {
    switch (reviewTime) {
      case 1:
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          text: 'text-blue-700',
          badge: 'bg-blue-500',
        };
      case 2:
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-500',
          text: 'text-purple-700',
          badge: 'bg-purple-500',
        };
      case 3:
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-700',
          badge: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-700',
          badge: 'bg-gray-500',
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
          Quản lý và theo dõi lịch review của tất cả các đồ án
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">Tổng số review</p>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Review 1</p>
          <p className="text-2xl font-bold text-gray-900">
            {events.filter(e => e.reviewTime === 1).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Review 2</p>
          <p className="text-2xl font-bold text-gray-900">
            {events.filter(e => e.reviewTime === 2).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Review 3</p>
          <p className="text-2xl font-bold text-gray-900">
            {events.filter(e => e.reviewTime === 3).length}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">Review 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-700">Review 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Review 3</span>
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
                
                const hasReview1 = eventsOnDay.some(e => e.reviewTime === 1);
                const hasReview2 = eventsOnDay.some(e => e.reviewTime === 2);
                const hasReview3 = eventsOnDay.some(e => e.reviewTime === 3);
                const hasEvent = eventsOnDay.length > 0;
                const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                
                // Determine background color
                let bgColor = 'hover:bg-gray-100';
                if (isToday) {
                  bgColor = 'bg-orange-500 text-white font-bold shadow-md';
                } else if (hasEvent) {
                  // Mixed reviews
                  if ((hasReview1 ? 1 : 0) + (hasReview2 ? 1 : 0) + (hasReview3 ? 1 : 0) > 1) {
                    bgColor = 'bg-gradient-to-br from-blue-100 via-purple-100 to-green-100 text-gray-800 font-medium';
                  } else if (hasReview1) {
                    bgColor = 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-200';
                  } else if (hasReview2) {
                    bgColor = 'bg-purple-100 text-purple-700 font-medium hover:bg-purple-200';
                  } else if (hasReview3) {
                    bgColor = 'bg-green-100 text-green-700 font-medium hover:bg-green-200';
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
                        {hasReview1 && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                        {hasReview2 && (
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        )}
                        {hasReview3 && (
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                    )}
                    {hasEvent && (
                      <span className="absolute top-1 right-1 text-xs font-bold">
                        {eventsOnDay.length}
                      </span>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Review sắp tới
              </h2>
              <span className="text-sm text-gray-500">
                {upcomingEvents.length} sự kiện
              </span>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Không có review nào sắp tới
                </p>
              ) : (
                upcomingEvents.map((event, index) => {
                  const config = getReviewTimeColor(event.reviewTime);
                  return (
                    <div
                      key={`${event.id}-${event.reviewTime}-${index}`}
                      className={`${config.bg} ${config.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm flex-1">
                          {event.proposalTitle}
                        </h3>
                        <span className={`${config.badge} text-white text-xs px-2 py-1 rounded font-medium ml-2`}>
                          Review {event.reviewTime}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        Đồ án #{event.id}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-600 space-x-3 mb-2">
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

                      {/* Mentor */}
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="font-medium text-gray-700 mb-1">Mentor:</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-white px-2 py-1 rounded border border-gray-200">
                            {event.lecturerCode1}
                          </span>
                          {event.lecturerCode2 && (
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">
                              {event.lecturerCode2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reviewers */}
                      {event.reviewerCodes.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-gray-700 mb-1">Phản biện:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.reviewerNames.map((name, idx) => (
                              <span key={idx} className={`${config.bg} px-2 py-1 rounded border ${config.border}`}>
                                {name} ({event.reviewerCodes[idx]})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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

export default AdminSchedulePage;
