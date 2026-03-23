package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseMappingRepository extends JpaRepository<CourseMapping, Long> {

    List<CourseMapping> findBySection(String section);

    @Query("""
    SELECT COUNT(c) > 0 FROM CourseMapping c WHERE c.Section = :section AND c.Coursecode = :coursecode
    """)
    boolean existsBySectionAndCoursecode(@Param("section") String section, @Param("coursecode") String coursecode);

    @Query("""
    SELECT c FROM CourseMapping c
    WHERE c.Section = :section AND c.Coursecode = :coursecode
    AND c.GroupNo = :groupNo AND c.mappingType = :mappingType
    """)
    Optional<CourseMapping> findByNaturalKey(
            @Param("section") String section,
            @Param("coursecode") String coursecode,
            @Param("groupNo") Short groupNo,
            @Param("mappingType") String mappingType
    );

    // ── Used by AssignService.saveAllFacultyAssign & assignFacultyToCoursesAndSection ──
    @Query("""
    SELECT c FROM CourseMapping c
    WHERE c.Section = :section AND c.Coursecode = :coursecode
    AND c.GroupNo = :groupNo AND c.mappingType = :mappingType
    """)
    Optional<CourseMapping> findBySectionAndCoursecodeAndGroupNoAndMappingType(
            @Param("section") String section,
            @Param("coursecode") String coursecode,
            @Param("groupNo") Short groupNo,
            @Param("mappingType") String mappingType
    );

    // ── Used by CourseMappingService.mergeSections ──
    @Query("""
    SELECT c FROM CourseMapping c
    WHERE c.Coursecode = :coursecode AND c.Section IN :sections
    """)
    List<CourseMapping> findByCoursecodeAndSectionIn(
            @Param("coursecode") String coursecode,
            @Param("sections") List<String> sections
    );

    // ── Used by CourseMappingService.generateNextMergeCode ──
    @Query("SELECT MAX(c.Mergecode) FROM CourseMapping c WHERE c.Mergecode IS NOT NULL")
    Optional<String> findMaxMergecode();
}
