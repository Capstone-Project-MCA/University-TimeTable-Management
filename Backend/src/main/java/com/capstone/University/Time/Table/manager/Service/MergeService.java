package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeDTO;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.CourseMappingMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
    public List<CourseMappingDto> mergeSection(MergeDTO mergeDTO) {

        String courseCode = mergeDTO.getCourseCode();
        List<String> sectionIds = mergeDTO.getSectionIds();
        Short groupNo = mergeDTO.getGroupNo();
        String mappingType = mergeDTO.getMappingType();
        String existingMergeCode = mergeDTO.getExistingMergeCode();

        if (sectionIds == null || sectionIds.isEmpty()) {
            throw new IllegalArgumentException("At least one section ID is required.");
        }

        for (String sectionId : sectionIds) {
            if (!courseMappingRepository.existsBySection(sectionId)) {
                throw new ResourceNotFoundException("Section " + sectionId + " not found in mapping");
            }
        }

        List<CourseMapping> existingGroupMappings = new ArrayList<>();
        if (existingMergeCode != null && !existingMergeCode.isEmpty()) {
            existingGroupMappings = courseMappingRepository.findByMergecode(existingMergeCode);
            if (existingGroupMappings.isEmpty()) {
                throw new ResourceNotFoundException("Existing merge group " + existingMergeCode + " not found.");
            }
        }

        List<CourseMapping> newMappings =
                courseMappingRepository.findFlexibleMappings(
                        courseCode,
                        sectionIds,
                        groupNo,
                        mappingType
                );

        if (newMappings.isEmpty()) {
            throw new ResourceNotFoundException("No matching course mappings found for the given sections.");
        }

        String mergeCode;
        if (existingMergeCode != null && !existingMergeCode.isEmpty()) {
            mergeCode = existingMergeCode;
        } else {
            int mergeCodeInt = 101;
            String maximumMergeCode = courseMappingRepository.findMaxMergecode();

            if (maximumMergeCode != null && maximumMergeCode.startsWith("M")) {
                try {
                    int last = Integer.parseInt(maximumMergeCode.substring(1));
                    mergeCodeInt = Math.max(mergeCodeInt, last + 1);
                } catch (NumberFormatException ignored) {}
            }
            mergeCode = "M" + mergeCodeInt;
        }

        for (CourseMapping courseMapping : newMappings) {
            courseMapping.setMergecode(mergeCode);
            courseMapping.setMergeStatus(true);
        }

        courseMappingRepository.saveAll(newMappings);

        List<CourseMapping> allGroupMappings = courseMappingRepository.findByMergecode(mergeCode);

        return allGroupMappings.stream()
                .map(courseMappingMapper::toDto)
                .toList();
    }

    @Transactional
    public List<CourseMappingDto> updateMergeSection(String mergeCode, MergeDTO mergeDTO) {
        List<CourseMapping> existingMappings = courseMappingRepository.findByMergecode(mergeCode);

        if (existingMappings.isEmpty()) {
            throw new ResourceNotFoundException("Merge group " + mergeCode + " not found.");
        }

        for (CourseMapping courseMapping : existingMappings) {
            courseMapping.setMergecode(null);
            courseMapping.setMergeStatus(false);
        }
        courseMappingRepository.saveAll(existingMappings);

        String courseCode = mergeDTO.getCourseCode();
        List<String> sectionIds = mergeDTO.getSectionIds();
        Short groupNo = mergeDTO.getGroupNo();
        String mappingType = mergeDTO.getMappingType();

        List<CourseMapping> newMappings =
                courseMappingRepository.findFlexibleMappings(
                        courseCode,
                        sectionIds,
                        groupNo,
                        mappingType
                );

        if (newMappings.isEmpty()) {
            throw new ResourceNotFoundException("No matching course mappings found for the given sections.");
        }

        for (CourseMapping cm : newMappings) {
            cm.setMergecode(mergeCode);
            cm.setMergeStatus(true);
        }
        courseMappingRepository.saveAll(newMappings);

        return newMappings.stream()
                .map(courseMappingMapper::toDto)
                .toList();
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
}
