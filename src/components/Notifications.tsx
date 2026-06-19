import { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  MessageCircle, 
  Calendar,
  BookOpen,
  Target,
  CreditCard,
  Sparkles,
  Video,
  AlertCircle
} from 'lucide-react';

interface NotificationsProps {
  onBack: () => void;
}

type NotificationCategory = 'all' | 'tests' | 'doubts' | 'achievements' | 'updates';

interface Notification {
  id: string;
  type: 'test_result' | 'upcoming_test' | 'doubt_answered' | 'achievement' | 'subscription' | 'study_plan' | 'live_class' | 'assignment' | 'performance';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
  color: string;
}

export function Notifications({ onBack }: NotificationsProps) {
  const [category, setCategory] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'test_result',
      title: 'Test Result Available',
      message: 'Your Physics Chapter Test results are ready. You scored 85/100!',
      time: '5 min ago',
      isRead: false,
      icon: CheckCircle,
      color: 'green',
    },
    {
      id: '2',
      type: 'upcoming_test',
      title: 'Upcoming Test Reminder',
      message: 'Chemistry Mock Test starts in 2 hours. Don\'t forget to prepare!',
      time: '30 min ago',
      isRead: false,
      icon: Clock,
      color: 'orange',
    },
    {
      id: '3',
      type: 'doubt_answered',
      title: 'Your Doubt was Answered',
      message: 'AI Tutor has answered your doubt about "Conservation of Momentum"',
      time: '1 hour ago',
      isRead: false,
      icon: MessageCircle,
      color: 'purple',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'New Achievement Unlocked! 🎉',
      message: 'You\'ve earned "Speed Solver" badge for completing 50 tests in 30 days',
      time: '2 hours ago',
      isRead: true,
      icon: Award,
      color: 'yellow',
    },
    {
      id: '5',
      type: 'study_plan',
      title: 'Weekly Study Plan Updated',
      message: 'Your personalized study plan for this week is ready. Focus on Calculus!',
      time: '3 hours ago',
      isRead: true,
      icon: BookOpen,
      color: 'blue',
    },
    {
      id: '6',
      type: 'performance',
      title: 'Performance Insights',
      message: 'Your accuracy in Organic Chemistry improved by 15% this month!',
      time: '5 hours ago',
      isRead: true,
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: '7',
      type: 'live_class',
      title: 'Live Doubt Session Starting Soon',
      message: 'Join the live Physics doubt clearing session at 6:00 PM today',
      time: '6 hours ago',
      isRead: true,
      icon: Video,
      color: 'red',
    },
    {
      id: '8',
      type: 'assignment',
      title: 'Assignment Deadline Approaching',
      message: 'Submit your Math assignment by tomorrow 11:59 PM',
      time: '1 day ago',
      isRead: true,
      icon: Target,
      color: 'orange',
    },
    {
      id: '9',
      type: 'subscription',
      title: 'Subscription Renewal Reminder',
      message: 'Your subscription will auto-renew in 7 days. Amount: ₹4,999',
      time: '2 days ago',
      isRead: true,
      icon: CreditCard,
      color: 'blue',
    },
    {
      id: '10',
      type: 'achievement',
      title: 'Streak Milestone! 🔥',
      message: 'Amazing! You\'ve maintained a 30-day learning streak',
      time: '3 days ago',
      isRead: true,
      icon: Sparkles,
      color: 'purple',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      blue: 'text-blue-600 bg-blue-100',
      red: 'text-red-600 bg-red-100',
    };
    return colors[color] || 'text-gray-600 bg-gray-100';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (category === 'all') return true;
    if (category === 'tests') return ['test_result', 'upcoming_test'].includes(notification.type);
    if (category === 'doubts') return notification.type === 'doubt_answered';
    if (category === 'achievements') return notification.type === 'achievement';
    if (category === 'updates') return ['study_plan', 'subscription', 'performance', 'live_class', 'assignment'].includes(notification.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className=" mx-auto">
          {/* Category Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  category === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategory('tests')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  category === 'tests'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tests & Results
              </button>
              <button
                onClick={() => setCategory('doubts')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  category === 'doubts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Doubts
              </button>
              <button
                onClick={() => setCategory('achievements')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  category === 'achievements'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Achievements
              </button>
              <button
                onClick={() => setCategory('updates')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  category === 'updates'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Updates
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">You're all caught up! Check back later.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(notification.color)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Info Card */}
          {filteredNotifications.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">💡 Stay Updated</p>
                  <p className="text-xs text-blue-700">
                    Enable push notifications to never miss important updates about tests, results, and live sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
