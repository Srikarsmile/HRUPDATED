import React from 'react';

const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      description: 'Punched in',
      timestamp: '2025-09-20 09:01 AM',
      type: 'punch-in',
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300'
    },
    {
      id: 2,
      description: 'Leave request approved',
      timestamp: '2025-09-19 04:30 PM',
      type: 'leave-approved',
      icon: '🎉',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300'
    },
    {
      id: 3,
      description: 'Submitted regularization for late arrival',
      timestamp: '2025-09-19 09:15 AM',
      type: 'regularization',
      icon: '⚠️',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-300'
    },
    {
      id: 4,
      description: 'Punched out',
      timestamp: '2025-09-18 06:05 PM',
      type: 'punch-out',
      icon: '🔴',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300'
    },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">📋</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Activities</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>

        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex items-start group">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${activity.color} shadow-lg transform transition-all duration-300 group-hover:scale-110`}>
                <span className="text-white text-lg filter drop-shadow-sm">{activity.icon}</span>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${activity.color} opacity-20 animate-pulse`}></div>
              </div>

              {/* Content */}
              <div className="ml-6 flex-1 min-w-0">
                <div className={`${activity.bgColor} rounded-xl p-4 shadow-sm border border-white/50 dark:border-gray-700/50 transform transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${activity.textColor} mb-1`}>
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {activity.timestamp}</span>
                        <span>•</span>
                        <span className="font-medium">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>

                    <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${activity.bgColor} ${activity.textColor} border border-current/20`}>
                      {activity.type.replace('-', ' ')}
                    </div>
                  </div>
                </div>

                {/* Connecting line to next item */}
                {index < activities.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 bg-gradient-to-b from-transparent to-gray-300 dark:to-gray-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 group">
          <span>View all activities</span>
          <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
