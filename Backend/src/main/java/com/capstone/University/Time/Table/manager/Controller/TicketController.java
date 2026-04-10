package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.TicketDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ticket")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/generate")
    public ResponseEntity<List<TicketDto>> generateAllTickets(
            @RequestBody List<CourseMapping> courseMappings
    ) {
        return ResponseEntity.ok(ticketService.generateTicket(courseMappings));
    }

    @GetMapping("/get/{sectionId}")
    public ResponseEntity<List<TicketDto>> getAllTicketsBySectionId(@PathVariable String sectionId) {
        return ResponseEntity.ok(ticketService.getAllTicketsBySectionId(sectionId));
    }

    @GetMapping("/get/{facultyUid}")
    public ResponseEntity<List<TicketDto>> getAllTicketsByFacultyUid(@PathVariable String facultyUid) {
        return ResponseEntity.ok(ticketService.getAllTicketsByFacultyUid(facultyUid));
    }

    @GetMapping("/get/{courseCode}")
    public ResponseEntity<List<TicketDto>> getAllTicketsByCourseCode(@PathVariable String courseCode) {
        return ResponseEntity.ok(ticketService.getAllTicketsByCourseCode(courseCode));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<TicketDto>> getAllTickets(){
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/get-all-bysection/{sectionId}")
    public ResponseEntity<List<TicketDto>> getAlreadySetByFacultyUid(@PathVariable String sectionId) {
        return ResponseEntity.ok(ticketService.getAlreadySetTicketsBySectionId(sectionId));
    }

    @GetMapping("/get-all-bycourse/{courseCode}")
    public ResponseEntity<List<TicketDto>> getAlreadySetByCourseCode(@PathVariable String courseCode) {
        return ResponseEntity.ok(ticketService.getAlreadySetTicketsByCourseCode(courseCode));
    }

    @GetMapping("/get-all-byfaculty/{facultyUid}")
    public ResponseEntity<List<TicketDto>> getAlreadySetTicketsByFacultyUid(@PathVariable String facultyUid) {
        return ResponseEntity.ok(ticketService.getAlreadySetTicketsByFacultyUID(facultyUid));
    }

    /**
     * PATCH /ticket/{ticketId}/schedule
     * Body: { "day": "Mon", "time": "09:00" }
     * Stores the day + time slot chosen by drag-and-drop.
     */
    @PatchMapping("/{ticketId}/schedule")
    public ResponseEntity<TicketDto> scheduleTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> body
    ) {
        String day  = body.get("day");
        String time = body.get("time");
        TicketDto updated = ticketService.scheduleTicket(ticketId, day, time);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete-all-tickets")
    public void deleteTicket(){
        ticketService.deleteAllTickets();
    }
}
