package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.MergeSectionsResponse;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Mapper.CourseMappingMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MergeService {

    private final CourseMappingRepository courseMappingRepository;
    private final CourseMappingMapper courseMappingMapper;

    @Autowired
    public MergeService(
            CourseMappingRepository courseMappingRepository,
            CourseMappingMapper courseMappingMapper
    ) {
        this.courseMappingRepository = courseMappingRepository;
        this.courseMappingMapper = courseMappingMapper;
    }

    @Transactional
    public MergeSectionsResponse mergeSections(String courseCode, List<String> sectionIds, String existingMergeCode, Short groupNo) {
        if (courseCode == null || courseCode.isBlank()) {
            throw new IllegalArgumentException("Course code is required");
        }
        if (sectionIds == null || sectionIds.isEmpty()) {
            throw new IllegalArgumentException("At least one section is required");
        }

        // 1. Find CourseMapping rows matching the course + sections (+ optional groupNo)
        List<CourseMapping> mappingsToMerge;
        if (groupNo != null) {
            mappingsToMerge = courseMappingRepository
                    .findByCoursecodeAndSectionInAndGroupNo(courseCode, sectionIds, groupNo);
        } else {
            mappingsToMerge = courseMappingRepository
                    .findByCoursecodeAndSectionIn(courseCode, sectionIds);
        }

        if (mappingsToMerge.isEmpty()) {
            throw new IllegalArgumentException(
                    "No course mappings found for course " + courseCode +
                            " with the given sections: " + sectionIds);
        }

        // 2. Rule 2: Validation - No section should be already merged for this course
        // (If extending, ignore sections already in the existing group)
        for (CourseMapping m : mappingsToMerge) {
            String mCode = m.getMergecode();
            Boolean mStatus = m.getMergeStatus();
            if (mStatus != null && mStatus && mCode != null) {
                if (existingMergeCode == null || !existingMergeCode.equalsIgnoreCase(mCode)) {
                    throw new IllegalArgumentException(
                            "Section '" + m.getSection() + "' is already merged with code '" + mCode +
                                    "' for course '" + courseCode + "'.");
                }
            }
        }

        // 3. Determine Merge Code
        String targetMergeCode;
        if (existingMergeCode != null && !existingMergeCode.isBlank()) {
            // Verify existing merge code exists for this course
            List<CourseMapping> existingGroup = courseMappingRepository.findByMergecode(existingMergeCode);
            if (existingGroup.isEmpty()) {
                throw new IllegalArgumentException("Existing merge group " + existingMergeCode + " not found.");
            }
            if (!existingGroup.get(0).getCoursecode().equals(courseCode)) {
                throw new IllegalArgumentException("Merge group " + existingMergeCode + " belongs to a different course.");
            }
            targetMergeCode = existingMergeCode;
        } else {
            if (sectionIds.size() < 2) {
                throw new IllegalArgumentException("At least 2 sections are required for a NEW merge.");
            }
            targetMergeCode = generateNextMergeCode();
        }

        // 4. Update Mergecode and MergeStatus on each row
        mappingsToMerge.forEach(m -> {
            m.setMergecode(targetMergeCode);
            m.setMergeStatus(true);
        });
        courseMappingRepository.saveAll(mappingsToMerge);

        return new MergeSectionsResponse(
                targetMergeCode,
                courseCode,
                sectionIds,
                mappingsToMerge.size(),
                "Successfully " + (existingMergeCode != null ? "extended" : "merged") + " Sections with code " + targetMergeCode
        );
    }

    @Transactional
    public void unmergeGroup(String mergeCode) {
        List<CourseMapping> mappings = courseMappingRepository.findByMergecode(mergeCode);
        if (mappings.isEmpty()) {
            throw new IllegalArgumentException("Merge group " + mergeCode + " not found.");
        }
        mappings.forEach(m -> {
            m.setMergecode(null);
            m.setMergeStatus(false);
        });
        courseMappingRepository.saveAll(mappings);
    }

    private String generateNextMergeCode() {
        Optional<String> maxCode = courseMappingRepository.findMaxMergecode();
        int nextNumber = 101; // default start

        if (maxCode.isPresent() && maxCode.get().startsWith("M")) {
            try {
                String numericPart = maxCode.get().replaceAll("[^0-9]", "");
                if (!numericPart.isEmpty()) {
                    int current = Integer.parseInt(numericPart);
                    nextNumber = current + 1;
                }
            } catch (NumberFormatException ignored) {
                // keep default
            }
        }

        return "M" + nextNumber;
    }
}
