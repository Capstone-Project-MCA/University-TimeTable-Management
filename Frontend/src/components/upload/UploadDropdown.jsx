import React, { useState, useRef, useEffect } from 'react';

const UPLOAD_TYPES = [
  { type: 'course',  icon: 'menu_book',    label: 'Course' },
  { type: 'room',    icon: 'meeting_room',  label: 'Room' },
  { type: 'faculty', icon: 'person',        label: 'Faculty' },
  { type: 'section', icon: 'groups',        label: 'Section' },
];

const UploadDropdown = ({ isUploading, onSelectType, onDownloadTemplate, isTemplateDownloaded }) => {
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

  const handleUpload = (type) => {
    setIsOpen(false);
    onSelectType(type);
  };

  const handleDownload = (type) => {
    onDownloadTemplate(type);
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
        <div className="absolute right-0 z-20 mt-1 w-72 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">

          {/* Header */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Choose Entity Type</p>
          </div>

          <div className="py-1">
            {UPLOAD_TYPES.map(({ type, icon, label }) => {
              const downloaded = isTemplateDownloaded(type);
              return (
                <div key={type} className="px-3 py-1.5">
                  <div className="flex items-center gap-2">

                    {/* Icon + Label */}
                    <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 min-w-0">{label}</span>

                    {/* Download Template Button */}
                    <button
                      onClick={() => handleDownload(type)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        downloaded
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100'
                          : 'text-primary bg-primary/10 hover:bg-primary/20 ring-1 ring-primary/30 animate-pulse'
                      }`}
                      title={downloaded ? 'Re-download template' : 'Download template first'}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {downloaded ? 'check_circle' : 'download'}
                      </span>
                      {downloaded ? 'Format' : 'Format'}
                    </button>

                    {/* Upload Button */}
                    <button
                      onClick={() => handleUpload(type)}
                      disabled={!downloaded}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        downloaded
                          ? 'text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 cursor-pointer'
                          : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 cursor-not-allowed opacity-60'
                      }`}
                      title={downloaded ? `Upload ${label} file` : 'Download the template first'}
                    >
                      <span className="material-symbols-outlined text-[13px]">upload</span>
                      Upload
                    </button>

                  </div>

                  {/* Hint when not downloaded */}
                  {!downloaded && (
                    <p className="mt-0.5 ml-6 text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                      ↑ Download format first to enable upload
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span>
              Download the format template, fill in your data, then upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDropdown;
