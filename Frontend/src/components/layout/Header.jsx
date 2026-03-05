import React, { useState, useEffect } from "react";
import { user } from "../../data/mockData";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <header className="h-10 bg-surface dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 shrink-0 z-20 relative shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[20px]">school</span>
        </div>
        <h1 className="font-bold text-base tracking-tight text-slate-800 dark:text-white">University Time Table Scheduler</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1"></div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDarkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer ml-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-white">{user.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.role}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm"
            style={{
              backgroundImage: `url('${user.avatar}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      </div>
    </header>
  );
}
