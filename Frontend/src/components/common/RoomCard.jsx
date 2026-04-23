import React from "react";

function RoomCard({ roomNumber, building, floor, capacity, type, onEdit, onDelete }) {
  const typeColors = {
    'Lecture Hall': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Lab':          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Seminar Hall': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  const typeBadge = typeColors[type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'

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

      {/* Row 1: type badge + capacity */}
      <div className="flex items-center justify-between mb-1 pr-8">
        <span className={`${typeBadge} text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none`}>
          {type || '—'}
        </span>
        {capacity != null && (
          <span className="text-[10px] text-slate-400 font-medium">{capacity} seats</span>
        )}
      </div>

      {/* Row 2: Room number */}
      <h3 className="font-semibold text-[11px] text-slate-800 dark:text-white truncate leading-tight mb-0.5">
        {roomNumber}
      </h3>

      {/* Row 3: building + floor inline */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        {building && (
          <span className="flex items-center gap-0.5 truncate">
            <span className="material-symbols-outlined text-[10px]">business</span>
            <span className="truncate">{building}</span>
          </span>
        )}
        {floor != null && (
          <span className="flex items-center gap-0.5 shrink-0">
            <span className="material-symbols-outlined text-[10px]">apartment</span>
            <span>Fl {floor}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default RoomCard;