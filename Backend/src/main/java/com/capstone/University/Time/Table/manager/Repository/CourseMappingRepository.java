package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.CourseMappingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseMappingRepository extends JpaRepository<CourseMapping, CourseMappingId> {
    List<CourseMapping> findBySection(String section);

    @Query("""
    SELECT COUNT(c) > 0 FROM CourseMapping c WHERE c.Section = :section AND c.Coursecode = :coursecode
    """)
    boolean existsBySectionAndCoursecode(@Param("section") String section, @Param("coursecode") String coursecode);
}
