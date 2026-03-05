import React from 'react';
import { scheduledClasses, days, times } from '../../data/mockData';
import ClassCard from './ClassCard';

export default function TimetableGrid() {
  return (
    <div className="flex-1 overflow-hidden p-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative z-0">
      <div className="bg-white dark:bg-slate-800 rounded shadow-soft border border-slate-200 dark:border-slate-700 w-full h-full flex flex-col overflow-hidden relative">
        
        {/* Header Row */}
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 relative z-20">
          <div className="h-10 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">GMT-5</span>
          </div>
          {days.map((d) => (
            <div
              key={d.id}
              className="h-10 flex flex-col justify-center text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                {d.day}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {d.date}
              </span>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] divide-x divide-slate-100 dark:divide-slate-700/50 pointer-events-none z-0">
            <div className="bg-slate-50/50 dark:bg-slate-800/30"></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>

          {/* Time Rows */}
          <div className="flex-1 grid grid-rows-8 divide-y divide-slate-100 dark:divide-slate-700/50 h-full relative z-10">
            {times.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[50px_1fr] w-full h-full min-h-0 relative"
              >
                {/* Time Label */}
                <div className="flex items-center justify-center text-[11px] font-medium text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-700/50 relative z-20">
                  {time}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-5 divide-x divide-slate-100 dark:divide-slate-700/50 w-full h-full relative z-10">
                  {days.map((d) => {
                    const cellClass = scheduledClasses.find(
                      (c) => c.day === d.id && c.time === time
                    );

                    return cellClass ? (
                      <ClassCard key={`${d.id}-${time}`} {...cellClass} />
                    ) : (
                      <div
                        key={`${d.id}-${time}`}
                        className="p-0.5 h-full relative z-0"
                      ></div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}