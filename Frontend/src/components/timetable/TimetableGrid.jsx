import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { setDraggedTicket, getDraggedTicket, clearDraggedTicket } from '../../utils/dragStore';

const API_BASE = 'http://localhost:8080';

/* ── times: 09:00 → 17:00 ──────────────────────────────────────────────── */
const TIMES = [
  '09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00',
];

/* ── day ids (canonical keys stored in DB) ─────────────────────────────── */
const DAY_IDS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ── compute the Mon–Sun week that contains `today` ─────────────────────── */
function getWeekDays(today = new Date()) {
  const date = new Date(today);
  const jsDay = date.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  date.setDate(date.getDate() + mondayOffset);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return DAY_IDS.map((day, i) => {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    return {
      id:       day,
      day,
      date:     `${d.getDate()} ${months[d.getMonth()]}`,
      isToday:  d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear(),
      isWeekend: i >= 5,
    };
  });
}

/* ── COL_TEMPLATE is computed dynamically based on showWeekends ──────────── */
const buildColTemplate = (showWeekends) =>
  showWeekends ? '50px repeat(7, 1fr)' : '50px repeat(5, 1fr)';

/* ── type → colour ─────────────────────────────────────────────────────── */
function typeColor(type) {
  if (type === 'L') return 'bg-blue-500 border-blue-600';
  if (type === 'T') return 'bg-purple-500 border-purple-600';
  return 'bg-emerald-500 border-emerald-600';
}
function typeBg(type) {
  if (type === 'L') return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  if (type === 'T') return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
  return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
}

