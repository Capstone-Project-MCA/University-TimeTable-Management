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
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AssignService {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private CourseMappingRepository courseMappingRepository;

    @Autowired
    private SectionMapper sectionMapper;

    @Autowired
    private CourseMapper courseMapper;

    public List<Pair<SectionDto, List<CourseDto>>> assignCoursesToSection(CourseSectionAssignmentDto courseSectionAssignmentDto) {
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
                    throw new DuplicateResourceException(
                            "Courses already assigned to sections"
                    );
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

        return assigns;
    }

    private static @NonNull List<CourseMapping> getCourseMappings(String sectionId, String courseId,
                                                                  Course course, Section section) {
        List<CourseMapping> courseMappings = new ArrayList<>();

        if (course.getL() > 0) {
            CourseMapping courseMapping = new CourseMapping();
            courseMapping.setSection(sectionId);
            courseMapping.setCoursecode(courseId);
            courseMapping.setCourseNature(course.getCourseNature());
            courseMapping.setGroupNo((short) 0);
            courseMapping.setMappingType("L0");
            courseMappings.add(courseMapping);
        }

        int gmaps = section.getNumberOfGroups();
        if (course.getT() > 0) {
            for(int i = 0; i < gmaps; i++){
                CourseMapping courseMapping1 = new CourseMapping();
                CourseMapping courseMapping2 = new CourseMapping();

                courseMapping1.setSection(sectionId);
                courseMapping1.setCoursecode(courseId);
                courseMapping1.setGroupNo((short) 1);
                courseMapping1.setCourseNature(course.getCourseNature());
                courseMapping1.setMappingType("G" +(i + 1) + "T1");
                courseMappings.add(courseMapping1);

                courseMapping2.setSection(sectionId);
                courseMapping2.setCoursecode(courseId);
                courseMapping2.setGroupNo((short) 2);
                courseMapping2.setCourseNature(course.getCourseNature());
                courseMapping2.setMappingType("G" + (i + 1) + "T2");
                courseMappings.add(courseMapping2);
            }
        }

        if (course.getP() > 0) {
            for(int i = 0; i < gmaps; i++){
                CourseMapping courseMapping1 = new CourseMapping();
                CourseMapping courseMapping2 = new CourseMapping();

                courseMapping1.setSection(sectionId);
                courseMapping1.setCoursecode(courseId);
                courseMapping1.setGroupNo((short) 1);
                courseMapping1.setCourseNature(course.getCourseNature());
                courseMapping1.setMappingType("G" + (i + 1) + "P1");
                courseMappings.add(courseMapping1);

                courseMapping2.setSection(sectionId);
                courseMapping2.setCoursecode(courseId);
                courseMapping2.setGroupNo((short) 2);
                courseMapping2.setCourseNature(course.getCourseNature());
                courseMapping2.setMappingType("G" + (i + 1 )+ "P2");
                courseMappings.add(courseMapping2);
            }
        }

        return courseMappings;
    }
}
