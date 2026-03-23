import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useDataRefresh } from "../../context/DataRefreshContext";

// ─── Color palette & Helpers ────────────────────────────────────────
const COLORS = ["blue", "emerald", "purple", "amber", "rose", "cyan", "indigo", "teal"];
const colorBg = {
  blue: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  emerald: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  purple: "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  amber: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  rose: "bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  cyan: "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  indigo: "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  teal: "bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};
const getColor = (s) => COLORS[[...(s || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

const mappingCourseCode = (m) => m.Coursecode ?? m.coursecode ?? "";
const mappingSection = (m) => m.Section ?? m.section ?? "";
const sectionRowId = (s) => s.SectionId ?? s.sectionId ?? "";

// ─── Sample Data ────────────────────────────────────────────────────
const SAMPLE_COURSES = [
  { CourseCode: "CSE101", CourseTitle: "Introduction to Computer Science", Credit: 3 },
  { CourseCode: "DAT202", CourseTitle: "Data Structures & Algorithms", Credit: 4 },
  { CourseCode: "MAT301", CourseTitle: "Advanced Mathematics", Credit: 3 },
  { CourseCode: "ENG105", CourseTitle: "Professional Communication", Credit: 2 },
];

const SAMPLE_SECTIONS = [
  { SectionId: "S1-A", ProgramName: "Computer Science", Semester: 1, Strength: 45 },
  { SectionId: "S1-B", ProgramName: "Computer Science", Semester: 1, Strength: 42 },
  { SectionId: "S1-C", ProgramName: "Software Engineering", Semester: 1, Strength: 38 },
  { SectionId: "S2-D", ProgramName: "Information Tech", Semester: 2, Strength: 40 },
];

const SAMPLE_MAPPINGS = [
  { Coursecode: "CSE101", Section: "S1-A" },
  { Coursecode: "CSE101", Section: "S1-B" },
  { Coursecode: "CSE101", Section: "S1-C" },
  { Coursecode: "DAT202", Section: "S1-A" },
  { Coursecode: "DAT202", Section: "S2-D" },
];

export default function MergeSections() {
  const [courses, setCourses] = useState(SAMPLE_COURSES);
  const [sections, setSections] = useState(SAMPLE_SECTIONS);
  const [mappings, setMappings] = useState(SAMPLE_MAPPINGS);
  const [loading, setLoading] = useState(true);
  const [usingSamples, setUsingSamples] = useState(true);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [sectionError, setSectionError] = useState("");
  const [mergeLog, setMergeLog] = useState([]);
  const [lastMerge, setLastMerge] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const searchRef = useRef(null);
  const anchorRef = useRef(null);
  const dropdownPortalRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const { refreshKey } = useDataRefresh();

  const updateDropdownPos = useCallback(() => {
    if (!anchorRef.current || !showSuggestions || !query.trim()) {
      setDropdownPos(null);
      return;
    }
    const r = anchorRef.current.getBoundingClientRect();
    const gap = 8;
    const maxH = Math.min(400, Math.max(120, window.innerHeight - r.bottom - gap - 16));
    setDropdownPos({ top: r.bottom + gap, left: r.left, width: r.width, maxHeight: maxH });
  }, [showSuggestions, query]);

  useLayoutEffect(() => { updateDropdownPos(); }, [updateDropdownPos]);

  useEffect(() => {
    const onReposition = () => updateDropdownPos();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [updateDropdownPos]);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:8080/course/all"),
      axios.get("http://localhost:8080/section/all"),
      axios.get("http://localhost:8080/api/mappings"),
    ])
      .then(([c, s, m]) => {
        setCourses(c.data);
        setSections(s.data);
        setMappings(m.data);
        setUsingSamples(false);
      })
      .catch(() => setUsingSamples(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (refreshKey > 0) fetchAll(); }, [refreshKey, fetchAll]);

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target) && !dropdownPortalRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase().trim();
  const suggestions = q.length > 0
    ? courses.filter((c) =>
        (c.CourseCode || "").toLowerCase().includes(q) ||
        (c.CourseTitle || "").toLowerCase().includes(q)
      ).slice(0, 10)
    : [];

  const relatedSectionIds = selectedCourse
    ? [...new Set(mappings.filter((m) => mappingCourseCode(m) === selectedCourse.CourseCode).map(mappingSection))]
    : [];
  const relatedSections = sections.filter((s) => relatedSectionIds.includes(sectionRowId(s)));

  const handlePickCourse = (course) => {
    setSelectedCourse(course);
    setQuery("");
    setShowSuggestions(false);
    setSelectedSections([]);
    setSectionError("");
    setLastMerge(null);
  };

  const handleChangeCourse = () => {
    setSelectedCourse(null);
    setSelectedSections([]);
    setSectionError("");
    setLastMerge(null);
    setTimeout(() => searchRef.current?.querySelector("input")?.focus(), 100);
  };

  const handleToggleSection = (id) => {
    setSectionError("");
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSections.length === relatedSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(relatedSections.map((s) => sectionRowId(s)));
    }
  };

  const canMerge = selectedSections.length >= 2;
  const [merging, setMerging] = useState(false);

  const handleMerge = async () => {
    if (!canMerge || merging) return;
    setMerging(true);
    try {
      const res = await axios.post("http://localhost:8080/api/mappings/merge", {
        courseCode: selectedCourse.CourseCode,
        sectionIds: selectedSections,
      });
      const { mergeCode } = res.data;
      const entry = {
        id: mergeLog.length + 1,
        mergeCode,
        course: selectedCourse.CourseCode,
        courseTitle: selectedCourse.CourseTitle,
        sections: [...selectedSections],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMergeLog((p) => [entry, ...p]);
      setLastMerge(entry);
      setShowToast(true);
      setSelectedSections([]);
      const mRes = await axios.get("http://localhost:8080/api/mappings");
      setMappings(mRes.data);
    } catch (err) {
      if (!err.response) {
         const entry = {
            id: mergeLog.length + 1,
            mergeCode: "M-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
            course: selectedCourse.CourseCode,
            courseTitle: selectedCourse.CourseTitle,
            sections: [...selectedSections],
            timestamp: new Date().toLocaleTimeString(),
          };
          setMergeLog((p) => [entry, ...p]);
          setLastMerge(entry);
          setShowToast(true);
          setSelectedSections([]);
          setSectionError("");
      } else {
        setSectionError(err.response?.data?.error || "Merge failed.");
      }
    } finally {
      setMerging(false);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* ── CUSTOM TOAST NOTIFICATION ── */}
      {showToast && createPortal(
        <div className="fixed top-6 right-6 z-[10000] animate-fade-in-up">
          <div className="glass px-6 py-4 rounded-2xl border-l-4 border-l-emerald-500 bg-white/90 dark:bg-slate-900/90 shadow-2xl flex items-center gap-4 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">Merge Successful</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Transaction ID: {lastMerge?.mergeCode}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined text-sm text-slate-400">close</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* ── Header Area ── */}
        <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-white text-2xl">call_merge</span>
                </div>
                Course Mapping & Merge
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Combine multiple sections into a single cohort. Select at least 2 sections.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Side: Search & Course Info ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">search</span>
                Course Search
              </h2>
              <div className="relative" ref={searchRef}>
                <div className="relative" ref={anchorRef}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search Code or Title..."
                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                </div>

                {showSuggestions && query.length > 0 && dropdownPos && createPortal(
                  <div 
                    ref={dropdownPortalRef}
                    className="fixed z-[9999] glass rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, maxHeight: dropdownPos.maxHeight }}
                  >
                    <div className="overflow-y-auto py-2 scrollbar-hide">
                      {suggestions.length === 0 ? (
                        <div className="px-5 py-8 text-center text-slate-400 text-xs">No courses found</div>
                      ) : (
                        suggestions.map(c => (
                          <button
                            key={c.CourseCode}
                            onClick={() => handlePickCourse(c)}
                            className="w-full px-5 py-3 text-left hover:bg-primary/5 flex items-center gap-3 transition-colors group"
                          >
                            <div className="flex-1 truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                                {c.CourseTitle}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>

            {selectedCourse && (
              <div className="animate-fade-in-up bg-gradient-to-br from-primary to-blue-600 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active Course</span>
                    <button onClick={handleChangeCourse} className="hover:rotate-90 transition-transform bg-black/10 rounded-lg p-1">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
                <h3 className="text-xl font-black">{selectedCourse.CourseTitle}</h3>
                <p className="text-blue-100 font-bold uppercase text-xs">{selectedCourse.CourseCode}</p>
              </div>
            )}
          </div>

          {/* ── Right Side: Sections & Persistent Merge Bar ── */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <div className="flex-1 relative glass rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Available Sections</h2>
                {selectedCourse && relatedSections.length > 0 && (
                  <button onClick={handleSelectAll} className="text-xs font-black text-primary px-3 py-2 rounded-xl">
                    {selectedSections.length === relatedSections.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
                {!selectedCourse ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-24 h-24 rounded-[40px] bg-slate-100 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-5xl">search</span>
                    </div>
                    <h3 className="text-lg font-black italic">Search Course First</h3>
                    <p className="text-xs mt-2">Search "CSE" in the sidebar input.</p>
                  </div>
                ) : relatedSections.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <h3 className="text-lg font-black">No Sections found</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
                    {relatedSections.map((s) => {
                      const id = sectionRowId(s);
                      const isSelected = selectedSections.includes(id);
                      return (
                        <div 
                          key={id} 
                          onClick={() => handleToggleSection(id)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? "bg-primary/5 border-primary" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary text-white" : "border-slate-200"}`}>
                              {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                            </div>
                            <h4 className="text-md font-black">{id}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── PERSISTENT MERGE ACTION BAR ── */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="glass px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canMerge ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                      <span className="material-symbols-outlined text-xl">call_merge</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                        {selectedSections.length} Sections Selected
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {!selectedCourse ? "Search course first" : canMerge ? "Ready to Merge" : "Pick 2+ sections"}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleMerge}
                    disabled={!canMerge || merging}
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        canMerge 
                        ? "bg-primary text-white shadow-xl hover:scale-105" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {merging ? "Merging..." : "Merge Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── HISTORY / SUCCESS FEEDBACK ── */}
        <div className="mt-12 space-y-6">
            {lastMerge && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl flex items-center gap-6 animate-scale-in">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <span className="material-symbols-outlined text-white text-3xl">done</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-200 uppercase tracking-tighter">Success! Combined {lastMerge.sections.length} Sections</h3>
                        <p className="text-xs font-bold text-emerald-700/60 font-mono tracking-widest uppercase">ID: {lastMerge.mergeCode}</p>
                    </div>
                </div>
            )}

          {mergeLog.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Recent Activity
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Merge ID</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {mergeLog.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5 font-mono text-xs font-black text-primary">{log.mergeCode}</td>
                        <td className="px-6 py-5 text-sm font-black">{log.course}</td>
                        <td className="px-6 py-5 text-[10px] font-mono text-slate-400">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
