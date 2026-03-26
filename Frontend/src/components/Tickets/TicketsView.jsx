import React, { useState, useEffect } from "react";
import { useDataRefresh } from "../../context/DataRefreshContext";

const API_BASE = "http://localhost:8080";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

function PaginationBar({ page, totalPages, perPage, total, onPageChange, onPerPageChange }) {
  const offset = totalPages <= 5 ? 0 : Math.max(0, Math.min(page - 3, totalPages - 5));
  const pages  = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => offset + i + 1);
  return (
    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rows per page:</span>
        <select value={perPage} onChange={e => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="text-xs border-none bg-white dark:bg-slate-900 dark:text-slate-300 rounded-md px-2 py-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 outline-none">
          {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-xs text-slate-400 dark:text-slate-500">{total} total</span>
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

export default function TicketsView() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Filters
  const [filterCourse,  setFilterCourse]  = useState("");
  const [filterSection, setFilterSection] = useState("All");
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterType,    setFilterType]    = useState("All");

  // Pagination
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { refreshKey } = useDataRefresh();

  const fetchTickets = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/ticket/get-all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { if (refreshKey > 0) fetchTickets(); }, [refreshKey]);

  // Derived filter options
  const uniqueSections = ["All", ...Array.from(new Set(tickets.map(t => t.section || t.Section || ""))).filter(Boolean).sort()];
  const uniqueTypes    = ["All", ...Array.from(new Set(tickets.map(t => t.mappingType || t.MappingType || ""))).filter(Boolean).sort()];

  // Apply filters
  const filtered = tickets.filter(t => {
    const course  = (t.courseCode  || t.coursecode  || t.Coursecode  || "").toLowerCase();
    const section = t.section || t.Section || "";
    const faculty = (t.facultyUid  || t.facultyUID  || t.FacultyUID  || "").toLowerCase();
    const type    = t.mappingType || t.MappingType || "";
    return (
      course.includes(filterCourse.toLowerCase()) &&
      (filterSection === "All" || section === filterSection) &&
      faculty.includes(filterFaculty.toLowerCase()) &&
      (filterType === "All" || type === filterType)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  // Reset page on filter change
  const handleFilter = (setter) => (val) => { setter(val); setPage(1); };

  const mergedCount   = tickets.filter(t => !!(t.mergedCode || t.MergedCode)).length;
  const assignedCount = tickets.filter(t => !!(t.facultyUid || t.facultyUID || t.FacultyUID)).length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      <div className="max-w-[1500px] mx-auto px-8 pt-8 pb-16 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduling</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              </span>
              Tickets
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">All generated scheduling tickets across course mappings.</p>
          </div>
          <button onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>refresh</span>
            Refresh
          </button>
        </div>

        {/* ── Stat chips ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total Tickets",   value: tickets.length,   icon: "confirmation_number", color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300" },
            { label: "With Faculty",    value: assignedCount,    icon: "person_check",         color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" },
            { label: "Merged Sections", value: mergedCount,      icon: "call_merge",           color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300" },
            { label: "Filtered",        value: filtered.length,  icon: "filter_alt",           color: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${color}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{icon}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-xl font-extrabold leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Course Code */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Course Code</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
                <input value={filterCourse} onChange={e => handleFilter(setFilterCourse)(e.target.value)}
                  placeholder="e.g. CSE101"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-slate-200" />
              </div>
            </div>
            {/* Section */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Section</label>
              <select value={filterSection} onChange={e => handleFilter(setFilterSection)(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-slate-200">
                {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Faculty UID */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Faculty UID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>person</span>
                <input value={filterFaculty} onChange={e => handleFilter(setFilterFaculty)(e.target.value)}
                  placeholder="e.g. F001"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-slate-200" />
              </div>
            </div>
            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Type</label>
              <select value={filterType} onChange={e => handleFilter(setFilterType)(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-slate-200">
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <span className="material-symbols-outlined text-4xl animate-spin mb-3">progress_activity</span>
              <p className="text-sm font-semibold">Loading tickets…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-red-500">
              <span className="material-symbols-outlined text-4xl mb-3">error</span>
              <p className="text-sm font-semibold">Failed to load: {error}</p>
              <button onClick={fetchTickets} className="mt-4 px-4 py-2 text-sm font-bold bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-red-600">Retry</button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 text-indigo-300">confirmation_number</span>
              <p className="text-base font-bold text-slate-600 dark:text-slate-300">No tickets generated yet</p>
              <p className="text-sm text-slate-400 mt-1">Use the <span className="font-semibold text-indigo-500">Generate Tickets</span> button in the top navbar after assigning faculty to course mappings.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      {["Ticket ID", "Course", "Section", "Group", "Type", "Lecture #", "Faculty", "Merge Code", "Day", "Time", "Room"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pageRows.map(t => {
                      const ticketId   = t.ticketId   || t.TicketId  || "—";
                      const course     = t.courseCode  || t.coursecode || t.Coursecode || "—";
                      const section    = t.section     || t.Section   || "—";
                      const group      = t.groupNo     ?? t.GroupNo   ?? "—";
                      const type       = t.mappingType || t.MappingType || "—";
                      const lectureNo  = t.lectureNo   ?? t.LectureNo ?? "—";
                      const faculty    = t.facultyUid  || t.facultyUID || t.FacultyUID || null;
                      const mergeCode  = t.mergedCode  || t.MergedCode || null;
                      const day        = t.day  || t.Day  || null;
                      const time       = t.time || t.Time || null;
                      const room       = t.roomNo || t.RoomNo || null;
                      return (
                        <tr key={ticketId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{ticketId}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{course}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{section}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">G{group}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">{type}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-slate-700 dark:text-slate-200">{lectureNo}</td>
                          <td className="px-4 py-3">
                            {faculty
                              ? <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded">{faculty}</span>
                              : <span className="text-xs text-slate-400 italic">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {mergeCode && mergeCode !== ""
                              ? <span className="text-xs font-mono text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded">{mergeCode}</span>
                              : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{day || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{time || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{room || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                page={safePage} totalPages={totalPages} perPage={perPage} total={filtered.length}
                onPageChange={setPage} onPerPageChange={setPerPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
