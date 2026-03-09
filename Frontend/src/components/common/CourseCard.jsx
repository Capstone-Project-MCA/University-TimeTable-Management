import React from 'react'

export default function CourseCard({ course, credits, title, teacher, color, onEdit, onDelete }) {
  const bgColors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    emerald:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    purple:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    amber:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }

  const badgeClass = bgColors[color] || bgColors.blue

  return (
    <div className='group bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-all relative'>
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

      <div className='flex justify-between items-start mb-1 pr-12 group-hover:pr-12'>
        <span
          className={`${badgeClass} text-[11px] font-bold px-1.5 py-0.5 rounded-sm`}
        >
          {course}
        </span>

        {credits && (
          <span className='text-[11px] text-slate-400'>{credits} cr</span>
        )}
      </div>

      <h3 className='font-semibold text-xs text-slate-800 dark:text-white truncate'>
        {title}
      </h3>

      {teacher && (
        <div className='flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1'>
          <span className='material-symbols-outlined text-xs'>person</span>
          {teacher}
        </div>
      )}
    </div>
  )
}
