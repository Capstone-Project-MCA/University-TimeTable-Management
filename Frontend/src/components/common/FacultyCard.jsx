import React from 'react';

export default function FacultyCard({ uid, name, department, designation, currentLoad, expectedLoad, onEdit, onDelete }) {
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

      {/* Row 1: UID badge + designation */}
      <div className="flex items-center justify-between mb-1 pr-8">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
          {uid || '—'}
        </span>
        {designation && (
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">{designation}</span>
        )}
      </div>

      {/* Row 2: Name */}
      <h3 className="font-semibold text-[11px] text-slate-800 dark:text-white truncate leading-tight mb-0.5">
        {name}
      </h3>

      {/* Row 3: department */}
      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
        <span className="material-symbols-outlined text-[10px]">business</span>
        <span className="truncate">{department || '—'}</span>
      </div>

      {/* Row 4: load bar */}
      {(currentLoad != null || expectedLoad != null) && (
        <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Load</span>
          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full transition-all"
              style={{ width: expectedLoad > 0 ? `${Math.min(100, (currentLoad / expectedLoad) * 100)}%` : '0%' }}
            />
          </div>
          <span className="text-[9px] text-slate-400 shrink-0">{currentLoad ?? 0}/{expectedLoad ?? 0}</span>
        </div>
      )}
    </div>
  );
}
