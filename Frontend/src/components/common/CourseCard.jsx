import React from 'react';

export default function CourseCard({ code, credits, title, teacher, color }) {
  const bgColors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  const badgeClass = bgColors[color] || bgColors.blue;

  return (
    <div className="group bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-all">
      <div className="flex justify-between items-start mb-1">
        <span className={`${badgeClass} text-[11px] font-bold px-1.5 py-0.5 rounded-sm`}>
          {code}
        </span>
        {credits && <span className="text-[11px] text-slate-400">{credits}</span>}
      </div>
      <h3 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
        {title}
      </h3>
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        <span className="material-symbols-outlined text-xs">person</span>
        {teacher}
      </div>
    </div>
  );
}