/* ── mini ticket card displayed inside a grid cell ─────────────────────── */
function GridTicketCard({ ticket, onDragStart, onUnschedule }) {
  // mappingType not in TicketDto — extract from TicketId
  const tid  = ticket.TicketId || ticket.ticketId || '';
  const typeMatch = String(tid).match(/([LTP])(\d+)$/);
  const type = ticket.mappingType || ticket.MappingType || (typeMatch ? typeMatch[1] : '');
  const typeShort = { L: 'Lec', T: 'Tut', P: 'Prac' }[type] || type;
  const accentBar = type === 'L' ? 'bg-blue-400' : type === 'T' ? 'bg-purple-400' : 'bg-emerald-400';
  const bgCard    = type === 'L'
    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    : type === 'T'
    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
  const course    = ticket.Coursecode  || ticket.coursecode  || '—';
  const section   = ticket.Section     || ticket.section     || '—';
  const group     = ticket.GroupNo     ?? ticket.groupNo     ?? '';
  const lno       = ticket.LectureNo   ?? ticket.lectureNo   ?? '';
  const faculty   = ticket.FacultyUID  || ticket.facultyUID || ticket.facultyUid  || null;
  const hasConflict = ticket._hasConflict || false;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, ticket)}
      onDragEnd={() => clearDraggedTicket()}
      className={`group relative rounded border cursor-grab active:cursor-grabbing shadow-sm select-none transition-all hover:shadow-md hover:scale-[1.02] overflow-visible ${
        hasConflict
          ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/60'
          : bgCard
      }`}
      title={`${course} · Section ${section} · Group ${group} · ${typeShort} #${lno}${faculty ? ` · ${faculty}` : ''}${
        hasConflict ? ' ⚠ Faculty conflict in this slot!' : ''
      }`}
    >
      {/* Conflict warning badge */}
      {hasConflict && (
        <div className="absolute -top-2 -left-2 z-30 w-5 h-5 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow"
             title="Faculty conflict: same faculty assigned at this time slot">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
      )}

      {/* Coloured left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l ${hasConflict ? 'bg-amber-400' : accentBar}`} />

      {/* × remove button */}
      <button
        onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
        onClick={e => { e.stopPropagation(); onUnschedule(tid); }}
        title="Remove from grid"
        className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-400 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:bg-red-500 dark:hover:bg-red-400 hover:scale-110 shadow-md"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1,'wght' 900" }}>close</span>
      </button>

      <div className="pl-3 pr-2 py-1.5">
        {/* Row 1 — Course code (large) + type pill */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-black text-slate-900 dark:text-white text-[13px] leading-none tracking-tight truncate">{course}</span>
          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
            type === 'L' ? 'bg-blue-500 text-white' : type === 'T' ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'
          }`}>{typeShort}</span>
        </div>

        {/* Row 2 — Section / Group (with labels) */}
        <div className="flex items-center gap-1.5 leading-none mb-0.5 flex-wrap">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sec</span>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">{section}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Group</span>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">{Number(group) === 0 ? 'All' : group}</span>
        </div>

        {/* Row 3 — Slot number with type-aware label */}
        <div className="flex items-center gap-1 leading-none mb-0.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {type === 'L' ? 'Lecture' : type === 'T' ? 'Tutorial' : 'Practical'} No.
          </span>
          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">{lno}</span>
        </div>

        {/* Row 4 — Faculty with label */}
        {faculty && (
          <div className="mt-0.5 flex items-center gap-1 truncate">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">Faculty:</span>
            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{faculty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimetableGrid({ filterSection = 'All' }) {
  const days        = useMemo(() => getWeekDays(new Date()), []);
  const { refreshKey, triggerRefresh } = useDataRefresh();

  // weekend toggle
  const [showWeekends, setShowWeekends] = useState(false);
  const COL_TEMPLATE = buildColTemplate(showWeekends);
  const visibleDays  = showWeekends ? days : days.filter(d => !d.isWeekend);

  // all tickets fetched from backend
  const [tickets, setTickets] = useState([]);
  // dragover cell key for highlight
  const [dragOverKey, setDragOverKey] = useState(null);
  const dragEnterCounters = useRef({});

  /* ── fetch all tickets ─────────────────────────────────────────────────── */
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ticket/get-all`);
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error('Failed to load tickets:', e); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { if (refreshKey > 0) fetchTickets(); }, [refreshKey, fetchTickets]);

  /* ── build lookup: "Day|Time" → [ticket, ...] ──────────────────────────── */
  const slotMap = useMemo(() => {
    const map = {};
    tickets.forEach(t => {
      const day  = t.Day  || t.day;
      const time = t.Time || t.time;
      if (day && time) {
        if (filterSection !== 'All') {
          const section = t.Section || t.section;
          if (section !== filterSection) return;
        }

        // Normalise time to HH:MM
        const hhmm = String(time).slice(0, 5);
        const key  = `${day}|${hhmm}`;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [tickets, filterSection]);

  /* ── faculty conflict detection: slot key → Set of conflicting ticket IDs ── */
  const conflictTicketIds = useMemo(() => {
    const ids = new Set();
    // Use ALL tickets regardless of section filter so cross-section conflicts show
    const fullMap = {};
    tickets.forEach(t => {
      const day  = t.Day  || t.day;
      const time = t.Time || t.time;
      const fac  = t.FacultyUID || t.facultyUID || t.facultyUid;
      if (!day || !time || !fac) return;
      const hhmm = String(time).slice(0, 5);
      const key  = `${fac}|${day}|${hhmm}`;
      if (!fullMap[key]) fullMap[key] = [];
      fullMap[key].push(t.TicketId || t.ticketId);
    });
    Object.values(fullMap).forEach(group => {
      if (group.length > 1) group.forEach(id => ids.add(id));
    });
    return ids;
  }, [tickets]);

  /* ── unscheduled (no Day or Time set) ─────────────────────────────────── */
  const unscheduledCount = useMemo(
    () => tickets.filter(t => {
      if ((t.Day || t.day) && (t.Time || t.time)) return false;
      if (filterSection !== 'All') {
        const section = t.Section || t.section;
        if (section !== filterSection) return false;
      }
      return true;
    }).length,
    [tickets, filterSection]
  );

  /* ── drag start (from grid cards) ────────────────────────────────────── */
  const handleDragStart = (e, ticket) => {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', ticket.TicketId || ticket.ticketId || ''); } catch {}
    setDraggedTicket({
      ticketId:   ticket.TicketId    || ticket.ticketId,
      coursecode: ticket.Coursecode  || ticket.coursecode,
      type:       ticket.mappingType || ticket.MappingType || '',
      lectureNo:  ticket.LectureNo   || ticket.lectureNo,
      section:    ticket.Section     || ticket.section,
      facultyUID: ticket.FacultyUID  || ticket.facultyUID || ticket.facultyUid,
    });
  };

  /* ── drag over a cell (just preventDefault to allow drop) ──────────────── */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /* ── drag enter: counter-based so child elements don't trigger false leave ─ */
  const handleDragEnter = (e, key) => {
    e.preventDefault();
    dragEnterCounters.current[key] = (dragEnterCounters.current[key] || 0) + 1;
    setDragOverKey(key);
  };

  /* ── drag leave: only clear highlight when truly leaving the cell ────────── */
  const handleDragLeave = (e, key) => {
    dragEnterCounters.current[key] = (dragEnterCounters.current[key] || 1) - 1;
    if (dragEnterCounters.current[key] <= 0) {
      dragEnterCounters.current[key] = 0;
      setDragOverKey(prev => prev === key ? null : prev);
    }
  };

  /* ── drop into a cell ───────────────────────────────────────────────────── */
  const handleDrop = async (e, day, time) => {
    e.preventDefault();
    // Reset counters for this cell
    const key = `${day}|${time}`;
    dragEnterCounters.current[key] = 0;
    setDragOverKey(null);

    // Read from reliable module store first, fall back to dataTransfer
    const data = getDraggedTicket();
    clearDraggedTicket();

    const ticketId = data?.ticketId;
    if (!ticketId) {
      console.warn('Drop: no ticket data found in dragStore');
      return;
    }

    // ── Block drop if cell is already occupied by a DIFFERENT ticket ──────
    const existingInSlot = (slotMap[key] || []).filter(
      t => (t.TicketId || t.ticketId) !== ticketId
    );
    if (existingInSlot.length > 0) {
      console.info('Drop blocked: slot already occupied');
      return;
    }

    // Optimistic UI update
    setTickets(prev => prev.map(t =>
      (t.TicketId || t.ticketId) === ticketId
        ? { ...t, Day: day, day, Time: `${time}:00`, time: `${time}:00` }
        : t
    ));

    try {
      const res = await fetch(`${API_BASE}/ticket/${encodeURIComponent(ticketId)}/schedule`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ day, time }),
      });
      if (!res.ok) {
        console.error('Schedule failed:', await res.text());
        fetchTickets(); // revert
      } else {
        triggerRefresh('ticket'); // remove card from sidebar panel
      }
    } catch (err) {
      console.error('Network error during drop:', err);
      fetchTickets();
    }
  };

  /* ── unschedule: remove from grid, return ticket to sidebar panel ────── */
  const handleUnschedule = async (ticketId) => {
    // Optimistic: clear Day + Time locally
    setTickets(prev => prev.map(t =>
      (t.TicketId || t.ticketId) === ticketId
        ? { ...t, Day: null, day: null, Time: null, time: null }
        : t
    ));
    try {
      const res = await fetch(`${API_BASE}/ticket/${encodeURIComponent(ticketId)}/schedule`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ day: null, time: null }),
      });
      if (!res.ok) {
        console.error('Unschedule failed:', await res.text());
        fetchTickets();
      } else {
        triggerRefresh('ticket'); // tell sidebar to re-fetch and re-show this ticket
      }
    } catch (err) {
      console.error('Network error during unschedule:', err);
      fetchTickets();
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative z-0">
      <div className="bg-white dark:bg-slate-800 rounded shadow-soft border border-slate-200 dark:border-slate-700 w-full h-full flex flex-col overflow-hidden relative">

        {/* ── Header Row + unscheduled badge ────────────────────────────── */}
        <div
          className="grid border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 relative z-20"
          style={{ gridTemplateColumns: COL_TEMPLATE }}
        >
          {/* Time gutter — also shows active section badge */}
          <div className="h-12 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-0.5 bg-slate-100/50 dark:bg-slate-800 px-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">IST</span>
            {filterSection !== 'All' ? (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500 dark:bg-indigo-600 text-white leading-none tracking-wide truncate max-w-full">
                {filterSection}
              </span>
            ) : (
              <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wide">ALL</span>
            )}
            {/* Weekend toggle */}
            <button
              onClick={() => setShowWeekends(s => !s)}
              title={showWeekends ? 'Hide weekends' : 'Show weekends'}
              className={`mt-0.5 text-[7px] font-bold px-1 py-px rounded leading-none transition-colors ${
                showWeekends
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {showWeekends ? 'SAT–SUN ✓' : 'SAT–SUN'}
            </button>
          </div>

          {visibleDays.map(d => (
            <div
              key={d.id}
              className={`h-12 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 px-1 transition-colors ${
                d.isToday    ? 'bg-primary/5 dark:bg-primary/10'
                : d.isWeekend ? 'bg-slate-100/60 dark:bg-slate-800/60'
                : ''
              }`}
            >
              <span className={`text-xs font-bold leading-tight ${
                d.isToday    ? 'text-primary dark:text-blue-400'
                : d.isWeekend ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-700 dark:text-slate-200'
              }`}>{d.day}</span>
              <span className={`text-[11px] leading-tight mt-0.5 font-medium ${
                d.isToday ? 'text-primary/80 dark:text-blue-400/80' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {d.isToday
                  ? <span className="inline-flex items-center gap-1">{d.date}<span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-400 inline-block" /></span>
                  : d.date}
              </span>
            </div>
          ))}
        </div>

        {/* Unscheduled count hint — compact single-line pill */}
        {unscheduledCount > 0 && (
          <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-[13px] text-amber-500 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              {unscheduledCount} unscheduled ticket{unscheduledCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-amber-500/70 dark:text-amber-500/60">— drag from Tickets panel to place</span>
          </div>
        )}

        {/* ── Grid Body ─────────────────────────────────────────────────── */}
        {/* flex-1 alone controls height — h-full was causing over-sizing */}
        <div className="flex-1 min-h-0 relative flex flex-col overflow-y-auto">

          {/* Background vertical column lines */}
          <div
            className="absolute inset-0 grid divide-x divide-slate-100 dark:divide-slate-700/50 pointer-events-none z-0"
            style={{ gridTemplateColumns: COL_TEMPLATE }}
          >
            <div className="bg-slate-50/50 dark:bg-slate-800/30" />
            {visibleDays.map(d => (
              <div key={d.id} className={
                d.isToday    ? 'bg-primary/[0.03] dark:bg-primary/[0.05]'
                : d.isWeekend ? 'bg-slate-50/80 dark:bg-slate-800/40'
                : ''
              } />
            ))}
          </div>

          {/* Time Rows — pure 1fr so all slots share available height with no scroll */}
          <div
            className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/50 relative z-10"
            style={{ display: 'grid', gridTemplateRows: `repeat(${TIMES.length}, 1fr)` }}
          >
            {TIMES.map(time => (
              <div key={time} className="grid w-full min-h-0 relative" style={{ gridTemplateColumns: COL_TEMPLATE }}>

                {/* Time label */}
                <div className="flex items-start justify-center pt-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-700/50 relative z-20 select-none">
                  {time}
                </div>

                {/* Day cells — each is a drop target */}
                {visibleDays.map(d => {
                  const key = `${d.id}|${time}`;
                  const cellTickets = slotMap[key] || [];
                  const isOccupied = cellTickets.length > 0;
                  const isOver = dragOverKey === key;
                  return (
                    <div
                      key={key}
                      onDragEnter={e => handleDragEnter(e, key)}
                      onDragOver={handleDragOver}
                      onDragLeave={e => handleDragLeave(e, key)}
                      onDrop={e => handleDrop(e, d.id, time)}
                      className={`p-0.5 h-full relative z-0 border-r border-slate-100/60 dark:border-slate-700/30 last:border-r-0 transition-colors ${
                        d.isWeekend ? 'opacity-60' : ''
                      }`}
                    >
                      {/* ── Full-cell drop overlay — always on top of cards ── */}
                      {isOver && (
                        <div className={`absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center gap-1 rounded transition-all ${
                          isOccupied
                            ? 'bg-red-500/20 dark:bg-red-500/30 ring-2 ring-inset ring-red-400/70'
                            : 'bg-primary/20 dark:bg-primary/25 ring-2 ring-inset ring-primary/60'
                        }`}>
                          {isOccupied ? (
                            <>
                              <span className="material-symbols-outlined text-red-500 dark:text-red-400" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>block</span>
                              <span className="text-[9px] font-bold text-red-600 dark:text-red-400 text-center leading-tight px-1">Slot occupied</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-primary dark:text-blue-400" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                              <span className="text-[9px] font-bold text-primary dark:text-blue-400">Drop here</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Placed ticket cards */}
                      <div className="flex flex-col gap-0.5 p-0.5 h-full overflow-hidden">
                        {cellTickets.map(t => {
                          const tid = t.TicketId || t.ticketId;
                          return (
                            <GridTicketCard
                              key={tid}
                              ticket={{ ...t, _hasConflict: conflictTicketIds.has(tid) }}
                              onDragStart={handleDragStart}
                              onUnschedule={handleUnschedule}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}