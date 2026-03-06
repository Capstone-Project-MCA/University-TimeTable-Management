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
  const fileInputRef = useRef(null);
  const uploadTypeRef = useRef('course');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectUploadType = (type) => {
    uploadTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validExtensions.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpointType = uploadTypeRef.current;
      const response = await fetch(`http://localhost:8080/${endpointType}/upload?save=false`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadResult(data);

    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFinalUpload = async () => {
    if (!selectedFile) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const endpointType = uploadTypeRef.current;
      const response = await fetch(`http://localhost:8080/${endpointType}/upload?save=true`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Final upload failed");
      }

      setUploadResult(null);
      setSelectedFile(null);
      alert("File uploaded and saved to database successfully.");

    } catch (error) {
      console.error(error);
      alert("Error saving file to database");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadReport = () => {
    if (!uploadResult?.fileData) return;
    const byteCharacters = atob(uploadResult.fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const typeLabel = uploadTypeRef.current.charAt(0).toUpperCase() + uploadTypeRef.current.slice(1);
    a.download = `${typeLabel} Validation Result.xlsx`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="h-12 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4 shadow-sm z-10 shrink-0 relative transition-colors duration-300">
      <Dropdown label="Section" />
      <Dropdown label="Course" />
      <Dropdown label="Faculty" />
      <Dropdown label="Rooms" />
      
      <div className="ml-auto flex items-center gap-4">
        <button className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
          Assign faculty to section
        </button>
        <button className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
          Assign faculty to course
        </button>
        
        <div>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <UploadDropdown 
            isUploading={isUploading} 
            onSelectType={handleSelectUploadType} 
          />
        </div>
      </div>

      {uploadResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500 shrink-0">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Complete</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">File processed successfully</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Successfully Added</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-500">{uploadResult.correctCount}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Errors Found</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-500">{uploadResult.faultCount}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setUploadResult(null);
                  setSelectedFile(null);
                }}
                disabled={isSaving}
                className="flex-1 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Close
              </button>
              <button 
                onClick={handleFinalUpload}
                disabled={isSaving || uploadResult?.correctCount === 0}
                className="flex-1 px-3 py-2 text-[13px] font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-green-600/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    Upload Data
                  </>
                )}
              </button>
              <button 
                onClick={downloadReport}
                disabled={isSaving}
                className="flex-1 px-3 py-2 text-[13px] font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
