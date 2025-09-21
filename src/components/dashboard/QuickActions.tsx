import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, ActionCard } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  title: string;
  description: string;
  gradient: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}

const QuickActions = () => {
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

  const actions: Action[] = [
    {
      id: 'punch',
      title: 'Punch In/Out',
      description: 'Record your attendance',
      gradient: 'from-blue-500 to-purple-600',
      icon: '🕐',
    },
    {
      id: 'leave',
      title: 'Apply Leave',
      description: 'Submit leave request',
      gradient: 'from-green-500 to-teal-600',
      icon: '🏖️',
      badge: 'New',
    },
    {
      id: 'regularization',
      title: 'Regularization',
      description: 'Request time adjustment',
      gradient: 'from-orange-500 to-red-600',
      icon: '⚡',
    },
  ];

  const handleAction = async (actionId: string) => {
    setLoadingAction(actionId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingAction(null);

    // Handle the specific action
    switch (actionId) {
      case 'punch':
        console.log('Punch action triggered');
        break;
      case 'leave':
        console.log('Leave request action triggered');
        break;
      case 'regularization':
        console.log('Regularization action triggered');
        break;
    }
  };

  return (
    <Card variant="glass" size="lg" animate className="group">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Quick Actions</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perform common HR tasks</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="relative"
            >
              <button
                onClick={() => handleAction(action.id)}
                disabled={loadingAction === action.id}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl p-6 text-white font-semibold shadow-lg",
                  `bg-gradient-to-br ${action.gradient}`,
                  "transform transition-all duration-300 ease-out",
                  "hover:scale-105 hover:shadow-xl hover:-translate-y-2",
                  "focus:outline-none focus:ring-4 focus:ring-blue-300/50",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                )}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <motion.span
                      className="text-3xl filter drop-shadow-lg"
                      animate={loadingAction === action.id ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: loadingAction === action.id ? Infinity : 0 }}
                    >
                      {loadingAction === action.id ? '⏳' : action.icon}
                    </motion.span>

                    {/* Badge */}
                    {action.badge && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {action.badge}
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold mb-1">
                      {loadingAction === action.id ? 'Processing...' : action.title}
                    </h3>
                    <p className="text-xs opacity-90 font-medium">
                      {action.description}
                    </p>
                  </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />

                {/* Hover Glow Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl",
                  `bg-gradient-to-br ${action.gradient}`
                )} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Action Status */}
        {loadingAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30 text-center"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Processing your request...
            </p>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {[
            { label: 'Actions Today', value: '3', icon: '📊' },
            { label: 'Avg Response', value: '2m', icon: '⚡' },
            { label: 'Success Rate', value: '98%', icon: '✅' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
