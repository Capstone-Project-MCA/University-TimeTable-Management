package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.CourseMappingId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseMappingRepository extends JpaRepository<CourseMapping, CourseMappingId> {
    List<CourseMapping> findBySection(String section);

    boolean existsBySectionAndCoursecode(String section, String coursecode);
}
