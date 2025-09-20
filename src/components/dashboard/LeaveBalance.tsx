import React from 'react';

const LeaveBalance = () => {
  const leaveData = [
    {
      type: 'Annual',
      balance: 15,
      total: 21,
      icon: '🏖️',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      darkBgGradient: 'from-blue-900/20 to-cyan-900/20'
    },
    {
      type: 'Sick',
      balance: 8,
      total: 12,
      icon: '🏥',
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50',
      darkBgGradient: 'from-red-900/20 to-pink-900/20'
    },
    {
      type: 'Casual',
      balance: 10,
      total: 12,
      icon: '☕',
      gradient: 'from-green-500 to-teal-500',
      bgGradient: 'from-green-50 to-teal-50',
      darkBgGradient: 'from-green-900/20 to-teal-900/20'
    },
  ];

  const getPercentage = (balance: number, total: number) => (balance / total) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">🗓️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Leave Balance</h3>
      </div>

      <div className="space-y-6">
        {leaveData.map((leave) => {
          const percentage = getPercentage(leave.balance, leave.total);
          return (
            <div key={leave.type} className={`bg-gradient-to-r ${leave.bgGradient} dark:${leave.darkBgGradient} rounded-xl p-4 border border-white/50 dark:border-gray-700/50`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3 filter drop-shadow-sm">{leave.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{leave.type}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leave Days</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getStatusColor(percentage)}`}>
                    {leave.balance}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    of {leave.total} days
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/70 dark:bg-gray-700/50 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${leave.gradient} h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span className="font-semibold">{percentage.toFixed(0)}%</span>
                  <span>{leave.total}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex justify-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${percentage >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    percentage >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {percentage >= 70 ? '● Healthy' :
                   percentage >= 40 ? '● Moderate' :
                   '● Low'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Total Available</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Across all leave types</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {leaveData.reduce((sum, leave) => sum + leave.balance, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              of {leaveData.reduce((sum, leave) => sum + leave.total, 0)} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
