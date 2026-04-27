import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDataRefresh } from '../../context/DataRefreshContext'
import { setDraggedTicket, clearDraggedTicket, setFocusedTicket, subscribeDragStore } from '../../utils/dragStore'

import CourseCard from '../common/CourseCard'
import FacultyCard from '../common/FacultyCard'
import RoomCard from '../common/RoomCard'
import SectionCard from '../common/SectionCard'

const ROOM_TYPE_MAP = { 0: 'Lecture Hall', 1: 'Lab', 2: 'Seminar Hall' }

/* ── Reusable form field used in the CRUD modal ─────────────────────────── */
function Field({ label, value, onChange, type = 'text', disabled = false }) {
  return (
    <div>
      <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1'>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
        }`}
      />
    </div>
  )
}




/* ── Delete-All footer bar (lives in sidebar, replaces navbar button) ─────── */
const DELETE_ALL_CONFIG = {
  courses:   { endpoint: 'course/delete/all',          label: 'All Courses',   entity: 'course'  },
  sections:  { endpoint: 'section/delete/all',         label: 'All Sections',  entity: 'section' },
  faculties: { endpoint: 'faculty/delete/all',         label: 'All Faculties', entity: 'faculty' },
  rooms:     { endpoint: 'room/delete/all',            label: 'All Rooms',     entity: 'room'    },
  tickets:   { endpoint: 'ticket/delete-all-tickets',  label: 'All Tickets',   entity: 'ticket'  },
}

function DeleteAllBar({ activeTab, onDeleted }) {
  const [deleting,    setDeleting]    = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const cfg = DELETE_ALL_CONFIG[activeTab]
  if (!cfg) return null

  const doDelete = async () => {
    setDeleting(true)
    setConfirmOpen(false)
    try {
      const res = await fetch(`http://localhost:8080/${cfg.endpoint}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(`Failed (${res.status})`)
      onDeleted?.(cfg.entity)
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* ── Centered confirm modal ─────────────────────────────────────── */}
      {confirmOpen && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-2xl w-full max-w-sm overflow-hidden'>

            {/* Header */}
            <div className='px-6 py-5 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 flex items-start gap-4'>
              <div className='w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0'>
                <span className='material-symbols-outlined text-red-500 text-2xl' style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
              </div>
              <div className='flex-1'>
                <p className='text-base font-bold text-red-700 dark:text-red-300 leading-tight'>Delete {cfg.label}?</p>
                <p className='text-xs text-red-500/80 dark:text-red-400/70 mt-1'>
                  All {cfg.label.toLowerCase()} will be permanently removed. This action <strong>cannot be undone</strong>.
                </p>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className='text-red-300 hover:text-red-500 transition-colors shrink-0 mt-0.5'
              >
                <span className='material-symbols-outlined text-lg'>close</span>
              </button>
            </div>

            {/* Footer buttons */}
            <div className='px-6 py-4 flex gap-3 bg-slate-50 dark:bg-slate-800/60'>
              <button
                onClick={() => setConfirmOpen(false)}
                className='flex-1 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all'
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className='flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50'
              >
                {deleting
                  ? <><span className='material-symbols-outlined text-base animate-spin'>refresh</span>Deleting…</>
                  : <><span className='material-symbols-outlined text-base'>delete_sweep</span>Delete All</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trigger button in sidebar footer ──────────────────────────── */}
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        className='w-full px-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-200 dark:border-slate-700/60 transition-all disabled:opacity-40'
      >
        <span className='material-symbols-outlined text-[15px]' style={{ fontVariationSettings: "'FILL' 0" }}>
          {deleting ? 'refresh' : 'delete_sweep'}
        </span>
        <span>{deleting ? 'Deleting…' : `Delete ${cfg.label}`}</span>
      </button>
    </>
  )
}

