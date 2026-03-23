package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsResponse;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Mapper.CourseMappingMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CourseMappingService {
    private final CourseMappingRepository courseMappingRepository;
    private final CourseMappingMapper courseMappingMapper;

    @Autowired
    public CourseMappingService(
            CourseMappingRepository courseMappingRepository,
            CourseMappingMapper courseMappingMapper) {
        this.courseMappingRepository = courseMappingRepository;
        this.courseMappingMapper = courseMappingMapper;
    }

    @Transactional
    public void deleteAllMappings() {
        courseMappingRepository.deleteAll();
        courseMappingRepository.resetAutoIncrement();
    }

    public List<CourseMappingDto> getAllCourseMappings() {
        List<CourseMapping> courseMappings = courseMappingRepository.findAll();
        List<CourseMappingDto> courseMappingDTOs = new ArrayList<>();

        courseMappings.forEach(courseMapping -> {
            CourseMappingDto courseMappingDto = courseMappingMapper.toDto(courseMapping);
            courseMappingDTOs.add(courseMappingDto);
        });

        return courseMappingDTOs;
    }

    // ── Merge Sections ──────────────────────────────────────

    @Transactional
    public MergeSectionsResponse mergeSections(String courseCode, List<String> sectionIds) {
        if (courseCode == null || courseCode.isBlank()) {
            throw new IllegalArgumentException("Course code is required");
        }
        if (sectionIds == null || sectionIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 sections are required for merging");
        }

        // 1. Generate the next merge code (M101, M102, …)
        String nextMergeCode = generateNextMergeCode();

        // 2. Find all CourseMapping rows matching the course + sections
        List<CourseMapping> mappings = courseMappingRepository
                .findByCoursecodeAndSectionIn(courseCode, sectionIds);

        if (mappings.isEmpty()) {
            throw new IllegalArgumentException(
                    "No course mappings found for course " + courseCode +
                    " with the given sections: " + sectionIds);
        }

        // 3. Update Mergecode and MergeStatus on each row
        mappings.forEach(m -> {
            m.setMergecode(nextMergeCode);
            m.setMergeStatus(true);
        });
        courseMappingRepository.saveAll(mappings);

        return new MergeSectionsResponse(
                nextMergeCode,
                courseCode,
                sectionIds,
                mappings.size(),
                "Successfully merged " + sectionIds.size() + " sections with code " + nextMergeCode
        );
    }

    private String generateNextMergeCode() {
        Optional<String> maxCode = courseMappingRepository.findMaxMergecode();
        int nextNumber = 101; // default start

        if (maxCode.isPresent() && maxCode.get().startsWith("M")) {
            try {
                int current = Integer.parseInt(maxCode.get().substring(1));
                nextNumber = current + 1;
            } catch (NumberFormatException ignored) {
                // keep default
            }
        }

        return "M" + nextNumber;
    }
}
