-- ============================================================
-- FULL DATABASE SCHEMA — Final Version
-- For documentation and fresh installs only.
-- Flyway is NOT configured in this project.
-- Schema is managed by Hibernate (ddl-auto: update).
-- ============================================================

-- 1. FACULTY MASTER
CREATE TABLE IF NOT EXISTS facultymaster (
    FacultyUID    VARCHAR(5)        PRIMARY KEY,
    FacultyName   VARCHAR(50)       NOT NULL,
    FacultyDomain VARCHAR(20)       NOT NULL,
    CurrentLoad   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    ExpectedLoad  SMALLINT UNSIGNED NOT NULL DEFAULT 0
);


-- 2. SECTION MASTER
CREATE TABLE IF NOT EXISTS sectionmaster (
    SectionId       VARCHAR(5)        PRIMARY KEY,
    Strength        SMALLINT UNSIGNED NOT NULL,
    NumberOfGroups  TINYINT UNSIGNED  NOT NULL,
    ProgramName     VARCHAR(255)       NOT NULL,
    Semester        TINYINT UNSIGNED  NOT NULL,
    Batch           SMALLINT UNSIGNED NOT NULL,
    ProgramType     TINYINT UNSIGNED  NOT NULL,
    ProgramDuration DECIMAL(3,1)      NOT NULL,
    ProgramCode     VARCHAR(9)        NOT NULL
);


-- 3. ROOM MASTER
CREATE TABLE IF NOT EXISTS roommaster (
    RoomNo          VARCHAR(10)       PRIMARY KEY,
    SeatingCapacity SMALLINT UNSIGNED NOT NULL,
    RoomType        TINYINT UNSIGNED  NOT NULL,
    Level           TINYINT UNSIGNED  NOT NULL
);


-- 4. COURSE MASTER
CREATE TABLE IF NOT EXISTS coursemaster (
    CourseCode   VARCHAR(7)        PRIMARY KEY,
    CourseTitle  VARCHAR(60),
    L            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    T            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    P            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    Credit       TINYINT UNSIGNED  NOT NULL DEFAULT 0,
    CourseType   VARCHAR(3),
    Domain       VARCHAR(5),
    Remarks      VARCHAR(50),
    CourseNature CHAR(1)           NOT NULL
);


-- 5. SECTION_COURSE (JPA @ManyToMany join table)
CREATE TABLE IF NOT EXISTS section_course (
    section_id  VARCHAR(5)   NOT NULL,
    course_code VARCHAR(255) NOT NULL,
    PRIMARY KEY (section_id, course_code),
    FOREIGN KEY (section_id)  REFERENCES sectionmaster(SectionId) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES coursemaster(CourseCode)  ON DELETE CASCADE
);


-- 6. COURSE MAPPING
--    Single auto-increment PK (CourseMappingId).
--    Business key (Section, Coursecode, GroupNo, MappingType) enforced as UNIQUE.
--    FacultyUID, Mergecode, Reserveslot are nullable (assigned later).
CREATE TABLE IF NOT EXISTS coursemapping (
    CourseMappingId BIGINT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Section         VARCHAR(5)       NOT NULL,
    Coursecode      VARCHAR(7)       NOT NULL,
    GroupNo         TINYINT UNSIGNED NOT NULL,
    MappingType     VARCHAR(255)     NOT NULL,
    AttendanceType  VARCHAR(15)      NOT NULL DEFAULT 'Regular',
    Mergecode       VARCHAR(7),
    MergeStatus     BOOLEAN          NOT NULL DEFAULT FALSE,
    FacultyUID      VARCHAR(5),
    L               TINYINT UNSIGNED NOT NULL DEFAULT 0,
    T               TINYINT UNSIGNED NOT NULL DEFAULT 0,
    P               TINYINT UNSIGNED NOT NULL DEFAULT 0,
    Reserveslot     VARCHAR(50),
    CourseNature    CHAR(1)          NOT NULL,

    CONSTRAINT UK_coursemapping_biz_key
        UNIQUE (Section, Coursecode, GroupNo, MappingType),

    FOREIGN KEY (Section)
        REFERENCES sectionmaster(SectionId) ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (Coursecode)
        REFERENCES coursemaster(CourseCode) ON UPDATE CASCADE ON DELETE RESTRICT,

    FOREIGN KEY (FacultyUID)
        REFERENCES facultymaster(FacultyUID) ON UPDATE CASCADE ON DELETE SET NULL
);


-- 7. TICKET
--    References coursemapping via single FK on CourseMappingId.
--    FacultyUID is nullable (may be assigned after ticket generation).
--    MergedCode defaults to '' for non-merged tickets.
CREATE TABLE IF NOT EXISTS ticket (
    TicketId        VARCHAR(30)      PRIMARY KEY,
    Section         VARCHAR(5)       NOT NULL,
    Coursecode      VARCHAR(7)       NOT NULL,
    GroupNo         TINYINT UNSIGNED NOT NULL,
    LectureNo       SMALLINT         NOT NULL,
    Day             VARCHAR(10),
    Time            TIME,
    MergedCode      VARCHAR(7)       DEFAULT '',
    FacultyUID      VARCHAR(5),
    RoomNo          VARCHAR(10),
    CourseMappingId BIGINT,

    FOREIGN KEY (CourseMappingId)
        REFERENCES coursemapping(CourseMappingId) ON UPDATE CASCADE ON DELETE SET NULL,

    FOREIGN KEY (FacultyUID)
        REFERENCES facultymaster(FacultyUID) ON UPDATE CASCADE ON DELETE SET NULL,

    FOREIGN KEY (RoomNo)
        REFERENCES roommaster(RoomNo) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- ============================================================
-- ALTER STATEMENTS — run these on existing databases
-- (Hibernate ddl-auto:update won't change column constraints)
-- ============================================================

-- Make FacultyUID nullable in ticket (tickets can be generated before faculty assignment)
ALTER TABLE ticket MODIFY COLUMN FacultyUID VARCHAR(5) NULL;

-- Ensure MergedCode has a default empty string for non-merged tickets
ALTER TABLE ticket MODIFY COLUMN MergedCode VARCHAR(7) NOT NULL DEFAULT '';