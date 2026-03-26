package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.*;
import com.capstone.University.Time.Table.manager.Entity.*;
import com.capstone.University.Time.Table.manager.Exception.*;
import com.capstone.University.Time.Table.manager.Mapper.*;
import com.capstone.University.Time.Table.manager.Repository.*;
import org.apache.commons.lang3.tuple.Pair;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

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

//    public List<CourseMappingDto> generateMergeCode(MergeDTO mergeDTO) {
//        String courseCode = mergeDTO.getCourseCode();
//        List<String> sections = mergeDTO.getSectionIds();
//        String mappingType = mergeDTO.getMappingType();
//        Short groupNo = mergeDTO.getGroupNo();
//
//        List<String> mergeCodes = new ArrayList<>();
//
//        // Collect existing merge codes
//        List<CourseMapping> courseMappings = courseMappingRepository.findAllMergeCodes();
//        courseMappings.forEach(courseMapping -> {
//            if (Boolean.TRUE.equals(courseMapping.getMergeStatus())) {
//                mergeCodes.add(courseMapping.getMergecode());
//            }
//        });
//
//        // Convert to integer list
//        List<Integer> mergeCodesList = new ArrayList<>();
//        for (String mergeCode : mergeCodes) {
//            int num = Integer.parseInt(mergeCode.substring(1));
//            mergeCodesList.add(num);
//        }
//
//        Collections.sort(mergeCodesList);
//
//        // Find next merge number
//        int nextMergeNumber = mergeCodesList.isEmpty() ? 1 :
//                mergeCodesList.get(mergeCodesList.size() - 1) + 1;
//
//        String newMergeCode = "M" + nextMergeNumber;
//
//        List<CourseMappingDto> courseMappingDTOs = new ArrayList<>();
//
//        for (String section : sections) {
//            Optional<CourseMapping> courseMapping = courseMappingRepository
//                    .findBySectionAndCoursecodeAndGroupNoAndMappingType(
//                            section, courseCode, groupNo, mappingType);
//
//            if (courseMapping.isPresent()) {
//
//                CourseMapping cm = courseMapping.get();
//
//                cm.setMergeStatus(true);
//                cm.setMergecode(newMergeCode);
//
//                courseMappingDTOs.add(courseMappingMapper.toDto(cm));
//            }
//        }
//        return courseMappingDTOs;
//    }

    @Transactional
    public List<CourseMappingDto> saveAllFacultyAssign(List<CourseMapping> courseMappings) {
        List<CourseMappingDto> results = new ArrayList<>();

        for (CourseMapping incoming : courseMappings) {
            CourseMapping existing;
            if (incoming.getCourseMappingId() != null) {
                existing = courseMappingRepository.findById(incoming.getCourseMappingId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "CourseMapping not found with id=" + incoming.getCourseMappingId()));
            } else {
                existing = courseMappingRepository.findBySectionAndCourseCodeAndGroupNoAndMappingType(
                        incoming.getSection(), incoming.getCourseCode(),
                        incoming.getGroupNo(), incoming.getMappingType()
                ).orElseThrow(() -> new ResourceNotFoundException(
                        "CourseMapping not found for Section=" + incoming.getSection()
                        + ", Course=" + incoming.getCourseCode()
                        + ", GroupNo=" + incoming.getGroupNo()
                        + ", MappingType=" + incoming.getMappingType()));
            }

            if (incoming.getFacultyUid() != null) existing.setFacultyUid(incoming.getFacultyUid());
            if (incoming.getMergeCode() != null) existing.setMergeCode(incoming.getMergeCode());
            if (incoming.getReserveSlot() != null) existing.setReserveSlot(incoming.getReserveSlot());

            courseMappingRepository.save(existing);
            results.add(courseMappingMapper.toDto(existing));
        }

        return results;
    }

    @Transactional
    public CourseMappingDto assignFacultyToCoursesAndSection(CourseMapping courseMapping) {
        CourseMapping existMapping = courseMappingRepository
                .findBySectionAndCourseCodeAndGroupNoAndMappingType(
                        courseMapping.getSection(),
                        courseMapping.getCourseCode(),
                        courseMapping.getGroupNo(),
                        courseMapping.getMappingType()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course Mapping not found for Section=" + courseMapping.getSection()
                        + ", Course=" + courseMapping.getCourseCode()
                        + ", GroupNo=" + courseMapping.getGroupNo()
                        + ", MappingType=" + courseMapping.getMappingType()
                ));

        if (courseMapping.getFacultyUid() != null) existMapping.setFacultyUid(courseMapping.getFacultyUid());
        if (courseMapping.getMergeCode() != null) existMapping.setMergeCode(courseMapping.getMergeCode());
        if (courseMapping.getReserveSlot() != null) existMapping.setReserveSlot(courseMapping.getReserveSlot());

        courseMappingRepository.save(existMapping);
        return courseMappingMapper.toDto(existMapping);
    }

    public List<Pair<String, Pair<String, List<CourseMappingDto>>>> assignMultipleCoursesToFaculty(
            String facultyUID,
            String sectionId,
            List<CourseMapping> courseMappings) {

        List<Pair<String, Pair<String, List<CourseMappingDto>>>> pairs = new ArrayList<>();

        Faculty faculty = facultyRepository.findByFacultyUid(facultyUID);
        if (faculty == null) throw new ResourceNotFoundException("Faculty Not Found");

        Section section = sectionRepository.findBySectionId(sectionId);
        if (section == null) throw new ResourceNotFoundException("Section Not Found");

        List<CourseMappingDto> list = new ArrayList<>();

        courseMappings.forEach(courseMapping -> {
            CourseMapping courseMappingTemp = courseMappingRepository.findById(
                    courseMapping.getCourseMappingId()
            ).orElseThrow(() -> new ResourceNotFoundException("Course Mapping Not Found"));

            if (courseMappingTemp.getFacultyUid() == null) {
                courseMappingTemp.setFacultyUid(faculty.getFacultyUid());
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
                if(courseMappingRepository.existsBySectionAndCourseCode(sectionId, courseId)) {
                    errors.add("Course with id -  " + courseId +
                            " connected to Section with id - " + sectionId + " already exists");
                    continue;
                }

                Course course = courseRepository.findByCourseCode(courseId);
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
            courseMapping.setCourseCode(courseId);
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
                courseMapping.setCourseCode(courseId);
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
                courseMapping.setCourseCode(courseId);
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
