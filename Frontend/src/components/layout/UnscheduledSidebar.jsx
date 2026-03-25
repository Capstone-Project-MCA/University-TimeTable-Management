import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDataRefresh } from '../../context/DataRefreshContext'
import { setDraggedTicket, clearDraggedTicket } from '../../utils/dragStore'

import CourseCard from '../common/CourseCard'
import FacultyCard from '../common/FacultyCard'
import RoomCard from '../common/RoomCard'
import SectionCard from '../common/SectionCard'

const ROOM_TYPE_MAP = { 0: 'Lecture Hall', 1: 'Lab', 2: 'Seminar Hall' }

export default function UnscheduledSidebar({ activeTab = 'courses', filterSection = 'All', setFilterSection }) {
  const [courses,   setCourses]   = useState([])
  const [faculties, setFaculties] = useState([])
  const [rooms,     setRooms]     = useState([])
  const [sections,  setSections]  = useState([])
  const [tickets,   setTickets]   = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter panel state (tickets tab)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [filterFaculty, setFilterFaculty] = useState('All')
  const [filterCourse,  setFilterCourse]  = useState('All')

  const { refreshKey, lastRefreshedEntity } = useDataRefresh()

  // Map entity type → tab name (used to scope auto-refresh to the right tab)
  const entityToTab = { course: 'courses', faculty: 'faculties', room: 'rooms', section: 'sections', ticket: 'tickets' }

  // Reset all filters when switching tabs
  useEffect(() => {
    setSearchQuery('')
    setFilterOpen(false); setFilterSection?.('All'); setFilterFaculty('All'); setFilterCourse('All')
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
      rawData = tickets.filter(t => !(t.Day || t.day) || !(t.Time || t.time))
      if (filterSection !== 'All') rawData = rawData.filter(t => (t.Section || t.section) === filterSection)
      if (filterFaculty !== 'All') rawData = rawData.filter(t => (t.FacultyUID || t.facultyUID) === filterFaculty)
      if (filterCourse  !== 'All') rawData = rawData.filter(t => (t.Coursecode || t.coursecode) === filterCourse)
      break
    }
    default: rawData = []
  }

  // Derive filter options from ALL unscheduled tickets (irrespective of other filters)
  const unscheduledTickets = tickets.filter(t => !(t.Day || t.day) || !(t.Time || t.time))
  const sectionOptions  = ['All', ...Array.from(new Set(unscheduledTickets.map(t => t.Section  || t.section  || '').filter(Boolean))).sort()]
  const facultyOptions  = ['All', ...Array.from(new Set(unscheduledTickets.map(t => t.FacultyUID || t.facultyUID || '').filter(Boolean))).sort()]
  const courseOptions   = ['All', ...Array.from(new Set(unscheduledTickets.map(t => t.Coursecode || t.coursecode || '').filter(Boolean))).sort()]
  const activeFilterCount = [filterSection, filterFaculty, filterCourse].filter(v => v !== 'All').length

  // ---------- search filter ----------
  const q = searchQuery.toLowerCase().trim()
  const data = q
    ? rawData.filter((item) => {
        switch (activeTab) {
          case 'courses':
            return (
              (item.CourseCode || '').toLowerCase().includes(q) ||
              (item.CourseTitle || '').toLowerCase().includes(q)
            )
          case 'faculties':
            return (
              (item.FacultyName || '').toLowerCase().includes(q) ||
              (item.FacultyDomain || '').toLowerCase().includes(q)
            )
          case 'rooms':
            return (
              (item.RoomNo || '').toLowerCase().includes(q) ||
              (ROOM_TYPE_MAP[item.RoomType] || '').toLowerCase().includes(q)
            )
          case 'sections':
            return (
              (item.SectionId || '').toLowerCase().includes(q) ||
              (item.ProgramName || '').toLowerCase().includes(q)
            )
          case 'tickets':
            return (
              (item.ticketId   || item.TicketId   || '').toLowerCase().includes(q) ||
              (item.Coursecode || item.coursecode || '').toLowerCase().includes(q) ||
              (item.Section    || item.section    || '').toLowerCase().includes(q) ||
              (item.FacultyUID || item.facultyUID || '').toLowerCase().includes(q)
            )
          default:
            return true
        }
      })
    : rawData

  // ---------- action stubs ----------
  const handleCreate = () => {
    console.log(`Create new ${activeTab.slice(0, -1)}`)
  }
  const handleEdit = (item) => {
    console.log('Edit', item)
  }
  const handleDelete = (item) => {
    console.log('Delete', item)
  }

  // ---------- label helpers ----------
  const tabLabel =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  return (
    <aside className='w-64 bg-background-light dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative'>
      {/* Header — same height as DashboardNavbar (h-12 = 48px) so borders align */}
      <div className='h-12 flex items-center px-4 border-b border-slate-200 dark:border-slate-700 bg-surface dark:bg-surface-dark shrink-0'>
        <h2 className='text-xs font-bold uppercase tracking-wider text-slate-500'>
          Unscheduled
        </h2>
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
              onClick={() => { setFilterSection?.('All'); setFilterFaculty('All'); setFilterCourse('All') }}
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
            case 'courses':
              return (
                <CourseCard
                  key={item.CourseCode}
                  course={item.CourseCode}
                  title={item.CourseTitle}
                  credits={item.Credit}
                  teacher={'TBA'}
                  color='blue'
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            case 'faculties':
              return (
                <FacultyCard
                  key={item.FacultyUID}
                  name={item.FacultyName}
                  department={item.FacultyDomain}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            case 'rooms':
              return (
                <RoomCard
                  key={item.RoomNo}
                  roomNumber={item.RoomNo}
                  capacity={item.SeatingCapacity}
                  type={ROOM_TYPE_MAP[item.RoomType] || 'Other'}
                  floor={item.Level}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            case 'sections':
              return (
                <SectionCard
                  key={item.SectionId}
                  sectionName={item.SectionId}
                  course={item.ProgramName}
                  semester={item.Semester}
                  strength={item.Strength}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            case 'tickets': {
              const tid      = item.ticketId   || item.TicketId   || '?'
              const course   = item.Coursecode || item.coursecode || '—'
              const section  = item.Section    || item.section    || '—'
              const group    = item.GroupNo    ?? item.groupNo    ?? ''
              const faculty  = item.FacultyUID || item.facultyUID || null
              const merged   = !!(item.MergedCode || item.mergedCode)
              const lno      = item.LectureNo  ?? item.lectureNo  ?? ''
              // mappingType not in TicketDto — extract from TicketId pattern: ...{type}{lno}$
              const typeMatch = String(tid).match(/([LTP])(\d+)$/)
              const typeCode  = item.mappingType || item.MappingType || (typeMatch ? typeMatch[1] : '')
              const typeLabel = { L: 'Lecture', T: 'Tutorial', P: 'Practical' }[typeCode] || typeCode
              const typePill  =
                typeCode === 'L' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : typeCode === 'T' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              const isScheduled = !!((item.Day || item.day) && (item.Time || item.time))
              const scheduledDay  = item.Day  || item.day  || ''
              const scheduledTime = item.Time || item.time || ''
              const scheduledHHMM = String(scheduledTime).slice(0, 5)
              return (
                <div key={tid}
                  draggable={!isScheduled}
                  onDragStart={e => {
                    if (isScheduled) { e.preventDefault(); return; }
                    e.dataTransfer.effectAllowed = 'move'
                    setDraggedTicket({ ticketId: tid, coursecode: course, type: typeCode, lectureNo: lno, section, facultyUID: faculty })
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
                    isScheduled
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

      {/* Footer */}
      <div className='p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center'>
        <p className='text-[11px] text-slate-400'>
          {activeTab === 'tickets'
            ? `${data.length} unscheduled ticket${data.length !== 1 ? 's' : ''}`
            : `${data.length} unscheduled`}
          {activeTab === 'tickets' && data.length > 0 && (
            <span className='block text-[9px] text-slate-400 mt-0.5'>← drag to place in grid</span>
          )}
        </p>
      </div>
    </aside>
  )
}
