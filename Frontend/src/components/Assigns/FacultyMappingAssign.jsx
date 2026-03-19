import React, { useState, useEffect, useRef } from "react";
import { useDataRefresh } from "../../context/DataRefreshContext";

const API_BASE = "http://localhost:8080";

/* ── helpers ── */
const PAGE_SIZE = 10;

export default function FacultyMappingAssign() {
  // ── state ──────────────────────────────────────────────────────────────────
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [facultySearch, setFacultySearch] = useState("");
  const [facultySuggestions, setFacultySuggestions] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedSection, setSelectedSection] = useState("");
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [page, setPage] = useState(0);


  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const searchRef = useRef(null);

  // ── fetch faculties + sections on mount ────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [fRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/faculty/all`),
          fetch(`${API_BASE}/section/all`),
        ]);
        if (fRes.ok) setFaculties(await fRes.json());
        if (sRes.ok) setSections(await sRes.json());
      } catch { /* silent */ }
    }
    init();
  }, []);

  // Auto-refresh faculty/section lists when relevant uploads complete
  const { refreshKey, lastRefreshedEntity } = useDataRefresh();
  useEffect(() => {
    if (refreshKey === 0) return;
    if (!lastRefreshedEntity || lastRefreshedEntity === 'faculty') {
      fetch(`${API_BASE}/faculty/all`).then(r => r.ok ? r.json() : []).then(setFaculties).catch(() => {});
    }
    if (!lastRefreshedEntity || lastRefreshedEntity === 'section') {
      fetch(`${API_BASE}/section/all`).then(r => r.ok ? r.json() : []).then(setSections).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ── faculty search autocomplete ────────────────────────────────────────────
  useEffect(() => {
    if (!facultySearch.trim()) { setFacultySuggestions([]); return; }
    const q = facultySearch.toLowerCase();
    setFacultySuggestions(
      faculties.filter(
        (f) =>
          (f.FacultyUID || "").toLowerCase().includes(q) ||
          (f.FacultyName || "").toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [facultySearch, faculties]);

  // ── fetch mappings when section changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedSection) { setMappings([]); setCheckedIds(new Set()); setPage(0); return; }
    setMappingsLoading(true);
    fetch(`${API_BASE}/api/mappings`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (Array.isArray(data) ? data : []).filter(
          (m) => (m.section || m.Section) === selectedSection
        );
        setMappings(filtered);
        setCheckedIds(new Set());
        setPage(0);
      })
      .catch(() => setMappings([]))
      .finally(() => setMappingsLoading(false));
  }, [selectedSection]);

  // ── derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(mappings.length / PAGE_SIZE));
  const paginated = mappings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const allPageChecked =
    paginated.length > 0 &&
    paginated.every((m) => checkedIds.has(m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m)));

  const selectedFacultyObj = faculties.find((f) => f.FacultyUID === selectedFaculty?.FacultyUID);

  // ── handlers ──────────────────────────────────────────────────────────────
  function selectFaculty(f) {
    setSelectedFaculty(f);
    setFacultySearch(f.FacultyUID);
    setShowSuggestions(false);
  }

  function clearFaculty() {
    setSelectedFaculty(null);
    setFacultySearch("");
  }

  function toggleRow(id) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allPageChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((m) => next.delete(m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m)));
        return next;
      });
    } else {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((m) => next.add(m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m)));
        return next;
      });
    }
  }

  async function handleAssign() {
    if (!selectedFaculty || checkedIds.size === 0) return;
    setSaving(true);
    setResult(null);
    let succeeded = 0, failed = 0;

    const selected = mappings.filter((m) => {
      const id = m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m);
      return checkedIds.has(id);
    });

    for (const m of selected) {
      try {
        const res = await fetch(`${API_BASE}/assign/assign-faculty`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: m.section || m.Section,
            courseCode: m.coursecode || m.Coursecode,
            groupNo: m.groupNo ?? m.GroupNo,
            mappingType: m.mappingType,
            facultyUID: selectedFaculty.FacultyUID,
          }),
        });
        res.ok ? succeeded++ : failed++;
      } catch { failed++; }
    }

    setSaving(false);
    if (failed === 0) {
      setResult({ success: true, message: `Successfully assigned ${succeeded} mapping(s) to ${selectedFaculty.FacultyUID}.` });
      // update local mapping state to show the new UID
      setMappings((prev) =>
        prev.map((m) => {
          const id = m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m);
          if (checkedIds.has(id)) return { ...m, facultyUID: selectedFaculty.FacultyUID, FacultyUID: selectedFaculty.FacultyUID };
          return m;
        })
      );
      setCheckedIds(new Set());
    } else {
      setResult({ success: false, message: `${succeeded} succeeded, ${failed} failed. Check console for details.` });
    }
  }

  // ── row id helper ─────────────────────────────────────────────────────────
  function rowId(m) {
    return m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m);
  }

  // ── nature badge ──────────────────────────────────────────────────────────
  function natureBadge(nature) {
    if (nature === "P" || nature === "p")
      return <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase dark:bg-primary/20 dark:text-blue-300">Practical</span>;
    return <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase dark:bg-emerald-900/30 dark:text-emerald-400">Theory</span>;
  }

  // ── workload display ──────────────────────────────────────────────────────
  const currentLoad = selectedFacultyObj?.CurrentLoad ?? 0;
  const expectedLoad = selectedFacultyObj?.ExpectedLoad ?? 0;
  const workloadPct = expectedLoad > 0 ? Math.min(100, Math.round((currentLoad / expectedLoad) * 100)) : 0;
  const workloadColor =
    workloadPct >= 90 ? "text-red-500" :
    workloadPct >= 70 ? "text-amber-500" :
    "text-tertiary";

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">

      <div className="max-w-[1400px] mx-auto px-8 pt-10 space-y-8">

        {/* ── Step 1: Faculty Selection ──────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Step 1 — Select Faculty
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-dashed border-primary/20 flex items-center gap-4">
            <div className="flex-1 relative" ref={searchRef}>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => { setFacultySearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search by Faculty UID or name..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && facultySuggestions.length > 0 && (
                <ul className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {facultySuggestions.map((f) => (
                    <li
                      key={f.FacultyUID}
                      onMouseDown={() => selectFaculty(f)}
                      className="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">person</span>
                      <span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{f.FacultyUID}</span>
                        <span className="ml-2 text-slate-500 dark:text-slate-400">{f.FacultyName}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ── Selected Faculty Card ──────────────────────────────────── */}
        {selectedFaculty && (
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
            <div className="absolute top-3 right-3">
              <span className="bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                Selected Faculty
              </span>
            </div>
            <div className="p-6 flex items-center gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">person_apron</span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {selectedFaculty.FacultyName || selectedFaculty.FacultyUID}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  {selectedFaculty.FacultyUID}
                  {selectedFaculty.FacultyDomain && (
                    <span className="ml-2 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {selectedFaculty.FacultyDomain}
                    </span>
                  )}
                </p>

                {/* Workload bar */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 max-w-[180px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        workloadPct >= 90 ? "bg-red-500" :
                        workloadPct >= 70 ? "bg-amber-500" : "bg-tertiary"
                      }`}
                      style={{ width: `${workloadPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${workloadColor}`}>
                    Workload: {currentLoad}/{expectedLoad} hrs
                  </span>
                </div>
              </div>

              <button
                onClick={clearFaculty}
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                <span className="text-sm font-semibold">Change</span>
              </button>
            </div>
          </section>
        )}

        {/* ── Step 2: Section Selection ──────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Step 2 — Select Section
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-dashed border-primary/20 flex items-center gap-4">
            <div className="flex-1 relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer transition-all"
              >
                <option value="">— Choose a section to load mappings —</option>
                {sections.map((s) => (
                  <option key={s.SectionId} value={s.SectionId}>
                    {s.SectionId} — {s.ProgramName} · Sem {s.Semester}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">expand_more</span>
            </div>

            {selectedSection && (
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">groups</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {mappings.length} mapping{mappings.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Course Mappings Table ──────────────────────────────────── */}
        {selectedSection && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100">
                  Course Mappings
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Section {selectedSection} · {mappings.length} rows · {checkedIds.size} selected
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-5 py-3.5 w-12">
                        <input
                          type="checkbox"
                          checked={allPageChecked}
                          onChange={toggleAll}
                          className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                        />
                      </th>
                      {["Course Code","Group","Section","Type","Nature","Attendance","Current Faculty","L","T","P","Merge","Code"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mappingsLoading ? (
                      <tr>
                        <td colSpan={13} className="px-5 py-12 text-center text-slate-400">
                          <span className="material-symbols-outlined animate-spin text-2xl block mb-2">refresh</span>
                          Loading mappings…
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="px-5 py-12 text-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl block mb-2">inbox</span>
                          No mappings found for this section
                        </td>
                      </tr>
                    ) : paginated.map((m) => {
                      const id = rowId(m);
                      const checked = checkedIds.has(id);
                      const currentUID = m.facultyUID || m.FacultyUID || "";
                      return (
                        <tr
                          key={id}
                          onClick={() => toggleRow(id)}
                          className={`transition-colors cursor-pointer ${
                            checked
                              ? "bg-primary/5 dark:bg-primary/10"
                              : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRow(id)}
                              className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {m.coursecode || m.Coursecode}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            G{m.groupNo ?? m.GroupNo}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{m.section || m.Section}</td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{m.mappingType}</td>
                          <td className="px-4 py-3.5">{natureBadge(m.courseNature || m.CourseNature)}</td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{m.attendanceType || m.AttendanceType || "Regular"}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {currentUID
                              ? <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{currentUID}</span>
                              : <span className="text-xs text-slate-400 italic">Unassigned</span>
                            }
                          </td>
                          <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.l ?? m.L ?? 0}</td>
                          <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.t ?? m.T ?? 0}</td>
                          <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.p ?? m.P ?? 0}</td>
                          <td className="px-4 py-3.5 text-center">
                            {(m.mergeStatus || m.MergeStatus)
                              ? <span className="text-[10px] font-bold text-tertiary dark:text-emerald-400 flex items-center gap-1 justify-center"><span className="material-symbols-outlined text-sm">merge</span>Merged</span>
                              : <span className="text-[10px] font-bold text-slate-400">—</span>
                            }
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {(m.mergecode || m.Mergecode)
                              ? <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{m.mergecode || m.Mergecode}</span>
                              : <span className="text-xs text-slate-400">—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Page {page + 1} of {totalPages} · {mappings.length} total rows
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                          page === p
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary"
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic spacer — expands only when the action footer is visible,
            creating real scrollable room so the last table row is never
            hidden behind the fixed bar. Height matches the footer (~88px)
            plus a comfortable breathing gap. */}
        <div
          aria-hidden="true"
          className={`transition-all duration-300 ${
            checkedIds.size > 0 && selectedFaculty ? "h-28" : "h-10"
          }`}
        />
      </div>

      {/* ── Result Banner ─────────────────────────────────────────────── */}
      {result && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border max-w-sm animate-in slide-in-from-top-4 duration-300 ${
          result.success
            ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
        }`}>
          <span className="material-symbols-outlined text-xl">{result.success ? "check_circle" : "error"}</span>
          <p className="text-sm font-semibold flex-1">{result.message}</p>
          <button onClick={() => setResult(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* ── Floating Action Bar ───────────────────────────────────────── */}
      {checkedIds.size > 0 && selectedFaculty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.4)] p-5 flex items-center justify-between px-8">
          {/* Workload insight */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl flex flex-col gap-0.5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Faculty Workload</p>
              <p className={`text-xs font-bold leading-none ${workloadColor}`}>
                {currentLoad}/{expectedLoad} hrs
                <span className="ml-1.5 text-slate-400 font-normal">({workloadPct}%)</span>
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-bold text-slate-900 dark:text-slate-100">{checkedIds.size}</span> mapping{checkedIds.size !== 1 ? "s" : ""} selected
              {selectedFaculty && <span> → <span className="font-bold text-primary">{selectedFaculty.FacultyUID}</span></span>}
            </div>
          </div>

          {/* Assign button */}
          <button
            onClick={handleAssign}
            disabled={saving}
            className="bg-primary text-white px-8 py-3.5 rounded-full shadow-lg shadow-primary/25 font-bold flex items-center gap-3 hover:bg-blue-600 transition-all active:scale-95 ring-2 ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                Assigning…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
                Assign {checkedIds.size} Mapping{checkedIds.size !== 1 ? "s" : ""} to {selectedFaculty.FacultyUID}
              </>
            )}
          </button>
        </div>
      )}

      {/* Prompt when nothing selected yet */}
      {(!selectedFaculty || !selectedSection) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-5 flex justify-center bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-950/40 to-transparent pointer-events-none">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-base text-slate-400">info</span>
            {!selectedFaculty && !selectedSection
              ? "Select a faculty member and section to begin"
              : !selectedFaculty
              ? "Search and select a faculty member"
              : "Now choose a section to load course mappings"}
          </div>
        </div>
      )}
    </div>
  );
}
