import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDataRefresh } from "../context/DataRefreshContext";
import CourseCard from "../components/common/CourseCard";
import SectionCard from "../components/common/SectionCard";

export default function CoursesAndSections() {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  const { refreshKey, lastRefreshedEntity } = useDataRefresh();

  // ── Fetch courses ───────────────────────────────────────
  const fetchCourses = () => {
    setLoadingCourses(true);
    axios
      .get("http://localhost:8080/course/all")
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoadingCourses(false));
  };

  // ── Fetch sections ──────────────────────────────────────
  const fetchSections = () => {
    setLoadingSections(true);
    axios
      .get("http://localhost:8080/section/all")
      .then((res) => setSections(res.data))
      .catch((err) => console.error("Error fetching sections:", err))
      .finally(() => setLoadingSections(false));
  };

  useEffect(() => {
    fetchCourses();
    fetchSections();
  }, []);

  // Auto-refresh on context change
  useEffect(() => {
    if (refreshKey === 0) return;
    if (!lastRefreshedEntity || lastRefreshedEntity === "course") fetchCourses();
    if (!lastRefreshedEntity || lastRefreshedEntity === "section") fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ── Search filters ──────────────────────────────────────
  const cq = courseSearch.toLowerCase().trim();
  const filteredCourses = cq
    ? courses.filter(
        (c) =>
          (c.CourseCode || "").toLowerCase().includes(cq) ||
          (c.CourseTitle || "").toLowerCase().includes(cq)
      )
    : courses;

  const sq = sectionSearch.toLowerCase().trim();
  const filteredSections = sq
    ? sections.filter(
        (s) =>
          (s.SectionId || "").toLowerCase().includes(sq) ||
          (s.ProgramName || "").toLowerCase().includes(sq)
      )
    : sections;

  // ── Action stubs ────────────────────────────────────────
  const handleAddCourse = () => console.log("Add new course");
  const handleAddSection = () => console.log("Add new section");
  const handleEditCourse = (item) => console.log("Edit course", item);
  const handleDeleteCourse = (item) => console.log("Delete course", item);
  const handleEditSection = (item) => console.log("Edit section", item);
  const handleDeleteSection = (item) => console.log("Delete section", item);

  // ── Skeleton loader ─────────────────────────────────────
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            dashboard
          </span>
          Courses &amp; Sections
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your courses and sections from a single view.
        </p>
      </div>

      {/* Two-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─────────────── COURSES PANEL ─────────────── */}
        <section className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                book_2
              </span>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Courses
              </h2>
              <span className="ml-1 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {filteredCourses.length}
              </span>
            </div>
            <button
              id="add-course-btn"
              onClick={handleAddCourse}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Course
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
              <input
                id="course-search"
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search by code or title…"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide max-h-[calc(100vh-320px)]">
            {loadingCourses ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">
                  search_off
                </span>
                <p className="text-xs">
                  {cq ? "No courses match your search" : "No courses available"}
                </p>
              </div>
            ) : (
              filteredCourses.map((item) => (
                <CourseCard
                  key={item.CourseCode}
                  course={item.CourseCode}
                  title={item.CourseTitle}
                  credits={item.Credit}
                  teacher={"TBA"}
                  color="blue"
                  onEdit={() => handleEditCourse(item)}
                  onDelete={() => handleDeleteCourse(item)}
                />
              ))
            )}
          </div>
        </section>

        {/* ─────────────── SECTIONS PANEL ─────────────── */}
        <section className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">
                groups
              </span>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Sections
              </h2>
              <span className="ml-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {filteredSections.length}
              </span>
            </div>
            <button
              id="add-section-btn"
              onClick={handleAddSection}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Section
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
              <input
                id="section-search"
                type="text"
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                placeholder="Search by section ID or program…"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide max-h-[calc(100vh-320px)]">
            {loadingSections ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">
                  search_off
                </span>
                <p className="text-xs">
                  {sq
                    ? "No sections match your search"
                    : "No sections available"}
                </p>
              </div>
            ) : (
              filteredSections.map((item) => (
                <SectionCard
                  key={item.SectionId}
                  sectionName={item.SectionId}
                  course={item.ProgramName}
                  semester={item.Semester}
                  strength={item.Strength}
                  onEdit={() => handleEditSection(item)}
                  onDelete={() => handleDeleteSection(item)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
