import React, { useMemo } from 'react';

/* ── times: 09:00 → 17:00 ──────────────────────────────────────────────── */
const times = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

/* ── compute the Mon–Sun week that contains `today` ────────────────────── */
function getWeekDays(today = new Date()) {
  // Clone so we don't mutate the original
  const date = new Date(today);
  // getDay(): 0=Sun, 1=Mon … 6=Sat  →  shift so Mon=0
  const jsDay   = date.getDay();              // 0–6, 0=Sunday
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay; // days to go back to Monday
  date.setDate(date.getDate() + mondayOffset);

  const dayNames  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayIds    = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const months    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return dayNames.map((name, i) => {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    const isToday =
      d.getDate()     === today.getDate() &&
      d.getMonth()    === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const isWeekend = i >= 5; // Sat, Sun
    return {
      id:       dayIds[i],
      day:      name,
      date:     `${d.getDate()} ${months[d.getMonth()]}`,
      isToday,
      isWeekend,
    };
  });
}

/* ── grid column template: time col + 7 day cols ──────────────────────── */
const COL_TEMPLATE = "50px repeat(7, 1fr)";

export default function TimetableGrid() {
  const days = useMemo(() => getWeekDays(new Date()), []);

  return (
    <div className="flex-1 overflow-hidden p-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col relative z-0">
      <div className="bg-white dark:bg-slate-800 rounded shadow-soft border border-slate-200 dark:border-slate-700 w-full h-full flex flex-col overflow-hidden relative">

        {/* ── Header Row ──────────────────────────────────────────────── */}
        <div
          className="grid border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 relative z-20"
          style={{ gridTemplateColumns: COL_TEMPLATE }}
        >
          {/* Timezone label */}
          <div className="h-12 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IST</span>
          </div>

          {days.map(d => (
            <div
              key={d.id}
              className={`h-12 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 px-1 transition-colors ${
                d.isToday
                  ? "bg-primary/5 dark:bg-primary/10"
                  : d.isWeekend
                  ? "bg-slate-100/60 dark:bg-slate-800/60"
                  : ""
              }`}
            >
              <span className={`text-xs font-bold leading-tight ${
                d.isToday
                  ? "text-primary dark:text-blue-400"
                  : d.isWeekend
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-slate-700 dark:text-slate-200"
              }`}>
                {d.day}
              </span>
              <span className={`text-[11px] leading-tight mt-0.5 font-medium ${
                d.isToday
                  ? "text-primary/80 dark:text-blue-400/80"
                  : "text-slate-400 dark:text-slate-500"
              }`}>
                {d.isToday ? (
                  <span className="inline-flex items-center gap-1">
                    {d.date}
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-400 inline-block" />
                  </span>
                ) : d.date}
              </span>
            </div>
          ))}
        </div>

        {/* ── Grid Body ───────────────────────────────────────────────── */}
        <div className="flex-1 relative flex flex-col h-full overflow-y-auto">

          {/* Background vertical column lines */}
          <div
            className="absolute inset-0 grid divide-x divide-slate-100 dark:divide-slate-700/50 pointer-events-none z-0"
            style={{ gridTemplateColumns: COL_TEMPLATE }}
          >
            {/* Time gutter */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30" />
            {days.map(d => (
              <div
                key={d.id}
                className={
                  d.isToday
                    ? "bg-primary/[0.03] dark:bg-primary/[0.05]"
                    : d.isWeekend
                    ? "bg-slate-50/80 dark:bg-slate-800/40"
                    : ""
                }
              />
            ))}
          </div>

          {/* Time Rows */}
          <div
            className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/50 relative z-10"
            style={{ display: "grid", gridTemplateRows: `repeat(${times.length}, minmax(56px, 1fr))` }}
          >
            {times.map(time => (
              <div
                key={time}
                className="grid w-full min-h-0 relative"
                style={{ gridTemplateColumns: COL_TEMPLATE }}
              >
                {/* Time label */}
                <div className="flex items-start justify-center pt-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-700/50 relative z-20 select-none">
                  {time}
                </div>

                {/* Day cells */}
                {days.map(d => (
                  <div
                    key={`${d.id}-${time}`}
                    className={`p-0.5 h-full relative z-0 border-r border-slate-100/60 dark:border-slate-700/30 last:border-r-0 ${
                      d.isWeekend ? "opacity-50" : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}