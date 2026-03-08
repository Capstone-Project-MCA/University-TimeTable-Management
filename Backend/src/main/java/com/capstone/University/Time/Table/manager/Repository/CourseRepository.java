package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {

    public Course getCourseByCourseCode(String courseCode);
    public Course getCourseByCourseTitle(String courseTitle);
}
