package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.CourseSectionAssignmentDto;
import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.CourseMapper;
import com.capstone.University.Time.Table.manager.Mapper.SectionMapper;

import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import com.capstone.University.Time.Table.manager.Repository.TicketRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SectionService {
    private final SectionMapper sectionMapper;
    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final TicketRepository ticketRepository;
    private final CourseMappingService courseMappingService;

    @Autowired
    public SectionService(
            SectionMapper sectionMapper,
            SectionRepository sectionRepository,
            CourseRepository courseRepository,
            TicketRepository ticketRepository,
            CourseMappingService courseMappingService
    ) {
        this.sectionMapper = sectionMapper;
        this.sectionRepository = sectionRepository;
        this.courseRepository = courseRepository;
        this.ticketRepository = ticketRepository;
        this.courseMappingService = courseMappingService;
    }

//    @Autowired
//    private SectionRepository sectionRepository;
//
//    @Autowired
//    private SectionMapper sectionMapper;
//
//    @Autowired
//    private CourseRepository courseRepository;

    // ------------------------------------- All Section Get Requests Service ----------------------------------------------
    public SectionDto getSectionById(String id) {
        Section section = sectionRepository.findBySectionId(id);

        if (section == null) {
            throw new ResourceNotFoundException("Section not found with id " + id);
        }

        return sectionMapper.toDto(section);
    }

    public List<SectionDto> getAllSections() {
        return sectionRepository.findAll()
                .stream()
                .map(sectionMapper::toDto)
                .toList();
    }

    // ------------------------------------- All Section Post Requests Service ---------------------------------------------
    public SectionDto createSection(Section section) {
        Section exists = sectionRepository.findBySectionId(section.getSectionId());
        if (exists != null) {
            throw new DuplicateResourceException("Section already exists with id -  " + section.getSectionId());
        }

        sectionRepository.save(section);
        return sectionMapper.toDto(section);
    }

    // ------------------------------------ All Put Requests Service -----------------------------------------------
    public SectionDto updateSection(String sectionId, Section section) {
        Section exists = sectionRepository.findBySectionId(sectionId);
        if (exists == null) {
            throw new ResourceNotFoundException("Section not found with id -  " + sectionId);
        }

        Section updatedSection = new Section();
        updatedSection.setSectionId(section.getSectionId());
        updatedSection.setStrength(section.getStrength());
        updatedSection.setNumberOfGroups(section.getNumberOfGroups());
        updatedSection.setProgramName(section.getProgramName());
        updatedSection.setSemester(section.getSemester());
        updatedSection.setBatch(section.getBatch());
        updatedSection.setProgramType(section.getProgramType());
        updatedSection.setProgramDuration(section.getProgramDuration());
        updatedSection.setProgramCode(section.getProgramCode());

        sectionRepository.save(updatedSection);
        return sectionMapper.toDto(updatedSection);
    }

    // ------------------------------------- All Delete Requests Service -------------------------------------------
    public void deleteSection(String sectionId) {
        Section exists = sectionRepository.findBySectionId(sectionId);
        if (exists == null) {
            throw new ResourceNotFoundException("Section not found with id -  " + sectionId);
        }
        sectionRepository.delete(exists);
    }

    public void deleteAllSections() {
        ticketRepository.deleteAll();
        courseMappingService.deleteAllMappings();
        courseRepository.findAll().forEach(course -> {
            course.getSections().clear();
        });
        sectionRepository.deleteAll();
    }
}
