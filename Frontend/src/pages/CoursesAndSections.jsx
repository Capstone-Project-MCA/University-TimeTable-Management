import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDataRefresh } from "../context/DataRefreshContext";
import CourseCard from "../components/common/CourseCard";
import SectionCard from "../components/common/SectionCard";

export default function CoursesAndSections() {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  const { refreshKey, lastRefreshedEntity } = useDataRefresh();

  // ── Fetch courses ───────────────────────────────────────
  const fetchCourses = () => {
    setLoadingCourses(true);
    axios
      .get("http://localhost:8080/course/all")
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoadingCourses(false));
  };

  // ── Fetch sections ──────────────────────────────────────
  const fetchSections = () => {
    setLoadingSections(true);
    axios
      .get("http://localhost:8080/section/all")
      .then((res) => setSections(res.data))
      .catch((err) => console.error("Error fetching sections:", err))
      .finally(() => setLoadingSections(false));
  };

  useEffect(() => {
    fetchCourses();
    fetchSections();
  }, []);

  // Auto-refresh on context change
  useEffect(() => {
    if (refreshKey === 0) return;
    if (!lastRefreshedEntity || lastRefreshedEntity === "course") fetchCourses();
    if (!lastRefreshedEntity || lastRefreshedEntity === "section") fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ── Search filters ──────────────────────────────────────
  const cq = courseSearch.toLowerCase().trim();
  const filteredCourses = cq
    ? courses.filter(
        (c) =>
          (c.courseCode  || c.CourseCode  || "").toLowerCase().includes(cq) ||
          (c.courseTitle || c.CourseTitle || "").toLowerCase().includes(cq)
      )
    : courses;

  const sq = sectionSearch.toLowerCase().trim();
  const filteredSections = sq
    ? sections.filter(
        (s) =>
          (s.sectionId   || s.SectionId   || "").toLowerCase().includes(sq) ||
          (s.programName || s.ProgramName || "").toLowerCase().includes(sq)
      )
    : sections;

  const { triggerRefresh } = useDataRefresh();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalMode,   setModalMode]   = useState('edit');  // 'edit' | 'delete' | 'create'
  const [modalType,   setModalType]   = useState('course'); // 'course' | 'section'
  const [modalEntity, setModalEntity] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError,  setModalError]  = useState(null);
  const [formData,    setFormData]    = useState({});

  function buildCourseForm(item) {
    setFormData({
      courseCode:  item?.courseCode  || item?.CourseCode  || '',
      courseTitle: item?.courseTitle || item?.CourseTitle || '',
      credit:      item?.credit      ?? item?.Credit      ?? '',
      courseType:  item?.courseType  || item?.CourseType  || '',
    });
  }
  function buildSectionForm(item) {
    setFormData({
      sectionId:   item?.sectionId   || item?.SectionId   || '',
      programName: item?.programName || item?.ProgramName || '',
      semester:    item?.semester    ?? item?.Semester    ?? '',
      strength:    item?.strength    ?? item?.Strength    ?? '',
    });
  }

  const handleAddCourse    = () => { setModalType('course');  setModalMode('create'); buildCourseForm(null);  setModalError(null); setModalOpen(true); };
  const handleAddSection   = () => { setModalType('section'); setModalMode('create'); buildSectionForm(null); setModalError(null); setModalOpen(true); };
  const handleEditCourse   = (item) => { setModalType('course');  setModalMode('edit');   buildCourseForm(item);  setModalEntity(item); setModalError(null); setModalOpen(true); };
  const handleDeleteCourse = (item) => { setModalType('course');  setModalMode('delete'); setModalEntity(item); setModalError(null); setModalOpen(true); };
  const handleEditSection  = (item) => { setModalType('section'); setModalMode('edit');   buildSectionForm(item); setModalEntity(item); setModalError(null); setModalOpen(true); };
  const handleDeleteSection= (item) => { setModalType('section'); setModalMode('delete'); setModalEntity(item); setModalError(null); setModalOpen(true); };

  const getEntityId = () => {
    if (modalType === 'course')  return modalEntity?.courseCode  || modalEntity?.CourseCode;
    if (modalType === 'section') return modalEntity?.sectionId   || modalEntity?.SectionId;
    return null;
  };

  const handleSave = async () => {
    setModalSaving(true); setModalError(null);
    try {
      let url, body, method;
      if (modalMode === 'create') {
        method = 'POST';
        if (modalType === 'course') {
          url  = 'http://localhost:8080/course/create';
          body = { courseCode: formData.courseCode, courseTitle: formData.courseTitle, credit: Number(formData.credit), courseType: formData.courseType };
        } else {
          url  = 'http://localhost:8080/section/create';
          body = { sectionId: formData.sectionId, programName: formData.programName, semester: Number(formData.semester), strength: Number(formData.strength) };
        }
      } else {
        method = 'PUT';
        const id = getEntityId();
        if (modalType === 'course') {
          url  = `http://localhost:8080/course/update/${encodeURIComponent(id)}`;
          body = { courseCode: formData.courseCode, courseTitle: formData.courseTitle, credit: Number(formData.credit), courseType: formData.courseType };
        } else {
          url  = `http://localhost:8080/section/update/${encodeURIComponent(id)}`;
          body = { sectionId: formData.sectionId, programName: formData.programName, semester: Number(formData.semester), strength: Number(formData.strength) };
        }
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const txt = await res.text().catch(() => ''); throw new Error(txt || `HTTP ${res.status}`); }
      triggerRefresh(modalType);
      setModalOpen(false);
    } catch (e) { setModalError(e.message); }
    finally { setModalSaving(false); }
  };

  const handleConfirmDelete = async () => {
    setModalSaving(true); setModalError(null);
    const id = getEntityId();
    try {
      const url = modalType === 'course'
        ? `http://localhost:8080/course/delete/code/${encodeURIComponent(id)}`
        : `http://localhost:8080/section/delete/${encodeURIComponent(id)}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) { const txt = await res.text().catch(() => ''); throw new Error(txt || `HTTP ${res.status}`); }
      triggerRefresh(modalType);
      setModalOpen(false);
    } catch (e) { setModalError(e.message); }
    finally { setModalSaving(false); }
  };

  // ── Skeleton loader ─────────────────────────────────────
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', disabled = false }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
        }`}
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6 relative">

      {/* ── CRUD Modal ─────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 ${modalMode === 'delete' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
              <span className={`material-symbols-outlined text-xl ${modalMode === 'delete' ? 'text-red-500' : modalMode === 'create' ? 'text-emerald-500' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {modalMode === 'delete' ? 'delete' : modalMode === 'create' ? 'add_circle' : 'edit'}
              </span>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  {modalMode === 'delete' ? `Delete ${modalType}` : modalMode === 'create' ? `Add ${modalType}` : `Edit ${modalType}`}
                </h3>
                {modalMode !== 'delete' && <p className="text-xs text-slate-400 mt-0.5">All fields required unless marked optional</p>}
              </div>
              <button onClick={() => setModalOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-3">
              {modalMode === 'delete' ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Are you sure you want to delete this {modalType}? This action <strong className="text-red-500">cannot be undone</strong>.
                  </p>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs font-mono text-red-700 dark:text-red-300">
                    {getEntityId()}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {modalType === 'course' && (
                    <>
                      <Field label="Course Code" value={formData.courseCode} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, courseCode: v}))} />
                      <Field label="Course Title" value={formData.courseTitle} onChange={v => setFormData(p => ({...p, courseTitle: v}))} />
                      <Field label="Credits" type="number" value={formData.credit} onChange={v => setFormData(p => ({...p, credit: v}))} />
                      <Field label="Course Type (optional)" value={formData.courseType} onChange={v => setFormData(p => ({...p, courseType: v}))} />
                    </>
                  )}
                  {modalType === 'section' && (
                    <>
                      <Field label="Section ID" value={formData.sectionId} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, sectionId: v}))} />
                      <Field label="Program Name" value={formData.programName} onChange={v => setFormData(p => ({...p, programName: v}))} />
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Semester" type="number" value={formData.semester} onChange={v => setFormData(p => ({...p, semester: v}))} />
                        <Field label="Strength" type="number" value={formData.strength} onChange={v => setFormData(p => ({...p, strength: v}))} />
                      </div>
                    </>
                  )}
                </div>
              )}
              {modalError && (
                <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
              {modalMode === 'delete' ? (
                <button onClick={handleConfirmDelete} disabled={modalSaving} className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {modalSaving ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span>Deleting…</> : <><span className="material-symbols-outlined text-sm">delete</span>Delete</>}
                </button>
              ) : (
                <button onClick={handleSave} disabled={modalSaving} className="flex-1 px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {modalSaving ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span>Saving…</> : <><span className="material-symbols-outlined text-sm">save</span>Save</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            dashboard
          </span>
          Courses &amp; Sections
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your courses and sections from a single view.
        </p>
      </div>

      {/* Two-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─────────────── COURSES PANEL ─────────────── */}
        <section className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                book_2
              </span>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Courses
              </h2>
              <span className="ml-1 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {filteredCourses.length}
              </span>
            </div>
            <button
              id="add-course-btn"
              onClick={handleAddCourse}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Course
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
              <input
                id="course-search"
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search by code or title…"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide max-h-[calc(100vh-320px)]">
            {loadingCourses ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">
                  search_off
                </span>
                <p className="text-xs">
                  {cq ? "No courses match your search" : "No courses available"}
                </p>
              </div>
            ) : (
              filteredCourses.map((item) => {
                const courseCode  = item.courseCode  || item.CourseCode  || ''
                const courseTitle = item.courseTitle || item.CourseTitle || ''
                const credit      = item.credit      ?? item.Credit
                return (
                  <CourseCard
                    key={courseCode}
                    course={courseCode}
                    title={courseTitle}
                    credits={credit}
                    teacher={"TBA"}
                    color="blue"
                    onEdit={() => handleEditCourse(item)}
                    onDelete={() => handleDeleteCourse(item)}
                  />
                )
              })
            )}
          </div>
        </section>

        {/* ─────────────── SECTIONS PANEL ─────────────── */}
        <section className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">
                groups
              </span>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Sections
              </h2>
              <span className="ml-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {filteredSections.length}
              </span>
            </div>
            <button
              id="add-section-btn"
              onClick={handleAddSection}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Section
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
              <input
                id="section-search"
                type="text"
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                placeholder="Search by section ID or program…"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hide max-h-[calc(100vh-320px)]">
            {loadingSections ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">
                  search_off
                </span>
                <p className="text-xs">
                  {sq
                    ? "No sections match your search"
                    : "No sections available"}
                </p>
              </div>
            ) : (
              filteredSections.map((item) => {
                const sectionId   = item.sectionId   || item.SectionId   || ''
                const programName = item.programName || item.ProgramName || ''
                const semester    = item.semester    ?? item.Semester
                const strength    = item.strength    ?? item.Strength
                return (
                  <SectionCard
                    key={sectionId}
                    sectionName={sectionId}
                    course={programName}
                    semester={semester}
                    strength={strength}
                    onEdit={() => handleEditSection(item)}
                    onDelete={() => handleDeleteSection(item)}
                  />
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