export default function UnscheduledSidebar({
  activeTab = 'courses',
  filterSection = 'All', setFilterSection,
  filterFaculty = 'All', setFilterFaculty,
  filterCourse  = 'All', setFilterCourse,
}) {
  const [courses,   setCourses]   = useState([])
  const [faculties, setFaculties] = useState([])
  const [rooms,     setRooms]     = useState([])
  const [sections,  setSections]  = useState([])
  const [tickets,   setTickets]   = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter panel state (tickets tab)
  const [filterOpen,    setFilterOpen]    = useState(false)

  // Track focused ticket from dragStore for highlight
  const [focusedTicketId, setFocusedTicketId] = useState(null)

  const { refreshKey, lastRefreshedEntity, triggerRefresh } = useDataRefresh()

  // Subscribe to dragStore focused ticket changes
  useEffect(() => {
    const unsub = subscribeDragStore(({ focused }) => {
      setFocusedTicketId(focused?.ticketId ?? null)
    })
    return unsub
  }, [])

  // Map entity type → tab name (used to scope auto-refresh to the right tab)
  const entityToTab = { course: 'courses', faculty: 'faculties', room: 'rooms', section: 'sections', ticket: 'tickets' }

  // Reset all filters when switching tabs
  useEffect(() => {
    setSearchQuery('')
    setFilterOpen(false); setFilterSection?.('All'); setFilterFaculty?.('All'); setFilterCourse?.('All')
  }, [activeTab])

  useEffect(() => {
    setSearchQuery('')

    switch (activeTab) {
      case 'courses':
        axios
          .get('http://localhost:8080/course/all')
          .then((res) => setCourses(res.data))
          .catch((err) => console.error('Error fetching courses:', err))
        break

      case 'faculties':
        axios
          .get('http://localhost:8080/faculty/all')
          .then((res) => setFaculties(res.data))
          .catch((err) => console.error('Error fetching faculties:', err))
        break

      case 'rooms':
        axios
          .get('http://localhost:8080/room/all')
          .then((res) => setRooms(res.data))
          .catch((err) => console.error('Error fetching rooms:', err))
        break

      case 'sections':
        axios
          .get('http://localhost:8080/section/all')
          .then((res) => setSections(res.data))
          .catch((err) => console.error('Error fetching sections:', err))
        break

      case 'tickets':
        axios
          .get('http://localhost:8080/ticket/get-all')
          .then((res) => setTickets(res.data))
          .catch((err) => console.error('Error fetching tickets:', err))
        break

      default:
        break
    }
  }, [activeTab])

  // Auto-refresh when an upload/delete completes for the currently visible tab
  useEffect(() => {
    if (refreshKey === 0) return; // skip initial render
    const affectedTab = lastRefreshedEntity ? entityToTab[lastRefreshedEntity] : null;
    // Refresh if it's a global refresh OR if the affected entity matches this tab
    if (affectedTab && affectedTab !== activeTab) return;

    const fetchers = {
      courses:   () => axios.get('http://localhost:8080/course/all').then(r   => setCourses(r.data)),
      faculties: () => axios.get('http://localhost:8080/faculty/all').then(r => setFaculties(r.data)),
      rooms:     () => axios.get('http://localhost:8080/room/all').then(r   => setRooms(r.data)),
      sections:  () => axios.get('http://localhost:8080/section/all').then(r => setSections(r.data)),
      tickets:   () => axios.get('http://localhost:8080/ticket/get-all').then(r => setTickets(r.data)),
    };
    fetchers[activeTab]?.().catch(err => console.error('Auto-refresh failed:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // ---------- pick raw list ----------
  let rawData = []
  switch (activeTab) {
    case 'courses':   rawData = courses;   break
    case 'faculties': rawData = faculties; break
    case 'rooms':     rawData = rooms;     break
    case 'sections':  rawData = sections;  break
    case 'tickets': {
      // Only unscheduled — then apply dropdown filters
      rawData = tickets.filter(t => !(t.day || t.Day) || !(t.time || t.Time))
      if (filterSection !== 'All') rawData = rawData.filter(t => (t.section || t.Section) === filterSection)
      if (filterFaculty !== 'All') rawData = rawData.filter(t => (t.facultyUid || t.facultyUID || t.FacultyUID) === filterFaculty)
      if (filterCourse  !== 'All') rawData = rawData.filter(t => (t.courseCode || t.coursecode || t.Coursecode) === filterCourse)
      break
    }
    default: rawData = []
  }

  // Derive filter options from ALL tickets (scheduled + unscheduled) so sections never
  // disappear from the dropdown even after all their tickets have been placed on the grid.
  const sectionOptions  = ['All', ...Array.from(new Set(tickets.map(t => t.section  || t.Section  || '').filter(Boolean))).sort()]
  const facultyOptions  = ['All', ...Array.from(new Set(tickets.map(t => t.facultyUid || t.facultyUID || t.FacultyUID || '').filter(Boolean))).sort()]
  const courseOptions   = ['All', ...Array.from(new Set(tickets.map(t => t.courseCode || t.coursecode || t.Coursecode || '').filter(Boolean))).sort()]
  const activeFilterCount = [filterSection, filterFaculty, filterCourse].filter(v => v !== 'All').length

  // ---------- search filter ----------
  const q = searchQuery.toLowerCase().trim()
  const data = q
    ? rawData.filter((item) => {
        switch (activeTab) {
          case 'courses':
            return (
              (item.courseCode  || '').toLowerCase().includes(q) ||
              (item.courseTitle || '').toLowerCase().includes(q)
            )
          case 'faculties':
            return (
              (item.facultyName   || '').toLowerCase().includes(q) ||
              (item.facultyDomain || '').toLowerCase().includes(q)
            )
          case 'rooms':
            return (
              (item.roomNo   || '').toLowerCase().includes(q) ||
              (ROOM_TYPE_MAP[item.roomType] || '').toLowerCase().includes(q)
            )
          case 'sections':
            return (
              (item.sectionId   || '').toLowerCase().includes(q) ||
              (item.programName || '').toLowerCase().includes(q)
            )
          case 'tickets':
            return (
              (item.ticketId   || item.TicketId   || '').toLowerCase().includes(q) ||
              (item.courseCode || item.coursecode || item.Coursecode || '').toLowerCase().includes(q) ||
              (item.section    || item.Section    || '').toLowerCase().includes(q) ||
              (item.facultyUid || item.facultyUID || item.FacultyUID || '').toLowerCase().includes(q)
            )
          default:
            return true
        }
      })
    : rawData

  // ---------- sort: merged tickets first ----------
  if (activeTab === 'tickets') {
    data.sort((a, b) => {
      const aMerged = !!(a.mergedCode || a.MergedCode)
      const bMerged = !!(b.mergedCode || b.MergedCode)
      return (bMerged ? 1 : 0) - (aMerged ? 1 : 0)
    })
  }

  // ---------- CRUD Modal State ----------

  const [modalOpen,    setModalOpen]    = useState(false)
  const [modalMode,    setModalMode]    = useState('edit')   // 'edit' | 'delete' | 'create'
  const [modalEntity,  setModalEntity]  = useState(null)     // the raw item being edited/deleted
  const [modalSaving,  setModalSaving]  = useState(false)
  const [modalError,   setModalError]   = useState(null)

  // Generic form fields state (keyed by entity type)
  const [formData, setFormData] = useState({})

  const openEdit   = (item) => { setModalEntity(item); setModalMode('edit');   buildForm(item); setModalError(null); setModalOpen(true) }
  const openDelete = (item) => { setModalEntity(item); setModalMode('delete'); setModalError(null); setModalOpen(true) }
  const openCreate = ()     => { setModalEntity(null); setModalMode('create'); buildForm(null); setModalError(null); setModalOpen(true) }

  function buildForm(item) {
    switch (activeTab) {
      case 'courses':
        setFormData({
          courseCode:  item?.courseCode  || item?.CourseCode  || '',
          courseTitle: item?.courseTitle || item?.CourseTitle || '',
          credit:      item?.credit      ?? item?.Credit      ?? '',
          courseType:  item?.courseType  || item?.CourseType  || '',
        })
        break
      case 'faculties':
        setFormData({
          facultyUid:    item?.facultyUid    || item?.FacultyUID    || '',
          facultyName:   item?.facultyName   || item?.FacultyName   || '',
          facultyDomain: item?.facultyDomain || item?.FacultyDomain || '',
          currentLoad:   item?.currentLoad   ?? item?.CurrentLoad   ?? 0,
          expectedLoad:  item?.expectedLoad  ?? item?.ExpectedLoad  ?? 0,
        })
        break
      case 'sections':
        setFormData({
          sectionId:   item?.sectionId   || item?.SectionId   || '',
          programName: item?.programName || item?.ProgramName || '',
          semester:    item?.semester    ?? item?.Semester    ?? '',
          strength:    item?.strength    ?? item?.Strength    ?? '',
        })
        break
      case 'rooms':
        setFormData({
          roomNo:          item?.roomNo          || item?.RoomNo          || '',
          seatingCapacity: item?.seatingCapacity ?? item?.SeatingCapacity ?? '',
          roomType:        item?.roomType        ?? item?.RoomType        ?? 0,
          level:           item?.level           ?? item?.Level           ?? '',
          building:        item?.building        || item?.Building        || '',
        })
        break
      default:
        setFormData({})
    }
  }

  const handleEdit   = (item) => openEdit(item)
  const handleDelete = (item) => openDelete(item)
  const handleCreate = ()     => openCreate()

  const getEntityId = (item) => {
    switch (activeTab) {
      case 'courses':   return item?.courseCode  || item?.CourseCode
      case 'faculties': return item?.facultyUid  || item?.FacultyUID
      case 'sections':  return item?.sectionId   || item?.SectionId
      case 'rooms':     return item?.roomNo      || item?.RoomNo
      default:          return null
    }
  }

  const handleSaveEdit = async () => {
    setModalSaving(true)
    setModalError(null)
    const id = getEntityId(modalEntity)
    try {
      let url, body
      switch (activeTab) {
        case 'courses':
          url  = `http://localhost:8080/course/update/${encodeURIComponent(id)}`
          body = { courseCode: formData.courseCode, courseTitle: formData.courseTitle, credit: Number(formData.credit), courseType: formData.courseType }
          break
        case 'faculties':
          url  = `http://localhost:8080/faculty/update/${encodeURIComponent(id)}`
          body = { FacultyUID: formData.facultyUid, FacultyName: formData.facultyName, FacultyDomain: formData.facultyDomain, CurrentLoad: Number(formData.currentLoad), ExpectedLoad: Number(formData.expectedLoad) }
          break
        case 'sections':
          url  = `http://localhost:8080/section/update/${encodeURIComponent(id)}`
          body = { sectionId: formData.sectionId, programName: formData.programName, semester: Number(formData.semester), strength: Number(formData.strength) }
          break
        case 'rooms':
          url  = `http://localhost:8080/room/update/${encodeURIComponent(id)}`
          body = { roomNo: formData.roomNo, seatingCapacity: Number(formData.seatingCapacity), roomType: Number(formData.roomType), level: Number(formData.level), building: formData.building }
          break
        default: return
      }
      const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const txt = await res.text().catch(() => ''); throw new Error(txt || `HTTP ${res.status}`) }
      triggerRefresh(activeTab === 'courses' ? 'course' : activeTab === 'faculties' ? 'faculty' : activeTab === 'sections' ? 'section' : 'room')
      setModalOpen(false)
    } catch (e) {
      setModalError(e.message)
    } finally {
      setModalSaving(false)
    }
  }

  const handleSaveCreate = async () => {
    setModalSaving(true)
    setModalError(null)
    try {
      let url, body
      switch (activeTab) {
        case 'courses':
          url  = `http://localhost:8080/course/create`
          body = { courseCode: formData.courseCode, courseTitle: formData.courseTitle, credit: Number(formData.credit), courseType: formData.courseType }
          break
        case 'faculties':
          url  = `http://localhost:8080/faculty/create`
          body = { FacultyUID: formData.facultyUid, FacultyName: formData.facultyName, FacultyDomain: formData.facultyDomain, CurrentLoad: Number(formData.currentLoad), ExpectedLoad: Number(formData.expectedLoad) }
          break
        case 'sections':
          url  = `http://localhost:8080/section/create`
          body = { sectionId: formData.sectionId, programName: formData.programName, semester: Number(formData.semester), strength: Number(formData.strength) }
          break
        case 'rooms':
          url  = `http://localhost:8080/room/create`
          body = { roomNo: formData.roomNo, seatingCapacity: Number(formData.seatingCapacity), roomType: Number(formData.roomType), level: Number(formData.level), building: formData.building }
          break
        default: return
      }
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const txt = await res.text().catch(() => ''); throw new Error(txt || `HTTP ${res.status}`) }
      triggerRefresh(activeTab === 'courses' ? 'course' : activeTab === 'faculties' ? 'faculty' : activeTab === 'sections' ? 'section' : 'room')
      setModalOpen(false)
    } catch (e) {
      setModalError(e.message)
    } finally {
      setModalSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    setModalSaving(true)
    setModalError(null)
    const id = getEntityId(modalEntity)
    try {
      let url
      switch (activeTab) {
        case 'courses':   url = `http://localhost:8080/course/delete/code/${encodeURIComponent(id)}`; break
        case 'faculties': url = `http://localhost:8080/faculty/delete/${encodeURIComponent(id)}`; break
        case 'sections':  url = `http://localhost:8080/section/delete/${encodeURIComponent(id)}`; break
        case 'rooms':     url = `http://localhost:8080/room/delete/${encodeURIComponent(id)}`; break
        default: return
      }
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) { const txt = await res.text().catch(() => ''); throw new Error(txt || `HTTP ${res.status}`) }
      triggerRefresh(activeTab === 'courses' ? 'course' : activeTab === 'faculties' ? 'faculty' : activeTab === 'sections' ? 'section' : 'room')
      setModalOpen(false)
    } catch (e) {
      setModalError(e.message)
    } finally {
      setModalSaving(false)
    }
  }

  // ---------- label helpers ----------
  const tabLabel =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  return (
    <aside className='w-64 bg-background-light dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative'>

      {/* ── CRUD Modal ───────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden'>

            {/* Modal Header */}
            <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 ${
              modalMode === 'delete'
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-slate-50 dark:bg-slate-800/60'
            }`}>
              <span className={`material-symbols-outlined text-xl ${
                modalMode === 'delete' ? 'text-red-500' : modalMode === 'create' ? 'text-emerald-500' : 'text-primary'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {modalMode === 'delete' ? 'delete' : modalMode === 'create' ? 'add_circle' : 'edit'}
              </span>
              <div>
                <h3 className='font-bold text-slate-800 dark:text-white text-sm'>
                  {modalMode === 'delete' ? `Delete ${tabLabel.slice(0,-1)}` : modalMode === 'create' ? `Add ${tabLabel.slice(0,-1)}` : `Edit ${tabLabel.slice(0,-1)}`}
                </h3>
                {modalMode !== 'delete' && <p className='text-xs text-slate-400 mt-0.5'>All fields required unless marked optional</p>}
              </div>
              <button onClick={() => setModalOpen(false)} className='ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'>
                <span className='material-symbols-outlined text-lg'>close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className='px-6 py-5 space-y-3'>
              {modalMode === 'delete' ? (
                <div className='space-y-3'>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Are you sure you want to delete this {activeTab.slice(0,-1)}?
                    This action <strong className='text-red-500'>cannot be undone</strong>.
                  </p>
                  <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs font-mono text-red-700 dark:text-red-300'>
                    {getEntityId(modalEntity)}
                  </div>
                </div>
              ) : (
                /* Edit / Create Form */
                <div className='space-y-3'>
                  {activeTab === 'courses' && (
                    <>
                      <Field label='Course Code' value={formData.courseCode} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, courseCode: v}))} />
                      <Field label='Course Title' value={formData.courseTitle} onChange={v => setFormData(p => ({...p, courseTitle: v}))} />
                      <Field label='Credits' type='number' value={formData.credit} onChange={v => setFormData(p => ({...p, credit: v}))} />
                      <Field label='Course Type (optional)' value={formData.courseType} onChange={v => setFormData(p => ({...p, courseType: v}))} />
                    </>
                  )}
                  {activeTab === 'faculties' && (
                    <>
                      <Field label='Faculty UID' value={formData.facultyUid} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, facultyUid: v}))} />
                      <Field label='Faculty Name' value={formData.facultyName} onChange={v => setFormData(p => ({...p, facultyName: v}))} />
                      <Field label='Domain / Department' value={formData.facultyDomain} onChange={v => setFormData(p => ({...p, facultyDomain: v}))} />
                      <div className='grid grid-cols-2 gap-2'>
                        <Field label='Current Load' type='number' value={formData.currentLoad} onChange={v => setFormData(p => ({...p, currentLoad: v}))} />
                        <Field label='Expected Load' type='number' value={formData.expectedLoad} onChange={v => setFormData(p => ({...p, expectedLoad: v}))} />
                      </div>
                    </>
                  )}
                  {activeTab === 'sections' && (
                    <>
                      <Field label='Section ID' value={formData.sectionId} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, sectionId: v}))} />
                      <Field label='Program Name' value={formData.programName} onChange={v => setFormData(p => ({...p, programName: v}))} />
                      <div className='grid grid-cols-2 gap-2'>
                        <Field label='Semester' type='number' value={formData.semester} onChange={v => setFormData(p => ({...p, semester: v}))} />
                        <Field label='Strength' type='number' value={formData.strength} onChange={v => setFormData(p => ({...p, strength: v}))} />
                      </div>
                    </>
                  )}
                  {activeTab === 'rooms' && (
                    <>
                      <Field label='Room No' value={formData.roomNo} disabled={modalMode === 'edit'} onChange={v => setFormData(p => ({...p, roomNo: v}))} />
                      <Field label='Building (optional)' value={formData.building} onChange={v => setFormData(p => ({...p, building: v}))} />
                      <div className='grid grid-cols-2 gap-2'>
                        <Field label='Capacity' type='number' value={formData.seatingCapacity} onChange={v => setFormData(p => ({...p, seatingCapacity: v}))} />
                        <Field label='Floor / Level' type='number' value={formData.level} onChange={v => setFormData(p => ({...p, level: v}))} />
                      </div>
                      <div>
                        <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1'>Room Type</label>
                        <select
                          value={formData.roomType}
                          onChange={e => setFormData(p => ({...p, roomType: e.target.value}))}
                          className='w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'
                        >
                          <option value={0}>Lecture Hall</option>
                          <option value={1}>Lab</option>
                          <option value={2}>Seminar Hall</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Error */}
              {modalError && (
                <div className='px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2'>
                  <span className='material-symbols-outlined text-sm shrink-0 mt-0.5'>error</span>
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex gap-3'>
              <button
                onClick={() => setModalOpen(false)}
                className='flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all'
              >Cancel</button>
              {modalMode === 'delete' ? (
                <button
                  onClick={handleConfirmDelete}
                  disabled={modalSaving}
                  className='flex-1 px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50'
                >
                  {modalSaving ? <><span className='material-symbols-outlined text-sm animate-spin'>refresh</span>Deleting…</> : <><span className='material-symbols-outlined text-sm'>delete</span>Delete</>}
                </button>
              ) : (
                <button
                  onClick={modalMode === 'create' ? handleSaveCreate : handleSaveEdit}
                  disabled={modalSaving}
                  className='flex-1 px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50'
                >
                  {modalSaving ? <><span className='material-symbols-outlined text-sm animate-spin'>refresh</span>Saving…</> : <><span className='material-symbols-outlined text-sm'>save</span>Save</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header — same height as DashboardNavbar (h-12 = 48px) so borders align */}
      <div className='h-12 flex items-center px-4 border-b border-slate-200 dark:border-slate-700 bg-surface dark:bg-surface-dark shrink-0'>
        <h2 className='text-xs font-bold uppercase tracking-wider text-slate-500'>
          Unscheduled
        </h2>
        {/* Add button — visible for entity tabs (not tickets) */}
        {activeTab !== 'tickets' && (
          <button
            onClick={handleCreate}
            title={`Add ${tabLabel.slice(0,-1)}`}
            className='ml-auto w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all'
          >
            <span className='material-symbols-outlined text-[16px]' style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          </button>
        )}
      </div>

      {/* Section dropdown REMOVED — now in filter panel below */}

      {/* Search + Filter toggle */}
      <div className='px-3 pt-3 pb-1 flex items-center gap-1.5'>
        <div className='flex-1 relative'>
          <span className='material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none'>search</span>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${tabLabel.toLowerCase()}…`}
            className='w-full pl-7 pr-2 py-1.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'
          />
        </div>
        {/* Filter toggle button — only for tickets tab */}
        {activeTab === 'tickets' && (
          <button
            onClick={() => setFilterOpen(p => !p)}
            title='Filter tickets'
            className={`relative w-7 h-7 flex items-center justify-center rounded border transition-all shrink-0 ${
              filterOpen || activeFilterCount > 0
                ? 'border-primary/50 bg-primary/10 text-primary dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-primary/10 hover:border-primary/30'
            }`}
          >
            <span className='material-symbols-outlined text-[16px]'>tune</span>
            {activeFilterCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center'>
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Collapsible filter panel — tickets tab only */}
      {activeTab === 'tickets' && filterOpen && (
        <div className='px-3 pb-2 space-y-1.5'>
          {/* Section */}
          {[{ label: 'Section', opts: sectionOptions, val: filterSection, set: setFilterSection },
            { label: 'Faculty', opts: facultyOptions,  val: filterFaculty, set: setFilterFaculty },
            { label: 'Course',  opts: courseOptions,   val: filterCourse,  set: setFilterCourse  }
          ].map(({ label, opts, val, set }) => (
            <div key={label} className='relative'>
              <label className='block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 ml-0.5'>{label}</label>
              <select
                value={val}
                onChange={e => set(e.target.value)}
                className='w-full pl-2.5 pr-6 py-1.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer'
              >
                {opts.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>)}
              </select>
              <span className='material-symbols-outlined absolute right-1.5 bottom-[5px] text-slate-400 text-[13px] pointer-events-none'>expand_more</span>
            </div>
          ))}
          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterSection?.('All'); setFilterFaculty?.('All'); setFilterCourse?.('All') }}
              className='w-full text-[10px] font-bold text-red-500 dark:text-red-400 py-1 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-1'
            >
              <span className='material-symbols-outlined text-[12px]'>filter_list_off</span>
              Clear all filters
            </button>
          )}
        </div>
      )}


      {/* Content */}
      <div className='flex-1 overflow-y-auto px-3 pb-3 pt-1 space-y-2 scrollbar-hide'>
        {data.length === 0 && (
          <p className='text-[11px] text-slate-400 text-center py-4'>
            {q ? 'No results found' : `No ${tabLabel.toLowerCase()} available`}
          </p>
        )}
        {data.map((item) => {
          switch (activeTab) {
            case 'courses': {
              const courseCode  = item.courseCode  || item.CourseCode  || ''
              const courseTitle = item.courseTitle || item.CourseTitle || ''
              const credit      = item.credit      ?? item.Credit
              const courseType  = item.courseType  || item.CourseType  || ''
              return (
                <CourseCard
                  key={courseCode}
                  course={courseCode}
                  title={courseTitle}
                  credits={credit}
                  courseType={courseType}
                  color='blue'
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            }
            case 'faculties': {
              const facultyUID    = item.facultyUid    || item.FacultyUID    || ''
              const facultyName   = item.facultyName   || item.FacultyName   || ''
              const facultyDomain = item.facultyDomain || item.FacultyDomain || ''
              const designation   = item.designation   || item.Designation   || ''
              const currentLoad   = item.currentLoad   ?? item.CurrentLoad   ?? 0
              const expectedLoad  = item.expectedLoad  ?? item.ExpectedLoad  ?? 0
              return (
                <FacultyCard
                  key={facultyUID}
                  uid={facultyUID}
                  name={facultyName}
                  department={facultyDomain}
                  designation={designation}
                  currentLoad={currentLoad}
                  expectedLoad={expectedLoad}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            }
            case 'rooms': {
              const roomNo   = item.roomNo          || item.RoomNo          || ''
              const capacity = item.seatingCapacity ?? item.SeatingCapacity
              const rType    = item.roomType        ?? item.RoomType
              const level    = item.level           ?? item.Level
              const building = item.building        || item.Building        || ''
              return (
                <RoomCard
                  key={roomNo}
                  roomNumber={roomNo}
                  capacity={capacity}
                  type={ROOM_TYPE_MAP[rType] || 'Other'}
                  floor={level}
                  building={building}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            }
            case 'sections': {
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
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            }
            case 'tickets': {
              const tid      = item.ticketId   || item.TicketId   || '?'
              const course   = item.courseCode  || item.coursecode || item.Coursecode || '—'
              const section  = item.section     || item.Section    || '—'
              const group    = item.groupNo     ?? item.GroupNo    ?? ''
              const faculty  = item.facultyUid  || item.facultyUID || item.FacultyUID || null
              const merged   = !!(item.mergedCode || item.MergedCode)
              const lno      = item.lectureNo   ?? item.LectureNo  ?? ''
              // mappingType not in TicketDto — extract from TicketId pattern: ...{type}{lno}$
              const typeMatch = String(tid).match(/([LTP])(\d+)$/)
              const typeCode  = item.mappingType || item.MappingType || (typeMatch ? typeMatch[1] : '')
              const typeLabel = { L: 'Lecture', T: 'Tutorial', P: 'Practical' }[typeCode] || typeCode
              const typePill  =
                typeCode === 'L' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : typeCode === 'T' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              const isScheduled = !!((item.day || item.Day) && (item.time || item.Time))
              const scheduledDay  = item.day  || item.Day  || ''
              const scheduledTime = item.time || item.Time || ''
              const scheduledHHMM = String(scheduledTime).slice(0, 5)
              const isFocused = focusedTicketId === tid

              // Build a normalised focused-ticket payload for dragStore
              const focusedPayload = {
                ticketId:   tid,
                facultyUID: faculty,
                courseCode: course,
                section,
                type:       typeCode,
                lectureNo:  lno,
                day:        scheduledDay  || null,
                time:       scheduledHHMM || null,
                isScheduled,
              }

              return (
                <div key={tid}
                  draggable={!isScheduled}
                  onClick={() => setFocusedTicket(focusedPayload)}
                  onDragStart={e => {
                    if (isScheduled) { e.preventDefault(); return; }
                    e.dataTransfer.effectAllowed = 'move'
                    setDraggedTicket({ ticketId: tid, coursecode: course, type: typeCode, lectureNo: lno, section, facultyUID: faculty })
                    // Also focus on drag start so the grid overlay activates
                    setFocusedTicket(focusedPayload)
                    try { e.dataTransfer.setData('text/plain', tid) } catch {}

                    /* ── tiny drag-ghost so the large card doesn't block drop zones ── */
                    const ghost = document.createElement('div')
                    ghost.style.cssText = [
                      'position:fixed', 'top:-200px', 'left:-200px',
                      'display:flex', 'align-items:center', 'gap:5px',
                      'padding:4px 9px', 'border-radius:999px',
                      'font:700 11px/1.2 Inter,sans-serif',
                      'white-space:nowrap', 'pointer-events:none',
                      'box-shadow:0 2px 8px rgba(0,0,0,.25)',
                      typeCode === 'L'
                        ? 'background:#3b82f6;color:#fff;border:2px solid #2563eb'
                        : typeCode === 'T'
                        ? 'background:#8b5cf6;color:#fff;border:2px solid #7c3aed'
                        : 'background:#10b981;color:#fff;border:2px solid #059669',
                    ].join(';')
                    ghost.textContent = `${course}  ·  ${typeCode === 'L' ? 'Lec' : typeCode === 'T' ? 'Tut' : 'Prac'} #${lno}`
                    document.body.appendChild(ghost)
                    e.dataTransfer.setDragImage(ghost, -12, -12)
                    requestAnimationFrame(() => ghost.remove())
                  }}
                  onDragEnd={() => clearDraggedTicket()}
                  className={`rounded-xl border bg-white dark:bg-slate-800 transition-all select-none overflow-hidden relative ${
                    isFocused
                      ? 'ring-2 ring-violet-400 dark:ring-violet-500 border-violet-400 dark:border-violet-500 shadow-lg shadow-violet-200/40 dark:shadow-violet-900/40'
                      : isScheduled
                        ? 'border-emerald-300 dark:border-emerald-700 cursor-default'
                        : 'cursor-grab active:cursor-grabbing group hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-md border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Coloured top stripe — green when scheduled */}
                  <div className={`h-1 w-full ${
                    isScheduled ? 'bg-emerald-400' :
                    typeCode === 'L' ? 'bg-blue-400' : typeCode === 'T' ? 'bg-purple-400' : 'bg-emerald-400'
                  }`} />

                  {/* Scheduled overlay banner */}
                  {isScheduled && (
                    <div className='absolute inset-x-0 bottom-0 bg-emerald-50 dark:bg-emerald-900/30 border-t border-emerald-200 dark:border-emerald-700 px-2.5 py-1 flex items-center gap-1.5 z-10'>
                      <span className='material-symbols-outlined text-[11px] text-emerald-600 dark:text-emerald-400' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className='text-[10px] font-bold text-emerald-700 dark:text-emerald-400'>Scheduled</span>
                      <span className='text-[10px] text-emerald-600 dark:text-emerald-500 font-mono ml-auto'>{scheduledDay} · {scheduledHHMM}</span>
                    </div>
                  )}

                  <div className={`p-2.5 ${isScheduled ? 'pb-8 opacity-60' : ''}`}>
                    {/* Row 1: Course + type pill */}
                    <div className='flex items-start justify-between gap-1 mb-2'>
                      <p className='text-[12px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight'>{course}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase shrink-0 ${typePill}`}>
                        {typeLabel || '—'}
                      </span>
                    </div>

                    {/* Row 2: Section · Group */}
                    <div className='flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1.5'>
                      <span className='flex items-center gap-0.5'>
                        <span className='material-symbols-outlined text-[11px] text-slate-400'>class</span>
                        <span>Section <b className='text-slate-700 dark:text-slate-200 font-semibold'>{section}</b></span>
                      </span>
                      <span className='text-slate-300 dark:text-slate-600'>·</span>
                      <span className='flex items-center gap-0.5'>
                        <span className='material-symbols-outlined text-[11px] text-slate-400'>group</span>
                        <span>Group <b className='text-slate-700 dark:text-slate-200 font-semibold'>{group}</b></span>
                      </span>
                    </div>

                    {/* Row 3: Lecture number */}
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5'>
                        <span className='material-symbols-outlined text-[11px] text-slate-400'>numbers</span>
                        <span>{typeLabel || 'Slot'} <b className='text-slate-700 dark:text-slate-200 font-semibold'>#{lno}</b></span>
                        {merged && (
                          <span className='ml-1.5 flex items-center gap-0.5 text-[9px] font-bold text-purple-500 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-1 rounded-full'>
                            <span className='material-symbols-outlined text-[9px]'>merge</span>Merged
                          </span>
                        )}
                      </span>
                      {/* Drag hint — only for unscheduled */}
                      {!isScheduled && (
                        <span className='material-symbols-outlined text-[13px] text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity'>drag_indicator</span>
                      )}
                    </div>

                    {/* Row 4: Faculty */}
                    <div className='mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1'>
                      <span className='material-symbols-outlined text-[11px] text-slate-400'>person</span>
                      {faculty
                        ? <span className='text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400'>{faculty}</span>
                        : <span className='text-[10px] text-slate-400 italic'>No faculty assigned</span>
                      }
                    </div>
                  </div>
                </div>
              )
            }
            default:
              return null
          }
        })}
      </div>

      {/* Footer — count + Delete All */}
      <div className='border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shrink-0'>
        {/* Count row */}
        <div className='px-3 py-1.5 flex items-center justify-between'>
          <p className='text-[10px] text-slate-400'>
            {activeTab === 'tickets'
              ? `${data.length} unscheduled ticket${data.length !== 1 ? 's' : ''}`
              : `${data.length} item${data.length !== 1 ? 's' : ''}`}
          </p>
          {activeTab === 'tickets' && data.length > 0 && (
            <span className='text-[9px] text-slate-400 italic'>← drag to place</span>
          )}
        </div>
        {/* Delete All row — only for entity tabs */}
        <DeleteAllBar activeTab={activeTab} onDeleted={triggerRefresh} />
      </div>
    </aside>
  )
}
