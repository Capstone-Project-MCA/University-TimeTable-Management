import React from 'react'

export default function CourseCard({ course, credits, title, courseType, color, onEdit, onDelete }) {
  const bgColors = {
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  const badgeClass = bgColors[color] || bgColors.blue

  return (
    <div className='group bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/40 hover:shadow-md transition-all relative'>

      {/* Action icons — shown on hover, top-right */}
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

      {/* Row 1: course code badge + credits */}
      <div className='flex items-center justify-between mb-1'>
        <span className={`${badgeClass} text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none`}>
          {course}
        </span>
        {credits != null && (
          <span className='text-[10px] text-slate-400 font-medium'>{credits} cr</span>
        )}
      </div>

      {/* Row 2: title */}
      <h3 className='font-semibold text-[11px] text-slate-800 dark:text-white truncate leading-tight mb-0.5'>
        {title}
      </h3>

      {/* Row 3: course type */}
      {courseType && (
        <div className='flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400'>
          <span className='material-symbols-outlined text-[10px]'>sell</span>
          <span className='truncate'>{courseType}</span>
        </div>
      )}
    </div>
  )
}
