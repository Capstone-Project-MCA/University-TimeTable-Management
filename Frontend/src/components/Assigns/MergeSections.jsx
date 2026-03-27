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

const mappingCourseCode = (m) => m?.courseCode ?? m?.coursecode ?? m?.Coursecode ?? m?.CourseCode ?? "";
const mappingSection = (m) => m?.section ?? m?.Section ?? m?.sectionId ?? m?.SectionId ?? "";
const mappingGroupNo = (m) => m?.groupNo ?? m?.GroupNo ?? m?.groupno ?? null;
const sectionRowId = (s) => s?.sectionId ?? s?.SectionId ?? s?.section ?? s?.Section ?? "";
const getCourseCode = (c) => c?.courseCode ?? c?.CourseCode ?? c?.coursecode ?? "";
const getCourseTitle = (c) => c?.courseTitle ?? c?.CourseTitle ?? c?.coursetitle ?? "";

export default function MergeSections() {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSectionGroups, setSelectedSectionGroups] = useState([]); // [{sectionId, groupNo}]
  const [mappingMode, setMappingMode] = useState("L"); // "L", "T", "P"
  const [sectionError, setSectionError] = useState("");
  const [lastMerge, setLastMerge] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const searchRef = useRef(null);
  const anchorRef = useRef(null);
  const dropdownPortalRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // ── Edit mode state ──
  const [editingGroup, setEditingGroup] = useState(null);
  const [editSectionGroups, setEditSectionGroups] = useState([]); // [{sectionId, groupNo}]
  const [updating, setUpdating] = useState(false);

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
    setFetchError("");
    Promise.all([
      axios.get("http://localhost:8080/course/all"),
      axios.get("http://localhost:8080/section/all"),
      axios.get("http://localhost:8080/mappings"),
    ])
      .then(([c, s, m]) => {
        setCourses(c.data);
        setSections(s.data);
        setMappings(m.data);
      })
      .catch(() => setFetchError("Could not connect to the server. Please make sure the backend is running."))
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
        getCourseCode(c).toLowerCase().includes(q) ||
        getCourseTitle(c).toLowerCase().includes(q)
      ).slice(0, 10)
    : [];

  // ── Compute Groups and Sections ──
  const relatedMappings = selectedCourse
    ? mappings.filter((m) => mappingCourseCode(m) === getCourseCode(selectedCourse))
    : [];

  const groupMap = {};
  const groupFacultyMap = {};
  relatedMappings.forEach(m => {
    const code = m.mergeCode ?? m.mergecode ?? m.Mergecode ?? m.MergeCode;
    if (code) {
        if (!groupMap[code]) groupMap[code] = [];
        groupMap[code].push(mappingSection(m));
        // Collect faculty UIDs per merge group
        const fuid = m.facultyUid ?? m.facultyUID ?? m.FacultyUID ?? null;
        if (fuid) {
          if (!groupFacultyMap[code]) groupFacultyMap[code] = new Set();
          groupFacultyMap[code].add(fuid);
        }
    }
  });

  const existingMergeCodes = Object.keys(groupMap);

  // Filter mappings by mappingMode
  const modeFilteredMappings = relatedMappings.filter(m => {
      const type = (m.mappingType || m.MappingType || "L");
      return type === mappingMode;
  });

  // Build L/T/P info map per section from ALL related mappings (for display)
  const sectionLTPMap = {};
  relatedMappings.forEach(m => {
    const sec = mappingSection(m);
    if (!sectionLTPMap[sec]) {
      sectionLTPMap[sec] = {
        L: m.l ?? m.L ?? 0,
        T: m.t ?? m.T ?? 0,
        P: m.p ?? m.P ?? 0,
        groupNo: mappingGroupNo(m),
        mappingType: m.mappingType ?? m.MappingType ?? ""
      };
    }
  });

  const availableSections = sections.filter(s => {
    const id = sectionRowId(s);
    return modeFilteredMappings.some(m => mappingSection(m) === id);
  });

  const getSectionGroupsForMode = (sectionId, mode) => {
      return [...new Set(
          relatedMappings
              .filter(m => mappingSection(m) === sectionId)
              .filter(m => (m.MappingType || m.mappingType || "L") === mode)
              .map(m => mappingGroupNo(m))
      )].sort((a,b) => (a===null?-1:a) - (b===null?-1:b));
  };

  const handlePickCourse = (course) => {
    setSelectedCourse(course);
    setQuery("");
    setShowSuggestions(false);
    setSelectedSectionGroups([]);
    setSelectedGroup(null);
    setMappingMode("L");
    setSectionError("");
    setLastMerge(null);
  };

  const handleChangeCourse = () => {
    setSelectedCourse(null);
    setSelectedSectionGroups([]);
    setSelectedGroup(null);
    setMappingMode("L");
    setSectionError("");
    setLastMerge(null);
    setTimeout(() => searchRef.current?.querySelector("input")?.focus(), 100);
  };

  const toggleSectionGroup = (sectionId, groupNo, isEdit = false) => {
    setSectionError("");
    const setter = isEdit ? setEditSectionGroups : setSelectedSectionGroups;
    setter(prev => {
        const index = prev.findIndex(g => g.sectionId === sectionId && g.groupNo === groupNo);
        if (index >= 0) {
            return prev.filter((_, i) => i !== index);
        } else {
            return [...prev, { sectionId, groupNo }];
        }
    });
  };

  const handleToggleGroup = (code) => {
    if (editingGroup) return; // disable group toggling while editing
    setSectionError("");
    if (selectedGroup === code) {
        setSelectedGroup(null);
    } else {
        setSelectedGroup(code);
    }
  };

  // ── Edit Group Handlers ──
  const handleEditGroup = (code, e) => {
    e.stopPropagation();
    setSectionError("");
    
    // Find the mapping for this merge code
    const groupMapping = mappings.find(m => (m.mergeCode ?? m.mergecode ?? m.Mergecode ?? m.MergeCode) === code);
    
    if (groupMapping) {
       // Set the correct course
       const mappedCourseCode = mappingCourseCode(groupMapping);
       const crs = courses.find(c => getCourseCode(c) === mappedCourseCode);
       if (crs) {
           setSelectedCourse(crs);
           setQuery("");
           setShowSuggestions(false);
       }
       setMappingMode(groupMapping.mappingType || groupMapping.MappingType || "L");
    }

    setSelectedGroup(null);
    setSelectedSectionGroups([]);
    setEditingGroup(code);
    
    const groupsInMerge = mappings
        .filter(m => (m.mergeCode ?? m.mergecode ?? m.Mergecode ?? m.MergeCode) === code)
        .map(m => ({ sectionId: mappingSection(m), groupNo: mappingGroupNo(m) }));
    
    setEditSectionGroups(groupsInMerge);
    
    // Scroll to top to see sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditSectionGroups([]);
    setSectionError("");
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || editSectionGroups.length < 2 || updating) return;
    setUpdating(true);
    setSectionError("");
    try {
      await axios.put(`http://localhost:8080/merge/update-merge/${editingGroup}`, {
        courseCode: getCourseCode(selectedCourse),
        sectionGroups: editSectionGroups,
        mappingType: mappingMode // Send the mapping type with it
      });
      setShowToast(true);
      setLastMerge({ mergeCode: editingGroup });
      setEditingGroup(null);
      setEditSectionGroups([]);
      const mRes = await axios.get("http://localhost:8080/mappings");
      setMappings(mRes.data);
    } catch (err) {
      console.error("Update Error:", err);
      if (!err.response) {
        setSectionError("Connection Error: Please ensure the backend is running.");
      } else {
        setSectionError(err.response?.data?.error || err.message || "Update failed.");
      }
    } finally {
      setUpdating(false);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const canMergeOrExtend = (selectedSectionGroups.length >= 2 && !selectedGroup) || (selectedSectionGroups.length >= 1 && selectedGroup);
  const [merging, setMerging] = useState(false);

  const handleMerge = async () => {
    if (!canMergeOrExtend || merging) return;
    setMerging(true);
    setSectionError("");
    try {
      const res = await axios.post("http://localhost:8080/merge/merge-section", {
        courseCode: getCourseCode(selectedCourse),
        sectionGroups: selectedSectionGroups,
        existingMergeCode: selectedGroup,
        mappingType: mappingMode
      });
      console.log("Output Merge section data: ", res.data);
      const mappingsReturned = res.data;
      const mergeCode = mappingsReturned.length > 0 
        ? (mappingsReturned[0].mergeCode || mappingsReturned[0].mergecode || mappingsReturned[0].Mergecode || mappingsReturned[0].MergeCode || "UNKNOWN") 
        : "UNKNOWN";
      setLastMerge({ mergeCode });
      setShowToast(true);
      setSelectedSectionGroups([]);
      setSelectedGroup(null);
      const mRes = await axios.get("http://localhost:8080/mappings");
      setMappings(mRes.data);
    } catch (err) {
      console.error("Merge Error:", err);
      if (!err.response) {
         setSectionError("Connection Error: Please ensure the backend is running.");
      } else {
         setSectionError(err.response?.data?.error || err.message || "Merge failed.");
      }
    } finally {
      setMerging(false);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleDeleteGroup = async (code, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete group ${code}?`)) return;
    try {
        await axios.delete(`http://localhost:8080/merge/unmerge/${code}`);
        const mRes = await axios.get("http://localhost:8080/mappings");
        setMappings(mRes.data);
        if (selectedGroup === code) setSelectedGroup(null);
    } catch (err) {
        setSectionError("Failed to delete group.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
          </div>
          <p className="text-sm font-bold text-slate-400">Loading data…</p>
        </div>
      </div>
    );
  }

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
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">Action Successful</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Merge ID: {lastMerge?.mergeCode}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined text-sm text-slate-400">close</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Error Banner ── */}
        {fetchError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
            <span className="material-symbols-outlined text-xl">error</span>
            <p className="text-sm font-medium flex-1">{fetchError}</p>
            <button onClick={fetchAll} className="px-4 py-1.5 bg-red-100 dark:bg-red-800/40 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors">Retry</button>
          </div>
        )}
        
        {/* ── Header Area ── */}
        <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-white text-2xl">group_work</span>
                </div>
                Course Mapping & Merge
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Combine specific groups across different sections into merge groups under a specific Mapping Type (L/T/P).
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
                            key={getCourseCode(c)}
                            onClick={() => handlePickCourse(c)}
                            className="w-full px-5 py-3 text-left hover:bg-primary/5 flex items-center gap-3 transition-colors group"
                          >
                            <div className="flex-1 truncate">
                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{getCourseCode(c)}</span>
                                <span className="ml-2 text-xs font-medium text-slate-400 dark:text-slate-500">{getCourseTitle(c)}</span>
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
                <h3 className="text-xl font-black">{getCourseTitle(selectedCourse)}</h3>
                <p className="text-blue-100 font-bold uppercase text-xs">{getCourseCode(selectedCourse)}</p>
              </div>
            )}

            {sectionError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold animate-shake">
                {sectionError}
              </div>
            )}
          </div>

          {/* ── Right Side: Sections & Persistent Merge Bar ── */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <div className="flex-1 relative glass rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Available Sections</h2>
              </div>

              {/* ── Type Selector ── */}
              {selectedCourse && (
                <div className="mb-6 flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in-up">
                  
                  {/* L/T/P Type Merge Option */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapping Type</span>
                      <div className="flex gap-2 flex-wrap">
                        {["L", "T", "P"].map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setMappingMode(mode); setSelectedSectionGroups([]); }}
                                disabled={editingGroup !== null}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                                    mappingMode === mode
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/30"
                                } ${(editingGroup !== null && mappingMode !== mode) ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {mode === "L" ? "Lecture (L)" : mode === "T" ? "Tutorial (T)" : "Practical (P)"}
                            </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-700">
                       <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                       <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                         {availableSections.length} <span className="text-slate-400 font-bold">Sections Map Data</span>
                       </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 custom-scrollbar">
                {!selectedCourse ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-24 h-24 rounded-[40px] bg-slate-100 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-5xl">search</span>
                    </div>
                    <h3 className="text-lg font-black italic">Search Course First</h3>
                    <p className="text-xs mt-2">Search "CSE" in the sidebar input.</p>
                  </div>
                ) : (availableSections.length === 0 && existingMergeCodes.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <h3 className="text-lg font-black">No Sections found for this mode</h3>
                  </div>
                ) : (
                  <div className="space-y-8 pb-24">
                    
                    {/* ── Existing Groups ── */}
                    {existingMergeCodes.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Merge Groups</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {existingMergeCodes.map(code => {
                                    const isSelected = selectedGroup === code;
                                    const facultyIds = groupFacultyMap[code] ? [...groupFacultyMap[code]] : [];
                                    return (
                                        <div 
                                            key={code}
                                            onClick={() => handleToggleGroup(code)}
                                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${
                                                isSelected
                                                    ? "bg-amber-500/5 border-amber-500 shadow-lg shadow-amber-500/10"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-200"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600"}`}>
                                                        <span className="material-symbols-outlined text-sm font-black">auto_awesome_motion</span>
                                                    </div>
                                                    <h4 className="text-md font-black text-slate-800 dark:text-slate-100">{code}</h4>
                                                </div>
                                                {!editingGroup && (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleToggleGroup(code); }}
                                                        className={`p-1.5 rounded-lg transition-colors ${isSelected ? "bg-amber-500 text-white" : "hover:bg-amber-100 text-amber-500"}`}
                                                        title="Extend Group"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDeleteGroup(code, e)}
                                                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
                                                        title="Delete Group"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {groupMap[code].map(sId => (
                                                    <span key={sId} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500">{sId}</span>
                                                ))}
                                            </div>
                                            {/* Faculty IDs */}
                                            {facultyIds.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="material-symbols-outlined text-[12px] text-indigo-400">person</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty:</span>
                                                        {facultyIds.map(fid => (
                                                            <span key={fid} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-600 dark:text-indigo-300">{fid}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Individual Sections ── */}
                    {availableSections.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                {editingGroup ? `Available Sections for type ${mappingMode} (click group pill to add)` : `Individual Sections for type ${mappingMode}`}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableSections.map((s) => {
                                    const id = sectionRowId(s);
                                    const ltp = sectionLTPMap[id];
                                    
                                    const availableGroupsList = getSectionGroupsForMode(id, mappingMode);

                                    return (
                                        <div 
                                            key={id} 
                                            className={`p-5 rounded-2xl border-2 transition-all bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-md font-black text-slate-800 dark:text-slate-100">{id}</h4>
                                                {ltp && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {ltp.L > 0 && <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-[8px] font-black text-sky-600 dark:text-sky-300">L:{ltp.L}</span>}
                                                        {ltp.T > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-[8px] font-black text-amber-600 dark:text-amber-300">T:{ltp.T}</span>}
                                                        {ltp.P > 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-[8px] font-black text-emerald-600 dark:text-emerald-300">P:{ltp.P}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Available Groups</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableGroupsList.map(grp => {
                                                        const isSelected = editingGroup 
                                                            ? editSectionGroups.some(g => g.sectionId === id && g.groupNo === grp)
                                                            : selectedSectionGroups.some(g => g.sectionId === id && g.groupNo === grp);
                                                        
                                                        // Check if this specific group is already in another merge
                                                        const mappingForThisGroup = relatedMappings.find(m => mappingSection(m) === id && mappingGroupNo(m) === grp && (m.mappingType || m.MappingType || "L") === mappingMode);
                                                        const thisGroupMergeCode = mappingForThisGroup?.mergeCode || mappingForThisGroup?.mergecode || mappingForThisGroup?.Mergecode;
                                                        const isInOtherGroup = thisGroupMergeCode && thisGroupMergeCode !== editingGroup;

                                                        return (
                                                            <button
                                                                key={grp ?? 'null'}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!isInOtherGroup) {
                                                                        toggleSectionGroup(id, grp, editingGroup !== null);
                                                                    }
                                                                }}
                                                                disabled={isInOtherGroup}
                                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 cursor-pointer transition-all ${
                                                                    isInOtherGroup 
                                                                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                                                    : isSelected 
                                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                                                        : 'bg-white dark:bg-slate-900 text-primary dark:text-blue-300 border-primary/20 dark:border-blue-800/50 hover:bg-primary/5 hover:border-primary/50'
                                                                }`}
                                                            >
                                                                {grp !== null ? `Grp ${grp}` : `Default`}
                                                            </button>
                                                        );
                                                    })}
                                                    {availableGroupsList.length === 0 && (
                                                        <span className="text-xs text-slate-400 italic">No unmerged groups</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                  </div>
                )}
              </div>

              {/* ── PERSISTENT MERGE ACTION BAR ── */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {editingGroup ? (
                  /* ── Edit Mode Action Bar ── */
                  <div className="glass px-6 py-4 rounded-3xl border border-blue-200 dark:border-blue-800 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl bg-blue-50/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editSectionGroups.length >= 2 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                          Editing {editingGroup} — {editSectionGroups.length} Items
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {editSectionGroups.length >= 2 ? "Ready to update" : "Select at least 2 groups"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleCancelEdit}
                        className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateGroup}
                        disabled={editSectionGroups.length < 2 || updating}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                          editSectionGroups.length >= 2
                            ? "bg-blue-500 text-white shadow-xl hover:scale-105 active:scale-95"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {updating ? "Updating..." : "Update Group"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal Merge/Extend Action Bar ── */
                  <div className="glass px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canMergeOrExtend ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                        <span className="material-symbols-outlined text-xl">{selectedGroup ? "add_circle" : "call_merge"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                          {selectedSectionGroups.length} Groups {selectedGroup ? `+ Merge ${selectedGroup}` : "Selected"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {!selectedCourse ? "Search course first" : canMergeOrExtend ? (selectedGroup ? "Ready to Extend" : "Ready to Merge") : "Pick selections"}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleMerge}
                      disabled={!canMergeOrExtend || merging}
                      className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                          canMergeOrExtend 
                          ? "bg-primary text-white shadow-xl hover:scale-105 active:scale-95" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {merging ? "Processing..." : (selectedGroup ? "Extend Group" : "Merge Now")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPLETED MERGE GROUPS DASHBOARD ── */}
        <div className="mt-12 space-y-6">
          {existingMergeCodes.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">dashboard</span>
                  Dashboard: Merged Sections
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Merge ID</th>
                      <th className="px-6 py-4">Sections Details</th>
                      <th className="px-6 py-4">Faculty</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {existingMergeCodes.map((code) => {
                      const facultyIds = groupFacultyMap[code] ? [...groupFacultyMap[code]] : [];
                      
                      // Find which specific groups are in this merge code
                      const groupsInThisCode = relatedMappings
                        .filter(m => (m.mergeCode ?? m.mergecode ?? m.Mergecode ?? m.MergeCode) === code);
                      
                      const sectionGroupStr = groupsInThisCode.map(m => {
                         const sid = mappingSection(m);
                         const gno = mappingGroupNo(m);
                         const type = m.mappingType || m.MappingType || "L";
                         return `${sid}(${type}${gno !== null ? `-${gno}` : ''})`;
                      }).join(', ');

                      return (
                      <tr key={code} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5 font-mono text-xs font-black text-primary">{code}</td>
                        <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center gap-1 border border-slate-200">
                                    {sectionGroupStr}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                                {facultyIds.map(fid => (
                                    <span key={fid} className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-600">{fid}</span>
                                ))}
                                {facultyIds.length === 0 && <span className="text-[10px] italic text-slate-400">Unassigned</span>}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <button
                              onClick={(e) => handleEditGroup(code, e)}
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all shadow-sm active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              Update
                            </button>
                        </td>
                      </tr>
                    )})}
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
