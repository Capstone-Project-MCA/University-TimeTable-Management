import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

const FacultyAssignmentWorkspace = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      courseCode: "CS302",
      group: "G1",
      section: "A",
      type: "Main",
      attendance: "Biometric",
      nature: "Core",
      uid: "F-9021",
      l: 3, t: 1, p: 0,
      mergeStatus: "check_circle",
      mergeCode: "MC-CS-A",
      reserve: "Slot 04",
      statusColor: "text-tertiary"
    },
    {
      id: 2,
      courseCode: "DS101",
      group: "G3",
      section: "C",
      type: "Elective",
      attendance: "Manual",
      nature: "Lab",
      uid: "",
      l: 0, t: 0, p: 4,
      mergeStatus: "circle",
      mergeCode: "---",
      reserve: "---",
      statusColor: "text-slate-300 dark:text-slate-600"
    },
    {
      id: 3,
      courseCode: "MATH204",
      group: "G1",
      section: "B",
      type: "Main",
      attendance: "Biometric",
      nature: "Foundation",
      uid: "F-8812",
      l: 4, t: 0, p: 0,
      mergeStatus: "error",
      mergeCode: "MC-MA-B",
      reserve: "Slot 01",
      statusColor: "text-error"
    }
  ]);

  const [autoSync, setAutoSync] = useState(true);

  return (
    <main className="w-full min-h-screen bg-surface dark:bg-[#020617] flex flex-col font-body">
      <div className="p-8 flex-1 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs & Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">Course Mapping Architecture</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure section-wise faculty allocations and semester-wide mapping rules.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant dark:border-[#334155] text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>file_download</span>
              Export CSV
            </button>
            <button className="px-6 py-2 bg-primary dark:bg-[#3b82f6] text-white rounded-lg font-semibold shadow-lg shadow-primary/20 dark:shadow-[#3b82f6]/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>save</span>
              Save All Changes
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low dark:bg-[#0f172a] p-5 rounded-xl border-l-4 border-l-primary dark:border-l-[#3b82f6] border border-transparent dark:border-[#334155] shadow-sm">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-label">Total Courses</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-headline">142</h3>
              <span className="text-[10px] font-bold text-slate-500">Global count</span>
            </div>
          </div>
          <div className="bg-surface-container-low dark:bg-[#0f172a] p-5 rounded-xl border-l-4 border-l-tertiary dark:border-l-[#10b981] border border-transparent dark:border-[#334155] shadow-sm">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-label">Faculty Assigned</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-headline">130</h3>
              <span className="text-[10px] font-bold text-tertiary">91.5% complete</span>
            </div>
          </div>
          <div className="bg-surface-container-low dark:bg-[#0f172a] p-5 rounded-xl border-l-4 border-l-error dark:border-l-[#ef4444] border border-transparent dark:border-[#334155] shadow-sm">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-label">Faculty Not Assigned</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-headline">12</h3>
              <span className="text-[10px] font-bold text-error">Requires allocation</span>
            </div>
          </div>
        </div>

        {/* Mapping Table Container */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-soft dark:shadow-2xl border border-outline-variant dark:border-[#334155] overflow-hidden flex flex-col flex-1">
          {/* Filters Header */}
          <div className="p-6 bg-surface-dim dark:bg-[#1e293b]/50 border-b border-outline-variant dark:border-[#334155] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Department</label>
                <select className="text-sm border-none bg-white dark:bg-[#020617] dark:text-white rounded-lg px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/40 ring-1 ring-slate-200 dark:ring-[#334155]">
                  <option>All Departments</option>
                  <option>Computer Science</option>
                  <option>Design</option>
                  <option>Mathematics</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Course Code</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
                  <input className="w-full text-sm border-none bg-white dark:bg-[#020617] dark:text-white rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/40 ring-1 ring-slate-200 dark:ring-[#334155]" placeholder="e.g. CS302" type="text" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Section</label>
                <select className="text-sm border-none bg-white dark:bg-[#020617] dark:text-white rounded-lg px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/40 ring-1 ring-slate-200 dark:ring-[#334155]">
                  <option>All Sections</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Faculty UID</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>person</span>
                  <input className="w-full text-sm border-none bg-white dark:bg-[#020617] dark:text-white rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/40 ring-1 ring-slate-200 dark:ring-[#334155]" placeholder="Search UID..." type="text" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#1e293b] sticky top-0 z-10 border-b border-outline-variant dark:border-[#334155]">
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Course Code</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Group No</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Section</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Mapping Type</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Attendance Type</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest break-nowrap">Course Nature</th>
                  <th className="p-4 text-[10px] font-bold text-primary dark:text-[#3b82f6] uppercase tracking-widest bg-primary/5 dark:bg-[#3b82f6]/5 border-x border-primary/10 dark:border-[#3b82f6]/20 w-64">Faculty UID</th>
                  <th className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">L</th>
                  <th className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">T</th>
                  <th className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">P</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Merge Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Merge Code</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reserve Slot</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest sticky right-0 bg-slate-50 dark:bg-[#1e293b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-[#334155]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.courseCode}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.group}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-200 text-sm font-semibold bg-slate-50/40 dark:bg-slate-900/40">{row.section}</td>
                    <td className="p-4 bg-slate-50/40 dark:bg-slate-900/40">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded uppercase border border-slate-200 dark:border-[#334155] whitespace-nowrap">{row.type}</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.attendance}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.nature}</td>
                    <td className="p-4 bg-primary/[0.02] dark:bg-[#3b82f6]/5 border-x border-primary/5 dark:border-[#3b82f6]/10">
                      <div className="relative">
                        <input
                          className="w-full text-sm border-slate-200 dark:border-[#334155] dark:bg-[#020617] dark:text-white rounded-lg py-1.5 px-3 focus:border-primary dark:focus:border-[#3b82f6] focus:ring-4 focus:ring-primary/10 dark:focus:ring-[#3b82f6]/20 transition-all border shadow-sm"
                          type="text"
                          defaultValue={row.uid}
                          placeholder={!row.uid ? "Type UID..." : ""}
                        />
                      </div>
                    </td>
                    <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.l}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.t}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-50/40 dark:bg-slate-900/40 text-center">{row.p}</td>
                    <td className="p-4 bg-slate-50/40 dark:bg-slate-900/40 text-center">
                      <span className={`material-symbols-outlined text-sm ${row.statusColor}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{row.mergeStatus}</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs bg-slate-50/40 dark:bg-slate-900/40 whitespace-nowrap">{row.mergeCode}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs bg-slate-50/40 dark:bg-slate-900/40 whitespace-nowrap">{row.reserve}</td>
                    <td className="p-4 sticky right-0 bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-colors">
                      <button className="bg-primary dark:bg-[#3b82f6] text-white text-[10px] font-bold px-4 py-1.5 rounded uppercase shadow-sm shadow-primary/20 dark:shadow-[#3b82f6]/20 hover:bg-on-primary-fixed-variant dark:hover:brightness-110 transition-all">Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination & Bulk Action Footer */}
          <div className="p-4 bg-white dark:bg-[#1e293b]/50 border-t border-outline-variant dark:border-[#334155] flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rows per page:</span>
                <select className="text-xs border-none bg-slate-100 dark:bg-[#020617] dark:text-slate-300 rounded-md px-2 py-1 focus:ring-0 dark:ring-1 dark:ring-[#334155]">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <button className="px-4 py-1.5 bg-primary/10 text-primary dark:text-[#3b82f6] hover:bg-primary/20 transition-all rounded-lg text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>done_all</span>
                Save All Changes on Page
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-primary transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>first_page</span>
              </button>
              <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-primary transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_left</span>
              </button>
              <div className="flex items-center px-4 gap-2">
                <button className="w-8 h-8 rounded-lg bg-primary dark:bg-[#3b82f6] text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
                <button className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
                <span className="text-slate-400 px-1">...</span>
                <button className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">15</button>
              </div>
              <button className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
              </button>
              <button className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>last_page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Float Notification */}
      {autoSync && (
        <div className="fixed bottom-8 right-8 bg-on-surface dark:bg-[#1e293b] text-surface dark:text-white py-3 px-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 dark:border-[#334155] backdrop-blur-xl z-50 transition-all">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>sync</span>
          <div className="text-sm">
            <p className="font-bold">Auto-sync active</p>
            <p className="text-xs text-slate-400">Assignment updates are staged for batch processing.</p>
          </div>
          <button onClick={() => setAutoSync(false)} className="ml-4 text-xs font-bold text-primary dark:text-white hover:text-primary/80 transition-colors">
            DISMISS
          </button>
        </div>
      )}
    </main>
  );
};

export default FacultyAssignmentWorkspace;