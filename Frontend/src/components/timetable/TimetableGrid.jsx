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

const COL_TEMPLATE = '50px repeat(7, 1fr)';

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
  const faculty   = ticket.FacultyUID  || ticket.facultyUID  || null;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, ticket)}
      onDragEnd={() => clearDraggedTicket()}
      className={`group relative rounded border text-[9px] font-bold cursor-grab active:cursor-grabbing shadow-sm select-none transition-all hover:shadow-md hover:scale-[1.02] overflow-hidden ${bgCard}`}
      title={`${course} · Section ${section} · Group ${group} · ${typeShort} #${lno}${faculty ? ` · ${faculty}` : ''}`}
    >
      {/* Coloured left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

      {/* × remove button — larger, always slightly visible */}
      <button
        onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
        onClick={e => { e.stopPropagation(); onUnschedule(tid); }}
        title="Remove from grid"
        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-slate-500 dark:bg-slate-400 text-white flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all hover:bg-red-500 dark:hover:bg-red-400 hover:scale-110 shadow"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1,'wght' 700" }}>close</span>
      </button>

      <div className="pl-2.5 pr-1.5 py-1.5">
        {/* Course + type badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-[10px] leading-tight">{course}</span>
          <span className={`ml-auto shrink-0 text-[8px] font-bold px-1 rounded ${
            type === 'L' ? 'bg-blue-400 text-white' : type === 'T' ? 'bg-purple-400 text-white' : 'bg-emerald-400 text-white'
          }`}>{typeShort}</span>
        </div>

        {/* Section · Group */}
        <div className="flex items-center gap-1 text-[8px] text-slate-500 dark:text-slate-400 leading-tight mb-0.5">
          <span className="material-symbols-outlined text-[9px]">class</span>
          <span>Sec {section}</span>
          <span className="opacity-40">·</span>
          <span className="material-symbols-outlined text-[9px]">group</span>
          <span>G{group}</span>
          <span className="opacity-40">·</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">#{lno}</span>
        </div>

        {/* Faculty */}
        {faculty && (
          <div className="flex items-center gap-0.5 text-[8px] text-slate-400 truncate leading-tight">
            <span className="material-symbols-outlined text-[9px]">person</span>
            <span className="font-mono">{faculty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimetableGrid() {
  const days = useMemo(() => getWeekDays(new Date()), []);
  const { refreshKey, triggerRefresh } = useDataRefresh();

  // all tickets fetched from backend
  const [tickets, setTickets] = useState([]);
  // dragover cell key for highlight — tracked with enter counter to avoid false leaves
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
        // Normalise time to HH:MM
        const hhmm = String(time).slice(0, 5);
        const key  = `${day}|${hhmm}`;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [tickets]);

  /* ── unscheduled (no Day or Time set) ─────────────────────────────────── */
  const unscheduledCount = useMemo(
    () => tickets.filter(t => !(t.Day || t.day) || !(t.Time || t.time)).length,
    [tickets]
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
      facultyUID: ticket.FacultyUID  || ticket.facultyUID,
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
          {/* Time gutter */}
          <div className="h-12 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IST</span>
          </div>

          {days.map(d => (
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

        {/* Unscheduled count hint */}
        {unscheduledCount > 0 && (
          <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">
            <span className="material-symbols-outlined text-sm">info</span>
            {unscheduledCount} ticket{unscheduledCount !== 1 ? 's' : ''} not yet scheduled — drag from the Tickets panel on the left to place them.
          </div>
        )}

        {/* ── Grid Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 relative flex flex-col h-full overflow-y-auto">

          {/* Background vertical column lines */}
          <div
            className="absolute inset-0 grid divide-x divide-slate-100 dark:divide-slate-700/50 pointer-events-none z-0"
            style={{ gridTemplateColumns: COL_TEMPLATE }}
          >
            <div className="bg-slate-50/50 dark:bg-slate-800/30" />
            {days.map(d => (
              <div key={d.id} className={
                d.isToday    ? 'bg-primary/[0.03] dark:bg-primary/[0.05]'
                : d.isWeekend ? 'bg-slate-50/80 dark:bg-slate-800/40'
                : ''
              } />
            ))}
          </div>

          {/* Time Rows */}
          <div
            className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/50 relative z-10"
            style={{ display: 'grid', gridTemplateRows: `repeat(${TIMES.length}, minmax(72px, 1fr))` }}
          >
            {TIMES.map(time => (
              <div key={time} className="grid w-full min-h-0 relative" style={{ gridTemplateColumns: COL_TEMPLATE }}>

                {/* Time label */}
                <div className="flex items-start justify-center pt-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-700/50 relative z-20 select-none">
                  {time}
                </div>

                {/* Day cells — each is a drop target */}
                {days.map(d => {
                  const key = `${d.id}|${time}`;
                  const cellTickets = slotMap[key] || [];
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
                      } ${isOver ? 'bg-primary/10 dark:bg-primary/15 ring-1 ring-inset ring-primary/30 dark:ring-primary/40' : ''}`}
                    >
                      {/* Drop zone indicator when dragging over */}
                      {isOver && cellTickets.length === 0 && (
                        <div className="absolute inset-1 rounded border-2 border-dashed border-primary/40 dark:border-primary/50 flex items-center justify-center pointer-events-none">
                          <span className="material-symbols-outlined text-primary/50 text-base">add_circle</span>
                        </div>
                      )}

                      {/* Placed ticket cards */}
                      <div className="flex flex-col gap-0.5 p-0.5 h-full overflow-hidden">
                        {cellTickets.map(t => (
                          <GridTicketCard
                            key={t.TicketId || t.ticketId}
                            ticket={t}
                            onDragStart={handleDragStart}
                            onUnschedule={handleUnschedule}
                          />
                        ))}
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