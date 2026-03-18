package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.FacultyDto;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.FacultyMapper;
import com.capstone.University.Time.Table.manager.Repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FacultyService {
    private final FacultyMapper facultyMapper;
    private final FacultyRepository facultyRepository;

    @Autowired
    public FacultyService(FacultyMapper facultyMapper, FacultyRepository facultyRepository) {
        this.facultyMapper = facultyMapper;
        this.facultyRepository = facultyRepository;

    }

//    @Autowired
//    private FacultyMapper facultyMapper;
//
//    @Autowired
//    private FacultyRepository facultyRepository;

    // ------------------------------------ All Faculty Get Requests Service
    // ------------------------------------------
    public List<FacultyDto> getAllFaculties() {
        return facultyRepository.findAll()
                .stream()
                .map(facultyMapper::toDto)
                .toList();
    }

    public FacultyDto getFacultyByUID(String facultyUID) {
        Faculty faculty = facultyRepository.findByFacultyUID(facultyUID);
        if (faculty == null) {
            throw new ResourceNotFoundException("Faculty not found with UID '" + facultyUID + "'");
        }
        return facultyMapper.toDto(faculty);
    }

    public FacultyDto getFacultyByFacultyName(String facultyName) {
        Faculty faculty = facultyRepository.findByFacultyName(facultyName);
        if (faculty == null) {
            throw new ResourceNotFoundException("Faculty not found with name '" + facultyName + "'");
        }
        return facultyMapper.toDto(faculty);
    }

    // ------------------------------------ All Faculty Post Requests Service
    // -----------------------------------------
    public FacultyDto createFaculty(Faculty faculty) {
        Faculty exists = facultyRepository.findByFacultyUID(faculty.getFacultyUID());
        if (exists != null) {
            throw new DuplicateResourceException("Faculty with UID '" + faculty.getFacultyUID()
                    + "' already exists. Please use a unique faculty UID.");
        }
        facultyRepository.save(faculty);
        return facultyMapper.toDto(faculty);
    }

    // ----------------------------------- All Faculty Put Requests Service
    // -------------------------------------------
    public FacultyDto updateFacultyByUID(String facultyUID, Faculty faculty) {
        Faculty exists = facultyRepository.findByFacultyUID(facultyUID);
        if (exists == null) {
            throw new ResourceNotFoundException("Cannot update: Faculty not found with UID '" + facultyUID + "'");
        }

        Faculty updatedFaculty = new Faculty();
        updatedFaculty.setFacultyUID(faculty.getFacultyUID());
        updatedFaculty.setFacultyName(faculty.getFacultyName());
        updatedFaculty.setFacultyDomain(faculty.getFacultyDomain());

        facultyRepository.save(updatedFaculty);
        return facultyMapper.toDto(updatedFaculty);
    }

    // ----------------------------------- All Faculty Delete Requests Service
    // --------------------------------------
    public void deleteFacultyByUID(String facultyUID) {
        Faculty exists = facultyRepository.findByFacultyUID(facultyUID);
        if (exists == null) {
            throw new ResourceNotFoundException("Cannot delete: Faculty not found with UID '" + facultyUID + "'");
        }
        facultyRepository.delete(exists);
    }

    public void deleteAllFaculties() {
        facultyRepository.deleteAll();
    }
}
