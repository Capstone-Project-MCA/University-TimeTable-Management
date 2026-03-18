package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.CourseMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final CourseMapper courseMapper;

    @Autowired
    public CourseService(
            CourseRepository courseRepository,
            SectionRepository sectionRepository,
            CourseMapper courseMapper
    ) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.courseMapper = courseMapper;

    }

//    @Autowired
//    private CourseRepository courseRepository;
//    @Autowired
//    private SectionRepository sectionRepository;
//    @Autowired
//    private CourseMapper courseMapper;

    // ---------------------------------- All Course Get Requests Service ------------------------------------------
    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(courseMapper::toDto)
                .toList();
    }

    public CourseDto getCourseByCourseCode(String courseCode) {
        Course course = courseRepository.getCourseByCourseCode(courseCode);
        if (course == null) {
            throw new ResourceNotFoundException("Course not found with code '" + courseCode + "'");
        }
        return courseMapper.toDto(course);
    }

    public CourseDto getCourseByCourseTitle(String courseTitle) {
        Course course = courseRepository.getCourseByCourseTitle(courseTitle);
        if (course == null) {
            throw new ResourceNotFoundException("Course not found with title '" + courseTitle + "'");
        }
        return courseMapper.toDto(course);
    }

    // ---------------------------------- All Course Post Requests Service -----------------------------------------
    public CourseDto createNewCourse(Course course) {
        String courseCode = course.getCourseCode();
        Course existingCourse = courseRepository.getCourseByCourseCode(courseCode);

        if (existingCourse != null) {
            throw new DuplicateResourceException(
                    "Course with code '" + courseCode + "' already exists. Please use a unique course code.");
        }

        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDto(savedCourse);
    }

    // ---------------------------------- All Course Put Requests Service -------------------------------------------
    public CourseDto updateCourseByUID(String courseCode, Course course) {
        Course existingCourse = courseRepository.getCourseByCourseCode(courseCode);

        if (existingCourse == null) {
            throw new ResourceNotFoundException("Cannot update: Course not found with code '" + courseCode + "'");
        }

        Course updatedCourse = new Course();
        updatedCourse.setCourseCode(course.getCourseCode());
        updatedCourse.setCourseTitle(course.getCourseTitle());
        updatedCourse.setL(course.getL());
        updatedCourse.setT(course.getT());
        updatedCourse.setP(course.getP());
        updatedCourse.setCredit(course.getCredit());
        updatedCourse.setCourseType(course.getCourseType());
        updatedCourse.setDomain(course.getDomain());
        updatedCourse.setRemarks(course.getRemarks());
        updatedCourse.setCourseNature(course.getCourseNature());

        courseRepository.save(updatedCourse);
        return courseMapper.toDto(updatedCourse);
    }

    // ----------------------------------- All Course Delete Requests Service -----------------------------------------
    public void deleteCourseByCourseCode(String courseCode) {
        Course course = courseRepository.getCourseByCourseCode(courseCode);
        if (course == null) {
            throw new ResourceNotFoundException("Cannot delete: Course not found with code '" + courseCode + "'");
        }
        courseRepository.delete(course);
    }

    public void deleteCourseByCourseTitle(String courseTitle) {
        Course course = courseRepository.getCourseByCourseTitle(courseTitle);
        if (course == null) {
            throw new ResourceNotFoundException("Cannot delete: Course not found with title '" + courseTitle + "'");
        }
        courseRepository.delete(course);
    }

    public void deleteAllCourses() {
        sectionRepository.findAll().forEach(section -> {
            section.getCourses().clear();
        });
        courseRepository.deleteAll();
    }
}
