import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useDataRefresh } from "../../context/DataRefreshContext";

// ─── Color palette ────────────────────────────────────────
const COLORS = ["blue","emerald","purple","amber","rose","cyan","indigo","teal"];
const colorBg = {
  blue:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  emerald:"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  purple:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  amber:"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  rose:"bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  cyan:"bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  indigo:"bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  teal:"bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};
const getColor = (s) => COLORS[[...(s||"")].reduce((a,c)=>a+c.charCodeAt(0),0) % COLORS.length];

export default function MergeSections() {
  /* ═══════ DATA ═══════ */
  const [courses, setCourses]   = useState([]);
  const [sections, setSections] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading]   = useState(true);

  /* ═══════ WORKFLOW STATE ═══════ */
  const [query, setQuery]                     = useState("");
  const [showSuggestions, setShowSuggestions]  = useState(false);
  const [selectedCourse, setSelectedCourse]   = useState(null);   // full object
  const [selectedSections, setSelectedSections] = useState([]);   // array of SectionId
  const [sectionError, setSectionError]       = useState("");
  const [mergeLog, setMergeLog]               = useState([]);
  const [lastMerge, setLastMerge]             = useState(null);

  const searchRef = useRef(null);
  const { refreshKey } = useDataRefresh();

  /* ═══════ FETCH ═══════ */
  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:8080/course/all"),
      axios.get("http://localhost:8080/section/all"),
      axios.get("http://localhost:8080/api/mappings"),
    ])
      .then(([c,s,m]) => { setCourses(c.data); setSections(s.data); setMappings(m.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (refreshKey > 0) fetchAll(); }, [refreshKey, fetchAll]);

  /* ═══════ CLOSE DROPDOWN ON OUTSIDE CLICK ═══════ */
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ═══════ DERIVED ═══════ */
  const q = query.toLowerCase().trim();
  const suggestions = q.length > 0
    ? courses.filter((c) =>
        (c.CourseCode||"").toLowerCase().includes(q) ||
        (c.CourseTitle||"").toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  const relatedSectionIds = selectedCourse
    ? [...new Set(mappings.filter((m) => m.Coursecode === selectedCourse.CourseCode).map((m) => m.Section))]
    : [];
  const relatedSections = sections.filter((s) => relatedSectionIds.includes(s.SectionId));

  /* ═══════ HANDLERS ═══════ */
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
    setTimeout(() => searchRef.current?.querySelector("input")?.focus(), 50);
  };
  const handleToggleSection = (id) => {
    setSectionError("");
    if (selectedSections.includes(id)) {
      setSelectedSections((p) => p.filter((x) => x !== id));
    } else {
      setSelectedSections((p) => [...p, id]);
    }
  };
  const handleSelectAll = () => {
    if (selectedSections.length === relatedSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(relatedSections.map((s) => s.SectionId));
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
      setSelectedSections([]);
      // Refresh mappings so UI reflects updated merge status
      const mRes = await axios.get("http://localhost:8080/api/mappings");
      setMappings(mRes.data);
    } catch (err) {
      const msg = err.response?.data?.error || "Merge failed. Please try again.";
      setSectionError(msg);
      setTimeout(() => setSectionError(""), 4000);
    } finally {
      setMerging(false);
    }
  };

  /* ═══════ RENDER ═══════ */
  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <div className="max-w-[960px] mx-auto px-6 py-6">

        {/* ━━━━━━━━━━ HEADER ━━━━━━━━━━ */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-white text-xl">call_merge</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Merge Sections</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Search for a course, select sections, and generate a merge code</p>
          </div>
        </div>

        {/* ━━━━━━━━━━ STEP 1 — COURSE SEARCH ━━━━━━━━━━ */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-visible mb-5">
          {/* Section label */}
          <div className="relative px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10"/>
            <div className="relative flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[15px]">search</span>
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  {selectedCourse ? "Active Course" : "Find a Course"}
                </h2>
                {!selectedCourse && <p className="text-[10px] text-slate-400 mt-0.5">Type a course code or name (e.g. "CSE")</p>}
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {selectedCourse ? (
              /* ── Active course chip ── */
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 rounded-xl p-4">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-xl">book_2</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`${colorBg[getColor(selectedCourse.CourseCode)]} text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                      {selectedCourse.CourseCode}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">stars</span>{selectedCourse.Credit} Credits
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white mt-1 truncate">{selectedCourse.CourseTitle}</h3>
                </div>
                <button onClick={handleChangeCourse}
                  className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[13px]">swap_horiz</span>Change
                </button>
              </div>
            ) : (
              /* ── Search input with dropdown ── */
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => { if (query.length > 0) setShowSuggestions(true); }}
                    placeholder="Type course code or name (e.g. CSE, Data Structures)…"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    autoComplete="off"
                  />
                  {query && (
                    <button onClick={() => { setQuery(""); setShowSuggestions(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && query.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-black/10 overflow-hidden max-h-[320px] overflow-y-auto">
                    {suggestions.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600 mb-1 block">search_off</span>
                        <p className="text-xs text-slate-400">No courses match "{query}"</p>
                      </div>
                    ) : (
                      suggestions.map((c) => (
                        <button key={c.CourseCode} onClick={() => handlePickCourse(c)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50/60 dark:hover:bg-blue-900/15 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 text-[15px] transition-colors">book_2</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`${colorBg[getColor(c.CourseCode)]} text-[10px] font-bold px-1.5 py-0.5 rounded`}>{c.CourseCode}</span>
                              {c.Credit != null && <span className="text-[10px] text-slate-400">{c.Credit} cr</span>}
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 truncate mt-0.5">{c.CourseTitle}</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-400 text-[15px] shrink-0 transition-colors">arrow_forward</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━ STEP 2 — SECTIONS ━━━━━━━━━━ */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden mb-5">
          <div className="relative px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10"/>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-[15px]">groups</span>
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Sections</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedCourse
                      ? `Select at least 2 sections to merge • ${selectedSections.length} selected`
                      : "Select a course above first"}
                  </p>
                </div>
              </div>
              {selectedCourse && relatedSections.length > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={handleSelectAll}
                    className="text-[10px] font-medium text-primary hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    {selectedSections.length === relatedSections.length ? "Deselect all" : "Select all"}
                  </button>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedSections.length >= 2
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>{selectedSections.length}/{relatedSections.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {sectionError && (
            <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/70 dark:border-red-800/50 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-sm">error</span>
              <p className="text-[11px] font-medium">{sectionError}</p>
            </div>
          )}

          <div className="px-5 py-4">
            {!selectedCourse ? (
              /* Prompt */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-3 shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">school</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No course selected</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[250px] leading-relaxed">Use the search bar above to find and select a course first</p>
              </div>
            ) : relatedSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">folder_off</span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No sections mapped to this course</p>
                <p className="text-[10px] text-slate-400 mt-1">Assign sections via Section-Course first</p>
              </div>
            ) : (
              /* Section grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedSections.map((s) => {
                  const sel = selectedSections.includes(s.SectionId);
                  return (
                    <button key={s.SectionId} onClick={() => handleToggleSection(s.SectionId)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                        sel
                          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10"
                          : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-800/60"
                      }`}>
                      <div className="flex items-start gap-2.5">
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-px transition-all ${
                          sel ? "bg-emerald-500 border-emerald-500 text-white scale-110" : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400"
                        }`}>
                          {sel && <span className="material-symbols-outlined text-[11px] font-bold">check</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-slate-800 dark:text-white">{s.SectionId}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[9px] font-bold px-1.5 py-0.5 rounded">{s.ProgramName}</span>
                            <span className="text-[9px] text-slate-400">Sem {s.Semester}</span>
                            <span className="text-[9px] text-slate-400">{s.Strength} students</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━ STEP 3 — MERGE ACTION ━━━━━━━━━━ */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden mb-5">
          <div className="relative px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-fuchsia-500/10"/>
            <div className="relative flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[15px]">call_merge</span>
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Merge</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Generate a unique merge code for the selected sections</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {/* Merge summary & button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Info */}
              <div className="flex-1">
                {canMerge ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Ready to merge:</span>
                    {selectedSections.map((id) => (
                      <span key={id} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">{id}</span>
                    ))}
                    <span className="text-[10px] text-slate-400">for</span>
                    <span className={`${colorBg[getColor(selectedCourse?.CourseCode)]} text-[10px] font-bold px-2 py-0.5 rounded-md`}>{selectedCourse?.CourseCode}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    {!selectedCourse
                      ? "Select a course and at least 2 sections to enable merge"
                      : selectedSections.length === 0
                        ? "No sections selected — pick at least 2 from above"
                        : `${selectedSections.length} section selected — need at least 2`}
                  </p>
                )}
              </div>
              {/* Button */}
              <button onClick={handleMerge} disabled={!canMerge || merging}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 shrink-0 ${
                  canMerge && !merging
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                }`}>
                {merging ? (
                  <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Merging…</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]">call_merge</span>Generate Merge Code</>
                )}
              </button>
            </div>

            {/* Last merge result */}
            {lastMerge && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-white text-base">check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Merge code <span className="bg-emerald-200/60 dark:bg-emerald-800/40 px-1.5 py-0.5 rounded-md font-mono">{lastMerge.mergeCode}</span> generated!
                  </p>
                  <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                    {lastMerge.course} — {lastMerge.sections.join(", ")}
                  </p>
                </div>
                <button onClick={() => setLastMerge(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━ MERGE HISTORY ━━━━━━━━━━ */}
        {mergeLog.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="relative px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-yellow-500/10"/>
              <div className="relative flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-[15px]">history</span>
                </div>
                <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Merge History</h2>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">{mergeLog.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    {["#","Merge Code","Course","Sections","Time"].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mergeLog.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3 text-slate-400 font-mono">{e.id}</td>
                      <td className="px-5 py-3">
                        <span className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-sm">{e.mergeCode}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{e.course}</span>
                        <span className="text-slate-400 ml-1.5 font-normal text-[10px]">{e.courseTitle}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {e.sections.map((s) => (
                            <span key={s} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">{e.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
