/**
 * Column schemas for each upload type.
 * Each column has: header, type, comment (instructions), and optional validation (dropdown list).
 */

export const TEMPLATE_SCHEMAS = {
  course: {
    label: "Course",
    sheetName: "Courses",
    columns: [
      {
        header: "CourseCode",
        type: "text",
        comment: "Unique course code (e.g., CS101). Required, must not be duplicate.",
        example: "CS101",
      },
      {
        header: "CourseTitle",
        type: "text",
        comment: "Full title of the course (e.g., Data Structures). Required, must be unique.",
        example: "Data Structures",
      },
      {
        header: "L",
        type: "number",
        comment: "Lecture hours per week. Number, max value 5. Required.",
        example: 3,
      },
      {
        header: "T",
        type: "number",
        comment: "Tutorial hours per week. Number, max value 5. Required.",
        example: 1,
      },
      {
        header: "P",
        type: "number",
        comment: "Practical hours per week. Number, max value 5. Required.",
        example: 0,
      },
      {
        header: "Credit",
        type: "number",
        comment: "Course credits. Number, max value 4. Required.",
        example: 4,
      },
      {
        header: "CourseType",
        type: "text",
        comment: "Type of course. Must be one of: CR, DE, OM, OE, PW, DM, HC, PE, HE, SP. Required.",
        example: "CR",
        validation: ["CR", "DE", "OM", "OE", "PW", "DM", "HC", "PE", "HE", "SP"],
      },
      {
        header: "Domain",
        type: "text",
        comment: "Domain/department the course belongs to (e.g., Computer Science). Required.",
        example: "Computer Science",
      },
      {
        header: "Remarks",
        type: "text",
        comment: "Optional remarks or notes about the course.",
        example: "",
      },
      {
        header: "CourseNature",
        type: "text",
        comment: "Nature of course. Must be one of: L (Lecture), P (Practical), B (Both), T (Tutorial), C (Combined). Required.",
        example: "L",
        validation: ["L", "P", "B", "T", "C"],
      },
    ],
  },

  faculty: {
    label: "Faculty",
    sheetName: "Faculty",
    columns: [
      {
        header: "FacultyUID",
        type: "text",
        comment: "Unique faculty ID (max 5 characters, e.g., F001). Required, must not be duplicate.",
        example: "F001",
      },
      {
        header: "FacultyName",
        type: "text",
        comment: "Full name of the faculty member (max 50 characters). Required, must be unique.",
        example: "Dr. Amit Sharma",
      },
      {
        header: "FacultyDomain",
        type: "text",
        comment: "Faculty's specialization domain (max 20 characters, e.g., AI, Data Science). Required.",
        example: "AI",
      },
    ],
  },

  room: {
    label: "Room",
    sheetName: "Rooms",
    columns: [
      {
        header: "RoomNo",
        type: "text",
        comment: "Unique room number/identifier (max 10 characters, e.g., A-101). Required, must not be duplicate.",
        example: "A-101",
      },
      {
        header: "SeatingCapacity",
        type: "number",
        comment: "Maximum seating capacity of the room. Must be a positive number. Required.",
        example: 60,
      },
      {
        header: "RoomType",
        type: "number",
        comment: "Type of room as a numeric code (e.g., 1 = Classroom, 2 = Lab, 3 = Seminar Hall). Required.",
        example: 1,
      },
      {
        header: "Level",
        type: "number",
        comment: "Floor/level where the room is located. Must be a number. Required.",
        example: 2,
      },
    ],
  },

  section: {
    label: "Section",
    sheetName: "Sections",
    columns: [
      {
        header: "SectionId",
        type: "text",
        comment: "Unique section identifier (max 5 characters, e.g., S1). Required, must not be duplicate.",
        example: "S1",
      },
      {
        header: "Strength",
        type: "number",
        comment: "Number of students in the section. Must be a positive number. Required.",
        example: 60,
      },
      {
        header: "NumberOfGroups",
        type: "number",
        comment: "Number of lab/practical groups. Must be a number. Required.",
        example: 2,
      },
      {
        header: "ProgrammeName",
        type: "text",
        comment: "Name of the programme (max 12 characters, e.g., MCA, BTECH). Required.",
        example: "MCA",
      },
      {
        header: "Semester",
        type: "number",
        comment: "Current semester (1 to 8). Required.",
        example: 1,
        validation: ["1", "2", "3", "4", "5", "6", "7", "8"],
      },
      {
        header: "Batch",
        type: "number",
        comment: "Batch/admission year (e.g., 2024). Must be a number. Required.",
        example: 2024,
      },
      {
        header: "ProgrammeType",
        type: "number",
        comment: "Programme type as numeric code (e.g., 1 = UG, 2 = PG). Required.",
        example: 2,
      },
      {
        header: "ProgrammeDuration",
        type: "number",
        comment: "Duration of the programme in years (decimal allowed, e.g., 2, 4, 4.5). Required.",
        example: 2,
      },
      {
        header: "ProgrammeCode",
        type: "text",
        comment: "Programme code (max 9 characters, e.g., MCA-001). Required.",
        example: "MCA-001",
      },
    ],
  },
};
