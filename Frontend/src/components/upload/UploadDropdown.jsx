import React, { useState, useRef, useEffect } from 'react';

const UploadDropdown = ({ isUploading, onSelectType }) => {
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

  const handleSelect = (type) => {
    setIsOpen(false);
    onSelectType(type);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUploading}
        className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isUploading ? 'hourglass_empty' : 'upload'}
        </span>
        {isUploading ? 'Uploading...' : 'Upload Excel'}
        <span className="material-symbols-outlined text-[16px] leading-none transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none overflow-hidden">
          <div className="py-1">
            <button onClick={() => handleSelect('course')} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">menu_book</span> Course File
            </button>
            <button onClick={() => handleSelect('room')} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">meeting_room</span> Room File
            </button>
            <button onClick={() => handleSelect('faculty')} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">person</span> Faculty File
            </button>
            <button onClick={() => handleSelect('section')} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors text-left">
              <span className="material-symbols-outlined text-[16px] mr-2">groups</span> Section File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDropdown;
