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

    @Query("SELECT COUNT(c) > 0 FROM CourseMapping c WHERE c.section = :section AND c.Coursecode = :coursecode")
    boolean existsBySectionAndCoursecode(@Param("section") String section, @Param("coursecode") String coursecode);

    @Query("SELECT c FROM CourseMapping c WHERE c.section = :section AND c.Coursecode = :coursecode AND c.GroupNo = :groupNo AND c.mappingType = :mappingType")
    Optional<CourseMapping> findBySectionAndCoursecodeAndGroupNoAndMappingType(
            @Param("section") String section,
            @Param("coursecode") String coursecode,
            @Param("groupNo") Short groupNo,
            @Param("mappingType") String mappingType
    );

    // 🔥 THIS replaces your broken query
    @Query("SELECT c FROM CourseMapping c WHERE c.Coursecode = :coursecode AND c.section IN :sections")
    List<CourseMapping> findByCoursecodeAndSectionIn(
            @Param("coursecode") String coursecode,
            @Param("sections") List<String> sections
    );

    @Query("SELECT c FROM CourseMapping c WHERE c.Coursecode = :coursecode AND c.section IN :sections AND c.GroupNo = :groupNo")
    List<CourseMapping> findByCoursecodeAndSectionInAndGroupNo(
            @Param("coursecode") String coursecode,
            @Param("sections") List<String> sections,
            @Param("groupNo") Short groupNo
    );

    @Query("""
    SELECT c FROM CourseMapping c
    WHERE c.Coursecode = :coursecode
    AND c.section IN :sections
    AND (
        :groupNo IS NULL 
        OR c.GroupNo = :groupNo 
        OR c.GroupNo IS NULL
    )
    AND (:mappingType IS NULL OR c.mappingType = :mappingType)
""")
    List<CourseMapping> findFlexibleMappings(
            @Param("coursecode") String coursecode,
            @Param("sections") List<String> sections,
            @Param("groupNo") Short groupNo,
            @Param("mappingType") String mappingType
    );

    @Query("SELECT c FROM CourseMapping c WHERE c.Mergecode = :mergecode")
    List<CourseMapping> findByMergecode(@Param("mergecode") String mergecode);

    @Query("SELECT c FROM CourseMapping c WHERE c.Mergecode = :mergecode AND c.mappingType = :mappingType")
    List<CourseMapping> findByMergecodeAndMappingType(@Param("mergecode") String mergecode, @Param("mappingType") String mappingType);

    @Query("SELECT c FROM CourseMapping c WHERE c.Mergecode IS NOT NULL")
    List<CourseMapping> findByMergecodeIsNotNull();

    @Query("SELECT MAX(c.Mergecode) FROM CourseMapping c")
    String findMaxMergecode();

    @Modifying
    @Transactional
    @Query(value = "ALTER TABLE coursemapping AUTO_INCREMENT = 1", nativeQuery = true)
    void resetAutoIncrement();
}