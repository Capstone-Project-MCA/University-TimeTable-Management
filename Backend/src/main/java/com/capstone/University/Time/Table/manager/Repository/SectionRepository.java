package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SectionRepository extends JpaRepository<Section, String> {
    @Query("SELECT s FROM Section s WHERE s.SectionId = :sectionId")
    public Section findBySectionId(@Param("sectionId") String sectionId);
}
