package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Mapper.CourseMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMapper courseMapper;

//---------------------------------- All Course Get Requests Service ------------------------------------------
public List<CourseDto> getAllCourses(){
    return courseRepository.findAll()
            .stream()
            .map(courseMapper::toDto)
            .toList();
}

    public CourseDto getCourseByCourseCode(String courseCode){
        Course course = courseRepository.getCourseByCourseCode(courseCode);
        return course != null ? courseMapper.toDto(course) : null;
    }

    public CourseDto getCourseByCourseTitle(String courseTitle){
        Course course = courseRepository.getCourseByCourseTitle(courseTitle);
        return course != null ? courseMapper.toDto(course) : null;
    }

//---------------------------------- All Course Post Requests Service -----------------------------------------
    public CourseDto createNewCourse(Course course){
        String courseCode = course.getCourseCode();
        Course existingCourse = courseRepository.getCourseByCourseCode(courseCode);

        if(existingCourse != null){
            throw new RuntimeException("Course already exists");
        }

        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDto(savedCourse);
    }

//---------------------------------- All Course Put Requests Service -------------------------------------------
    public CourseDto updateCourseByUID(String courseCode){
        Course existingCourse = courseRepository.getCourseByCourseCode(courseCode);
        Course updatedCourse = new Course();

        if(existingCourse != null){
            updatedCourse.setCourseCode(existingCourse.getCourseCode());
            updatedCourse.setCourseTitle(existingCourse.getCourseTitle());
            updatedCourse.setL(existingCourse.getL());
            updatedCourse.setT(existingCourse.getT());
            updatedCourse.setP(existingCourse.getP());
            updatedCourse.setCredit(existingCourse.getCredit());
            updatedCourse.setCourseType(existingCourse.getCourseType());
            updatedCourse.setDomain(existingCourse.getDomain());
            updatedCourse.setRemarks(existingCourse.getRemarks());
            updatedCourse.setCourseNature(existingCourse.getCourseNature());

            courseRepository.save(updatedCourse);
            return courseMapper.toDto(updatedCourse);
        }

        return null;
    }

//----------------------------------- All Course Delete Requests Service -----------------------------------------
    public void deleteCourseByCourseCode(String courseCode){
        Course course = courseRepository.getCourseByCourseCode(courseCode);
        if(course != null){
            courseRepository.delete(course);
        }
    }

    public void deleteCourseByCourseTitle(String courseTitle){
        Course course = courseRepository.getCourseByCourseTitle(courseTitle);
        if(course != null){
            courseRepository.delete(course);
        }
    }

    public void deleteAllCourses(){
        courseRepository.deleteAll();
    }
}
