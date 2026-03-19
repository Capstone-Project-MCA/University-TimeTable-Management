package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.CourseSectionAssignmentDto;
import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.CourseMapper;
import com.capstone.University.Time.Table.manager.Mapper.CourseMappingMapper;
import com.capstone.University.Time.Table.manager.Mapper.FacultyMapper;
import com.capstone.University.Time.Table.manager.Mapper.SectionMapper;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import com.capstone.University.Time.Table.manager.Repository.FacultyRepository;
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
    private final FacultyRepository facultyRepository;
    private final FacultyMapper facultyMapper;


    @Autowired
    public AssignService(
            CourseRepository courseRepository,
            SectionRepository sectionRepository,
            CourseMappingRepository courseMappingRepository,
            SectionMapper sectionMapper,
            CourseMapper courseMapper,
            CourseMappingMapper courseMappingMapper,
            FacultyRepository facultyRepository,
            FacultyMapper facultyMapper
    ) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.courseMappingRepository = courseMappingRepository;
        this.sectionMapper = sectionMapper;
        this.courseMapper = courseMapper;
        this.courseMappingMapper = courseMappingMapper;
        this.facultyRepository = facultyRepository;
        this.facultyMapper = facultyMapper;
    }

    public List<CourseMappingDto> saveAllFacultyAssign(List<CourseMapping> courseMappings) {
        List<CourseMappingDto> courseMappingDTOs = new ArrayList<>();

        courseMappings.forEach(courseMapping -> {
            courseMappingDTOs.add(courseMappingMapper.toDto(courseMapping));
        });

        courseMappingRepository.saveAll(courseMappings);
        return courseMappingDTOs;
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

    public List<Pair<String, Pair<String, List<CourseMappingDto>>>> assignMultipleCoursesToFaculty(
            String facultyUID,
            String sectionId,
            List<CourseMapping> courseMappings) {

        List<Pair<String, Pair<String, List<CourseMappingDto>>>> pairs = new ArrayList<>();

        Faculty faculty = facultyRepository.findByFacultyUID(facultyUID);
        if (faculty == null) throw new ResourceNotFoundException("Faculty Not Found");

        Section section = sectionRepository.findBySectionId(sectionId);
        if (section == null) throw new ResourceNotFoundException("Section Not Found");

        List<CourseMappingDto> list = new ArrayList<>();

        courseMappings.forEach(courseMapping -> {
            CourseMapping courseMappingTemp = courseMappingRepository.findById(
                    courseMapping.getCourseMappingId()
            ).orElseThrow(() -> new ResourceNotFoundException("Course Mapping Not Found"));

            if (courseMappingTemp.getFacultyUID() == null) {
                courseMappingTemp.setFacultyUID(faculty.getFacultyUID());
                courseMappingRepository.save(courseMappingTemp);
                list.add(courseMappingMapper.toDto(courseMappingTemp));
            }
        });

        Pair<String, List<CourseMappingDto>> innerPair =
                Pair.of(sectionId, list);

        Pair<String, Pair<String, List<CourseMappingDto>>> outerPair =
                Pair.of(facultyUID, innerPair);

        pairs.add(outerPair);

        return pairs;
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
