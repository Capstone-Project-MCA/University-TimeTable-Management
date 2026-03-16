import React, { useState } from 'react';
import UploadDropdown from '../upload/UploadDropdown';
import UploadModal from '../upload/UploadModal';
import { useFileUpload } from '../upload/useFileUpload';

const API_BASE = "http://localhost:8080";

export default function DashboardNavbar({ activeTab }) {
  const {
    fileInputRef,
    isUploading,
    uploadResult,
    isSaving,
    handleDownloadTemplate,
    isTemplateDownloaded,
    handleSelectUploadType,
    handleFileUpload,
    handleFinalUpload,
    downloadReport,
    closeResultMode
  } = useFileUpload();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (!activeTab) return;
    
    // Convert plural tab name to singular path if needed
    // e.g., 'courses' -> 'course', 'sections' -> 'section', 'faculties' -> 'faculty', 'rooms' -> 'room'
    let endpointPrefix;
    let label;
    switch (activeTab) {
      case 'courses':
        endpointPrefix = 'course';
        label = 'courses';
        break;
      case 'sections':
        endpointPrefix = 'section';
        label = 'sections';
        break;
      case 'faculties':
        endpointPrefix = 'faculty';
        label = 'faculties';
        break;
      case 'rooms':
        endpointPrefix = 'room';
        label = 'rooms';
        break;
      default:
        return; // For assign tabs or unknown, do nothing
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete all ${label}? This cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/${endpointPrefix}/delete/all`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${label}`);
      }
      
      alert(`Successfully deleted all ${label}.`);
      // You may want to trigger a data refresh here by calling a prop function, if the UI needs it.
      // Currently, reloading the page is the easiest way to reflect changes immediately.
      window.location.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if Delete All button should be visible (only for the main 4 entity tabs)
  const canDeleteAll = ['courses', 'sections', 'faculties', 'rooms'].includes(activeTab);

  return (
    <div className="h-12 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4 shadow-sm z-10 shrink-0 relative transition-colors duration-300">

      {canDeleteAll && (
        <button
          onClick={handleDeleteAll}
          disabled={isDeleting || isUploading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDeleting ? "refresh" : "delete_sweep"}
          </span>
          {isDeleting ? "Deleting..." : `Delete All ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </button>
      )}

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
            onDownloadTemplate={handleDownloadTemplate}
            isTemplateDownloaded={isTemplateDownloaded}
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
