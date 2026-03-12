CREATE TABLE section_course (
                                section_id VARCHAR(5) NOT NULL,
                                course_code VARCHAR(255) NOT NULL,
                                PRIMARY KEY (section_id, course_code),
                                FOREIGN KEY (section_id) REFERENCES sectionmaster(SectionId) ON DELETE CASCADE,
                                FOREIGN KEY (course_code) REFERENCES coursemaster(CourseCode) ON DELETE CASCADE
);
