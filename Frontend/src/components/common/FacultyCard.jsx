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
      {(currentLoad != null || expectedLoad != null) && (() => {
        const cl  = currentLoad  ?? 0;
        const el  = expectedLoad ?? 0;
        const pct = el > 0 ? Math.min(100, Math.round((cl / el) * 100)) : 0;
        const remaining = el - cl;
        const barColor =
          pct >= 100 ? 'bg-red-500 dark:bg-red-500' :
          pct >= 90  ? 'bg-red-400 dark:bg-red-400' :
          pct >= 70  ? 'bg-amber-400 dark:bg-amber-400' :
          'bg-emerald-400 dark:bg-emerald-500';
        const textColor =
          pct >= 90 ? 'text-red-500 dark:text-red-400' :
          pct >= 70 ? 'text-amber-500 dark:text-amber-400' :
          'text-emerald-600 dark:text-emerald-400';
        return (
          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/50 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Load</span>
              <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold shrink-0 ${textColor}`}>{cl}/{el}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400">{pct}% used</span>
              {pct >= 100
                ? <span className="text-[8px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1 py-0.5 rounded leading-none">Full</span>
                : pct >= 70
                ? <span className="text-[8px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1 py-0.5 rounded leading-none">Near limit</span>
                : <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 rounded leading-none">+{remaining} free</span>
              }
            </div>
          </div>
        );
      })()}
    </div>
  );
}
