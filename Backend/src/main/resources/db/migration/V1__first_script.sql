
-- 1. FACULTY MASTER

CREATE TABLE facultymaster (
                               FacultyUID VARCHAR(5) PRIMARY KEY,
                               FacultyName VARCHAR(30) NOT NULL,
                               FacultyDomain VARCHAR(4) NOT NULL,
                               CurrentLoad SMALLINT UNSIGNED NOT NULL,
                               ExpectedLoad SMALLINT UNSIGNED NOT NULL
);


-- 2. SECTION MASTER

CREATE TABLE sectionmaster (
                               SectionId VARCHAR(5) PRIMARY KEY,
                               Strength SMALLINT UNSIGNED NOT NULL,
                               NumberOfGroups TINYINT UNSIGNED NOT NULL,
                               ProgramName VARCHAR(12) NOT NULL,
                               Semester TINYINT UNSIGNED NOT NULL,
                               Batch SMALLINT UNSIGNED NOT NULL,
                               ProgramType TINYINT UNSIGNED NOT NULL,
                               ProgramDuration DECIMAL(3,1) NOT NULL,
                               ProgramCode VARCHAR(9) NOT NULL
);


-- 3. ROOM MASTER

CREATE TABLE roommaster (
                            RoomNo VARCHAR(10) PRIMARY KEY,
                            SeatingCapacity SMALLINT UNSIGNED NOT NULL,
                            RoomType TINYINT UNSIGNED NOT NULL,
                            Level TINYINT UNSIGNED NOT NULL
);


-- 4. COURSE MASTER

CREATE TABLE coursemaster (
                              CourseCode VARCHAR(7) PRIMARY KEY,
                              CourseTitle VARCHAR(60) NOT NULL,
                              L SMALLINT UNSIGNED NOT NULL,
                              T SMALLINT UNSIGNED NOT NULL,
                              P SMALLINT UNSIGNED NOT NULL,
                              Credit TINYINT UNSIGNED NOT NULL,
                              CourseType VARCHAR(3) NOT NULL,
                              Domain VARCHAR(5) NOT NULL,
                              Remarks VARCHAR(50) NOT NULL,
                              CourseNature CHAR(1) NOT NULL
);


-- 5. COURSE MAPPING

CREATE TABLE coursemapping (
                               Section VARCHAR(5) NOT NULL,
                               Coursecode VARCHAR(7) NOT NULL,
                               AttendanceType VARCHAR(15) NOT NULL,
                               GroupNo TINYINT UNSIGNED NOT NULL,
                               Mergecode VARCHAR(7) NOT NULL,
                               MergeStatus BOOLEAN NOT NULL,
                               FacultyUID VARCHAR(5) NOT NULL,
                               L TINYINT UNSIGNED NOT NULL,
                               T TINYINT UNSIGNED NOT NULL,
                               P TINYINT UNSIGNED NOT NULL,
                               Reserveslot VARCHAR(50) NOT NULL,
                               CourseNature CHAR(1) NOT NULL,

                               PRIMARY KEY (Section, Coursecode, GroupNo),

                               FOREIGN KEY (Section)
                                   REFERENCES sectionmaster(SectionId)
                                   ON UPDATE CASCADE
                                   ON DELETE RESTRICT,

                               FOREIGN KEY (Coursecode)
                                   REFERENCES coursemaster(CourseCode)
                                   ON UPDATE CASCADE
                                   ON DELETE RESTRICT,

                               FOREIGN KEY (FacultyUID)
                                   REFERENCES facultymaster(FacultyUID)
                                   ON UPDATE CASCADE
                                   ON DELETE RESTRICT
);


-- 6. TICKET TABLE

CREATE TABLE ticket (
                        TicketId VARCHAR(7) PRIMARY KEY,
                        Section VARCHAR(5) NOT NULL,
                        Coursecode VARCHAR(7) NOT NULL,
                        GroupNo TINYINT UNSIGNED NOT NULL,
                        LectureNo TINYINT UNSIGNED NOT NULL,
                        Day VARCHAR(10) NOT NULL,
                        Time TIME NOT NULL,
                        MergedCode VARCHAR(7) NOT NULL,
                        FacultyUID VARCHAR(5) NOT NULL,
                        RoomNo VARCHAR(10),

                        FOREIGN KEY (Section, Coursecode, GroupNo)
                            REFERENCES coursemapping(Section, Coursecode, GroupNo)
                            ON UPDATE CASCADE
                            ON DELETE CASCADE,

                        FOREIGN KEY (FacultyUID)
                            REFERENCES facultymaster(FacultyUID)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT,

                        FOREIGN KEY (RoomNo)
                            REFERENCES roommaster(RoomNo)
                            ON UPDATE CASCADE
                            ON DELETE RESTRICT
);