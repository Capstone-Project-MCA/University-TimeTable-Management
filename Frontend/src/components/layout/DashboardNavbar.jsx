import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-between items-center gap-1.5 rounded-md bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors"
        >
          {label}
          <span 
            className="material-symbols-outlined text-[16px] leading-none transition-transform duration-200" 
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-36 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none overflow-hidden">
          <div className="py-1">
            <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">add</span> Create
            </button>
            <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-500 transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">edit</span> Update
            </button>
            <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">delete</span> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DashboardNavbar() {
  return (
    <div className="h-12 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4 shadow-sm z-10 shrink-0 relative transition-colors duration-300">
      <Dropdown label="Section" />
      <Dropdown label="Course" />
      <Dropdown label="Faculty" />
      <Dropdown label="Rooms" />
    </div>
  );
}
