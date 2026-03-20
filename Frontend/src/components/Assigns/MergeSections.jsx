import React from "react";

/**
 * MergeSections
 * Interface for generating merge codes for courses that are common
 * across multiple sections (e.g., elective / open-elective courses
 * taught together in one room).
 *
 * TODO: implement the merge-code generation logic here.
 */
export default function MergeSections() {
  return (
    <div className="flex flex-col h-full">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shrink-0">
        <span className="material-symbols-outlined text-primary text-2xl">call_merge</span>
        <div>
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Merge Sections
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate merge codes for courses shared across multiple sections
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">
            call_merge
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">
            Merge Code Generator
          </h2>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
            Select the courses that are common across sections and generate a
            unique merge code so they can be scheduled in a single combined slot.
          </p>
          <p className="mt-4 text-xs text-primary font-medium">
            — Coming soon —
          </p>
        </div>
      </div>
    </div>
  );
}
