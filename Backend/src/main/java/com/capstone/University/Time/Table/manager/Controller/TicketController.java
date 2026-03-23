package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.TicketDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/ticket")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/generate")
    public ResponseEntity<List<TicketDto>> generateTickets(
            @RequestBody List<CourseMapping> courseMappings
    ) {
        return ResponseEntity.ok(ticketService.generateTicket(courseMappings));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<TicketDto>> getAllTickets(){
        return ResponseEntity.ok(ticketService.getAllTickers());
    }

    @PostMapping("/generate-all")
    public ResponseEntity<List<TicketDto>> generateAllTickets() {
        return ResponseEntity.ok(ticketService.generateAllTickets());
    }
}
