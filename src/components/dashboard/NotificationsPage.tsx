import { Bell, X, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';

export function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'test',
      icon: Calendar,
      title: 'Upcoming Test Tomorrow',
      message: 'Maths: Commercial Mathematics test is scheduled for tomorrow at 10:00 AM',
      time: '2 hours ago',
      read: false,
      color: 'orange'
    },
    {
      id: 2,
      type: 'success',
      icon: CheckCircle,
      title: 'Test Result Available',
      message: 'Your Organic Chemistry test has been evaluated. You scored 45/50!',
      time: '3 hours ago',
      read: false,
      color: 'green'
    },
    {
      id: 3,
      type: 'doubt',
      icon: Info,
      title: 'Doubt Resolved',
      message: 'Your doubt on "Quadratic Formula" has been answered by expert mentor.',
      time: '5 hours ago',
      read: true,
      color: 'blue'
    },
    {
      id: 4,
      type: 'alert',
      icon: AlertCircle,
      title: 'Low Performance Alert',
      message: 'Your score in Chemistry has dropped by 4%. Focus on Mole Concept.',
      time: 'Yesterday',
      read: true,
      color: 'red'
    },
    {
      id: 5,
      type: 'info',
      icon: Info,
      title: 'New Course Added',
      message: 'MHT-CET Foundation course is now available in your courses.',
      time: 'Yesterday',
      read: true,
      color: 'blue'
    },
    {
      id: 6,
      type: 'success',
      icon: CheckCircle,
      title: 'Achievement Unlocked',
      message: '12-day learning streak! Keep up the excellent work.',
      time: '2 days ago',
      read: true,
      color: 'green'
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 mb-1">Notifications</h1>
            <p className="text-sm text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md">
              Mark all as read
            </button>
            <button className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-700 border border-gray-200 rounded-md">
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main Content - 2 cols */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            {notifications.map((notification, idx) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 last:border-0 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.color === 'orange' ? 'bg-orange-100' :
                      notification.color === 'green' ? 'bg-green-100' :
                      notification.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        notification.color === 'orange' ? 'text-orange-600' :
                        notification.color === 'green' ? 'text-green-600' :
                        notification.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button className="text-xs text-blue-600 hover:text-blue-700">
                              Mark as read
                            </button>
                          )}
                          <button className="text-xs text-gray-500 hover:text-gray-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Notification Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Test Reminders</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Results</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Doubt Answers</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Performance Alerts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Course Updates</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
            <h3 className="text-sm mb-3">This Week</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-100">Total Notifications</span>
                <span className="text-sm">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-100">Unread</span>
                <span className="text-sm">{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-100">Important</span>
                <span className="text-sm">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
