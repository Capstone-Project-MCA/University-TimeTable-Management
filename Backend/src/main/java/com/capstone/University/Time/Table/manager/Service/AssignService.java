package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.CourseSectionAssignmentDto;
import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;

import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.CourseMapper;
import com.capstone.University.Time.Table.manager.Mapper.CourseMappingMapper;
import com.capstone.University.Time.Table.manager.Mapper.SectionMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AssignService {
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final CourseMappingRepository courseMappingRepository;
    private final SectionMapper sectionMapper;
    private final CourseMapper courseMapper;
    private final CourseMappingMapper courseMappingMapper;


    @Autowired
    public AssignService(CourseRepository courseRepository,
                         SectionRepository sectionRepository,
                         CourseMappingRepository courseMappingRepository,
                         SectionMapper sectionMapper,
                         CourseMapper courseMapper,
                         CourseMappingMapper courseMappingMapper
    ) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.courseMappingRepository = courseMappingRepository;
        this.sectionMapper = sectionMapper;
        this.courseMapper = courseMapper;
        this.courseMappingMapper = courseMappingMapper;
    }

    @Transactional
    public CourseMappingDto assignFacultyToCoursesAndSection(CourseMapping courseMapping) {
        CourseMapping existMapping = courseMappingRepository
                .findByNaturalKey(
                        courseMapping.getSection(),
                        courseMapping.getCoursecode(),
                        courseMapping.getGroupNo(),
                        courseMapping.getMappingType()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course Mapping not found for Section=" + courseMapping.getSection()
                        + ", Course=" + courseMapping.getCoursecode()
                        + ", GroupNo=" + courseMapping.getGroupNo()
                        + ", MappingType=" + courseMapping.getMappingType()
                ));

        if (courseMapping.getFacultyUID() != null) existMapping.setFacultyUID(courseMapping.getFacultyUID());
        if (courseMapping.getMergecode() != null) existMapping.setMergecode(courseMapping.getMergecode());
        if (courseMapping.getReserveslot() != null) existMapping.setReserveslot(courseMapping.getReserveslot());

        courseMappingRepository.save(existMapping);
        return courseMappingMapper.toDto(existMapping);
    }

    @Transactional
    public List<Pair<SectionDto, List<CourseDto>>> assignCoursesToSection(CourseSectionAssignmentDto courseSectionAssignmentDto) {
        List<String> errors = new ArrayList<>();
        List<String> sectionIds = courseSectionAssignmentDto.getSectionIds() != null ?
                courseSectionAssignmentDto.getSectionIds() : new ArrayList<>();

        List<String> courseIds = courseSectionAssignmentDto.getCourseIds() != null ?
                courseSectionAssignmentDto.getCourseIds() : new ArrayList<>();

        if(sectionIds.isEmpty() || courseIds.isEmpty()) {throw new ResourceNotFoundException("Section Ids or Course Ids are empty");}

        List<Pair<SectionDto, List<CourseDto>>> assigns = new ArrayList<>();

        for(String sectionId : sectionIds){
            Section section = sectionRepository.findBySectionId(sectionId);

            if(section == null){throw new ResourceNotFoundException("Section not found with id -  " + sectionId);}

            List<CourseDto> courses = new ArrayList<>();

            for(String courseId : courseIds) {
                if(courseMappingRepository.existsBySectionAndCoursecode(sectionId, courseId)) {
                    errors.add("Course with id -  " + courseId +
                            " connected to Section with id - " + sectionId + " already exists");
                    continue;
                }

                Course course = courseRepository.getCourseByCourseCode(courseId);
                if (course == null) {throw new ResourceNotFoundException("Course not found with id -  " + courseId);}

                List<CourseMapping> courseMappings = getCourseMappings(sectionId, courseId, course, section);
                courseMappingRepository.saveAll(courseMappings);
                section.getCourses().add(course);

                CourseDto courseDto = courseMapper.toDto(course);
                courses.add(courseDto);
            }

            SectionDto sectionDto = sectionMapper.toDto(section);
            assigns.add(Pair.of(sectionDto, courses));
        }

        if(!errors.isEmpty()){
            throw new DuplicateResourceException("Courses are already assigned to sections: " + String.join(", ", errors));
        }

        return assigns;
    }

    private static @NonNull List<CourseMapping> getCourseMappings(String sectionId, String courseId,
                                                                  Course course, Section section) {
        List<CourseMapping> courseMappings = new ArrayList<>();
        int gmaps = section.getNumberOfGroups();

        if (course.getL() > 0) {
            CourseMapping courseMapping = new CourseMapping();
            courseMapping.setSection(sectionId);
            courseMapping.setCoursecode(courseId);
            courseMapping.setCourseNature(course.getCourseNature());
            courseMapping.setGroupNo((short) 0);
            courseMapping.setL(course.getL());
            courseMapping.setT(course.getT());
            courseMapping.setP(course.getP());
            courseMapping.setMappingType("L");
            courseMappings.add(courseMapping);
        }

        if (course.getT() > 0) {
            for(int i = 1; i <= gmaps; i++){
                CourseMapping courseMapping = new CourseMapping();

                courseMapping.setSection(sectionId);
                courseMapping.setCoursecode(courseId);
                courseMapping.setGroupNo((short) i);
                courseMapping.setL(course.getL());
                courseMapping.setT(course.getT());
                courseMapping.setP(course.getP());
                courseMapping.setCourseNature(course.getCourseNature());
                courseMapping.setMappingType("T");

                courseMappings.add(courseMapping);

            }
        }

        if (course.getP() > 0) {
            for(int i = 1; i <= gmaps; i++){
                CourseMapping courseMapping = new CourseMapping();

                courseMapping.setSection(sectionId);
                courseMapping.setCoursecode(courseId);
                courseMapping.setGroupNo((short) i);
                courseMapping.setL(course.getL());
                courseMapping.setT(course.getT());
                courseMapping.setP(course.getP());
                courseMapping.setCourseNature(course.getCourseNature());
                courseMapping.setMappingType("P");

                courseMappings.add(courseMapping);
            }
        }

        return courseMappings;
    }
}
