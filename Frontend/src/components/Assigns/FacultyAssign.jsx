import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import { useDataRefresh } from '../../context/DataRefreshContext';

const API_BASE = "http://localhost:8080";

/* ── sort helper ─────────────────────────────────────────────────────────── */
const sortByCode = (a, b) =>
  (a.courseCode || "").localeCompare(b.courseCode || "") ||
  String(a.section || "").localeCompare(String(b.section || "")) ||
  (a.groupRaw ?? 0) - (b.groupRaw ?? 0);

/* ── reusable pagination bar ─────────────────────────────────────────────── */
function PaginationBar({ page, totalPages, perPage, onPageChange, onPerPageChange }) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const offset = totalPages <= 5 ? 0 : Math.max(0, Math.min(page - 3, totalPages - 5));
    return offset + i + 1;
  });

  return (
    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-outline-variant dark:border-[#334155] flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rows per page:</span>
        <select
          value={perPage}
          onChange={e => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="text-xs border-none bg-white dark:bg-[#020617] dark:text-slate-300 rounded-md px-2 py-1 shadow-sm ring-1 ring-slate-200 dark:ring-[#334155] outline-none"
        >
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

/* ── main component ──────────────────────────────────────────────────────── */
const FacultyAssignmentWorkspace = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSection, setFilterSection] = useState('All Sections');
  const [filterUid, setFilterUid] = useState('');

  // Faculty autocomplete
  const [faculties, setFaculties] = useState([]);
  const [focusedRowId, setFocusedRowId] = useState(null);

  // Collapse state for both groups (pending starts open, assigned starts collapsed)
  const [pendingCollapsed,  setPendingCollapsed]  = useState(false);
  const [assignedCollapsed, setAssignedCollapsed] = useState(true);

  // Independent pagination for each group
  const [pendingPage, setPendingPage]       = useState(1);
  const [pendingPerPage, setPendingPerPage] = useState(10);
  const [assignedPage, setAssignedPage]     = useState(1);
  const [assignedPerPage, setAssignedPerPage] = useState(10);

  // DataRefresh context
  const { refreshKey, lastRefreshedEntity, triggerRefresh } = useDataRefresh();

  /* ── fetch ──────────────────────────────────────────────────────────────── */
  const fetchRequiredData = async () => {
    try {
      const [mappingRes, facultyRes] = await Promise.all([
        fetch(`${API_BASE}/mappings`),
        fetch(`${API_BASE}/faculty/all`),
      ]);
      if (facultyRes.ok) setFaculties(await facultyRes.json());
      if (mappingRes.ok) {
        const data = await mappingRes.json();
        const formatted = data.map(item => {
          const isMerged = item.mergeStatus === true || item.MergeStatus === true;
          return {
            id: item.courseMappingId ??
              `${item.section || item.Section}-${item.courseCode || item.coursecode || item.Coursecode}-${item.groupNo ?? item.GroupNo}-${item.mappingType}`,
            courseMappingId: item.courseMappingId,
            courseCode:  item.courseCode || item.coursecode || item.Coursecode || "",
            group:      `G${item.groupNo ?? item.GroupNo}`,
            groupRaw:    item.groupNo ?? item.GroupNo,
            section:     item.section || item.Section,
            type:        item.mappingType,
            attendance:  item.attendanceType || item.AttendanceType || "Regular",
            nature:      item.courseNature || item.CourseNature || "C",
            uid:         item.facultyUID || item.facultyUid || item.FacultyUID || "",
            originalUid: item.facultyUID || item.facultyUid || item.FacultyUID || "",
            isSaved:   !!(item.facultyUID || item.facultyUid || item.FacultyUID),
            l: item.l ?? item.L ?? 0,
            t: item.t ?? item.T ?? 0,
            p: item.p ?? item.P ?? 0,
            mergeStatus: isMerged ? "check_circle" : "circle",
            mergeCode:  item.mergeCode || item.mergecode || item.Mergecode || "---",
            reserve:    item.reserveSlot || item.reserveslot || item.Reserveslot || "---",
            statusColor: isMerged ? "text-tertiary" : "text-slate-300 dark:text-slate-600",
          };
        });
        setRows(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequiredData(); }, []);

  useEffect(() => {
    if (refreshKey === 0) return;
    if (!lastRefreshedEntity || lastRefreshedEntity === 'mappings') fetchRequiredData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  /* ── handlers ───────────────────────────────────────────────────────────── */
  const handleUidChange = (id, val) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, uid: val, isSaved: false } : r));

  const handleUnlockRow = (id) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, isSaved: false } : r));

  const handleSaveRow = async (row) => {
    if (!row.uid?.trim()) {
      alert(`Cannot save — Faculty UID is empty for ${row.courseCode} ${row.group}`);
      return;
    }
    if (!faculties.some(f => String(f.facultyUID || f.facultyUid || f.FacultyUID || "") === row.uid)) {
      alert(`Invalid Faculty UID: ${row.uid}\nSelect a valid UID from the dropdown.`);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/assign/assign-faculty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Keys MUST match Java entity camelCase field names (Jackson deserializes by field name)
        body: JSON.stringify({
          section:     row.section,
          courseCode:  row.courseCode,
          groupNo:     row.groupRaw,
          mappingType: row.type,
          facultyUid:  row.uid || null,
        }),
      });
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, isSaved: true, originalUid: row.uid } : r));
        triggerRefresh('mappings');
      } else {
        console.error("Save failed:", await res.text().catch(() => ""));
      }
    } catch (e) {
      console.error("Error saving row:", e);
    }
  };

  const handleSaveAllVisible = async (targetRows) => {
    const toSave = targetRows.filter(r => !r.isSaved && r.uid !== r.originalUid);
    if (toSave.length === 0) { alert("No new changes to save on this page."); return; }

    const empty   = toSave.filter(r => !r.uid?.trim());
    const invalid = toSave.filter(r => r.uid?.trim() &&
      !faculties.some(f => String(f.facultyUID || f.facultyUid || f.FacultyUID || "") === r.uid));
    if (empty.length)   { alert(`Empty UID in: ${empty.map(r => r.courseCode).join(", ")}`);   return; }
    if (invalid.length) { alert(`Invalid UID in: ${invalid.map(r => r.courseCode).join(", ")}`); return; }

    // Keys MUST match Java entity camelCase field names (Jackson deserializes by field name)
    const payload = toSave.map(row => ({
      courseMappingId: row.courseMappingId ?? null,
      section:         row.section,
      courseCode:      row.courseCode,
      groupNo:         row.groupRaw,
      mappingType:     row.type,
      attendanceType:  row.attendance,
      courseNature:    String(row.nature || "C"),
      facultyUid:      row.uid || null,
      l:               row.l,
      t:               row.t,
      p:               row.p,
      mergeCode:       row.mergeCode !== "---" ? row.mergeCode : null,
      mergeStatus:     row.mergeStatus === "check_circle",
      reserveSlot:     row.reserve    !== "---" ? row.reserve   : null,
    }));

    try {
      const res = await fetch(`${API_BASE}/assign/save-all-faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const ids = toSave.map(r => r.id);
        setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, isSaved: true, originalUid: r.uid } : r));
        triggerRefresh('mappings');
        alert(`${toSave.length} mapping(s) saved successfully!`);
      } else {
        alert(`Save failed: ${await res.text().catch(() => "Unknown error")}`);
      }
    } catch (e) {
      alert("Network error. Please try again.");
    }
  };

  const handleExportExcel = () => {
    const wsData = [
      ["Course Code", "Section", "Group", "Nature", "Attendance", "L", "T", "P", "Type", "Merge Code", "Reserve Slot", "Faculty UID"],
      ...rows.map(r => [r.courseCode, r.section, r.groupRaw, r.nature, r.attendance, r.l, r.t, r.p, r.type, r.mergeCode, r.reserve, r.originalUid]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = wsData[0].map((_, i) => ({ wch: Math.max(...wsData.map(row => (row[i] ? String(row[i]).length : 0))) + 2 }));
    for (let i = 0; i < wsData[0].length; i++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ws[ref]) ws[ref].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "3B82F6" } } };
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Course Mappings");
    XLSX.writeFile(wb, "Faculty_Assignments.xlsx");
  };

  /* ── derived / sorted / paginated ───────────────────────────────────────── */
  const uniqueSections = ["All Sections", ...Array.from(new Set(rows.map(r => String(r.section)))).sort()];

  const filtered = rows.filter(r =>
    (r.courseCode || "").toLowerCase().includes(filterCourse.toLowerCase()) &&
    (filterSection === "All Sections" || String(r.section) === filterSection) &&
    (r.uid || "").toLowerCase().includes(filterUid.toLowerCase())
  );

  const allUnassigned = filtered.filter(r => !r.originalUid).sort(sortByCode);
  const allAssigned   = filtered.filter(r =>  r.originalUid).sort(sortByCode);

  const pendingTotalPages  = Math.max(1, Math.ceil(allUnassigned.length / pendingPerPage));
  const assignedTotalPages = Math.max(1, Math.ceil(allAssigned.length  / assignedPerPage));

  // Clamp pages whenever filter changes shrink the dataset
  const safePendingPage  = Math.min(pendingPage,  pendingTotalPages);
  const safeAssignedPage = Math.min(assignedPage, assignedTotalPages);

  const pendingPageRows  = allUnassigned.slice((safePendingPage  - 1) * pendingPerPage,  safePendingPage  * pendingPerPage);
  const assignedPageRows = allAssigned  .slice((safeAssignedPage - 1) * assignedPerPage, safeAssignedPage * assignedPerPage);

  const totalCount      = rows.length;
  const assignedCount   = rows.filter(r => !!r.originalUid).length;
  const unassignedCount = totalCount - assignedCount;
  const pct = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;
  const pendingChanges  = rows.filter(r => !r.isSaved && r.uid !== r.originalUid).length;

  /* ── shared table head ───────────────────────────────────────────────────── */
  const TableHead = () => (
    <thead className="bg-[#f8fafc] dark:bg-[#0f172a] text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-20 shadow-sm border-b border-outline-variant dark:border-[#334155]">
      <tr>
        <th className="p-4 w-32">Course Code</th>
        <th className="p-4">Section</th>
        <th className="p-4">Group</th>
        <th className="p-4">Nature</th>
        <th className="p-4">Attendance</th>
        <th className="p-4 text-center">L</th>
        <th className="p-4 text-center">T</th>
        <th className="p-4 text-center">P</th>
        <th className="p-4">Type</th>
        <th className="p-4 text-center">Merge</th>
        <th className="p-4">Merge Code</th>
        <th className="p-4">Reserve Slot</th>
        <th className="p-4 min-w-[200px] text-primary dark:text-[#3b82f6] bg-primary/[0.04] dark:bg-[#3b82f6]/10 border-x border-primary/10 dark:border-[#3b82f6]/20">Faculty UID</th>
        <th className="p-4 text-right">Actions</th>
      </tr>
    </thead>
  );

  /* ── row renderer ────────────────────────────────────────────────────────── */
  const renderRow = (row) => (
    <tr
      key={row.id}
      className={`transition-colors group ${
        !row.originalUid
          ? "hover:bg-red-50/30 dark:hover:bg-red-900/10"
          : "hover:bg-slate-50/30 dark:hover:bg-slate-800/30"
      }`}
    >
      <td className="p-4 font-bold text-slate-700 dark:text-slate-200 text-sm bg-slate-50/40 dark:bg-slate-900/40 whitespace-nowrap">{row.courseCode}</td>
      <td className="p-4 text-slate-600 dark:text-slate-200 text-sm font-semibold bg-slate-50/40 dark:bg-slate-900/40">{row.section}</td>
      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.group}</td>
      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.nature}</td>
      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.attendance}</td>
      <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.l}</td>
      <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.t}</td>
      <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.p}</td>
      <td className="p-4 bg-slate-50/40 dark:bg-slate-900/40">
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded uppercase border border-slate-200 dark:border-[#334155] whitespace-nowrap">{row.type}</span>
      </td>
      <td className="p-4 bg-slate-50/40 dark:bg-slate-900/40 text-center">
        <span className={`material-symbols-outlined text-sm ${row.statusColor}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{row.mergeStatus}</span>
      </td>
      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs bg-slate-50/40 dark:bg-slate-900/40 whitespace-nowrap">{row.mergeCode}</td>
      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs bg-slate-50/40 dark:bg-slate-900/40 whitespace-nowrap">{row.reserve}</td>

      {/* Faculty UID input */}
      <td className="p-4 bg-primary/[0.02] dark:bg-[#3b82f6]/5 border-x border-primary/5 dark:border-[#3b82f6]/10 overflow-visible">
        <div className="relative">
          <input
            className={`w-full text-sm rounded-lg py-1.5 px-3 focus:ring-4 transition-all border shadow-sm
              ${row.isSaved
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70 border-slate-200 dark:border-[#334155]"
                : (!row.uid?.trim() || !faculties.some(f => String(f.facultyUID || f.facultyUid || f.FacultyUID || "") === row.uid))
                  ? "border-error focus:border-error focus:ring-error/20 dark:border-red-500 dark:bg-[#020617] dark:text-white"
                  : "border-slate-200 dark:border-[#334155] dark:bg-[#020617] dark:text-white focus:border-primary dark:focus:border-[#3b82f6] focus:ring-primary/10 dark:focus:ring-[#3b82f6]/20"
              }`}
            type="text"
            value={row.uid}
            disabled={row.isSaved}
            onChange={e => { handleUidChange(row.id, e.target.value); setFocusedRowId(row.id); }}
            onFocus={() => setFocusedRowId(row.id)}
            onBlur={() => setTimeout(() => setFocusedRowId(prev => prev === row.id ? null : prev), 200)}
            placeholder="Search UID / Name…"
          />
          {/* Autocomplete dropdown */}
          {!row.isSaved && focusedRowId === row.id && (
            <div className="absolute top-10 left-0 w-full z-[100] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-lg shadow-2xl max-h-48 overflow-y-auto">
              {(() => {
                const search = String(row.uid || "").toLowerCase();
                const matches = faculties.filter(f => {
                  const uid  = String(f.facultyUID || f.facultyUid  || f.FacultyUID  || "");
                  const name = String(f.facultyName || f.FacultyName || "");
                  return uid.toLowerCase().includes(search) || name.toLowerCase().includes(search);
                });
                return matches.length === 0
                  ? <div className="px-3 py-2 text-xs text-slate-400 italic">No matching faculty found.</div>
                  : matches.map(f => {
                      const uid  = String(f.facultyUID || f.facultyUid  || f.FacultyUID  || "");
                      const name = String(f.facultyName || f.FacultyName || "");
                      return (
                        <div key={uid}
                          className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0"
                          onMouseDown={e => { e.preventDefault(); handleUidChange(row.id, uid); setFocusedRowId(null); }}
                        >
                          <span className="font-bold text-primary dark:text-[#3b82f6] block mb-0.5">{uid}</span>
                          <span className="truncate block opacity-80">{name}</span>
                        </div>
                      );
                    });
              })()}
            </div>
          )}
          {!row.isSaved && !row.uid?.trim() && (
            <span className="absolute -bottom-4 left-1 text-[9px] font-bold text-error dark:text-red-400">UID cannot be empty</span>
          )}
          {!row.isSaved && row.uid?.trim() && !faculties.some(f => String(f.facultyUID || f.facultyUid || f.FacultyUID || "") === row.uid) && (
            <span className="absolute -bottom-4 left-1 text-[9px] font-bold text-error dark:text-red-400">UID not found in master list</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 sticky right-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-colors">
        {row.isSaved ? (
          <button
            onClick={() => handleUnlockRow(row.id)}
            title="Override / Re-assign faculty"
            className="text-[10px] font-bold px-3 py-1.5 rounded uppercase transition-all bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-1 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}>edit</span>
            Override
          </button>
        ) : (
          <button
            onClick={() => handleSaveRow(row)}
            className="text-[10px] font-bold px-4 py-1.5 rounded uppercase shadow-sm transition-all bg-primary dark:bg-[#3b82f6] text-white shadow-primary/20 dark:shadow-[#3b82f6]/20 hover:bg-on-primary-fixed-variant dark:hover:brightness-110 whitespace-nowrap"
          >
            Save
          </button>
        )}
      </td>
    </tr>
  );

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <main className="w-full min-h-screen bg-surface dark:bg-[#020617] flex flex-col font-body">
      <div className="p-8 flex-1 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">

        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
              Course Mapping Architecture
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Configure section-wise faculty allocations and semester-wide mapping rules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>download</span>
              Export Excel
            </button>
          </div>
        </div>

        {/* Progress + stat chips */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-outline-variant dark:border-[#334155] shadow-sm p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#334155]">
              <span className="material-symbols-outlined text-slate-500 text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>list_alt</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{loading ? "–" : totalCount}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500 text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>pending_actions</span>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Pending</span>
              <span className="text-sm font-extrabold text-red-600 dark:text-red-400">{loading ? "–" : unassignedCount}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Assigned</span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{loading ? "–" : assignedCount}</span>
            </div>
            {pendingChanges > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <span className="material-symbols-outlined text-amber-500 text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>edit_note</span>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Unsaved</span>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">{pendingChanges}</span>
              </div>
            )}
            <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500">{pct}% complete</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-tertiary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-outline-variant dark:border-[#334155] shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Course Code</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
                <input value={filterCourse}
                  onChange={e => { setFilterCourse(e.target.value); setPendingPage(1); setAssignedPage(1); }}
                  className="w-full text-sm border-none bg-slate-50 dark:bg-[#020617] dark:text-white rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 ring-1 ring-slate-200 dark:ring-[#334155] outline-none"
                  placeholder="e.g. CS302" type="text" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Section</label>
              <select value={filterSection}
                onChange={e => { setFilterSection(e.target.value); setPendingPage(1); setAssignedPage(1); }}
                className="text-sm border-none bg-slate-50 dark:bg-[#020617] dark:text-white rounded-lg px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 ring-1 ring-slate-200 dark:ring-[#334155] outline-none"
              >
                {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Faculty UID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>person</span>
                <input value={filterUid}
                  onChange={e => { setFilterUid(e.target.value); setPendingPage(1); setAssignedPage(1); }}
                  className="w-full text-sm border-none bg-slate-50 dark:bg-[#020617] dark:text-white rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 ring-1 ring-slate-200 dark:ring-[#334155] outline-none"
                  placeholder="Search UID…" type="text" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* GROUP 1 — Pending (Unassigned) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-soft dark:shadow-2xl border border-red-200 dark:border-red-900/40 overflow-hidden flex flex-col">

          {/* Section header — now a toggle button */}
          <button
            className="px-6 py-4 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/40 flex items-center justify-between w-full text-left hover:bg-red-100/60 dark:hover:bg-red-900/20 transition-colors flex-wrap gap-3"
            onClick={() => setPendingCollapsed(c => !c)}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>pending_actions</span>
              <div>
                <p className="text-sm font-extrabold text-red-700 dark:text-red-400">Pending Assignment</p>
                <p className="text-xs text-red-500/80 dark:text-red-500/60">
                  {allUnassigned.length} rows
                  {!pendingCollapsed && ` · page ${safePendingPage} of ${pendingTotalPages}`}
                  {" · sorted A→Z · click to "}{pendingCollapsed ? "expand" : "collapse"}
                </p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-red-500 text-xl transition-transform duration-300 ${pendingCollapsed ? "" : "rotate-180"}`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >expand_more</span>
          </button>

          {!pendingCollapsed && (
            <>
              {/* Save‑all bar — shown inside body only when there are staged changes */}
              {pendingPageRows.some(r => !r.isSaved && r.uid !== r.originalUid) && (
                <div className="px-6 py-2.5 bg-red-50/60 dark:bg-red-900/5 border-b border-red-100 dark:border-red-900/20 flex justify-end">
                  <button
                    onClick={() => handleSaveAllVisible(pendingPageRows)}
                    className="px-4 py-2 bg-primary dark:bg-[#3b82f6] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-on-primary-fixed-variant dark:hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>done_all</span>
                    Save All on This Page
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1400px]">
                  <TableHead />
                  <tbody className="divide-y divide-outline-variant dark:divide-[#334155]">
                    {loading ? (
                      <tr><td colSpan={14} className="px-5 py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined animate-spin text-2xl block mb-2">refresh</span>Loading…
                      </td></tr>
                    ) : allUnassigned.length === 0 ? (
                      <tr><td colSpan={14} className="px-5 py-10 text-center">
                        <span className="material-symbols-outlined text-3xl block mb-2 text-emerald-400">task_alt</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">All rows assigned — great work!</span>
                      </td></tr>
                    ) : (
                      pendingPageRows.map(renderRow)
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pending pagination */}
              {allUnassigned.length > 0 && (
                <PaginationBar
                  page={safePendingPage}
                  totalPages={pendingTotalPages}
                  perPage={pendingPerPage}
                  onPageChange={setPendingPage}
                  onPerPageChange={setPendingPerPage}
                />
              )}
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* GROUP 2 — Assigned (collapsible) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-soft dark:shadow-2xl border border-emerald-200 dark:border-emerald-900/40 overflow-hidden flex flex-col">

          {/* Toggle header */}
          <button
            className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between w-full text-left hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20 transition-colors"
            onClick={() => setAssignedCollapsed(c => !c)}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
              <div>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Assigned</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-600/60">
                  {allAssigned.length} rows
                  {!assignedCollapsed && ` · page ${safeAssignedPage} of ${assignedTotalPages}`}
                  {" "}· click to {assignedCollapsed ? "expand" : "collapse"}
                </p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-emerald-500 text-xl transition-transform duration-300 ${assignedCollapsed ? "" : "rotate-180"}`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >expand_more</span>
          </button>

          {!assignedCollapsed && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1400px]">
                  <TableHead />
                  <tbody className="divide-y divide-outline-variant dark:divide-[#334155]">
                    {assignedPageRows.length === 0 ? (
                      <tr><td colSpan={14} className="px-5 py-10 text-center text-slate-400 text-sm">No assigned rows yet.</td></tr>
                    ) : (
                      assignedPageRows.map(renderRow)
                    )}
                  </tbody>
                </table>
              </div>
              {/* Assigned pagination */}
              {allAssigned.length > 0 && (
                <PaginationBar
                  page={safeAssignedPage}
                  totalPages={assignedTotalPages}
                  perPage={assignedPerPage}
                  onPageChange={setAssignedPage}
                  onPerPageChange={setAssignedPerPage}
                />
              )}
            </>
          )}
        </div>

        <div className="h-10" />
      </div>
    </main>
  );
};

export default FacultyAssignmentWorkspace;