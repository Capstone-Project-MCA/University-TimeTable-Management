package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeDTO;
import com.capstone.University.Time.Table.manager.DTO.SectionGroupDTO;
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
        List<SectionGroupDTO> sectionGroups = mergeDTO.getSectionGroups();
        String mappingType = mergeDTO.getMappingType();
        String existingMergeCode = mergeDTO.getExistingMergeCode();

        if (sectionGroups == null || sectionGroups.isEmpty()) {
            throw new IllegalArgumentException("At least one section group is required.");
        }

        List<String> sectionIds = sectionGroups.stream()
                .map(SectionGroupDTO::getSectionId)
                .distinct()
                .toList();

        for (String sectionId : sectionIds) {
            if (!courseMappingRepository.existsBySection(sectionId)) {
                throw new ResourceNotFoundException("Section " + sectionId + " not found in mapping");
            }
        }

        List<CourseMapping> existingGroupMappings = new ArrayList<>();

        if (existingMergeCode != null && !existingMergeCode.isEmpty()) {
            existingGroupMappings = courseMappingRepository.findByMergeCode(existingMergeCode);
            if (existingGroupMappings.isEmpty()) {
                throw new ResourceNotFoundException("Existing merge group " + existingMergeCode + " not found.");
            }
        }

        List<CourseMapping> candidateMappings = courseMappingRepository.findByCourseCodeAndSectionIn(courseCode, sectionIds);
        List<CourseMapping> newMappings = new ArrayList<>();

        for (SectionGroupDTO sg : sectionGroups) {
            String targetSection = sg.getSectionId();
            Short targetGroup = sg.getGroupNo();

            CourseMapping match = candidateMappings.stream()
                    .filter(c -> c.getSection().equals(targetSection))
                    .filter(c -> (targetGroup == null && c.getGroupNo() == null) || (targetGroup != null && targetGroup.equals(c.getGroupNo())))
                    .filter(c -> mappingType == null || mappingType.equals(c.getMappingType()))
                    .filter(c -> c.getMergeStatus() == null || !c.getMergeStatus())
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No available mapping found for section " + targetSection + 
                            (targetGroup != null ? " group " + targetGroup : "") + 
                            " with type " + mappingType));
            newMappings.add(match);
        }

        if (newMappings.isEmpty()) {
            throw new ResourceNotFoundException("No matching course mappings found for the given sections.");
        }

        String mergeCode;
        if (existingMergeCode != null && !existingMergeCode.isEmpty()) {
            mergeCode = existingMergeCode;
        } else {
            // Check if all selected mappings already share the same mergeCode
            String existingCode = newMappings.get(0).getMergeCode();
            boolean allShareSameCode = existingCode != null && !existingCode.isEmpty();
            
            if (allShareSameCode) {
                for (CourseMapping mapping : newMappings) {
                    if (mapping.getMergeCode() == null || !mapping.getMergeCode().equals(existingCode)) {
                        allShareSameCode = false;
                        break;
                    }
                }
            }
            
            if (allShareSameCode) {
                mergeCode = existingCode;
            } else {
                int mergeCodeInt = 101;
                String maximumMergeCode = courseMappingRepository.findMaxMergeCode();

                if (maximumMergeCode != null && maximumMergeCode.startsWith("M")) {
                    try {
                        int last = Integer.parseInt(maximumMergeCode.substring(1));
                        mergeCodeInt = Math.max(mergeCodeInt, last + 1);
                    } catch (NumberFormatException ignored) {}
                }
                mergeCode = "M" + mergeCodeInt;
            }
        }

        for (CourseMapping courseMapping : newMappings) {
            courseMapping.setMergeCode(mergeCode);
            courseMapping.setMergeStatus(true);
        }

        courseMappingRepository.saveAll(newMappings);

        List<CourseMapping> allGroupMappings = courseMappingRepository.findByMergeCode(mergeCode);

        return allGroupMappings.stream()
                .map(courseMappingMapper::toDto)
                .toList();
    }

    @Transactional
    public List<CourseMappingDto> updateMergeSection(String mergeCode, MergeDTO mergeDTO) {
        List<CourseMapping> existingMappings = courseMappingRepository.findByMergeCode(mergeCode);

        if (existingMappings.isEmpty()) {
            throw new ResourceNotFoundException("Merge group " + mergeCode + " not found.");
        }

        for (CourseMapping courseMapping : existingMappings) {
            courseMapping.setMergeCode(null);
            courseMapping.setMergeStatus(false);
        }
        courseMappingRepository.saveAll(existingMappings);

        String courseCode = mergeDTO.getCourseCode();
        List<SectionGroupDTO> sectionGroups = mergeDTO.getSectionGroups();
        String mappingType = mergeDTO.getMappingType();

        if (sectionGroups == null || sectionGroups.isEmpty()) {
            throw new IllegalArgumentException("At least one section group is required.");
        }

        List<String> sectionIds = sectionGroups.stream()
                .map(SectionGroupDTO::getSectionId)
                .distinct()
                .toList();

        List<CourseMapping> candidateMappings = courseMappingRepository.findByCourseCodeAndSectionIn(courseCode, sectionIds);
        List<CourseMapping> newMappings = new ArrayList<>();

        for (SectionGroupDTO sg : sectionGroups) {
            String targetSection = sg.getSectionId();
            Short targetGroup = sg.getGroupNo();

            CourseMapping match = candidateMappings.stream()
                    .filter(c -> c.getSection().equals(targetSection))
                    .filter(c -> (targetGroup == null && c.getGroupNo() == null) || (targetGroup != null && targetGroup.equals(c.getGroupNo())))
                    .filter(c -> mappingType == null || mappingType.equals(c.getMappingType()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No available mapping found for section " + targetSection + 
                            (targetGroup != null ? " group " + targetGroup : "") + 
                            " with type " + mappingType));
            newMappings.add(match);
        }

        if (newMappings.isEmpty()) {
            throw new ResourceNotFoundException("No matching course mappings found for the given sections.");
        }

        for (CourseMapping cm : newMappings) {
            cm.setMergeCode(mergeCode);
            cm.setMergeStatus(true);
        }
        courseMappingRepository.saveAll(newMappings);

        return newMappings.stream()
                .map(courseMappingMapper::toDto)
                .toList();
    }

    @Transactional
    public void unmergeGroup(String mergeCode) {
        List<CourseMapping> mappings = courseMappingRepository.findByMergeCode(mergeCode);

        if (mappings.isEmpty()) {
            throw new IllegalArgumentException("Merge group " + mergeCode + " not found.");
        }

        mappings.forEach(m -> {
            m.setMergeCode(null);
            m.setMergeStatus(false);
        });
        courseMappingRepository.saveAll(mappings);
    }
}
