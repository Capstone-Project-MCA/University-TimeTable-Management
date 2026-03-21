import React, { useState } from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const baseClasses =
    "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium w-full transition-colors";

  const inactiveClasses =
    "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";

  const activeClasses = "bg-primary/10 text-primary";

  // Faculty Assign group is open when either sub-tab is active, or manually toggled
  const isFacultyGroupActive = activeTab === "facultyAssign" || activeTab === "smartAssign";
  const [facultyGroupOpen, setFacultyGroupOpen] = useState(isFacultyGroupActive);

  function toggleFacultyGroup(e) {
    e.preventDefault();
    setFacultyGroupOpen((prev) => !prev);
    // If collapsing while a sub-tab is active, navigate away gracefully
  }

  return (
    <nav className="w-16 hover:w-56 transition-all duration-300 bg-surface dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 py-3 z-10 group overflow-hidden">
      {/* ── Manage group ─────────────────────────────────── */}
      <div className="px-3 mb-4 w-full">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2">
          Manage
        </p>

        <ul className="space-y-1 w-full">

          {/* Courses */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("courses"); }}
              className={`${baseClasses} ${activeTab === "courses" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">book_2</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Courses</span>
            </a>
          </li>

          {/* Sections */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("sections"); }}
              className={`${baseClasses} ${activeTab === "sections" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">groups</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Sections</span>
            </a>
          </li>

          {/* Faculties */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("faculties"); }}
              className={`${baseClasses} ${activeTab === "faculties" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">person_apron</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Faculties</span>
            </a>
          </li>

          {/* Rooms */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("rooms"); }}
              className={`${baseClasses} ${activeTab === "rooms" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">apartment</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Rooms</span>
            </a>
          </li>

          {/* Courses & Sections */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("coursesAndSections"); }}
              className={`${baseClasses} ${activeTab === "coursesAndSections" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">dashboard</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Courses & Sections</span>
            </a>
          </li>

        </ul>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-slate-200 dark:border-slate-700"></div>

      {/* ── Assign group ──────────────────────────────────── */}
      <div className="px-3 w-full">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2">
          Assign
        </p>

        <ul className="space-y-1 w-full">

          {/* ── Faculty Assign (collapsible parent) ── */}
          <li>
            {/* Parent row */}
            <a
              href="#"
              onClick={toggleFacultyGroup}
              className={`${baseClasses} ${isFacultyGroupActive ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">person_add</span>
              <span className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Faculty Assign
              </span>
              {/* Chevron — only visible when sidebar is expanded */}
              <span
                className={`material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 ${
                  facultyGroupOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                expand_more
              </span>
            </a>

            {/* Sub-items — slide in/out, only visible when sidebar is expanded AND group is open */}
            <ul
              className={`overflow-hidden transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                facultyGroupOpen ? "max-h-24 mt-0.5" : "max-h-0"
              }`}
            >
              {/* Left accent line */}
              <div className="ml-[22px] border-l-2 border-slate-200 dark:border-slate-700 pl-2 space-y-0.5">

                {/* Bulk Assign (table view) */}
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab("facultyAssign"); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium w-full transition-colors whitespace-nowrap ${
                      activeTab === "facultyAssign"
                        ? "text-primary bg-primary/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] min-w-[15px]">table_view</span>
                    Bulk Assign
                  </a>
                </li>

                {/* Smart Assign */}
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab("smartAssign"); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium w-full transition-colors whitespace-nowrap ${
                      activeTab === "smartAssign"
                        ? "text-primary bg-primary/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] min-w-[15px]">assignment_turned_in</span>
                    Smart Assign
                  </a>
                </li>

              </div>
            </ul>
          </li>

          {/* Section-Course Assignment */}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("sectionCourseAssign"); }}
              className={`${baseClasses} ${activeTab === "sectionCourseAssign" ? activeClasses : inactiveClasses}`}
            >
              <span className="material-symbols-outlined text-[20px] min-w-[20px]">link</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Section-Course</span>
            </a>
          </li>

        </ul>
      </div>
    </nav>
  );
}