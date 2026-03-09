import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

const BulkAssignment = () => {
  const [sidebarView, setSidebarView] = useState("sections");
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sectionsRes, coursesRes] = await Promise.all([
          fetch(`${API_BASE}/section/all`),
          fetch(`${API_BASE}/course/all`),
        ]);

        if (!sectionsRes.ok) throw new Error("Failed to fetch sections");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");

        const sectionsData = await sectionsRes.json();
        const coursesData = await coursesRes.json();

        setSections(sectionsData);
        setCourses(coursesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDragStart = (e, item, type) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, _type: type }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (zone === "sections" && data._type === "section") {
        const exists = selectedSections.some((s) => s.SectionId === data.SectionId);
        if (!exists) setSelectedSections((prev) => [...prev, data]);
      } else if (zone === "courses" && data._type === "course") {
        const exists = selectedCourses.some((c) => c.CourseCode === data.CourseCode);
        if (!exists) setSelectedCourses((prev) => [...prev, data]);
      }
    } catch { /* ignore */ }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const removeSection = (id) => setSelectedSections((prev) => prev.filter((s) => s.SectionId !== id));
  const removeCourse = (code) => setSelectedCourses((prev) => prev.filter((c) => c.CourseCode !== code));

  const handleAssign = async () => {
    if (selectedSections.length === 0 || selectedCourses.length === 0) return;
    setAssigning(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/section/assign-courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionIds: selectedSections.map((s) => s.SectionId),
          courseId: selectedCourses.map((c) => c.CourseCode),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Server error (${res.status})`);
      }
      const data = await res.json();
      setResult({ success: true, ...data });
      setSelectedSections([]);
      setSelectedCourses([]);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">

      <main className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">

          {/* Toggle Switch */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSidebarView("sections")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  sidebarView === "sections"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
                Sections
              </button>
              <button
                onClick={() => setSidebarView("courses")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  sidebarView === "courses"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">menu_book</span>
                Courses
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-slate-400 animate-spin text-2xl">refresh</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {!loading && !error && sidebarView === "sections" && sections.map((section) => (
              <div
                key={section.SectionId}
                draggable
                onDragStart={(e) => handleDragStart(e, section, "section")}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-grab hover:border-primary/50 hover:shadow-sm transition-all active:cursor-grabbing"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{section.SectionId}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {section.ProgramName} · Sem {section.Semester} · {section.Strength} students
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg shrink-0">
                  drag_indicator
                </span>
              </div>
            ))}

            {!loading && !error && sidebarView === "courses" && courses.map((course) => (
              <div
                key={course.CourseCode}
                draggable
                onDragStart={(e) => handleDragStart(e, course, "course")}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-grab hover:border-primary/50 hover:shadow-sm transition-all active:cursor-grabbing"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{course.CourseTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course.CourseCode} · {course.Credit} Cr · {course.CourseType}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg shrink-0">
                  drag_indicator
                </span>
              </div>
            ))}

            {!loading && !error && (
              (sidebarView === "sections" && sections.length === 0) ||
              (sidebarView === "courses" && courses.length === 0)
            ) && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
                No {sidebarView} found
              </div>
            )}
          </div>

          {/* Footer Count */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
            <p className="text-[11px] text-slate-400">
              {sidebarView === "sections" ? sections.length : courses.length} available {sidebarView}
            </p>
          </div>
        </aside>

        {/* Main Workspace */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">

            <div>
              <h1 className="text-2xl font-bold">Section-Course Assignment</h1>
              <p className="text-slate-500">
                Drag sections and courses from the sidebar to link them together.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Selected Sections Drop Zone */}
              <div
                onDrop={(e) => handleDrop(e, "sections")}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[300px] transition-colors hover:border-primary/40"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">groups</span>
                  Selected Sections
                  {selectedSections.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {selectedSections.length}
                    </span>
                  )}
                </h3>

                {selectedSections.length === 0 && (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 block">drag_indicator</span>
                      Drop sections here
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedSections.map((section) => (
                    <div key={section.SectionId} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-sm">{section.SectionId}</p>
                        <p className="text-xs text-slate-500">
                          {section.ProgramName} · Sem {section.Semester}
                        </p>
                      </div>
                      <button
                        onClick={() => removeSection(section.SectionId)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Courses Drop Zone */}
              <div
                onDrop={(e) => handleDrop(e, "courses")}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[300px] transition-colors hover:border-primary/40"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
                  Target Courses
                  {selectedCourses.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {selectedCourses.length}
                    </span>
                  )}
                </h3>

                {selectedCourses.length === 0 && (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 block">drag_indicator</span>
                      Drop courses here
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCourses.map((course) => (
                    <div key={course.CourseCode} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-sm">{course.CourseTitle}</p>
                        <p className="text-xs text-slate-500">
                          {course.CourseCode} · {course.Credit} Credits
                        </p>
                      </div>
                      <button
                        onClick={() => removeCourse(course.CourseCode)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Result Banner */}
            {result && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              }`}>
                <span className="material-symbols-outlined text-xl mt-0.5">
                  {result.success ? "check_circle" : "error"}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{result.success ? "Assignment Complete" : "Assignment Failed"}</p>
                  <p className="text-sm mt-0.5">{result.message}</p>
                  {result.success && (
                    <p className="text-xs mt-1 opacity-75">
                      {result.created} created · {result.skipped} skipped
                    </p>
                  )}
                </div>
                <button onClick={() => setResult(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            )}

            {/* Confirm Bar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Confirm Assignment</h4>
                  <p className="text-sm text-slate-500">
                    {selectedSections.length} section(s) → {selectedCourses.length} course(s)
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedSections([]); setSelectedCourses([]); setResult(null); }}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={selectedSections.length === 0 || selectedCourses.length === 0 || assigning}
                    className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {assigning ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">link</span>
                        Assign Sections
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
};

export default BulkAssignment;