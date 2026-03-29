package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseMappingRepository extends JpaRepository<CourseMapping, Long> {

    List<CourseMapping> findBySection(String section);

    boolean existsBySection(String section);

    boolean existsBySectionAndCourseCode(String section, String courseCode);

    Optional<CourseMapping> findBySectionAndCourseCodeAndGroupNoAndMappingType(
            String section, String courseCode, Short groupNo, String mappingType);

    List<CourseMapping> findByCourseCodeAndSectionIn(String courseCode, List<String> sections);

    List<CourseMapping> findByCourseCodeAndSectionInAndGroupNo(
            String courseCode, List<String> sections, Short groupNo);

    @Query("""
    SELECT c FROM CourseMapping c
    WHERE c.courseCode = :coursecode
    AND c.section IN :sections
    AND (
        :groupNo IS NULL
        OR c.groupNo = :groupNo
        OR c.groupNo IS NULL
    )
    AND (:mappingType IS NULL OR c.mappingType = :mappingType)
""")
    List<CourseMapping> findFlexibleMappings(
            @Param("coursecode") String coursecode,
            @Param("sections") List<String> sections,
            @Param("groupNo") Short groupNo,
            @Param("mappingType") String mappingType
    );

    List<CourseMapping> findByMergeCode(String mergeCode);

    List<CourseMapping> findByMergeCodeAndMappingType(String mergeCode, String mappingType);

    List<CourseMapping> findByMergeCodeIsNotNull();

    @Query("SELECT MAX(c.mergeCode) FROM CourseMapping c")
    String findMaxMergeCode();

    @Modifying
    @Transactional
    @Query(value = "SET FOREIGN_KEY_CHECKS = 0", nativeQuery = true)
    void disableForeignKeyChecks();

    @Modifying
    @Transactional
    @Query(value = "TRUNCATE TABLE coursemapping", nativeQuery = true)
    void truncateTable();

    @Modifying
    @Transactional
    @Query(value = "SET FOREIGN_KEY_CHECKS = 1", nativeQuery = true)
    void enableForeignKeyChecks();
}