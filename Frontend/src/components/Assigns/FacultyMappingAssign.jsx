import React, { useState, useEffect, useRef } from "react";
import { useDataRefresh } from "../../context/DataRefreshContext";

const API_BASE = "http://localhost:8080";

const PER_PAGE = 10;

/* ── sort helper ─────────────────────────────────────────────────────────── */
const sortByCode = (a, b) =>
  ((a.coursecode || a.Coursecode || "").localeCompare(b.coursecode || b.Coursecode || "")) ||
  ((a.section || a.Section || "").localeCompare(b.section || b.Section || "")) ||
  ((a.groupNo ?? a.GroupNo ?? 0) - (b.groupNo ?? b.GroupNo ?? 0));

/* ── reusable pagination bar ─────────────────────────────────────────────── */
function PaginationBar({ page, totalPages, perPage, onPageChange, onPerPageChange }) {
  const offset = totalPages <= 5 ? 0 : Math.max(0, Math.min(page - 3, totalPages - 5));
  const pages  = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => offset + i + 1);
  return (
    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rows per page:</span>
        <select value={perPage} onChange={e => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="text-xs border-none bg-white dark:bg-[#020617] dark:text-slate-300 rounded-md px-2 py-1 shadow-sm ring-1 ring-slate-200 dark:ring-[#334155] outline-none">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>first_page</span>
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_left</span>
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              page === p
                ? "bg-primary text-white shadow shadow-primary/20"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary"
            }`}>{p}</button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>last_page</span>
        </button>
        <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          Page {page} of {totalPages}
        </span>
      </div>
    </div>
  );
}

export default function FacultyMappingAssign() {

  // ── state ──────────────────────────────────────────────────────────────────
  const [faculties,         setFaculties]         = useState([]);
  const [sections,          setSections]          = useState([]);
  const [mappings,          setMappings]          = useState([]);
  const [mappingsLoading,   setMappingsLoading]   = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [result,            setResult]            = useState(null);

  const [facultySearch,     setFacultySearch]     = useState("");
  const [facultySuggestions,setFacultySuggestions]= useState([]);
  const [selectedFaculty,   setSelectedFaculty]   = useState(null);
  const [showSuggestions,   setShowSuggestions]   = useState(false);

  const [selectedSection,   setSelectedSection]   = useState("");
  const [checkedIds,        setCheckedIds]        = useState(new Set());

  // Collapse / expand each group
  const [pendingCollapsed,  setPendingCollapsed]  = useState(false);
  const [assignedCollapsed, setAssignedCollapsed] = useState(true);

  // Independent pagination per group (1-indexed)
  const [pendingPage,    setPendingPage]    = useState(1);
  const [pendingPerPage, setPendingPerPage] = useState(PER_PAGE);
  const [assignedPage,   setAssignedPage]   = useState(1);
  const [assignedPerPage,setAssignedPerPage]= useState(PER_PAGE);

  const searchRef = useRef(null);

  // Inline override state for the assigned group
  const [overrideRowId,  setOverrideRowId]  = useState(null);  // which row is being overridden
  const [overrideSearch, setOverrideSearch] = useState("");     // typed value in inline input
  const [overrideFocused,setOverrideFocused]= useState(false);  // dropdown visible?
  const [overrideSaving, setOverrideSaving] = useState(false);  // save-in-progress

  // Open inline override for a row
  const openOverride = (id, currentUid) => {
    setOverrideRowId(id);
    setOverrideSearch(currentUid || "");
    setOverrideFocused(true);
  };

  // Cancel inline override
  const cancelOverride = () => {
    setOverrideRowId(null);
    setOverrideSearch("");
    setOverrideFocused(false);
  };

  // Save the inline override for one specific mapping
  const handleSaveOverride = async (m) => {
    const uid = overrideSearch.trim();
    if (!uid) { alert("Faculty UID cannot be empty."); return; }
    if (!faculties.some(f => (f.FacultyUID || f.facultyUID || "") === uid)) {
      alert(`Invalid Faculty UID: "${uid}"\nSelect a valid UID from the dropdown.`);
      return;
    }
    setOverrideSaving(true);
    const payload = [{
      courseMappingId: m.courseMappingId ?? m.CourseMappingId ?? null,
      Section:        m.section       || m.Section,
      Coursecode:     m.coursecode    || m.Coursecode,
      GroupNo:        m.groupNo       ?? m.GroupNo,
      mappingType:    m.mappingType,
      AttendanceType: m.attendanceType || m.AttendanceType || "Regular",
      CourseNature:   String(m.courseNature || m.CourseNature || "C"),
      FacultyUID:     uid,
      L: m.l ?? m.L ?? 0,
      T: m.t ?? m.T ?? 0,
      P: m.p ?? m.P ?? 0,
      Mergecode:   m.mergecode   || m.Mergecode   || null,
      MergeStatus: m.mergeStatus === true || m.MergeStatus === true,
      Reserveslot: m.reserveslot || m.Reserveslot || null,
    }];
    try {
      const res = await fetch(`${API_BASE}/assign/save-all-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Update local mapping immediately
        setMappings(prev => prev.map(mp =>
          rowId(mp) === overrideRowId
            ? { ...mp, facultyUID: uid, FacultyUID: uid }
            : mp
        ));
        setResult({ success: true, message: `Override saved — ${m.coursecode || m.Coursecode} reassigned to ${uid}.` });
        triggerRefresh("mappings");
        cancelOverride();
      } else {
        const txt = await res.text().catch(() => "Unknown error");
        setResult({ success: false, message: `Override failed: ${txt}` });
      }
    } catch (e) {
      setResult({ success: false, message: `Network error: ${e.message}` });
    } finally {
      setOverrideSaving(false);
    }
  };

  // ── DataRefresh context ────────────────────────────────────────────────────
  const { refreshKey, lastRefreshedEntity, triggerRefresh } = useDataRefresh();

  // ── initial load ───────────────────────────────────────────────────────────
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

  // ── cross-component refresh ────────────────────────────────────────────────
  useEffect(() => {
    if (refreshKey === 0) return;
    if (!lastRefreshedEntity || lastRefreshedEntity === "faculty") {
      fetch(`${API_BASE}/faculty/all`).then(r => r.ok ? r.json() : []).then(setFaculties).catch(() => {});
    }
    if (!lastRefreshedEntity || lastRefreshedEntity === "section") {
      fetch(`${API_BASE}/section/all`).then(r => r.ok ? r.json() : []).then(setSections).catch(() => {});
    }
    // BulkAssign saved — re-fetch current section so Current Faculty column updates
    if ((!lastRefreshedEntity || lastRefreshedEntity === "mappings") && selectedSection) {
      fetch(`${API_BASE}/api/mappings`)
        .then(r => r.json())
        .then(data => {
          const filtered = (Array.isArray(data) ? data : []).filter(
            m => (m.section || m.Section) === selectedSection
          );
          setMappings(filtered);
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ── faculty autocomplete ───────────────────────────────────────────────────
  useEffect(() => {
    if (!facultySearch.trim()) { setFacultySuggestions([]); return; }
    const q = facultySearch.toLowerCase();
    setFacultySuggestions(
      faculties.filter(f =>
        (f.FacultyUID  || "").toLowerCase().includes(q) ||
        (f.FacultyName || "").toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [facultySearch, faculties]);

  // ── fetch mappings when section changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedSection) { setMappings([]); setCheckedIds(new Set()); return; }
    setMappingsLoading(true);
    fetch(`${API_BASE}/api/mappings`)
      .then(r => r.json())
      .then(data => {
        const filtered = (Array.isArray(data) ? data : []).filter(
          m => (m.section || m.Section) === selectedSection
        );
        setMappings(filtered);
        setCheckedIds(new Set());
        setPendingPage(1);
        setAssignedPage(1);
      })
      .catch(() => setMappings([]))
      .finally(() => setMappingsLoading(false));
  }, [selectedSection]);

  // ── derived: split into two sorted groups ─────────────────────────────────
  const unassignedAll = mappings.filter(m => !(m.facultyUID || m.FacultyUID)).sort(sortByCode);
  const assignedAll   = mappings.filter(m =>  !!(m.facultyUID || m.FacultyUID)).sort(sortByCode);

  const pendingTotalPages  = Math.max(1, Math.ceil(unassignedAll.length / pendingPerPage));
  const assignedTotalPages = Math.max(1, Math.ceil(assignedAll.length   / assignedPerPage));

  const safePendingPage  = Math.min(pendingPage,  pendingTotalPages);
  const safeAssignedPage = Math.min(assignedPage, assignedTotalPages);

  const pendingPageRows  = unassignedAll.slice((safePendingPage  - 1) * pendingPerPage,  safePendingPage  * pendingPerPage);
  const assignedPageRows = assignedAll  .slice((safeAssignedPage - 1) * assignedPerPage, safeAssignedPage * assignedPerPage);

  // Check-all helpers scoped to each visible page
  const allPendingChecked  = pendingPageRows.length  > 0 && pendingPageRows.every(m  => checkedIds.has(rowId(m)));
  const allAssignedChecked = assignedPageRows.length > 0 && assignedPageRows.every(m => checkedIds.has(rowId(m)));

  const selectedFacultyObj = faculties.find(f => f.FacultyUID === selectedFaculty?.FacultyUID);
  const currentLoad  = selectedFacultyObj?.CurrentLoad  ?? 0;
  const expectedLoad = selectedFacultyObj?.ExpectedLoad ?? 0;

  // Live preview: sum L+T+P of all currently checked rows
  const checkedMappings = mappings.filter(m => checkedIds.has(rowId(m)));
  const addedLoad   = checkedMappings.reduce(
    (sum, m) => sum + (m.l ?? m.L ?? 0) + (m.t ?? m.T ?? 0) + (m.p ?? m.P ?? 0), 0
  );
  const previewLoad = currentLoad + addedLoad;
  const isPreview   = addedLoad > 0;

  // Saved bar fills to currentLoad; preview bar fills to previewLoad
  const savedPct    = expectedLoad > 0 ? Math.min(100, Math.round((currentLoad  / expectedLoad) * 100)) : 0;
  const workloadPct = expectedLoad > 0 ? Math.min(100, Math.round((previewLoad  / expectedLoad) * 100)) : 0;
  const workloadColor =
    workloadPct >= 90 ? "text-red-500" :
    workloadPct >= 70 ? "text-amber-500" :
    "text-tertiary";

  // Stat counts
  const totalCount      = mappings.length;
  const assignedCount   = assignedAll.length;
  const unassignedCount = unassignedAll.length;
  const pct = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

  // ── handlers ───────────────────────────────────────────────────────────────
  function rowId(m) { return m.courseMappingId ?? m.CourseMappingId ?? JSON.stringify(m); }

  function selectFaculty(f) { setSelectedFaculty(f); setFacultySearch(f.FacultyUID); setShowSuggestions(false); }
  function clearFaculty()   { setSelectedFaculty(null); setFacultySearch(""); }

  function toggleRow(id) {
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function togglePageAll(pageRows, allChecked) {
    setCheckedIds(prev => {
      const n = new Set(prev);
      if (allChecked) pageRows.forEach(m => n.delete(rowId(m)));
      else            pageRows.forEach(m => n.add(rowId(m)));
      return n;
    });
  }

  async function handleAssign() {
    if (!selectedFaculty || checkedIds.size === 0) return;
    setSaving(true); setResult(null);
    const selected = mappings.filter(m => checkedIds.has(rowId(m)));
    // ⚠️  Keys MUST match the Java entity's exact field names (PascalCase where defined)
    // so Jackson deserializes them correctly.  FacultyUID = null → backend skips update.
    const payload = selected.map(m => ({
      courseMappingId: m.courseMappingId ?? m.CourseMappingId ?? null,
      // Entity fields: Section, Coursecode, GroupNo, mappingType (only this one is camelCase)
      Section:        m.section       || m.Section,
      Coursecode:     m.coursecode    || m.Coursecode,
      GroupNo:        m.groupNo       ?? m.GroupNo,
      mappingType:    m.mappingType,
      AttendanceType: m.attendanceType || m.AttendanceType || "Regular",
      CourseNature:   String(m.courseNature || m.CourseNature || "C"),
      FacultyUID:     selectedFaculty.FacultyUID,
      L: m.l ?? m.L ?? 0,
      T: m.t ?? m.T ?? 0,
      P: m.p ?? m.P ?? 0,
      Mergecode:   m.mergecode   || m.Mergecode   || null,
      MergeStatus: m.mergeStatus === true || m.MergeStatus === true,
      Reserveslot: m.reserveslot || m.Reserveslot || null,
    }));
    try {
      const res = await fetch(`${API_BASE}/assign/save-all-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (res.ok) {
        setResult({ success: true, message: `Assigned ${selected.length} mapping(s) to ${selectedFaculty.FacultyUID}.` });
        // Update local mapping state immediately
        setMappings(prev => prev.map(m =>
          checkedIds.has(rowId(m))
            ? { ...m, facultyUID: selectedFaculty.FacultyUID, FacultyUID: selectedFaculty.FacultyUID }
            : m
        ));
        setCheckedIds(new Set());

        // ── Persist updated CurrentLoad to DB ──────────────────────────────
        const newLoad = currentLoad + addedLoad;
        try {
          await fetch(`${API_BASE}/faculty/update/${selectedFaculty.FacultyUID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              FacultyUID:    selectedFaculty.FacultyUID,
              FacultyName:   selectedFacultyObj?.FacultyName   ?? "",
              FacultyDomain: selectedFacultyObj?.FacultyDomain ?? "",
              CurrentLoad:   newLoad,
              ExpectedLoad:  expectedLoad,
            }),
          });
          // Reflect new CurrentLoad in local faculty list immediately
          setFaculties(prev => prev.map(f =>
            f.FacultyUID === selectedFaculty.FacultyUID
              ? { ...f, CurrentLoad: newLoad }
              : f
          ));
        } catch (e) {
          console.warn("Could not update faculty workload:", e);
        }

        triggerRefresh("mappings");
      } else {
        const err = await res.text().catch(() => "Unknown error");
        setResult({ success: false, message: `Assign failed: ${err}` });
      }
    } catch (e) {
      setSaving(false);
      setResult({ success: false, message: `Network error: ${e.message}` });
    }
  }

  // ── badges ─────────────────────────────────────────────────────────────────
  function natureBadge(nature) {
    return (nature === "P" || nature === "p")
      ? <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase dark:bg-primary/20 dark:text-blue-300">Practical</span>
      : <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase dark:bg-emerald-900/30 dark:text-emerald-400">Theory</span>;
  }

  // ── shared table head ──────────────────────────────────────────────────────
  function TableHead({ pageRows, allChecked, showOverride = false }) {
    return (
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
          {/* Checkbox column — hidden in override (assigned) group */}
          {!showOverride && (
            <th className="px-5 py-3.5 w-12">
              <input type="checkbox" checked={allChecked}
                onChange={() => togglePageAll(pageRows, allChecked)}
                className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary" />
            </th>
          )}
          {["Course Code","Section","Group","Nature","Attendance","L","T","P","Type","Merge","Merge Code","Reserve Slot","Current Faculty"].map(h => (
            <th key={h} className="px-4 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
          {showOverride && (
            <th className="px-4 py-3.5 text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap">Override</th>
          )}
        </tr>
      </thead>
    );
  }

  // ── shared row renderer ────────────────────────────────────────────────────
  function renderRow(m, showOverride = false) {
    const id           = rowId(m);
    const checked      = checkedIds.has(id);
    const currentUID   = m.facultyUID || m.FacultyUID || "";
    const isOverriding = showOverride && checked;
    return (
      <tr key={id}
        onClick={!showOverride ? () => toggleRow(id) : undefined}
        className={`transition-colors ${
          !showOverride ? "cursor-pointer" : ""
        } ${
          isOverriding
            ? "bg-amber-50/60 dark:bg-amber-900/10 ring-1 ring-inset ring-amber-300 dark:ring-amber-700"
            : checked
            ? "bg-primary/5 dark:bg-primary/10"
            : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
        }`}
      >
        {/* Checkbox — only in pending group */}
        {!showOverride && (
          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={checked} onChange={() => toggleRow(id)}
              className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary" />
          </td>
        )}
        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{m.coursecode || m.Coursecode}</td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{m.section || m.Section}</td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">G{m.groupNo ?? m.GroupNo}</td>
        <td className="px-4 py-3.5">{natureBadge(m.courseNature || m.CourseNature)}</td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{m.attendanceType || m.AttendanceType || "Regular"}</td>
        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.l ?? m.L ?? 0}</td>
        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.t ?? m.T ?? 0}</td>
        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{m.p ?? m.P ?? 0}</td>
        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{m.mappingType}</td>
        <td className="px-4 py-3.5 text-center">
          {(m.mergeStatus === true || m.MergeStatus === true)
            ? <span className="text-[10px] font-bold text-tertiary dark:text-emerald-400 flex items-center gap-1 justify-center"><span className="material-symbols-outlined text-sm">merge</span>Merged</span>
            : <span className="text-[10px] font-bold text-slate-400">—</span>}
        </td>
        <td className="px-4 py-3.5 text-center">
          {(m.mergecode || m.Mergecode)
            ? <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{m.mergecode || m.Mergecode}</span>
            : <span className="text-xs text-slate-400">—</span>}
        </td>
        <td className="px-4 py-3.5 text-center">
          {(m.reserveslot || m.Reserveslot)
            ? <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{m.reserveslot || m.Reserveslot}</span>
            : <span className="text-xs text-slate-400">—</span>}
        </td>
        {/* Current Faculty column OR inline override input */}
        <td className="px-4 py-2 whitespace-nowrap overflow-visible" style={{ minWidth: showOverride ? 240 : undefined }}>
          {showOverride && overrideRowId === id ? (
            // ── Inline override input with autocomplete ──────────────
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={overrideSearch}
                onChange={e => { setOverrideSearch(e.target.value); setOverrideFocused(true); }}
                onFocus={() => setOverrideFocused(true)}
                onBlur={() => setTimeout(() => setOverrideFocused(false), 200)}
                placeholder="Search UID or Name…"
                className={`w-full text-xs rounded-lg py-1.5 px-3 border shadow-sm focus:ring-2 transition-all ${
                  overrideSearch.trim() && !faculties.some(f => (f.FacultyUID || f.facultyUID || "") === overrideSearch.trim())
                    ? "border-red-400 dark:border-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-red-300/40"
                    : "border-primary/40 dark:border-primary/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary/20"
                }`}
              />
              {/* Autocomplete dropdown */}
              {overrideFocused && (
                <div className="absolute top-9 left-0 w-56 z-[200] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-44 overflow-y-auto">
                  {(() => {
                    const q = overrideSearch.toLowerCase();
                    const matches = faculties.filter(f => {
                      const uid  = (f.FacultyUID  || f.facultyUID  || "");
                      const name = (f.FacultyName || f.facultyName || "");
                      return uid.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                    });
                    return matches.length === 0
                      ? <div className="px-3 py-2 text-xs text-slate-400 italic">No match found.</div>
                      : matches.map(f => {
                          const uid  = f.FacultyUID  || f.facultyUID  || "";
                          const name = f.FacultyName || f.facultyName || "";
                          return (
                            <div key={uid}
                              className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              onMouseDown={e => { e.preventDefault(); setOverrideSearch(uid); setOverrideFocused(false); }}
                            >
                              <span className="font-bold text-primary block">{uid}</span>
                              <span className="text-slate-500 dark:text-slate-400 truncate block opacity-80">{name}</span>
                            </div>
                          );
                        });
                  })()}
                </div>
              )}
            </div>
          ) : (
            // ── Normal display ────────────────────────────────────────
            currentUID
              ? <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{currentUID}</span>
              : <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </td>

        {/* Override / Save / Cancel actions */}
        {showOverride && (
          <td className="px-4 py-3.5 text-center">
            {overrideRowId === id ? (
              <div className="flex items-center gap-1.5 justify-center">
                <button
                  disabled={overrideSaving}
                  onClick={() => handleSaveOverride(m)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded uppercase bg-primary text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap transition-all"
                >
                  {overrideSaving
                    ? <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                    : <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>}
                  {overrideSaving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelOverride}
                  className="text-[10px] font-bold px-3 py-1.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 flex items-center gap-1 whitespace-nowrap transition-all"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => openOverride(id, currentUID)}
                title="Override / Re-assign faculty"
                className="text-[10px] font-bold px-3 py-1.5 rounded uppercase transition-all bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-1 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}>edit</span>
                Override
              </button>
            )}
          </td>
        )}
      </tr>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 space-y-8">

        {/* Step 1 — Faculty */}
        <section>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Step 1 — Select Faculty</p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-dashed border-primary/20">
            <div className="relative" ref={searchRef}>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" value={facultySearch}
                onChange={e => { setFacultySearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search by Faculty UID or name..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {showSuggestions && facultySuggestions.length > 0 && (
                <ul className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {facultySuggestions.map(f => (
                    <li key={f.FacultyUID} onMouseDown={() => selectFaculty(f)}
                      className="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3">
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

        {/* Selected Faculty card */}
        {selectedFaculty && (
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
            <div className="absolute top-3 right-3">
              <span className="bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Selected Faculty</span>
            </div>
            <div className="p-6 flex items-center gap-6">
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
                    <span className="ml-2 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{selectedFaculty.FacultyDomain}</span>
                  )}
                </p>

                {/* Workload bar — shows live preview when rows are checked */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 max-w-[220px]">
                    {/* Track */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      {/* Saved portion */}
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                          savedPct >= 90 ? "bg-red-500" : savedPct >= 70 ? "bg-amber-500" : "bg-tertiary"
                        }`}
                        style={{ width: `${savedPct}%` }}
                      />
                      {/* Preview excess (semi-transparent, animated) */}
                      {isPreview && (
                        <div
                          className={`absolute top-0 h-full rounded-full transition-all duration-300 opacity-50 animate-pulse ${
                            workloadPct >= 90 ? "bg-red-500" : workloadPct >= 70 ? "bg-amber-500" : "bg-primary"
                          }`}
                          style={{ left: `${savedPct}%`, width: `${Math.min(100 - savedPct, workloadPct - savedPct)}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${workloadColor} leading-none`}>
                      {isPreview ? (
                        <>
                          <span className="text-slate-400 line-through mr-1">{currentLoad}</span>
                          → {previewLoad}/{expectedLoad} hrs
                        </>
                      ) : (
                        <>{currentLoad}/{expectedLoad} hrs</>
                      )}
                    </span>
                    {isPreview && (
                      <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                        +{addedLoad} hrs if assigned
                      </span>
                    )}
                  </div>
                  {workloadPct >= 90 && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-200 dark:border-red-800 whitespace-nowrap">Overloaded</span>
                  )}
                  {workloadPct >= 70 && workloadPct < 90 && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 whitespace-nowrap">Near limit</span>
                  )}
                </div>
              </div>
              <button onClick={clearFaculty}
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                <span className="material-symbols-outlined text-lg">close</span>
                <span className="text-sm font-semibold">Change</span>
              </button>
            </div>
          </section>
        )}

        {/* Step 2 — Section */}
        <section>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Step 2 — Select Section</p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-dashed border-primary/20 flex items-center gap-4">
            <div className="flex-1 relative">
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer transition-all">
                <option value="">— Choose a section to load mappings —</option>
                {sections.map((s, idx) => (
                  <option key={s.SectionId ?? idx} value={s.SectionId}>
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

        {/* ── Mappings area ────────────────────────────────────────────────── */}
        {selectedSection && (
          <section className="space-y-6">

            {/* Progress + stat chips */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-500 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>list_alt</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <span className="material-symbols-outlined text-red-500 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>pending_actions</span>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Pending</span>
                  <span className="text-sm font-extrabold text-red-600 dark:text-red-400">{unassignedCount}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Assigned</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{assignedCount}</span>
                </div>
                {checkedIds.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_box</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Selected</span>
                    <span className="text-sm font-extrabold text-primary">{checkedIds.size}</span>
                  </div>
                )}
                <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500">{pct}% complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-tertiary" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GROUP 1 — Pending (Unassigned) */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/40 shadow-sm overflow-hidden">
              <button
                className="px-6 py-4 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/40 flex items-center justify-between w-full text-left hover:bg-red-100/60 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => setPendingCollapsed(c => !c)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500 text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>pending_actions</span>
                  <div>
                    <p className="text-sm font-extrabold text-red-700 dark:text-red-400">Pending Assignment</p>
                    <p className="text-xs text-red-500/80 dark:text-red-500/60">
                      {unassignedAll.length} rows
                      {!pendingCollapsed && ` · page ${safePendingPage} of ${pendingTotalPages}`}
                      {" · click to "}{pendingCollapsed ? "expand" : "collapse"}
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-red-400 text-xl transition-transform duration-300 ${pendingCollapsed ? "" : "rotate-180"}`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
              </button>

              {!pendingCollapsed && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                      <TableHead pageRows={pendingPageRows} allChecked={allPendingChecked} />
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mappingsLoading ? (
                          <tr><td colSpan={14} className="px-5 py-12 text-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-2xl block mb-2">refresh</span>Loading mappings…
                          </td></tr>
                        ) : unassignedAll.length === 0 ? (
                          <tr><td colSpan={14} className="px-5 py-10 text-center">
                            <span className="material-symbols-outlined text-3xl block mb-2 text-emerald-400">task_alt</span>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">All rows assigned — great work!</span>
                          </td></tr>
                        ) : pendingPageRows.map(m => renderRow(m))}
                      </tbody>
                    </table>
                  </div>
                  {unassignedAll.length > 0 && (
                    <PaginationBar page={safePendingPage} totalPages={pendingTotalPages} perPage={pendingPerPage}
                      onPageChange={setPendingPage} onPerPageChange={setPendingPerPage} />
                  )}
                </>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GROUP 2 — Assigned (collapsible) */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm overflow-hidden">
              <button
                className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between w-full text-left hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20 transition-colors"
                onClick={() => setAssignedCollapsed(c => !c)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500 text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Assigned</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-600/60">
                      {assignedAll.length} rows
                      {!assignedCollapsed && ` · page ${safeAssignedPage} of ${assignedTotalPages}`}
                      {" · click to "}{assignedCollapsed ? "expand" : "collapse"}
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-emerald-400 text-xl transition-transform duration-300 ${assignedCollapsed ? "" : "rotate-180"}`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
              </button>

              {!assignedCollapsed && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                      <TableHead pageRows={assignedPageRows} allChecked={allAssignedChecked} showOverride={true} />
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {assignedAll.length === 0 ? (
                          <tr><td colSpan={15} className="px-5 py-10 text-center text-slate-400 text-sm">No assigned rows yet.</td></tr>
                        ) : assignedPageRows.map(m => renderRow(m, true))}
                      </tbody>
                    </table>
                  </div>
                  {assignedAll.length > 0 && (
                    <PaginationBar page={safeAssignedPage} totalPages={assignedTotalPages} perPage={assignedPerPage}
                      onPageChange={setAssignedPage} onPerPageChange={setAssignedPerPage} />
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Dynamic spacer so floating bar doesn't hide last row */}
        <div aria-hidden="true" className={`transition-all duration-300 ${checkedIds.size > 0 && selectedFaculty ? "h-28" : "h-10"}`} />
      </div>

      {/* Result banner */}
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

      {/* Floating assign action bar */}
      {checkedIds.size > 0 && selectedFaculty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.4)] p-5 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl flex flex-col gap-0.5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Faculty Workload</p>
              <p className={`text-xs font-bold leading-none ${workloadColor}`}>
                {isPreview ? (
                  <>
                    <span className="text-slate-400 line-through mr-1">{currentLoad}</span>
                    → {previewLoad}/{expectedLoad}
                    <span className="ml-1 text-slate-400 font-normal">hrs (+{addedLoad})</span>
                  </>
                ) : (
                  <>{currentLoad}/{expectedLoad} hrs
                    <span className="ml-1.5 text-slate-400 font-normal">({savedPct}%)</span>
                  </>
                )}
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-bold text-slate-900 dark:text-slate-100">{checkedIds.size}</span> mapping{checkedIds.size !== 1 ? "s" : ""} selected
              {selectedFaculty && <span> → <span className="font-bold text-primary">{selectedFaculty.FacultyUID}</span></span>}
            </div>
          </div>
          <button onClick={handleAssign} disabled={saving}
            className="bg-primary text-white px-8 py-3.5 rounded-full shadow-lg shadow-primary/25 font-bold flex items-center gap-3 hover:bg-blue-600 transition-all active:scale-95 ring-2 ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? (
              <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>Assigning…</>
            ) : (
              <><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
                Assign {checkedIds.size} Mapping{checkedIds.size !== 1 ? "s" : ""} to {selectedFaculty.FacultyUID}</>
            )}
          </button>
        </div>
      )}

      {/* Prompt when not ready */}
      {(!selectedFaculty || !selectedSection) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-5 flex justify-center bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-950/40 to-transparent pointer-events-none">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-base text-slate-400">info</span>
            {!selectedFaculty && !selectedSection
              ? "Select a faculty member and section to begin"
              : !selectedFaculty ? "Search and select a faculty member"
              : "Now choose a section to load course mappings"}
          </div>
        </div>
      )}
    </div>
  );
}
