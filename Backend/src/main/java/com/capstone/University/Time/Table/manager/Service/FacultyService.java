package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.FacultyDto;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Mapper.FacultyMapper;
import com.capstone.University.Time.Table.manager.Repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FacultyService {
    @Autowired
    private FacultyMapper facultyMapper;

    @Autowired
    private FacultyRepository facultyRepository;

//------------------------------------ All Faculty Get Requests Service ------------------------------------------
    public List<FacultyDto> getAllFaculties() {
        return facultyRepository.findAll()
                .stream()
                .map(facultyMapper::toDto)
                .toList();
    }

    public FacultyDto getFacultyByUID(String facultyUID) {
        Faculty faculty = facultyRepository.findByFacultyUID(facultyUID);
        if(faculty != null){
            return facultyMapper.toDto(faculty);
        }
        return null;
    }

    public FacultyDto getFacultyByFacultyName(String facultyName) {
        Faculty faculty = facultyRepository.findByFacultyName(facultyName);
        if(faculty != null){
            return facultyMapper.toDto(faculty);
        }

        return null;
    }

//------------------------------------ All Faculty Post Requests Service -----------------------------------------
    public FacultyDto createFaculty(Faculty faculty) {
        Faculty exists = facultyRepository.findByFacultyUID(faculty.getFacultyUID());
        if(exists == null) {
            facultyRepository.save(faculty);
            return facultyMapper.toDto(faculty);
        }
        return null;
    }

//----------------------------------- All Faculty Put Requests Service -------------------------------------------
    public FacultyDto updateFacultyByUID(String facultyUID) {
        Faculty exists = facultyRepository.findByFacultyUID(facultyUID);
        Faculty updatedFaculty = new Faculty();
        if(exists != null) {
            updatedFaculty.setFacultyUID(exists.getFacultyUID());
            updatedFaculty.setFacultyName(exists.getFacultyName());
            updatedFaculty.setFacultyDomain(exists.getFacultyDomain());

            facultyRepository.save(updatedFaculty);
            return facultyMapper.toDto(updatedFaculty);
        }

        return null;
    }

//----------------------------------- All Faculty Delete Requests Service --------------------------------------
    public void deleteFacultyByUID(String facultyUID) {
        Faculty exists = facultyRepository.findByFacultyUID(facultyUID);
        if(exists != null) {
            facultyRepository.delete(exists);
        }
    }
    
    public void deleteAllFaculties(){
        facultyRepository.deleteAll();
    }
}
