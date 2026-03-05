import React from "react";

function RoomCard({ roomNumber, building, floor, capacity, type }) {
  return (
    <div className="group bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-all">

      {/* Room Type Badge */}
      <div className="flex justify-between items-start mb-1">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
          {type}
        </span>

        <span className="text-[11px] text-slate-400">
          {capacity} Seats
        </span>
      </div>

      {/* Room Number */}
      <h3 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
        {roomNumber}
      </h3>

      {/* Building Info */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        <span className="material-symbols-outlined text-xs">
          business
        </span>
        <span className="truncate">{building}</span>
      </div>

      {/* Floor Info */}
      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        <span className="material-symbols-outlined text-xs">
          apartment
        </span>
        <span>Floor {floor}</span>
      </div>
    </div>
  );
}

export default RoomCard;