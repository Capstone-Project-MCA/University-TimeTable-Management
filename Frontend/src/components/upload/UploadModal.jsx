import React from 'react';

const UploadModal = ({ uploadResult, isSaving, onClose, onUploadData, onDownloadReport }) => {
  if (!uploadResult) return null;

  return (
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
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Close
          </button>
          <button 
            onClick={onUploadData}
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
            onClick={onDownloadReport}
            disabled={isSaving}
            className="flex-1 px-3 py-2 text-[13px] font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
