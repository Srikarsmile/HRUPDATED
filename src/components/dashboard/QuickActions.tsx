import React from 'react';

const QuickActions = () => {
  const actions = [
    {
      id: 'punch',
      title: 'Punch In/Out',
      description: 'Record your attendance',
      gradient: 'from-blue-500 to-purple-600',
      icon: '🕐',
      hoverGradient: 'from-blue-600 to-purple-700',
    },
    {
      id: 'leave',
      title: 'Apply Leave',
      description: 'Submit leave request',
      gradient: 'from-green-500 to-teal-600',
      icon: '🏖️',
      hoverGradient: 'from-green-600 to-teal-700',
    },
    {
      id: 'regularization',
      title: 'Regularization',
      description: 'Request time adjustment',
      gradient: 'from-orange-500 to-red-600',
      icon: '⚡',
      hoverGradient: 'from-orange-600 to-red-700',
    },
  ];

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">⚡</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`group relative overflow-hidden bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient}
                       text-white font-semibold py-4 px-6 rounded-xl shadow-lg
                       transform transition-all duration-300 ease-out
                       hover:scale-105 hover:shadow-xl hover:-translate-y-1
                       focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-2xl mb-2 filter drop-shadow-sm">{action.icon}</span>
              <span className="text-sm font-bold mb-1">{action.title}</span>
              <span className="text-xs opacity-90 font-medium">{action.description}</span>
            </div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
