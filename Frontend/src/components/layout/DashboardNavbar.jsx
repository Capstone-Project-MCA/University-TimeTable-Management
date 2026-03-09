import React from 'react';
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

      
      <div className="ml-auto flex items-center gap-4">
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
