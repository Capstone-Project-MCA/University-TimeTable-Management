import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global fetch polyfill to ensure all components receive both camelCase (API) and PascalCase (legacy)
const originalJson = Response.prototype.json;
Response.prototype.json = async function () {
  const data = await originalJson.call(this);

  function mirrorCasing(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(mirrorCasing);
    } else if (obj !== null && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        
        // Safely generate basic PascalCase mapping for any given field
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (!(pascalKey in obj)) obj[pascalKey] = val;

        // Specific legacy fallbacks explicitly mapped out
        if (key.toLowerCase() === 'coursecode' && !('Coursecode' in obj)) obj['Coursecode'] = val;
        if (key.toLowerCase() === 'coursecode' && !('courseCode' in obj)) obj['courseCode'] = val;
        if (key.toLowerCase() === 'facultyuid' && !('FacultyUID' in obj)) obj['FacultyUID'] = val;
        if (key.toLowerCase() === 'facultyuid' && !('facultyUID' in obj)) obj['facultyUID'] = val;
        if (key.toLowerCase() === 'mappingtype' && !('MappingType' in obj)) obj['MappingType'] = val;
        if (key.toLowerCase() === 'attendancetype' && !('AttendanceType' in obj)) obj['AttendanceType'] = val;
        if (key.toLowerCase() === 'mergestatus' && !('MergeStatus' in obj)) obj['MergeStatus'] = val;
        if (key.toLowerCase() === 'mergecode' && !('Mergecode' in obj)) obj['Mergecode'] = val;
        if (key.toLowerCase() === 'groupno' && !('GroupNo' in obj)) obj['GroupNo'] = val;
        if (key.toLowerCase() === 'reserveslot' && !('Reserveslot' in obj)) obj['Reserveslot'] = val;
        if (key.toLowerCase() === 'coursenature' && !('CourseNature' in obj)) obj['CourseNature'] = val;
        if (key.toLowerCase() === 'sectionid' && !('SectionId' in obj)) obj['SectionId'] = val;
        if (key.toLowerCase() === 'ticketid' && !('TicketId' in obj)) obj['TicketId'] = val;
        if (key.toLowerCase() === 'programname' && !('ProgramName' in obj)) obj['ProgramName'] = val;
        
        mirrorCasing(val);
      }
    }
  }

  mirrorCasing(data);
  return data;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
