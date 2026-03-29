package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
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
        courseMappingRepository.disableForeignKeyChecks();
        courseMappingRepository.truncateTable();
        courseMappingRepository.enableForeignKeyChecks();
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

}
