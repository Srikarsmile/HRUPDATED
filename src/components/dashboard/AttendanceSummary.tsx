'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const AttendanceSummary = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);

  const currentMonth = "September 2025";
  const daysInMonth = 30;
  const startDay = 0; // Sunday

  const attendanceData = {
    1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present',
    8: 'present', 9: 'present', 10: 'present', 11: 'present', 12: 'present',
    15: 'present', 16: 'present', 17: 'late', 18: 'present', 19: 'absent',
    22: 'present', 23: 'present', 24: 'present', 25: 'present', 26: 'present',
    29: 'present', 30: 'present'
  };

  const getStatusClass = (day: number) => {
    const status = attendanceData[day as keyof typeof attendanceData];
    const isToday = day === 20;
    const isSelected = selectedDate === day;
    const isHovered = hoveredDate === day;

    const baseClasses = "relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 cursor-pointer group overflow-hidden";

    if (isToday) {
      return cn(
        baseClasses,
        "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30",
        "ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800",
        "scale-110 hover:scale-115"
      );
    }

    if (isSelected) {
      return cn(
        baseClasses,
        "ring-2 ring-purple-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800",
        "scale-105"
      );
    }

    const statusClasses = {
      present: "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/30 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40 hover:shadow-lg hover:shadow-green-500/20",
      late: "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700/30 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-800/40 dark:hover:to-amber-800/40 hover:shadow-lg hover:shadow-yellow-500/20",
      absent: "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/30 hover:from-red-200 hover:to-rose-200 dark:hover:from-red-800/40 dark:hover:to-rose-800/40 hover:shadow-lg hover:shadow-red-500/20",
    };

    const defaultClass = "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/40 dark:hover:to-gray-800/40";

    return cn(
      baseClasses,
      status ? statusClasses[status as keyof typeof statusClasses] : defaultClass,
      isHovered && "scale-105 -translate-y-1"
    );
  };

  const getStatusIcon = (day: number) => {
    const status = attendanceData[day as keyof typeof attendanceData];
    const iconMap = {
      present: '✓',
      late: '⚡',
      absent: '✗'
    };
    return status ? iconMap[status as keyof typeof iconMap] : '';
  };

  const stats = {
    present: Object.values(attendanceData).filter(status => status === 'present').length,
    late: Object.values(attendanceData).filter(status => status === 'late').length,
    absent: Object.values(attendanceData).filter(status => status === 'absent').length,
  };

  const totalDays = stats.present + stats.late + stats.absent;
  const attendanceRate = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0;

  return (
    <Card variant="floating" size="lg" animate className="group relative overflow-hidden">
      {/* Enhanced background effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-pink-400/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300"
              whileHover={{
                scale: 1.15,
                rotate: 10,
                transition: { duration: 0.2 }
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 200
              }}
            >
              <span className="text-white text-xl">📅</span>
            </motion.div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Attendance Summary</CardTitle>
                <motion.p
                  className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentMonth}
                </motion.p>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="text-right"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              {attendanceRate}%
            </motion.div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall Rate</p>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'present', label: 'Present', value: stats.present, gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', icon: '✓' },
            { key: 'late', label: 'Late', value: stats.late, gradient: 'from-yellow-500 to-amber-600', bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20', icon: '⚡' },
            { key: 'absent', label: 'Absent', value: stats.absent, gradient: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20', icon: '✗' }
          ].map((stat) => (
            <motion.div
              key={stat.key}
              className={cn(
                "relative overflow-hidden rounded-xl p-4 border border-white/20 dark:border-gray-700/30",
                `bg-gradient-to-br ${stat.bg}`
              )}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg",
                    `bg-gradient-to-br ${stat.gradient}`
                  )}>
                    {stat.icon}
                  </div>
                </div>
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  `bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`
                )}>
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
              <div className={cn(
                "absolute inset-0 opacity-20",
                `bg-gradient-to-br ${stat.gradient}`
              )} />
            </motion.div>
          ))}
        </div>

        {/* Enhanced Calendar */}
        <motion.div
          className="bg-gradient-to-br from-gray-50/60 to-white/60 dark:from-gray-800/40 dark:to-gray-900/40 rounded-2xl p-6 border border-white/30 dark:border-gray-700/40 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <motion.div
                key={day}
                className="text-center font-bold text-gray-600 dark:text-gray-400 py-3 text-sm uppercase tracking-wider"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                {day}
              </motion.div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="w-12 h-12" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const status = attendanceData[day as keyof typeof attendanceData];

              return (
                <motion.div
                  key={day}
                  className={getStatusClass(day)}
                  onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  whileHover={{
                    scale: 1.15,
                    y: -3,
                    transition: { duration: 0.2, type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.8 + i * 0.02,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  {/* Background glow for today */}
                  {day === 20 && (
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-30 blur-sm"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Day number */}
                  <span className="relative z-20 font-bold">{day}</span>

                  {/* Status icon with enhanced animation */}
                  {getStatusIcon(day) && (
                    <motion.span
                      className="absolute -top-1 -right-1 text-xs z-30 bg-white dark:bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 1 + i * 0.02,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{ scale: 1.2, rotate: 15 }}
                    >
                      {getStatusIcon(day)}
                    </motion.span>
                  )}

                  {/* Ripple effect on click */}
                  {selectedDate === day && (
                    <motion.div
                      className="absolute inset-0 bg-purple-400/20 rounded-xl"
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Legend */}
        <div className="flex flex-wrap justify-center gap-6 pt-2">
          {[
            { label: 'Present', color: 'bg-green-400', ring: 'ring-green-400' },
            { label: 'Late', color: 'bg-yellow-400', ring: 'ring-yellow-400' },
            { label: 'Absent', color: 'bg-red-400', ring: 'ring-red-400' },
            { label: 'Today', color: 'bg-blue-500', ring: 'ring-blue-500' }
          ].map((item) => (
            <motion.div
              key={item.label}
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className={cn(
                "w-3 h-3 rounded-full shadow-sm",
                item.color
              )} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Selected Date Info */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    {currentMonth.split(' ')[0]} {selectedDate}, {currentMonth.split(' ')[1]}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status: <span className="font-medium capitalize">{attendanceData[selectedDate as keyof typeof attendanceData] || 'No data'}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AttendanceSummary;
