import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDataRefresh } from '../../context/DataRefreshContext'

import CourseCard from '../common/CourseCard'
import FacultyCard from '../common/FacultyCard'
import RoomCard from '../common/RoomCard'
import SectionCard from '../common/SectionCard'

const ROOM_TYPE_MAP = { 0: 'Lecture Hall', 1: 'Lab', 2: 'Seminar Hall' }

export default function UnscheduledSidebar({ activeTab = 'courses' }) {
  const [courses,   setCourses]   = useState([])
  const [faculties, setFaculties] = useState([])
  const [rooms,     setRooms]     = useState([])
  const [sections,  setSections]  = useState([])
  const [tickets,   setTickets]   = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const { refreshKey, lastRefreshedEntity } = useDataRefresh()

  // Map upload entity type → tab name
  const entityToTab = { course: 'courses', faculty: 'faculties', room: 'rooms', section: 'sections' }

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
    case 'tickets':   rawData = tickets;   break
    default:          rawData = []
  }

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

      {/* Search + Create */}
      <div className='px-3 pt-3 pb-1 flex items-center gap-1.5'>
        <div className='flex-1 relative'>
          <span className='material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none'>
            search
          </span>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${tabLabel.toLowerCase()}…`}
            className='w-full pl-7 pr-2 py-1.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'
          />
        </div>
        <button
          onClick={handleCreate}
          title={`Add new ${activeTab.slice(0, -1)}`}
          className='w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all shrink-0'
        >
          <span className='material-symbols-outlined text-[16px]'>add</span>
        </button>
      </div>

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
              const group    = item.GroupNo    ?? item.groupNo    ?? '?'
              const type     = item.mappingType || item.MappingType || ''
              const lno      = item.LectureNo  ?? item.lectureNo  ?? ''
              const faculty  = item.FacultyUID || item.facultyUID || null
              const merged   = !!(item.MergedCode || item.mergedCode)
              const typeColor = type === 'L' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : type === 'T' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              return (
                <div key={tid}
                  className='p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all cursor-default group'
                >
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-[10px] font-mono font-bold text-primary dark:text-blue-400 truncate leading-none'>{tid}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${typeColor} shrink-0 ml-1`}>{type}{lno}</span>
                  </div>
                  <p className='text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight'>{course}</p>
                  <div className='flex items-center gap-1.5 mt-1'>
                    <span className='text-[10px] text-slate-400 dark:text-slate-500'>§{section}</span>
                    <span className='text-[10px] text-slate-300 dark:text-slate-600'>·</span>
                    <span className='text-[10px] text-slate-400 dark:text-slate-500'>G{group}</span>
                    {merged && (
                      <>
                        <span className='text-[10px] text-slate-300 dark:text-slate-600'>·</span>
                        <span className='text-[10px] font-bold text-purple-500 dark:text-purple-400 flex items-center gap-0.5'>
                          <span className='material-symbols-outlined text-[10px]'>merge</span>merged
                        </span>
                      </>
                    )}
                  </div>
                  <div className='mt-1.5'>
                    {faculty
                      ? <span className='text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded'>{faculty}</span>
                      : <span className='text-[10px] text-slate-400 italic'>No faculty</span>
                    }
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
          {activeTab === 'tickets' ? `${data.length} ticket${data.length !== 1 ? 's' : ''}` : `${data.length} unscheduled`}
        </p>
      </div>
    </aside>
  )
}
