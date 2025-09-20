'use client';
import React, { useState } from 'react';

const AttendanceSummary = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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

    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer relative";

    if (isToday) {
      return `${baseClasses} ring-2 ring-blue-500 ring-offset-2 bg-blue-500 text-white shadow-lg transform scale-110`;
    }

    if (selectedDate === day) {
      return `${baseClasses} ring-2 ring-purple-400 ring-offset-2`;
    }

    switch (status) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-200`;
      case 'late':
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-2 border-yellow-200`;
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200 border-2 border-red-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-gray-200`;
    }
  };

  const getStatusIcon = (day: number) => {
    const status = attendanceData[day as keyof typeof attendanceData];
    switch (status) {
      case 'present': return '✓';
      case 'late': return '⏰';
      case 'absent': return '✗';
      default: return '';
    }
  };

  const stats = {
    present: Object.values(attendanceData).filter(status => status === 'present').length,
    late: Object.values(attendanceData).filter(status => status === 'late').length,
    absent: Object.values(attendanceData).filter(status => status === 'absent').length,
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg">📅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Attendance Summary</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {currentMonth}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">Present</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Late</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium">Absent</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-300 py-2 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDay }, (_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10"></div>
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return (
              <div
                key={day}
                className={getStatusClass(day)}
                onClick={() => setSelectedDate(day === selectedDate ? null : day)}
              >
                <span className="relative z-10">{day}</span>
                {getStatusIcon(day) && (
                  <span className="absolute -top-1 -right-1 text-xs">
                    {getStatusIcon(day)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-200 rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-200 rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Late</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-200 rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Today</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
