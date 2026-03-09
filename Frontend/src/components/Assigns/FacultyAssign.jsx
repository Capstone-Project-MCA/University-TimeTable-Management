import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

const FacultyAssignmentWorkspace = () => {
  const [sidebarView, setSidebarView] = useState("faculty");
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [facultyRes, coursesRes] = await Promise.all([
          fetch(`${API_BASE}/faculty/all`),
          fetch(`${API_BASE}/course/all`),
        ]);

        if (!facultyRes.ok) throw new Error("Failed to fetch faculty");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");

        const facultyData = await facultyRes.json();
        const coursesData = await coursesRes.json();

        setFaculties(facultyData);
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
      if (zone === "faculty" && data._type === "faculty") {
        const exists = selectedFaculty.some((f) => f.FacultyUID === data.FacultyUID);
        if (!exists) setSelectedFaculty((prev) => [...prev, data]);
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

  const removeFaculty = (uid) => setSelectedFaculty((prev) => prev.filter((f) => f.FacultyUID !== uid));
  const removeCourse = (code) => setSelectedCourses((prev) => prev.filter((c) => c.CourseCode !== code));

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col shrink-0">

          {/* Toggle Switch */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSidebarView("faculty")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  sidebarView === "faculty"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">person_apron</span>
                Faculty
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

            {!loading && !error && sidebarView === "faculty" && faculties.map((faculty) => (
              <div
                key={faculty.FacultyUID}
                draggable
                onDragStart={(e) => handleDragStart(e, faculty, "faculty")}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-grab hover:border-primary/50 hover:shadow-sm transition-all active:cursor-grabbing"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-lg">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{faculty.FacultyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {faculty.FacultyUID} · {faculty.FacultyDomain}
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
              (sidebarView === "faculty" && faculties.length === 0) ||
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
              {sidebarView === "faculty" ? faculties.length : courses.length} available {sidebarView}
            </p>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col relative overflow-hidden">

          <div className="flex-1 p-8 overflow-y-auto pb-32">
            <div className="max-w-6xl mx-auto space-y-8">

              <div>
                <h1 className="text-2xl font-bold">Faculty Assignment Workspace</h1>
                <p className="text-slate-500">
                  Drag faculty and courses from the sidebar to assign them together.
                </p>
              </div>

              {/* Info Banner */}
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <div>
                  <h3 className="font-semibold text-primary">How to assign</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Switch between Faculty and Courses using the toggle, then drag items into the zones below.
                  </p>
                </div>
              </div>

              {/* Drop Zones */}
              <div className="grid lg:grid-cols-2 gap-8">

                {/* Selected Faculty Drop Zone */}
                <div
                  onDrop={(e) => handleDrop(e, "faculty")}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 min-h-[280px] transition-colors hover:border-primary/40"
                >
                  <h3 className="font-bold flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">group_add</span>
                    Selected Faculty
                    {selectedFaculty.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {selectedFaculty.length}
                      </span>
                    )}
                  </h3>

                  {selectedFaculty.length === 0 && (
                    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-3xl mb-2 block">drag_indicator</span>
                        Drop faculty here
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedFaculty.map((faculty) => (
                      <div key={faculty.FacultyUID} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-lg">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{faculty.FacultyName}</p>
                          <p className="text-xs text-slate-500">{faculty.FacultyUID} · {faculty.FacultyDomain}</p>
                        </div>
                        <button
                          onClick={() => removeFaculty(faculty.FacultyUID)}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Courses Drop Zone */}
                <div
                  onDrop={(e) => handleDrop(e, "courses")}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 min-h-[280px] transition-colors hover:border-primary/40"
                >
                  <h3 className="font-bold flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
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
                      <div key={course.CourseCode} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                        <div>
                          <p className="text-sm font-semibold">{course.CourseTitle}</p>
                          <p className="text-xs text-slate-500">{course.CourseCode} · {course.Credit} Credits</p>
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
            </div>
          </div>

          {/* Footer */}
          <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">checklist</span>
                <div>
                  <p className="text-sm font-bold">
                    {selectedFaculty.length > 0 || selectedCourses.length > 0
                      ? "Ready for assignment"
                      : "Drag items to get started"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedFaculty.length} faculty → {selectedCourses.length} course(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedFaculty([]); setSelectedCourses([]); }}
                  className="px-6 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Clear Workspace
                </button>
                <button
                  disabled={selectedFaculty.length === 0 || selectedCourses.length === 0}
                  className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Assignment
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </button>
              </div>
            </div>
          </footer>

        </main>

      </div>
    </div>
  );
};

export default FacultyAssignmentWorkspace;