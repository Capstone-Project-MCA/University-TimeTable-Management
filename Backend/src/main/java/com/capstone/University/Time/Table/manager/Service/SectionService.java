package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.SectionMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMappingRepository courseMappingRepository;

    @Autowired
    private SectionMapper sectionMapper;

    // ------------------------------------- All Section Get Requests Service
    // ----------------------------------------------
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

    // ------------------------------------- All Section Post Requests Service
    // ---------------------------------------------
    public SectionDto createSection(Section section) {
        Section exists = sectionRepository.findBySectionId(section.getSectionId());
        if (exists != null) {
            throw new DuplicateResourceException("Section already exists with id -  " + section.getSectionId());
        }

        sectionRepository.save(section);
        return sectionMapper.toDto(section);
    }

    // ------------------------------------ All Section Put Requests Service
    // -----------------------------------------------
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

    // -------------------------------------- Course Assignment Service
    // ------------------------------------------------
    public java.util.Map<String, Object> assignCoursesToSections(List<String> sectionIds, List<String> courseCodes) {
        int created = 0;
        int skipped = 0;

        // Validate all sections exist first
        List<Section> sections = new ArrayList<>();
        for (String sectionId : sectionIds) {
            Section section = sectionRepository.findBySectionId(sectionId);
            if (section == null) {
                throw new ResourceNotFoundException("Section not found with id - " + sectionId);
            }
            sections.add(section);
        }

        // Validate all courses exist first
        List<Course> courses = new ArrayList<>();
        for (String courseCode : courseCodes) {
            Course course = courseRepository.getCourseByCourseCode(courseCode);
            if (course == null) {
                throw new ResourceNotFoundException("Course not found with id - " + courseCode);
            }
            courses.add(course);
        }

        // Create mappings for each section × course pair
        for (Section section : sections) {
            for (Course course : courses) {
                // Skip if mapping already exists
                if (courseMappingRepository.existsBySectionAndCoursecode(
                        section.getSectionId(), course.getCourseCode())) {
                    skipped++;
                    continue;
                }

                CourseMapping mapping = new CourseMapping();
                mapping.setSection(section.getSectionId());
                mapping.setCoursecode(course.getCourseCode());
                mapping.setGroupNo((short) 1);
                mapping.setAttendanceType("Regular");
                mapping.setMergecode(null);
                mapping.setMergeStatus(false);
                mapping.setFacultyUID(null);
                mapping.setL(course.getL() != null ? course.getL() : 0);
                mapping.setT(course.getT() != null ? course.getT() : 0);
                mapping.setP(course.getP() != null ? course.getP() : 0);
                mapping.setReserveslot(null);
                mapping.setCourseNature(course.getCourseNature() != null ? course.getCourseNature() : 'T');

                courseMappingRepository.save(mapping);
                created++;
            }
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("message", created + " mapping(s) created, " + skipped + " skipped (already exist).");
        return result;
    }

    // ------------------------------------- All Section Delete Requests Service
    // -------------------------------------------
    public void deleteSection(String sectionId) {
        Section exists = sectionRepository.findBySectionId(sectionId);
        if (exists == null) {
            throw new ResourceNotFoundException("Section not found with id -  " + sectionId);
        }
        sectionRepository.delete(exists);
    }

    public void deleteAllSections() {
        sectionRepository.deleteAll();
    }
}
