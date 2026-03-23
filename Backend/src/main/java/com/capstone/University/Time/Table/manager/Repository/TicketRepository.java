package com.capstone.University.Time.Table.manager.Repository;

import com.capstone.University.Time.Table.manager.Entity.Ticket;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    @Query("SELECT t FROM Ticket t WHERE t.Section = :sectionId")
    List<Ticket> findBySection(@Param("sectionId") String sectionId);

    @Modifying
    @Transactional
    @Query(value = "TRUNCATE TABLE ticket", nativeQuery = true)
    void truncateTable();
}
