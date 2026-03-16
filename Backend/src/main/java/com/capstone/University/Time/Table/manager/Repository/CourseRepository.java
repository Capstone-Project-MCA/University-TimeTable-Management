package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, String> {

    @Query("SELECT c FROM Course c WHERE c.CourseCode = :courseCode")
    public Course getCourseByCourseCode(@Param("courseCode") String courseCode);

    @Query("SELECT c FROM Course c WHERE c.CourseTitle = :courseTitle")
    public Course getCourseByCourseTitle(@Param("courseTitle") String courseTitle);
}
