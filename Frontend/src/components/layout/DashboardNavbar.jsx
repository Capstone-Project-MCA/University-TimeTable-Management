import React, { useState } from 'react';
import UploadDropdown from '../upload/UploadDropdown';
import UploadModal from '../upload/UploadModal';
import { useFileUpload } from '../upload/useFileUpload';
import { useDataRefresh } from '../../context/DataRefreshContext';

const API_BASE = "http://localhost:8080";

export default function DashboardNavbar({ activeTab }) {
  const { triggerRefresh } = useDataRefresh();

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
  } = useFileUpload({ onRefresh: triggerRefresh });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (!activeTab) return;
    
    // Convert plural tab name to singular path if needed
    // e.g., 'courses' -> 'course', 'sections' -> 'section', 'faculties' -> 'faculty', 'rooms' -> 'room'
    let endpointPath;
    let label;
    let refreshKeyName;
    switch (activeTab) {
      case 'courses':
        endpointPath = 'course/delete/all';
        label = 'courses';
        refreshKeyName = 'course';
        break;
      case 'sections':
        endpointPath = 'section/delete/all';
        label = 'sections';
        refreshKeyName = 'section';
        break;
      case 'faculties':
        endpointPath = 'faculty/delete/all';
        label = 'faculties';
        refreshKeyName = 'faculty';
        break;
      case 'rooms':
        endpointPath = 'room/delete/all';
        label = 'rooms';
        refreshKeyName = 'room';
        break;
      case 'tickets':
        endpointPath = 'ticket/delete-all-tickets';
        label = 'tickets';
        refreshKeyName = 'ticket';
        break;
      default:
        return; // For assign tabs or unknown, do nothing
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete all ${label}? This cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/${endpointPath}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${label}`);
      }
      
      alert(`Successfully deleted all ${label}.`);
      triggerRefresh(refreshKeyName); // refresh the list without page reload
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [warningModal, setWarningModal] = useState(null); // { assigned: [...], unassigned: [...] }

  const [isGeneratingMerged, setIsGeneratingMerged] = useState(false);
  const [warningModalMerged, setWarningModalMerged] = useState(null);

  // Calculate the real expected ticket count from mapping rows
  // Each mapping produces L, T, or P tickets based on its mappingType
  const calcExpectedTickets = (mappings) => {
    return mappings.reduce((sum, m) => {
      const type = m.mappingType || m.MappingType || '';
      const l = m.l ?? m.L ?? 0;
      const t = m.t ?? m.T ?? 0;
      const p = m.p ?? m.P ?? 0;
      if (type === 'L') return sum + l;
      if (type === 'T') return sum + t;
      if (type === 'P') return sum + p;
      return sum;
    }, 0);
  };

  const handleGenerateTickets = async () => {
    const confirmGenerate = window.confirm(
      "Generate tickets for all course mappings? This will create scheduling tickets based on current assignments."
    );
    if (!confirmGenerate) return;

    setIsGenerating(true);
    try {
      // ── Step 1: fetch all mappings and split into assigned / unassigned ──
      const mappingRes = await fetch(`${API_BASE}/mappings`);
      if (!mappingRes.ok) throw new Error("Failed to load mappings.");
      const mappings = await mappingRes.json();

      const assigned   = mappings.filter(m => !!(m.facultyUid || m.facultyUID || m.FacultyUID));
      const unassigned = mappings.filter(m =>  !(m.facultyUid || m.facultyUID || m.FacultyUID));

      // ── Step 2: nothing assigned at all → hard block ────────────────────
      if (assigned.length === 0) {
        alert("❌ Cannot generate tickets: no course mappings have a faculty assigned.\nPlease assign faculty before generating tickets.");
        return;
      }

      // ── Step 3: partial assignment → show warning modal ─────────────────
      if (unassigned.length > 0) {
        setIsGenerating(false);
        setWarningModal({ assigned, unassigned });
        return;  // generation continues only if user confirms in the modal
      }

      // ── Step 4: all assigned → generate directly ─────────────────────────
      await doGenerateTickets(assigned.length);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Called both from the direct path (all assigned) and from the modal confirm
  const doGenerateTickets = async (expectedCount) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/ticket/generate`, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || err?.message || `Failed to generate tickets (${response.status})`);
      }
      const tickets = await response.json();
      alert(`✅ Successfully generated ${tickets.length} ticket(s).`);
      triggerRefresh('ticket'); // auto-refresh the Tickets panel
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWarningConfirm = async () => {
    const modal = warningModal;
    setWarningModal(null);
    await doGenerateTickets(modal.assigned.length);
  };

  const handleWarningCancel = () => setWarningModal(null);

  const handleWarningMergedCancel = () => setWarningModalMerged(null);

  // Determine if Delete All button should be visible (only for the main 4 entity tabs plus tickets)
  const canDeleteAll = ['courses', 'sections', 'faculties', 'rooms', 'tickets'].includes(activeTab);

  return (
    <>
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

      {/* Generate Ticket button */}
      <button
        onClick={handleGenerateTickets}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-md shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`material-symbols-outlined text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>
          {isGenerating ? "progress_activity" : "confirmation_number"}
        </span>
        {isGenerating ? "Generating..." : "Generate Tickets"}
      </button>

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

    {/* ── Warning Modal: partial faculty assignment (Merged) ─────────────────────── */}
    {warningModalMerged && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 w-full max-w-lg mx-4 overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 flex items-center gap-3 border-b border-amber-200 dark:border-amber-800">
            <span className="material-symbols-outlined text-amber-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Incomplete Faculty Assignment (Merged)</p>
              <p className="text-amber-700/70 dark:text-amber-400/70 text-xs">{warningModalMerged.unassigned.length} merged mapping(s) have no faculty assigned</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Will Generate</p>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 leading-none">{calcExpectedTickets(warningModalMerged.assigned)}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <span className="material-symbols-outlined text-red-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                <div>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Will Skip</p>
                  <p className="text-lg font-extrabold text-red-600 dark:text-red-400 leading-none">{warningModalMerged.unassigned.length}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mappings without faculty (will be skipped):</p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {warningModalMerged.unassigned.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-50/60 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <span className="material-symbols-outlined text-red-400 text-sm">person_off</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {m.courseCode || m.coursecode || m.Coursecode}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">Section {m.section || m.Section}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">G{m.groupNo ?? m.GroupNo}</span>
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{m.mappingType}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{calcExpectedTickets(warningModalMerged.assigned)} ticket(s)</span> will be generated from {warningModalMerged.assigned.length} assigned mapping(s).
              You can assign faculty to the remaining mappings later and regenerate.
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={handleWarningMergedCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWarningMergedConfirm}
              disabled={isGeneratingMerged}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              {isGeneratingMerged ? "Generating..." : `Generate ${calcExpectedTickets(warningModalMerged.assigned)} Ticket(s)`}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Warning Modal: partial faculty assignment ─────────────────────── */}
    {warningModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 w-full max-w-lg mx-4 overflow-hidden">

          {/* Header */}
          <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 flex items-center gap-3 border-b border-amber-200 dark:border-amber-800">
            <span className="material-symbols-outlined text-amber-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Incomplete Faculty Assignment</p>
              <p className="text-amber-700/70 dark:text-amber-400/70 text-xs">{warningModal.unassigned.length} mapping(s) have no faculty assigned</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Summary chips */}
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Will Generate</p>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 leading-none">{calcExpectedTickets(warningModal.assigned)}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <span className="material-symbols-outlined text-red-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                <div>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Will Skip</p>
                  <p className="text-lg font-extrabold text-red-600 dark:text-red-400 leading-none">{warningModal.unassigned.length}</p>
                </div>
              </div>
            </div>

            {/* Unassigned list */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mappings without faculty (will be skipped):</p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {warningModal.unassigned.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-50/60 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <span className="material-symbols-outlined text-red-400 text-sm">person_off</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {m.courseCode || m.coursecode || m.Coursecode}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">Section {m.section || m.Section}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">G{m.groupNo ?? m.GroupNo}</span>
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{m.mappingType}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{calcExpectedTickets(warningModal.assigned)} ticket(s)</span> will be generated from {warningModal.assigned.length} assigned mapping(s).
              You can assign faculty to the remaining mappings later and regenerate.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={handleWarningCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWarningConfirm}
              disabled={isGenerating}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              {isGenerating ? "Generating..." : `Generate ${calcExpectedTickets(warningModal.assigned)} Ticket(s)`}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
