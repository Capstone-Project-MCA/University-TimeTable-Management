package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, String> {
    public Faculty findByFacultyUID(String facultyId);
    public Faculty findByFacultyName(String facultyName);
}
