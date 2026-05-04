import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { setDraggedTicket, getDraggedTicket, clearDraggedTicket, setFocusedTicket, clearFocusedTicket, subscribeDragStore } from '../../utils/dragStore';

const API_BASE = 'http://localhost:8080';

/* ── Export helpers ─────────────────────────────────────────────────────── */

// All time slots shown in the grid
const EXPORT_TIMES = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const EXPORT_DAYS  = ['Mon','Tue','Wed','Thu','Fri'];

function buildCellHtml(cellTickets, showSection) {
  if (!cellTickets || cellTickets.length === 0) return '<span style="color:#94a3b8;font-size:11px;">—</span>';
  return cellTickets.map(t => {
    const tid       = t.ticketId || t.TicketId || '';
    const typeMatch = String(tid).match(/([LTP])(\d+)$/);
    const typeCode  = t.mappingType || t.MappingType || (typeMatch ? typeMatch[1] : '');
    const course    = t.courseCode || t.coursecode || t.Coursecode || '—';
    const section   = t.section || t.Section || '';
    const group     = t.groupNo ?? t.GroupNo ?? '';
    const faculty   = t.facultyUid || t.facultyUID || t.FacultyUID || '';
    const lno       = t.lectureNo ?? t.LectureNo ?? '';
    const typeLabel = { L: 'Lecture', T: 'Tutorial', P: 'Practical' }[typeCode] || typeCode;
    const typeShort = { L: 'Lec', T: 'Tut', P: 'Prac' }[typeCode] || typeCode;
    const colors = {
      L: { bg: '#eff6ff', border: '#93c5fd', badge: '#3b82f6', text: '#1e40af' },
      T: { bg: '#f5f3ff', border: '#c4b5fd', badge: '#8b5cf6', text: '#5b21b6' },
      P: { bg: '#f0fdf4', border: '#86efac', badge: '#10b981', text: '#065f46' },
    };
    const c = colors[typeCode] || { bg:'#f8fafc', border:'#cbd5e1', badge:'#64748b', text:'#1e293b' };
    const groupLabel = Number(group) === 0 ? 'All' : group;
    return `
      <div style="
        background:${c.bg};
        border:1.5px solid ${c.border};
        border-radius:8px;
        padding:7px 9px;
        margin-bottom:4px;
        font-family:'Segoe UI',Arial,sans-serif;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-weight:800;font-size:13px;color:#0f172a;letter-spacing:-0.3px;">${course}</span>
          <span style="
            background:${c.badge};color:#fff;
            font-size:9px;font-weight:700;
            padding:2px 6px;border-radius:20px;
            letter-spacing:0.5px;text-transform:uppercase;
          ">${typeShort}</span>
        </div>
        ${showSection ? `<div style="font-size:10px;color:#475569;margin-bottom:2px;"><b>Section:</b> ${section} &nbsp;|&nbsp; <b>Group:</b> ${groupLabel}</div>` : `<div style="font-size:10px;color:#475569;margin-bottom:2px;"><b>Group:</b> ${groupLabel}</div>`}
        <div style="font-size:10px;color:#475569;margin-bottom:2px;"><b>${typeLabel} #</b>${lno}</div>
        ${faculty ? `<div style="font-size:10px;color:${c.text};font-weight:600;">&#128100; ${faculty}</div>` : ''}
      </div>`;
  }).join('');
}

function exportTimetableAsHtml(tickets, filterType, filterValue) {
  const DAY_ORDER = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

  // Filter to scheduled tickets
  let rows = tickets.filter(t => (t.day || t.Day) && (t.time || t.Time));
  if (filterType === 'section' && filterValue && filterValue !== 'All') {
    rows = rows.filter(t => (t.section || t.Section) === filterValue);
  } else if (filterType === 'faculty' && filterValue && filterValue !== 'All') {
    rows = rows.filter(t => (t.facultyUid || t.facultyUID || t.FacultyUID) === filterValue);
  }

  // Detect which days are actually used (for compact export)
  const usedDaySet = new Set(rows.map(t => t.day || t.Day).filter(Boolean));
  const days = EXPORT_DAYS.filter(d => usedDaySet.has(d));
  if (days.length === 0) return; // nothing to export

  // Build lookup: "Day|HH:MM" -> [tickets]
  const slotMap = {};
  rows.forEach(t => {
    const day  = t.day  || t.Day;
    const time = String(t.time || t.Time || '').slice(0, 5);
    const key  = `${day}|${time}`;
    if (!slotMap[key]) slotMap[key] = [];
    slotMap[key].push(t);
  });

  // Detect which time rows have content
  const usedTimeSet = new Set(rows.map(t => String(t.time || t.Time || '').slice(0,5)));
  const times = EXPORT_TIMES.filter(t => usedTimeSet.has(t));

  const label      = filterValue && filterValue !== 'All' ? filterValue : 'All';
  const title      = filterType === 'section' ? `Section: ${label}` : `Faculty: ${label}`;
  const showSection = filterType === 'faculty'; // show section info in cells when viewing by faculty
  const generated  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const dayWidth   = Math.floor(78 / days.length);

  const colHeaders = days.map(d => `
    <th style="
      background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
      color:#fff;font-weight:800;font-size:13px;
      padding:12px 8px;text-align:center;
      border:1px solid #4338ca;
      letter-spacing:0.5px;
    ">${d}</th>
  `).join('');

  const bodyRows = times.map(time => {
    const cells = days.map(day => {
      const cellHtml = buildCellHtml(slotMap[`${day}|${time}`], showSection);
      return `<td style="
        vertical-align:top;padding:8px 7px;
        border:1px solid #e2e8f0;
        background:#ffffff;
        min-width:120px;
      ">${cellHtml}</td>`;
    }).join('');
    return `
      <tr>
        <td style="
          font-weight:700;font-size:12px;color:#374151;
          padding:10px 12px;text-align:center;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          white-space:nowrap;
          vertical-align:middle;
        ">${time}</td>
        ${cells}
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Timetable — ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f1f5f9;
      padding: 28px 20px;
      color: #1e293b;
    }
    @media print {
      body { background: #fff; padding: 10px; }
      .no-print { display: none !important; }
      table { page-break-inside: avoid; }
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 24px 32px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header h1 { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p  { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 4px; }
    .legend {
      display: flex; gap: 14px; flex-wrap: wrap;
      padding: 14px 32px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#475569; }
    .dot { width:10px;height:10px;border-radius:50%; flex-shrink:0; }
    .table-wrap { overflow-x: auto; padding: 20px 24px 28px; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    .print-btn {
      background: linear-gradient(135deg,#4f46e5,#7c3aed);
      color:#fff; border:none; border-radius:8px;
      padding:9px 20px; font-size:13px; font-weight:700;
      cursor:pointer; letter-spacing:0.3px;
      box-shadow:0 2px 8px rgba(79,70,229,0.3);
    }
    .print-btn:hover { opacity:0.9; }
    .footer { text-align:center; color:#94a3b8; font-size:11px; padding:0 0 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>&#128197; University Timetable</h1>
        <p>${filterType === 'section' ? '&#128218; Section' : '&#128100; Faculty'}: <b style="color:#fff">${label}</b> &nbsp;|&nbsp; Generated: ${generated}</p>
      </div>
      <button class="print-btn no-print" onclick="window.print()">&#128438; Print / Save PDF</button>
    </div>
    <div class="legend">
      <span class="legend-item"><span class="dot" style="background:#3b82f6"></span>Lecture</span>
      <span class="legend-item"><span class="dot" style="background:#8b5cf6"></span>Tutorial</span>
      <span class="legend-item"><span class="dot" style="background:#10b981"></span>Practical</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="
              background:#1e293b;color:#94a3b8;
              font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
              padding:10px 8px;text-align:center;
              border:1px solid #334155;
              width:7%;
            ">TIME</th>
            ${colHeaders}
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
    <p class="footer">University Time Table Management System &nbsp;·&nbsp; Exported ${generated}</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `timetable_${filterType}_${label}.html`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ── Export Modal ───────────────────────────────────────────────────────── */
function ExportModal({ tickets, onClose }) {
  const [exportType, setExportType]   = useState('section');
  const [exportValue, setExportValue] = useState('All');

  const scheduledTickets = useMemo(() => tickets.filter(t => (t.day || t.Day) && (t.time || t.Time)), [tickets]);

  const sections = useMemo(() => {
    const s = new Set(scheduledTickets.map(t => t.section || t.Section || '').filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [scheduledTickets]);

  const faculties = useMemo(() => {
    const f = new Set(scheduledTickets.map(t => t.facultyUid || t.facultyUID || t.FacultyUID || '').filter(Boolean));
    return ['All', ...Array.from(f).sort()];
  }, [scheduledTickets]);

  const options = exportType === 'section' ? sections : faculties;
  const handleTypeChange = (type) => { setExportType(type); setExportValue('All'); };

  const scheduledCount = useMemo(() => {
    let rows = scheduledTickets;
    if (exportType === 'section' && exportValue !== 'All') rows = rows.filter(t => (t.section || t.Section) === exportValue);
    else if (exportType === 'faculty' && exportValue !== 'All') rows = rows.filter(t => (t.facultyUid || t.facultyUID || t.FacultyUID) === exportValue);
    return rows.length;
  }, [scheduledTickets, exportType, exportValue]);

  const handleExport = () => { exportTimetableAsHtml(tickets, exportType, exportValue); onClose(); };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center gap-3">
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm leading-tight">Export Timetable</h3>
            <p className="text-white/70 text-xs mt-0.5">Download as HTML timetable grid (open in browser &amp; print)</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Export By</label>
            <div className="grid grid-cols-2 gap-2">
              {[['section','class','Section'],['faculty','person','Faculty']].map(([val, icon, lbl]) => (
                <button
                  key={val}
                  onClick={() => handleTypeChange(val)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    exportType === val
                      ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${exportType === val ? 1 : 0}` }}>{icon}</span>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {exportType === 'section' ? 'Select Section' : 'Select Faculty'}
            </label>
            <div className="relative">
              <select
                value={exportValue}
                onChange={e => setExportValue(e.target.value)}
                className="w-full pl-3 pr-7 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400/60 transition-all appearance-none cursor-pointer"
              >
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${exportType === 'section' ? 'Sections' : 'Faculties'}` : o}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[14px] pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
            scheduledCount > 0
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          }`}>
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {scheduledCount > 0 ? 'check_circle' : 'info'}
            </span>
            <span className="font-semibold">
              {scheduledCount > 0
                ? `${scheduledCount} scheduled slot${scheduledCount !== 1 ? 's' : ''} will be exported`
                : 'No scheduled slots match this filter'}
            </span>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >Cancel</button>
          <button
            onClick={handleExport}
            disabled={scheduledCount === 0}
            className="flex-1 py-2 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            Export Timetable
          </button>
        </div>
      </div>
    </div>
  );
}

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
function GridTicketCard({ ticket, onDragStart, onUnschedule, locked = false }) {
  // mappingType not in TicketDto — extract from TicketId
  const tid  = ticket.ticketId || ticket.TicketId || '';
  const typeMatch = String(tid).match(/([LTP])(\d+)$/);
  const type = ticket.mappingType || ticket.MappingType || (typeMatch ? typeMatch[1] : '');
  const typeShort = { L: 'Lec', T: 'Tut', P: 'Prac' }[type] || type;
  const accentBar = type === 'L' ? 'bg-blue-400' : type === 'T' ? 'bg-purple-400' : 'bg-emerald-400';
  const bgCard    = type === 'L'
    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    : type === 'T'
    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
  const course    = ticket.courseCode  || ticket.Coursecode  || ticket.coursecode  || '—';
  const section   = ticket.section     || ticket.Section     || '—';
  const group     = ticket.groupNo     ?? ticket.GroupNo     ?? '';
  const lno       = ticket.lectureNo   ?? ticket.LectureNo   ?? '';
  const faculty   = ticket.facultyUid  || ticket.facultyUID  || ticket.FacultyUID  || null;
  const hasConflict = ticket._hasConflict || false;

  const isFocused    = ticket._isFocused    || false;
  const overlayDim   = ticket._overlayDim   || false;

  return (
    <div
      draggable={!locked}
      onDragStart={e => { if (locked) { e.preventDefault(); return; } onDragStart(e, ticket); }}
      onDragEnd={() => clearDraggedTicket()}
      className={`group relative rounded border shadow-sm select-none transition-all overflow-visible ${
        locked
          ? 'cursor-default'
          : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02]'
      } ${
        isFocused
          ? 'ring-2 ring-violet-400 dark:ring-violet-500 border-violet-300 dark:border-violet-600 shadow-md shadow-violet-200/40 dark:shadow-violet-900/40 scale-[1.03]'
          : hasConflict
          ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/60'
          : bgCard
      } ${overlayDim && !isFocused ? 'opacity-50' : ''}`}
      title={`${course} · Section ${section} · Group ${group} · ${typeShort} #${lno}${faculty ? ` · ${faculty}` : ''}${
        hasConflict ? ' ⚠ Faculty conflict in this slot!' : ''
      }${locked ? ' (Locked — pre-assigned)' : ''}`}
    >
      {/* Focused/selected ticket badge */}
      {isFocused && !hasConflict && (
        <div className="absolute -top-2 -left-2 z-30 w-5 h-5 rounded-full bg-violet-500 dark:bg-violet-600 flex items-center justify-center shadow"
             title="Selected — viewing faculty availability">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>push_pin</span>
        </div>
      )}

      {/* Conflict warning badge */}
      {hasConflict && (
        <div className="absolute -top-2 -left-2 z-30 w-5 h-5 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow"
             title="Faculty conflict: same faculty assigned at this time slot">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
      )}

      {/* Lock badge — shown when ticket is pre-assigned */}
      {locked && !hasConflict && (
        <div className="absolute -top-2 -right-2 z-30 w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow"
             title="Pre-assigned — this slot is locked">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>lock</span>
        </div>
      )}

      {/* Coloured left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l ${isFocused ? 'bg-violet-400' : hasConflict ? 'bg-amber-400' : locked ? 'bg-emerald-500' : accentBar}`} />

      {/* × remove button — hidden when locked */}
      {!locked && (
        <button
          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
          onClick={e => { e.stopPropagation(); onUnschedule(tid); }}
          title="Remove from grid"
          className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-400 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:bg-red-500 dark:hover:bg-red-400 hover:scale-110 shadow-md"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1,'wght' 900" }}>close</span>
        </button>
      )}

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

