import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const baseClasses =
    "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium w-full transition-colors";

  const inactiveClasses =
    "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";

  const activeClasses = "bg-primary/10 text-primary";

  return (
    <nav className="w-16 hover:w-56 transition-all duration-300 bg-surface dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 py-3 z-10 group overflow-hidden">
      <div className="px-3 mb-4 w-full">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2">
          Manage
        </p>

        <ul className="space-y-1 w-full">

          {/* Courses */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("courses");
              }}
              className={`${baseClasses} ${
                activeTab === "courses" ? activeClasses : inactiveClasses
              }`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">
                book_2
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Courses
              </span>
            </a>
          </li>

          {/* Sections */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("sections");
              }}
              className={`${baseClasses} ${
                activeTab === "sections" ? activeClasses : inactiveClasses
              }`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">
                groups
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Sections
              </span>
            </a>
          </li>

          {/* Faculties */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("faculties");
              }}
              className={`${baseClasses} ${
                activeTab === "faculties" ? activeClasses : inactiveClasses
              }`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">
                person_apron
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Faculties
              </span>
            </a>
          </li>

          {/* Rooms */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("rooms");
              }}
              className={`${baseClasses} ${
                activeTab === "rooms" ? activeClasses : inactiveClasses
              }`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">
                apartment
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Rooms
              </span>
            </a>
          </li>

        </ul>
      </div>
    </nav>
  );
}