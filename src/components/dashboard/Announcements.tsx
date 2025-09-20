import React from "react";

const items = [
  {
    id: 1,
    title: "New leave policy effective Oct 1",
    desc: "Review updated carry-forward rules and limits.",
    color: "from-blue-500 to-indigo-600",
    date: "Sep 18",
  },
  {
    id: 2,
    title: "Office closed: Festival Holiday",
    desc: "Office will remain closed next Friday.",
    color: "from-emerald-500 to-teal-600",
    date: "Sep 25",
  },
  {
    id: 3,
    title: "FYI: Timesheet submission deadline",
    desc: "Submit by EOD every Friday to avoid reminders.",
    color: "from-amber-500 to-orange-600",
    date: "Sep 27",
  },
];

export default function Announcements() {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">📣</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Announcements</h3>
      </div>

      <div className="space-y-4">
        {items.map((n) => (
          <div key={n.id} className="group relative p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/50 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${n.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="flex items-start justify-between">
              <div className="pr-3">
                <div className="font-semibold text-gray-800 dark:text-gray-100">{n.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.desc}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

