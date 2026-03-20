import React, { useState, useEffect } from "react";

const user = {
  name: "Admin User",
  role: "Registrar",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcnY3nKOP6SKVxPEGvdGuqd_My1t6d_dUIxBLIo8g83xYgdurd8eCInsLN1AliTrb7HxBVg-Q85L0jo7n6Rm6MPO6hmT86RviDaRGBoQcqFiwMSaUgGQf3S8dN5_ZdVda_27icJs7goxJvouCrPD4ieuObpILdKsXVXHMfXNrKRAkhFF2K8F_f2QREYRHUdjnbOLkC1L4zVlgtGWgR1D_uTp4s7k4fXUBWwJy7CO7UdVWZZwbcKu6hJR3HeJQD6cQ-GS3jxrPy2YBe",
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="hidden md:flex flex-col items-end leading-none select-none">
      <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200 tracking-widest">
        {hh}<span className="opacity-50 animate-pulse">:</span>{mm}<span className="opacity-50 animate-pulse">:</span>{ss}
      </span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{dateStr} · IST</span>
    </div>
  );
}

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [isDarkMode]);

  return (
    <header className="h-14 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between px-5 shrink-0 z-20 relative shadow-sm transition-colors duration-300">

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Icon badge */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
          <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>
            calendar_month
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
              UniSched
            </span>
            <span className="text-base font-light text-slate-400 dark:text-slate-500 tracking-tight">
              Timetable
            </span>
          </div>
          <span className="text-[10px] font-semibold text-primary/70 dark:text-blue-400/70 tracking-widest uppercase leading-none mt-0.5">
            University Management System
          </span>
        </div>

        {/* Separator + version pill */}
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
            v1.0
          </span>
        </div>
      </div>

      {/* ── Right side ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">

        {/* Live clock */}
        <LiveClock />

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(p => !p)}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-all border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            {isDarkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User profile */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide leading-tight mt-0.5">
              {user.role}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary/20 dark:border-blue-500/20 shadow-sm group-hover:border-primary/50 dark:group-hover:border-blue-500/50 transition-all shrink-0"
            style={{
              backgroundImage: `url('${user.avatar}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </div>
    </header>
  );
}