export default function TimetableGrid({ filterSection = 'All', filterFaculty = 'All', filterCourse = 'All', exportOpen = false, setExportOpen }) {
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

  // dismiss the unscheduled-count hint banner
  const [dismissedHint, setDismissedHint] = useState(false);

  // ── focused ticket (faculty overlay mode) ──────────────────────────────
  const [focusedTicket, setFocusedTicketState] = useState(null);
  useEffect(() => {
    const unsub = subscribeDragStore(({ focused }) => setFocusedTicketState(focused ?? null));
    return unsub;
  }, []);

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
      const day  = t.day  || t.Day;
      const time = t.time || t.Time;
      if (day && time) {
        if (filterSection !== 'All') {
          const section = t.section || t.Section;
          if (section !== filterSection) return;
        }
        if (filterFaculty !== 'All') {
          const fac = t.facultyUid || t.facultyUID || t.FacultyUID || '';
          if (fac !== filterFaculty) return;
        }
        if (filterCourse !== 'All') {
          const cc = t.courseCode || t.coursecode || t.Coursecode || '';
          if (cc !== filterCourse) return;
        }

        // Normalise time to HH:MM
        const hhmm = String(time).slice(0, 5);
        const key  = `${day}|${hhmm}`;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [tickets, filterSection, filterFaculty, filterCourse]);

  /* ── faculty overlay: slot key → list of that faculty's tickets (all sections) ── */
  const facultyOverlayMap = useMemo(() => {
    if (!focusedTicket?.facultyUID) return {};
    const fac = focusedTicket.facultyUID;
    const map = {};
    tickets.forEach(t => {
      const tFac = t.facultyUid || t.facultyUID || t.FacultyUID;
      if (tFac !== fac) return;
      const day  = t.day  || t.Day;
      const time = t.time || t.Time;
      if (!day || !time) return;
      const hhmm = String(time).slice(0, 5);
      const key  = `${day}|${hhmm}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [focusedTicket, tickets]);

  /* ── faculty conflict detection: slot key → Set of conflicting ticket IDs ── */
  const conflictTicketIds = useMemo(() => {
    const ids = new Set();
    // Use ALL tickets regardless of section filter so cross-section conflicts show
    const fullMap = {};
    tickets.forEach(t => {
      const day  = t.day  || t.Day;
      const time = t.time || t.Time;
      const fac  = t.facultyUid || t.facultyUID || t.FacultyUID;
      if (!day || !time || !fac) return;
      const hhmm = String(time).slice(0, 5);
      const key  = `${fac}|${day}|${hhmm}`;
      if (!fullMap[key]) fullMap[key] = [];
      fullMap[key].push(t.ticketId || t.TicketId);
    });
    Object.values(fullMap).forEach(group => {
      if (group.length > 1) group.forEach(id => ids.add(id));
    });
    return ids;
  }, [tickets]);

  /* ── unscheduled (no Day or Time set) ─────────────────────────────────── */
  const unscheduledCount = useMemo(
    () => tickets.filter(t => {
      if ((t.day || t.Day) && (t.time || t.Time)) return false;
      if (filterSection !== 'All') {
        const section = t.section || t.Section;
        if (section !== filterSection) return false;
      }
      if (filterFaculty !== 'All') {
        const fac = t.facultyUid || t.facultyUID || t.FacultyUID || '';
        if (fac !== filterFaculty) return false;
      }
      if (filterCourse !== 'All') {
        const cc = t.courseCode || t.coursecode || t.Coursecode || '';
        if (cc !== filterCourse) return false;
      }
      return true;
    }).length,
    [tickets, filterSection, filterFaculty, filterCourse]
  );

  /* ── click a grid card → activate faculty overlay ─────────────────────── */
  const handleCardClick = (ticket) => {
    const tid        = ticket.ticketId  || ticket.TicketId;
    const faculty    = ticket.facultyUid || ticket.facultyUID || ticket.FacultyUID || null;
    const course     = ticket.courseCode || ticket.coursecode || ticket.Coursecode || '';
    const section    = ticket.section   || ticket.Section    || '';
    const typeCode   = ticket.mappingType || ticket.MappingType || '';
    const lno        = ticket.lectureNo  ?? ticket.LectureNo  ?? '';
    const day        = ticket.day  || ticket.Day  || null;
    const rawTime    = ticket.time || ticket.Time || null;
    const time       = rawTime ? String(rawTime).slice(0, 5) : null;
    const isScheduled = !!(day && rawTime);
    setFocusedTicket({ ticketId: tid, facultyUID: faculty, courseCode: course, section, type: typeCode, lectureNo: lno, day, time, isScheduled });
  };

  /* ── drag start (from grid cards) ────────────────────────────────────── */
  const handleDragStart = (e, ticket) => {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', ticket.ticketId || ticket.TicketId || ''); } catch {}
    const tid      = ticket.ticketId    || ticket.TicketId;
    const faculty  = ticket.facultyUid  || ticket.facultyUID  || ticket.FacultyUID;
    const course   = ticket.courseCode  || ticket.coursecode  || ticket.Coursecode;
    const section  = ticket.section     || ticket.Section;
    const typeCode = ticket.mappingType || ticket.MappingType || '';
    const lno      = ticket.lectureNo   || ticket.LectureNo;
    const day      = ticket.day  || ticket.Day  || null;
    const rawTime  = ticket.time || ticket.Time || null;
    const time     = rawTime ? String(rawTime).slice(0, 5) : null;
    setDraggedTicket({ ticketId: tid, coursecode: course, type: typeCode, lectureNo: lno, section, facultyUID: faculty });
    // Activate overlay while dragging
    setFocusedTicket({ ticketId: tid, facultyUID: faculty, courseCode: course, section, type: typeCode, lectureNo: lno, day, time, isScheduled: !!(day && rawTime) });
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
      t => (t.ticketId || t.TicketId) !== ticketId
    );
    if (existingInSlot.length > 0) {
      console.info('Drop blocked: slot already occupied');
      return;
    }

    // Optimistic UI update
    setTickets(prev => prev.map(t =>
      (t.ticketId || t.TicketId) === ticketId
        ? { ...t, day, time: `${time}:00` }
        : t
    ));

    try {
      const res = await fetch(`${API_BASE}/ticket/${encodeURIComponent(ticketId)}/schedule`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ day, time }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Schedule failed:', errorText);
        alert(errorText || 'Failed to schedule class. Please try again.');
        fetchTickets(); // revert
      } else {
        triggerRefresh('ticket'); // remove card from sidebar panel
        // If this was the focused ticket, update the overlay position
        if (focusedTicket?.ticketId === ticketId) {
          setFocusedTicket({ ...focusedTicket, day, time, isScheduled: true });
        }
      }
    } catch (err) {
      console.error('Network error during drop:', err);
      alert('Network error during drop. Please try again.');
      fetchTickets();
    }
  };

  /* ── unschedule: remove from grid, return ticket to sidebar panel ────── */
  const handleUnschedule = async (ticketId) => {
    // Optimistic: clear day + time locally
    setTickets(prev => prev.map(t =>
      (t.ticketId || t.TicketId) === ticketId
        ? { ...t, day: null, time: null }
        : t
    ));
    try {
      const res = await fetch(`${API_BASE}/ticket/${encodeURIComponent(ticketId)}/schedule`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ day: null, time: null }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Unschedule failed:', errorText);
        alert(errorText || 'Failed to unschedule class. Please try again.');
        fetchTickets();
      } else {
        triggerRefresh('ticket'); // tell sidebar to re-fetch and re-show this ticket
        // If this was the focused ticket, update overlay to reflect it's now unscheduled
        if (focusedTicket?.ticketId === ticketId) {
          setFocusedTicket({ ...focusedTicket, day: null, time: null, isScheduled: false });
        }
      }
    } catch (err) {
      console.error('Network error during unschedule:', err);
      alert('Network error during unschedule. Please try again.');
      fetchTickets();
    }
  };

  /* ── overlay mode helpers ─────────────────────────────────────────────── */
  const overlayActive   = !!focusedTicket?.facultyUID;
  const focusedFaculty  = focusedTicket?.facultyUID ?? null;
  const focusedTicketId = focusedTicket?.ticketId   ?? null;

  return (
    <div className="flex-1 overflow-hidden p-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative z-0">
      {/* Export Modal */}
      {exportOpen && <ExportModal tickets={tickets} onClose={() => setExportOpen(false)} />}
      <div className={`bg-white dark:bg-slate-800 rounded shadow-soft border w-full h-full flex flex-col overflow-hidden relative transition-all duration-300 ${
        overlayActive
          ? 'border-violet-400 dark:border-violet-600 shadow-lg shadow-violet-200/30 dark:shadow-violet-900/30'
          : 'border-slate-200 dark:border-slate-700'
      }`}>

        {/* ── Faculty overlay banner ──────────────────────────────────────── */}
        {overlayActive && (
          <div className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 border-b border-violet-200 dark:border-violet-700 flex items-center gap-2 shrink-0 animate-pulse-once">
            <span className="material-symbols-outlined text-[14px] text-violet-500 dark:text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">
              Faculty: <span className="font-mono">{focusedFaculty}</span>
            </span>
            {focusedTicket?.section && (
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>class</span>
                Section: <span className="font-mono">{focusedTicket.section}</span>
              </span>
            )}
            {focusedTicket?.courseCode && (
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>book</span>
                {focusedTicket.courseCode}
              </span>
            )}
            <div className="ml-2 flex items-center gap-2 text-[10px] font-semibold flex-wrap">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/80"/> Busy elsewhere</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-400/80"/> Selected slot</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400/60"/> Free slot</span>
            </div>
            <button
              onClick={() => clearFocusedTicket()}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-800/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
              Dismiss
            </button>
          </div>
        )}

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
        {unscheduledCount > 0 && !dismissedHint && (
          <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-[13px] text-amber-500 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              {unscheduledCount} unscheduled ticket{unscheduledCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-amber-500/70 dark:text-amber-500/60">— drag from Tickets panel to place</span>
            <button
              onClick={() => setDismissedHint(true)}
              title="Dismiss"
              className="ml-auto flex items-center justify-center w-5 h-5 rounded-full text-amber-500/60 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
            </button>
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

                  // ── Faculty overlay cell classification ────────────────
                  // isFocusedSlot: the focused ticket itself lives here
                  const isFocusedSlot = overlayActive && focusedTicket?.day === d.id && focusedTicket?.time === time;
                  // isFacultyBusy: the focused faculty has a DIFFERENT ticket here
                  const overlayTicketsHere = overlayActive ? (facultyOverlayMap[key] || []) : [];
                  const isFacultyBusy = overlayActive && overlayTicketsHere.length > 0 && !isFocusedSlot;
                  // isFacultyFree: overlay active, faculty has no class here (and not the focused slot)
                  const isFacultyFree = overlayActive && !isFocusedSlot && !isFacultyBusy;

                  return (
                    <div
                      key={key}
                      onDragEnter={e => handleDragEnter(e, key)}
                      onDragOver={handleDragOver}
                      onDragLeave={e => handleDragLeave(e, key)}
                      onDrop={e => handleDrop(e, d.id, time)}
                      className={`p-0.5 h-full relative z-0 border-r border-slate-100/60 dark:border-slate-700/30 last:border-r-0 transition-all duration-200 ${
                        d.isWeekend ? 'opacity-60' : ''
                      } ${
                        isFocusedSlot  ? 'bg-violet-50/80 dark:bg-violet-900/20' :
                        isFacultyBusy  ? 'bg-amber-50/70  dark:bg-amber-900/15' :
                        isFacultyFree  ? 'bg-emerald-50/60 dark:bg-emerald-900/10' :
                        ''
                      }`}
                    >
                      {/* ── Faculty overlay cell tint (behind cards) ─────── */}
                      {overlayActive && !isOver && (
                        <div className={`absolute inset-0 pointer-events-none z-0 rounded transition-all duration-200 ${
                          isFocusedSlot ? 'ring-2 ring-inset ring-violet-400/50 dark:ring-violet-500/50' :
                          isFacultyBusy ? 'ring-2 ring-inset ring-amber-700/80 dark:ring-amber-400/60' :
                          isFacultyFree ? 'ring-1 ring-inset ring-emerald-300/40 dark:ring-emerald-700/30' :
                          ''
                        }`} />
                      )}

                      {/* ── Faculty-free slot hint (shown when no tickets here) ─ */}
                      {isFacultyFree && !isOccupied && !isOver && (
                        <div className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center">
                          <span className="text-[8px] font-bold text-emerald-500/60 dark:text-emerald-400/40 uppercase tracking-wide">free</span>
                        </div>
                      )}

                      {/* ── Faculty-busy badge (no ticket from this section here) ─ */}
                      {isFacultyBusy && !isOccupied && !isOver && (
                        <div className="absolute inset-0 z-5 pointer-events-none flex flex-col items-center justify-center gap-0.5 px-1">
                          <span className="material-symbols-outlined text-amber-400/70 dark:text-amber-500/60" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>event_busy</span>
                          <span className="text-[8px] font-bold text-amber-600/70 dark:text-amber-400/60 text-center leading-tight">
                            {overlayTicketsHere[0] ? (
                              (overlayTicketsHere[0].courseCode || overlayTicketsHere[0].Coursecode || '') + ' · Sec ' +
                              (overlayTicketsHere[0].section    || overlayTicketsHere[0].Section    || '')
                            ) : 'Busy'}
                          </span>
                        </div>
                      )}

                      {/* ── Full-cell drop overlay — always on top of cards ── */}
                      {isOver && (
                        <div className={`absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center gap-1 rounded transition-all ${
                          isOccupied
                            ? 'bg-red-500/20 dark:bg-red-500/30 ring-2 ring-inset ring-red-400/70'
                            : isFacultyBusy
                            ? 'bg-amber-400/25 dark:bg-amber-500/20 ring-2 ring-inset ring-amber-400/70'
                            : 'bg-primary/20 dark:bg-primary/25 ring-2 ring-inset ring-primary/60'
                        }`}>
                          {isOccupied ? (
                            <>
                              <span className="material-symbols-outlined text-red-500 dark:text-red-400" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>block</span>
                              <span className="text-[9px] font-bold text-red-600 dark:text-red-400 text-center leading-tight px-1">Slot occupied</span>
                            </>
                          ) : isFacultyBusy ? (
                            <>
                              <span className="material-symbols-outlined text-amber-500 dark:text-amber-400" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>warning</span>
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 text-center leading-tight px-1">Faculty busy!</span>
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
                      <div className="flex flex-col gap-0.5 p-0.5 h-full overflow-hidden relative z-10">
                        {cellTickets.map(t => {
                          const tid = t.ticketId || t.TicketId;
                          const isTheFocused = overlayActive && tid === focusedTicketId;
                          return (
                            <div key={tid} onClick={() => handleCardClick(t)} className="cursor-pointer">
                              <GridTicketCard
                                ticket={{
                                  ...t,
                                  _hasConflict: conflictTicketIds.has(tid),
                                  _isFocused:   isTheFocused,
                                  _overlayDim:  overlayActive && !isTheFocused,
                                }}
                                locked={false}
                                onDragStart={handleDragStart}
                                onUnschedule={handleUnschedule}
                              />
                            </div>
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