import React from "react";

function SectionCard({ sectionName, course, semester, strength, onEdit, onDelete }) {
  return (
    <div className="group bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/40 hover:shadow-md transition-all relative">

      {/* Action icons */}
      <div className='absolute top-1 right-1 flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity z-10'>
        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            title='Edit'
            className='w-4 h-4 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors'
          >
            <span className='material-symbols-outlined text-[12px]'>edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title='Delete'
            className='w-4 h-4 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors'
          >
            <span className='material-symbols-outlined text-[12px]'>delete</span>
          </button>
        )}
      </div>

      {/* Row 1: program badge + strength */}
      <div className="flex items-center justify-between mb-1 pr-8">
        <span className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none truncate max-w-[120px]">
          {course || '—'}
        </span>
        {strength != null && (
          <span className="text-[10px] text-slate-400 font-medium shrink-0">{strength} stu</span>
        )}
      </div>

      {/* Row 2: section ID */}
      <h3 className="font-semibold text-[11px] text-slate-800 dark:text-white truncate leading-tight mb-0.5">
        {sectionName}
      </h3>

      {/* Row 3: semester */}
      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-[10px]">school</span>
        <span>Sem {semester ?? '—'}</span>
      </div>
    </div>
  );
}

export default SectionCard;