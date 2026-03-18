import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

const FacultyAssignmentWorkspace = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Faculty Autocomplete State
  const [faculties, setFaculties] = useState([]);
  const [focusedRowId, setFocusedRowId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRequiredData = async () => {
    try {
      const [mappingRes, facultyRes] = await Promise.all([
        fetch(`${API_BASE}/api/mappings`),
        fetch(`${API_BASE}/faculty/all`)
      ]);
      
      if (facultyRes.ok) {
        setFaculties(await facultyRes.json());
      }

      if (mappingRes.ok) {
        const data = await mappingRes.json();
        const formattedData = data.map(item => ({
          id: `${item.Section}-${item.Coursecode}-${item.GroupNo}-${item.mappingType}`,
          courseCode: item.Coursecode,
          group: `G${item.GroupNo}`,
          groupRaw: item.GroupNo,
          section: item.Section,
          type: item.mappingType,
          attendance: item.AttendanceType || "Regular",
          nature: item.CourseNature || "C",
          uid: item.FacultyUID || "",
          originalUid: item.FacultyUID || "",
          isSaved: !!item.FacultyUID, // Lock initially if it already has a faculty saved
          l: item.L !== undefined ? item.L : 0,
          t: item.T !== undefined ? item.T : 0,
          p: item.P !== undefined ? item.P : 0,
          mergeStatus: item.MergeStatus ? "check_circle" : "circle",
          mergeCode: item.Mergecode || "---",
          reserve: item.Reserveslot || "---",
          statusColor: item.MergeStatus ? "text-tertiary" : "text-slate-300 dark:text-slate-600"
        }));
        setRows(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequiredData();
  }, []);

  const handleUidChange = (id, newUid) => {
    setRows(prevRows => prevRows.map(row => row.id === id ? { ...row, uid: newUid, isSaved: false } : row));
  };

  const handleSaveRow = async (row) => {
    if (!row.uid || row.uid.trim() === "") {
      alert(`Cannot save empty Faculty UID for row ${row.courseCode} group ${row.group}`);
      return;
    }
    if (!faculties.some(f => {
       const fUid = String(f.facultyUID || f.FacultyUID || "");
       return fUid === row.uid;
    })) {
      alert(`Invalid Faculty UID: ${row.uid}\nPlease select a valid UID from the list or type it correctly.`);
      return;
    }
    try {
      const payload = {
        section: row.section,
        coursecode: row.courseCode,
        groupNo: row.groupRaw,
        mappingType: row.type,
        facultyUID: row.uid === "" ? null : row.uid
      };
      
      const response = await fetch(`${API_BASE}/api/mappings/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setRows(prevRows => prevRows.map(r => r.id === row.id ? { ...r, isSaved: true, originalUid: row.uid } : r));
        console.log("Saved successfully");
      } else {
        console.error("Failed to save");
      }
    } catch (error) {
       console.error("Error saving row:", error);
    }
  };

  const handleSaveAll = async () => {
    const rowsToSave = paginatedRows.filter(r => !r.isSaved && r.uid !== r.originalUid);
    
    // Check for empty rows that user might be trying to save
    const emptyRows = rowsToSave.filter(r => !r.uid || r.uid.trim() === "");
    if (emptyRows.length > 0) {
      alert(`Cannot save all! Found empty Faculty UIDs in rows with Code: ${emptyRows.map(r => r.courseCode).join(", ")}.\nPlease fill them or leave them unchanged.`);
      return;
    }

    // Validate all first
    const invalidRows = rowsToSave.filter(row => !faculties.some(f => {
       const fUid = String(f.facultyUID || f.FacultyUID || "");
       return fUid === row.uid;
    }));

    if (invalidRows.length > 0) {
      alert(`Cannot save all! Found invalid Faculty UIDs in rows with Code: ${invalidRows.map(r => r.courseCode).join(", ")}.\nPlease correct them first.`);
      return;
    }

    if (rowsToSave.length === 0) {
      alert("No new changes to save on this page.");
      return;
    }

    try {
      const promises = rowsToSave.map(row => {
        const payload = {
          section: row.section,
          coursecode: row.courseCode,
          groupNo: row.groupRaw,
          mappingType: row.type,
          facultyUID: row.uid
        };
        return fetch(`${API_BASE}/api/mappings/assign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => ({ id: row.id, ok: res.ok }));
      });

      const results = await Promise.all(promises);
      const successfulIds = results.filter(r => r.ok).map(r => r.id);

      if (successfulIds.length > 0) {
        setRows(prevRows => prevRows.map(r => successfulIds.includes(r.id) ? { ...r, isSaved: true, originalUid: r.uid } : r));
      }

      if (successfulIds.length === rowsToSave.length) {
        alert("All changes on this page saved successfully!");
      } else {
        alert(`Saved ${successfulIds.length} out of ${rowsToSave.length} changes. Some failed.`);
      }
    } catch (error) {
      console.error("Error saving all rows:", error);
      alert("An error occurred while saving all rows.");
    }
  };

  const [autoSync, setAutoSync] = useState(true);

  // Pagination Calculations
  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;
  const paginatedRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.courseCode}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.group}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-200 text-sm font-semibold bg-slate-50/40 dark:bg-slate-900/40">{row.section}</td>
                    <td className="p-4 bg-slate-50/40 dark:bg-slate-900/40">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded uppercase border border-slate-200 dark:border-[#334155] whitespace-nowrap">{row.type}</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.attendance}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm bg-slate-50/40 dark:bg-slate-900/40">{row.nature}</td>
                    <td className="p-4 bg-primary/[0.02] dark:bg-[#3b82f6]/5 border-x border-primary/5 dark:border-[#3b82f6]/10 overflow-visible">
                      <div className="relative">
                        <input
                          className={`w-full text-sm border-slate-200 dark:border-[#334155] rounded-lg py-1.5 px-3 focus:ring-4 transition-all border shadow-sm ${row.isSaved ? "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70" : (!row.isSaved && (!row.uid || row.uid.trim() === "" || !faculties.some(f => String(f.facultyUID || f.FacultyUID || "") === row.uid))) ? "border-error focus:border-error focus:ring-error/20 dark:border-red-500" : "dark:bg-[#020617] dark:text-white focus:border-primary dark:focus:border-[#3b82f6] focus:ring-primary/10 dark:focus:ring-[#3b82f6]/20"}`}
                          type="text"
                          value={row.uid}
                          disabled={row.isSaved}
                          onChange={(e) => {
                            handleUidChange(row.id, e.target.value);
                            setFocusedRowId(row.id);
                          }}
                          onFocus={() => setFocusedRowId(row.id)}
                          onBlur={() => setTimeout(() => setFocusedRowId(null), 200)}
                          placeholder="Search UID/Name..."
                        />
                        {/* Autocomplete Dropdown */}
                        {!row.isSaved && focusedRowId === row.id && (
                          <div className="absolute top-10 left-0 w-full z-[100] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                            {faculties
                              .filter(f => {
                                const fUid = String(f.facultyUID || f.FacultyUID || "");
                                const fName = String(f.facultyName || f.FacultyName || f.facultyName || "");
                                const search = String(row.uid || "").toLowerCase();
                                return fUid.toLowerCase().includes(search) || fName.toLowerCase().includes(search);
                              })
                              .map(f => {
                                const fUid = String(f.facultyUID || f.FacultyUID || "");
                                const fName = String(f.facultyName || f.FacultyName || f.facultyName || "");
                                return (
                                <div 
                                  key={fUid}
                                  className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent focus loss on the input
                                    handleUidChange(row.id, fUid);
                                    setFocusedRowId(null);
                                  }}
                                >
                                  <span className="font-bold text-primary dark:text-[#3b82f6] block mb-0.5">{fUid}</span>
                                  <span className="truncate block opacity-80">{fName}</span>
                                </div>
                                );
                              })}
                              {faculties.filter(f => {
                                const fUid = String(f.facultyUID || f.FacultyUID || "");
                                const fName = String(f.facultyName || f.FacultyName || f.facultyName || "");
                                const search = String(row.uid || "").toLowerCase();
                                return fUid.toLowerCase().includes(search) || fName.toLowerCase().includes(search);
                              }).length === 0 && (
                                <div className="px-3 py-2 text-xs text-slate-400 italic">No matching faculty found.</div>
                              )}
                          </div>
                        )}
                        {/* Validation Error Text */}
                        {!row.isSaved && (!row.uid || row.uid.trim() === "") && (
                          <span className="absolute -bottom-4 left-1 text-[9px] font-bold text-error dark:text-red-400">UID cannot be empty</span>
                        )}
                        {!row.isSaved && row.uid && row.uid.trim() !== "" && !faculties.some(f => String(f.facultyUID || f.FacultyUID || "") === row.uid) && (
                          <span className="absolute -bottom-4 left-1 text-[9px] font-bold text-error dark:text-red-400">UID not found in Master</span>
                        )}
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
                      <button 
                        onClick={() => handleSaveRow(row)} 
                        disabled={row.isSaved}
                        className={`text-[10px] font-bold px-4 py-1.5 rounded uppercase shadow-sm transition-all ${row.isSaved ? "bg-tertiary/20 text-tertiary cursor-not-allowed shadow-none" : "bg-primary dark:bg-[#3b82f6] text-white shadow-primary/20 dark:shadow-[#3b82f6]/20 hover:bg-on-primary-fixed-variant dark:hover:brightness-110"}`}
                      >
                        {row.isSaved ? "Saved" : "Save"}
                      </button>
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
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-xs border-none bg-slate-100 dark:bg-[#020617] dark:text-slate-300 rounded-md px-2 py-1 focus:ring-0 shadow-sm dark:ring-1 dark:ring-[#334155]">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button onClick={handleSaveAll} className="px-4 py-1.5 bg-primary/10 text-primary dark:text-[#3b82f6] hover:bg-primary/20 transition-all rounded-lg text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>done_all</span>
                Save All Changes on Page
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-slate-400">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>first_page</span>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-slate-400">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_left</span>
              </button>
              <div className="flex items-center px-3 gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
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