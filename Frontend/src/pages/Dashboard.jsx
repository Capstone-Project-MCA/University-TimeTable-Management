import React, { useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import UnscheduledSidebar from "../components/layout/UnscheduledSidebar";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import TimetableGrid from "../components/timetable/TimetableGrid";
import FacultyAssign from "../components/Assigns/FacultyAssign";
import SectionCourseAssign from "../components/Assigns/SectionCourseAssign";
import FacultyMappingAssign from "../components/Assigns/FacultyMappingAssign";
import { DataRefreshProvider } from "../context/DataRefreshContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  const isAssignView = activeTab === "facultyAssign" || activeTab === "sectionCourseAssign" || activeTab === "smartAssign";

  return (
    <DataRefreshProvider>
      <div className="font-sans antialiased overflow-hidden h-screen flex flex-col text-sm text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {isAssignView ? (
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative overflow-auto">
              {activeTab === "facultyAssign" && <FacultyAssign />}
              {activeTab === "sectionCourseAssign" && <SectionCourseAssign />}
              {activeTab === "smartAssign" && <FacultyMappingAssign />}
            </main>
          ) : (
            <>
              <UnscheduledSidebar activeTab={activeTab} />
              <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative">
                <DashboardNavbar activeTab={activeTab} />
                <TimetableGrid />
              </main>
            </>
          )}
        </div>
      </div>
    </DataRefreshProvider>
  );
}
