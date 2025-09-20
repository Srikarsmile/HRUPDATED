'use client';
import React, { useState } from 'react';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Your leave request has been approved.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false,
      title: 'Leave Approved',
      action: 'View Details'
    },
    {
      id: 2,
      message: 'Reminder: Submit your regularization for yesterday.',
      type: 'warning',
      timestamp: '1 day ago',
      read: false,
      title: 'Regularization Reminder',
      action: 'Submit Now'
    },
    {
      id: 3,
      message: 'New company policy update available.',
      type: 'info',
      timestamp: '3 days ago',
      read: true,
      title: 'Policy Update',
      action: 'Read More'
    },
  ]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: '🎉',
          gradient: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-300',
          iconBg: 'bg-green-100 dark:bg-green-800/50'
        };
      case 'warning':
        return {
          icon: '⚡',
          gradient: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800/50'
        };
      case 'info':
        return {
          icon: '📢',
          gradient: 'from-blue-500 to-purple-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-300',
          iconBg: 'bg-blue-100 dark:bg-blue-800/50'
        };
      default:
        return {
          icon: '🔔',
          gradient: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-300',
          iconBg: 'bg-gray-100 dark:bg-gray-800/50'
        };
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mr-3 relative">
            <span className="text-white text-lg">🔔</span>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notifications</h3>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors duration-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);
          return (
            <div
              key={notification.id}
              className={`relative ${style.bgColor} ${style.borderColor} border rounded-xl p-4 transition-all duration-300 hover:shadow-md group cursor-pointer ${!notification.read ? 'ring-2 ring-blue-100 dark:ring-blue-900/50' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}

              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
                  <span className="text-lg filter drop-shadow-sm">{style.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${style.textColor} mb-1`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {notification.timestamp}
                    </span>
                    <button className={`text-xs font-medium ${style.textColor} hover:underline transition-all duration-200 group-hover:translate-x-1`}>
                      {notification.action} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 flex items-center space-x-1 group">
            <span>View all</span>
            <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
