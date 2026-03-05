import React from "react";

function SectionCard({ sectionName, course, semester, strength }) {
  return (
    <div className="group bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-all">

      {/* Top Row */}
      <div className="flex justify-between items-start mb-1">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
          {course}
        </span>

        <span className="text-[11px] text-slate-400">
          {strength} Students
        </span>
      </div>

      {/* Section Code */}
      <h3 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
        {sectionName}
      </h3>

      {/* Semester Info */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        <span className="material-symbols-outlined text-xs">
          school
        </span>
        <span>Semester {semester}</span>
      </div>

    </div>
  );
}

export default SectionCard;