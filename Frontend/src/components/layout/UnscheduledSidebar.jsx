import React from "react";
import {
  unscheduledCourses,
  unscheduledFaculty,
  unscheduledRoom,
  unscheduledSections,
} from "../../data/mockData";

import CourseCard from "../common/CourseCard";
import FacultyCard from "../common/FacultyCard";
import RoomCard from "../common/RoomCard";
import SectionCard from "../common/SectionCard";

export default function UnscheduledSidebar({ activeTab = "courses" }) {
  let data = [];

  switch (activeTab) {
    case "courses":
      data = unscheduledCourses;
      break;
    case "faculties":
      data = unscheduledFaculty;
      break;
    case "rooms":
      data = unscheduledRoom;
      break;
    case "sections":
      data = unscheduledSections;
      break;
    default:
      data = [];
  }

  return (
    <aside className="w-64 bg-background-light dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">
      
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-surface dark:bg-surface-dark">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Unscheduled
          </h2>
        </div>

        {/* Search */}
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              search
            </span>
            <input
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {data.map((item) => {
          switch (activeTab) {
            case "courses":
              return <CourseCard key={item.id} {...item} />;

            case "faculties":
              return <FacultyCard key={item.id} {...item} />;

            case "rooms":
              return <RoomCard key={item.id} {...item} />;

            case "sections":
              return <SectionCard key={item.id} {...item} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center">
        <p className="text-[11px] text-slate-400">
          {data.length} unscheduled
        </p>
      </div>
    </aside>
  );
}