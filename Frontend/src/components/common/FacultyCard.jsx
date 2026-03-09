import React from 'react';

export default function FacultyCard({ name, department, designation, experience, onEdit, onDelete }) {
  return (
    <div className="group bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-all relative">
      {/* Action icons – visible on hover */}
      <div className='absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
        {onEdit && (
          <button
            onClick={onEdit}
            title='Edit'
            className='w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors'
          >
            <span className='material-symbols-outlined text-[14px]'>edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            title='Delete'
            className='w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors'
          >
            <span className='material-symbols-outlined text-[14px]'>delete</span>
          </button>
        )}
      </div>

      <div className="flex justify-between items-start mb-1">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
          {designation}
        </span>
        {experience && <span className="text-[11px] text-slate-400">{experience} Yrs</span>}
      </div>
      <h3 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
        {name}
      </h3>
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        <span className="material-symbols-outlined text-xs">business</span>
        <span className="truncate">{department}</span>
      </div>
    </div>
  );
}
