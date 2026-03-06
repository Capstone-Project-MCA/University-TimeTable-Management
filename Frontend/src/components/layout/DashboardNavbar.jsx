import React from 'react';
import Dropdown from '../common/Dropdown';
import UploadDropdown from '../upload/UploadDropdown';
import UploadModal from '../upload/UploadModal';
import { useFileUpload } from '../upload/useFileUpload';

export default function DashboardNavbar() {
  const {
    fileInputRef,
    isUploading,
    uploadResult,
    isSaving,
    handleSelectUploadType,
    handleFileUpload,
    handleFinalUpload,
    downloadReport,
    closeResultMode
  } = useFileUpload();

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

      <UploadModal 
        uploadResult={uploadResult}
        isSaving={isSaving}
        onClose={closeResultMode}
        onUploadData={handleFinalUpload}
        onDownloadReport={downloadReport}
      />
    </div>
  );
}
