import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * DataRefreshContext
 *
 * Provides a lightweight publish/subscribe mechanism so that any component
 * can trigger a data refresh in any other component without prop-drilling.
 *
 * Usage:
 *   // Trigger a refresh (e.g., after upload):
 *   const { triggerRefresh } = useDataRefresh();
 *   triggerRefresh('courses');          // refresh only courses
 *   triggerRefresh();                   // refresh everything
 *
 *   // Listen and re-fetch (e.g., in a data list component):
 *   const { refreshKey, lastRefreshedEntity } = useDataRefresh();
 *   useEffect(() => { fetchData(); }, [refreshKey]);
 *   // or scope it:
 *   useEffect(() => {
 *     if (!lastRefreshedEntity || lastRefreshedEntity === 'courses') fetchCourses();
 *   }, [refreshKey]);
 */

const DataRefreshContext = createContext(null);

export function DataRefreshProvider({ children }) {
  // Incrementing integer — any change causes subscribers to re-run their useEffect
  const [refreshKey, setRefreshKey] = useState(0);
  // Which entity type was uploaded ('course'|'faculty'|'room'|'section'|null for all)
  const [lastRefreshedEntity, setLastRefreshedEntity] = useState(null);

  const triggerRefresh = useCallback((entityType = null) => {
    setLastRefreshedEntity(entityType);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <DataRefreshContext.Provider value={{ refreshKey, lastRefreshedEntity, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  const ctx = useContext(DataRefreshContext);
  if (!ctx) throw new Error('useDataRefresh must be used inside <DataRefreshProvider>');
  return ctx;
}
